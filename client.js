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
    const PANEL_ID = 'media-desk'
    const TABS = [['generate', '生成'], ['works', '作品'], ['keys', '密钥']]

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

.dshm-cta {
  margin-top: 16px; height: 36px; border-radius: 18px; border: 0; cursor: pointer; width: 100%;
  background: var(--dsw-alias-button-primary-fill, #0f1115); color: var(--dsw-alias-label-primary-foreground, #fff);
  font: inherit; font-size: 14px; font-weight: 500;
}
.dshm-cta:disabled { background: var(--dsw-alias-bg-layer-2, #f2f3f5); color: var(--dsw-alias-label-caption, #adb2b8); cursor: not-allowed; border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.12)); }

.dshm-shot { border-radius: 12px; overflow: hidden; background: var(--dsw-alias-bg-layer-2, #f2f3f5); aspect-ratio: 16 / 9; display: flex; align-items: center; justify-content: center; }
.dshm-shot img { width: 100%; height: 100%; object-fit: cover; display: block; }
.dshm-caption { margin-top: 12px; }
.dshm-caption h4 { margin: 0 0 4px; font-size: 14px; font-weight: 500; }
.dshm-caption p { margin: 0; font-size: 12.5px; line-height: 1.65; color: var(--dsw-alias-label-tertiary, #81858c); }

.dshm-note {
  border: 1px dashed var(--dsw-alias-border-l2, rgba(0,0,0,.12)); border-radius: 12px;
  padding: 40px 24px; text-align: center; font-size: 13px; line-height: 1.7;
  color: var(--dsw-alias-label-caption, #adb2b8);
}
.dshm-note b { display: block; font-size: 14px; font-weight: 500; color: var(--dsw-alias-label-secondary, #61666b); margin-bottom: 6px; }

.dshm-strip { display: flex; gap: 10px; margin-top: 18px; }
.dshm-thumb { flex: 1; height: 54px; border-radius: 8px; overflow: hidden; background: var(--dsw-alias-bg-layer-2, #f2f3f5); opacity: .5; border: 0; padding: 0; cursor: pointer; }
.dshm-thumb[data-on="true"] { opacity: 1; box-shadow: 0 0 0 2px var(--dsw-alias-label-primary, #0f1115); }
.dshm-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

.dshm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; margin-top: 24px; }
.dshm-work { text-align: left; background: none; border: 0; padding: 0; cursor: pointer; font: inherit; color: inherit; }
.dshm-work .im { border-radius: 10px; overflow: hidden; background: var(--dsw-alias-bg-layer-2, #f2f3f5); aspect-ratio: 16 / 10; }
.dshm-work img { width: 100%; height: 100%; object-fit: cover; display: block; }
.dshm-work .t { margin-top: 8px; font-size: 13px; color: var(--dsw-alias-label-secondary, #61666b); }
.dshm-work .m { margin-top: 2px; font-size: 12px; color: var(--dsw-alias-label-caption, #adb2b8); }

.dshm-keys { margin-top: 24px; display: grid; gap: 12px; max-width: 620px; }
.dshm-key { border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.12)); border-radius: 12px; padding: 14px 16px; }
.dshm-key .n { display: flex; align-items: center; justify-content: space-between; font-size: 14px; }
.dshm-key .s { font-size: 12px; color: var(--dsw-alias-label-tertiary, #81858c); display: flex; align-items: center; gap: 6px; }
.dshm-key .s::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: #2f7d5c; }
.dshm-key[data-off="true"] .s::before { background: var(--dsw-alias-label-caption, #adb2b8); }
.dshm-key .v { margin-top: 6px; font-size: 12.5px; color: var(--dsw-alias-label-caption, #adb2b8); }
.dshm-hint { margin-top: 16px; font-size: 12.5px; color: var(--dsw-alias-label-tertiary, #81858c); line-height: 1.7; }
`

    function ensureStyles() {
      if (document.getElementById(STYLE_ID) !== null) return
      const style = document.createElement('style')
      style.id = STYLE_ID
      style.textContent = CSS
      document.head.appendChild(style)
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

    function saveWorks(works) {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(works.slice(0, 60))) } catch { /* storage blocked */ }
    }

    function titleOf(prompt) {
      const clean = String(prompt).replace(/\s+/g, ' ').trim()
      return clean.length > 18 ? `${clean.slice(0, 18)}…` : clean
    }

    function MediaPage() {
      const [tab, setTab] = React.useState('generate')
      const [status, setStatus] = React.useState(null)
      const [statusError, setStatusError] = React.useState(null)
      const [prompt, setPrompt] = React.useState('')
      const [busy, setBusy] = React.useState(false)
      const [error, setError] = React.useState(null)
      const [works, setWorks] = React.useState(loadWorks)
      const [current, setCurrent] = React.useState(() => loadWorks()[0] ?? null)

      const refresh = React.useCallback(() => {
        setStatusError(null)
        api('/status').then(setStatus).catch((e) => setStatusError(e.message))
      }, [])
      React.useEffect(refresh, [refresh])

      const limit = status?.quota?.limit ?? 5
      const left = Math.max(0, limit - works.length)
      const empty = prompt.trim() === ''
      const model = status?.providers?.find((p) => p.configured)?.label ?? '未配置密钥'

      const generate = React.useCallback(async () => {
        if (busy || empty || left === 0) return
        setBusy(true); setError(null)
        try {
          const size = '16:9'
          const result = await api('/generate', { method: 'POST', body: JSON.stringify({ prompt, size }) })
          const work = {
            id: String(Date.now()), title: titleOf(prompt), prompt, size,
            model, at: Date.now(),
            src: `/media/file?p=${encodeURIComponent(result.file)}`,
          }
          const next = [work, ...works]
          setWorks(next); saveWorks(next); setCurrent(work)
        } catch (e) {
          setError(e.message)
        } finally {
          setBusy(false)
        }
      }, [busy, empty, left, prompt, works, model])

      const head = h('div', { className: 'dshm-head' },
        h('div', null,
          h('h1', null, '创作'),
          h('p', null, '生成图片，回看作品')),
        h('span', { className: 'dshm-quota' },
          statusError !== null ? '无法连接' : `本次还剩 ${left} 张`))

      const tabs = h('div', { className: 'dshm-tabs' }, TABS.map(([id, label]) =>
        h('button', { key: id, className: 'dshm-tab', 'data-on': String(tab === id), onClick: () => setTab(id) }, label)))

      let body
      if (tab === 'generate') {
        const right = error !== null
          ? h('div', { className: 'dshm-note' }, h('b', null, '生成失败。'), error,
              h('div', { style: { marginTop: 14 } },
                h('button', { className: 'dshm-cta', style: { width: 'auto', padding: '0 20px', marginTop: 0 }, onClick: generate }, '重试')))
          : current !== null
            ? h('div', null,
                h('div', { className: 'dshm-shot' }, h('img', { src: current.src, alt: current.title })),
                h('div', { className: 'dshm-caption' },
                  h('h4', null, current.title),
                  h('p', null, `${current.model} · ${current.size} · ${new Date(current.at).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`)))
            : h('div', { className: 'dshm-note' },
                h('b', null, '暂无作品。'),
                '生成的第一张会出现在这里，可以随时回来复用它的参数。')

        body = h('div', { className: 'dshm-split' },
          h('div', null,
            h('textarea', {
              className: 'dshm-field',
              placeholder: '描述你想要的画面，比如「雨夜街角，霓虹倒影，35mm 电影感」',
              value: prompt,
              onChange: (e) => setPrompt(e.target.value),
              onKeyDown: (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') generate() },
            }),
            h('div', { className: 'dshm-row' },
              h('b', null, model), h('span', { className: 'dshm-dot' }), h('span', null, '16:9'),
              h('span', { className: 'dshm-dot' }), h('span', null, '1024×576')),
            h('button', { className: 'dshm-cta', disabled: busy || empty || left === 0, onClick: generate },
              busy ? '生成中…' : left === 0 ? '本次配额已用完' : '生成'),
            h('div', { className: 'dshm-hint' }, '⌘⏎ 直接生成。结果只写进本机工作区，不会上传。')),
          h('div', null, right,
            works.length > 0
              ? h('div', { className: 'dshm-strip' }, works.slice(0, 5).map((work) =>
                  h('button', { key: work.id, className: 'dshm-thumb', 'data-on': String(current?.id === work.id), onClick: () => setCurrent(work), title: work.title },
                    h('img', { src: work.src, alt: work.title }))))
              : null))
      } else if (tab === 'works') {
        body = works.length === 0
          ? h('div', { className: 'dshm-note', style: { marginTop: 24 } }, h('b', null, '暂无作品。'), '生成过的图片会按时间排列在这里。')
          : h('div', { className: 'dshm-grid' }, works.map((work) =>
              h('button', { key: work.id, className: 'dshm-work', onClick: () => { setCurrent(work); setTab('generate') } },
                h('div', { className: 'im' }, h('img', { src: work.src, alt: work.title })),
                h('div', { className: 't' }, work.title),
                h('div', { className: 'm' }, `${new Date(work.at).toLocaleDateString('zh-CN')} · ${work.size}`))))
      } else {
        const providers = status?.providers ?? []
        body = h('div', null,
          h('div', { className: 'dshm-keys' }, providers.map((p) =>
            h('div', { key: p.id, className: 'dshm-key', 'data-off': String(!p.configured) },
              h('div', { className: 'n' }, p.label, h('span', { className: 's' }, p.configured ? '已配置' : '未配置')),
              h('div', { className: 'v' }, p.role)))),
          h('div', { className: 'dshm-hint' }, '密钥保存在本机凭据服务里，也可以继续用 media-tools.env。'))
      }

      return h('div', { className: 'dshm-page' },
        h('div', { className: 'dshm-inner' }, head, tabs, body))
    }

    function apply(ctx) {
      ensureStyles()
      ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
        name: 'sidebar.panellist',
        id: PANEL_ID,
        order: 20,
        label: '创作',
      }, PanelIcon))
      ctx.slots.inject('main', () => ctx.slots.register({
        name: 'main',
        key: PANEL_ID,
      }, MediaPage))
    }

    exports.name = 'dsh-media-skills'
    exports.apply = apply
    exports.inject = ['slots']
    return module.exports
  },
})
