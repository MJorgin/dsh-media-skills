<div align="center">

<img src="../social-preview.png" alt="dsh-media-skills — 为 DeepSeek Harness 而生的免费读图与生图 Skill" width="100%">

<br>

# 🎨 dsh-media-skills

### *给 DeepSeek Harness 装上眼睛和画笔 —— 任意会话直接贴图，还能免费生成图片。*

> 本翻译已与英文版同步；若后续版本出现差异，以英文版 [README.md](../../README.md) 为准。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-Skill-4D6BFE)](https://github.com/topics/dsh-plugin)
[![Free vision](https://img.shields.io/badge/vision-GLM%2BDeepSeek%2BGemini-2EA44F)](../SETUP_VISION.md)
[![Free generation](https://img.shields.io/badge/generation-SenseNova%2BKolors-2EA44F)](../FREE_VISION_PROVIDERS.md)
[![No hardcoded keys](https://img.shields.io/badge/keys-never%20in%20repo-8B5CF6)](README_ZH.md#-密钥与隐私)
[![Docs](https://img.shields.io/badge/docs-9%20languages-4D6BFE)](README_ZH.md)

<br>

DeepSeek Harness 很会推理，但纯文本模型看不见你拖进聊天框的图片。这个 bundle 用**两个免费 Skill + 一条视觉模型路由（v0.1.1 起原生自带 DeepSeek-V4-Flash-Vision-Exp）+ 一条视觉引擎故障转移链**解决这件事：

- 🖼️ **贴图直读** —— 任意会话粘贴 / 拖拽 / 选择图片，免费视觉模型自动转述成文字，交给当前模型理解。*（依赖 DeepSeek Harness 本体的自动转述管道，本 bundle 提供其所需的视觉模型路由与读图技能，见 [../HARNESS_PATCH.md](../HARNESS_PATCH.md)）*
- 👁️ **`vision-review`** —— 分析图片与截图、检查界面视觉 Bug、检测水印 Logo、把图片转成文字。
- 🎨 **`media-tools`** —— 免费生成插画、头像、背景、Banner，无水印。
- 🔀 **引擎故障转移** —— GLM-4V-Flash（免费）→ **DeepSeek-V4-Flash-Vision-Exp**（与主 agent 同 key，付费可选）→ SiliconFlow Qwen3-VL → SenseNova → Google Gemini（免费 key 从 [AI Studio](https://aistudio.google.com) 领取）→ 任意 OpenAI 兼容端点，支持 modlens 同款结构化证据输出。

无 Key 硬编码、无需付费、不用存文件、不用切会话。

[为什么](#-为什么) · [快速开始](#-快速开始) · [效果预览](#-效果预览) · [使用方式](#-使用方式) · [密钥与隐私](#-密钥与隐私) · [常见问题](#-常见问题) · [示例](#-示例)

[**English**](../../README.md) · [**简体中文**](README_ZH.md) · [**繁體中文**](README_ZH_TW.md) · [**日本語**](README_JA.md) · [**한국어**](README_KO.md) · [**Español**](README_ES.md) · [**Deutsch**](README_DE.md) · [**Português**](README_PT.md) · [**Русский**](README_RU.md)

</div>

---

## 🤔 为什么

市面上的 DSH 视觉插件大多只能**读图**，而且很多让你走一个共享的第三方端点。`dsh-media-skills` 的思路不一样：

| 对比项 | 本 bundle | 常见「只读图」插件 |
|---|---|---|
| 免费读图 | ✅ 智谱 GLM-4V-Flash（免费）· v0.1.1 默认 DeepSeek-V4-Flash-Vision-Exp（同 key） | ✅ |
| **免费生图** | ✅ SenseNova U1 Fast → SiliconFlow Kolors | ❌ 通常没有 |
| 自动写入模型路由 | ✅ 安装即自动配置 | 视插件而定 |
| Key 是否入库 | ❌ 绝不，密钥只留在本地 | ⚠️ 经常要求配置 |
| 多语言文档 | ✅ 9 种语言 | ❌ 通常只有英文 |
| 隐私 | ✅ 图片只发给你自己选的提供方 | 共享免费端点可能看到你的图片 |

**为什么用「自带免费 Key」而不是内置匿名端点？** 为了隐私和稳定性。你的图片只发给你选的提供方，走你自己的账号和速率限制，中间没有任何共享第三方服务。

**新版本适配**：DeepSeek Harness **≥ v0.1.1-rc.1** 的 deepseek-official 路由原生自带 **DeepSeek-V4-Flash-Vision-Exp**——贴图自动转述与视觉模型路由会直接使用它，与主 agent 同一个 `DEEPSEEK_API_KEY`，**零额外配置**。rc.7 / rc.8 则应用本仓库配套补丁（见 [HARNESS_PATCH.md](../HARNESS_PATCH.md)）。**v0.1.2-alpha.3+**：上游移除了 `api-proxy` 宿主包并重构了合成器，核心补丁已随之移植（准入改在 `packages/api/session-controller/src/commands.ts`，气泡渲染移至 `ui-chat` 客户端包），并对 `dsh-v0.1.2-alpha.3` 做了 `git apply --check` 干净 + `tsc` 类型检查干净验证；client-ux 补丁对 alpha.1/alpha.2/alpha.3 通用。

## ✨ 能力一览

| 能力 | 说明 | 模型 | 费用 |
|---|---|---|---|
| 🖼️ 贴图自动转述 | **纯文本会话**的输入框有「添加图片」按钮（图片图标，rc.7 / rc.8 由配套 client-ux 补丁恢复）与粘贴/拖放入摄；贴图后由视觉模型自动转成文字描述发给当前模型（**v0.1.1 默认 DeepSeek-V4-Flash-Vision-Exp**；rc.7/rc.8 为 GLM-4V-Flash + SiliconFlow 故障转移，单路由 15s），气泡保留原图缩略图。*（Harness 本体功能，需准入放宽补丁 + client-ux 补丁；补丁覆盖 rc.7/rc.8/v0.1.1-rc.1/rc.2/v0.1.2-alpha.3——v0.1.2 起改为针对重构后的 session-controller / ui-chat 文件；本 bundle 提供其依赖的视觉路由与技能）* | v0.1.1：DeepSeek-Vision-Exp · rc.7/8：GLM-4V-Flash | GLM 免费；DeepSeek 走余额（v0.1.1 默认） |
| 🧠 视觉模型路由 | 安装后**自动**在模型选择器里写入「智谱 GLM-4V-Flash（视觉）」；**v0.1.1** 的 deepseek 路由还原生自带 **DeepSeek-V4-Flash-Vision-Exp**（同 key）——新会话选任一即可直接看图对话 | 智谱 GLM-4V-Flash · DeepSeek-V4-Flash-Vision-Exp（v0.1.1） | GLM 免费；DeepSeek 走余额 |
| 👁️ `vision-review` | 分析 / 识别 / 描述图片与截图；找界面视觉 bug（重叠、溢出、错位）；检测水印 Logo；图片转文字。可选 `--structured` 输出 modlens 同款结构化证据 JSON（summary / 全文 OCR / 阅读顺序版面 / 实体关系 / 不确定性）。引擎故障转移链：GLM-4V-Flash → DeepSeek-V4-Flash-Vision-Exp（与主 agent 同 key，付费可选）→ SiliconFlow Qwen3-VL / SenseNova / Google Gemini（有 key 自动入链）→ 任意 OpenAI 兼容端点 | GLM-4V-Flash + DeepSeek-Vision-Exp + Qwen3-VL + SenseNova + Gemini | 免费（DeepSeek 付费可选） |
| 🎨 `media-tools` | 生成图片、插画、头像、背景、banner | SenseNova U1 Fast → SiliconFlow Kolors | 免费、无水印 |

## ⚡ 快速开始

```sh
dsh plugin --profile <name> add github:MJorgin/dsh-media-skills
```

1. **Key**：
   - **v0.1.1-rc.1+（含 v0.1.2-alpha.x）**：零额外配置——贴图转述与视觉路由直接用主 agent 的 `DEEPSEEK_API_KEY`（DeepSeek-V4-Flash-Vision-Exp）。
   - **rc.7 / rc.8**（或想加免费引擎）：智谱：[open.bigmodel.cn](https://open.bigmodel.cn) → 「API Keys」（glm-4v-flash 免费）；SiliconFlow：[siliconflow.cn](https://siliconflow.cn) → 「API 密钥」（Kolors 免费）；*（可选）* Google Gemini：[aistudio.google.com](https://aistudio.google.com) → 「Get API key」，配好后自动加入读图回退链
2. **填入**：Web 界面（**设置 → 模型** → 找到 zhipu-vision 提供方的 **API Key 栏**），或写在凭据文件里：

   ```sh
   # ~/.dsh/.credentials.yaml（chmod 600）
   GLM_API_KEY: <你的智谱 Key>
   ```

3. **彻底重启** `dsh web`，然后 `Cmd+Shift+R` 强刷页面。

验证：模型选择器出现 **「智谱 GLM-4V-Flash（视觉）」**；若你的 DSH 版本支持贴图转述，输入框左下角还会出现 **🖼️「添加图片」按钮**。任意会话贴一张图——它会以文字描述的形式到达。

完整步骤与排错：**[../SETUP_VISION.md](../SETUP_VISION.md)**

## 📸 效果预览

*纯文本会话里贴一张图 → 免费视觉模型转述 → 当前模型回答；同一个 bundle 还能按需生成新图。*

<img src="../screenshots/demo-paste.png" alt="演示：纯文本 DSH 会话中贴图，视觉模型读取并转述，模型回答；同一 bundle 还能生成图片" width="100%">

*工作原理一图流：*

<img src="../screenshots/how-it-works.png" alt="贴图直读原理：贴图 → 视觉模型转述 → 文字描述到达当前模型" width="100%">

## 🚀 使用方式

三种读图方式：

| 方式 | 怎么用 | 适用场景 |
|---|---|---|
| **A. 直接贴图（推荐）** | 任意会话点图片按钮选图 / 拖拽 / 粘贴，直接发送 | 日常看图，不用切会话、不用存文件 |
| **B. 视觉模型会话** | 新开对话，模型选「智谱 GLM-4V-Flash（视觉）」，贴图对话 | 多轮围绕图片对话、原生读图（`read_image`） |
| **C. 文件 + 技能** | 把图放到工作区，说「用 vision-review 读一下这张图」 | 批量检查、脚本化处理 |

转述语言自动跟随你发消息的语言（中文消息出中文描述、英文消息出英文描述；没打字默认中文）。

另外直接说：

- 「看看这张图 / 检查这个截图有没有视觉 bug」→ 走 `vision-review`
- 「给我生成一张 XX 的图」→ 走 `media-tools`

## 🔑 密钥与隐私

Key **永不写进本仓库**。技能脚本按顺序读取：环境变量 → `~/.dsh/secrets/media-tools.env` → `~/.codex/secrets/media-tools.env`（兼容回退）；视觉模型路由从 DSH 凭据库读取 `GLM_API_KEY`。

Key 去哪领（全部免费）：智谱 — [open.bigmodel.cn](https://open.bigmodel.cn) → API Keys（glm-4v-flash）。SiliconFlow — [siliconflow.cn](https://siliconflow.cn) → API 密钥（Kolors 免费，同一把 key 也用于读图回退链的 Qwen3-VL）。Google（可选，配好后自动加入读图回退链）— [aistudio.google.com](https://aistudio.google.com) → Get API key。

```sh
# ~/.dsh/secrets/media-tools.env （chmod 600，每行 KEY=value）
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
GEMINI_API_KEY=...   # 可选
```

你的图片只发给你自己配置的提供方——绝不会发到本仓库，也不会经过共享匿名端点。

## ❓ 常见问题

**贴图直读需要给 DeepSeek Harness 本体打补丁吗？**
「贴图自动转述」的管道属于 DeepSeek Harness **本体**（`api-proxy` 的图片准入逻辑，见 [../HARNESS_PATCH.md](../HARNESS_PATCH.md)）。本 bundle 负责**模型配置 + 读图/生图技能**；任何 DSH 版本装上后视觉模型都可用，但贴图直读需要你的 DSH 本体包含对应支持——判断方法见 [../SETUP_VISION.md](../SETUP_VISION.md) 常见问题 Q1。

**为什么不用内置免费端点、完全免 Key？**
我们更希望路由掌握在你自己手里：图片只发给你选的提供方，走你的速率限制，中间没有共享第三方。Key 全免费，申请大约两分钟。

**`media-tools` 真的免费吗？**
是的——SiliconFlow Kolors 免费且无水印。如果某个模型暂时不可用，Skill 会列出可用模型供切换。

## 🎁 示例

开箱即用的示例素材——6 张 AI 生成图（附提示词）+ 一张专门构造的读图测试卡（标题、按钮、柱状图数值，用于检验读图准确度）：

<img src="../../examples/generated/fox-forest.jpg" width="30%"> <img src="../../examples/generated/cat-astronaut.jpg" width="30%"> <img src="../../examples/vision-test-card.png" width="30%">

→ [examples/README.md](../../examples/README.md)

## 🗺️ 目录结构

```
dsh-media-skills/
├── package.json           # dsh.bundle 清单
├── cordis.patch.yml       # 插件层
├── index.js               # 注册技能 + 自动写入 zhipu-vision 模型路由
├── skills/
│   ├── vision-review/     # 读图
│   └── media-tools/       # 生图
├── examples/              # 示例图片 + 读图测试卡
├── docs/
│   ├── screenshots/       # 演示图与原理图
│   ├── SETUP_VISION.md    # 视觉模型详细配置指南（中文）
│   ├── SETUP_VISION_EN.md # detailed setup guide (English)
│   ├── HARNESS_PATCH.md   # 本体补丁说明（中文）
│   ├── HARNESS_PATCH_EN.md# core patch notes (English)
│   ├── COMPARE_MODLENS.md # 与 ModLens 的对比/共存（中文）
│   └── lang/              # 9 种语言的 README
├── scripts/make-banner.py # 复现 docs/social-preview.png
└── docs/social-preview.png
```

## 🧩 与 ModLens 共存？

本 bundle 和 [ModLens](https://github.com/liustack/modlens) 都能给纯文本模型补视觉能力。两个一起装不冲突：ModLens 的粘贴拦截在前（路径 → `modlens_read_image` 工具），本 bundle 的 api-proxy 转述兜底（可关闭 ModLens 的粘贴接管，让贴图始终走「图片附件 → 自动转述」）。完整对比、粘贴路由顺序、以及把 ModLens 指向同一个免费智谱端点的方法见 [../COMPARE_MODLENS.md](../COMPARE_MODLENS.md)。

## 🤝 加入 DSH 插件生态

DeepSeek Harness 开发者预览版仍处于面向 Harness 开发者的测试阶段，核心插件和基础 API 将持续迭代。我们期待与全球开发者一起，在开源、开放、可复用、可组合的基础设施之上，共同探索智能上限。

- [dsh-plugin 插件话题](https://github.com/topics/dsh-plugin)
- [快速上手](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart)
- [DeepSeek Harness 仓库](https://github.com/deepseek-ai/deepseek-harness)

> 本仓库已打上 [`dsh-plugin`](https://github.com/topics/dsh-plugin) topic，并收录于 [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) 精选列表。欢迎 PR、Issue 和翻译贡献。

## 📄 License

[MIT](../../LICENSE)
