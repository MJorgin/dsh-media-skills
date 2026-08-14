<div align="center">

<img src="docs/social-preview.png" alt="dsh-media-skills — Free image reading & generation for DeepSeek Harness" width="100%">

<br>

# 🎨 dsh-media-skills

### *读图 · 生图 —— 为 DeepSeek Harness 而生的免费 Skill*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-Skill-4D6BFE)](https://github.com/topics/dsh-plugin)

<br>

给 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 装上「眼睛」和「画笔」——
两个免费、无 Key 硬编码、开箱即用的 Skill。

</div>

---

## ✨ 能力一览

| Skill | 作用 | 模型 | 费用 |
|---|---|---|---|
| 👁️ `vision-review` | 分析 / 识别 / 描述图片与截图；找界面视觉 bug（重叠、溢出、错位）；检测水印 Logo；图片转文字 | 智谱 GLM-4V-Flash | 免费 |
| 🎨 `media-tools` | 生成图片、插画、头像、背景、banner | SiliconFlow Kolors | 免费、无水印 |

## 🔑 密钥

Key **永不写进本仓库**。脚本按顺序读取：环境变量 → `~/.dsh/secrets/media-tools.env` → `~/.codex/secrets/media-tools.env`（兼容回退）。

```sh
# ~/.dsh/secrets/media-tools.env （chmod 600，每行 KEY=value）
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
```

## ⚡ 安装

```sh
dsh plugin --profile <name> add github:akqwpeter-prog/dsh-media-skills
```

> 也可以不走 bundle：把 `skills/` 下的目录直接放进任意 skill 根目录（`~/.dsh/skills/` 或项目内 `.dsh/skills/`），DSH 会热加载。

## 🚀 使用

装好后，两个 skill 会出现在 `dsh` 的 skill 目录里。直接说：

- 「看看这张图 / 检查这个截图有没有视觉 bug」→ 走 `vision-review`
- 「给我生成一张 XX 的图」→ 走 `media-tools`

## 🗺️ 目录结构

```
dsh-media-skills/
├── package.json           # dsh.bundle 清单
├── cordis.patch.yml       # 插件层
├── index.js               # 在 ctx.skills 上注册 provider
├── skills/
│   ├── vision-review/     # 读图
│   │   ├── SKILL.md
│   │   └── scripts/vision.py
│   └── media-tools/       # 生图
│       ├── SKILL.md
│       └── scripts/generate.py
├── scripts/make-banner.py # 复现 docs/social-preview.png
└── docs/social-preview.png
```

## 🤝 加入 DSH 插件生态

DeepSeek Harness 开发者预览版仍处于面向 Harness 开发者的测试阶段，核心插件和基础 API 将持续迭代。我们期待与全球开发者一起，在开源、开放、可复用、可组合的基础设施之上，共同探索智能上限。

- [dsh-plugin 插件话题](https://github.com/topics/dsh-plugin)
- [快速上手](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart)
- [DeepSeek Harness 仓库](https://github.com/deepseek-ai/deepseek-harness)

> 给本仓库打上 [`dsh-plugin`](https://github.com/topics/dsh-plugin) topic，方便被发现。

## 📄 License

[MIT](LICENSE)
