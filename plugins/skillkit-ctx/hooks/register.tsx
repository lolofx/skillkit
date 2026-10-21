import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { CtxState } from '../types'
import { grew, k, split, take, top } from './weigh'

const PANE = 'skillkit-ctx'
const empty: CtxState = { base: null, last: null, turns: [], open: [] }
const state = atom({ plugin: 'skillkit-ctx', key: 'snap' } as const, empty)

// tools called since the last measure: they explain what the turn added
let tools: string[] = []

// ponytail: 'summary' = local estimate, free; 'full' (token-count API) if the numbers drift from /context
async function refresh($: EngineInterface) {
  try {
    const b = (await $.session.usage({ breakdown: 'summary' })).context.breakdown
    if (!b) return
    const snap = take(b)
    // the breakdown has no per-tool rows: split the "System tools" total over the built-in tools
    const sys = Object.keys(snap.cats).find(n => /system tools/i.test(n))
    if (sys) snap.detail[`cats:${sys}`] = split(snap.cats[sys], (await read($, state)).tdesc ?? {})
    const called = tools
    tools = []
    await update($, state, s => {
      const prev = s.last
      const delta = prev ? snap.total - prev.total : 0
      const turns = prev
        ? [...s.turns, { n: s.turns.length + 1, total: snap.total, delta, up: grew(prev.cats, snap.cats), tools: called }]
        : s.turns

      return { ...s, base: s.base ?? snap, last: snap, turns: turns.slice(-50) }
    })
  } catch {
    // the pane just keeps its last figures
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'ctx', description: 'Open or close the pane showing what weighs on the context' })
    void refresh($) // silent baseline; the pane only opens via /ctx

    return next(e)
  })

  on('command.run', { command: 'ctx' }, async $ => {
    if ((await $.ui.panes()).some(p => p.id === PANE)) {
      await $.ui.close({ id: PANE })

      return { text: 'Context pane closed.' }
    }
    await refresh($)
    await $.ui.open({ id: PANE, title: 'Context', focus: true, closeOnEscape: true })

    return { text: 'Context pane opened.' }
  })

  // description length of every tool listed in the prompt (deferred ones cost nothing until loaded)
  on('tool.describe', async ($, e, next) => {
    const r = await next(e)
    if (!r.isDeferred && e.provider.plugin === 'engine') {
      await update($, state, s => ({ ...s, tdesc: { ...s.tdesc, [e.tool]: r.description.length } }))
    }

    return r
  })

  on('tool.call', async ($, e, next) => {
    tools.push(e.tool)

    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    await refresh($)

    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const s = await read($, state)
    if (!s.base || !s.last) return <Text dimColor>Measuring…</Text>

    const { base, last, turns } = s
    const open = s.open ?? []
    const toggle = (id: string) => () =>
      update($, state, c => {
        const o = c.open ?? []

        return { ...c, open: o.includes(id) ? o.filter(x => x !== id) : [...o, id] }
      })
    const rows = e.viewport?.rows ?? 40
    const pct = Math.round((last.total / last.window) * 100)
    // share of the window: green small, yellow noticeable, red heavy
    const heat = (v: number) => {
      const share = v / last.window

      return share > 0.08 ? 'error' : share > 0.02 ? 'warning' : 'success'
    }
    const bar = (v: number) => '█'.repeat(Math.max(1, Math.round((v / last.window) * 100)))
    const line = (name: string, v: number, d = 0) => (
      <Text>
        <Text color={heat(v)}>{k(v).padStart(7)}</Text> <Text color={heat(v)}>{bar(v).padEnd(8)}</Text> {name}
        {d ? <Text color={d > 0 ? 'warning' : 'success'}>{`  ${d > 0 ? '▲' : '▼'}${k(Math.abs(d))}`}</Text> : null}
      </Text>
    )
    const block = (title: string, color: string, w: Record<string, number>, n: number, ref: Record<string, number> = {}, kind = '') => (
      <Box flexDirection="column" marginTop={1}>
        <Text bold color={color}>{title}</Text>
        {top(w, n).flatMap(([name, v]) => {
          const id = `${kind}:${name}`
          const items = kind ? last.detail?.[id] : undefined
          const isOpen = open.includes(id)
          const row = line(`${items ? (isOpen ? '▾ ' : '▸ ') : ''}${name}`, v, v - (ref[name] ?? v))

          return [
            items ? <Button key={id} plain onPress={toggle(id)}>{row}</Button> : row,
            ...(isOpen && items ? top(items, 15).map(([n2, v2]) => <Text dimColor>{`    ${k(v2).padStart(6)}  ${n2}`}</Text>) : []),
          ]
        })}
      </Box>
    )
    // history gets what the fixed blocks leave
    const room = Math.max(3, rows - 30)

    return (
      <Box flexDirection="column">
        <Text bold>
          <Text color={pct > 80 ? 'error' : pct > 50 ? 'warning' : 'success'}>{k(last.total)}</Text> / {k(last.window)} (
          <Text color={pct > 80 ? 'error' : pct > 50 ? 'warning' : 'success'}>{pct}%</Text>)
          <Text dimColor> — at start </Text>
          <Text color="suggestion">{k(base.total)}</Text>
          <Text dimColor>, added </Text>
          <Text color="warning">{k(last.total - base.total)}</Text>
        </Text>
        {block('By category (Δ since start)', 'claude', last.cats, 8, base.cats, 'cats')}
        {block('Skills by plugin', 'suggestion', last.skills, 6, {}, 'skills')}
        {block('MCP by server (loaded schemas)', 'permission', last.mcp, 8, {}, 'mcp')}
        {block('Memory', 'remember', last.memory, 10)}
        <Box marginTop={1}>{line('agents', last.agents)}</Box>
        <Box flexDirection="column" marginTop={1}>
          <Text bold color="merged">Turns (latest at bottom)</Text>
          {turns.length === 0 && <Text dimColor>Nothing added yet.</Text>}
          {turns.slice(-room).map(t => {
            const main = top(t.up, 1)[0]

            return (
              <Text>
                <Text dimColor>#{t.n}</Text>{' '}
                <Text color={t.delta > 5000 ? 'error' : t.delta > 1000 ? 'warning' : 'success'}>{`+${k(t.delta)}`.padStart(7)}</Text>{' '}
                <Text color="suggestion">{main ? `${main[0]} ${main[1] > 0 ? '+' : ''}${k(main[1])}` : ''}</Text>
                <Text dimColor> {[...new Set(t.tools)].join(' ')}</Text>
              </Text>
            )
          })}
        </Box>
      </Box>
    )
  })
}
