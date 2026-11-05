export type JaugeLimit = { pct: number; resetsAt?: string }

export type JaugeSnapshot = {
  ctxTokens: number
  ctxWindow: number
  five: JaugeLimit | null
  week: JaugeLimit | null
  costUsd: number | null
  categories: { name: string; tokens: number }[]
}

declare module 'claude-code' {
  interface PluginState {
    'skillkit-gauge': { snapshot: JaugeSnapshot | null; isHidden: boolean; now: number }
  }
}
