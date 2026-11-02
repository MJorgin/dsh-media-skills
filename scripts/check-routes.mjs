/**
 * Route-level checks for the panel's `/media` handler.
 *
 * The handler talks to plain `http.IncomingMessage`/`ServerResponse` objects,
 * so the tests drive it with a fake pair instead of opening a socket. Every
 * case here is about a boundary the browser can reach: what it may read, what
 * it may delete, and what a cross-site page is allowed to ask for.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createMediaHandler } from '../index.js'

const HOST = '127.0.0.1:49166'

/** Run one request through the handler and collect the response. */
function call(handler, { method = 'GET', url = '/', body, headers = {} } = {}) {
  const chunks = body === undefined ? [] : [Buffer.from(JSON.stringify(body))]
  const req = {
    method,
    url,
    headers: { host: HOST, ...headers },
    async *[Symbol.asyncIterator]() {
      for (const chunk of chunks) yield chunk
    },
  }
  const out = { status: 0, headers: null, body: '' }
  const res = {
    writeHead(status, nextHeaders) { out.status = status; out.headers = nextHeaders },
    end(chunk) { if (chunk !== undefined) out.body += String(chunk) },
  }
  return Promise.resolve(handler(req, res)).then(() => out)
}

/** A workspace with one finished picture in `uploads/media`. */
function workspace() {
  const root = mkdtempSync(join(tmpdir(), 'dsh-media-routes-'))
  const dir = join(root, 'uploads', 'media')
  mkdirSync(dir, { recursive: true })
  const file = join(dir, '1700000000000.png')
  writeFileSync(file, Buffer.from('89504e470d0a1a0a', 'hex'))
  return { root, dir, file }
}

test('status answers with the provider table', async () => {
  const { root } = workspace()
  try {
    const handler = createMediaHandler({ workspaceRoot: () => root })
    const out = await call(handler, { url: '/media/status' })
    assert.equal(out.status, 200)
    const body = JSON.parse(out.body)
    assert.ok(Array.isArray(body.providers) && body.providers.length > 0)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('a request without a host header is refused', async () => {
  const { root } = workspace()
  try {
    const handler = createMediaHandler({ workspaceRoot: () => root })
    const out = await call(handler, { url: '/media/status', headers: { host: '' } })
    assert.equal(out.status, 403)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('a cross-site origin is refused', async () => {
  const { root } = workspace()
  try {
    const handler = createMediaHandler({ workspaceRoot: () => root })
    const out = await call(handler, { url: '/media/status', headers: { origin: 'https://evil.example' } })
    assert.equal(out.status, 403)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('delete removes a file this plugin wrote', async () => {
  const { root, file } = workspace()
  try {
    const handler = createMediaHandler({ workspaceRoot: () => root })
    const out = await call(handler, { method: 'POST', url: '/media/delete', body: { file } })
    assert.equal(out.status, 200)
    assert.equal(JSON.parse(out.body).ok, true)
    assert.equal(existsSync(file), false)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('delete refuses a path outside the media directory', async () => {
  const { root } = workspace()
  try {
    const handler = createMediaHandler({ workspaceRoot: () => root })
    const out = await call(handler, { method: 'POST', url: '/media/delete', body: { file: '/etc/hosts' } })
    assert.equal(out.status, 403)
    assert.equal(existsSync('/etc/hosts'), true)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('delete refuses a traversal that escapes the media directory', async () => {
  const { root } = workspace()
  try {
    const handler = createMediaHandler({ workspaceRoot: () => root })
    const out = await call(handler, { method: 'POST', url: '/media/delete', body: { file: `${root}/uploads/media/../../package.json` } })
    assert.equal(out.status, 403)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('delete of a file that is already gone still answers ok', async () => {
  const { root, file } = workspace()
  try {
    rmSync(file)
    const handler = createMediaHandler({ workspaceRoot: () => root })
    const out = await call(handler, { method: 'POST', url: '/media/delete', body: { file } })
    assert.equal(out.status, 200)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('file refuses a traversal that escapes the media directory', async () => {
  const { root } = workspace()
  try {
    const handler = createMediaHandler({ workspaceRoot: () => root })
    const url = `/media/file?p=${encodeURIComponent(`${root}/uploads/media/../../package.json`)}`
    const out = await call(handler, { url })
    assert.equal(out.status, 403)
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('an unknown route is a 404, not a crash', async () => {
  const { root } = workspace()
  try {
    const handler = createMediaHandler({ workspaceRoot: () => root })
    const out = await call(handler, { url: '/media/nope' })
    assert.equal(out.status, 404)
  } finally { rmSync(root, { recursive: true, force: true }) }
})
