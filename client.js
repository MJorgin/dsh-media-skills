/**
 * Browser half of dsh-media-skills.
 *
 * A full page in the layout's `main` slot plus one navigation row in
 * `sidebar.panellist` — the same pair the shipped Plugins page uses, so the
 * panel behaves like a built-in page instead of a floating popover:
 *
 *   sidebar.panellist  { id, order, label }  -> the icon row
 *   main               { key }               -> the page body
 *
 * Hand-authored in the client module-loader format; React is a baseline
 * module. Styling reads the host's `--dsw-alias-*` tokens so light/dark follow
 * the app theme.
 */
window.__ModuleLoader__.load({
  id: 'dsh-media-skills',
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    const React = require('react')
    const h = React.createElement

    const STYLE_ID = 'dsh-media-skills-style'
    const STORE_KEY = 'dsh-media-skills.works'
    const PICK_KEY = 'dsh-media-skills.pick'
    const PANEL_ID = 'media-desk'
    const NS = 'mediaDesk'
    const TABS = ['generate', 'works', 'keys']
    // Both baseline locales live here: the panel is the same page in either
    // language, so a switch re-renders it through the host's locale service.
    const COPY = {
      zh: {
        panel: '图像', title: '图像', subtitle: '生成图片，回看作品',
        'tab.generate': '生成', 'tab.works': '作品', 'tab.keys': '生图 Key',
        'quota.left': '今日还剩 {n} 张', 'quota.none': '今日配额已用完',
        'state.reading': '读取中…', 'state.offline': '无法连接',
        'spec.providerDefault': '服务商默认',
        'key.shield': 'Key 只写进本机 ~/.dsh/secrets/media-tools.env（权限 600），不会上传，也不会用于生成以外的用途。',
        'key.keyless': '免 Key', 'key.configured': '已配置 {hint}', 'key.missing': '未配置',
        'label.baseUrl': '地址', 'label.model': '模型', 'label.name': '名称',
        'key.keylessNote': '这个提供方不需要 Key，地址和模型填好就能直接用。',
        'key.keep': 'API Key（留空表示不改）', 'key.label': 'API Key', 'key.placeholder': '粘贴你的 Key',
        'key.show': '显示', 'key.hide': '隐藏',
        'docs.site': '官网 ↗', 'docs.get': '获取 Key ↗',
        saving: '保存中…', save: '保存',
        'custom.title': '自定义提供方', 'custom.compat': 'OpenAI 兼容',
        'custom.namePlaceholder': '例如 即梦 / 可灵', 'custom.modelPlaceholder': '模型 ID',
        'key.optional': 'API Key（服务不需要就留空）', 'key.optionalPlaceholder': '没有就留空',
        cancel: '取消', add: '添加', 'custom.add': '＋ 添加自定义提供方',
        'size.auto': '由服务商决定', 'model.unknown': '未知模型',
        'tier.ceiling': '该模型最高 {n}px', 'tier.edge': '{n}px 长边',
        generate: '生成', 'generate.running': '生成中…',
        hint: '⌘⏎ 直接生成。结果只写进本机工作区，不会上传。',
        'placeholder.prompt': '描述你想要的画面，比如「雨夜街角，霓虹倒影，35mm 电影感」',
        'error.title': '生成失败。', retry: '重试',
        'empty.works': '暂无作品。', 'empty.works.body': '生成过的图片会按时间排列在这里。',
        'empty.generate.body': '生成的第一张会出现在这里，可以随时回来复用它的参数。',
        'go.generate': '去生成', 'work.defaultSize': '默认',
        'zoom.open': '在新标签页打开', 'zoom.close': '关闭',
        'action.reuse': '复用参数', 'action.copy': '复制提示词', 'action.copied': '已复制',
        'action.open': '打开原图', 'action.delete': '删除', 'action.confirmDelete': '确认删除',
        'action.inWorks': '在作品里看', 'action.openTab': '在新标签页打开原图', 'action.zoom': '放大看',
        'model.notConfigured': '未配置模型', 'provider.pickFirst': '先去「生图 Key」配一个',
        'note.busy': '一般十几秒，慢的时候会久一点。',
        'ratio.smart': '智能', 'detail.title': '选一张看细节。', 'detail.body': '点左边的任意一张。',
      },
      en: {
        panel: 'Images', title: 'Images', subtitle: 'Make pictures, keep them in one place',
        'tab.generate': 'Generate', 'tab.works': 'Works', 'tab.keys': 'Image key',
        'quota.left': '{n} left today', 'quota.none': 'Out of quota for today',
        'state.reading': 'Loading…', 'state.offline': 'Not connected',
        'spec.providerDefault': 'provider default',
        'key.shield': 'Keys are written only to ~/.dsh/secrets/media-tools.env (mode 600) on this machine. They are never uploaded, and never used for anything but generating.',
        'key.keyless': 'No key', 'key.configured': 'Configured {hint}', 'key.missing': 'Not configured',
        'label.baseUrl': 'Endpoint', 'label.model': 'Model', 'label.name': 'Name',
        'key.keylessNote': 'This provider needs no key — set the endpoint and model, and you are done.',
        'key.keep': 'API Key (leave empty to keep the current one)', 'key.label': 'API Key',
        'key.placeholder': 'Paste your key',
        'key.show': 'Show', 'key.hide': 'Hide',
        'docs.site': 'Website ↗', 'docs.get': 'Get a key ↗',
        saving: 'Saving…', save: 'Save',
        'custom.title': 'Custom provider', 'custom.compat': 'OpenAI compatible',
        'custom.namePlaceholder': 'e.g. Dreamina / Kling', 'custom.modelPlaceholder': 'Model ID',
        'key.optional': 'API Key (leave empty if the service needs none)',
        'key.optionalPlaceholder': 'Leave empty if none',
        cancel: 'Cancel', add: 'Add', 'custom.add': '＋ Add a custom provider',
        'size.auto': 'Set by the provider', 'model.unknown': 'Unknown model',
        'tier.ceiling': 'This model tops out at {n}px', 'tier.edge': '{n}px long edge',
        generate: 'Generate', 'generate.running': 'Generating…',
        hint: '⌘⏎ generates. Images only land in your local workspace — nothing is uploaded.',
        'placeholder.prompt': 'Describe the picture, e.g. "a rainy street corner, neon reflections, 35mm film look"',
        'error.title': 'Generation failed.', retry: 'Retry',
        'empty.works': 'No works yet.', 'empty.works.body': 'Generated images will be listed here, newest first.',
        'empty.generate.body': 'Your first image will land here — you can reuse its settings any time.',
        'go.generate': 'Start generating', 'work.defaultSize': 'default',
        'zoom.open': 'Open in a new tab', 'zoom.close': 'Close',
        'action.reuse': 'Reuse settings', 'action.copy': 'Copy prompt', 'action.copied': 'Copied',
        'action.open': 'Open original', 'action.delete': 'Delete', 'action.confirmDelete': 'Confirm delete',
        'action.inWorks': 'See in Works', 'action.openTab': 'Open the original in a new tab', 'action.zoom': 'Zoom in',
        'model.notConfigured': 'No model configured', 'provider.pickFirst': 'Set one up in Image key first',
        'note.busy': 'Usually ten seconds or so; sometimes slower.',
        'ratio.smart': 'Auto', 'detail.title': 'Pick one to see it here.', 'detail.body': 'Any picture on the left.',
      },
    }
    // Replaced by the host-bound translate() once apply() sees the locale
    // service; the fallback keeps the bundle renderable on its own.
    let t = (key, params) => {
      const template = COPY.zh[key] ?? key
      if (params === undefined) return template
      return template.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match))
    }
    let localeCtx = null
    // Provider tables arrive from the host in both languages; pick the one the
    // panel is speaking right now.
    function englishNow() {
      if (localeCtx === null || typeof localeCtx.getSnapshot !== 'function') return false
      try {
        return String(localeCtx.getSnapshot()?.active ?? 'zh').toLowerCase().startsWith('en')
      } catch { return false }
    }
    // Slot content re-renders when the language changes; the sidebar does the
    // same for the row label through its own locale subscription.
    function useLocale() {
      const [, bump] = React.useState(0)
      React.useEffect(() => {
        if (localeCtx === null || typeof localeCtx.subscribe !== 'function') return undefined
        return localeCtx.subscribe(() => bump((n) => n + 1))
      }, [])
    }

    const CSS = `
.dshm-page {
  height: 100%; overflow: auto; box-sizing: border-box;
  padding: calc(var(--dsh-frame-top-clearance, 48px) + 20px) 40px 40px;
  color: var(--dsw-alias-label-primary, #0f1115);
  font-family: var(--dsw-font-family, -apple-system, "PingFang SC", system-ui, sans-serif);
}
.dshm-inner { max-width: 980px; margin: 0 auto; }
.dshm-head { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; }
.dshm-head h1 { margin: 0; font-size: 22px; font-weight: 600; letter-spacing: .01em; }
.dshm-head p { margin: 6px 0 0; font-size: 13px; color: var(--dsw-alias-label-tertiary, #81858c); }
.dshm-quota { font-size: 12.5px; color: var(--dsw-alias-label-tertiary, #81858c); white-space: nowrap; }

.dshm-tabs { display: flex; gap: 24px; margin-top: 22px; border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(0,0,0,.06)); }
.dshm-tab {
  font: inherit; font-size: 14px; color: var(--dsw-alias-label-tertiary, #81858c);
  background: none; border: 0; padding: 0 0 10px; cursor: pointer; position: relative;
}
.dshm-tab[data-on="true"] { color: var(--dsw-alias-label-primary, #0f1115); font-weight: 500; }
.dshm-tab[data-on="true"]::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 2px;
  background: var(--dsw-alias-label-primary, #0f1115); border-radius: 1px;
}

.dshm-split { display: grid; grid-template-columns: minmax(300px, 420px) 1fr; gap: 36px; margin-top: 26px; align-items: start; }
@media (max-width: 900px) { .dshm-split { grid-template-columns: 1fr; gap: 22px; } }

.dshm-field {
  width: 100%; min-height: 118px; resize: vertical; box-sizing: border-box;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.12)); border-radius: 10px;
  background: var(--dsw-alias-bg-base, #fff); color: inherit;
  font: inherit; font-size: 14px; line-height: 1.65; padding: 12px 14px; outline: none;
}
.dshm-field:focus { border-color: var(--dsw-alias-label-tertiary, #81858c); }
.dshm-field::placeholder { color: var(--dsw-alias-label-caption, #adb2b8); }

.dshm-row { display: flex; align-items: center; gap: 8px; margin-top: 12px; font-size: 12.5px; color: var(--dsw-alias-label-tertiary, #81858c); }
.dshm-row b { font-weight: 500; color: var(--dsw-alias-label-secondary, #61666b); }
.dshm-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--dsw-alias-label-caption, #adb2b8); }

.dshm-pickers { display: flex; align-items: center; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
.dshm-pickwrap { position: relative; display: inline-block; }
.dshm-pick {
  height: 28px; padding: 0 11px; border-radius: 14px; cursor: pointer;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.12));
  background: var(--dsw-alias-bg-base, #fff); color: var(--dsw-alias-label-secondary, #61666b);
  font: inherit; font-size: 12.5px; display: inline-flex; align-items: center; gap: 7px;
}
.dshm-pick:hover { border-color: var(--dsw-alias-label-caption, #adb2b8); }
.dshm-pick .car { width: 6px; height: 6px; border-right: 1.3px solid currentColor; border-bottom: 1.3px solid currentColor; transform: rotate(45deg) translate(-1px, -1px); opacity: .7; }
.dshm-menu {
  position: absolute; left: 0; top: 34px; z-index: 30; min-width: 252px; display: grid; padding: 4px;
  background: var(--dsw-alias-bg-elevated, #fff); border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.12));
  border-radius: 10px; box-shadow: 0 10px 28px rgba(0,0,0,.14);
}
.dshm-menu button {
  border: 0; background: none; font: inherit; font-size: 13px; color: inherit; cursor: pointer;
  padding: 7px 10px; border-radius: 7px; text-align: left; display: flex; justify-content: space-between; gap: 14px;
  white-space: nowrap;
}
.dshm-menu button:hover { background: var(--dsw-alias-bg-layer-2, #f2f3f5); }
.dshm-menu button[data-on="true"] { font-weight: 500; }
.dshm-menu button:disabled { color: var(--dsw-alias-label-caption, #adb2b8); cursor: not-allowed; }
.dshm-menu button:disabled:hover { background: none; }
.dshm-menu .off { font-size: 11.5px; color: var(--dsw-alias-label-caption, #adb2b8); }
.dshm-size { font-size: 12px; color: var(--dsw-alias-label-caption, #adb2b8); }
.dshm-menu .lab { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.dshm-menu .lab .t { font-size: 13px; }
.dshm-menu .lab .d { font-size: 11px; color: var(--dsw-alias-label-caption, #adb2b8); white-space: normal; }
.dshm-menu .ok { color: var(--dsw-alias-label-primary, #232324); font-size: 13px; }
.dshm-ratios {
  position: absolute; left: 0; top: 34px; z-index: 30; display: grid; grid-template-columns: repeat(5, 60px); gap: 2px; padding: 6px;
  background: var(--dsw-alias-bg-elevated, #fff); border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.12));
  border-radius: 12px; box-shadow: 0 10px 28px rgba(0,0,0,.14);
}
.dshm-ratio {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 7px; height: 56px; padding: 0;
  border: 0; border-radius: 8px; background: none; font: inherit; font-size: 11.5px; cursor: pointer;
  color: var(--dsw-alias-label-tertiary, #81858c);
}
.dshm-ratio:hover { background: var(--dsw-alias-bg-layer-2, #f2f3f5); }
.dshm-ratio[data-on="true"] { background: var(--dsw-alias-bg-layer-2, #f2f3f5); color: var(--dsw-alias-label-primary, #232324); font-weight: 500; }
.dshm-glyph { border: 1.3px solid currentColor; border-radius: 2.5px; }

.dshm-shield { display: flex; gap: 10px; align-items: flex-start; max-width: 680px; margin: 20px 0 0;
  font-size: 12.5px; line-height: 1.65; color: var(--dsw-alias-label-tertiary, #81858c); }
.dshm-shield svg { flex: none; margin-top: 2px; color: var(--dsw-alias-label-tertiary, #81858c); }
.dshm-keywrap { position: relative; }
.dshm-keywrap .dshm-input { padding-right: 38px; }
.dshm-eye { position: absolute; right: 3px; top: 50%; transform: translateY(-50%); width: 26px; height: 26px;
  display: flex; align-items: center; justify-content: center; border: 0; border-radius: 6px; padding: 0;
  background: none; color: var(--dsw-alias-label-tertiary, #81858c); cursor: pointer; }
.dshm-eye:hover { color: var(--dsw-alias-label-primary, #0f1115); background: var(--dsw-alias-bg-layer-2, #f2f3f5); }

.dshm-cta {
  margin-top: 16px; height: 36px; border-radius: 18px; border: 0; cursor: pointer; width: 100%;
  background: var(--dsw-alias-button-primary-fill, #0f1115); color: var(--dsw-alias-label-primary-foreground, #fff);
  font: inherit; font-size: 14px; font-weight: 500;
}
.dshm-cta:disabled { background: var(--dsw-alias-bg-layer-2, #f2f3f5); color: var(--dsw-alias-label-caption, #adb2b8); cursor: not-allowed; border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.12)); }

.dshm-shot { border-radius: 12px; overflow: hidden; background: var(--dsw-alias-bg-layer-2, #f2f3f5); aspect-ratio: 16 / 9; display: flex; align-items: center; justify-content: center; }
.dshm-shot a { display: block; width: 100%; height: 100%; }
.dshm-shot img { width: 100%; height: 100%; object-fit: contain; display: block; }

.dshm-note {
  border: 1px dashed var(--dsw-alias-border-l2, rgba(0,0,0,.12)); border-radius: 12px;
  padding: 40px 24px; text-align: center; font-size: 13px; line-height: 1.7;
  color: var(--dsw-alias-label-caption, #adb2b8);
}
.dshm-note b { display: block; font-size: 14px; font-weight: 500; color: var(--dsw-alias-label-secondary, #61666b); margin-bottom: 6px; }

.dshm-skel { background: linear-gradient(100deg, rgba(0,0,0,.035) 30%, rgba(0,0,0,.075) 50%, rgba(0,0,0,.035) 70%); background-size: 300% 100%; animation: dshm-shimmer 1.5s linear infinite; }
@keyframes dshm-shimmer { from { background-position: 100% 0; } to { background-position: -100% 0; } }
@media (prefers-reduced-motion: reduce) { .dshm-skel { animation: none; } }

/* The label block under a picture: frame number, spec line, actions. */
.dshm-shotbtn { display: block; width: 100%; height: 100%; padding: 0; border: 0; background: none; cursor: zoom-in; }
.dshm-zoom { position: fixed; inset: 0; z-index: 60; background: rgba(8,9,11,.88); display: flex; align-items: center; justify-content: center; padding: 44px 44px 70px; cursor: zoom-out; }
.dshm-zoom img { max-width: 100%; max-height: 100%; object-fit: contain; border-radius: 6px; box-shadow: 0 24px 64px rgba(0,0,0,.45); }
.dshm-zoombar { position: absolute; left: 50%; bottom: 18px; transform: translateX(-50%); display: flex; align-items: center; gap: 12px; max-width: calc(100% - 88px); color: #f2f3f5; font-size: 12.5px; cursor: default; }
.dshm-zoombar span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; opacity: .82; }
.dshm-zoombar a, .dshm-zoombar button { flex: none; color: inherit; background: none; border: 1px solid rgba(255,255,255,.3); border-radius: 14px; height: 28px; padding: 0 12px; font: inherit; font-size: 12.5px; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; }
.dshm-zoombar a:hover, .dshm-zoombar button:hover { border-color: rgba(255,255,255,.62); }
.dshm-label { margin-top: 14px; display: flex; flex-direction: column; gap: 8px; }
.dshm-label .top { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.dshm-no { font-size: 11.5px; letter-spacing: .06em; color: var(--dsw-alias-label-caption, #adb2b8); font-variant-numeric: tabular-nums; }
.dshm-spec { font-size: 12.5px; color: var(--dsw-alias-label-tertiary, #81858c); font-variant-numeric: tabular-nums; }
.dshm-acts { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 2px; }
.dshm-act { height: 30px; padding: 0 13px; border-radius: 15px; border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.12)); background: none; cursor: pointer; font: inherit; font-size: 12.5px; color: var(--dsw-alias-label-secondary, #61666b); text-decoration: none; display: inline-flex; align-items: center; }
.dshm-act:hover { border-color: var(--dsw-alias-label-caption, #adb2b8); color: var(--dsw-alias-label-primary, #0f1115); }
.dshm-act[data-danger="true"]:hover { color: #c0392b; border-color: rgba(192,57,43,.42); }

/* Works: contact sheet on the left, the proof card of the selected frame on the right. */
.dshm-works { display: grid; grid-template-columns: 1fr minmax(280px, 360px); gap: 36px; margin-top: 24px; align-items: start; }
@media (max-width: 900px) { .dshm-works { grid-template-columns: 1fr; gap: 22px; } }
.dshm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 18px 16px; }
.dshm-work { text-align: left; background: none; border: 0; padding: 0; cursor: pointer; font: inherit; color: inherit; }
.dshm-work .im { border-radius: 10px; overflow: hidden; background: var(--dsw-alias-bg-layer-2, #f2f3f5); aspect-ratio: 4 / 3; transition: box-shadow .12s ease; }
/* The ring sits outside the picture: an inset one disappears into dark images. */
.dshm-work:hover .im { box-shadow: 0 0 0 2px var(--dsw-alias-border-l3, rgba(0,0,0,.26)); }
.dshm-work[data-on="true"] .im, .dshm-work[data-on="true"]:hover .im { box-shadow: 0 0 0 2px var(--dsw-alias-label-primary, #0f1115); }
.dshm-work img { width: 100%; height: 100%; object-fit: cover; display: block; }
/* One line per title keeps every row of the sheet on the same baseline. */
.dshm-work .t { margin-top: 8px; font-size: 12.5px; color: var(--dsw-alias-label-secondary, #61666b); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dshm-work .m { margin-top: 3px; font-size: 11.5px; color: var(--dsw-alias-label-caption, #adb2b8); font-variant-numeric: tabular-nums; }
.dshm-detail { position: sticky; top: 8px; border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.12)); border-radius: 14px; padding: 14px; }
.dshm-label .prompt { margin: 2px 0 0; font-size: 13px; line-height: 1.7; color: var(--dsw-alias-label-secondary, #61666b); white-space: pre-wrap; word-break: break-word; max-height: 150px; overflow: auto; }

.dshm-keys { margin-top: 24px; display: grid; gap: 14px; max-width: 680px; }
.dshm-krow { border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.12)); border-radius: 12px; padding: 16px; display: grid; gap: 10px; }
.dshm-krow .kh { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
.dshm-krow .kh b { font-size: 14px; font-weight: 500; }
.dshm-krow .kh span { font-size: 12px; color: var(--dsw-alias-label-tertiary, #81858c); }
.dshm-krow .kh span::before { content: ""; display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 6px; background: #2f7d5c; vertical-align: 1px; }
.dshm-krow[data-off="true"] .kh span::before { background: var(--dsw-alias-label-caption, #adb2b8); }
.dshm-krow .kf { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.dshm-krow .kf.full { grid-template-columns: 1fr; }
.dshm-lab { display: block; font-size: 11.5px; color: var(--dsw-alias-label-tertiary, #81858c); margin-bottom: 4px; }
.dshm-input {
  width: 100%; box-sizing: border-box; height: 32px; padding: 0 10px;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.12)); border-radius: 8px;
  background: var(--dsw-alias-bg-base, #fff); color: inherit; font: inherit; font-size: 13px; outline: none;
}
.dshm-input:focus { border-color: var(--dsw-alias-label-tertiary, #81858c); }
.dshm-kfoot { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.dshm-kfoot a { font-size: 12px; color: var(--dsw-alias-label-tertiary, #81858c); text-decoration: none; }
.dshm-kfoot a:hover { text-decoration: underline; }
.dshm-save {
  height: 30px; padding: 0 16px; border-radius: 15px; border: 0; cursor: pointer;
  background: var(--dsw-alias-button-primary-fill, #0f1115); color: var(--dsw-alias-label-primary-foreground, #fff);
  font: inherit; font-size: 12.5px;
}
.dshm-save:disabled { opacity: .5; cursor: default; }
.dshm-addrow { margin-top: 4px; height: 34px; border-radius: 17px; border: 1px dashed var(--dsw-alias-border-l2, rgba(0,0,0,.2)); background: none; cursor: pointer; font: inherit; font-size: 13px; color: var(--dsw-alias-label-tertiary, #81858c); }
.dshm-err { margin-top: 10px; font-size: 12.5px; color: #c0392b; }
.dshm-key { border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.12)); border-radius: 12px; padding: 14px 16px; }
.dshm-key .n { display: flex; align-items: center; justify-content: space-between; font-size: 14px; }
.dshm-key .s { font-size: 12px; color: var(--dsw-alias-label-tertiary, #81858c); display: flex; align-items: center; gap: 6px; }
.dshm-key .s::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: #2f7d5c; }
.dshm-key[data-off="true"] .s::before { background: var(--dsw-alias-label-caption, #adb2b8); }
.dshm-key .v { margin-top: 6px; font-size: 12.5px; color: var(--dsw-alias-label-caption, #adb2b8); }
.dshm-hint { margin-top: 16px; font-size: 12.5px; color: var(--dsw-alias-label-tertiary, #81858c); line-height: 1.7; }
`

    function ensureStyles() {
      let style = document.getElementById(STYLE_ID)
      if (style === null) {
        style = document.createElement('style')
        style.id = STYLE_ID
        document.head.appendChild(style)
      }
      // The bundle can be swapped live (client HMR): keep the sheet in sync with
      // the code that is running now instead of reusing the previous version's.
      if (style.textContent !== CSS) style.textContent = CSS
    }

    function PanelIcon() {
      return h('svg', { viewBox: '0 0 16 16', width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
        h('rect', { x: 1.8, y: 2.6, width: 12.4, height: 10.8, rx: 1.8 }),
        h('circle', { cx: 5.4, cy: 6.2, r: 1.1 }),
        h('path', { d: 'M2.4 11.6l3.4-3.1 2.5 2.2 2.2-1.9 3.1 2.8' }))
    }

    async function api(path, init) {
      const response = await fetch(`/media${path}`, { headers: { 'content-type': 'application/json' }, ...init })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.message ?? `HTTP ${response.status}`)
      return body
    }

    function loadWorks() {
      try {
        const raw = localStorage.getItem(STORE_KEY)
        const parsed = raw === null ? [] : JSON.parse(raw)
        return Array.isArray(parsed) ? parsed.slice(0, 60) : []
      } catch { return [] }
    }

    /** The picker choice from last visit; a corrupt or absent record reads as empty. */
    function readPick() {
      try {
        const raw = JSON.parse(localStorage.getItem(PICK_KEY) ?? '{}')
        return typeof raw === 'object' && raw !== null ? raw : {}
      } catch {
        return {}
      }
    }

    function saveWorks(works) {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(works.slice(0, 60))) } catch { /* storage blocked */ }
    }

    function titleOf(prompt) {
      const clean = String(prompt).replace(/\s+/g, ' ').trim()
      return clean.length > 18 ? `${clean.slice(0, 18)}…` : clean
    }

    /** Canvases the panel offers; `smart` lets the provider pick its own default. */
    const RATIOS = [
      { id: 'smart', label: '', w: 0, h: 0 }, // label comes from the dictionary
      { id: '1:1', label: '1:1', w: 1, h: 1 },
      { id: '9:16', label: '9:16', w: 9, h: 16 },
      { id: '16:9', label: '16:9', w: 16, h: 9 },
      { id: '3:4', label: '3:4', w: 3, h: 4 },
      { id: '4:3', label: '4:3', w: 4, h: 3 },
      { id: '2:3', label: '2:3', w: 2, h: 3 },
      { id: '3:2', label: '3:2', w: 3, h: 2 },
      { id: '9:21', label: '9:21', w: 9, h: 21 },
      { id: '21:9', label: '21:9', w: 21, h: 9 },
    ]
    /** Long-edge tiers; the provider's own ceiling wins when it is smaller. */
    const TIERS = [['1K', 1024], ['2K', 2048], ['4K', 4096]]

    /** WxH for one ratio at one tier, snapped to a multiple of 8; '' means let the provider decide. */
    function sizeOf(ratio, tier, ceiling) {
      if (ratio.w === 0) return ''
      const long = Math.min(TIERS.find(([id]) => id === tier)?.[1] ?? 1024, ceiling ?? 1024)
      const [w, h] = ratio.w >= ratio.h
        ? [long, (long * ratio.h) / ratio.w]
        : [(long * ratio.w) / ratio.h, long]
      const snap = (n) => Math.max(8, Math.round(n / 8) * 8)
      return `${snap(w)}x${snap(h)}`
    }

    /** The frame follows a finished picture's own ratio; unknown sizes fall back to 16:9. */
    function ratioOfSize(size) {
      const match = /^(\d+)x(\d+)$/.exec(String(size ?? ''))
      if (match === null) return 16 / 9
      const [w, h] = [Number(match[1]), Number(match[2])]
      return h > 0 ? w / h : 16 / 9
    }

    function ShieldIcon() {
      return h('svg', { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' },
        h('path', { d: 'M12 3l7 3v5.6c0 4.4-3 8.1-7 9.4-4-1.3-7-5-7-9.4V6l7-3z' }),
        h('path', { d: 'M9.2 12.3l2 2 3.6-3.9' }))
    }

    function EyeIcon({ open }) {
      const box = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }
      return open
        ? h('svg', box, h('path', { d: 'M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z' }), h('circle', { cx: 12, cy: 12, r: 2.6 }))
        : h('svg', box, h('path', { d: 'M3 3l18 18' }), h('path', { d: 'M10.6 6.1A11 11 0 0 1 12 6c6.4 0 10 6 10 6a17.5 17.5 0 0 1-3.2 4' }), h('path', { d: 'M6.4 7.9A17.3 17.3 0 0 0 2 12s3.6 6 10 6a10.9 10.9 0 0 0 4.3-.9' }))
    }

    /** A small pill that opens a menu — the panel's only interactive control. */
    function Picker({ value, options, onPick }) {
      const [open, setOpen] = React.useState(false)
      React.useEffect(() => {
        if (!open) return undefined
        const close = () => setOpen(false)
        document.addEventListener('mousedown', close)
        return () => document.removeEventListener('mousedown', close)
      }, [open])
      return h('div', { className: 'dshm-pickwrap', onMouseDown: (e) => e.stopPropagation() },
        h('button', { className: 'dshm-pick', type: 'button', onClick: () => setOpen((v) => !v) },
          h('span', null, value), h('i', { className: 'car' })),
        open
          ? h('div', { className: 'dshm-menu' }, options.map((option) =>
              h('button', {
                key: option.id, type: 'button', disabled: option.disabled === true,
                'data-on': String(option.current === true),
                onClick: () => { setOpen(false); onPick(option) },
              },
                h('span', { className: 'lab' },
                  h('span', { className: 't' }, option.id === 'smart' ? t('ratio.smart') : option.label),
                  option.desc ? h('span', { className: 'd' }, option.desc) : null),
                option.hint ? h('span', { className: 'off' }, option.hint) : null,
                option.current === true ? h('i', { className: 'ok' }, '✓') : null)))
          : null)
    }

    /** The canvas grid: one glyph per ratio, five to a row. */
    function RatioPicker({ value, onPick }) {
      const [open, setOpen] = React.useState(false)
      React.useEffect(() => {
        if (!open) return undefined
        const close = () => setOpen(false)
        document.addEventListener('mousedown', close)
        return () => document.removeEventListener('mousedown', close)
      }, [open])
      return h('div', { className: 'dshm-pickwrap', onMouseDown: (e) => e.stopPropagation() },
        h('button', { className: 'dshm-pick', type: 'button', onClick: () => setOpen((v) => !v) },
          h('span', null, value.label), h('i', { className: 'car' })),
        open
          ? h('div', { className: 'dshm-ratios' }, RATIOS.map((ratio) => {
              const scale = 20 / Math.max(ratio.w, ratio.h, 1)
              return h('button', {
                key: ratio.id, type: 'button', className: 'dshm-ratio',
                'data-on': String(ratio.id === value.id),
                onClick: () => { setOpen(false); onPick(ratio) },
              },
                ratio.w === 0
                  ? h('span', { className: 'dshm-glyph', style: { width: 20, height: 20, borderStyle: 'dashed' } })
                  : h('span', { className: 'dshm-glyph', style: { width: `${Math.round(ratio.w * scale)}px`, height: `${Math.round(ratio.h * scale)}px` } }),
                h('span', null, ratio.label))
            }))
          : null)
    }

    /** Contact-sheet frame number: the oldest work is No. 001. */
    function frameNo(index, total) {
      const n = index >= 0 ? total - index : total
      return String(Math.max(1, n)).padStart(3, '0')
    }

    /** Clipboard, with a fallback for pages that are not a secure context. */
    function copyText(text) {
      if (navigator.clipboard !== undefined && typeof navigator.clipboard.writeText === 'function') {
        return navigator.clipboard.writeText(text).then(() => true).catch(() => fallbackCopy(text))
      }
      return Promise.resolve(fallbackCopy(text))
    }

    function fallbackCopy(text) {
      try {
        const area = document.createElement('textarea')
        area.value = text
        area.style.position = 'fixed'
        area.style.top = '-1000px'
        document.body.appendChild(area)
        area.select()
        const ok = document.execCommand('copy')
        area.remove()
        return ok === true
      } catch {
        return false
      }
    }

    /** One work: the picture, its frame number and spec line, and what you can do with it. */
    function Proof({ work, mode, index, total, onReuse, onDelete, onOpen, onZoom }) {
      const [copied, setCopied] = React.useState(false)
      const [confirming, setConfirming] = React.useState(false)
      const id = work === null || work === undefined ? '' : work.id
      React.useEffect(() => { setCopied(false); setConfirming(false) }, [id])
      if (work === null || work === undefined) {
        return h('div', { className: 'dshm-note' }, h('b', null, t('detail.title')), t('detail.body'))
      }
      const at = new Date(work.at)
      const when = `${at.getFullYear()}/${at.getMonth() + 1}/${at.getDate()} ${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`
      const copy = () => {
        copyText(String(work.prompt ?? '')).then((ok) => {
          if (!ok) return
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1600)
        })
      }
      // Two-step delete: the second press within three seconds is the real one.
      const remove = () => {
        if (!confirming) {
          setConfirming(true)
          window.setTimeout(() => setConfirming(false), 3200)
          return
        }
        setConfirming(false)
        onDelete(work)
      }
      const actions = [
        mode === 'detail' && onReuse !== undefined
          ? h('button', { key: 'reuse', className: 'dshm-act', onClick: () => onReuse(work) }, t('action.reuse'))
          : null,
        h('button', { key: 'copy', className: 'dshm-act', onClick: copy }, copied ? t('action.copied') : t('action.copy')),
        h('a', { key: 'open', className: 'dshm-act', href: work.src, target: '_blank', rel: 'noreferrer' }, t('action.open')),
        mode === 'detail' && onDelete !== undefined
          ? h('button', { key: 'del', className: 'dshm-act', 'data-danger': 'true', onClick: remove }, confirming ? t('action.confirmDelete') : t('action.delete'))
          : onOpen !== undefined ? h('button', { key: 'more', className: 'dshm-act', onClick: onOpen }, t('action.inWorks')) : null,
      ].filter((node) => node !== null)
      return h('div', { className: mode === 'detail' ? 'dshm-detail' : 'dshm-proof' },
        h('div', { className: 'dshm-shot', style: { aspectRatio: String(ratioOfSize(work.size)) } },
          onZoom === undefined
            ? h('a', { href: work.src, target: '_blank', rel: 'noreferrer', title: t('action.openTab') },
                h('img', { src: work.src, alt: work.title }))
            : h('button', { className: 'dshm-shotbtn', type: 'button', title: t('action.zoom'), onClick: () => onZoom(work) },
                h('img', { src: work.src, alt: work.title }))),
        h('div', { className: 'dshm-label' },
          h('div', { className: 'top' },
            h('span', { className: 'dshm-no' }, `No. ${frameNo(index, total)}`),
            h('span', { className: 'dshm-no' }, when)),
          h('div', { className: 'dshm-spec' },
            `${work.model} · ${work.size === '' || work.size === undefined ? t('spec.providerDefault') : String(work.size).replace('x', '×')}`),
          h('p', { className: 'prompt' }, work.prompt),
          h('div', { className: 'dshm-acts' }, actions)))
    }

    function KeysTab({ status, onSaved }) {
      const providers = status?.providers ?? []
      const [drafts, setDrafts] = React.useState({})
      const [saving, setSaving] = React.useState(null)
      const [error, setError] = React.useState(null)
      const [adding, setAdding] = React.useState(false)
      const [reveal, setReveal] = React.useState({})
      const [form, setForm] = React.useState({ label: '', baseUrl: '', model: '', key: '' })
      const toggleReveal = (id) => setReveal((all) => ({ ...all, [id]: all[id] !== true }))

      const draftOf = (provider) => ({
        baseUrl: provider.baseUrl ?? '',
        model: provider.model ?? '',
        key: '',
        ...(drafts[provider.id] ?? {}),
      })
      const edit = (id, patch) => setDrafts((all) => ({ ...all, [id]: { ...(all[id] ?? {}), ...patch } }))

      const save = async (provider) => {
        const draft = draftOf(provider)
        setSaving(provider.id); setError(null)
        try {
          await api('/keys', { method: 'POST', body: JSON.stringify({ id: provider.id, baseUrl: draft.baseUrl, model: draft.model, key: draft.key }) })
          setDrafts((all) => ({ ...all, [provider.id]: { key: '' } }))
          onSaved()
        } catch (e) { setError(e.message) } finally { setSaving(null) }
      }

      const addCustom = async () => {
        setSaving('custom'); setError(null)
        try {
          await api('/keys/custom', { method: 'POST', body: JSON.stringify(form) })
          setForm({ label: '', baseUrl: '', model: '', key: '' })
          setAdding(false)
          onSaved()
        } catch (e) { setError(e.message) } finally { setSaving(null) }
      }

      return h('div', null,
        h('div', { className: 'dshm-shield' }, h(ShieldIcon),
          h('span', null, t('key.shield'))),
        h('div', { className: 'dshm-keys' },
          providers.map((provider) => {
            const draft = draftOf(provider)
            return h('div', { key: provider.id, className: 'dshm-krow', 'data-off': String(!provider.configured) },
              h('div', { className: 'kh' },
                h('b', null, provider.label),
                h('span', null, provider.keyless === true
                  ? t('key.keyless')
                  : provider.configured ? t('key.configured', { hint: provider.keyHint ?? '' }).trim() : t('key.missing'))),
              h('div', { className: 'kf' },
                h('div', null, h('label', { className: 'dshm-lab' }, t('label.baseUrl')),
                  h('input', { className: 'dshm-input', value: draft.baseUrl, onChange: (e) => edit(provider.id, { baseUrl: e.target.value }) })),
                h('div', null, h('label', { className: 'dshm-lab' }, t('label.model')),
                  h('input', { className: 'dshm-input', value: draft.model, onChange: (e) => edit(provider.id, { model: e.target.value }) }))),
              provider.keyless === true
                ? h('div', { className: 'dshm-lab' }, t('key.keylessNote'))
                : h('div', null, h('label', { className: 'dshm-lab' }, provider.configured ? t('key.keep') : t('key.label')),
                    h('div', { className: 'dshm-keywrap' },
                      h('input', { className: 'dshm-input', type: reveal[provider.id] === true ? 'text' : 'password', placeholder: provider.configured ? '••••••••' : t('key.placeholder'), value: draft.key, onChange: (e) => edit(provider.id, { key: e.target.value }) }),
                      h('button', { className: 'dshm-eye', type: 'button', title: reveal[provider.id] === true ? t('key.hide') : t('key.show'), onClick: () => toggleReveal(provider.id) },
                        h(EyeIcon, { open: reveal[provider.id] === true })))),
              h('div', { className: 'dshm-kfoot' },
                provider.docs
                  ? h('a', { href: provider.docs, target: '_blank', rel: 'noreferrer' }, provider.keyless === true ? t('docs.site') : t('docs.get'))
                  : h('span', null, ''),
                h('button', { className: 'dshm-save', disabled: saving === provider.id, onClick: () => save(provider) },
                  saving === provider.id ? t('saving') : t('save'))))
          }),
          adding
            ? h('div', { className: 'dshm-krow' },
                h('div', { className: 'kh' }, h('b', null, t('custom.title')), h('span', null, t('custom.compat'))),
                h('div', { className: 'kf' },
                  h('div', null, h('label', { className: 'dshm-lab' }, t('label.name')),
                    h('input', { className: 'dshm-input', placeholder: t('custom.namePlaceholder'), value: form.label, onChange: (e) => setForm({ ...form, label: e.target.value }) })),
                  h('div', null, h('label', { className: 'dshm-lab' }, t('label.model')),
                    h('input', { className: 'dshm-input', placeholder: t('custom.modelPlaceholder'), value: form.model, onChange: (e) => setForm({ ...form, model: e.target.value }) }))),
                h('div', null, h('label', { className: 'dshm-lab' }, t('label.baseUrl')),
                  h('input', { className: 'dshm-input', placeholder: 'https://api.example.com/v1', value: form.baseUrl, onChange: (e) => setForm({ ...form, baseUrl: e.target.value }) })),
                h('div', null, h('label', { className: 'dshm-lab' }, t('key.optional')),
                  h('div', { className: 'dshm-keywrap' },
                    h('input', { className: 'dshm-input', type: reveal.custom === true ? 'text' : 'password', placeholder: t('key.optionalPlaceholder'), value: form.key, onChange: (e) => setForm({ ...form, key: e.target.value }) }),
                    h('button', { className: 'dshm-eye', type: 'button', title: reveal.custom === true ? t('key.hide') : t('key.show'), onClick: () => toggleReveal('custom') },
                      h(EyeIcon, { open: reveal.custom === true })))),
                h('div', { className: 'dshm-kfoot' },
                  h('a', { href: '#', onClick: (e) => { e.preventDefault(); setAdding(false) } }, t('cancel')),
                  h('button', { className: 'dshm-save', disabled: saving === 'custom', onClick: addCustom },
                    saving === 'custom' ? t('saving') : t('add'))))
            : h('button', { className: 'dshm-addrow', onClick: () => setAdding(true) }, t('custom.add'))),
        error !== null ? h('div', { className: 'dshm-err' }, error) : null)
    }

    function MediaPage() {
      useLocale()
      const [tab, setTab] = React.useState('generate')
      const [status, setStatus] = React.useState(null)
      const [statusError, setStatusError] = React.useState(null)
      const [prompt, setPrompt] = React.useState('')
      const [busy, setBusy] = React.useState(false)
      const [error, setError] = React.useState(null)
      const [works, setWorks] = React.useState(loadWorks)
      const [current, setCurrent] = React.useState(() => loadWorks()[0] ?? null)
      const [selected, setSelected] = React.useState(() => loadWorks()[0]?.id ?? '')
      const [zoom, setZoom] = React.useState(null)
      React.useEffect(() => {
        if (zoom === null) return undefined
        const close = (event) => { if (event.key === 'Escape') setZoom(null) }
        document.addEventListener('keydown', close)
        return () => document.removeEventListener('keydown', close)
      }, [zoom])
      const [providerId, setProviderId] = React.useState(() => readPick().providerId ?? '')
      const [modelId, setModelId] = React.useState(() => readPick().modelId ?? '')
      const [ratio, setRatio] = React.useState(() => RATIOS.find((item) => item.id === readPick().ratio) ?? RATIOS[3])
      const [tier, setTier] = React.useState(() => readPick().tier ?? '1K')

      const refresh = React.useCallback(() => {
        setStatusError(null)
        api('/status').then(setStatus).catch((e) => setStatusError(e.message))
      }, [])
      React.useEffect(() => { if (tab === 'generate') refresh() }, [tab, refresh])
      React.useEffect(() => {
        try {
          localStorage.setItem(PICK_KEY, JSON.stringify({ providerId, modelId, ratio: ratio.id, tier }))
        } catch { /* private mode: remembering is a nicety, not a requirement */ }
      }, [providerId, modelId, ratio, tier])

      const limit = status?.quota?.limit ?? 5
      // Quota is per day, not per lifetime: yesterday's work must not lock the panel.
      const today = new Date().toDateString()
      const usedToday = works.filter((work) => new Date(work.at).toDateString() === today).length
      const left = Math.max(0, limit - usedToday)
      const empty = prompt.trim() === ''
      const imageProviders = (status?.providers ?? []).filter((provider) => String(provider.role ?? '').startsWith('生图'))
      const active = imageProviders.find((provider) => provider.id === providerId && provider.configured)
        ?? imageProviders.find((provider) => provider.configured)
        ?? null
      const modelsOf = (provider) => Array.isArray(provider?.models) && provider.models.length > 0
        ? provider.models
        : [{ id: provider?.model ?? '', label: provider?.label ?? '', desc: '', maxEdge: 1024 }]
      const activeModel = active === null ? null : (modelsOf(active).find((model) => model.id === modelId) ?? modelsOf(active)[0])
      const size = active === null ? '' : sizeOf(ratio, tier, activeModel?.maxEdge)
      // A model swap can leave the tier above what the new model supports; fall back instead of pretending.
      React.useEffect(() => {
        const ceiling = activeModel?.maxEdge ?? 1024
        if ((TIERS.find(([id]) => id === tier)?.[1] ?? 1024) > ceiling) setTier('1K')
      }, [activeModel, tier])
      const sizeLabel = size === '' ? t('size.auto') : size.replace('x', '×')

      const generate = React.useCallback(async () => {
        if (busy || empty || left === 0) return
        setBusy(true); setError(null)
        try {
          const result = await api('/generate', {
            method: 'POST',
            body: JSON.stringify({ prompt, size, provider: active?.id ?? '', model: activeModel?.id ?? '' }),
          })
          const work = {
            id: String(Date.now()), title: titleOf(prompt), prompt, size,
            model: result.model ?? active?.label ?? t('model.unknown'), at: Date.now(),
            src: `/media/file?p=${encodeURIComponent(result.file)}`,
            file: result.file,
            providerId: active?.id ?? '', modelId: activeModel?.id ?? '',
            ratioId: ratio.id, tier,
          }
          const next = [work, ...works]
          setWorks(next); saveWorks(next); setCurrent(work); setSelected(work.id)
        } catch (e) {
          setError(e.message)
        } finally {
          setBusy(false)
        }
      }, [busy, empty, left, prompt, works, active, activeModel, size, ratio.id, tier])

      /** Put a finished work's settings back into the composer. */
      const reuse = (work) => {
        setPrompt(String(work.prompt ?? ''))
        if (work.providerId !== undefined && work.providerId !== '') setProviderId(work.providerId)
        if (work.modelId !== undefined && work.modelId !== '') setModelId(work.modelId)
        const shape = RATIOS.find((item) => item.id === work.ratioId)
        if (shape !== undefined) setRatio(shape)
        if (typeof work.tier === 'string' && work.tier !== '') setTier(work.tier)
        setTab('generate')
      }

      /** Drop the list entry, then the file it points at. */
      const removeWork = async (work) => {
        if (typeof work.file === 'string' && work.file !== '') {
          try {
            await api('/delete', { method: 'POST', body: JSON.stringify({ file: work.file }) })
          } catch { /* the entry still leaves the list; the file is only left behind */ }
        }
        const next = works.filter((item) => item.id !== work.id)
        setWorks(next); saveWorks(next)
        if (selected === work.id) setSelected(next[0]?.id ?? '')
        if (current !== null && current.id === work.id) setCurrent(next[0] ?? null)
      }

      const head = h('div', { className: 'dshm-head' },
        h('div', null,
          h('h1', null, t('title')),
          h('p', null, t('subtitle'))),
        h('span', { className: 'dshm-quota' },
          statusError !== null ? t('state.offline') : status === null ? t('state.reading') : t('quota.left', { n: left })))

      const tabs = h('div', { className: 'dshm-tabs' }, TABS.map((id) =>
        h('button', { key: id, className: 'dshm-tab', 'data-on': String(tab === id), onClick: () => setTab(id) }, t('tab.' + id))))

      let body
      if (tab === 'generate') {
        // One result, framed at the ratio that was asked for while it is still running.
        const shape = ratio.w === 0 ? 1 : ratio.w / ratio.h
        const right = error !== null
          ? h('div', { className: 'dshm-note' }, h('b', null, t('error.title')), error,
              h('div', { style: { marginTop: 14 } },
                h('button', { className: 'dshm-cta', style: { width: 'auto', padding: '0 20px', marginTop: 0 }, onClick: generate }, t('retry'))))
          : busy
            ? h('div', null,
                h('div', { className: 'dshm-shot dshm-skel', style: { aspectRatio: String(shape) } }),
                h('div', { className: 'dshm-label' },
                  h('div', { className: 'top' },
                    h('span', { className: 'dshm-no' }, t('generate.running')),
                    h('span', { className: 'dshm-no' }, sizeLabel)),
                  h('div', { className: 'dshm-spec' }, t('note.busy'))))
            : current !== null
              ? h(Proof, {
                  work: current, mode: 'result', index: 0, total: works.length,
                  onOpen: () => { setSelected(current.id); setTab('works') },
                  onZoom: setZoom,
                })
              : h('div', { className: 'dshm-note' },
                  h('b', null, t('empty.works')),
                  t('empty.generate.body'))

        body = h('div', { className: 'dshm-split' },
          h('div', null,
            h('textarea', {
              className: 'dshm-field',
              placeholder: t('placeholder.prompt'),
              value: prompt,
              onChange: (e) => setPrompt(e.target.value),
              onKeyDown: (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') generate() },
            }),
            h('div', { className: 'dshm-pickers' },
              h(Picker, {
                value: status === null ? t('state.reading') : active === null ? t('model.notConfigured') : (activeModel?.label ?? active.label),
                options: imageProviders.length === 0
                  ? [{ id: 'none', label: t('provider.pickFirst'), disabled: true }]
                  : imageProviders.flatMap((provider) => modelsOf(provider).map((model) => ({
                      id: `${provider.id}|${model.id}`,
                      label: model.label,
                      desc: [provider.label, englishNow() ? (model.descEn ?? model.desc) : model.desc].filter(Boolean).join(' · '),
                      current: active !== null && active.id === provider.id && activeModel?.id === model.id,
                      disabled: !provider.configured,
                    }))),
                onPick: (option) => {
                  const [nextProvider, nextModel] = String(option.id).split('|')
                  setProviderId(nextProvider)
                  setModelId(nextModel)
                },
              }),
              h(RatioPicker, { value: ratio, onPick: setRatio }),
              h(Picker, {
                value: tier,
                options: TIERS.map(([id, edge]) => {
                  const ceiling = activeModel?.maxEdge ?? 1024
                  return edge > ceiling
                    ? { id, label: id, hint: t('tier.ceiling', { n: ceiling }), disabled: true }
                    : { id, label: id, current: id === tier, hint: t('tier.edge', { n: edge }) }
                }),
                onPick: (option) => setTier(option.id),
              }),
              h('span', { className: 'dshm-size' }, sizeLabel)),
            h('button', { className: 'dshm-cta', disabled: busy || empty || left === 0, onClick: generate },
              busy ? t('generate.running') : left === 0 ? t('quota.none') : t('generate')),
            h('div', { className: 'dshm-hint' }, t('hint'))),
          h('div', null, right))
      } else if (tab === 'works') {
        const picked = works.find((work) => work.id === selected) ?? works[0] ?? null
        const pickedIndex = picked === null ? -1 : works.findIndex((work) => work.id === picked.id)
        body = works.length === 0
          ? h('div', { className: 'dshm-note', style: { marginTop: 24 } }, h('b', null, t('empty.works')), t('empty.works.body'),
              h('div', { style: { marginTop: 14 } },
                h('button', { className: 'dshm-cta', style: { width: 'auto', padding: '0 20px', marginTop: 0 }, onClick: () => setTab('generate') }, t('go.generate'))))
          : h('div', { className: 'dshm-works' },
              h('div', { className: 'dshm-grid' }, works.map((work, index) =>
                h('button', {
                  key: work.id, className: 'dshm-work', title: work.prompt,
                  'data-on': String(picked !== null && picked.id === work.id),
                  onClick: () => setSelected(work.id),
                },
                  h('div', { className: 'im' }, h('img', { src: work.src, alt: work.title })),
                  h('div', { className: 't' }, work.title),
                  h('div', { className: 'm' }, `No. ${frameNo(index, works.length)} · ${work.size === '' ? t('work.defaultSize') : String(work.size).replace('x', '×')}`)))),
              h(Proof, {
                work: picked, mode: 'detail', index: pickedIndex, total: works.length,
                onReuse: reuse, onDelete: removeWork, onZoom: setZoom,
              }))
      } else {
        body = h(KeysTab, { status, onSaved: refresh })
      }

      return h('div', { className: 'dshm-page' },
        h('div', { className: 'dshm-inner' }, head, tabs, body),
        zoom === null
          ? null
          : h('div', { className: 'dshm-zoom', onClick: () => setZoom(null) },
              h('img', { src: zoom.src, alt: zoom.title }),
              h('div', { className: 'dshm-zoombar', onClick: (event) => event.stopPropagation() },
                h('span', null, zoom.title),
                h('a', { href: zoom.src, target: '_blank', rel: 'noreferrer' }, t('zoom.open')),
                h('button', { type: 'button', onClick: () => setZoom(null) }, t('zoom.close')))))
    }

    function apply(ctx) {
      ensureStyles()
      if (ctx.locale !== undefined) {
        localeCtx = ctx.locale
        ctx.effect(() => ctx.locale.register(NS, COPY), 'dsh-media-skills: dictionaries')
        t = ctx.locale.bind(NS)
      }
      ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 20,
        // A function keeps the row label in step with the language switch.
        label: () => t('panel'),
        locale: NS,
      }, PanelIcon))
      ctx.slots.inject('main', () => ctx.slots.register({
        name: 'main',
        key: PANEL_ID,
      }, MediaPage))
    }

    exports.name = 'dsh-media-skills'
    exports.apply = apply
    exports.inject = ['slots', 'locale']
    return module.exports
  },
})
