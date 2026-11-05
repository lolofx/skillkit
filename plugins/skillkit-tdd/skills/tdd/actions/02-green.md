# Action 02: green

Goal: the layer's tests pass, nothing else breaks.

1. Write the **minimum** production code, **in the current layer only**, that makes the failing tests pass. No anticipation, no "while I'm here".
2. Put the code where the project's architecture says it belongs (layering and conventions come from the stack plugin or the project memory). Respect the dependency rule: the layer depends only on inner layers.
3. Need something from an inner layer (a missing domain member, a port)? Stop. Do not edit the inner layer from here: report it, reopen that layer's slice with a new RED, then come back.
4. Do not touch the tests. If one looks wrong, stop and report it.
5. Run the **whole suite**: the layer's tests pass and no other test fails.

Report: files touched, suite result. Update the slice status to `green` if a plan tracks it.
