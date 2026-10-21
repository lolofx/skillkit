# Action 02: write

1. Create or extend the `*.spec.ts` next to the source file, following the project's convention.
2. Follow the pattern of the code type (`references/code-types.md`).
3. One test per scenario. Arrange / Act / Assert, no comment restating the code.
4. Configure `TestBed` minimally: provide only what the unit needs, with fakes for injected services. Do not import whole feature modules.
5. Components are standalone and OnPush: after changing an input or a signal, trigger change detection explicitly (`fixture.detectChanges()` or `await fixture.whenStable()`), and set inputs through the supported API (`fixture.componentRef.setInput`).
6. Never reach into private members. If something is hard to test through the public surface, report it as a design signal.
7. Do not rely on real timers or real HTTP: use fake timers and `HttpTestingController` (or the project's HTTP test helpers).
