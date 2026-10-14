# DeepSeek Harness Desktop 0.2 Compatibility

*Last checked: 2026-10-14 · runtime: DSH desktop CLI/runtime `0.2.0-rc.2` · latest source tag: `dsh-v0.2.1-alpha.2` · plugin `dsh-media-skills@0.4.2`.*

## Compatibility status

- **0.2.0-rc.2 installed desktop build:** runtime verified with the CLI, composed profile, and the repository test suite.
- **dsh-v0.2.1-alpha.2 upstream tag:** source-compatible. `@deepseek-ai/dsh-skill@0.2.1-alpha.2` retains `registerProvider()`, provider `list()`/`get()`, the array or `{ candidates, complete }` observation shape, and the existing candidate fields. Image admission still uses `MODEL_DOES_NOT_SUPPORT_IMAGES` for text-only routes. A packaged alpha desktop build was not available locally for a boot test.

## Summary

`dsh-media-skills` does **not** require a core patch on desktop 0.2. It uses the public runtime skill-provider lifecycle:

- `ctx.skills.registerProvider(factory)`
- provider `list(options)` returning bundled candidates
- provider `get(candidate, options)` returning the Markdown body
- standard `cordis.patch.yml` insertion of `dsh-media-skills`

Both bundled skills, `vision-review` and `media-tools`, register through that contract.

## What changed for images

Desktop 0.2 admits native image attachments according to the **active model** capabilities:

- image-capable routes advertise `inputModalities: ["text", "image"]`;
- the default `deepseek-flash` route is image-capable;
- text-only routes reject an image prompt with `MODEL_DOES_NOT_SUPPORT_IMAGES`;
- the old alpha/rc behavior of automatically turning an image into text before sending it to a text-only model is not part of this desktop path.

Use one of these workflows:

1. Select a vision/image-capable model such as `deepseek-flash`, then paste/drag/attach an image normally.
2. Keep an image file in the workspace and invoke `vision-review` with the file path.
3. Call `skills/vision-review/scripts/vision.py` directly for failover, OCR, structured JSON, or batch QA.

## Verification performed

- `node scripts/check-dsh-manifest.mjs`
- `node scripts/check-dsh-bundle.mjs`
- `node scripts/check-docs-links.mjs`
- `node --check index.js`
- `node scripts/check-python.mjs`
- DSH CLI `--version` returned `0.2.0-rc.2`.
- `@deepseek-ai/dsh-skill@0.2.1-alpha.2` and `packages/api/session-controller/src/commands.ts` at tag `dsh-v0.2.1-alpha.2` were source-compared; no breaking provider-contract change was found.
- A temporary `DSH_HOME` profile composed the plugin layer successfully (`--dump-config` shows `# == dsh-media-skills` and the inserted plugin row).

## Do not do this on desktop 0.2

- Do not patch the signed `app.asar`.
- Do not apply `docs/patches/dsh-v0.1.1-rc.2-*.patch` to desktop 0.2.
- Do not expect the plugin to write `zhipu-vision` or another route into settings automatically.

Configure optional routes and credentials in **Settings → Models**, or use `~/.dsh/secrets/media-tools.env` for the standalone Python skill scripts.
