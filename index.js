/**
 * Bundled `vision-review` and `media-tools` skill provider.
 *
 * Ships two free, self-contained skills for DeepSeek Harness:
 * - `vision-review`: read / analyze images via Zhipu GLM-4V-Flash.
 * - `media-tools`: generate images via SiliconFlow Kolors.
 *
 * The plugin registers a single provider on `ctx.skills`. Skill bodies live
 * under `skills/<name>/SKILL.md` and their scripts under `skills/<name>/scripts/`.
 * API keys are never stored in this package; the scripts read environment
 * variables first, then `~/.dsh/secrets/media-tools.env`, then a legacy
 * `~/.codex/secrets/media-tools.env` fallback.
 *
 * @module dsh-media-skills
 */

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const PROVIDER_NAME = 'dsh-media-skills'

const SKILLS = [
  {
    name: 'vision-review',
    description:
      '免费读图与视觉检查。当用户要分析、识别、检查或描述图片/截图，检查界面或布局的视觉问题（文字重叠、溢出、错位），检测水印/Logo，或把图片内容转成文字时使用。基于智谱 GLM-4V-Flash（免费）；key 取自环境变量或 ~/.dsh/secrets/media-tools.env，永不写进 skill。',
    body: new URL('./skills/vision-review/SKILL.md', import.meta.url),
    resourceDir: './skills/vision-review/',
  },
  {
    name: 'media-tools',
    description:
      '免费生成图片。当用户要生成图片、插画、头像、背景、banner 等（包括付费图片额度不可用时）使用。基于 SiliconFlow Kolors（免费、无水印）；key 取自环境变量或 ~/.dsh/secrets/media-tools.env，永不写进 skill。',
    body: new URL('./skills/media-tools/SKILL.md', import.meta.url),
    resourceDir: './skills/media-tools/',
  },
].map((skill) => ({
  ...skill,
  invocation: { modelInvocable: true, userInvocable: true },
  provider: PROVIDER_NAME,
  source: 'bundled',
  resourceBase: {
    kind: 'directory',
    path: fileURLToPath(new URL(skill.resourceDir, import.meta.url)),
  },
  rank: 600,
  locator: skill.body,
}))

const provider = {
  name: PROVIDER_NAME,
  list: () => Promise.resolve(SKILLS),
  async get(candidate) {
    const raw = await readFile(candidate.locator, 'utf8')
    // Strip the YAML frontmatter so the loaded body is clean instructions.
    const content = raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
    return {
      name: candidate.name,
      description: candidate.description,
      invocation: candidate.invocation,
      provider: candidate.provider,
      source: candidate.source,
      resourceBase: candidate.resourceBase,
      content,
    }
  },
}

/** Cordis plugin name. */
export const name = 'dsh-media-skills'
/** Service required by the bundled provider. */
export const inject = ['skills']

/** Register the bundled `vision-review` and `media-tools` provider on `ctx.skills`. */
export function apply(ctx) {
  ctx.skills.registerProvider(() => provider)
}
