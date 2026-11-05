# Test patterns per code type

Examples assume Vitest-style APIs (`describe`, `it`, `expect`, `vi`). Translate to the project's runner if it differs.

## Pure function / utility

- Table-driven cases (`it.each`): normal values, boundaries, empty and invalid input.
- No `TestBed`.

## Service

- `TestBed.inject` with fakes for its own dependencies.
- HTTP: `provideHttpClient()` + `provideHttpClientTesting()`, then `HttpTestingController` to expect a request and flush a response or an error; call `httpMock.verify()` at the end.
- Assert returned values / emitted state, and the request made (method, URL, body) only when that is the behavior.

## Store / signal state

- Read signals by calling them. Drive the state through the public methods and assert the derived `computed()` values.
- Async actions: await them, or use fake timers for debounced behavior.

## Component

- Create with `TestBed.createComponent`; set inputs with `fixture.componentRef.setInput('name', value)`.
- Trigger change detection explicitly (OnPush), then assert on the rendered DOM through `data-testid` or accessible roles.
- Outputs: subscribe to the `output()` (or spy) and trigger the user action (click, input event); assert the emitted value.
- Presentational components: no service fakes needed. Smart components: provide fakes for the services and assert the interaction and the resulting state.

## Pipe

- Instantiate directly (`new MyPipe()`) when it has no dependency; table-driven cases.

## Directive

- A small host test component using the directive; assert the DOM / class / attribute effect.

## Functional guard, resolver, interceptor

- Run inside `TestBed.runInInjectionContext(() => guard(route, state))` with fake dependencies; assert the returned boolean / `UrlTree` / value.
- Interceptor: `HttpTestingController`, assert the modified request or the error handling.
