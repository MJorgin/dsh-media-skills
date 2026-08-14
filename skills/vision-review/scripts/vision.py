#!/usr/bin/env python3
"""Free image review via Zhipu GLM-4V-Flash."""
import base64, io, json, os, sys, urllib.request
from pathlib import Path

def load_key(name):
    v = os.environ.get(name)
    if v:
        return v
    for env in (Path.home() / ".dsh/secrets/media-tools.env",
                Path.home() / ".codex/secrets/media-tools.env"):
        if env.exists():
            for line in env.read_text().splitlines():
                if line.startswith(name + "="):
                    return line.split("=", 1)[1].strip()
    sys.exit(f"缺少 {name}：请设置环境变量，或在 ~/.dsh/secrets/media-tools.env 中配置（每行 KEY=value）")

def b64_jpeg(path, max_side=1024, quality=85):
    from PIL import Image
    im = Image.open(path)
    if max(im.size) > max_side:
        im.thumbnail((max_side, max_side))
    buf = io.BytesIO()
    im.convert("RGB").save(buf, "JPEG", quality=quality)
    return base64.b64encode(buf.getvalue()).decode()

def main():
    args = sys.argv[1:]
    prompt = ("请简短检查这些截图/图片：内容是否完整渲染、有无文字重叠/错位/溢出、"
              "配色层次是否协调、有无水印或明显视觉 bug。用中文分条列出，标注图片编号；没有问题的方面直接说正常。")
    paths = []
    for a in args:
        if a.startswith("--prompt="):
            prompt = a[len("--prompt="):]
        else:
            paths.append(a)
    if not paths:
        sys.exit("用法: vision.py <图片...> [--prompt=...]")
    parts = [{"type": "image_url", "image_url": {"url": "data:image/jpeg;base64," + b64_jpeg(p)}} for p in paths]
    parts.append({"type": "text", "text": prompt})
    body = {"model": "glm-4v-flash", "messages": [{"role": "user", "content": parts}], "max_tokens": 1024}
    req = urllib.request.Request("https://open.bigmodel.cn/api/paas/v4/chat/completions",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "Authorization": "Bearer " + load_key("GLM_API_KEY")}, method="POST")
    with urllib.request.urlopen(req, timeout=300) as r:
        print(json.load(r)["choices"][0]["message"]["content"])

if __name__ == "__main__":
    main()
