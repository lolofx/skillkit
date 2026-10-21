# Action 04: TypeScript quality

Check:

- Explicit or implicit `any`.
- Types too wide (`string` instead of a literal union).
- Non-null assertion (`!`) without a justifying comment.
- Missing interfaces for DTOs and domain models.
- Optional chaining (`?.`) used where the type should be non-nullable: hides a design problem.
