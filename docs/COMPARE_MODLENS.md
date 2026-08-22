# 与 ModLens 的对比与共存

> 本文基于本机实测（dsh web profile 同时安装 `dsh-media-skills` 与 `@liustack/modlens@3.16.6`）。
> ModLens：https://github.com/liustack/modlens

## 一句话定位

两个项目解决同一个问题：**给纯文本模型补视觉能力，让粘贴的图片能被读懂**。差异在机制、引擎池和输出形态。

| 维度 | dsh-media-skills（本项目） | ModLens |
|---|---|---|
| 粘贴链路 | 本体 api-proxy 补丁：图片附件在进入纯文本模型前由视觉路由转成文字描述（`已由视觉模型读取`），描述直接进消息 | 浏览器端拦截粘贴 → 字节上传 `/modlens/paste` 存临时文件 → **文件路径进输入框** → 模型调 `modlens_read_image` 工具读图；另有 `(modlens vision)` 包装模型变体在请求时转换 |
| 读图触发 | 技能 `vision-review`（自然语言触发）+ 视觉模型路由 | 工具 schema 每次请求都可见，模型按需调用（无触发博弈） |
| 引擎池 | 智谱 GLM-4V-Flash（免费，主）→ DeepSeek-V4-Flash-Vision-Exp（与主 agent 同 key，付费可选）→ SenseNova / SiliconFlow Qwen3-VL → Google Gemini（免费 key 自动加入，`GEMINI_MODEL` 可换模型）+ `VISION_FALLBACKS` 自定义故障转移链（OpenAI 兼容端点） | 5 内置 provider（gemini-api / openai / anthropic / antigravity-cli / claude-cli）+ 复用 Codex/OpenCode/Pi/Grok 登录态，故障转移链 |
| 输出形态 | 默认自然语言描述；`--structured` 输出 **modlens v2 同款证据契约**（summary / ocr.full_text / layout 阅读顺序区块 / semantics 实体与关系 / visual / uncertainty），已验证 GLM-4V-Flash 在 `response_format=json_object` 下能稳定产出 | 结构化证据：summary / ocr.full_text / 版面区块 / 实体关系 / uncertainty 列表 |
| 生图 | ✅ `media-tools`（SiliconFlow Kolors，免费） | ❌ 无 |
| 配置与体检 | secrets/env 文件；`vision.py --doctor` | `~/.modlens/config.json`（0600）；`modlens doctor` |
| 依赖 | Python 3 + Pillow | Node ≥ 22.19（插件自带 CLI，无需全局安装） |

## 两个都装时，粘贴图片会发生什么（实测结论）

两个插件不冲突，粘贴走向由「当前选的模型」决定，链条如下：

1. **选了 `(modlens vision)` 变体**（如 `DeepSeek-V4-Pro (modlens vision)`）：走 modlens 的包装适配器，请求时把图片转成证据文本，会话记录保留原生缩略图。
2. **选了纯文本模型**（如 `deepseek-v4-pro`）：
   - modlens 浏览器端先拦截粘贴（主机按模型元数据裁决「接管」），图片变成临时文件路径进输入框，模型调 `modlens_read_image`；
   - 若 modlens 未接管（裁决为否、路由未就绪、或首次粘贴），图片作为附件正常进入 → **本项目的 api-proxy 补丁接手**，用智谱视觉路由转成文字描述。
   - 即：modlens 在前，本项目兜底，不会重复读图。
3. **选了智谱 GLM-4V-Flash（视觉）**：原生视觉模型，两边都不介入，原生贴图。

模型选择器里三种视觉入口并存：智谱视觉路由（本项目）、`(modlens vision)` 变体（modlens）、以及任何会话里的 `modlens_read_image` 工具。

## 引擎配置互相独立

- 本项目：`GLM_API_KEY`、可选 `GEMINI_API_KEY`（配好后自动加入回退链）——环境变量或 `~/.dsh/secrets/media-tools.env`。
- ModLens：`~/.modlens/config.json`。**可以指向同一个智谱端点**，实测需要开 `structuredOutput` 让 GLM-4V-Flash 按 modlens 的 JSON 契约输出；配 `gemini-api.apiKey` 则可与 Google 直连：

```sh
modlens config set openai.baseUrl https://open.bigmodel.cn/api/paas/v4
modlens config set openai.apiKey <GLM key>
modlens config set openai.model glm-4v-flash
modlens config set openai.structuredOutput true
modlens config set provider openai
modlens doctor   # 体检（纯本地诊断，不耗额度）
```

## 怎么选

- 想要**结构化证据**（全文转写、版面区块、不确定项列表）——两边都有：modlens 始终结构化，本项目加 `--structured`（同款契约，已验证 GLM-4V-Flash 可稳定产出）。
- 想要**多引擎复用**（复用已有 Codex/OpenCode/Pi/Grok 登录态、`modlens doctor` 一键体检、粘贴→路径→工具的全托管链路）→ ModLens。
- 想要**生图 + 轻量技能 + 无 Node 引擎依赖**、描述以自然语言为主 → 本项目（引擎链：GLM → Gemini → 任意 OpenAI 兼容端点）。
- 都装也不冲突：一个在前拦截、一个兜底，引擎配置各管各的；两边现在共享同一套引擎池（GLM + Google Gemini）和同一套证据契约。
