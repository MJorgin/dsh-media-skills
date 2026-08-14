---
name: media-tools
description: "免费生成图片。当用户要生成图片、插画、头像、背景、banner 等（包括付费图片额度不可用时）使用。基于 SiliconFlow Kolors（免费、无水印）；key 取自环境变量或 ~/.dsh/secrets/media-tools.env，永不写进 skill。"
---

# Media Tools（免费生图）

免费生图，基于 SiliconFlow Kolors。Key 永不写进本 skill。

## 生成图片

```bash
python3 scripts/generate.py "<提示词>" <输出路径.png> [尺寸=1024x1024]
```

- 免费、无水印，约 2 张/分钟的限速。
- 若某个 model id 返回 "Model disabled"，用同一 key `GET https://api.siliconflow.cn/v1/models` 列出可用模型。

## Key

- `SILICONFLOW_API_KEY`（SiliconFlow，免费模型 `Kwai-Kolors/Kolors`）。
- 优先读环境变量；否则依次读 `~/.dsh/secrets/media-tools.env`、`~/.codex/secrets/media-tools.env`（每行 `KEY=value`，权限 600）。
- 永远不要把 key 提交到仓库、写进 skill 或粘贴到公开文件。

## 隐私

- 生成素材只写到请求的输出路径，绝不自动同步到公开目录。
- 未经许可，不要在生成结果里复现敏感参考图或个人信息。
