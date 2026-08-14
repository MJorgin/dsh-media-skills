---
name: vision-review
description: "免费读图与视觉检查。当用户要分析、识别、检查或描述图片/截图，检查界面或布局的视觉问题（文字重叠、溢出、错位），检测水印/Logo，或把图片内容转成文字时使用。基于智谱 GLM-4V-Flash（免费）；key 取自环境变量或 ~/.dsh/secrets/media-tools.env，永不写进 skill。"
---

# Vision Review（读图 / 视觉检查）

免费读图，基于智谱 GLM-4V-Flash。Key 永不写进本 skill。

## 用法

```bash
python3 scripts/vision.py <图片路径...> [--prompt="..."]
```

- 可一次传多张图；每张自动压到 ≤1024px 的 JPEG 再发送。
- `max_tokens` 固定为 1024（模型上限），prompt 请保持聚焦。
- 默认 prompt 检查渲染完整性、文字重叠/溢出/错位、配色层次、水印和视觉 bug。
- 指定具体任务时，用 `--prompt="..."` 写清楚指令。

## Key

- `GLM_API_KEY`（智谱，免费视觉模型 `glm-4v-flash`）。**获取**：注册/登录 [open.bigmodel.cn](https://open.bigmodel.cn) → 「API Keys」→ 新建并复制（`glm-4v-flash` 免费，无需付费）。
- 优先读环境变量；否则依次读 `~/.dsh/secrets/media-tools.env`、`~/.codex/secrets/media-tools.env`（每行 `KEY=value`，权限 600）。
- 永远不要把 key 提交到仓库、写进 skill 或粘贴到公开文件。

## 隐私

- 只发送用户愿意分享给服务商 API 的图片。
- 未经授权，不要把图片内容、截图或转写写进公开仓库。
- 不要在公开产物中复述图片里的个人信息（人脸、电话、证件号）。
