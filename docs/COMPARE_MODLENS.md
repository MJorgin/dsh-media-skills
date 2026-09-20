# 与 ModLens 的关系（DSH v0.1.6）

ModLens：<https://github.com/liustack/modlens>

本文描述 DSH v0.1.6 下的能力边界。ModLens 和本仓库都可能参与图片理解，但定位不同；具体行为以你安装的 ModLens 版本和 DSH 配置为准。

## 一句话定位

| 项目 | 主要定位 |
|---|---|
| DSH 原生多模态模型 | 选择支持图片输入的模型后，直接附加图片并获得模型回答。 |
| ModLens | 提供独立的图片理解/工具链、结构化能力，以及其自身支持的多种 provider/登录态。 |
| `dsh-media-skills` | 以 DSH skill 形式提供显式视觉 QA/OCR、引擎故障转移、结构化证据，以及图片生成。 |

## 对比

| 维度 | dsh-media-skills | ModLens |
|---|---|---|
| DSH 集成方式 | `ctx.skills.registerProvider(...)` 注册两个技能。 | 按 ModLens 自己的插件/工具机制集成。 |
| 是否修改 DSH 模型设置 | 不修改。 | 以 ModLens 文档为准。 |
| 读图触发 | 由技能路由或显式命令触发。 | 由 ModLens 工具、模型包装或其接管逻辑触发。 |
| 密钥来源 | 环境变量、`media-tools.env`、`~/.dsh/.credentials.yaml`（vision）。 | ModLens 自己的配置和凭据体系。 |
| 输出形态 | 自然语言；`vision-review --structured` 输出 JSON 证据。 | ModLens 支持其结构化视觉证据。 |
| 图片生成 | `media-tools` 支持 SenseNova/SiliconFlow。 | 通常不是核心能力。 |

## 共存建议

- 需要 DSH 原生聊天：在 **Models** 中配置多模态模型。
- 需要 ModLens 的全托管 provider/工具链：按 ModLens 文档安装并配置。
- 需要截图 QA、OCR、故障转移或图片生成：使用本仓库的两个技能。

DSH v0.1.6 不需要应用本仓库历史上的核心补丁。若 ModLens 已接管某个图片流程，就不必同时重复运行 `vision-review`；没有接管时，可以把 `vision-review` 作为显式检查手段。

## 怎么选

- 追求最简单：直接配置 DSH 原生多模态模型。
- 追求 ModLens 的跨 provider/登录态和工具链：使用 ModLens。
- 追求“视觉检查 + 生图”两个技能统一由 DSH skill catalog 管理：使用本项目。
- 三者也可以共存，但应让用户的当前请求决定由哪条链路处理，避免对同一张图片重复计费或重复分析。
