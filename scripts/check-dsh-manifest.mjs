#!/usr/bin/env node
/**
 * Guard the DSH v0.1.6 multi-skill bundle against manifest drift.
 *
 * The packaged provider reads metadata directly from each SKILL.md, while
 * package.json/cordis.patch.yml decide whether DSH can load that provider.
 * Keeping this check in CI catches a renamed skill, over-long catalog
 * description, missing resource directory, or a stale settings mutation
 * before publishing.
 */

import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const CATALOG_MAX = 500
const SKILLS = ['vision-review', 'media-tools']
const problems = []

const note = (message) => problems.push(message)

async function exists(relativePath) {
  try {
    await access(path.join(ROOT, relativePath))
    return true
  } catch {
    return false
  }
}

function parseFrontmatter(text, file) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text)
  if (!match) {
    note(`${file} has no YAML frontmatter`)
    return null
  }
  const data = match[1]
  const name = /^name:\s*(.+?)\s*$/m.exec(data)?.[1]
  const description = /^description:\s*(?:"([^"]*)"|'([^']*)'|(.+?))\s*$/m.exec(data)?.slice(1).find(Boolean)
  if (!name) note(`${file} is missing name`)
  if (!description) note(`${file} is missing a single-line description`)
  if (description && description.length > CATALOG_MAX) {
    note(`${file} description is ${description.length} chars; DSH catalog limit is ${CATALOG_MAX}`)
  }
  return name && description ? { name, description } : null
}

const pkg = JSON.parse(await readFile(path.join(ROOT, 'package.json'), 'utf8'))
const patchPath = pkg.dsh?.bundle?.patch
if (!patchPath) note('package.json is missing dsh.bundle.patch')
if (patchPath && !(await exists(patchPath))) note(`package.json points at missing ${patchPath}`)

if (pkg.files && !pkg.files.includes('skills')) note('package.json files[] must publish skills/')

const patchText = patchPath && await exists(patchPath)
  ? await readFile(path.join(ROOT, patchPath), 'utf8')
  : ''
if (patchText && !patchText.includes(`name: ${pkg.name}`)) {
  note(`cordis patch must mount plugin name ${pkg.name}`)
}
if (!/^- insert:\r?\n\s{4}- id: dsh-media-skills\b/m.test(patchText)) {
  note('cordis patch must insert one id: dsh-media-skills row')
}

for (const name of SKILLS) {
  const relativeSkill = path.join('skills', name, 'SKILL.md')
  if (!(await exists(relativeSkill))) {
    note(`missing ${relativeSkill}`)
    continue
  }
  const raw = await readFile(path.join(ROOT, relativeSkill), 'utf8')
  const metadata = parseFrontmatter(raw, relativeSkill)
  if (metadata?.name !== name) note(`${relativeSkill} name must be ${name}`)

  for (const requiredPath of ['scripts']) {
    const relative = path.join('skills', name, requiredPath)
    if (!(await exists(relative))) note(`missing ${relative}`)
  }
}

const index = await readFile(path.join(ROOT, 'index.js'), 'utf8')
for (const name of SKILLS) {
  if (!index.includes(`'${name}'`)) note(`index.js does not include skill ${name}`)
}
for (const forbidden of ['settings.update', 'llm-pi-ai', 'ZHIPU_VISION_SEED', 'SENSENOVA_VISION_SEED']) {
  if (index.includes(forbidden)) note(`index.js must not mutate old settings seam: ${forbidden}`)
}
if (!index.includes("ctx.skills.registerProvider")) note('index.js does not register a skill provider')

if (problems.length > 0) {
  console.error('DSH manifest check failed:')
  for (const problem of problems) console.error(`  - ${problem}`)
  process.exit(1)
}

console.log(`DSH bundle OK — ${pkg.name}@${pkg.version}, ${SKILLS.length} skills, patch ${patchPath}`)
