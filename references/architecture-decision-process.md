# Architecture Decision Process

Use this reference when a change creates or alters a durable system boundary.

## 1. Start from consequences, not aesthetics

Architecture depth should track the cost of a wrong boundary.

Ask:

- How many future changes are likely to cross this seam?
- How many independent behaviors/data owners are involved?
- Is this a local UI detail or a durable product capability?
- Will multiple contributors/agents work in this area?
- Is there an existing repository convention that already answers the question?

A tiny app may need almost no explicit architecture. A medium app with several independent capabilities usually benefits from explicit owners and public surfaces even if the codebase is still small.

## 2. Classify current structure

Do not force a taxonomy; use it to understand the repository.

### Route-centric

Routes/pages are the main organizing axis. Works well when routes are cohesive and not overloaded.

Risk: route files become business owners.

### Feature-centric

Capabilities own UI, state, data access, and behavior near each other.

Risk: features become isolated silos or duplicate stable shared contracts.

### Domain-centric

Business concepts define module boundaries.

Risk: ceremony if the product domain is simple.

### Layer-centric

UI/services/repositories/etc. form horizontal layers.

Risk: one user-facing change touches many distant folders and ownership becomes implicit.

### Package-centric / monorepo

Package boundaries carry architectural meaning.

Risk: packages become too small, cyclic, or expose internals casually.

### Mixed / legacy

Common and acceptable. Improve one seam at a time instead of performing taxonomy cleanup.

## 3. Decide whether to preserve, deepen, or redesign

Prefer **preserve** when:

- existing boundaries are understandable;
- nearby code follows them consistently;
- the requested change fits naturally.

Prefer **deepen** when:

- behavior works but concepts leak across boundaries;
- the same rule/state appears in multiple owners;
- navigation cost is high;
- a feature repeatedly reaches through another feature.

Consider **redesign** only when:

- the existing model cannot represent the requested capability safely;
- constraints have materially changed;
- incremental repair would preserve the wrong ownership model.

Redesign scope should still be the smallest coherent boundary necessary.

## 4. Write a short architecture brief before coding

For a significant change, Codex should be able to state internally or in the task record:

```text
Change:
Owner:
State owner:
Data owner:
Public surface:
Allowed dependencies:
Placement:
Verification:
Architecture docs affected:
```

Do not produce ceremony in user-facing output unless useful, but do resolve these questions.

## 5. Prefer one vertical proof before generalization

Implement one real path end to end. Use it to validate:

- ownership;
- contracts;
- data flow;
- testability;
- navigation cost.

Only then extract shared abstractions when evidence appears.
