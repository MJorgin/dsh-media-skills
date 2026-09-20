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

import { readFile } from 'node:fs/promises'
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

const candidates = await Promise.all(
  SKILL_NAMES.map(async (name) => {
    const body = skillPath(name, 'SKILL.md')
    const raw = await readFile(body, 'utf8')
    const metadata = frontmatter(raw)
    if (metadata.name !== name) {
      throw new Error(`${body} declares ${metadata.name}, expected ${name}`)
    }
    return {
      path: body,
      name,
      description: metadata.description,
      invocation: { modelInvocable: true, userInvocable: true },
      provider: PROVIDER_NAME,
      source: 'bundled',
      resourceBase: { kind: 'directory', path: skillPath(name) },
      rank: 600,
      locator: { body, bodyStart: metadata.bodyStart },
    }
  }),
)

const provider = {
  name: PROVIDER_NAME,
  list: (_options) => Promise.resolve(candidates),
  async get(candidate, _options) {
    const selected = candidates.find((item) => (
      item.name === candidate?.name && item.provider === candidate?.provider
    ))
    if (!selected) return undefined
    const raw = await readFile(selected.locator.body, 'utf8')
    return {
      path: selected.path,
      name: selected.name,
      description: selected.description,
      invocation: selected.invocation,
      provider: selected.provider,
      source: selected.source,
      resourceBase: selected.resourceBase,
      content: raw.slice(selected.locator.bodyStart).trim(),
    }
  },
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
  ctx.skills.registerProvider(() => provider)
}
