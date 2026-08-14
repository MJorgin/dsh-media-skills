# Vision Model Setup Guide (paste images, read them, free)

> This is the detailed install & configuration guide for `dsh-media-skills`. After setup, your DeepSeek Harness gains a **free vision model** — 「智谱 GLM-4V-Flash（视觉）」 — in the model selector, and (on Harness builds with paste-image support) images pasted into a **text-only** session (e.g. deepseek-v4-pro) are **auto-described as text** — no file saving, no session switching.
>
> For a quick start see the [README](../README.md). For troubleshooting jump to the [FAQ](#6-faq) below.
>
> [**中文版（简体中文）**](SETUP_VISION.md)

---

## Table of contents

1. [What you get](#1-what-you-get)
2. [Prerequisites](#2-prerequisites)
3. [Install & configure (4 steps)](#3-install--configure-4-steps)
4. [Three ways to read images](#4-three-ways-to-read-images)
5. [How it works](#5-how-it-works)
6. [FAQ](#6-faq)
7. [Key files](#7-key-files)

---

## 1. What you get

After install and restart:

| Capability | What it does | Cost |
|---|---|---|
| 🧠 Vision model route | 「智谱 GLM-4V-Flash（视觉）」appears in the model selector; new conversations can use it as their model | Free |
| 📎 Paste-image reading | In a **text-only** session, the input bar gains an "Add image" button (paperclip); pasted images are auto-described by the vision model and delivered to the current model as text | Free |
| 👁️ `vision-review` skill | Lets the agent read local image files and run visual checks | Free |
| 🎨 `media-tools` skill | Free image generation | Free |

> ⚠️ Honest note: paste-image reading is a **DeepSeek Harness core** capability (the image-admission logic in `api-proxy`). This bundle ships the **model route + skills**; the vision model works on any DSH build, but the auto-describe convenience requires a Harness build that includes that core support. How to tell: FAQ Q1.

## 2. Prerequisites

- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) installed and able to run `dsh web` (default port 3080).
- A **Zhipu API key** (GLM series; the free tier is enough). Get one at [open.bigmodel.cn](https://open.bigmodel.cn) → API Keys → create.
- The key is never written into this repo; it lives only in your DSH credential store as `GLM_API_KEY`.

## 3. Install & configure (4 steps)

### Step 1 — Install the bundle

```sh
dsh plugin --profile <name> add github:akqwpeter-prog/dsh-media-skills
```

> Upgrading an existing install: `dsh plugin --profile <name> update dsh-media-skills`
>
> You can also skip the bundle: drop the folders under `skills/` into any skill root (`~/.dsh/skills/` or a project's `.dsh/skills/`). You only get the two skills that way — the vision model route is **not** seeded; configure it manually (see section 7).

### Step 2 — Supply GLM_API_KEY (either way)

**Option A (recommended): the Web GUI**

Open `http://127.0.0.1:3080` → **Settings → Models** → find the zhipu-vision provider → fill its **API Key** field with your Zhipu key → save.

**Option B: the credentials file**

```sh
# ~/.dsh/.credentials.yaml (chmod 600)
GLM_API_KEY: <your zhipu key>
```

> Both options write the same store. **Never** put the key into `settings.yaml`, this repo, or any skill file.

### Step 3 — Restart DSH

After installing and setting the key, **fully restart** `dsh web` (stop the old process, then start it again — a page refresh alone is not enough):

```sh
# stop the running dsh web (Ctrl+C, or kill the process listening on 3080)
lsof -i :3080          # find the PID
kill <PID>

# start again
dsh web
```

> The model route hot-loads after installation, so a restart is not always strictly required — but credentials, caches and frontend assets are most reliable after one. Just restart once.

### Step 4 — Verify

1. Hard-refresh the page (`Cmd+Shift+R`).
2. Open the **model selector** (Models page / top model menu): 「智谱 GLM-4V-Flash（视觉）」 should be listed.
3. If your Harness build supports paste-image reading, any session's input bar shows a 📎 **Add image** button.
4. Send an image: in a text-only session it arrives as "[image «xxx.png», read by the vision model] + text description", and the model answers from the description.

Done.

## 4. Three ways to read images

| Way | How | When |
|---|---|---|
| **A. Paste directly (recommended)** | In any session, click the 📎 button / drag / paste an image and send | Everyday image questions — no file saving, no model switching |
| **B. Vision model session** | New conversation, pick 智谱 GLM-4V-Flash（视觉）, paste images and chat | Multi-turn image conversations, native `read_image` |
| **C. Files + skill** | Put the image in the workspace and say "read this image with vision-review" | Batch review, scripted workflows |

Description language follows your message language (Chinese message → Chinese description; English message → English description; no text → Chinese).

## 5. How it works

For way A, one paste goes through:

1. You paste an image in a text-only session and send it;
2. DSH sees the current model cannot read images → looks up the registered vision route (`zhipu-vision / glm-4v-flash`, seeded by this bundle);
3. The vision model reads the image and writes a text description in the language of your message;
4. The image is **replaced** by that description before reaching your current model — so even a text-only model "sees" it;
5. Because the history contains only text, the session can switch between text and vision models at any time — the "session contains images, cannot switch" guard never triggers.

**Failure fallback**: if step 3 fails, the image is saved to `.dsh/scratch/inbox/` inside the workspace, the message becomes an instruction, and the agent reads the file with the `vision-review` skill automatically — no action needed from you.

## 6. FAQ

### Q1: Pasting an image says "The current model does not support images; switch to a model that does"

Two possibilities:

- **The selector has no 智谱 GLM-4V-Flash（视觉）**: the vision route did not register. Check the bundle is in the profile (`dsh plugin --profile <name> list`), the key is set, then fully restart DSH.
- **The vision model exists but uploads are still rejected**: your Harness core build predates the paste-image support. The vision model still works manually (way B); only the text-session paste path is blocked.

### Q2: The vision model returns 400 / `1210` / "inputs tokens + max_new_tokens must be <= 16384"

GLM-4V-Flash's total context is **16384** (input + output). The seeded model config already carries `contextWindow: 16384` and `maxTokens: 4096`, which triggers DSH's history compaction. If it still fails:

- You probably pasted into a session with a very long history — try a **new conversation**;
- Confirm `~/.dsh/settings.yaml`'s zhipu-vision entry carries `contextWindow: 16384` (see section 7).

### Q3: After pasting images in a session, I can't switch back to a text-only model?

That is DSH's guard: a session whose history contains **image blocks** cannot switch to a model without image input. Paste-image reading (way A) produces **no image blocks**, so it never triggers this — only way B (pasting inside a vision-model session) locks history to vision models. In that case, just **open a new conversation**.

### Q4: The message says "image … could not be auto-described, saved to …"?

The auto-description failed and the fallback path ran. Wait for the agent to read the file with `vision-review`; if it doesn't, just say "read the image in .dsh/scratch/inbox/ with vision-review".

### Q5: How do I remove the vision model config?

Delete the whole `llm-pi-ai.providers.zhipu-vision` entry from `~/.dsh/settings.yaml` and restart DSH. To uninstall the bundle itself: `dsh plugin --profile <name> remove dsh-media-skills`.

## 7. Key files

After installation the bundle seeds this configuration (equivalent to writing it by hand):

```yaml
# auto-added to ~/.dsh/settings.yaml
llm-pi-ai:
  providers:
    zhipu-vision:
      apiKeyEnv: GLM_API_KEY
      displayName: 智谱 GLM-4V-Flash（视觉）
      api: openai-completions
      baseURL: https://open.bigmodel.cn/api/paas/v4
      models:
        - id: glm-4v-flash
          input: [ text, image ]
          contextWindow: 16384
          maxTokens: 4096
```

- Credentials: `~/.dsh/.credentials.yaml` (key only, chmod 600)
- Skill scripts read the key from: environment variables → `~/.dsh/secrets/media-tools.env` → `~/.codex/secrets/media-tools.env`
- Fallback images land at `<workspace>/.dsh/scratch/inbox/`
- Seeding happens only when no `zhipu-vision` config exists — it never overwrites your edits

---

Created by [@akqwpeter-prog](https://github.com/akqwpeter-prog) · Powered by [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)
