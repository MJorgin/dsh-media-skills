#!/usr/bin/env python3
"""Generate images via SenseNova U1 Fast or SiliconFlow Kolors.

Provider selection:
1. If SENSENOVA_API_KEY is set, use SenseNova U1 Fast (https://token.sensenova.cn).
2. Otherwise, if SILICONFLOW_API_KEY is set, use SiliconFlow Kolors.
"""
import json, os, sys, urllib.request
from pathlib import Path

SILICONFLOW_URL = "https://api.siliconflow.com/v1/images/generations"
SILICONFLOW_MODEL = "Kwai-Kolors/Kolors"
SENSENOVA_URL = "https://token.sensenova.cn/v1/images/generations"
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

def generate_sensenova(prompt, out, size):
    body = {"model": SENSENOVA_MODEL, "prompt": prompt, "size": sensenova_size(size), "n": 1}
    req = urllib.request.Request(SENSENOVA_URL,
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "Authorization": "Bearer " + load_key("SENSENOVA_API_KEY")}, method="POST")
    with urllib.request.urlopen(req, timeout=300) as r:
        data = json.load(r)
    url = data["data"][0]["url"]
    urllib.request.urlretrieve(url, out)
    print("done:", out)

def generate_siliconflow(prompt, out, size):
    body = {"model": SILICONFLOW_MODEL, "prompt": prompt, "image_size": size, "batch_size": 1}
    req = urllib.request.Request(SILICONFLOW_URL,
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "Authorization": "Bearer " + load_key("SILICONFLOW_API_KEY")}, method="POST")
    with urllib.request.urlopen(req, timeout=300) as r:
        data = json.load(r)
    url = data["images"][0]["url"]
    urllib.request.urlretrieve(url, out)
    print("done:", out)

def main():
    if len(sys.argv) < 3:
        sys.exit("用法: generate.py <prompt> <out.png> [size=1024x1024]")
    prompt, out = sys.argv[1], sys.argv[2]
    size = sys.argv[3] if len(sys.argv) > 3 else "1024x1024"
    if get_key("SENSENOVA_API_KEY"):
        generate_sensenova(prompt, out, size)
    elif get_key("SILICONFLOW_API_KEY"):
        generate_siliconflow(prompt, out, size)
    else:
        sys.exit("缺少图片生成 Key：请配置 SENSENOVA_API_KEY 或 SILICONFLOW_API_KEY（环境变量或 ~/.dsh/secrets/media-tools.env）")

if __name__ == "__main__":
    main()
