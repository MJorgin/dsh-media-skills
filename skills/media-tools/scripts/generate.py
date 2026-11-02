#!/usr/bin/env python3
"""Generate images via SenseNova U1 Fast, SiliconFlow Kolors, or any custom endpoint.

Provider selection:
1. MEDIA_API_URL + MEDIA_API_KEY set  -> that OpenAI-compatible /images/generations endpoint.
2. MEDIA_PROVIDER=sensenova|siliconflow -> that built-in, its own key.
3. Neither set -> SENSENOVA_API_KEY wins, else SILICONFLOW_API_KEY.
MEDIA_MODEL overrides the model id in every case.
"""
import json, os, sys, urllib.error, urllib.request
from pathlib import Path

SILICONFLOW_URL = "https://api.siliconflow.cn/v1/images/generations"
SILICONFLOW_MODEL = "Kwai-Kolors/Kolors"
SENSENOVA_URL = "https://token.sensenova.ai/v1/images/generations"
SENSENOVA_MODEL = "sensenova-u1-fast"

# SenseNova U1 Fast supported sizes (WxH -> aspect ratio).
SENSENOVA_SIZES = {
    "1344x3136": (9, 21),
    "1536x2752": (9, 16),
    "1664x2496": (2, 3),
    "1760x2368": (3, 4),
    "1824x2272": (4, 5),
    "2048x2048": (1, 1),
    "2272x1824": (5, 4),
    "2368x1760": (4, 3),
    "2496x1664": (3, 2),
    "2752x1536": (16, 9),
    "3072x1376": (21, 9),
}

def get_key(name):
    v = os.environ.get(name)
    if v:
        return v.strip()
    for env in (Path.home() / ".dsh/secrets/media-tools.env",
                Path.home() / ".codex/secrets/media-tools.env"):
        if env.exists():
            for line in env.read_text().splitlines():
                if line.startswith(name + "="):
                    return line.split("=", 1)[1].strip()
    return None

def load_key(name):
    key = get_key(name)
    if not key:
        sys.exit(f"缺少 {name}：请设置环境变量，或在 ~/.dsh/secrets/media-tools.env 中配置（每行 KEY=value）")
    return key

def sensenova_size(size):
    """Map a user-supplied size to one of SenseNova's supported sizes."""
    size = (size or "2048x2048").strip().lower()
    if size in SENSENOVA_SIZES:
        return size
    # ratio shorthand like 1:1 or 16:9
    if ":" in size:
        try:
            wr, hr = map(int, size.split(":"))
            for cand, (cw, ch) in SENSENOVA_SIZES.items():
                if cw == wr and ch == hr:
                    return cand
        except ValueError:
            pass
    # WxH: pick nearest by aspect ratio
    try:
        w, h = map(int, size.split("x"))
        target = w / h
        best = min(SENSENOVA_SIZES.items(), key=lambda kv: abs((kv[1][0] / kv[1][1]) - target))
        return best[0]
    except (ValueError, ZeroDivisionError):
        return "2048x2048"

def generate_sensenova(prompt, out, size, model=None):
    body = {"model": model or SENSENOVA_MODEL, "prompt": prompt, "size": sensenova_size(size), "n": 1}
    req = urllib.request.Request(SENSENOVA_URL,
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "Authorization": "Bearer " + load_key("SENSENOVA_API_KEY")}, method="POST")
    with urllib.request.urlopen(req, timeout=300) as r:
        data = json.load(r)
    url = data["data"][0]["url"]
    urllib.request.urlretrieve(url, out)
    print("done:", out)

def generate_siliconflow(prompt, out, size, model=None):
    body = {"model": model or SILICONFLOW_MODEL, "prompt": prompt, "batch_size": 1}
    if size:
        body["image_size"] = size
    req = urllib.request.Request(SILICONFLOW_URL,
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "Authorization": "Bearer " + load_key("SILICONFLOW_API_KEY")}, method="POST")
    with urllib.request.urlopen(req, timeout=300) as r:
        data = json.load(r)
    url = data["images"][0]["url"]
    urllib.request.urlretrieve(url, out)
    print("done:", out)

def ratio_to_size(size):
    """Turn `16:9` shorthand into a WxH string; pass WxH through untouched."""
    size = (size or "1024x1024").strip().lower()
    if ":" not in size:
        return size
    try:
        wr, hr = map(int, size.split(":"))
    except ValueError:
        return "1024x1024"
    long_side = 1024
    if wr >= hr:
        return f"{long_side}x{max(64, round(long_side * hr / wr))}"
    return f"{max(64, round(long_side * wr / hr))}x{long_side}"

