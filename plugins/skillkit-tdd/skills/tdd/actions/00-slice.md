# Action 00: slice

Goal: turn the step into an ordered list of layer slices, each small enough to be one TDD cycle and one commit.

1. Restate the step's expected behavior in one or two sentences.
2. Read `references/layers.md`. For each layer, decide what this step changes there:
   - Domain: new or changed rules, entities, value objects, **ports** the use case will need.
   - Application: the use case (command or query, handler, validator).
   - API / presentation: the endpoint or the component that exposes it.
   - Infrastructure: the port implementation and its persistence or external call.
3. Drop the layers with nothing to do and state why in one line each. Do not invent work to fill a layer.
4. List the slices **in dependency order** with, for each: the behaviors to test (a short bullet list) and the expected commit title.
5. If the plan tracks status, add the slices as sub-steps of the step (`<step>: domain`, `<step>: application`, ...).
6. Show the slice list to the user when the step is non-trivial, and wait for a go when the split is debatable.

Report: the ordered slices, the skipped layers with the reason.
