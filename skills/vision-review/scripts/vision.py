#!/usr/bin/env python3
"""Free image review via a failover chain of vision engines.

Engines (tried in order):
1. Zhipu GLM-4V-Flash (free) — primary.
2. Google Gemini (free key) — auto-joins the chain when GEMINI_API_KEY is set;
   the OpenAI-compatible Gemini endpoint carries the same code path.
3. VISION_FALLBACKS — any extra OpenAI-compatible multimodal endpoints (JSON).

`--structured` mirrors the ModLens evidence contract: a JSON object with
summary / ocr.full_text / layout regions in reading order / semantics
(entities + relations) / visual / uncertainty. `--doctor` runs a health check.

Example:

    python3 scripts/vision.py image.png --structured
"""
import base64, io, json, os, sys, urllib.request
from pathlib import Path

SECRET_FILES = (
    Path.home() / ".dsh/secrets/media-tools.env",
    Path.home() / ".codex/secrets/media-tools.env",
)

# 主引擎：智谱 GLM-4V-Flash（免费）。
PRIMARY = {
    "name": "zhipu-glm",
    "baseUrl": "https://open.bigmodel.cn/api/paas/v4",
    "apiKeyEnv": "GLM_API_KEY",
    "model": "glm-4v-flash",
    "maxTokens": 1024,
    "jsonObject": True,   # 智谱端点支持 response_format=json_object
}

# 备用引擎：Google Gemini（免费 key，AI Studio 领取），走 OpenAI 兼容端点。
def gemini_engine():
    return {
        "name": "gemini",
        "baseUrl": "https://generativelanguage.googleapis.com/v1beta/openai",
        "apiKeyEnv": "GEMINI_API_KEY",
        "model": os.environ.get("GEMINI_MODEL", "gemini-3.6-flash"),
        "maxTokens": 1024,
        "jsonObject": True,
    }

def load_key(name):
    v = os.environ.get(name)
    if v:
        return v.strip()
    for env in SECRET_FILES:
        if env.exists():
            for line in env.read_text().splitlines():
                if line.startswith(name + "="):
                    return line.split("=", 1)[1].strip()
    return None

def load_fallbacks():
    raw = os.environ.get("VISION_FALLBACKS", "").strip()
    if not raw:
        return []
    try:
        items = json.loads(raw)
    except Exception as e:
        sys.exit(f"VISION_FALLBACKS 解析失败：{e}")
    out = []
    for it in items:
        if not isinstance(it, dict) or not it.get("baseUrl") or not it.get("model"):
            sys.exit("VISION_FALLBACKS 每项需要 baseUrl 和 model 字段")
        out.append({
            "name": str(it.get("name", "fallback")),
            "baseUrl": str(it["baseUrl"]).rstrip("/"),
            "apiKeyEnv": str(it.get("apiKeyEnv", "OPENAI_API_KEY")),
            "model": str(it["model"]),
            "maxTokens": int(it.get("maxTokens", 1024)),
            "jsonObject": bool(it.get("jsonObject", False)),
        })
    return out

def engines():
    """Active failover chain: only engines with a usable key join."""
    chain = [PRIMARY]
    if load_key("GEMINI_API_KEY"):
        chain.append(gemini_engine())
    chain.extend(load_fallbacks())
    return chain

def available_engines():
    """Every candidate engine, configured or not (for listing, pinning, doctor)."""
    chain = [PRIMARY, gemini_engine()]
    chain.extend(load_fallbacks())
    return chain

def b64_jpeg(path, max_side=1024, quality=85):
    from PIL import Image
    im = Image.open(path)
    if max(im.size) > max_side:
        im.thumbnail((max_side, max_side))
    buf = io.BytesIO()
    im.convert("RGB").save(buf, "JPEG", quality=quality)
    return base64.b64encode(buf.getvalue()).decode()

DEFAULT_PROMPT = ("请简短检查这些截图/图片：内容是否完整渲染、有无文字重叠/错位/溢出、"
                  "配色层次是否协调、有无水印或明显视觉 bug。用中文分条列出，标注图片编号；没有问题的方面直接说正常。")

# ModLens v2 证据契约（复刻其形状：summary/ocr/layout/semantics/visual/uncertainty）。
STRUCTURED_PROMPT = """请分析图片并**只输出一个 JSON 对象**（不要输出 JSON 以外的任何文字、不要代码围栏），JSON 必须包含以下键：
- "summary": 一两句话概括图片内容；
- "ocr": {"full_text": 完整转写图中所有文字（无文字则为 ""）, "lines": [{"text": 一行文字, "language": 可选语言代码}]}；
- "layout": {"regions": [{"type": 简短区块类别（title/paragraph/list/table/chart/form/code/image/icon/link/nav 等）, "reading_order": 从 1 开始的阅读顺序, "text": 该区块的内容}]}；
- "semantics": {"scene": 场景描述, "intent": 可选意图, "entities": [{"name": 实体名, "type": 类别, "evidence": 可选依据}], "relations": [{"subject": 主体, "predicate": 关系, "object": 客体}]}；
- "visual": {"dominant_colors": [主色], "style": 风格, "notes": [视觉备注]}；
- "uncertainty": [所有不确定项；不确定就写进这里，不要编造]。
内容语言跟随图片语言。"""