def pick_image_url(payload):
    """Accept the shapes OpenAI-compatible image endpoints return."""
    # Cloudflare Workers AI answers {"result": {"image": "<base64>"}}.
    result = payload.get("result") if isinstance(payload, dict) else None
    if isinstance(result, dict) and isinstance(result.get("image"), str):
        return "data:image/jpeg;base64," + result["image"]
    for container in ("data", "images", "output"):
        items = payload.get(container) if isinstance(payload, dict) else None
        if isinstance(items, list) and items and isinstance(items[0], dict):
            first = items[0]
            if first.get("url"):
                return first["url"]
            if first.get("b64_json"):
                return "data:image/png;base64," + first["b64_json"]
    raise SystemExit("接口没有返回图片地址：" + json.dumps(payload, ensure_ascii=False)[:300])

def pollinations_params(size):
    """Pollinations caps the free tier at 768x768 of area; scale down instead of taking a 402."""
    width, height = (int(n) for n in (ratio_to_size(size) or "768x768").split("x"))
    ceiling = 768 * 768
    if width * height > ceiling:
        scale = (ceiling / (width * height)) ** 0.5
        width, height = max(64, int(width * scale)), max(64, int(height * scale))
    return width, height

def generate_pollinations(prompt, out, size, base):
    """Pollinations serves one JPEG per GET, no key; one image per IP every 45 seconds."""
    import random
    from urllib.parse import quote
    width, height = pollinations_params(size)
    seed = random.randint(1, 10**6)
    target = f"{base.rstrip('/')}/{quote(prompt)}?width={width}&height={height}&nologo=true&seed={seed}"
    req = urllib.request.Request(target, headers={"User-Agent": "dsh-media-skills"})
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            Path(out).write_bytes(r.read())
    except urllib.error.HTTPError as error:
        if error.code == 402:
            sys.exit("Pollinations 排队中：同一个 IP 每 45 秒只能出一张，等一会儿再试。")
        raise SystemExit(f"Pollinations 返回 {error.code}：{error.reason}")
    print("done:", out)

def generate_custom(prompt, out, size):
    """Any OpenAI-compatible /images/generations endpoint the panel configured."""
    url = os.environ.get("MEDIA_API_URL", "").strip()
    key = os.environ.get("MEDIA_API_KEY", "").strip()
    model = os.environ.get("MEDIA_MODEL", "").strip()
    if not url:
        sys.exit("自定义提供方缺少地址，请在面板的「生图 Key」里补上。")
    if "image.pollinations.ai" in url:
        generate_pollinations(prompt, out, size, url)
        return
    if "api.cloudflare.com" in url or "/ai/run/" in url:
        # Workers AI takes its own shape: no model field (it is in the URL), no size.
        body = {"prompt": prompt, "steps": 4}
    else:
        body = {"model": model, "prompt": prompt, "size": ratio_to_size(size), "n": 1}
    headers = {"Content-Type": "application/json"}
    if key:
        headers["Authorization"] = "Bearer " + key
    req = urllib.request.Request(url,
        data=json.dumps(body).encode(),
        headers=headers, method="POST")
    with urllib.request.urlopen(req, timeout=300) as r:
        data = json.load(r)
    target = pick_image_url(data)
    if target.startswith("data:"):
        import base64
        Path(out).write_bytes(base64.b64decode(target.split(",", 1)[1]))
    else:
        urllib.request.urlretrieve(target, out)
    print("done:", out)

def main():
    if len(sys.argv) < 3:
        sys.exit("用法: generate.py <prompt> <out.png> [size=1024x1024]")
    prompt, out = sys.argv[1], sys.argv[2]
    size = sys.argv[3] if len(sys.argv) > 3 else "1024x1024"
    provider = os.environ.get("MEDIA_PROVIDER", "").strip()
    model = os.environ.get("MEDIA_MODEL", "").strip() or None

    if os.environ.get("MEDIA_API_URL"):
        generate_custom(prompt, out, size)
    elif provider == "siliconflow":
        generate_siliconflow(prompt, out, size, model)
    elif provider == "sensenova":
        generate_sensenova(prompt, out, size, model)
    elif get_key("SENSENOVA_API_KEY"):
        generate_sensenova(prompt, out, size, model)
    elif get_key("SILICONFLOW_API_KEY"):
        generate_siliconflow(prompt, out, size, model)
    else:
        sys.exit("缺少图片生成 Key：请配置 SENSENOVA_API_KEY 或 SILICONFLOW_API_KEY（环境变量或 ~/.dsh/secrets/media-tools.env）")

if __name__ == "__main__":
    main()
