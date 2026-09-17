# Module Boundaries

## Boundary model

A module boundary is useful when it gives a concept:

- an owner;
- an internal implementation area;
- a public contract;
- a predictable dependency direction;
- an independent change reason.

Folders alone do not create a boundary.

## Public surface

Prefer external imports through an intentional surface:

```text
feature-b/index.ts
package exports
application service contract
domain interface
```

Avoid consumers depending on internal file layout:

```text
feature-a -> feature-b/internal/parser
feature-a -> feature-b/components/private-row
```

If consumers repeatedly need internals, either:

1. the public surface is missing a real contract;
2. ownership is wrong;
3. the two modules are not actually separate boundaries.

Choose deliberately instead of adding another deep import.

## Dependency direction

Write the direction in domain terms rather than generic slogans.

Example:

```text
app composition -> features -> shared primitives
feature UI -> feature application/data contracts
infrastructure -> implements domain/application ports
```

The exact direction may differ by architecture. What matters is that cycles and reach-through are explainable exceptions, not defaults.

## Shared modules

Promote code to shared only when:

- at least two independent owners need it;
- its semantics are not feature-specific;
- the contract is stable enough to name;
- callers should not care about an original feature's internals.

Do not use `shared`, `common`, or `utils` to avoid deciding ownership.

## Cross-feature orchestration

When feature A and B must participate in one workflow, consider an orchestration owner above both rather than making them import each other's internals.

Possible owners:

- route/workflow module;
- application layer;
- event contract;
- parent feature that genuinely owns the combined workflow.

## Cycles

A cycle often signals:

- split ownership;
- a missing higher-level orchestrator;
- an abstraction extracted at the wrong level;
- package boundaries that do not match change boundaries.

Do not fix a cycle only by moving types to a random `common` package. Resolve the semantic dependency when possible.
