import { spawnSync } from 'node:child_process'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const files = ['skills/vision-review/scripts/vision.py', 'skills/media-tools/scripts/generate.py']
const cacheDir = mkdtempSync(join(tmpdir(), 'dsh-media-skills-pyc-'))
const result = spawnSync(process.env.PYTHON ?? 'python3', ['-m', 'py_compile', ...files], {
  env: { ...process.env, PYTHONPYCACHEPREFIX: cacheDir },
  stdio: 'inherit',
})
process.exit(result.status ?? 1)
