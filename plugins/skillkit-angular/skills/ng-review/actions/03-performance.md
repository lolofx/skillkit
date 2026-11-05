# Action 03: performance

Check:

- `track` missing or weak in `@for`: use `track item.id`, not `track $index`.
- Redundant or needlessly nested `computed()` signals.
- Heavy sections without `@defer`.
- Images without `NgOptimizedImage` (`<img ngSrc="...">`).
- Unused entries in the component's `imports` array (grows the bundle).
- Signals read several times in the template when a single `computed()` would do.
