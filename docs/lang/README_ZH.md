<div align="center">

<img src="../social-preview.png" alt="dsh-media-skills —— 为 DeepSeek Harness 提供图片审查与生成能力" width="100%">

<br>

# 🎨 dsh-media-skills

### 面向 DeepSeek Harness v0.1.6 的图片审查与图片生成技能

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](../../LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![DeepSeek Harness](https://img.shields.io/badge/DSH-v0.1.6--alpha.2-4D6BFE)](https://github.com/deepseek-ai/deepseek-harness/releases/tag/dsh-v0.1.6-alpha.2)
[![No bundled keys](https://img.shields.io/badge/keys-%E4%BB%8E%E4%B8%8D%E5%86%85%E7%BD%AE-8B5CF6)](#密钥与隐私)
[![Docs](https://img.shields.io/badge/docs-9%20languages-4D6BFE)](README_ZH.md)

<br>

一个轻量 DSH 插件，提供两个「自带密钥」（bring-your-own-key）的媒体技能：

- 👁️ **`vision-review`** —— 描述图片、OCR、检查截图，发现文字重叠/溢出等 UI 问题，并可输出结构化证据。
- 🎨 **`media-tools`** —— 通过 SenseNova U1 Fast 或 SiliconFlow Kolors 生成插画、头像、背景和 Banner。

插件使用 DSH v0.1.6 的技能提供方生命周期，**不补丁 DSH 核心、不改模型设置、不注册模型提供方、不写隐藏配置**。

[为什么](#为什么) · [安装](#安装) · [配置密钥](#配置密钥) · [用法](#用法) · [手动目录安装](#手动目录安装) · [验证](#验证) · [FAQ](#faq)

[**English**](../../README.md) · [**简体中文**](README_ZH.md) · [**繁體中文**](README_ZH_TW.md) · [**日本語**](README_JA.md) · [**한국어**](README_KO.md) · [**Español**](README_ES.md) · [**Deutsch**](README_DE.md) · [**Português**](README_PT.md) · [**Русский**](README_RU.md)

</div>

---

## 为什么

DeepSeek Harness v0.1.6 已为支持图片输入的模型提供了现代的附件与文件工作流。本 bundle 聚焦原生附件支持之外仍然有价值的两类互补工作：

| 需求 | 技能 | 作用 |
|---|---|---|
| 显式截图 QA | `vision-review` | 检查渲染完整性、重叠、溢出、错位、水印与视觉一致性。 |
| OCR 与图片转文字 | `vision-review` | 把截图、照片和扫描件转成文字，可选结构化 JSON 契约。 |
| 提供方故障转移 | `vision-review` | 按固定顺序尝试已配置的引擎，并报告每次失败。 |
| 图片素材生产 | `media-tools` | 通过已配置的 SenseNova 或 SiliconFlow 密钥生成可用图片文件。 |

模型路由交给 DSH 及其 **Models** 界面负责。因此插件兼容 v0.1.6 的运行时启用、禁用、卸载与重启，不残留全局状态。

## v0.1.6 有什么变化

- 通过 `ctx.skills.registerProvider(...)` 注册两个内置技能。
- 移除旧的隐式 `llm-pi-ai` 设置写入和所有模型路由播种逻辑。
- 技能元数据直接读取各自的 `SKILL.md`，避免描述漂移。
- 支持运行时插件生命周期：注册归属于插件 fiber，可被干净移除。
- 旧核心补丁仅作为 `<= v0.1.1-rc.2` 的历史资料保留；v0.1.6 不再需要。
- 新增静态 manifest 校验和运行时 fake-context 提供方测试。

## 安装

### 方式一：DSH Plugin Manager

在 DSH 的 Plugin Manager 中添加：

```text
github:MJorgin/dsh-media-skills
```

然后重启该 profile。

### 方式二：CLI

以常用的 web profile 为例：

```sh
dsh plugin --profile web add github:MJorgin/dsh-media-skills
```

请把 `web` 替换为你实际使用的 DSH profile。安装后重启该 profile 以挂载新 bundle。

无需构建：包内是开箱即用的 ESM 与 Python 脚本，没有依赖安装，也没有 `prepare` 脚本。

## 配置密钥

密钥永远不会存放在本仓库中。技能脚本优先读取环境变量，然后读取：

```text
~/.dsh/secrets/media-tools.env
~/.codex/secrets/media-tools.env   # 历史兼容
```

`vision-review` 还可以从以下文件读取兼容密钥：

```text
~/.dsh/.credentials.yaml
```

`media-tools` 读取环境变量和两个 `media-tools.env` 文件；请在上述位置显式配置它的密钥。

| 密钥 | 使用方 | 说明 |
|---|---|---|
| `GLM_API_KEY` | `vision-review` | 主引擎智谱 `glm-4v-flash`；请核实智谱当前定价/免费额度条款。 |
| `DEEPSEEK_API_KEY` | `vision-review` | 可选的付费 DeepSeek 视觉模型；也会从 DSH 凭据存储读取。 |
| `SILICONFLOW_API_KEY` | 两个技能 | 审查用 Qwen3-VL，生成用 Kolors。 |
| `SENSENOVA_API_KEY` | 两个技能 | 审查用 SenseNova 视觉模型，生成用 U1 Fast。 |
| `GEMINI_API_KEY` | `vision-review` | 可选 Gemini 备用引擎；部分网络下可能需要 `GEMINI_PROXY`。 |

secrets 文件示例：

```sh
# ~/.dsh/secrets/media-tools.env，建议 chmod 600
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
SENSENOVA_API_KEY=...
GEMINI_API_KEY=...
```

### DSH 原生图片模型

本插件不会向 DSH 模型选择器添加模型。若希望普通 DSH 对话原生接收图片，请在 DSH 的 **Models** 设置中配置多模态模型/提供方，然后使用 DSH 原生附件流程。

当你需要专门的脚本化审查/OCR 工作流、提供方故障转移链或结构化证据，而不只是多模态对话回复时，使用 `vision-review`。

## 用法

### 视觉审查

让 DSH 使用 `vision-review`，或在技能目录下直接运行脚本：

```bash
python3 scripts/vision.py screenshot.png
python3 scripts/vision.py a.png b.png --structured
python3 scripts/vision.py screenshot.png --provider=siliconflow-qwen
python3 scripts/vision.py --doctor
```

默认 prompt 会检查渲染完整性、文字重叠/错位/溢出、配色层次、水印和明显视觉 bug。针对具体任务可传入聚焦 prompt：

```bash
python3 scripts/vision.py page.png --prompt="检查按钮、标题和图表是否有重叠，并指出具体位置"
```

故障转移链只会在对应密钥可用时加入引擎。可选的 `--structured` 输出包含摘要、OCR、按阅读顺序的布局、语义、视觉备注和不确定项。

### 图片生成

```bash
python3 skills/media-tools/scripts/generate.py "云海中的中国宫殿，写实电影感，气势恢宏" palace.jpg 16:9
```

配置了 `SENSENOVA_API_KEY` 时使用 SenseNova，否则在有 `SILICONFLOW_API_KEY` 时使用 SiliconFlow Kolors。SenseNova 尺寸可传精确尺寸或常见比例，脚本会映射到最接近的支持尺寸。

## 手动目录安装

推荐使用插件安装，因为本仓库包含多个技能。v0.1.6 的文件系统提供方只扫描技能根目录下一层，直接把仓库克隆进 `~/.dsh/skills/` 无法发现嵌套的 `skills/*/SKILL.md`。

手动安装需要分别链接每个技能：

```sh
git clone https://github.com/MJorgin/dsh-media-skills.git ~/.dsh/bundles/dsh-media-skills
mkdir -p ~/.dsh/skills
ln -s ~/.dsh/bundles/dsh-media-skills/skills/vision-review ~/.dsh/skills/vision-review
ln -s ~/.dsh/bundles/dsh-media-skills/skills/media-tools ~/.dsh/skills/media-tools
```

创建链接后重启 DSH。

## 验证

运行完整本地检查：

```sh
npm test
```

内容包括：DSH bundle manifest 校验、通过仿 DSH 上下文进行运行时提供方注册/加载验证、JavaScript 语法检查，以及两个技能脚本的 Python 编译检查。

## 历史补丁

旧核心补丁仍为维护历史 DSH 构建的用户保留：

- [中文说明](../HARNESS_PATCH.md)
- [English notes](../HARNESS_PATCH_EN.md)

它们仅适用于截至 `v0.1.1-rc.2` 的历史构建。v0.1.6 新用户不要应用。

## 项目结构

```text
dsh-media-skills/
├── package.json              # DSH bundle manifest 与测试命令
├── cordis.patch.yml          # Cordis 插件插入项
├── index.js                  # 注册内置技能提供方
├── skills/
│   ├── vision-review/        # 图片分析与截图 QA
│   └── media-tools/          # 图片生成
├── scripts/                  # bundle 校验辅助脚本
├── examples/                 # 示例图片与测试卡
└── docs/                     # 安装指南、译文与历史资料
```

## FAQ

**DSH v0.1.6 需要核心补丁吗？**
不需要。在 DSH 中配置多模态模型即可进行原生图片对话；专门的审查与生成工作流则使用技能脚本。

**插件会自动向模型选择器添加模型吗？**
不会。DSH v0.1.6 已提供模型与插件管理；插件只注册技能，绝不修改模型设置。

**所有提供方都是免费的吗？**
提供方定价与免费额度政策可能变化。GLM-4V-Flash 和 Kolors 一向对免费额度友好，DeepSeek 则为付费。依赖某条工作流前请查看提供方当前条款。

**内置 API 密钥吗？**
不。密钥只存在于你的环境变量、DSH 凭据存储或本地 secrets 文件中。

**敏感的公司内部截图应该发给谁？**
只发给你所在组织批准的提供方。除非公司政策允许，内部文档不要发给 Gemini 或其他外部提供方。

## 示例

<img src="../../examples/generated/fox-forest.jpg" width="30%"> <img src="../../examples/generated/cat-astronaut.jpg" width="30%"> <img src="../../examples/vision-test-card.png" width="30%">

更多内容见 [examples/README.md](../../examples/README.md)。

## License

[MIT](../../LICENSE)
