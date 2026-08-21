/**
 * Bundled `vision-review` and `media-tools` skill provider.
 *
 * Ships two free, self-contained skills for DeepSeek Harness:
 * - `vision-review`: read / analyze images via Zhipu GLM-4V-Flash,
 *   with optional SiliconFlow / SenseNova / Gemini fallbacks.
 * - `media-tools`: generate images via SenseNova U1 Fast or SiliconFlow Kolors.
 *
 * The plugin registers a single provider on `ctx.skills`. Skill bodies live
 * under `skills/<name>/SKILL.md` and their scripts under `skills/<name>/scripts/`.
 * API keys are never stored in this package; the scripts read environment
 * variables first, then `~/.dsh/secrets/media-tools.env`, then a legacy
 * `~/.codex/secrets/media-tools.env` fallback.
 *
 * On top of the skills, the plugin seeds a `zhipu-vision` provider route
 * into the `llm-pi-ai` settings namespace when none is configured, giving a
 * fresh install a free vision-capable model in the selector (see
 * `docs/SETUP_VISION.md` for the complete setup walkthrough).
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
      '免费读图与视觉检查。当用户要分析、识别、检查或描述图片/截图，检查界面或布局的视觉问题（文字重叠、溢出、错位），检测水印/Logo，或把图片内容转成文字时使用。引擎链：GLM-4V-Flash（免费首选）→ DeepSeek-V4-Flash-Vision-Exp（与主 agent 同 key，付费可选）→ SenseNova / SiliconFlow / Gemini；key 取自环境变量、~/.dsh/.credentials.yaml 或 ~/.dsh/secrets/media-tools.env，永不写进 skill。',
    body: new URL('./skills/vision-review/SKILL.md', import.meta.url),
    resourceDir: './skills/vision-review/',
  },
  {
    name: 'media-tools',
    description:
      '免费生成图片。当用户要生成图片、插画、头像、背景、banner 等（包括付费图片额度不可用时）使用。优先 SenseNova U1 Fast，其次 SiliconFlow Kolors；key 取自环境变量或 ~/.dsh/secrets/media-tools.env，永不写进 skill。',
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

/**
 * Seeds for the `zhipu-vision` and `sensenova-vision` provider routes written
 * into the `llm-pi-ai` settings namespace on a fresh install, so the model
 * selector gains 「智谱 GLM-4V-Flash（视觉）」 and 「商汤 SenseNova（视觉）」
 * without hand-editing settings.yaml.
 *
 * The seed is additive and idempotent: it only applies when a provider is not
 * configured, and it never touches other providers or a user's existing
 * customization. API keys themselves are never bundled — `apiKeyEnv` names a
 * credential the user supplies through DSH's credential store.
 */
const ZHIPU_VISION_SEED = {
  apiKeyEnv: 'GLM_API_KEY',
  displayName: '智谱 GLM-4V-Flash（视觉）',
  api: 'openai-completions',
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
  models: [
    {
      id: 'glm-4v-flash',
      input: ['text', 'image'],
      // glm-4v-flash's real budget (live-verified against the endpoint):
      // inputs + max_tokens <= 16384, and the API rejects max_tokens > 1024
      // with error 1210 («max_tokens参数非法：限制数值范围[1,1024]»).
      // 1024 is therefore the output cap, not 4096.
      contextWindow: 16384,
      maxTokens: 1024,
    },
  ],
}

const SENSENOVA_VISION_SEED = {
  apiKeyEnv: 'SENSENOVA_API_KEY',
  displayName: '商汤 SenseNova（视觉）',
  api: 'openai-completions',
  baseURL: 'https://token.sensenova.ai/v1',
  models: [
    {
      id: 'sensenova-6.8-flash-lite',
      input: ['text', 'image'],
      contextWindow: 262144,
      maxTokens: 65536,
    },
  ],
}

/**
 * Seed the `zhipu-vision` / `sensenova-vision` routes when absent. Settings
 * reads/writes are best-effort: a composition without the settings service, a
 * read-only provider, or a not-yet-registered namespace all skip silently
 * (and log a warning) rather than failing the skill provider registration.
 */
async function seedVisionModel(ctx) {
  const settings = ctx.get('settings')
  if (settings === undefined) return
  try {
    const section = settings.get('llm-pi-ai')
    const providers = section !== null && typeof section === 'object'
      && section.providers !== null && typeof section.providers === 'object'
      ? section.providers
      : {}
    // Deep merge: adds only missing provider keys under `providers`, leaving
    // every other provider route exactly as the user configured it.
    const missing = {}
    if (providers['zhipu-vision'] === undefined) missing['zhipu-vision'] = ZHIPU_VISION_SEED
    if (providers['sensenova-vision'] === undefined) missing['sensenova-vision'] = SENSENOVA_VISION_SEED
    if (Object.keys(missing).length > 0) {
      await settings.update('llm-pi-ai', { providers: missing })
    }
  } catch (error) {
    console.warn(
      `dsh-media-skills: vision model seeding skipped: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

/** Cordis plugin name. */
export const name = 'dsh-media-skills'
/** Service required by the bundled provider. */
export const inject = ['skills']

/** Register the bundled skills and seed the `zhipu-vision` model route. */
export async function apply(ctx) {
  ctx.skills.registerProvider(() => provider)
  await seedVisionModel(ctx)
}
