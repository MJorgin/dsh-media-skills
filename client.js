/**
 * Browser half of dsh-media-skills: the sidebar footer-action entry and the
 * media panel (生成 / 作品 / 密钥).
 *
 * Hand-authored in the client module-loader format — no build step. React and
 * react/jsx-runtime are baseline modules; everything else is plain DOM.
 *
 * Styling uses the host's own `--dsw-alias-*` tokens, so light/dark follow the
 * app theme instead of shipping a second palette.
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
    const TABS = [['generate', '生成'], ['works', '作品'], ['keys', '密钥']]

    const CSS = `
.dshm-anchor { position: relative; display: block; }
.dshm-entry {
  display: flex; align-items: center; gap: 8px; width: 100%;
  height: 28px; padding: 0 10px; border: 0; border-radius: 14px;
  background: transparent; color: var(--dsw-alias-label-secondary, #61666b);
  font: inherit; font-size: 13px; cursor: pointer; text-align: left;
}
.dshm-entry:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,.04)); }
.dshm-entry[data-open="true"] { background: var(--dsw-alias-interactive-bg-hover, rgba(0,0,0,.04)); color: var(--dsw-alias-label-primary, #0f1115); }
.dshm-entry svg { flex: none; }

.dshm-panel {
  position: absolute; left: calc(100% + 10px); bottom: 0; width: 420px;
  max-height: min(600px, calc(100vh - 40px)); display: flex; flex-direction: column;
  background: var(--dsw-alias-bg-base, #fff); color: var(--dsw-alias-label-primary, #0f1115);
  border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.1)); border-radius: 16px;
  box-shadow: 0 24px 56px -24px rgba(0,0,0,.55); z-index: 40; overflow: hidden;
  font-family: var(--dsw-font-family, -apple-system, "PingFang SC", system-ui, sans-serif);
}
.dshm-head { display: flex; align-items: baseline; justify-content: space-between; padding: 16px 18px 0; }
.dshm-title { font-size: 15px; font-weight: 600; margin: 0; }
.dshm-quota { font-size: 11.5px; color: var(--dsw-alias-label-tertiary, #81858c); }
.dshm-tabs { display: flex; gap: 18px; margin: 14px 18px 0; border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(0,0,0,.04)); }
.dshm-tab {
  font: inherit; font-size: 12.5px; color: var(--dsw-alias-label-tertiary, #81858c);
  background: none; border: 0; padding: 0 0 8px; cursor: pointer; position: relative;
}
.dshm-tab[data-on="true"] { color: var(--dsw-alias-label-primary, #0f1115); font-weight: 500; }
.dshm-tab[data-on="true"]::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: -1px; height: 1.5px;
  background: var(--dsw-alias-label-primary, #0f1115);
}
.dshm-body { padding: 14px 18px 16px; display: flex; flex-direction: column; gap: 10px; overflow: auto; }

.dshm-field {
  width: 100%; min-height: 58px; resize: none; box-sizing: border-box;
  border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.1)); border-radius: 8px;
  background: var(--dsw-alias-bg-base, #fff); color: inherit;
  font: inherit; font-size: 13px; line-height: 1.55; padding: 9px 11px; outline: none;
}
.dshm-field:focus { border-color: var(--dsw-alias-label-tertiary, #81858c); }
.dshm-field::placeholder { color: var(--dsw-alias-label-caption, #adb2b8); }

.dshm-meta { display: flex; align-items: center; gap: 7px; font-size: 11.5px; color: var(--dsw-alias-label-tertiary, #81858c); }
.dshm-meta b { font-weight: 500; color: var(--dsw-alias-label-secondary, #61666b); }
.dshm-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--dsw-alias-label-caption, #adb2b8); }

.dshm-cta {
  height: 34px; border-radius: 17px; border: 0; cursor: pointer;
  background: var(--dsw-alias-button-primary-fill, #0f1115); color: var(--dsw-alias-label-primary-foreground, #fff);
  font: inherit; font-size: 13px; font-weight: 500;
}
.dshm-cta:disabled { background: var(--dsw-alias-bg-layer-2, #f9fafb); color: var(--dsw-alias-label-caption, #adb2b8); cursor: not-allowed; border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.1)); }

.dshm-shot { border-radius: 10px; overflow: hidden; background: var(--dsw-alias-bg-layer-2, #f2f3f5); aspect-ratio: 16 / 9; display: flex; align-items: center; justify-content: center; }
.dshm-shot img { width: 100%; height: 100%; object-fit: cover; display: block; }
.dshm-note {
  border: 1px dashed var(--dsw-alias-border-l2, rgba(0,0,0,.1)); border-radius: 10px;
  padding: 20px 16px; text-align: center; font-size: 11.5px; line-height: 1.7;
  color: var(--dsw-alias-label-caption, #adb2b8);
}
.dshm-note b { display: block; font-size: 12.5px; font-weight: 500; color: var(--dsw-alias-label-secondary, #61666b); margin-bottom: 4px; }
.dshm-caption { padding-top: 10px; border-top: 1px solid var(--dsw-alias-border-l1, rgba(0,0,0,.04)); }
.dshm-caption h4 { margin: 0 0 3px; font-size: 12.5px; font-weight: 500; }
.dshm-caption p { margin: 0; font-size: 11.5px; line-height: 1.6; color: var(--dsw-alias-label-tertiary, #81858c); }

.dshm-strip { display: flex; gap: 7px; }
.dshm-thumb { flex: 1; height: 36px; border-radius: 6px; overflow: hidden; background: var(--dsw-alias-bg-layer-2, #f2f3f5); opacity: .55; border: 0; padding: 0; cursor: pointer; }
.dshm-thumb[data-on="true"] { opacity: 1; box-shadow: 0 0 0 1.5px var(--dsw-alias-label-primary, #0f1115); }
.dshm-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

.dshm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.dshm-work { text-align: left; background: none; border: 0; padding: 0; cursor: pointer; font: inherit; color: inherit; }
.dshm-work .im { height: 84px; border-radius: 8px; overflow: hidden; background: var(--dsw-alias-bg-layer-2, #f2f3f5); }
.dshm-work img { width: 100%; height: 100%; object-fit: cover; display: block; }
.dshm-work .t { margin-top: 5px; font-size: 11.5px; color: var(--dsw-alias-label-secondary, #61666b); }
.dshm-work .m { font-size: 10.5px; color: var(--dsw-alias-label-caption, #adb2b8); }

.dshm-key { border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.1)); border-radius: 10px; padding: 10px 12px; }
.dshm-key .n { display: flex; align-items: center; justify-content: space-between; font-size: 12.5px; }
.dshm-key .s { font-size: 11px; color: var(--dsw-alias-label-tertiary, #81858c); display: flex; align-items: center; gap: 5px; }
.dshm-key .s::before { content: ""; width: 5px; height: 5px; border-radius: 50%; background: #2f7d5c; }
.dshm-key[data-off="true"] .s::before { background: var(--dsw-alias-label-caption, #adb2b8); }
.dshm-key .v { margin-top: 5px; font-size: 11.5px; color: var(--dsw-alias-label-caption, #adb2b8); }
.dshm-hint { font-size: 11.5px; color: var(--dsw-alias-label-tertiary, #81858c); line-height: 1.6; }
`

    function ensureStyles() {
      if (document.getElementById(STYLE_ID) !== null) return
      const style = document.createElement('style')
      style.id = STYLE_ID
      style.textContent = CSS
      document.head.appendChild(style)
    }

    function Icon() {
      return h('svg', { viewBox: '0 0 16 16', width: 15, height: 15, fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
        h('rect', { x: 1.8, y: 2.6, width: 12.4, height: 10.8, rx: 1.6 }),
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
      try { localStorage.setItem(STORE_KEY, JSON.stringify(works.slice(0, 60))) } catch { /* storage full or blocked */ }
    }

    function titleOf(prompt) {
      const clean = String(prompt).replace(/\s+/g, ' ').trim()
      return clean.length > 14 ? `${clean.slice(0, 14)}…` : clean
    }

    function Panel({ onClose }) {
      const [tab, setTab] = React.useState('generate')
      const [status, setStatus] = React.useState(null)
      const [statusError, setStatusError] = React.useState(null)
      const [prompt, setPrompt] = React.useState('')
      const [busy, setBusy] = React.useState(false)
      const [error, setError] = React.useState(null)
      const [current, setCurrent] = React.useState(null)
      const [works, setWorks] = React.useState(loadWorks)

      const refresh = React.useCallback(() => {
        setStatusError(null)
        api('/status').then(setStatus).catch((e) => setStatusError(e.message))
      }, [])
      React.useEffect(refresh, [refresh])

      const limit = status?.quota?.limit ?? 5
      const used = works.length
      const left = Math.max(0, limit - used)
      const empty = prompt.trim() === ''

      const generate = React.useCallback(async () => {
        if (busy || empty || left === 0) return
        setBusy(true); setError(null)
        try {
          const size = '16:9'
          const result = await api('/generate', { method: 'POST', body: JSON.stringify({ prompt, size }) })
          const work = {
            id: String(Date.now()),
            title: titleOf(prompt),
            prompt,
            size,
            model: status?.providers?.find((p) => p.configured)?.label ?? '未配置',
            at: Date.now(),
            src: `/media/file?p=${encodeURIComponent(result.file)}`,
          }
          const next = [work, ...works]
          setWorks(next); saveWorks(next); setCurrent(work)
        } catch (e) {
          setError(e.message)
        } finally {
          setBusy(false)
        }
      }, [busy, empty, left, prompt, status, works])

      const head = h('div', { className: 'dshm-head' },
        h('h3', { className: 'dshm-title' }, '创作'),
        h('span', { className: 'dshm-quota' }, statusError !== null ? '无法连接' : `本次还剩 ${left} 张`))

      const tabs = h('div', { className: 'dshm-tabs' }, TABS.map(([id, label]) =>
        h('button', { key: id, className: 'dshm-tab', 'data-on': String(tab === id), onClick: () => setTab(id) }, label)))

      let body
      if (tab === 'generate') {
        body = h('div', { className: 'dshm-body' },
          h('textarea', {
            className: 'dshm-field',
            placeholder: '描述你想要的画面，比如「雨夜街角，霓虹倒影」',
            value: prompt,
            onChange: (e) => setPrompt(e.target.value),
            onKeyDown: (e) => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') generate() },
          }),
          h('div', { className: 'dshm-meta' },
            h('b', null, status?.providers?.find((p) => p.configured)?.label ?? '未配置密钥'),
            h('span', { className: 'dshm-dot' }), h('span', null, '16:9'),
            h('span', { className: 'dshm-dot' }), h('span', null, '1024×576')),
          h('button', { className: 'dshm-cta', disabled: busy || empty || left === 0, onClick: generate },
            busy ? '生成中…' : left === 0 ? '本次配额已用完' : '生成'),
          error !== null
            ? h('div', { className: 'dshm-note' }, h('b', null, '生成失败。'), error,
                h('div', { style: { marginTop: 8 } },
                  h('button', { className: 'dshm-cta', style: { height: 28, padding: '0 14px', width: 'auto' }, onClick: generate }, '重试')))
            : current !== null
              ? h('div', null,
                  h('div', { className: 'dshm-shot' }, h('img', { src: current.src, alt: current.title })),
                  h('div', { className: 'dshm-caption' },
                    h('h4', null, current.title),
                    h('p', null, `${current.model} · ${current.size} · ${new Date(current.at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`)))
              : h('div', { className: 'dshm-note' },
                  h('b', null, '暂无作品。'),
                  '生成的第一张会出现在这里，可以随时回来复用它的参数。'),
          works.length > 0
            ? h('div', { className: 'dshm-strip' }, works.slice(0, 4).map((work) =>
                h('button', { key: work.id, className: 'dshm-thumb', 'data-on': String(current?.id === work.id), onClick: () => setCurrent(work), title: work.title },
                  h('img', { src: work.src, alt: work.title }))))
            : null)
      } else if (tab === 'works') {
        body = h('div', { className: 'dshm-body' },
          works.length === 0
            ? h('div', { className: 'dshm-note' }, h('b', null, '暂无作品。'), '生成过的图片会按时间排列在这里。')
            : h('div', { className: 'dshm-grid' }, works.map((work) =>
                h('button', { key: work.id, className: 'dshm-work', onClick: () => { setCurrent(work); setTab('generate') } },
                  h('div', { className: 'im' }, h('img', { src: work.src, alt: work.title })),
                  h('div', { className: 't' }, work.title),
                  h('div', { className: 'm' }, `${new Date(work.at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} · ${work.size}`)))))
      } else {
        const providers = status?.providers ?? []
        body = h('div', { className: 'dshm-body' },
          providers.length === 0
            ? h('div', { className: 'dshm-note' }, h('b', null, '未配置密钥。'), statusError ?? '读取状态失败。')
            : providers.map((p) => h('div', { key: p.id, className: 'dshm-key', 'data-off': String(!p.configured) },
                h('div', { className: 'n' }, p.label, h('span', { className: 's' }, p.configured ? '已配置' : '未配置')),
                h('div', { className: 'v' }, p.role))),
          h('div', { className: 'dshm-hint' }, '密钥保存在本机凭据服务里，也可以继续用 media-tools.env。'))
      }

      return h('div', { className: 'dshm-panel', role: 'dialog', 'aria-label': '创作' },
        head, tabs, body)
    }

    function Entry(props) {
      const [open, setOpen] = React.useState(false)
      const ref = React.useRef(null)
      React.useEffect(() => {
        if (!open) return undefined
        const onDown = (event) => { if (ref.current !== null && !ref.current.contains(event.target)) setOpen(false) }
        const onKey = (event) => { if (event.key === 'Escape') setOpen(false) }
        document.addEventListener('mousedown', onDown)
        document.addEventListener('keydown', onKey)
        return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
      }, [open])
      return h('div', { className: 'dshm-anchor', ref },
        h('button', { className: 'dshm-entry', 'data-open': String(open), title: '创作', 'aria-label': '创作', onClick: () => setOpen((v) => !v) },
          h(Icon, null),
          props?.wide === false ? null : h('span', null, '创作')),
        open ? h(Panel, { onClose: () => setOpen(false) }) : null)
    }

    function apply(ctx) {
      ensureStyles()
      ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register({
        name: 'sidebar.footer.action',
        id: 'media-desk',
        order: 100,
      }, Entry))
    }

    exports.name = 'dsh-media-skills'
    exports.apply = apply
    exports.inject = ['slots']
    return module.exports
  },
})
