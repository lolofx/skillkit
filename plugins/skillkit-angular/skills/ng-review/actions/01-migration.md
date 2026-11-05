# Action 01: migration to modern Angular

Detect and explain each outdated pattern:

| Detected | Problem | Modern solution |
| -------- | ------- | --------------- |
| `@Input()` decorator | Class API, not reactive | `input()` / `input.required()` signal |
| `@Output()` + `EventEmitter` | Verbose, weak typing | `output<T>()` |
| `[(ngModel)]` / `@Input()` + `@Output()` two-way binding | Manual ceremony | `model<T>()` |
| `*ngIf` / `*ngFor` / `*ngSwitch` | Old structural directive syntax | `@if` / `@for` / `@switch` |
| `constructor(private x: X)` | Constructor injection | `inject(X)` |
| `BehaviorSubject` for local state | RxJS for synchronous state | `signal<T>()` |
| `subscribe()` without cleanup | Potential memory leak | `toSignal()` or `takeUntilDestroyed()` |
| `async` pipe | Hides error handling | `toSignal()` with `initialValue` |
| `ChangeDetectionStrategy.Default` (or absent) | Excessive re-renders | `OnPush` everywhere |
| `@NgModule` | Outdated architecture | Standalone components + `app.config.ts` |
| `@HostBinding` / `@HostListener` | Verbose decorators | `host: {}` object in `@Component` |
| Method call in the template `[prop]="method()"` | Recomputed on every change detection | `computed()` signal |

Check the project's Angular version before recommending an API: a replacement that does not exist in that version is not a fix.
