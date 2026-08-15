---
name: vision-review
description: "免费读图与视觉检查。当用户要分析、识别、检查或描述图片/截图，检查界面或布局的视觉问题（文字重叠、溢出、错位），检测水印/Logo，或把图片内容转成文字时使用。基于智谱 GLM-4V-Flash（免费，可选 SiliconFlow Qwen3-VL / Google Gemini 备用）；key 取自环境变量或 ~/.dsh/secrets/media-tools.env，永不写进 skill。"
---

# Vision Review（读图 / 视觉检查）

免费读图，主引擎智谱 GLM-4V-Flash，可选 SiliconFlow Qwen3-VL、Google Gemini 备用。Key 永不写进本 skill。

## 用法

```bash
python3 scripts/vision.py <图片路径...> [--prompt="..."] [--provider=NAME] [--structured] [--doctor]
```

- 可一次传多张图；每张自动压成 JPEG 再发送，边长随批内张数自适应（1-2 张 1024px，3-4 张 768px，5 张 512px）。超过 5 张自动分批（GLM 单请求上限 5 张），自然语言模式按「【图片 X-Y】」标注批次，结构化模式输出 `results` 数组。
- `max_tokens` 固定为 1024（模型上限），prompt 请保持聚焦。
- 默认 prompt 检查渲染完整性、文字重叠/溢出/错位、配色层次、水印和视觉 bug。
- 指定具体任务时，用 `--prompt="..."` 写清楚指令。
- `--structured`：输出 modlens 同款结构化证据 JSON（summary / ocr.full_text / layout 阅读顺序区块 / semantics 实体与关系 / visual / uncertainty），供程序化消费。
- 故障转移链：主引擎智谱 GLM-4V-Flash → 配好 `SILICONFLOW_API_KEY` 时自动加入 SiliconFlow Qwen3-VL（`SILICONFLOW_VISION_MODEL` 可换模型，默认 `Qwen/Qwen3-VL-8B-Instruct`，国内直连）→ 配好 `GEMINI_API_KEY` 时自动加入 Google Gemini（`GEMINI_MODEL` 可换模型，默认 gemini-3.6-flash）→ `VISION_FALLBACKS` 环境变量里配置的任意 OpenAI 兼容引擎（JSON 数组，每项 `name/baseUrl/apiKeyEnv/model`，`maxTokens`/`jsonObject` 可选）。每次回退都会打到 stderr，绝不无声失败。
- `--provider=NAME` 钉死单个引擎（`zhipu-glm`/`siliconflow-qwen`/`gemini`/自定义名），不回退；`--doctor` 体检（Pillow、key、每个引擎一次近零成本的连通性实测），引擎异常时先跑它。

## Key

- `GLM_API_KEY`（智谱，免费视觉模型 `glm-4v-flash`）。**获取**：注册/登录 [open.bigmodel.cn](https://open.bigmodel.cn) → 「API Keys」→ 新建并复制（`glm-4v-flash` 免费，无需付费）。
- `SILICONFLOW_API_KEY`（硅基流动，免费额度，可选）。**和 `media-tools` 生图同一个 key**，无需新申请；配好后自动加入回退链。
- `GEMINI_API_KEY`（Google，免费，可选）。**获取**：[aistudio.google.com](https://aistudio.google.com) → 「Get API key」（约三分钟，无需信用卡）；配好后自动加入回退链。注意：Google 域名在本机网络可能不可直连，需要代理才可用。
- 优先读环境变量；否则依次读 `~/.dsh/secrets/media-tools.env`、`~/.codex/secrets/media-tools.env`（每行 `KEY=value`，权限 600）。
- 永远不要把 key 提交到仓库、写进 skill 或粘贴到公开文件。

## 隐私

- 只发送用户愿意分享给服务商 API 的图片。
- 未经授权，不要把图片内容、截图或转写写进公开仓库。
- 不要在公开产物中复述图片里的个人信息（人脸、电话、证件号）。
