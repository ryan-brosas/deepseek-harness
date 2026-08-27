import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { globSync } from 'node:fs'

const sha = /^[0-9a-f]{40}$/u
const root = fileURLToPath(new URL('..', import.meta.url))
const violations: string[] = []
for (const file of globSync('.github/workflows/*.yml', { cwd: root }).sort()) {
  const lines = readFileSync(resolve(root, file), 'utf8').split(/\r?\n/u)
  lines.forEach((line, index) => {
    const match = /^\s*uses:\s*([^\s#]+)/u.exec(line)
    if (match === null || match[1]?.startsWith('./')) return
    const ref = match[1] ?? ''
    const at = ref.lastIndexOf('@')
    if (at === -1 || !sha.test(ref.slice(at + 1))) violations.push(`${file}:${index + 1}: ${ref} is not pinned to a full commit SHA`)
  })
}
if (violations.length > 0) {
  for (const violation of violations) console.error(violation)
  process.exitCode = 1
} else console.log('workflow actions: all third-party actions use full commit SHAs')
