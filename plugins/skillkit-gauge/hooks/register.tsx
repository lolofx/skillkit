import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { JaugeSnapshot } from '../types'

const PANE = 'gauge'
const snapshot = atom({ plugin: 'skillkit-gauge', key: 'snapshot' } as const, null)
const isHidden = atom({ plugin: 'skillkit-gauge', key: 'isHidden' } as const, false)
const clock = atom({ plugin: 'skillkit-gauge', key: 'now' } as const, 0)

// green, yellow, orange, red (orange has no theme key)
const COLORS = ['success', 'warning', '#ff8c00', 'error'] as const
export const CTX_STEPS = [50, 70, 85]
export const LIMIT_STEPS = [60, 80, 90]

export const levelFor = (pct: number, steps: readonly number[]): number => steps.filter(s => pct >= s).length

export const bar = (pct: number, width = 10): string => {
  const filled = Math.max(0, Math.min(width, Math.round((pct / 100) * width)))
  return '▓'.repeat(filled) + '░'.repeat(width - filled)
}

export const kilo = (tokens: number): string => `${Math.round(tokens / 1000)}k`

// "2h 14m left", "25 min left", "2d 3h left"; empty when unknown or already past.
export const remaining = (resetsAt: string | undefined, now: number): string => {
  const ms = resetsAt ? Date.parse(resetsAt) - now : NaN
  if (!(ms > 0)) return ''
  const minutes = Math.round(ms / 60000)
  const hours = Math.floor(minutes / 60)
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h left`
  if (hours > 0) return `${hours}h ${String(minutes % 60).padStart(2, '0')}m left`
  return `${minutes} min left`
}

const hintFor = (level: number): string => (level === 2 ? '/compact soon' : level >= 3 ? '/compact now' : '')

const clockTime = (iso: string | undefined): string => {
  const d = iso ? new Date(iso) : null
  return d && !Number.isNaN(d.getTime()) ? `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : '?'
}

export type Levels = { ctx: number; five: number | null; week: number | null }

export const levelsOf = (snap: JaugeSnapshot): Levels => ({
  ctx: levelFor(snap.ctxWindow > 0 ? (snap.ctxTokens / snap.ctxWindow) * 100 : 0, CTX_STEPS),
  five: snap.five ? levelFor(snap.five.pct, LIMIT_STEPS) : null,
  week: snap.week ? levelFor(snap.week.pct, LIMIT_STEPS) : null,
})

const DOTS = ['🟢', '🟡', '🟠', '🔴']

// Toast texts for each metric whose level went up since the previous reading.
// No previous reading (first one of the session) = nothing to announce.
export const crossings = (prev: Levels | null, snap: JaugeSnapshot, now: number): string[] => {
  if (prev === null) return []
  const cur = levelsOf(snap)
  const out: string[] = []
  if (cur.ctx > prev.ctx) {
    const pct = Math.round((snap.ctxTokens / snap.ctxWindow) * 100)
    out.push(`${DOTS[cur.ctx]} Context at ${pct}%${hintFor(cur.ctx) ? ` — ${hintFor(cur.ctx)}` : ''}`)
  }
  if (snap.five && cur.five !== null && prev.five !== null && cur.five > prev.five) {
    const left = remaining(snap.five.resetsAt, now)
    out.push(`${DOTS[cur.five]} 5h limit at ${Math.round(snap.five.pct)}%${left ? ` — ${left}` : ''}`)
  }
  if (snap.week && cur.week !== null && prev.week !== null && cur.week > prev.week) {
    out.push(`${DOTS[cur.week]} Week at ${Math.round(snap.week.pct)}%`)
  }
  return out
}

// Last reading of this session; after a /compact the context level drops, so the next rise warns again.
let lastLevels: Levels | null = null

async function refresh($: any) {
  try {
    const usage = await $.session.usage({ breakdown: 'summary' })
    const breakdown = usage.context.breakdown
    const limit = (kind: string) => {
      const found = usage.rateLimits.find((r: any) => r.kind === kind)
      return found ? { pct: found.percentUsed, resetsAt: found.resetsAt } : null
    }
    const snap: JaugeSnapshot = {
      ctxTokens: usage.context.tokens ?? breakdown?.totalTokens ?? 0,
      ctxWindow: breakdown?.rawMaxTokens ?? usage.context.window,
      five: limit('five_hour'),
      week: limit('seven_day'),
      costUsd: usage.cost?.usd ?? null,
      categories: (breakdown?.categories ?? [])
        .filter((c: any) => c.tokens > 0 && !/free space/i.test(c.name))
        .map((c: any) => ({ name: c.name, tokens: c.tokens }))
        .sort((a: any, b: any) => b.tokens - a.tokens)
        .slice(0, 8),
    }
    const now = await $.clock.now()
    await update($, snapshot, () => snap)
    await update($, clock, () => now)
    for (const text of crossings(lastLevels, snap, now)) $.ui.toast(text)
    lastLevels = levelsOf(snap)
  } catch (error) {
    $.ui.log(`gauge: refresh failed (${String(error)})`, { to: 'debug' })
  }
}

