# State and Data Ownership

## Canonical-source rule

For each mutable value, identify one canonical owner.

Other layers may derive, select, cache, or render it, but should not silently become competing authorities.

## Local UI state

Examples:

- hover/open state;
- local input state;
- a single component's temporary interaction state.

Default owner: lowest consumer that coordinates the interaction.

## Workflow state

Examples:

- multi-step form progress;
- editor draft shared by sibling panels;
- selection that coordinates several child components.

Default owner: the workflow boundary, not necessarily a global store.

## Server/remote state

Keep remote truth in the query/data layer nearest the consumers.

Avoid this by default:

```text
query data -> effect -> local state mirror
```

A local copy is justified when it has a distinct contract, such as:

- editable draft;
- intentional snapshot;
- offline buffer;
- optimistic transaction model.

Name that distinction explicitly.

## URL state

Route identity, search params, pagination/filter state intended for deep links, and similar values often belong to the URL/router.

Avoid maintaining the same canonical value independently in URL + global store + component state.

## Persisted client state

Local storage/indexed storage can persist state without becoming a second owner.

Define:

- canonical in-memory owner;
- hydration direction;
- write timing;
- schema/version behavior.

## Cross-cutting state

Use app-wide/global ownership only for truly cross-cutting concerns, such as a session or application-wide capability that many independent owners consume.

Do not promote local state globally merely to avoid prop passing through one or two legitimate composition layers.

## Derived state

Prefer deriving values from canonical state instead of storing both.

If a derived value is expensive, memoization/cache can optimize computation without changing semantic ownership.
