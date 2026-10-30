/**
 * DeepSeek Harness v0.1.6+ runtime bundle for free media skills.
 *
 * Runtime-verified against desktop 0.2.0-rc.2; the same contract was
 * source-checked against upstream tag dsh-v0.2.1-alpha.2.
 *
 * The bundle contributes two skills:
 * - `vision-review`: read images and inspect screenshots/visual design;
 * - `media-tools`: generate illustrations and other image assets.
 *
 * Skill metadata is read directly from each skill's own `SKILL.md`, so the
 * provider and the filesystem catalog cannot describe the same skill with
 * different copy. The plugin does not mutate model/settings configuration:
 * DSH's model and plugin managers own provider setup, enabling, disabling and
 * runtime unloading. API keys remain in the user's environment or credential
 * files and are never bundled.
 *
 * @module dsh-media-skills
 */

import { createReadStream, mkdirSync, readFileSync, statSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const PROVIDER_NAME = 'dsh-media-skills'
const SKILL_NAMES = ['vision-review', 'media-tools']

function skillPath(name, ...parts) {
  return fileURLToPath(new URL(`./skills/${name}/${parts.join('/')}`, import.meta.url))
}

function frontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
  if (!match) throw new Error('skill is missing YAML frontmatter')

  const text = match[1]
  const name = /^name:\s*(.+?)\s*$/m.exec(text)?.[1]
  const quotedDescription = /^description:\s*"([^"]*)"\s*$/m.exec(text)?.[1]
  const plainDescription = /^description:\s*(?!["'])(.+?)\s*$/m.exec(text)?.[1]
  const description = quotedDescription ?? plainDescription

  if (!name || !description) {
    throw new Error('skill frontmatter must include name and a single-line description')
  }
  return { name, description, bodyStart: match[0].length }
}

function createProvider() {
  const candidates = SKILL_NAMES.map((name) => {
    const directory = skillPath(name)
    const body = join(directory, 'SKILL.md')
    const metadata = frontmatter(readFileSync(body, 'utf8'))
    if (metadata.name !== name) throw new Error(`${body} declares ${metadata.name}, expected ${name}`)
    return {
      path: body,
      name,
      description: metadata.description,
      invocation: { modelInvocable: true, userInvocable: true },
      provider: PROVIDER_NAME,
      source: 'bundled',
      resourceBase: { kind: 'directory', path: directory },
      rank: 600,
      locator: { body, bodyStart: metadata.bodyStart },
    }
  })

  return {
    name: PROVIDER_NAME,
    list: (_options) => Promise.resolve(candidates),
    async get(candidate, options = {}) {
      const selected = candidates.find((item) => (
        item.name === candidate?.name && item.provider === candidate?.provider
      ))
      if (!selected) return undefined
      const { rank: _rank, locator, ...summary } = selected
      const raw = await readFile(locator.body, { encoding: 'utf8', signal: options.signal })
      return { ...summary, content: raw.slice(locator.bodyStart).trim() }
    },
  }
}

/** Cordis plugin name. */
export const name = PROVIDER_NAME
/** Service required by the bundled provider. */
export const inject = ['skills']

/**
 * Register bundled skills.
 *
 * The registration is tied to this plugin's fiber by DSH; toggling or
 * uninstalling the bundle removes the provider without extra global state.
 */
export function apply(ctx) {
  ctx.skills.registerProvider(createProvider)
  // Optional: only compositions with a web server get the media routes, so the
  // headless CLI keeps loading this bundle with skills alone. `inject` is
  // absent on the bare harness the package's own checks use.
  if (typeof ctx.inject !== 'function') return
  ctx.inject(['webServer'], (webCtx) => {
    webCtx.effect(() => {
      const handler = createMediaHandler({
        workspaceRoot: () => webCtx.get('workspace')?.root ?? process.cwd(),
      })
      const unregister = webCtx.webServer.register({
        kind: 'prefix',
        path: MEDIA_PREFIX,
        handler,
      })
      return () => unregister()
    }, 'dsh-media-skills: /media routes')
  })
}

/** Route prefix owned by this bundle; never overlaps the kernel's `/api`. */
const MEDIA_PREFIX = '/media'

/** Providers the bundled skills know how to drive. */
const PROVIDERS = [
  { id: 'sensenova', label: 'SenseNova U1', env: 'SENSENOVA_API_KEY', role: '主用' },
  { id: 'siliconflow', label: 'SiliconFlow Kolors', env: 'SILICONFLOW_API_KEY', role: '备用' },
  { id: 'gemini', label: 'Gemini', env: 'GEMINI_API_KEY', role: '视觉' },
]

/** Parse `KEY=value` lines out of one secrets file; missing files read as empty. */
function readSecretFile(file) {
  try {
    const out = {}
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
      const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim())
      if (match !== null) out[match[1]] = match[2].trim()
    }
    return out
  } catch {
    return {}
  }
}

