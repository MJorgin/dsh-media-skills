---
name: media-tools
description: "免费生成图片。当用户要生成图片、插画、头像、背景、banner 等（包括付费图片额度不可用时）使用。优先 SenseNova U1 Fast，其次 SiliconFlow Kolors；key 取自环境变量、~/.dsh/.credentials.yaml 或 ~/.dsh/secrets/media-tools.env，永不写进 skill。"
---

# Media Tools（免费生图）

免费生图，优先使用 SenseNova U1 Fast，其次使用 SiliconFlow Kolors。Key 永不写进本 skill。

## 生成图片

```bash
python3 scripts/generate.py "<提示词>" <输出路径.png> [尺寸=1024x1024]
```

- 如果配置了 `SENSENOVA_API_KEY`，自动使用 SenseNova U1 Fast（支持 11 档 2K 尺寸，脚本会自动把常见尺寸映射到最近比例）。
- 如果没配 SenseNova、但有 `SILICONFLOW_API_KEY`，则使用 SiliconFlow Kolors。
- 两个 key 都没配时会提示缺少 Key。

## Key

- `SENSENOVA_API_KEY`（商汤日日新，优先）。**获取**：注册/登录 [platform.sensenova.cn](https://platform.sensenova.cn) → 管理中心 → API-Key 管理 → 创建 API-Key。
- `SILICONFLOW_API_KEY`（SiliconFlow，备用）。**获取**：注册/登录 [siliconflow.cn](https://siliconflow.cn) → 「API 密钥」→ 新建并复制（Kolors 免费）。
- 优先读环境变量；否则依次读 `~/.dsh/secrets/media-tools.env`、`~/.codex/secrets/media-tools.env`（每行 `KEY=value`，权限 600）。
- 永远不要把 key 提交到仓库、写进 skill 或粘贴到公开文件。

## 隐私

- 生成素材只写到请求的输出路径，绝不自动同步到公开目录。
- 未经许可，不要在生成结果里复现敏感参考图或个人信息。
