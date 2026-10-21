# Action 02: architecture and responsibilities (SRP)

Check:

- **Component doing too much**: does it display AND manage state? Split into smart + presentational.
- **Business logic in the template**: complex conditions and transformations belong in `computed()`.
- **Direct HTTP calls in the component**: data fetching goes through a service.
- **Store misuse**: local state that does not need sharing must not live in a global store.
- **Smart component in `components/`**: presentational components must not inject business services.
