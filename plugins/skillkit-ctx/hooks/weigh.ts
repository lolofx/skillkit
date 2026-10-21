import type { SessionContextBreakdown } from 'claude-code'

import type { Snap, Weights } from '../types'

const add = (m: Weights, k: string, v: number) => {
  m[k] = (m[k] ?? 0) + v
}

export const k = (n: number) => (Math.abs(n) >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`)

export const top = (m: Weights, n: number) =>
  Object.entries(m)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)

// approximate split of the system-tools total: description length + a flat schema overhead per tool
export const split = (total: number, len: Weights): Weights => {
  const w = Object.entries(len).map(([n, l]) => [n, l + 150] as const)
  const sum = w.reduce((a, [, x]) => a + x, 0) || 1

  return Object.fromEntries(w.map(([n, x]) => [n, Math.round((total * x) / sum)]))
}

export const take = (b: SessionContextBreakdown): Snap => {
  const cats: Weights = {}
  for (const c of b.categories) if (c.kind === 'used') cats[c.name] = c.tokens
  const detail: Record<string, Weights> = {}
  const skills: Weights = {}
  for (const s of b.skills?.skillFrontmatter ?? []) {
    const g = s.pluginName ?? s.source
    add(skills, g, s.tokens)
    add((detail[`skills:${g}`] ??= {}), s.name, s.tokens)
  }
  const mcp: Weights = {}
  for (const t of b.mcpTools) {
    if (!t.isLoaded) continue
    add(mcp, t.serverName, t.tokens)
    add((detail[`mcp:${t.serverName}`] ??= {}), t.name, t.tokens)
  }
  const memory: Weights = {}
  for (const f of b.memoryFiles) add(memory, f.path.split(/[\\/]/).slice(-2).join('/'), f.tokens)
  const agents = b.agents.reduce((n, a) => n + a.tokens, 0)

  return { total: b.totalTokens, window: b.rawMaxTokens, cats, skills, mcp, memory, agents, detail }
}

// what grew between two snapshots, per category
export const grew = (prev: Weights, next: Weights): Weights => {
  const up: Weights = {}
  for (const [name, v] of Object.entries(next)) {
    const d = v - (prev[name] ?? 0)
    if (d !== 0) up[name] = d
  }

  return up
}
