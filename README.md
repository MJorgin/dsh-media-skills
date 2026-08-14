<div align="center">

<img src="docs/social-preview.png" alt="dsh-media-skills — Free image reading & generation for DeepSeek Harness" width="100%">

<br>

# 🎨 dsh-media-skills

### *Eyes & a brush for DeepSeek Harness — free image reading & generation skills.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-Skill-4D6BFE)](https://github.com/topics/dsh-plugin)

<br>

Give [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) "eyes" and a "brush" —
two free, ready-to-use skills with no hardcoded keys.

[**中文**](docs/lang/README_ZH.md)

</div>

---

## ✨ Capabilities

| Skill | What it does | Model | Cost |
|---|---|---|---|
| 👁️ `vision-review` | Analyze / recognize / describe images & screenshots; catch UI visual bugs (overlap, overflow, misalignment); detect watermarks/logos; turn images into text | Zhipu GLM-4V-Flash | Free |
| 🎨 `media-tools` | Generate images, illustrations, avatars, backgrounds, banners | SiliconFlow Kolors | Free, no watermark |

## 🔑 Keys

Keys are **never stored in this repo**. Scripts read, in order: environment variables → `~/.dsh/secrets/media-tools.env` → `~/.codex/secrets/media-tools.env` (legacy fallback).

```sh
# ~/.dsh/secrets/media-tools.env (chmod 600, one KEY=value per line)
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
```

## ⚡ Install

```sh
dsh plugin --profile <name> add github:akqwpeter-prog/dsh-media-skills
```

> No bundle needed either: drop the folders under `skills/` into any skill root (`~/.dsh/skills/` or a project's `.dsh/skills/`) and DSH hot-loads them.

## 🚀 Usage

Once enabled, both skills appear in the `dsh` skill catalog. Just say:

- "Look at this image / check this screenshot for visual bugs" → uses `vision-review`
- "Generate an image of …" → uses `media-tools`

## 🗺️ Layout

```
dsh-media-skills/
├── package.json           # dsh.bundle manifest
├── cordis.patch.yml       # plugin layer
├── index.js               # registers the provider on ctx.skills
├── skills/
│   ├── vision-review/     # image reading
│   │   ├── SKILL.md
│   │   └── scripts/vision.py
│   └── media-tools/       # image generation
│       ├── SKILL.md
│       └── scripts/generate.py
├── scripts/make-banner.py # regenerates docs/social-preview.png
└── docs/social-preview.png
```

## 🤝 Join the DSH plugin ecosystem

DeepSeek Harness developer preview is still in its testing phase for Harness developers; core plugins and base APIs will keep iterating. We look forward to exploring the upper limits of intelligence together with developers worldwide, on top of open-source, open, reusable, and composable infrastructure.

- [dsh-plugin topic](https://github.com/topics/dsh-plugin)
- [Quickstart](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart)
- [DeepSeek Harness repo](https://github.com/deepseek-ai/deepseek-harness)

> Tag this repo with [`dsh-plugin`](https://github.com/topics/dsh-plugin) so others can discover it.

## 📄 License

[MIT](LICENSE)
