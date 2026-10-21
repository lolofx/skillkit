# Angular guidelines

## 1. Signals: local reactive state

- **`signal<T>(value)`** for any mutable local state. Never a `BehaviorSubject` for synchronous state.
- **`computed()`** for any value derived from one or more signals. No method calls in templates.
- **`effect()`** only for imperative side effects (analytics, third-party DOM integrations). An effect that syncs two signals is a design error: use `linkedSignal()`.
- **`toSignal(observable$)`** to turn an Observable into a signal in a component. `takeUntilDestroyed()` when a `subscribe()` stays in a service.

```typescript
// Correct
readonly count = signal(0);
readonly doubled = computed(() => this.count() * 2);

// Avoid
count$ = new BehaviorSubject(0);
doubled$ = this.count$.pipe(map(c => c * 2));
```

## 2. Components: architecture

- **Standalone**: no `@NgModule`. Import only what the template uses.
- **`ChangeDetectionStrategy.OnPush`** on every component, without exception.
- **`inject()`** instead of constructor injection (less verbose, works in utility functions).
- **`host: {}`** in `@Component` instead of `@HostBinding` / `@HostListener`.
- Zoneless change detection is the direction of the framework: do not rely on `NgZone` or on Zone-triggered updates; signals and `OnPush` already comply.

```typescript
@Component({
  selector: 'app-user',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `...`,
  host: { class: 'block' },
})
export class UserComponent {
  private userService = inject(UserService);
  readonly user = toSignal(this.userService.user$);
}
```

(`standalone: true` is the default in recent versions; keep it only if the project's version still requires it.)

## 3. Modern APIs: inputs, outputs, two-way

- `input<T>()` / `input.required<T>()` instead of `@Input()`.
- `output<T>()` instead of `@Output()` + `EventEmitter`.
- `model<T>()` for two-way binding instead of an `@Input()` + `@Output()` pair.

```typescript
// Correct
readonly value = input.required<string>();
readonly changed = output<string>();
readonly selected = model<boolean>(false);

// Obsolete
@Input() value!: string;
@Output() changed = new EventEmitter<string>();
```

## 4. Template: control-flow syntax

- `@if` / `@else` instead of `*ngIf`.
- `@for (item of items; track item.id)` instead of `*ngFor`. `track` must discriminate by identifier, not `$index`.
- `@switch` instead of `*ngSwitch`.
- `@defer` for heavy sections loaded outside the viewport.

```html
@if (user(); as u) {
  <p>{{ u.name }}</p>
} @else {
  <p>Loading...</p>
}

@for (item of items(); track item.id) {
  <app-item [item]="item" />
}

@defer (on viewport) {
  <app-heavy-chart />
}
```

## 5. Data fetching and forms

- Fetching goes through a service, never directly in a component. In recent versions, `resource()` / `httpResource()` give a signal-based async state (value, loading, error); they were experimental at introduction, so check the version and status before adopting them.
- Reactive state that must be shared across features belongs in a store (for example NgRx SignalStore, if the project uses one); state that is local to one component stays in signals inside it.
- Forms: use the project's established approach (reactive forms, or signal forms where the version supports them). Do not mix approaches inside one feature.
- Convert API DTOs to domain models at the boundary (one converter per DTO), so templates never depend on the wire format.

## 6. Components: separation rule

Two distinct kinds of components:

| Type | Responsibility | Injects services? |
| ---- | -------------- | ----------------- |
| **Smart** (container) | Orchestrates state, calls services | Yes |
| **Presentational** | Displays data, emits events | No |

A component doing both must be split. Presentational components live in `components/`, smart ones in `pages/` or `features/`.

## 7. Images

Always use `NgOptimizedImage` for static images:

```html
<img ngSrc="photo.jpg" width="400" height="300" alt="Photo" priority />
```

## 8. Testability and i18n

- Stable hooks for tests: a `data-testid` attribute on elements tests need to find, rather than CSS classes or text.
- User-facing text goes through the project's i18n mechanism (`i18n` attributes / `$localize` or the project's library); no hard-coded strings if the project is localized.
- Design tokens (colors, spacing) come from the project's SCSS variables or CSS custom properties, not literals, when the project defines them.

## 9. TypeScript quality

- No explicit or implicit `any`: enable `noImplicitAny` (or `strict`) in `tsconfig.json`.
- Literal union types rather than generic `string` for constrained values.
- A non-null assertion (`!`) must always come with a comment.
- Interfaces for all DTOs and domain models (no anonymous objects).
- Avoid `?.` where the type should be non-nullable: it is often a design problem.
