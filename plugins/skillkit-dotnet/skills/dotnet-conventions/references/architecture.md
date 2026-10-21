# Architecture: the base

Mandatory for any service, whatever its domain profile. The DDD toolbox is graded separately (`ddd.md`).

## 1. Hexagonal by dependencies, not by folders

Hexagonal architecture is a **dependency rule**, not a directory tree:

```
Domain  ←  Application  ←  Infrastructure
                        ←  Api
```

- **Domain**: pure business logic. Zero technical dependency: no ORM, no HTTP client, no framework. The center of the hexagon.
- **Application**: use cases (commands, queries, handlers). Orchestrates the domain, depends on the domain only.
- **Infrastructure**: technical implementations (persistence, external services). Depends on domain and application, never the reverse.
- **Api**: entry point (HTTP endpoints, messaging...). Dispatches to the application, zero business logic.

**Ports** (interfaces, for example `IOrderRepository`) are defined **on the domain side** and implemented **on the infrastructure side**. The domain says what it needs; infrastructure provides it.

> Domain and Application may live in one project or two. What matters is the direction of the dependencies, never the number of `.csproj`.

## 2. Business / use-case slicing, never technical

**Forbidden**: organizing code by technical role. No `Ports/`, `Adapters/`, `Services/`, `Interfaces/`, `Helpers/` folder at the root of a module.

**Required**: organize by **business module**, then by **use case**. The rule is the same for clean architecture and hexagonal.

```
FORBIDDEN                            EXPECTED
src/                                 src/
  Ports/                               Orders/
    IOrderRepository.cs                  Domain/
    IInvoiceRepository.cs                Persistence/      <- IOrderRepository
  Adapters/                              UseCases/
    OrderRepository.cs                     CreateOrder/    <- Command + Handler + Validator
  Services/                                ConfirmOrder/
    OrderService.cs                        GetOrder/       <- Query + Handler
                                         Invoicing/
                                           ...
```

Test question: "where does business rule X live?" The answer must be a **business folder** (`Orders/Domain/`), never a technical one (`Services/`).

## 3. Reference structure of a module

Adapt to the project's real paths. Generic shape:

```
{App}.Domain/                    <- domain + application (adjust if split)
  {Module}/
    Domain/                      <- business logic (content depends on the profile, see ddd.md)
    Models/                      <- output DTOs
    Persistence/                 <- I{X}Repository interfaces (zero ORM dependency)
    UseCases/
      Create{X}/                 <- Command + Handler + Validator
      Get{X}/                    <- Query + Handler
    Mappings/                    <- mapping configuration

{App}.Infrastructure/
  {Module}/
    Entities/                    <- ORM entities (distinct from the domain, see ddd.md)
    Configuration/               <- table / column mapping, indexes
    Mappings/                    <- conversion extensions
    {X}Repository.cs             <- port implementation

{App}.Api/
  {Module}/
    ConfigureModule.cs           <- module registration + route groups
    {X}Endpoints.cs

{App}.Tests/
  {Module}/                      <- mirrors the use-case structure
```

## 4. Typical request flow

1. **Api** receives the request, builds a Command/Query, dispatches it (mediator or equivalent).
2. **Handler** (Application) orchestrates: loads through the port, calls the domain, persists.
3. **Domain** applies the business rules (according to the profile, see `ddd.md`).
4. **Infrastructure** implements the port: ORM conversion, database access, external services.
5. The result goes back up (`Result<T>` or the project's equivalent); the Api converts it into an HTTP response.

No shortcut: an endpoint never calls a repository directly, a handler carries no HTTP logic, a repository carries no business rule.

## 5. Base checklist (always checked, whatever the profile)

- [ ] The domain imports no technical dependency (ORM, HTTP, framework).
- [ ] Dependencies point toward the domain, never away from it.
- [ ] Ports are defined on the domain side and implemented on the infrastructure side.
- [ ] Slicing is business / use case: no technical folder at the root of a module.
- [ ] One handler = one precise business action.
- [ ] Zero business logic in endpoints and repositories.
- [ ] Unit tests of the domain and the handlers run without infrastructure.
