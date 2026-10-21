import { test, expect } from 'claude-code/testing'
import { bar, crossings, CTX_STEPS, kilo, levelFor, levelsOf, LIMIT_STEPS, remaining } from './register'

test('context levels follow the 50/70/85 steps', () => {
  expect(levelFor(10, CTX_STEPS)).toBe(0)
  expect(levelFor(50, CTX_STEPS)).toBe(1)
  expect(levelFor(70, CTX_STEPS)).toBe(2)
  expect(levelFor(85, CTX_STEPS)).toBe(3)
  expect(levelFor(120, CTX_STEPS)).toBe(3)
})

test('limit levels follow the 60/80/90 steps', () => {
  expect(levelFor(59, LIMIT_STEPS)).toBe(0)
  expect(levelFor(60, LIMIT_STEPS)).toBe(1)
  expect(levelFor(90, LIMIT_STEPS)).toBe(3)
})

test('bar and kilo', () => {
  expect(bar(0)).toBe('░░░░░░░░░░')
  expect(bar(50)).toBe('▓▓▓▓▓░░░░░')
  expect(bar(150)).toBe('▓▓▓▓▓▓▓▓▓▓')
  expect(kilo(148400)).toBe('148k')
})

const snapOf = (ctxTokens: number, five: number | null, week: number | null): any => ({
  ctxTokens,
  ctxWindow: 200000,
  five: five === null ? null : { pct: five, resetsAt: '2026-10-13T12:14:00Z' },
  week: week === null ? null : { pct: week, resetsAt: '2026-10-15T00:00:00Z' },
  costUsd: null,
  categories: [],
})
const NOW = Date.parse('2026-10-13T10:00:00Z')

test('no toast on the first reading, even when already high', () => {
  expect(crossings(null, snapOf(190000, 95, 95), NOW)).toEqual([])
})

test('toast on a rise only, not on stay or fall', () => {
  const prev = levelsOf(snapOf(100000, 10, 10))
  expect(crossings(prev, snapOf(100000, 10, 10), NOW)).toEqual([])
  expect(crossings(prev, snapOf(150000, 10, 10), NOW)).toEqual(['🟠 Context at 75% — /compact soon'])
  expect(crossings(levelsOf(snapOf(190000, 10, 10)), snapOf(20000, 10, 10), NOW)).toEqual([])
})

test('limits toast with remaining time, missing limits are skipped', () => {
  const prev = levelsOf(snapOf(0, 70, null))
  expect(crossings(prev, snapOf(0, 91, 99), NOW)).toEqual(['🔴 5h limit at 91% — 2h 14m left'])
  expect(crossings(levelsOf(snapOf(0, 10, 10)), snapOf(0, 65, 85), NOW)).toEqual([
    '🟡 5h limit at 65% — 2h 14m left',
    '🟠 Week at 85%',
  ])
})

test('after a compact the next rise warns again', () => {
  const afterCompact = levelsOf(snapOf(20000, 10, 10))
  expect(crossings(afterCompact, snapOf(180000, 10, 10), NOW)).toEqual(['🔴 Context at 90% — /compact now'])
})

test('remaining time', () => {
  const now = Date.parse('2026-10-13T10:00:00Z')
  expect(remaining('2026-10-13T12:14:00Z', now)).toBe('2h 14m left')
  expect(remaining('2026-10-13T10:25:00Z', now)).toBe('25 min left')
  expect(remaining('2026-10-15T13:00:00Z', now)).toBe('2d 3h left')
  expect(remaining('2026-10-13T09:00:00Z', now)).toBe('')
  expect(remaining(undefined, now)).toBe('')
})
