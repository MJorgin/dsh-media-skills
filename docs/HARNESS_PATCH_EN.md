# Harness core patch notes (paste-image auto-description)

> These notes document the three **DeepSeek Harness core** changes that make paste-image reading work in text-only sessions.
> The `dsh-media-skills` bundle ships only the model route + skills; this core capability is not part of the bundle.
> With it (plus the vision route seeded by the bundle), images pasted in text-only sessions are auto-described as text.
> Without it, the vision model still works manually (new session → pick the vision model), but pasting in a text-only session is rejected at the gate.
>
> [中文版](HARNESS_PATCH.md)

---

## 1. Overview

| # | File | Change |
|---|---|---|
| 1 | `packages/host/apiproxy/src/api-proxy.ts` | Image admission: instant on-screen (durable image block + «reading» placeholder, rendered immediately); the `agent/pre-step` hook transcribes via the vision-route failover chain (GLM → SiliconFlow → …, 15s per route) and appends the description **next to the image block** — the persisted message keeps the thumbnail; all routes failing degrades to a notice text; `selectModel` guard relaxed: described history images may switch back to text-only models (undescribed vision-session images still refuse); the vision-model skip branch clears the «reading» placeholder; `VISION_DESCRIPTION_PROMPT` gains anti-role-play constraints |
| 2 | `packages/llm/llm/src/index.ts` | New image projection at the adapter boundary: models without image input get image blocks stripped (the transcription sibling remains); `inputModalities` resolve once during `prepareCall` and ride the prepared call — no second model lookup |
| 3 | `packages/client/ui-conversation/src/client/skeleton/InputBar.tsx` | Add an «Add image» button (image icon, not a paperclip) + hidden file picker to the composer; image pastes dropped while the machine is busy now raise a toast instead of vanishing silently |
| 4 | `packages/client/ui-conversation/src/client/locales.ts`, `.../image-labels.ts`, `.../chat/MessageItem.tsx` | New strings `input.addImage`, `image.visionDescriptionFailed`, `image.pasteWhileBusy` (zh + en); `MessageItem` hides the transcription marker block when the message renders its thumbnail, showing only «thumbnail + user text» (old image-block-free history still shows its text) |

## 2. Change 1: vision-description admission (api-proxy.ts)

### New constants and helpers

- `VISION_DESCRIPTION_PROMPT`: «Describe the image… answer in the same language as the user message; default to Chinese when there is no text.»
- `VISION_DESCRIPTION_TIMEOUT_MS = 60_000`, `VISION_DESCRIPTION_MAX_TOKENS = 1024`.
- `findVisionRoutes(ctx)`: scans `ctx.llm.listProviders()` and returns every model whose `inputModalities` includes `image`, in registration order; one broken route never hides a healthy one.
- `describeImage(ctx, route, attachment, userText)`: sends image block + user text + prompt as one user message through `ctx.llm.stream`, collecting text with `BlockAssembler`.
- `VISION_DESCRIPTION_MARKER`: regex matching the transcription block `[图片，已由视觉模型读取]…` and its failure forms — the client uses it to hide the block behind the thumbnail, and `selectModel` uses it to allow switching to text-only models.

### prompt admission flow

Before: current model without image input → reject with `MODEL_DOES_NOT_SUPPORT_IMAGES`.
After:

1. Current model supports images → unchanged path (`durablePromptContent`);
2. Otherwise → admission stores the durable image block plus a «reading» placeholder and queues the message immediately (instant thumbnail on screen). The `agent/pre-step` hook then transcribes each image through the vision-route failover chain and **appends** the description next to the image block — the image block stays in the message. All routes failing degrades to a notice text (the image remains in the attachment store).

> **Display vs model content:** the persisted message keeps the original image thumbnail, the transcription text block (marked `[图片，已由视觉模型读取]`), and the user’s own text. The llm layer projects at the adapter boundary — text-only models receive the transcription and never a raw image block; vision models receive both. The client hides the transcription marker block when the thumbnail renders, showing only «thumbnail + user text». Model switching allows described history images; only undescribed vision-session images refuse.

### import changes

- `BlockAssembler` and `LlmModelInfo` (type) join the `@deepseek-ai/dsh-llm` import;
- `randomUUID`, `mkdir`, `stat` join `node:fs/promises`; `dirname` joins `node:path` (the older `writeFile`/`join` imports left with the removed inbox fallback).

## 3. Change 2: «Add image» button (InputBar.tsx)

- import an image/photo icon (e.g. `IconImageOutline16` or the project’s existing image/photo icon; **do not use a paperclip**, which reads as generic file attachment);
- add `fileRef` (`useRef<HTMLInputElement | null>`) and an `onPickImages` callback (collect files → reset input → `intakeImages(files)`, reusing the existing intake checks);
- render an image button next to the commands (+) button in `.tools`: `disabled={addImages === undefined || locked || machineBusy}`, opening `fileRef.current?.click()`;
- add `title={t('input.addImage')}` and `aria-label={t('input.addImage')}` to the image button so the icon-only control is identifiable as “Add image” on hover and to screen readers, and is not mistaken for voice input or generic file upload;
- append a hidden `<input type=file accept=image/png,image/jpeg,image/webp,image/gif multiple hidden onChange={onPickImages} />`.

## 4. Change 3: strings (locales.ts / image-labels.ts)

- `locales.ts` (zh and en dictionaries):
  - `'input.addImage': '添加图片' / 'Add image'`
  - `'image.visionDescriptionFailed': '图片转述失败：视觉模型读取出错，请重试；或把图片保存成文件后让我用 vision-review 读取' / 'Image description failed: …'`
- `image-labels.ts`: add `case 'VISION_DESCRIPTION_FAILED'` to `attachmentErrorText`.

## 5. Build, test, deploy

~~~sh
cd <deepseek-harness checkout>
npm run build        # full: host lib + client lib + web dist (host-only change: npm run build:lib:host)

# tests
npx vitest run packages/host/apiproxy/tests/api-proxy-models.spec.ts packages/host/apiproxy/tests/api-proxy-cold.spec.ts
npx vitest run packages/client/ui-conversation/tests/input-bar.client.spec.tsx packages/client/ui-conversation/tests/image-labels.client.spec.tsx
~~~

Deploy: **fully restart** `dsh web` (a page refresh alone does not load the new backend), then hard-refresh with `Cmd+Shift+R`.

## 6. Dependencies & compatibility

- Requires at least one model route declaring `input: [text, image]` (`dsh-media-skills` seeds zhipu-vision/glm-4v-flash with `contextWindow: 16384` and `maxTokens: 1024`). Note glm-4v-flash's real limits: input + output ≤ 16384, and the API rejects max_tokens > 1024 (error 1210 «max_tokens参数非法：限制数值范围[1,1024]»); seeding maxTokens: 4096 triggers 1210 rather than avoiding it.
- Without a vision route, behavior is identical to the old build (upload rejected) — no impact on existing deployments.
- Vision-model sessions (the model itself accepts images) are untouched and keep the original image path.
- The auto-describe path keeps the image block plus a marked transcription block in history; the llm-layer projection keeps text-only models feedable, and the switch-back guard now allows described images — only direct pastes inside a vision-model session (undescribed) trip it (open a new conversation).

## 7. Upstream submission suggestions

- Suggested title: `feat(web): auto-describe pasted images via a vision-capable model for text-only sessions`
- PR description: problem (text-model pastes rejected at the gate), solution (admission-time vision description + file-save fallback + image button entry + keep thumbnail on screen), behavior matrix (with/without vision route, describe success/failure), tests (the two specs above), docs links.
