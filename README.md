<div align="center">

<img src="docs/social-preview.png" alt="dsh-media-skills — free image reading & generation for DeepSeek Harness" width="100%">

<br>

# 🎨 dsh-media-skills

### *Give DeepSeek Harness reusable image-review and image-generation skills — verified with desktop 0.2.0-rc.2.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Python 3.9+](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://python.org)
[![DeepSeek Harness](https://img.shields.io/badge/DeepSeek%20Harness-Skill-4D6BFE)](https://github.com/topics/dsh-plugin)
[![Free vision](https://img.shields.io/badge/vision-GLM%2BDeepSeek%2BGemini-2EA44F)](docs/SETUP_VISION_EN.md)
[![Free generation](https://img.shields.io/badge/generation-SenseNova%2BKolors-2EA44F)](docs/FREE_VISION_PROVIDERS_EN.md)
[![No hardcoded keys](https://img.shields.io/badge/keys-never%20in%20repo-8B5CF6)](README.md#-keys--privacy)
[![Docs](https://img.shields.io/badge/docs-9%20languages-4D6BFE)](docs/lang/README_ZH.md)
[![Harness](https://img.shields.io/badge/Harness-0.2.0%20verified%20%7C%200.2.1--alpha%20source%20checked-4D6BFE)](docs/DESKTOP_0.2.md)

<br>

DeepSeek Harness is brilliant at reasoning, but image input depends on the active model's modalities. This bundle contributes **two runtime skills** plus a **bring-your-own-key vision failover chain**, runtime-verified against desktop **0.2.0-rc.2**, with the latest tag **dsh-v0.2.1-alpha.2** source-checked for the same skill contract:

- 📎 **Native image attachments** — on desktop 0.2 / v0.1.6+, paste, drag, or pick an image when the **current model supports images** (the default `deepseek-flash` does). Text-only routes reject image admission instead of using the old auto-transcription hook.
- 👁️ **`vision-review`** — analyze images and screenshots, catch UI visual bugs, detect watermarks, turn images into text.
- 🎨 **`media-tools`** — generate illustrations, avatars, backgrounds and banners with a free, watermark-free model.
- 🔀 **Engine failover** — GLM-4V-Flash (free) → **DeepSeek-V4-Flash-Vision-Exp** (same key as your agent, higher quality) → SiliconFlow Qwen3-VL → SenseNova → Google Gemini ([AI Studio](https://aistudio.google.com)) → any OpenAI-compatible endpoint, with ModLens-style structured evidence output.

No hardcoded keys, no core patches, and no hidden settings writes on desktop 0.2; generated files are saved only where the skill is asked to write them.

[Why](#-why) · [Quick start](#-quick-start) · [See it in action](#-see-it-in-action) · [Usage](#-usage) · [Keys & privacy](#-keys--privacy) · [FAQ](#-faq) · [Examples](#-examples)

[**English**](README.md) · [**简体中文**](docs/lang/README_ZH.md) · [**繁體中文**](docs/lang/README_ZH_TW.md) · [**日本語**](docs/lang/README_JA.md) · [**한국어**](docs/lang/README_KO.md) · [**Español**](docs/lang/README_ES.md) · [**Deutsch**](docs/lang/README_DE.md) · [**Português**](docs/lang/README_PT.md) · [**Русский**](docs/lang/README_RU.md)

</div>

---

## 🤔 Why

Most DSH vision plugins only **read** images — and many push you through a shared third-party endpoint. `dsh-media-skills` takes a different stance:

| | This bundle | Typical vision-only plugin |
|---|---|---|
| Read images | ✅ Desktop 0.2 uses the selected image-capable route; `vision-review` adds GLM-4V-Flash and optional provider failover for scripted QA | ✅ |
| **Generate** images for free | ✅ SenseNova U1 Fast → SiliconFlow Kolors | ❌ usually absent |
| Model-route management | ✅ Never writes settings on desktop 0.2 / v0.1.6+ — choose routes in **Settings → Models**; old auto-seeding only exists in historical builds | sometimes |
| Keys committed to the repo | ❌ never — keys stay local | ⚠️ often required |
| Docs in multiple languages | ✅ 9 languages | ❌ usually English only |
| Privacy | ✅ you choose the provider; images only go to your provider | shared free endpoints can see your images |

**Why bring your own free key instead of a built-in anonymous endpoint?** Privacy and reliability. Your images go only to the provider you choose, under your account and your rate limits — no shared third-party service in the middle.

**New-version adaptation**:

| DSH build | Status |
|---|---|
| Desktop **0.2.0-rc.2** | **Runtime verified.** Standard runtime plugin; both skills register through `ctx.skills.registerProvider()`. Native attachments are admitted only when the active model advertises `inputModalities: ["text", "image"]`; the default `deepseek-flash` route does. No core patches or settings writes. |
| Tag **dsh-v0.2.1-alpha.2** | **Source checked.** `@deepseek-ai/dsh-skill@0.2.1-alpha.2` keeps the same provider factory, array/`{candidates, complete}` observation, candidate fields, and image-admission behavior. No alpha desktop build was available locally for a full boot test. |
| **v0.1.6** | Same supported provider lifecycle. Configure optional GLM/SiliconFlow/SenseNova/Gemini routes yourself in **Settings → Models**. |
| v0.1.1 and older preview builds | Historical behavior/docs only. Do not apply the old core patches to signed desktop 0.2 builds. |

See [Desktop 0.2 compatibility notes](docs/DESKTOP_0.2.md) for the exact verification checklist and the `MODEL_DOES_NOT_SUPPORT_IMAGES` behavior.

## ✨ What you get

| Capability | What it does on desktop 0.2 | Model / engine | Cost |
|---|---|---|---|
| 🖼️ Native image attachment | Paste, drag, or use the attachment button while an image-capable route is selected. DSH checks the active model's `inputModalities`; text-only routes return `MODEL_DOES_NOT_SUPPORT_IMAGES` instead of invoking the old auto-transcription pipeline. | Default `deepseek-flash`, or a vision route you configure | Subject to the selected provider |
| 👁️ `vision-review` | Analyze / recognize / describe local image files and screenshots, catch UI visual bugs (overlap, overflow, misalignment), detect watermarks/logos, OCR, or emit structured JSON evidence. Optional failover chain: GLM-4V-Flash → DeepSeek vision → SiliconFlow Qwen3-VL → SenseNova → Google Gemini → custom OpenAI-compatible endpoints. | GLM-4V-Flash + optional DeepSeek/Qwen/SenseNova/Gemini | GLM/SiliconFlow free tiers; other providers optional |
| 🎨 `media-tools` | Generate images, illustrations, avatars, backgrounds, and banners to an explicit output path. | SenseNova U1 Fast → SiliconFlow Kolors | Provider free tier/terms; no bundled key |
| 🖼️ **创作 panel** | A sidebar page next to your conversations: prompt box, model and ratio pickers, 1K–4K canvas, gallery, and a key page that writes the secrets file for you. Desktop 0.2.1+. | Every configured image provider, one row per model | Provider free tier/terms |

## 🖼️ The 创作 panel

Desktop 0.2.1+ lets plugins register their own pages, so this bundle ships one — click **创作** in the sidebar:

- **生成** — type a prompt, then pick the model (`Kolors`, `Qwen-Image`, `Z-Image Turbo`, `SenseNova U1 Fast`, or whatever your own endpoint exposes), the canvas ratio (智能 / 1:1 / 9:16 / 16:9 / 3:4 / 4:3 / 2:3 / 3:2 / 9:21 / 21:9) and a 1K–4K long edge. Tiers above a model's own ceiling are greyed out instead of being silently ignored. The result lands on the right as one proof card — frame number, model and size, and what you can do with it.
- **作品** — everything generated in this workspace as a contact sheet: frame numbers, the spec line, and a detail card for the selected picture with its full prompt. From there you can reuse the settings, copy the prompt, open the original, or delete it (the file goes too).
- **生图 Key** — paste a key per provider. It is written to `~/.dsh/secrets/media-tools.env` (mode 600), never leaves the machine, and is not used for anything but generation. Any OpenAI-compatible endpoint can be added as a custom provider, key optional.
- **No key at all?** Pick **Pollinations** — it needs no signup and no key (one image per IP every 45 seconds, up to 768×768, small logo in the corner). Cloudflare Workers AI is the better free option: 10,000 neurons a day is roughly 170 flux-1-schnell images.

The panel and the `media-tools` skill call the same `scripts/generate.py`, so the model you pick in the panel is exactly the one the skill uses.

## ⚡ Quick start

Install from the DSH **Plugin Manager** (`dsh-media-skills`) or the CLI:

```sh
dsh plugin --profile <name> add dsh-media-skills
```

Or straight from GitHub: `dsh plugin --profile <name> add github:MJorgin/dsh-media-skills`.

1. **Keys**:
   - **Desktop 0.2 / v0.1.6+**: no keys are needed to install — the two skills register at runtime. The default `deepseek-flash` route supports native image chat. Skill keys (`GLM_API_KEY`, `SILICONFLOW_API_KEY`, optional `GEMINI_API_KEY`) go in `~/.dsh/secrets/media-tools.env`; extra model routes are configured in **Settings → Models**.
   - **v0.1.1-rc.1+**: zero extra keys — paste reading and the vision route run on your agent's existing `DEEPSEEK_API_KEY` (DeepSeek-V4-Flash-Vision-Exp).
   - **rc.7 / rc.8** (or to add the free engines): Zhipu — [open.bigmodel.cn](https://open.bigmodel.cn) → **API Keys** (`glm-4v-flash` is free); SiliconFlow — [siliconflow.cn](https://siliconflow.cn) → **API Keys** (Kolors is free); *(optional)* Google Gemini — [aistudio.google.com](https://aistudio.google.com) → **Get API key**; joins the vision failover chain automatically
2. **Add them** in the Web GUI (**Settings → Models**), or use the credentials file:

   ```sh
   # ~/.dsh/.credentials.yaml (chmod 600)
   GLM_API_KEY: <your key>
   ```

3. **Restart** DSH (or the desktop app), then hard-refresh an open browser tab (`Cmd+Shift+R`).

Verify: the skills **`vision-review`** and **`media-tools`** show up in the skill list. On desktop 0.2, also select an image-capable route such as the default **`deepseek-flash`** before sending a native attachment; a text-only route returns `MODEL_DOES_NOT_SUPPORT_IMAGES`.

Full walkthrough and troubleshooting: [docs/SETUP_VISION_EN.md](docs/SETUP_VISION_EN.md).

## 📸 See it in action

*Send an image to an image-capable DSH route, or pass a file path to `vision-review` for scripted QA. The same bundle also generates new images on demand.*

<img src="docs/screenshots/demo-paste.png" alt="Historical image-review demo; desktop 0.2 requires an image-capable route or a file-path skill invocation" width="100%">

*How it works in one picture:*

<img src="docs/screenshots/how-it-works.png" alt="Historical diagram of image transcription in older DSH preview builds" width="100%">


## 🚀 Usage

Three ways to read images:

| Way | How | When |
|---|---|---|
| **A. Native attachment (recommended)** | Select an image-capable route (default `deepseek-flash`), then click the attachment button / drag / paste an image and send | Everyday multi-modal image questions |
| **B. Image-capable model session** | New conversation, pick `deepseek-flash` or a configured GLM/Qwen/SenseNova vision route, then paste images and chat | Multi-turn native image conversations |
| **C. Files + skill** | Put the image in the workspace and say “read this image with vision-review”, or call `scripts/vision.py` with a path | Batch review, structured OCR/QA, and text-only routes |

Native attachments are sent directly to the selected image-capable model. For `vision-review`, set the desired language or output format in the prompt (or use `--structured`).

Also just say:

- “Look at this image / check this screenshot for visual bugs” → `vision-review`
- “Generate an image of …” → `media-tools`

## 🔑 Keys & privacy

Keys are **never stored in this repo**. Skill scripts read, in order: environment variables → `~/.dsh/secrets/media-tools.env` → `~/.codex/secrets/media-tools.env` (legacy fallback). The vision model route reads `GLM_API_KEY` from DSH's credential store (≤ v0.1.1; on v0.1.6 routes are yours to configure in **Settings → Models**).

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

**Does desktop 0.2 need a core patch?**
No. Desktop **0.2.0-rc.2** loads this bundle through the standard runtime plugin/provider lifecycle, and image admission is based on the active model's `inputModalities`. Do not patch the signed `app.asar`; old alpha/rc patches are historical only. If a text-only route is selected, DSH returns `MODEL_DOES_NOT_SUPPORT_IMAGES`; choose an image-capable route or invoke `vision-review` with a file path.

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
├── index.js               # registers the two skills via the DSH v0.1.6 provider lifecycle
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

This bundle and [ModLens](https://github.com/liustack/modlens) can be installed together, but desktop 0.2 does **not** provide the old api-proxy auto-transcription fallback. Choose one paste behavior deliberately: keep ModLens paste-to-path interception for file-path tool workflows, or set `pasteToPath: false` so DSH uses native image attachments with an image-capable route. See [docs/COMPARE_MODLENS.md](docs/COMPARE_MODLENS.md) (中文) for the historical comparison and configuration.

## 🤝 Join the DSH plugin ecosystem

DeepSeek Harness developer preview is still in its testing phase for Harness developers; core plugins and base APIs will keep iterating. We look forward to exploring the upper limits of intelligence together with developers worldwide, on top of open-source, open, reusable, and composable infrastructure.

- [dsh-plugin topic](https://github.com/topics/dsh-plugin)
- [Quickstart](https://deepseek-harness.github.io/deepseek-harness/guide/quickstart)
- [DeepSeek Harness repo](https://github.com/deepseek-ai/deepseek-harness)
- [dsh-agent-conductor](https://github.com/MJorgin/dsh-agent-conductor) — 同作者的指挥家：在 DSH 里派活给 11 种外部 agent CLI（Codex / Claude Code / TraeCode…）

> This repo is tagged [`dsh-plugin`](https://github.com/topics/dsh-plugin) and listed in the [awesome-dsh-plugin](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) curated list. PRs, issues and translations are welcome.

## 📄 License

[MIT](LICENSE)