def call_engine(eng, b64_images, prompt, structured=False):
    """One OpenAI-compatible chat/completions call; raises on any failure."""
    key = load_key(eng["apiKeyEnv"])
    if not key:
        raise RuntimeError(f"缺少 {eng['apiKeyEnv']}（环境变量或 ~/.dsh/secrets/media-tools.env）")
    parts = [{"type": "image_url", "image_url": {"url": "data:image/jpeg;base64," + b}} for b in b64_images]
    parts.append({"type": "text", "text": prompt})
    body = {"model": eng["model"], "messages": [{"role": "user", "content": parts}],
            "max_tokens": eng["maxTokens"]}
    if structured and eng.get("jsonObject"):
        body["response_format"] = {"type": "json_object"}
    req = urllib.request.Request(eng["baseUrl"] + "/chat/completions",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "Authorization": "Bearer " + key}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=300) as r:
            return json.load(r)["choices"][0]["message"]["content"]
    except urllib.error.HTTPError as e:
        # 端点不认 response_format（400）时，退回到纯 prompt 约束再试一次。
        if structured and eng.get("jsonObject") and e.code == 400:
            body.pop("response_format", None)
            retry = urllib.request.Request(eng["baseUrl"] + "/chat/completions",
                data=json.dumps(body).encode(),
                headers={"Content-Type": "application/json", "Authorization": "Bearer " + key}, method="POST")
            with urllib.request.urlopen(retry, timeout=300) as r2:
                return json.load(r2)["choices"][0]["message"]["content"]
        raise

def parse_structured(text):
    """Parse and lightly validate the ModLens-shaped contract; raises on failure."""
    t = text.strip()
    if t.startswith("```"):
        t = t.strip("`")
        if t.startswith("json"):
            t = t[4:]
    data = json.loads(t)
    required = ["summary", "ocr", "layout", "semantics", "visual", "uncertainty"]
    for key in required:
        if key not in data or data[key] is None:
            raise ValueError(f"缺少字段 {key}")
    if not isinstance(data["summary"], str) or not isinstance(data["ocr"].get("full_text"), str):
        raise ValueError("summary/ocr.full_text 必须是字符串")
    if not isinstance(data["layout"].get("regions"), list) or not isinstance(data["uncertainty"], list):
        raise ValueError("layout.regions/uncertainty 必须是数组")
    return data

def ping_engine(eng):
    """Doctor probe: one tiny text-only call — validates key + endpoint, near-zero cost."""
    key = load_key(eng["apiKeyEnv"])
    if not key:
        return f"缺少 {eng['apiKeyEnv']}"
    body = {"model": eng["model"], "messages": [{"role": "user", "content": "ping"}],
            "max_tokens": 8}
    req = urllib.request.Request(eng["baseUrl"] + "/chat/completions",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "Authorization": "Bearer " + key}, method="POST")
    with urllib.request.urlopen(req, timeout=60) as r:
        data = json.load(r)
        if not data.get("choices"):
            return "无响应内容"
        return "ok"

def doctor():
    print("[doctor] python " + sys.version.split()[0])
    try:
        from PIL import Image  # noqa: F401
        print("[doctor] Pillow: ok")
    except Exception as e:
        print(f"[doctor] Pillow: 缺失（{e}）—— 安装: pip3 install Pillow")
    print("[doctor] 引擎链（按尝试顺序，未配 key 的引擎不会加入回退）:")
    all_ok = True
    for eng in available_engines():
        name = eng["name"]
        if not load_key(eng["apiKeyEnv"]) and name == "gemini":
            print(f"  [--] {name}: {eng['model']} @ {eng['baseUrl']} → 缺少 {eng['apiKeyEnv']}"
                  f"（免费领取：https://aistudio.google.com，配好后自动加入回退链）")
            continue
        try:
            status = ping_engine(eng)
        except Exception as e:
            status = f"不可用：{e}"
        ok = status == "ok"
        all_ok = all_ok and ok
        print(f"  [{'ok' if ok else '!!'}] {name}: {eng['model']} @ {eng['baseUrl']} → {status}")
    if all_ok:
        print("[doctor] 全部引擎可用")
    else:
        print("[doctor] 至少一个引擎不可用（主引擎不可用时按顺序回退）")

def main():
    args = sys.argv[1:]
    if "--doctor" in args or "--check" in args:
        doctor()
        return
    structured = "--structured" in args
    args = [a for a in args if a != "--structured"]
    prompt = STRUCTURED_PROMPT if structured else DEFAULT_PROMPT
    pinned = None
    paths = []
    for a in args:
        if a.startswith("--prompt="):
            prompt = a[len("--prompt="):]
        elif a.startswith("--provider="):
            pinned = a[len("--provider="):]
        else:
            paths.append(a)
    if not paths:
        sys.exit("用法: vision.py <图片...> [--prompt=...] [--provider=NAME] [--structured] [--doctor]")
    images = [b64_jpeg(p) for p in paths]
    chain = engines()
    if pinned:
        candidates = {e["name"]: e for e in available_engines()}
        if pinned not in candidates:
            sys.exit(f"未知引擎 {pinned}；可用：{', '.join(e['name'] for e in available_engines())}")
        chain = [candidates[pinned]]
    attempts = []
    for eng in chain:
        print(f"[vision] engine: {eng['name']}", file=sys.stderr)
        try:
            text = call_engine(eng, images, prompt, structured=structured)
            if structured:
                result = parse_structured(text)
                attempts.append({"engine": eng["name"], "model": eng["model"], "ok": True})
                print(json.dumps({
                    "image": paths[0] if len(paths) == 1 else paths,
                    "engine": eng["name"],
                    "result": result,
                    "meta": {"model": eng["model"], "attempts": attempts},
                }, ensure_ascii=False, indent=2))
            else:
                print(text)
            return
        except Exception as e:
            attempts.append({"engine": eng["name"], "model": eng["model"], "ok": False, "error": str(e)})
            print(f"[vision] {eng['name']} failed: {e}", file=sys.stderr)
    sys.exit(f"所有引擎都失败：{attempts[-1]['error'] if attempts else '无可用引擎'}")

if __name__ == "__main__":
    main()
