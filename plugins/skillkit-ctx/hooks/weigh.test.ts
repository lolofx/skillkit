import { expect, test } from 'claude-code/testing'

import { grew, k, split, top } from './weigh'

test('split shares the total by description length', async () => {
  const r = split(1000, { A: 100, B: 300 })
  expect(r.A + r.B).toBeGreaterThanOrEqual(999)
  expect(r.B).toBeGreaterThan(r.A)
})

test('k formats thousands', async () => {
  expect(k(950)).toBe('950')
  expect(k(63000)).toBe('63.0k')
})

test('grew keeps only what moved', async () => {
  expect(grew({ Messages: 10, Skills: 5 }, { Messages: 40, Skills: 5, Tools: 3 })).toEqual({ Messages: 30, Tools: 3 })
})

test('top sorts desc and cuts', async () => {
  expect(top({ a: 1, b: 9, c: 5 }, 2)).toEqual([['b', 9], ['c', 5]])
})
