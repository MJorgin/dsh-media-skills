# Setup guide for DSH v0.1.6

This guide covers two related but different workflows:

1. **Native DSH multimodal chat**: configure a vision-capable model in DSH and attach images normally.
2. **Skill workflows**: use `vision-review` for scripted QA/OCR and `media-tools` for image generation.

[中文版](SETUP_VISION.md) · [Back to README](../README.md)

## 1. Install the plugin

Use the DSH Plugin Manager:

```text
github:MJorgin/dsh-media-skills
```

Or use the CLI:

```sh
dsh plugin --profile web add github:MJorgin/dsh-media-skills
```

Replace `web` with your DSH profile. Restart the profile after installation.

The plugin registers:

- `vision-review`
- `media-tools`

It does not add or overwrite a model in the DSH model picker.

## 2. Configure a native DSH vision model

Open DSH **Models** settings and configure a provider/model that accepts image input according to that provider's current DSH integration.

Use this path when you want to attach images to a normal conversation and have the selected multimodal model answer directly. DSH v0.1.6 includes modern attachment and file handling; no historical core patch from this repository is required.

Do not copy old `llm-pi-ai` YAML snippets from archived guides unless you are maintaining an old DSH build and know exactly why they are needed.

## 3. Configure skill keys

Skill scripts read environment variables first, then:

```text
~/.dsh/secrets/media-tools.env
~/.codex/secrets/media-tools.env
```

`vision-review` also reads keys from `~/.dsh/.credentials.yaml`, supporting both top-level values and a `refs` mapping.

Example:

```sh
# ~/.dsh/secrets/media-tools.env
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
SENSENOVA_API_KEY=...
GEMINI_API_KEY=...
```

Set file permissions to `600` where possible.

## 4. Verify the engines

After installing the skill, run:

```sh
python3 scripts/vision.py --doctor
```

When invoked through DSH, the skill resource directory is resolved automatically. From a terminal, run the command from the installed `vision-review` skill directory or use its full path.

The doctor reports Pillow, configured keys, candidate model names and endpoint availability.

## 5. Use the skills

Vision QA:

```sh
python3 scripts/vision.py screenshot.png
python3 scripts/vision.py a.png b.png --structured
```

Image generation:

```sh
python3 ../media-tools/scripts/generate.py "grand realistic Chinese palace above clouds" palace.jpg 16:9
```

You can also ask DSH in natural language, for example:

- “Use vision-review to check whether this screenshot has overlapping text.”
- “Generate a banner with media-tools.”

## Troubleshooting

**The plugin is installed but the skills are missing.**
Restart the DSH profile. If you used a manual directory clone instead of plugin installation, make sure each skill directory is directly under a skill root; nested repository directories are not discovered recursively.

**A native image attachment is rejected.**
Check the currently selected model and provider configuration. The skill bundle cannot make a text-only model accept images.

**The skill says a key is missing.**
Add the key to your environment or `~/.dsh/secrets/media-tools.env`. For `vision-review`, keys may also come from `~/.dsh/.credentials.yaml`.

**Gemini cannot connect.**
Some networks require a proxy. Set `GEMINI_PROXY` or `HTTPS_PROXY` in the same environment/secrets context.

**Pillow is missing.**
Install it with:

```sh
python3 -m pip install Pillow
```

## Historical builds

The old patch notes are archived for DSH builds through `v0.1.1-rc.2`:

- [English patch notes](HARNESS_PATCH_EN.md)
- [Chinese patch notes](HARNESS_PATCH.md)

Do not apply those patches to DSH v0.1.6.
