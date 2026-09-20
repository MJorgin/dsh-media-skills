/**
 * DeepSeek Harness v0.1.6 bundle for free media skills.
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

import { readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
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
}
