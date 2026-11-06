<div align="center">

<img src="docs/readme-hero.png" alt="dsh-media-skills: image generation and review for DeepSeek Harness" width="100%">

# dsh-media-skills

**An image workspace for DeepSeek Harness.**<br>
Generate images, revisit your work, and ask your agent to review a screenshot.

[简体中文](docs/lang/README_ZH.md) · [Quick start](#quick-start) · [Image review](#image-review) · [Privacy](#privacy--providers) · [Troubleshooting](#troubleshooting)

[![npm](https://img.shields.io/npm/v/dsh-media-skills?label=npm)](https://www.npmjs.com/package/dsh-media-skills)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

</div>

## One plugin, three ways to work

| What you want | Where to start | What it needs |
| --- | --- | --- |
| Generate an image | **Images → Generate** in the sidebar | Desktop 0.2.1+; a provider. Flux via Pollinations is configured as keyless. |
| Find or reuse a result | **Images → Works** | The page stores up to 60 recent entries in local storage |
| Describe or inspect an image | Ask for `vision-review`, or use a compatible image model in chat | A configured vision provider for the skill, or an image-capable chat model for native attachments |

The sidebar page and `media-tools` use the same [generation script](skills/media-tools/scripts/generate.py). `vision-review` is a separate [image review skill](skills/vision-review/SKILL.md).

## Quick start

1. In DeepSeek Harness Desktop, open **Plugins → Add plugin**, enter `dsh-media-skills`, and install it. Or use the desktop profile:

   ```sh
   dsh plugin --profile desktop add dsh-media-skills
   ```

2. Restart DSH. On Desktop 0.2.1+, open **Images** in the sidebar.
3. Enter a prompt, select **Flux** (Pollinations), and generate. This path does not require a key; availability, image size and rate limits depend on the provider.
4. Open **Works** to revisit a result. To use another provider, configure it under **Image key**.

The two skills are registered with the plugin. Image review through `vision-review` requires a configured vision provider; a keyless image-generation option does **not** automatically supply image understanding.

> **First run:** this repository does not control third-party availability or pricing. If Flux is unavailable, check the provider status or configure another supported provider.

## The Images page

<img src="docs/screenshots/panel-generate.png" alt="Illustrative layout of the image generation page" width="100%">

*Interface illustration. The sample picture is a placeholder, not a generated result; the actual page and available models can differ.*

Choose a prompt, model, aspect ratio and canvas size. The result card shows the image and its settings. The page also has a **Works** tab for revisiting images, copying prompts, reusing settings and deleting files.

<img src="docs/screenshots/panel-works.png" alt="Illustrative layout of the Works gallery and selected image details" width="100%">

*Gallery illustration with placeholder images.*

**Generated examples** from the repository. Prompts and provider details: [examples](examples/README.md).

<img src="examples/generated/fox-forest.jpg" alt="Watercolor fox in an autumn forest" width="40%"> <img src="examples/generated/cat-astronaut.jpg" alt="Cat wearing an astronaut helmet" width="40%">

## Image review

Ask the agent to use `vision-review` to describe a local image, inspect a UI screenshot, or produce structured observations. The script supports configured vision providers and a fallback chain; see [vision-review/SKILL.md](skills/vision-review/SKILL.md).

Native chat attachments are a separate DSH feature: the **currently selected model must accept image input**. If a text-only model rejects an attachment, switch to an image-capable model or use a local file path with a configured vision-review provider. Installing this plugin does not turn a text-only model into a vision model.

## Privacy & providers

- The plugin does not bundle API keys. Panel-managed keys are stored locally in `~/.dsh/secrets/media-tools.env`; the code requests file mode `600` where supported.
- The prompt and relevant request parameters go to the provider you select. Image review sends the image to the configured vision provider. Custom endpoints are chosen by you.
- Generated files are saved in the local workspace. The page keeps up to 60 recent entries in local storage. Deleting an entry attempts to delete its file; if file deletion fails, the entry is still removed and the file can remain. Provider data-handling rules still apply.
- Free tiers, limits, watermarks, models and terms can change. Consult the provider before sending sensitive content or depending on a free service.

Details: [generation skill](skills/media-tools/SKILL.md) · [vision setup](docs/SETUP_VISION_EN.md) · [ModLens coexistence](docs/COMPARE_MODLENS.md).

## Troubleshooting

- **No Images page:** the page requires Desktop 0.2.1+ and a restart after installation. The skills can be used separately on supported older hosts; see [compatibility notes](docs/DESKTOP_0.2.md).
- **Generation fails:** check the selected provider, network, account balance and rate limits. The panel reports common HTTP errors where available.
- **An image attachment is rejected:** verify the current chat model supports image input, or use the file-path review workflow with a configured vision provider.
- **Need a diagnostic for image review:** run `python3 skills/vision-review/scripts/vision.py --doctor` from the repository. Some checks may contact configured providers.

## Languages

**English** · [简体中文](docs/lang/README_ZH.md) · [繁體中文](docs/lang/README_ZH_TW.md) · [日本語](docs/lang/README_JA.md) · [한국어](docs/lang/README_KO.md) · [Español](docs/lang/README_ES.md) · [Deutsch](docs/lang/README_DE.md) · [Português](docs/lang/README_PT.md) · [Русский](docs/lang/README_RU.md)

English and Simplified Chinese describe the current Images page. Other translations are retained for reference and may describe earlier versions.

## Development

Requires Node.js 22.19+ and Python 3.9+; image review uses Pillow. Run the repository checks with:

```sh
npm test
```

The package contains `client.js`, `index.js`, the DSH bundle manifest and the two skill directories. [Examples](examples/README.md) · [Issues](https://github.com/MJorgin/dsh-media-skills/issues) · [MIT license](LICENSE)
