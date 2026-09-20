#!/usr/bin/env node
/**
 * Load the bundle through a minimal DSH-like skill registry.
 *
 * This complements the manifest guard by executing index.js, registering its
 * provider factory, listing both skills through the v0.1.6 method shape, and
 * loading each Markdown body without its YAML frontmatter.
 */

import { access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const expected = new Map([
  ['vision-review', '# Vision Review'],
  ['media-tools', '# Media Tools'],
])

const plugin = await import(path.join(ROOT, 'index.js'))
let providerFactory
const ctx = {
  skills: {
    registerProvider(factory) {
      providerFactory = factory
    },
  },
}

plugin.apply(ctx)
if (typeof providerFactory !== 'function') {
  throw new Error('apply() did not register a provider factory')
}

const control = { signal: AbortSignal.timeout(5000), invalidate() {} }
const provider = providerFactory(control)
if (provider?.name !== plugin.name) {
  throw new Error(`provider name ${provider?.name} does not match plugin name ${plugin.name}`)
}

const options = { cwd: ROOT, signal: control.signal }
const listed = await provider.list(options)
const candidates = Array.isArray(listed) ? listed : listed.candidates
if (candidates.length !== expected.size) {
  throw new Error(`expected ${expected.size} candidates, got ${candidates.length}`)
}

for (const candidate of candidates) {
  if (!expected.has(candidate.name)) throw new Error(`unexpected skill ${candidate.name}`)
  if (candidate.provider !== plugin.name) throw new Error(`${candidate.name} has wrong provider`)
  if (candidate.source !== 'bundled') throw new Error(`${candidate.name} must be bundled`)
  if (candidate.rank !== 600) throw new Error(`${candidate.name} must use bundled rank 600`)
  if (!candidate.description || candidate.description.length > 500) {
    throw new Error(`${candidate.name} must have a description of 1-500 characters`)
  }
  if (!candidate.invocation?.modelInvocable || !candidate.invocation.userInvocable) {
    throw new Error(`${candidate.name} must be invocable by both models and users`)
  }
  if (candidate.resourceBase?.kind !== 'directory') {
    throw new Error(`${candidate.name} must expose a directory resource base`)
  }
  await access(candidate.resourceBase.path)
  if (candidate.path) await access(candidate.path)

  const definition = await provider.get(candidate, options)
  if (!definition) throw new Error(`${candidate.name} could not be loaded`)
  if (definition.content.startsWith('---')) {
    throw new Error(`${candidate.name} body still includes YAML frontmatter`)
  }
  if (!definition.content.includes(expected.get(candidate.name))) {
    throw new Error(`${candidate.name} body is missing its primary heading`)
  }
}

const missing = await provider.get({ name: 'missing-skill', provider: plugin.name }, options)
if (missing !== undefined) throw new Error('unknown candidates should resolve to undefined')

console.log(`DSH runtime OK — ${plugin.name} registered and loaded ${candidates.length} skills`)
