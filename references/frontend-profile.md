# Frontend Profile: React and Vue

This is a decision profile, not a mandatory directory template.

## Entrypoints and routes

Keep app roots and route files focused on:

- providers;
- routing;
- top-level layout;
- dependency wiring;
- route-level composition.

Move durable feature behavior to the feature/workflow owner when route or App files begin owning:

- feature-specific mutations;
- unrelated modal/form state;
- business validation/policy;
- multiple independent data flows;
- large event-handler families.

## Feature-first structure when it fits

For medium product applications with distinct capabilities, a structure such as this is often useful:

```text
src/
  app/
  features/
    chat/
    settings/
  shared/
    ui/
    lib/
```

But preserve an established route/domain/package vocabulary when it is already coherent.

Within a feature, colocate only the subfolders actually needed. Do not pre-create `api/`, `hooks/`, `model/`, `utils/`, etc. for every feature.

A feature root is a composition boundary, not a license to place the entire feature in one component. When a feature contains independent workflows or substantial interaction owners, decompose internally by semantic ownership. See `component-decomposition.md`.

## React

- Keep server/query state distinct from local UI state.
- Use component ownership rules before lifting state.
- After moving behavior from `App`/route into a feature, review whether the feature root itself now contains multiple workflow/component owners.
- Treat Effects as external synchronization, not general control flow.
- Keep reusable primitives free of feature policy.
- In frameworks with server/client component boundaries, preserve the framework's data/serialization constraints before applying generic patterns.

## Vue

- Keep composables close to the feature when they encode feature behavior.
- Promote composables only when they expose a stable cross-feature contract.
- Pinia/global stores should not become the default owner for local workflow state.
- Keep route views thin when feature behavior can have a clearer owner.
- Shared components should remain semantically shared, not merely visually similar.

## Styling and design-system boundaries

A design-system primitive owns stable interaction/visual semantics.
A feature component owns product meaning.

Do not push product-specific branching into the design system simply to reduce file count.