/** The secrets the skills themselves read, in the same precedence order. */
function secretsOf() {
  const home = process.env.DSH_HOME ?? join(homedir(), '.dsh')
  return {
    ...readSecretFile(join(homedir(), '.codex', 'secrets', 'media-tools.env')),
    ...readSecretFile(join(home, 'secrets', 'media-tools.env')),
  }
}

/** Provider table plus the package version, for the panel's 密钥 tab. */
export function mediaStatus() {
  const secrets = secretsOf()
  return {
    ok: true,
    version: JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')).version,
    providers: PROVIDERS.map((provider) => ({
      id: provider.id,
      label: provider.label,
      role: provider.role,
      configured: Boolean(process.env[provider.env] ?? secrets[provider.env]),
    })),
    quota: { limit: 5 },
  }
}

/** Reject cross-site callers: the panel is same-origin, a web page is not. */
export function originAllowed(req) {
  const host = req.headers.host
  if (typeof host !== 'string' || host === '') return false
  const origin = req.headers.origin ?? req.headers.referer
  if (origin === undefined) return true
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

/** Run the same `generate.py` the media-tools skill runs — one implementation. */
export function runGenerate({ prompt, size, out, timeoutMs = 180_000 }) {
  const script = fileURLToPath(new URL('./skills/media-tools/scripts/generate.py', import.meta.url))
  return new Promise((resolve) => {
    let stderr = ''
    const child = spawn('python3', [script, prompt, out, size], { cwd: dirname(script) })
    const timer = setTimeout(() => child.kill('SIGTERM'), timeoutMs)
    child.stderr.on('data', (chunk) => { stderr += String(chunk) })
    child.on('error', (error) => { clearTimeout(timer); resolve({ ok: false, message: error.message }) })
    child.on('close', (code) => {
      clearTimeout(timer)
      if (code === 0) resolve({ ok: true, file: out })
      else resolve({ ok: false, message: stderr.trim().split(/\r?\n/).slice(-3).join(' ') || `退出码 ${code}` })
    })
  })
}

/** The `/media` prefix handler: status, generate, and the generated file itself. */
export function createMediaHandler({ workspaceRoot } = {}) {
  const root = () => (typeof workspaceRoot === 'function' ? workspaceRoot() : process.cwd())
  return async function mediaHandler(req, res) {
    if (!originAllowed(req)) {
      res.writeHead(403, { 'content-type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify({ ok: false, message: 'cross-site request refused' }))
      return
    }
    const url = new URL(req.url ?? '/', 'http://localhost')
    const route = url.pathname.slice(MEDIA_PREFIX.length) || '/'

    if (route === '/status' && req.method === 'GET') {
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
      res.end(JSON.stringify(mediaStatus()))
      return
    }

    if (route === '/generate' && req.method === 'POST') {
      let body = ''
      for await (const chunk of req) body += String(chunk)
      let parsed = {}
      try { parsed = JSON.parse(body || '{}') } catch { parsed = {} }
      const prompt = String(parsed.prompt ?? '').trim()
      if (prompt === '') {
        res.writeHead(400, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ ok: false, message: '提示词不能为空。' }))
        return
      }
      const size = String(parsed.size ?? '1024x1024')
      const dir = join(root(), 'uploads', 'media')
      mkdirSync(dir, { recursive: true })
      const out = join(dir, `${Date.now()}.png`)
      const result = await runGenerate({ prompt, size, out })
      res.writeHead(result.ok ? 200 : 502, { 'content-type': 'application/json; charset=utf-8' })
      res.end(JSON.stringify(result))
      return
    }

    if (route === '/file' && req.method === 'GET') {
      const target = url.searchParams.get('p')
      const base = join(root(), 'uploads', 'media')
      // Only ever serve files this plugin wrote: resolved path must sit inside
      // the media directory, so a crafted `?p=` cannot read arbitrary files.
      if (target === null || !target.startsWith(base + '/')) {
        res.writeHead(403, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ ok: false, message: 'path outside the media directory' }))
        return
      }
      let size = 0
      try { size = statSync(target).size } catch {
        res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify({ ok: false, message: 'file not found' }))
        return
      }
      res.writeHead(200, { 'content-type': 'image/png', 'content-length': size, 'cache-control': 'no-store' })
      createReadStream(target).pipe(res)
      return
    }

    res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify({ ok: false, message: 'not found' }))
  }
}
