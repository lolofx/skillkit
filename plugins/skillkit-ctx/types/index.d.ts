export type Weights = Record<string, number>

export type Snap = {
  total: number
  window: number
  cats: Weights
  skills: Weights
  mcp: Weights
  memory: Weights
  agents: number
  // expandable detail, key = `skills:<plugin>` or `mcp:<server>`
  detail: Record<string, Weights>
}

export type Turn = { n: number; total: number; delta: number; up: Weights; tools: string[] }

export type CtxState = { base: Snap | null; last: Snap | null; turns: Turn[]; tdesc?: Weights; open: string[] }

declare module 'claude-code' {
  interface PluginState {
    'skillkit-ctx': { snap: CtxState }
  }
}
