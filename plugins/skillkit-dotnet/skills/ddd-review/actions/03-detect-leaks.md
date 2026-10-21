# Action 03: detect-leaks

Goal: find **layer leaks**, meaning logic placed in the wrong layer.

Detect and report:
- Business logic in a handler (it belongs in the domain)
- ORM or infrastructure dependency imported in the domain or a handler
- An endpoint calling a repository directly (bypasses the mediator)
- A repository containing business filtering rules
- HTTP context inside a handler
- `public` on a handler or validator (breaks the module's encapsulation)
- An aggregate with a public setter (breaks the domain's encapsulation)
- An ORM entity used directly in a handler (bypasses the mapping)
- A domain event dispatched with no registered handler

Report each leak with the finding block of `dotnet-conventions/references/review-format.md` (without Before / After). Then close with the mandatory final summary.
