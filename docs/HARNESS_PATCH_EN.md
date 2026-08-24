# Harness core patch notes (paste-image auto-transcription · v2)

> This document records the **DeepSeek Harness core** changes needed for the
> "text-only model can still see pasted images" capability.
> The `dsh-media-skills` bundle only ships the model route and the skills;
> this core capability is not in the bundle.
>
> **Version matrix**
>
> | Harness version | Patch file | Status |
> |---|---|---|
> | `dsh-v0.1.1-rc.1` | [patches/dsh-v0.1.1-rc.1-vision-transcription.patch](patches/dsh-v0.1.1-rc.1-vision-transcription.patch) | ✅ round-trip verified (`git apply --check` clean + byte-identical to the applied result) |
> | `dsh-v0.1.1-rc.1` client UX | [patches/dsh-v0.1.1-rc.1-client-ux.patch](patches/dsh-v0.1.1-rc.1-client-ux.patch) | ✅ round-trip verified (`git apply --check` clean + byte-identical to the applied result) |
> | `dsh-v0.1.1-rc.2` (latest) | [patches/dsh-v0.1.1-rc.2-vision-transcription.patch](patches/dsh-v0.1.1-rc.2-vision-transcription.patch) | ✅ round-trip verified (apply/check clean + byte-identical) + typechecked (`tsc -b` host clean) |
> | `dsh-v0.1.0-rc.8` (2026-08-19) | [patches/dsh-v0.1.0-rc.8-vision-transcription.patch](patches/dsh-v0.1.0-rc.8-vision-transcription.patch) | ✅ typechecked (`tsc -b tsconfig.host.json` clean) |
> | `dsh-v0.1.0-rc.8` client UX | [patches/dsh-v0.1.0-rc.8-client-ux.patch](patches/dsh-v0.1.0-rc.8-client-ux.patch) | ✅ round-trip verified (`git apply --check` clean + byte-identical to the working tree) |
> | `dsh-v0.1.0-rc.7` (2026-08-12) | [patches/dsh-v0.1.0-rc.7-vision-transcription.patch](patches/dsh-v0.1.0-rc.7-vision-transcription.patch) | ✅ round-trip verified (`git apply --check` clean) |
> | `dsh-v0.1.0-rc.7` client UX | [patches/dsh-v0.1.0-rc.7-client-ux.patch](patches/dsh-v0.1.0-rc.7-client-ux.patch) | ✅ round-trip verified (`git apply --check` clean + byte-identical to the applied result) |
>
> The two patches are nearly identical: rc.7 and rc.8 `packages/llm/llm/src/index.ts`
> are **byte-identical**, and `packages/host/apiproxy/src/api-proxy.ts` differs only in
> import context unrelated to this patch (rc.8 adds `homedir` and the
> `admitEncodedImages` attachment refactor) — every anchor this patch touches is
> textually identical in both versions. Behavior is therefore the same: relaxed
> admission + `agent/pre-step` transcription + request-level image projection +
> `selectModel` guard relaxation.
>
> Apply with `git apply <patch>` on a clean checkout of the matching tag
> **v3 (0.1.1-rc.2) major change**: upstream 0.1.1-rc.2 **natively implements request-level image projection**
> (`projectImagesForTextModel` in the llm package's `content.ts`) and **removed the selectModel image guard** —
> so the 0.1.1-rc.2 patch is **only `api-proxy.ts`** (admission relaxation + `agent/pre-step` transcription);
> the llm projection and guard relaxation are no longer part of it (upstream did them).

> (round-trip verified).
>
> **v2 vs the old v1**: v1 targeted earlier pre-rc.7 builds (admit-with-placeholder
> flow + client-side button). rc.7 / rc.8 already ship native paste/drag-drop image
> intake (`addImages` pipeline, `imageLimits` pre-check in `InputBar`), and
> `agent/pre-step` semantics are finalized (waterfall, can replace the messages
> entering a step), so v2 needs only two host-side changes. **Client-side is not zero, though**: rc.8 `InputBar` has only the intake pipeline, **no add-image button** (the button was always the client part of this patch set), and the bubble renderer needs the «hide the transcription marker when a thumbnail is present» display logic — both come from the per-version client companion patches (`dsh-v0.1.0-rc.7-client-ux.patch` / `dsh-v0.1.0-rc.8-client-ux.patch`).

---

## 1. Change overview (two host-side files)

| # | File | Change |
|---|---|---|
| 1 | `packages/host/apiproxy/src/api-proxy.ts` | Image admission **no longer rejects on model capability**; a new `agent/pre-step` hook transcribes image blocks for text-only-model sessions through the vision failover chain (GLM → SiliconFlow → Gemini → …, 15s per route), keeping the image block (thumbnail on screen) and appending a transcription text block; when every route fails the image block degrades to a failure notice; the `selectModel` guard is relaxed (image history carrying transcription markers may switch back to a text-only model) |
| 2 | `packages/llm/llm/src/index.ts` | Adapter-boundary **request-level image projection**: when the target model explicitly does not accept images, image blocks are stripped from this request (history stays intact; transcription text blocks survive); models with unknown capability are not projected |

What rc.8 already provides (no patch needed):
Required client companion patches (one per version, rc.7 / rc.8):
- Add-image button + hidden file picker (image glyph) — rc.8 `InputBar` has only the paste/drag-drop intake pipeline, no button;
- Bubble rendering: hide the `[图片，已由视觉模型读取]` transcription marker block when the message renders its thumbnail (old image-block-free history still shows its text);
- A toast for image pastes dropped while the machine is busy (no more silent vanish) + `input.addImage` / `image.pasteWhileBusy` strings (zh + en).

Already native on rc.8, nothing to change:
- Paste / drag-drop intake pipeline (`addImages`, `imageLimits` pre-check, `attachmentErrorText`);
- In-session model-switch guard: rc.8 has none; image history switched back to a text-only model is covered by change 2's projection.

**Compatibility & security notes**: host and client patches round-trip on rc.7, rc.8 and v0.1.1-rc.1 (each version's files are generated independently; do not mix them). v0.1.1-rc.1's llm/index.ts is byte-identical to rc.8, api-proxy only gains unrelated imports (zod etc.), and the client locales/InputBar carry the access-preset rework — both patches were regenerated for the new version. Security/privacy: the patches introduce no keys and no new network endpoints; images go only to the vision routes you configure in settings (Zhipu by default), failed transcriptions keep the image in the session attachment store, and all client changes are local UI behavior (file picker, toast, display filtering).

## 2. Change 1: admission relaxation + pre-step transcription (api-proxy.ts)

### Admission (admit)

Old: a current model without image capability → immediately rejected with `MODEL_DOES_NOT_SUPPORT_IMAGES`.
New: **the rejection branch is deleted**. Images go through `durablePromptContent` (`admitEncodedImages` persists to the attachment store) and join the inbox like any other message; capability checks are left entirely to the pre-step hook and the projection safety net.

### pre-step hook (new)

```ts
ctx.on('agent/pre-step', async ({ agent, messages, signal }, next): Promise<PreStepDecision> => {
  if (!messages.some(message => message.content.some(block => block.type === 'image'))) return next()
  const decision = await next()
  if (decision.kind !== 'enter') return decision
  const current = selectionFor(agent).current
  const modelInfo = await ctx.llm.resolveModelInfo(current.provider, current.model, signal)
  if (modelInfo.inputModalities !== undefined && modelInfo.inputModalities.includes('image')) {
    return decision          // vision-capable session: images pass through
  }
  const rewritten = await describeImagesInMessages(ctx, visionRouteCache, decision.messages, signal)
  return rewritten === null ? decision : { kind: 'enter', messages: rewritten }
})
```

Key rc.8 pre-step semantics: inbox messages are **not yet in history**; the `{ kind: 'enter', messages }` the hook returns are exactly what lands in history and reaches the model request. Therefore:

- steps without images: a cheap content scan then straight `next()` — zero overhead;
- vision-capable current model: `next()` passes through (vision sessions behave exactly as unpatched);
- text-only model + images: each image is transcribed via `ctx.llm.stream` (vision routes); on success the message becomes **image block (thumbnail kept) + transcription text block (marked `[图片，已由视觉模型读取]`) + user text**;
- every vision route failed: the image block is replaced in place by a failure notice; the message still lands in history (no image block reaches a text-only model, so no request failure).

### Vision route discovery

`findVisionRoutes(ctx)`: iterate `ctx.llm.listProviders()`, call `ctx.llm.listModels(provider)` per route (a local snapshot for llm-pi-ai — no network), take the first model whose `inputModalities` includes `image`; registration order is the failover order; results are cached and invalidated on `llm/adapters-updated`. A failing route is skipped, not fatal.

### Transcription call

`ctx.llm.stream({ provider, model, maxTokens: 1024, signal, messages: [image block + prompt] })` (text collected with `BlockAssembler`; signal = agent cancel signal combined with the 15s per-route timeout). Note the glm-4v-flash hard limit: **max_tokens > 1024 is rejected by the Zhipu API (error 1210)**, so `VISION_DESCRIPTION_MAX_TOKENS = 1024` is the output cap — do not raise it.

## 3. Change 2: request-level image projection (llm/src/index.ts)

Inside `adapterStream`, the target model capability (`inputModalities`) is already resolved by `resolveCallFor` / `prepareCall`, so the projection happens at the adapter boundary:

- model **explicitly without** image capability → image blocks are stripped from this request's `messages` (all other blocks survive);
- capability unknown → no projection (let the adapter decide; never silently delete images);
- vision model → no projection.

The projection is **request-level**: session history (image blocks and transcriptions) stays untouched, so both "text-only session + image → transcribed → model sees the transcription" and "transcription failed → model sees only user text" are safe; image history switched back to a text-only model can no longer fail a request.

## 4. Build, test, deploy

```sh
cd <deepseek-harness checkout>   # must be the dsh-v0.1.0-rc.8 tag
git apply docs/patches/dsh-v0.1.0-rc.8-vision-transcription.patch   # copy from the dsh-media-skills repo
corepack pnpm install            # first time
pnpm run typecheck               # at least dsh-llm and dsh-host-apiproxy

# Tests: change 1 breaks some existing tests (they assert the old
# MODEL_DOES_NOT_SUPPORT_IMAGES rejection path) — expected; change 2's
# projection is a pure function and can take a keyless unit test.
pnpm run build                   # full build (lib + web dist)
```

Deploy: **fully restart** `dsh web` (a page refresh does not load the new backend), then hard-refresh (`Cmd+Shift+R`).

## 5. Dependencies and compatibility

- Requires at least one model route declaring `input: [text, image]` (`dsh-media-skills` seeds zhipu-vision/glm-4v-flash automatically). Adding a second vision route (e.g. SiliconFlow Qwen3-VL) gives you failover;
- With no vision route: admission no longer rejects — the image still lands in history, transcription fails, and the image block degrades to a failure notice (behavior changes from "paste rejected" to "paste accepted without transcription");
- Vision-model sessions (the model itself accepts images) are completely unaffected and keep the original image path;
- Transcription blocks carry the `[图片，已由视觉模型读取]` marker and are **shown as-is** in the message (rc.8's client does not hide transcription blocks like the old patch did; thumbnail + transcription text both visible — intended UX);
- Model switching: image history switched to a text-only model is no longer blocked (rc.8 has no guard); the request-level projection covers it — the model only sees transcriptions/text, never raw image blocks.

## 6. Upstream PR suggestion

- Title example: `feat(host): auto-transcribe pasted images via a vision-capable model for text-only sessions`
- PR essentials: admission relaxation + `agent/pre-step` transcription + `adapterStream` request-level image projection; a behavior matrix (with/without vision route, transcription success/failure, vision vs text-only sessions); a keyless unit test for change 2's pure projection, with change 1's integration behavior verified on a real composition.