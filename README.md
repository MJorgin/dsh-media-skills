<div align="center">

<img src="docs/social-preview.png" alt="dsh-media-skills — free image reading & generation for DeepSeek Harness" width="100%">

<br>

# 🎨 dsh-media-skills

### *Give DeepSeek Harness eyes — and a brush. Read images in any chat, generate new ones, all with free models.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-Skill-4D6BFE)](https://github.com/topics/dsh-plugin)
[![Free vision](https://img.shields.io/badge/vision-GLM%2BGemini-2EA44F)](docs/SETUP_VISION_EN.md)
[![Free generation](https://img.shields.io/badge/generation-Kolors-2EA44F)](docs/FREE_VISION_PROVIDERS_EN.md)
[![No hardcoded keys](https://img.shields.io/badge/keys-never%20in%20repo-8B5CF6)](README.md#-keys--privacy)
[![Docs](https://img.shields.io/badge/docs-9%20languages-4D6BFE)](docs/lang/README_ZH.md)
[![Harness](https://img.shields.io/badge/Harness-rc.7%20%2F%20rc.8%20%2F%20v0.1.1%20rc.1-4D6BFE)](docs/HARNESS_PATCH_EN.md)

<br>

DeepSeek Harness is brilliant at reasoning — but a text-only model can't see the image you just dragged into the chat. This bundle fixes that with **two free skills**, a **free vision model route**, and a **vision engine failover chain**:

- 📎 **Paste to read** — paste, drag, or pick an image in any session; the free vision model turns it into text your current model understands. *(Powered by the DeepSeek Harness core auto-description path — see [docs/HARNESS_PATCH_EN.md](docs/HARNESS_PATCH_EN.md); this bundle contributes the vision model route and the skill it relies on.)*
- 👁️ **`vision-review`** — analyze images and screenshots, catch UI visual bugs, detect watermarks, turn images into text.
- 🎨 **`media-tools`** — generate illustrations, avatars, backgrounds and banners with a free, watermark-free model.
- 🔀 **Engine failover** — GLM-4V-Flash → SiliconFlow Qwen3-VL → Google Gemini ([AI Studio](https://aistudio.google.com)) → any OpenAI-compatible endpoint, with ModLens-style structured evidence output.

No hardcoded keys, no paid API, no file saving, no session switching.

[Why](#-why) · [Quick start](#-quick-start) · [See it in action](#-see-it-in-action) · [Usage](#-usage) · [Keys & privacy](#-keys--privacy) · [FAQ](#-faq) · [Examples](#-examples)

[**English**](README.md) · [**简体中文**](docs/lang/README_ZH.md) · [**繁體中文**](docs/lang/README_ZH_TW.md) · [**日本語**](docs/lang/README_JA.md) · [**한국어**](docs/lang/README_KO.md) · [**Español**](docs/lang/README_ES.md) · [**Deutsch**](docs/lang/README_DE.md) · [**Português**](docs/lang/README_PT.md) · [**Русский**](docs/lang/README_RU.md)

</div>

---

## 🤔 Why

Most DSH vision plugins only **read** images — and many push you through a shared third-party endpoint. `dsh-media-skills` takes a different stance:

| | This bundle | Typical vision-only plugin |
|---|---|---|
| Read images for free | ✅ Zhipu GLM-4V-Flash | ✅ |
| **Generate** images for free | ✅ SiliconFlow Kolors | ❌ usually absent |
| Auto model route in the picker | ✅ installed automatically | sometimes |
| Keys committed to the repo | ❌ never — keys stay local | ⚠️ often required |
| Docs in multiple languages | ✅ 9 languages | ❌ usually English only |
| Privacy | ✅ you choose the provider; images only go to your provider | shared free endpoints can see your images |

**Why bring your own free key instead of a built-in anonymous endpoint?** Privacy and reliability. Your images go only to the provider you choose, under your account and your rate limits — no shared third-party service in the middle.

## ✨ What you get

| Capability | What it does | Model | Cost |
|---|---|---|---|
| 🖼️ Paste-image reading | In a **text-only** session, paste, drag, or pick (add-image button, restored by the client-ux patches) an image into the composer; it is described by the vision model (GLM-4V-Flash with SiliconFlow Qwen3-VL failover, 15s per route) and handed to the current model as text beside a live thumbnail. *(Harness-core feature on rc.7/rc.8: requires the api-proxy admission patch + the rc.8 client-ux patch — see [docs/HARNESS_PATCH.md](docs/HARNESS_PATCH.md) / [HARNESS_PATCH_EN.md](docs/HARNESS_PATCH_EN.md), patch files included for rc.7, rc.8 and v0.1.1-rc.1; this bundle supplies the vision route + skill it depends on)* | GLM-4V-Flash + Qwen3-VL | Free |
| 🧠 Vision model route | 「智谱 GLM-4V-Flash（视觉）」 appears in the model selector automatically — pick it for a new conversation and talk about images directly | Zhipu GLM-4V-Flash | Free |
| 👁️ `vision-review` | Analyze / recognize / describe images & screenshots; catch UI visual bugs (overlap, overflow, misalignment); detect watermarks/logos; turn images into text. Optional `--structured` mode returns ModLens-style evidence JSON (summary, full OCR, reading-order layout, entities/relations, uncertainty). Engine failover chain: GLM-4V-Flash → SiliconFlow Qwen3-VL / Google Gemini (auto-join with free keys) → any OpenAI-compatible endpoint | GLM-4V-Flash + Qwen3-VL + Gemini | Free |
| 🎨 `media-tools` | Generate images, illustrations, avatars, backgrounds, banners | SiliconFlow Kolors | Free, no watermark |

## ⚡ Quick start

```sh
dsh plugin --profile <name> add github:MJorgin/dsh-media-skills
```

1. **Get two free keys** (~2 minutes, no payment):
   - Zhipu — [open.bigmodel.cn](https://open.bigmodel.cn) → **API Keys** (`glm-4v-flash` is free)
   - SiliconFlow — [siliconflow.cn](https://siliconflow.cn) → **API Keys** (Kolors is free)
   - *(optional third)* Google Gemini — [aistudio.google.com](https://aistudio.google.com) → **Get API key**; joins the vision failover chain automatically
2. **Add them** in the Web GUI (**Settings → Models** → the zhipu-vision provider's **API Key** field), or use the credentials file:

   ```sh
   # ~/.dsh/.credentials.yaml (chmod 600)
   GLM_API_KEY: <your key>
   ```

3. **Restart** `dsh web`, then hard-refresh (`Cmd+Shift+R`).

Verify: the model selector shows **智谱 GLM-4V-Flash（视觉）**. If your Harness build supports paste-image reading, the input bar also has a 📎 **Add image** button — paste an image in any session and it arrives as a text description.

Full walkthrough and troubleshooting: [docs/SETUP_VISION_EN.md](docs/SETUP_VISION_EN.md).

## 📸 See it in action

*Paste an image in a text-only session → the free vision model describes it → your model answers. The same bundle also generates new images on demand.*

<img src="docs/screenshots/demo-paste.png" alt="Demo: paste an image into a text-only DeepSeek Harness session, the vision model reads it, and the model answers; the same bundle can also generate images" width="100%">

*How it works in one picture:*

<img src="docs/screenshots/how-it-works.png" alt="How paste-image reading works: paste → vision model describes → text description arrives at the current model" width="100%">


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

## 🔑 Keys & privacy

Keys are **never stored in this repo**. Skill scripts read, in order: environment variables → `~/.dsh/secrets/media-tools.env` → `~/.codex/secrets/media-tools.env` (legacy fallback). The vision model route reads `GLM_API_KEY` from DSH's credential store.

Where to get the keys (all free): Zhipu — [open.bigmodel.cn](https://open.bigmodel.cn) → API Keys (glm-4v-flash). SiliconFlow — [siliconflow.cn](https://siliconflow.cn) → API Keys (Kolors). Google (optional, joins the vision failover chain automatically) — [aistudio.google.com](https://aistudio.google.com) → Get API key.

```sh
# ~/.dsh/secrets/media-tools.env (chmod 600, one KEY=value per line)
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
GEMINI_API_KEY=...   # optional
```

Your images are sent only to the provider you configure — never to this repo, never to a shared anonymous endpoint.

> Privacy note on Gemini: Google's free-tier key comes with data-use terms — requests may be used to improve Google products. For sensitive images (IDs, internal docs, customer data), prefer the direct domestic engines (Zhipu / SiliconFlow).

## ❓ FAQ

**Does paste-image reading require a DeepSeek Harness core patch?**
The auto-describe pipeline lives in the Harness **core** (`api-proxy` image-admission logic; see [docs/HARNESS_PATCH_EN.md](docs/HARNESS_PATCH_EN.md)). This bundle ships the **model route + skills**: the vision model works on any DSH build, but paste-image reading requires a Harness build with that core support — see FAQ Q1 in [docs/SETUP_VISION_EN.md](docs/SETUP_VISION_EN.md).

**Why not just use a built-in free endpoint with no key at all?**
We prefer to let you own the route: your images go to the provider you pick, under your rate limits, with no shared middleman. The keys are free and take about two minutes to create.

**Is `media-tools` really free?**
Yes — SiliconFlow Kolors is free and watermark-free. If a model is temporarily disabled, the skill lists available models and you can switch.

## 🎁 Examples

Sample material to try instantly — 6 AI-generated images with their prompts, plus a purpose-built vision test card (title, buttons, bar-chart values) for checking reading accuracy:

<img src="examples/generated/fox-forest.jpg" width="30%"> <img src="examples/generated/cat-astronaut.jpg" width="30%"> <img src="examples/vision-test-card.png" width="30%">

→ [examples/README.md](examples/README.md)

## 🗺️ Layout

```
dsh-media-skills/
├── package.json           # dsh.bundle manifest
├── cordis.patch.yml       # plugin layer
├── index.js               # registers skills + seeds the zhipu-vision model route
├── skills/
│   ├── vision-review/     # image reading
│   └── media-tools/       # image generation
├── examples/              # sample images + vision test card
├── docs/
│   ├── screenshots/       # demo mockup & how-it-works diagram
│   ├── SETUP_VISION_EN.md # detailed setup guide (English)
│   ├── SETUP_VISION.md    # 详细配置指南（中文）
│   ├── HARNESS_PATCH_EN.md# core patch notes (English)
│   ├── HARNESS_PATCH.md   # 本体补丁说明（中文）
│   ├── COMPARE_MODLENS.md # 与 ModLens 的对比/共存（中文）
│   └── lang/              # READMEs in 9 languages
├── scripts/make-banner.py # regenerates docs/social-preview.png
└── docs/social-preview.png
```

## 🧩 Using ModLens alongside?

Both this bundle and [ModLens](https://github.com/liustack/modlens) give text-only models vision. Installed together they do not conflict: ModLens intercepts pastes first (path → `modlens_read_image` tool), and this bundle's api-proxy fallback handles anything it doesn't take over. See [docs/COMPARE_MODLENS.md](docs/COMPARE_MODLENS.md) (中文) for the full comparison, the paste routing order, and how to point ModLens at the same free Zhipu endpoint.

## 🤝 Join the DSH plugin ecosystem

DeepSeek Harness developer preview is still in its testing phase for Harness developers; core plugins and base APIs will keep iterating. We look forward to exploring the upper limits of intelligence together with developers worldwide, on top of open-source, open, reusable, and composable infrastructure.

- [dsh-plugin topic](https://github.com/topics/dsh-plugin)
- [Quickstart](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart)
- [DeepSeek Harness repo](https://github.com/deepseek-ai/deepseek-harness)
- [dsh-agent-conductor](https://github.com/MJorgin/dsh-agent-conductor) — 同作者的指挥家：在 DSH 里派活给 11 种外部 agent CLI（Codex / Claude Code / TraeCode…）

> This repo is tagged [`dsh-plugin`](https://github.com/topics/dsh-plugin) and listed in the [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) curated list. PRs, issues and translations are welcome.

## 📄 License

[MIT](LICENSE)
