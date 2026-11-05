import type { Register } from 'claude-code'

const ALLOW = 'Allow once'
const BLOCK = 'Block'

const RM_WORDS = new Set(['rm', 'remove-item', 'ri', 'del', 'rmdir', 'rd'])
const RM_UNIX_FLAG = /^-[a-zA-Z]*[fr][a-zA-Z]*$/
const RM_PS_FLAG = /^-(r|re|rec|recu|recur|recurs|recurse|fo|for|forc|force)$/i
const RM_LONG_FLAG = /^--(force|recursive)$/
const PS_VALUE_OPTIONS = new Set(['-erroraction', '-ea'])

// Targets that may be removed without asking: anything under /tmp or the usual
// temp variables ($TMPDIR, $env:TEMP).
const isSafeTarget = (raw: string): boolean => {
  const t = raw.replace(/^["']|["']$/g, '')
  if (t.includes('..')) return false
  return (
    /^\/tmp\//.test(t) ||
    /^\$\{?TMPDIR\}?(\/|$)/.test(t) ||
    /^\$env:temp/i.test(t)
  )
}

const tokens = (segment: string): string[] => segment.match(/"[^"]*"|'[^']*'|\S+/g) ?? []

type Hit = { reason: string; details: string[] }

const checkRemove = (words: string[]): Hit | null => {
  const cmd = words[0]?.toLowerCase()
  if (!cmd || !RM_WORDS.has(cmd)) return null
  const flags = words.slice(1).filter(w => w.startsWith('-'))
  const isRisky = flags.some(
    f => RM_PS_FLAG.test(f) || RM_LONG_FLAG.test(f) || (cmd === 'rm' && RM_UNIX_FLAG.test(f)),
  )
  if (!isRisky) return null
  const targets: string[] = []
  for (let i = 1; i < words.length; i++) {
    const w = words[i]!
    if (PS_VALUE_OPTIONS.has(w.toLowerCase())) i++
    else if (!w.startsWith('-')) targets.push(w)
  }
  if (targets.length > 0 && targets.every(isSafeTarget)) return null
  const flagged = flags.join(' ')
  return {
    reason: 'Forced/recursive delete',
    details: [
      `Options: ${flagged}`,
      targets.length === 0 ? 'Target: none detected' : `Targets (${targets.length}):`,
      ...targets.map(t => `  ${isSafeTarget(t) ? '✓' : '✗'} ${t}${isSafeTarget(t) ? '' : '  (outside temp)'}`),
    ],
  }
}

const checkGit = (words: string[]): Hit | null => {
  if (words[0] !== 'git') return null
  const rest = words.slice(1)
  const operands = (from: string) => rest.slice(rest.indexOf(from) + 1).filter(w => !w.startsWith('-'))
  if (rest.includes('reset') && rest.includes('--hard')) {
    const [target] = operands('reset')
    return {
      reason: 'git reset --hard',
      details: [`Target: ${target ?? 'HEAD'}`, 'Uncommitted changes will be lost.'],
    }
  }
  if (rest.includes('push')) {
    const isForced = rest.some(w => w === '--force' || /^-[a-zA-Z]*f[a-zA-Z]*$/.test(w) || /^\+\S/.test(w))
    if (isForced) {
      const [remote, ...refs] = operands('push')
      return {
        reason: 'git push --force (sans --force-with-lease)',
        details: [
          `Remote: ${remote ?? '(default)'}`,
          `Branch(es): ${refs.length ? refs.join(', ') : '(current branch)'}`,
          'May overwrite remote commits. Prefer --force-with-lease.',
        ],
      }
    }
  }
  return null
}

// Returns why the command needs confirmation (with details to show), or null when it can run freely.
// ponytail: text matching only, not a security boundary (variables, bash -c and scripts slip through).
export const classify = (command: string): Hit | null => {
  const drop = /\bdrop\s+table\s+(?:if\s+exists\s+)?([^\s;"')]+)/i.exec(command)
  if (drop) return { reason: 'DROP TABLE', details: [`Table: ${drop[1]}`, 'The table and its data will be deleted.'] }
  if (/\bdrop\s+table\b/i.test(command)) return { reason: 'DROP TABLE', details: ['Table: not identified'] }
  for (const segment of command.split(/&&|\|\||[;|\n]/)) {
    const words = tokens(segment.trim())
    const found = checkRemove(words) ?? checkGit(words)
    if (found) return found
  }
  return null
}

// ponytail: per-session counter kept in the module; a hot reload resets it.
let blocked = 0

function label(): string {
  return `🛡 bodyguard: ${blocked} blocked`
}

async function guard($: any, e: any, next: any) {
  const hit = classify(e.command)
  if (!hit) return next(e)
  const { reason } = hit
  const short = e.command.length > 300 ? `${e.command.slice(0, 300)}…` : e.command
  const question = [`🛡 ${reason}`, ...hit.details, `Command: ${short}`, 'Run anyway?'].join('\n')
  const answer = await $.ui.ask(question, { options: [ALLOW, BLOCK], header: 'Bodyguard' }).catch(() => BLOCK)
  if (answer === ALLOW) return next(e)
  blocked++
  $.ui.status(label())
  $.ui.toast(`🛡 Blocked: ${reason}`)
  return { deny: `bodyguard: ${reason} refused by the user.` }
}

// Fail closed: if the guard itself breaks, the command is refused rather than run unchecked.
function onGuardError($: any, e: any, next: any) {
  return next.called ? next(e) : { deny: 'bodyguard: guard failed, command refused.' }
}

export const register: Register = on => {
  on('session.start', ($, e, next) => {
    $.ui.status(label())
    return next(e)
  })
  for (const tool of ['Bash', 'PowerShell'] as const) {
    on('tool.call', { tool }, guard).catch(onGuardError)
  }
}
