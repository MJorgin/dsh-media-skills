---
name: vision-review
description: "图像理解、OCR 与截图视觉 QA。用户要求分析、识别、描述图片或截图，检查 UI 文字重叠、溢出、错位、水印、Logo 或视觉 bug，或输出结构化视觉证据时使用。通过用户自配的智谱 GLM-4V-Flash、可选 DeepSeek、SiliconFlow、SenseNova、Gemini 或 OpenAI 兼容引擎故障转移；密钥只从环境变量、DSH 凭据或本地 secrets 读取。"
---

# Vision Review（读图 / OCR / 视觉检查）

用于显式视觉审查工作流：截图 QA、图片内容描述、OCR、水印/Logo 检测、界面布局问题检查，以及给程序化流程输出结构化证据。DSH v0.1.6 的原生多模态附件可直接对话；本技能适合需要脚本、故障转移链或 JSON 证据时使用。

## 用法

从本技能目录运行：

```bash
python3 scripts/vision.py <图片路径...> [--prompt="..."] [--provider=NAME] [--structured] [--doctor]
```

常用示例：

```bash
python3 scripts/vision.py screenshot.png
python3 scripts/vision.py a.png b.png --structured
python3 scripts/vision.py page.png --provider=siliconflow-qwen
python3 scripts/vision.py page.png --prompt="检查标题、按钮和图表是否重叠，并指出位置"
python3 scripts/vision.py --doctor
```

## 行为

- 可一次传多张图；每张图会压缩成 JPEG，边长随批内张数自适应：1–2 张 1024px，3–4 张 768px，5 张 512px。
- GLM-4V-Flash 单请求最多 5 张图；超过 5 张自动分批。
- 默认 prompt 检查渲染完整性、文字重叠/溢出/错位、配色层次、水印和明显视觉 bug。
- `--structured` 输出结构化 JSON：`summary`、`ocr.full_text`、`layout.regions`、`semantics`、`visual`、`uncertainty`；多批时输出 `results` 数组。
- `--provider=NAME` 固定单个引擎，不做故障转移。可用名包括 `zhipu-glm`、`deepseek`、`siliconflow-qwen`、`sensenova`、`gemini` 和自定义 fallback 名称。
- `--doctor` 检查 Pillow、已配置 key、候选模型和端点连通性。遇到引擎异常时先运行它。

## 引擎链

脚本按以下顺序尝试；可选引擎只有检测到对应 key 时才加入：

1. 智谱 `glm-4v-flash`（主引擎，`GLM_API_KEY`；输出上限 1024）。
2. DeepSeek 视觉模型（`DEEPSEEK_API_KEY`，付费可选；默认 `deepseek-v4-flash-vision-exp`，可用 `DEEPSEEK_VISION_MODEL` 覆盖）。
3. SiliconFlow Qwen3-VL（`SILICONFLOW_API_KEY`；默认 `Qwen/Qwen3-VL-8B-Instruct`，可用 `SILICONFLOW_VISION_MODEL` 覆盖）。
4. SenseNova（`SENSENOVA_API_KEY`；默认 `sensenova-6.8-flash-lite`，可用 `SENSENOVA_VISION_MODEL` 覆盖）。
5. Gemini OpenAI-compatible endpoint（`GEMINI_API_KEY`；默认 `gemini-3.6-flash`，可用 `GEMINI_MODEL` 覆盖）。
6. `VISION_FALLBACKS` 中声明的任意 OpenAI 兼容多模态引擎。

`VISION_FALLBACKS` 是 JSON 数组，每项包含 `name`、`baseUrl`、`model`，可选 `apiKeyEnv`、`maxTokens`、`jsonObject`。

## 密钥来源

按顺序读取：

1. 进程环境变量；
2. `~/.dsh/secrets/media-tools.env`；
3. `~/.codex/secrets/media-tools.env`（历史兼容）；
4. `~/.dsh/.credentials.yaml` 中的顶层 key 或 `refs` 子映射。

Secrets 文件每行一个 `KEY=value`，建议权限 `600`。永远不要把 key 提交到仓库、写入技能文件或粘贴到公开产物中。

## 网络和隐私

- 图片只发送给实际调用的服务商 API；本仓库和插件本身不提供中转端点。
- Gemini 可通过 `GEMINI_PROXY` 或 `HTTPS_PROXY` 走代理；其他引擎仍可直连。
- Google AI Studio 免费档的数据条款可能允许用请求改进产品；内部文档、证件、客户资料等敏感图片应优先使用组织批准的国内引擎。
- 不要在公开仓库或摘要中复现图片里的个人信息、证件号、电话、客户数据或内部材料。

## 依赖

Python 3.9+。图片压缩使用 Pillow；缺失时脚本会提示安装：

```bash
python3 -m pip install Pillow
```
