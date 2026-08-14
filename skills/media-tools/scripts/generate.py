#!/usr/bin/env python3
"""Free image generation via SiliconFlow Kolors."""
import json, os, sys, urllib.request
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

def main():
    if len(sys.argv) < 3:
        sys.exit("用法: generate.py <prompt> <out.png> [size=1024x1024]")
    prompt, out = sys.argv[1], sys.argv[2]
    size = sys.argv[3] if len(sys.argv) > 3 else "1024x1024"
    body = {"model": "Kwai-Kolors/Kolors", "prompt": prompt, "image_size": size, "batch_size": 1}
    req = urllib.request.Request("https://api.siliconflow.cn/v1/images/generations",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "Authorization": "Bearer " + load_key("SILICONFLOW_API_KEY")}, method="POST")
    with urllib.request.urlopen(req, timeout=300) as r:
        data = json.load(r)
    url = data["images"][0]["url"]
    urllib.request.urlretrieve(url, out)
    print("done:", out)

if __name__ == "__main__":
    main()
