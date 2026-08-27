/** Ratchet fork-specific source hygiene against the merge base. */

import { spawnSync } from 'node:child_process'
import { parseArgs } from 'node:util'

export interface HygieneFinding { readonly path: string; readonly line: number; readonly text: string; readonly rule: string }
export interface HygieneReport {
  readonly mergeBase: string
  readonly baseline: HygieneFinding[]
  readonly current: HygieneFinding[]
  readonly newFindings: HygieneFinding[]
}

/** Files and text that are intentionally allowed to mention the upstream package scope. */
export const SOURCE_HYGIENE_ALLOWLIST = [
  /^scripts\/verify-source-hygiene\.ts$/u,
  /^scripts\/verify-source-hygiene\.spec\.ts$/u,
] as const

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.json', '.yml', '.yaml'])
const RULES = [{ name: 'upstream-package-scope', pattern: /@deepseek-ai\//u }]

function git(root: string, args: string[]): string {
  const result = spawnSync('git', ['-C', root, ...args], { encoding: 'utf8', env: { ...process.env, GIT_OPTIONAL_LOCKS: '0', LANG: 'C', LC_ALL: 'C' } })
  if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${String(result.stderr).trim()}`)
  return String(result.stdout)
}

function isSource(path: string): boolean {
  if (path.startsWith('vendor/')) return false
  const dot = path.lastIndexOf('.')
  return dot >= 0 && SOURCE_EXTENSIONS.has(path.slice(dot))
}
function allowed(path: string): boolean { return SOURCE_HYGIENE_ALLOWLIST.some(pattern => pattern.test(path)) }

/** Scan committed source at a revision. */
export function scanSource(root: string, revision: string): HygieneFinding[] {
  const names = git(root, ['ls-tree', '-r', '--name-only', revision]).split(/\r?\n/u).filter(p => p && isSource(p) && !allowed(p))
  const findings: HygieneFinding[] = []
  for (const path of names) {
    const content = git(root, ['show', `${revision}:${path}`])
    content.split(/\r?\n/u).forEach((text, index) => {
      for (const rule of RULES) if (rule.pattern.test(text)) findings.push({ path, line: index + 1, text: text.trim(), rule: rule.name })
    })
  }
  return findings
}

/** Return findings introduced since the unique merge base of base and head. */
export function verifySourceHygiene(root: string, base: string, head = 'HEAD'): HygieneReport {
  const mergeBases = git(root, ['merge-base', '--all', base, head]).trim().split(/\r?\n/u).filter(Boolean)
  if (mergeBases.length !== 1) throw new Error(`base and head do not have a unique merge base (found ${mergeBases.length})`)
  const mergeBase = mergeBases[0] as string
  const baseline = scanSource(root, mergeBase)
  const current = scanSource(root, head)
  const baselineKeys = new Set(baseline.map(f => `${f.path}:${f.rule}:${f.text}`))
  const newFindings = current.filter(f => !baselineKeys.has(`${f.path}:${f.rule}:${f.text}`))
  return { mergeBase, baseline, current, newFindings }
}

function main(): void {
  const { values } = parseArgs({ args: process.argv.slice(2), options: { base: { type: 'string' }, head: { type: 'string', default: 'HEAD' } }, strict: true })
  const base = values.base ?? process.env.DSH_ARCHIVE_BASE_REF
  if (!base) throw new Error('missing --base (or DSH_ARCHIVE_BASE_REF)')
  const report = verifySourceHygiene(process.cwd(), base, values.head)
  if (report.newFindings.length) {
    for (const finding of report.newFindings) console.error(`${finding.path}:${finding.line}: ${finding.rule}: ${finding.text}`)
    throw new Error(`source hygiene introduced ${report.newFindings.length} finding(s)`)
  }
  console.log(`source hygiene passed (merge base ${report.mergeBase}; ${report.current.length} existing finding(s))`)
}

if (import.meta.main) main()