async function tick($: any) {
  const now = await $.clock.now()
  await update($, clock, () => now)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'gauge',
      description: 'Open the gauge pane: context, 5-hour limit and week',
    })
    const result = await next(e)
    await refresh($)
    $.clock.every(60000, () => tick($))
    return result
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    await refresh($)
    return result
  })

  // A display mod must never block a compaction: if the hook fails, let it go through.
  on('session.compact', async ($, e, next) => {
    const result = await next(e)
    await refresh($)
    return result
  }).catch(($, e, next) => next(e))

  on('command.run', { command: 'gauge' }, async $ => {
    await update($, isHidden, () => false)
    await refresh($)
    await $.ui.open({ id: PANE, title: 'Gauge' })
    return { text: 'Gauge pane opened.' }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const snap = await read($, snapshot)
    if (e.props.hasSurvey || snap === null || (await read($, isHidden))) return next(e)

    const now = await read($, clock)
    const { Box, Button, Text } = $.ui.resolve(e)
    const pct = snap.ctxWindow > 0 ? (snap.ctxTokens / snap.ctxWindow) * 100 : 0
    const level = levelFor(pct, CTX_STEPS)
    const color = COLORS[level]
    const hint = hintFor(level)
    const five = snap.five
    const week = snap.week

    return (
      <Box>
        <Text color={color} bold>
          ● context {bar(pct)} {kilo(snap.ctxTokens)}/{kilo(snap.ctxWindow)}
        </Text>
        {hint !== '' && (
          <Text color={color} bold>
            {' '}
            · {hint}
          </Text>
        )}
        {five !== null && (
          <Text color={COLORS[levelFor(five.pct, LIMIT_STEPS)]}>
            {'   '}5h: {Math.round(five.pct)}%{remaining(five.resetsAt, now) !== '' ? ` · ${remaining(five.resetsAt, now)}` : ''}
          </Text>
        )}
        {week !== null && (
          <Text color={COLORS[levelFor(week.pct, LIMIT_STEPS)]}>
            {'   '}week: {Math.round(week.pct)}%
          </Text>
        )}
        <Text> </Text>
        <Button key="hide" label="Hide" onPress={() => update($, isHidden, () => true)} />
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Button, Text } = $.ui.resolve(e)
    const snap = await read($, snapshot)
    const now = await read($, clock)

    if (snap === null) return <Text dimColor>No reading yet.</Text>

    const pct = snap.ctxWindow > 0 ? (snap.ctxTokens / snap.ctxWindow) * 100 : 0
    const level = levelFor(pct, CTX_STEPS)
    const limitLine = (label: string, l: JaugeSnapshot['five'], withClock: boolean) =>
      l === null ? (
        <Text dimColor>{label}: not reported</Text>
      ) : (
        <Text color={COLORS[levelFor(l.pct, LIMIT_STEPS)]}>
          {label}: {bar(l.pct)} {Math.round(l.pct)}%{remaining(l.resetsAt, now) !== '' ? ` · ${remaining(l.resetsAt, now)}` : ''}
          {withClock ? ` (resets at ${clockTime(l.resetsAt)})` : ''}
        </Text>
      )

    return (
      <Box flexDirection="column">
        <Text bold>Context</Text>
        <Text color={COLORS[level]}>
          {bar(pct)} {Math.round(pct)}% · {kilo(snap.ctxTokens)} / {kilo(snap.ctxWindow)} (compaction window)
        </Text>
        {hintFor(level) !== '' && <Text color={COLORS[level]} bold>{hintFor(level)}</Text>}
        <Text dimColor>thresholds: 50% yellow · 70% orange · 85% red</Text>
        <Text> </Text>
        {snap.categories.map(c => (
          <Text dimColor>
            {c.name.padEnd(26)} {kilo(c.tokens)}
          </Text>
        ))}
        <Text> </Text>
        <Text bold>Limits</Text>
        {limitLine('5h', snap.five, true)}
        {limitLine('Week', snap.week, false)}
        <Text dimColor>thresholds: 60% yellow · 80% orange · 90% red</Text>
        <Text> </Text>
        {snap.costUsd !== null && <Text>Session cost: ${snap.costUsd.toFixed(2)}</Text>}
        <Text> </Text>
        <Box>
          <Button key="close" label="Close" onPress={() => $.ui.close({ id: PANE })} />
        </Box>
      </Box>
    )
  })
}
