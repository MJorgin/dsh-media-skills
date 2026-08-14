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
| 1 | `packages/host/apiproxy/src/api-proxy.ts` | Image admission: when the current model cannot read images, auto-describe via a vision-capable model and replace the image with text; on failure, save the file and hand the agent a pointer |
| 2 | `packages/client/ui-conversation/src/client/skeleton/InputBar.tsx` | Add an «Add image» button (paperclip) + hidden file picker to the composer |
| 3 | `packages/client/ui-conversation/src/client/locales.ts`, `.../image-labels.ts` | New strings `input.addImage` and `image.visionDescriptionFailed` (zh + en) |

## 2. Change 1: vision-description admission (api-proxy.ts)

### New constants and helpers

- `VISION_DESCRIPTION_PROMPT`: «Describe the image… answer in the same language as the user message; default to Chinese when there is no text.»
- `VISION_DESCRIPTION_TIMEOUT_MS = 60_000`, `VISION_DESCRIPTION_MAX_TOKENS = 1024`.
- `findVisionRoute(ctx)`: scans `ctx.llm.listProviders()` and returns the first model whose `inputModalities` includes `image`; one broken route never hides a healthy one.
- `describeImage(ctx, route, attachment, userText)`: sends image block + user text + prompt as one user message through `ctx.llm.stream`, collecting text with `BlockAssembler`.
- `describeImagesForTextModel(ctx, content, route, cwd)`: validates and durably stores via `durablePromptContent` first, then describes each image; when one call fails (and `cwd` is available) it saves the image into the workspace under `.dsh/scratch/inbox/` and replaces that part with a «read it with vision-review» pointer.
- `saveImageFallback(part, cwd)` / `imageExtension(mediaType)`: sanitized filenames (CJK preserved), exclusive `wx` writes, auto-suffixed on collision.

### prompt admission flow

Before: current model without image input → reject with `MODEL_DOES_NOT_SUPPORT_IMAGES`.
After:

1. Current model supports images → unchanged path (`durablePromptContent`);
2. Otherwise → `findVisionRoute`:
   - no vision route → keep the old rejection (`MODEL_DOES_NOT_SUPPORT_IMAGES`);
   - route found → `describeImagesForTextModel` yields a text-only message; on failure (`undefined`) reject with the new code `VISION_DESCRIPTION_FAILED` (client copy included).

### import changes

- `BlockAssembler` and `LlmModelInfo` (type) join the `@deepseek-ai/dsh-llm` import;
- `writeFile` joins `node:fs/promises`, `join` joins `node:path`.

## 3. Change 2: «Add image» button (InputBar.tsx)

- import `IconPaperclipOutline16`;
- add `fileRef` (`useRef<HTMLInputElement | null>`) and an `onPickImages` callback (collect files → reset input → `intakeImages(files)`, reusing the existing intake checks);
- render a paperclip button next to the commands (+) button in `.tools`: `disabled={addImages === undefined || locked || machineBusy}`, opening `fileRef.current?.click()`;
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

- Requires at least one model route declaring `input: [text, image]` (`dsh-media-skills` seeds zhipu-vision/glm-4v-flash with `contextWindow: 16384` and `maxTokens: 4096` to avoid Zhipu's 1210 context errors).
- Without a vision route, behavior is identical to the old build (upload rejected) — no impact on existing deployments.
- Vision-model sessions (the model itself accepts images) are untouched and keep the original image path.
- The auto-describe path produces no image blocks → history stays switchable between models; only direct pastes inside a vision-model session trip the switch-back guard (open a new conversation).

## 7. Upstream submission suggestions

- Suggested title: `feat(web): auto-describe pasted images via a vision-capable model for text-only sessions`
- PR description: problem (text-model pastes rejected at the gate), solution (admission-time vision description + file-save fallback + paperclip entry), behavior matrix (with/without vision route, describe success/failure), tests (the two specs above), docs links.
