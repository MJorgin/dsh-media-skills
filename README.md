<div align="center">

<img src="docs/social-preview.png" alt="dsh-media-skills — Free image reading & generation for DeepSeek Harness" width="100%">

<br>

# 🎨 dsh-media-skills

### *Paste an image straight into the chat box — free vision model, image reading & generation for DeepSeek Harness.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-Skill-4D6BFE)](https://github.com/topics/dsh-plugin)

<br>

Give [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) real eyes: paste any image in the chat —
even with a text-only model — and it gets read, described, and answered. No hardcoded keys.

[Paste-image reading](#-paste-image-reading) · [Quick start](#-quick-start) · [Usage](#-usage) · [Detailed Vision Setup](docs/SETUP_VISION_EN.md) · [Core patch notes](docs/HARNESS_PATCH_EN.md)

[**English**](README.md) · [**简体中文**](docs/lang/README_ZH.md) · [**繁體中文**](docs/lang/README_ZH_TW.md) · [**日本語**](docs/lang/README_JA.md) · [**한국어**](docs/lang/README_KO.md) · [**Español**](docs/lang/README_ES.md) · [**Deutsch**](docs/lang/README_DE.md) · [**Português**](docs/lang/README_PT.md) · [**Русский**](docs/lang/README_RU.md)

</div>

---

## 📸 Paste-image reading

**The core capability.** In any chat — including sessions with a text-only model like deepseek-v4-pro — paste, drag, or pick an image and just send it. A free vision model (Zhipu GLM-4V-Flash) reads the image and turns it into a text description your current model understands. No file saving, no session switching.

<img src="docs/screenshots/demo-paste.png" alt="Pasting an image in a deepseek-v4-pro session: the vision model auto-describes it as text and the model answers" width="100%">

*Left: the pasted image becomes a text description (`已由视觉模型读取`). Right: the paperclip button that opens the image picker.*

<img src="docs/screenshots/how-it-works.png" alt="How paste-image reading works: paste → vision model describes → text arrives" width="100%">

> ⚠️ Honest note: the auto-describe pipeline lives in the DeepSeek Harness **core** (image-admission logic in `api-proxy`; see [docs/HARNESS_PATCH_EN.md](docs/HARNESS_PATCH_EN.md)). This bundle ships the **model route + skills**; the vision model works on any DSH build, but paste-image reading requires a Harness build with that core support — see FAQ Q1 in [docs/SETUP_VISION_EN.md](docs/SETUP_VISION_EN.md).

## ✨ What you get

| Capability | What it does | Model | Cost |
|---|---|---|---|
| 📎 Paste-image reading | In a **text-only** session, the input bar gains an “Add image” button (paperclip); pasted images are auto-described by the vision model and handed to the current model as text | Zhipu GLM-4V-Flash | Free |
| 🧠 Vision model route | 「智谱 GLM-4V-Flash（视觉）」 appears in the model selector automatically — pick it for a new conversation and talk about images directly | Zhipu GLM-4V-Flash | Free |
| 👁️ `vision-review` | Analyze / recognize / describe images & screenshots; catch UI visual bugs (overlap, overflow, misalignment); detect watermarks/logos; turn images into text | Zhipu GLM-4V-Flash | Free |
| 🎨 `media-tools` | Generate images, illustrations, avatars, backgrounds, banners | SiliconFlow Kolors | Free, no watermark |

## ⚡ Quick start

1. Install the bundle:

   ```sh
   dsh plugin --profile <name> add github:akqwpeter-prog/dsh-media-skills
   ```

2. Supply your Zhipu key (free tier is enough) — either in the Web GUI (**Settings → Models** → the zhipu-vision provider's **API Key** field) or in the credentials file:

   ```sh
   # ~/.dsh/.credentials.yaml (chmod 600)
   GLM_API_KEY: <your key>
   ```

3. Restart `dsh web`, then hard-refresh the page (`Cmd+Shift+R`).

4. Verify: the model selector shows **智谱 GLM-4V-Flash（视觉）**. If your Harness build supports paste-image reading, the input bar also has a 📎 **Add image** button — paste an image in any session and it arrives as a text description.

Full walkthrough, how-it-works, and troubleshooting: [docs/SETUP_VISION_EN.md](docs/SETUP_VISION_EN.md).

## 🔑 Keys

Keys are **never stored in this repo**. Skill scripts read, in order: environment variables → `~/.dsh/secrets/media-tools.env` → `~/.codex/secrets/media-tools.env` (legacy fallback). The vision model route reads `GLM_API_KEY` from DSH's credential store.

```sh
# ~/.dsh/secrets/media-tools.env (chmod 600, one KEY=value per line)
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
```

## 🚀 Usage

Three ways to read images:

| Way | How | When |
|---|---|---|
| **A. Paste directly (recommended)** | In any session, click the 📎 button / drag / paste an image and send | Everyday image questions — no file saving, no model switching |
| **B. Vision model session** | New conversation, pick 智谱 GLM-4V-Flash（视觉）, paste images and chat | Multi-turn image conversations, native `read_image` |
| **C. Files + skill** | Put the image in the workspace and say “read this image with vision-review” | Batch review, scripted workflows |

Descriptions follow your message language (Chinese message → Chinese description; English message → English description; no text → Chinese).

Also just say:

- “Look at this image / check this screenshot for visual bugs” → `vision-review`
- “Generate an image of …” → `media-tools`

## 🗺️ Layout

```
dsh-media-skills/
├── package.json           # dsh.bundle manifest
├── cordis.patch.yml       # plugin layer
├── index.js               # registers skills + seeds the zhipu-vision model route
├── skills/
│   ├── vision-review/     # image reading
│   └── media-tools/       # image generation
├── docs/
│   ├── screenshots/       # demo screenshots & how-it-works diagram
│   ├── SETUP_VISION_EN.md # detailed setup guide (English)
│   ├── SETUP_VISION.md    # 详细配置指南（中文）
│   ├── HARNESS_PATCH_EN.md# core patch notes (English)
│   ├── HARNESS_PATCH.md   # 本体补丁说明（中文）
│   └── lang/              # READMEs in 9 languages
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
