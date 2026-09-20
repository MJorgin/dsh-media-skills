#!/usr/bin/env node
/**
 * Validate local links and same-page anchors in the README translations.
 *
 * GitHub renders nine README pages with hand-translated TOC anchors; a
 * renamed heading silently breaks that nav. This check rebuilds GitHub-style
 * slugs (unicode letters/numbers kept, punctuation/emoji dropped, spaces to
 * hyphens), verifies every #anchor, and confirms each local file/image target
 * exists on disk.
 */

import { access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const files = [
  'README.md',
  ...['ZH', 'ZH_TW', 'JA', 'KO', 'ES', 'DE', 'PT', 'RU']
    .map((lang) => path.join('docs', 'lang', `README_${lang}.md`)),
]

const slug = (heading) => heading
  .replace(/`[^`]*`/g, (m) => m.slice(1, -1))
  .replace(/!?\[[^\]]*\]\([^)]*\)/g, '')
  .toLowerCase()
  .replace(/[^\p{L}\p{N}\s-]/gu, '')
  .trim()
  .replace(/\s+/g, '-')

const stripInline = (line) => line
  .replace(/^#+\s*/, '')
  .replace(/`([^`]*)`/g, '$1')
  .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')

const problems = []

for (const relative of files) {
  const text = await (async () => {
    try {
      return await import('node:fs/promises').then((fs) => fs.readFile(path.join(ROOT, relative), 'utf8'))
    } catch {
      problems.push(`${relative} is missing`)
      return ''
    }
  })()
  if (!text) continue

  const dir = path.dirname(path.join(ROOT, relative))
  const anchors = new Set()
  for (const line of text.split(/\r?\n/)) {
    const heading = /^#{1,6}\s+(.+?)\s*$/.exec(line)
    if (heading) anchors.add(slug(stripInline(heading[1])))
  }

  const destinations = [...text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)].map((m) => m[1])
  for (const raw of destinations) {
    const url = raw.split(/[?]/)[0]
    if (/^(https?:|mailto:|tel:)/.test(url)) continue
    const [targetPath, rawAnchor] = url.split('#')
    const anchor = rawAnchor ? decodeURIComponent(rawAnchor) : ''

    if (!targetPath) {
      if (anchor && !anchors.has(anchor)) problems.push(`${relative}: broken anchor #${anchor}`)
      continue
    }

    const resolved = path.resolve(dir, targetPath)
    try {
      await access(resolved)
    } catch {
      problems.push(`${relative}: missing local target ${targetPath}`)
      continue
    }
    if (anchor && targetPath.endsWith('.md')) {
      const linked = await import('node:fs/promises').then((fs) => fs.readFile(resolved, 'utf8'))
      const linkedAnchors = new Set()
      for (const line of linked.split(/\r?\n/)) {
        const heading = /^#{1,6}\s+(.+?)\s*$/.exec(line)
        if (heading) linkedAnchors.add(slug(stripInline(heading[1])))
      }
      if (!linkedAnchors.has(anchor)) problems.push(`${relative}: ${targetPath}#${anchor} not found`)
    }
  }
}

if (problems.length) {
  console.error('Docs link check failed:')
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}

console.log(`Docs links OK — ${files.length} README pages`)
