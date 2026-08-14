# dsh-media-skills

Free image reading (vision) and image generation skills for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`).

| Skill | What it does | Provider / model | Cost |
|---|---|---|---|
| `vision-review` | Read, analyze, describe images/screenshots; find visual/layout bugs; detect watermarks/logos; extract text from images | Zhipu GLM-4V-Flash | Free |
| `media-tools` | Generate images, illustrations, avatars, backgrounds, banners | SiliconFlow Kolors | Free, no watermark |

Keys are **never** stored in this package. Each script reads, in order: environment variables → `~/.dsh/secrets/media-tools.env` → `~/.codex/secrets/media-tools.env` (legacy fallback).

## Install

```sh
dsh plugin --profile <name> add github:<you>/dsh-media-skills
# or, from a local checkout:
dsh plugin --profile <name> add ./dsh-media-skills
```

Add this repository to the [`dsh-plugin`](https://github.com/topics/dsh-plugin) GitHub topic so others can discover it.

## Configure keys

Create `~/.dsh/secrets/media-tools.env` (`chmod 600`), one `KEY=value` per line:

```sh
GLM_API_KEY=...
SILICONFLOW_API_KEY=...
```

Or export them as environment variables instead.

## Use

Once enabled, the two skills appear in the `dsh` skill catalog. Ask the agent to read an image or generate one; it loads the skill and runs the bundled scripts.

## Layout

```
dsh-media-skills/
├── package.json        # dsh.bundle manifest
├── cordis.patch.yml    # the plugin layer
├── index.js            # registers the skill provider on ctx.skills
└── skills/
    ├── vision-review/
    │   ├── SKILL.md
    │   └── scripts/vision.py
    └── media-tools/
        ├── SKILL.md
        └── scripts/generate.py
```

## License

[MIT](LICENSE)
