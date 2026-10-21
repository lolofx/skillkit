# DDD: graded per module

The base (`architecture.md`) is mandatory everywhere. The DDD toolbox described here is **graded**: applied where the business justifies it, never by reflex.

## 1. Two profiles

The profile is declared in the project memory (see the `dotnet-conventions` skill), globally or module by module.

|               | **simple** profile                       | **rich** profile                                  |
| ------------- | ---------------------------------------- | ------------------------------------------------- |
| When          | CRUD, reference data, few rules          | Strong domain: invariants, states, calculations   |
| Entities      | Plain entities (POCO + input validation) | `sealed` aggregates + factory                     |
| Handlers      | Thin, basic validation logic             | Thin too: delegate to the aggregate's methods     |
| Errors        | The project's convention                 | `Result<T>` end to end                            |
| Value objects | No                                       | Yes, for any concept with its own rule            |
| Domain events | No                                       | Yes, if business reactions follow                 |
| ORM entity    | May be used directly                     | **Distinct** from the aggregate, explicit mapping |

### Choosing

The **rich** profile is justified when the module shows several of these signs:

- Many business rules: state transitions, cross validations, calculations.
- Invariants to protect (a value that must always satisfy a business constraint).
- A life cycle with states and transitions (statuses, progression).
- Business concepts with their own validity rules (value object candidates).
- Business logic reused by several use cases.

Otherwise: **simple**. An aggregate on top of a CRUD is over-engineering: more code, mappings and tests, protecting no rule.

### Arbitration

- Profile undeclared, or inconsistent with the observed code: phase 1 of `ddd-review` ("is DDD justified?") arbitrates.
- Reviews check the base **always**, the DDD toolbox **only if the profile declares it**, and flag any gap between declared profile and observed code.

## 2. Simple profile: rules

- Plain entities, no factory, no heavy encapsulation.
- Thin handlers: input validation, repository call, DTO mapping.
- No aggregate, no value object, no domain event.
- The base stays whole: ports on the domain side, use-case slicing, zero business logic in endpoints and repositories.

## 3. Rich profile: the toolbox

### Aggregate

- `sealed`, `private` constructor.
- Factory `public static {X}Aggregate Create(...)`: validates **all** invariants, throws on invalid input (an invalid creation is a caller bug).
- `Reconstitute(...)` rebuilds from persistence **without re-validating** (invariants were guaranteed at creation).
- **No public setter**: every state change goes through a named business method (`Confirm()`, `Cancel(reason)`, never `set Status`).
- Mutation methods carrying business validation return `Result<T>`: an expected business failure is not an exception.
- IDs are generated in the factory, not by the database.

### Value objects

- Any business concept with its own validity rule (email, amount, period...).
- Validate their invariants at construction.
- Immutable, equality by value.

### Result&lt;T&gt;

- End to end: aggregate, handler, endpoint.
- Handlers return `Result<T>`: every failure is returned explicitly, never a `throw` for an expected business case.
- The Api converts the `Result<T>` into an HTTP response through the project's error mapper.

### Domain events

- Implement the project's domain-event interface, dispatched through the aggregate.
- Every dispatched event has a registered handler: an orphan event is a bug.

### ORM entity is not the aggregate

- The ORM entity lives in infrastructure, the aggregate in the domain: two distinct objects.
- Conversion through explicit mapping extensions: Aggregate <-> ORM entity <-> DTO.
- The database schema can evolve without touching the domain.

## 4. Grading checklist (rich profile only)

- [ ] Aggregates `sealed`, private constructor, `Create()` factory validating invariants.
- [ ] `Reconstitute()` present to rebuild from persistence.
- [ ] No public setter: mutations through named business methods.
- [ ] Mutations with business validation return `Result<T>`.
- [ ] Value objects for concepts with their own rules, validated at construction.
- [ ] `Result<T>` end to end, zero `throw` for an expected business failure.
- [ ] ORM entity distinct from the aggregate, explicit mappings.
- [ ] Domain events dispatched through the aggregate, each with its handler.
- [ ] Business rules testable without any infrastructure.
