import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import { verifySourceHygiene } from './verify-source-hygiene.ts'

function repository(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'dsh-source-hygiene-'))
  for (const [name, content] of Object.entries(files)) { const path = join(root, name); mkdirSync(join(path, '..'), { recursive: true }); writeFileSync(path, content) }
  const run = (args: string[]) => { const result = spawnSync('git', ['-C', root, ...args], { encoding: 'utf8' }); if (result.status !== 0) throw new Error(result.stderr) }
  run(['init', '-q']); run(['config', 'user.email', 'test@example.invalid']); run(['config', 'user.name', 'Test']); run(['add', '.']); run(['commit', '-qm', 'base'])
  return root
}

describe('verifySourceHygiene', () => {
  it('does not report findings already present at the merge base', () => {
    const root = repository({ 'src.ts': 'const x = "@deepseek-ai/legacy"\n' })
    expect(verifySourceHygiene(root, 'HEAD').newFindings).toEqual([])
  })
  it('reports a newly introduced finding', () => {
    const root = repository({ 'src.ts': 'const x = "ok"\n' })
    const run = (args: string[]) => spawnSync('git', ['-C', root, ...args], { encoding: 'utf8' })
    writeFileSync(join(root, 'src.ts'), 'const x = "@deepseek-ai/legacy"\n')
    run(['add', '.']); run(['commit', '-qm', 'change'])
    expect(verifySourceHygiene(root, 'HEAD~1').newFindings).toHaveLength(1)
  })
  it('ignores vendored source and explicit verifier files', () => {
    const root = repository({ 'vendor/x.ts': '@deepseek-ai/x', 'scripts/verify-source-hygiene.ts': '@deepseek-ai/x' })
    expect(verifySourceHygiene(root, 'HEAD').current).toEqual([])
  })
})
