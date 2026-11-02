#!/usr/bin/env node
/**
 * Regression checks for the panel half of the plugin: the provider table the
 * client renders, the model that gets passed to generate.py, and the error
 * sentences the panel shows. Runs against a throwaway DSH_HOME so the real
 * ~/.dsh is never touched.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const home = mkdtempSync(join(tmpdir(), 'dsh-media-panel-'))
mkdirSync(join(home, 'secrets'), { recursive: true })
writeFileSync(join(home, 'secrets', 'media-tools.env'), 'SILICONFLOW_API_KEY=sk-test\n')
process.env.DSH_HOME = home

const { mediaStatus, resolveProvider, explainFailure, joinEndpoint } = await import('../index.js')

test('every image provider ships the models the picker lists', () => {
  const { providers } = mediaStatus()
  const image = providers.filter((provider) => provider.role.startsWith('生图'))
  assert.ok(image.length >= 2, 'expected at least two image providers')
  for (const provider of image) {
    assert.ok(Array.isArray(provider.models) && provider.models.length > 0, `${provider.id} has no models`)
    for (const model of provider.models) {
      assert.equal(typeof model.id, 'string')
      assert.ok(model.id.length > 0)
      assert.equal(typeof model.label, 'string')
      assert.equal(typeof model.desc, 'string')
      assert.ok(Number.isInteger(model.maxEdge) && model.maxEdge >= 512, `${model.id} maxEdge`)
    }
  }
})

test('vision providers stay out of the image picker', () => {
  const { providers } = mediaStatus()
  const gemini = providers.find((provider) => provider.id === 'gemini')
  assert.ok(gemini !== undefined)
  assert.equal(gemini.role.startsWith('生图'), false)
})

test('the chosen model reaches generate.py', () => {
  const provider = resolveProvider('siliconflow', 'Qwen/Qwen-Image')
  assert.equal(provider.env.MEDIA_MODEL, 'Qwen/Qwen-Image')
  assert.equal(provider.env.MEDIA_PROVIDER, 'siliconflow')
  assert.equal(provider.modelLabel, 'Qwen-Image')
})

test('an unknown model falls back to the provider default', () => {
  const provider = resolveProvider('siliconflow', 'no/such-model')
  assert.equal(provider.env.MEDIA_MODEL, 'Kwai-Kolors/Kolors')
})

test('no provider id picks the first configured one', () => {
  const provider = resolveProvider('', '')
  assert.equal(provider.env.MEDIA_PROVIDER, 'siliconflow')
})

test('an unconfigured provider explains itself', () => {
  assert.throws(() => resolveProvider('sensenova', ''), /还没配置 Key/)
})

test('a model typed into the key page stays selectable', () => {
  writeFileSync(join(home, 'media-desk.json'), JSON.stringify({ providers: { siliconflow: { model: 'acme/custom-v2' } } }))
  const provider = mediaStatus().providers.find((item) => item.id === 'siliconflow')
  assert.equal(provider.models[0].id, 'acme/custom-v2')
  assert.equal(provider.models[0].desc, '自定义模型')
  const resolved = resolveProvider('siliconflow', 'acme/custom-v2')
  assert.equal(resolved.env.MEDIA_MODEL, 'acme/custom-v2')
})

test('a custom provider carries its own endpoint and model', () => {
  writeFileSync(join(home, 'media-desk.json'), JSON.stringify({
    custom: [{ id: 'cf', label: 'Cloudflare', baseUrl: 'https://api.cloudflare.com/client/v4/accounts/x/ai/run/@cf/black-forest-labs/flux-1-schnell', model: '', key: 'cf-token' }],
  }))
  const provider = resolveProvider('cf', '')
  assert.equal(provider.env.MEDIA_API_KEY, 'cf-token')
  assert.match(provider.env.MEDIA_API_URL, /^https:\/\/api\.cloudflare\.com\/.*\/ai\/run\/@cf\//)
})

test('joinEndpoint appends the images path once', () => {
  assert.equal(joinEndpoint('https://api.siliconflow.cn/v1'), 'https://api.siliconflow.cn/v1/images/generations')
  assert.equal(joinEndpoint('https://a.example/v1/images/generations'), 'https://a.example/v1/images/generations')
  assert.equal(joinEndpoint(''), '')
})

test('python failures turn into one readable sentence', () => {
  assert.match(explainFailure('HTTPError: HTTP Error 402: Payment Required', 1), /余额|额度/)
  assert.match(explainFailure('HTTPError: HTTP Error 401: Unauthorized', 1), /Key|密钥/)
  assert.match(explainFailure('HTTPError: HTTP Error 429: Too Many Requests', 1), /频繁|稍后/)
  assert.match(explainFailure('URLError: <urlopen error [Errno 61] Connection refused>', 1), /网络|地址/)
})

process.on('exit', () => rmSync(home, { recursive: true, force: true }))
