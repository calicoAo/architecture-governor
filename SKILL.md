---
name: engineering-architecture
description: Govern architecture for non-trivial software changes. Use when Codex is designing, implementing, or refactoring features where module boundaries, component ownership, state/data ownership, directory structure, dependency direction, maintainability, giant entrypoints, mega-components, shared-code promotion, or architecture drift matter. Also use when deciding where code should live or when an existing codebase is becoming costly to change. Do not expand tiny copy, styling, rename, or isolated bug-fix tasks into architecture work unless the user asks for it.
---

# Engineering Architecture

Keep codebases understandable and evolvable without forcing one universal folder template.

The objective is not "more files" or "more layers". The objective is clear ownership, explicit boundaries, predictable dependency direction, and low long-term change cost.

## Core invariants

Apply these across stacks unless the repository has a deliberate, documented exception:

1. **Respect existing architecture first.** Do not re-architect a mature repository merely because another pattern is familiar.
2. **Ownership before placement.** Decide who owns behavior, state, data, interaction, and public contracts before deciding filenames or folders.
3. **Keep entrypoints thin.** App roots, route files, bootstrap files, and composition roots should primarily wire the application rather than accumulate feature business logic.
4. **Prefer one canonical owner.** Avoid mirrored state, duplicate business rules, or effect-driven synchronization between competing owners.
5. **Local first; promote by evidence.** Keep code with its feature/workflow owner until multiple independent consumers need a stable shared contract.
6. **Use public module surfaces.** Cross-module consumers should not reach into another module's internals.
7. **Split by responsibility and change reason, not line count.** LOC is a smell signal, never the architectural reason by itself.
8. **Do not speculate layers into existence.** Create abstractions, adapters, repositories, wrappers, or shared utilities only when they own a real contract.
9. **Make important boundaries durable.** When a violation is recurrent and mechanically detectable, add a guardrail rather than relying on prose alone.
10. **Preserve requested behavior and scope.** Architecture work must support the task, not replace it with a rewrite.

## Choose the lightest mode that fits

### Lightweight

Use for local changes inside an already-clear owner.

- Read nearby code and relevant repository instructions.
- Confirm the change stays within the existing owner/boundary.
- Implement directly.
- Do not create architecture documents or new layers.

### Design

Use for a new app, major surface, feature family, package, service, or previously undefined boundary.

- Inspect the repository and classify the system.
- Identify owners and dependencies.
- Choose a structure appropriate to this repository.
- Persist durable decisions when they will matter beyond the current change.
- Implement one coherent vertical slice before broad abstraction.

### Deepen

Use when the system works but changes are expensive because ownership or seams are unclear.

- Rank the architecture problems by change cost and recurrence.
- Pick one high-value seam.
- Migrate a coherent slice through that seam.
- Preserve behavior and avoid a broad rewrite.
- Harden the repaired seam if regression is likely.

### Harden

Use when the intended architecture is already known but agents/developers repeatedly violate it.

- Convert recurring, mechanically detectable violations into static checks, tests, package/export constraints, or CI gates.
- Keep subjective design judgment in documentation/review rather than pretending it is mechanically decidable.

Read `references/architecture-decision-process.md` when mode selection or architecture design is non-trivial.

## Required workflow for non-trivial changes

### 1. Inspect before designing

Read the smallest useful set of repository evidence:

- root and local `AGENTS.md` files;
- existing architecture/design docs;
- package manifests and workspace config;
- relevant tree around the change;
- current entrypoints and composition roots;
- nearby tests;
- import/lint/dependency rules;
- representative neighboring modules.

Do not infer the whole architecture from one file.

### 2. Classify the change

Determine:

- project scale: tiny / small / medium / large or multi-package;
- change type: local / new vertical / new module / cross-cutting / refactor / repair;
- current organization: route-centric / feature-centric / domain-centric / layer-centric / package-centric / mixed legacy;
- whether a project-level architecture contract already exists.

### 3. Resolve ownership

Before implementation, be able to answer the relevant subset of:

- Who owns this business behavior?
- Who owns mutable state?
- Who owns remote/server data?
- Who owns route/URL state?
- Who owns the interaction workflow?
- What is the module's public surface?
- Which dependencies are allowed to point inward or outward?

If these answers conflict, resolve the conflict before adding more code.

For component-level work, read `references/component-ownership.md`.
For state/data questions, read `references/state-data-ownership.md`.

### 4. Choose placement from ownership

Choose folders/files only after ownership is clear.

For frontend work, read `references/frontend-profile.md`.
For Node/backend work, read `references/node-backend-profile.md`.
For module/public-surface questions, read `references/module-boundaries.md`.

Do not copy a profile mechanically; adapt it to the repository's established vocabulary and scale.

### 5. Persist durable decisions

Create or update a project architecture contract only when the decision will guide future work.

Preferred default location when the repository has no established location:

`docs/ARCHITECTURE.md`

Use `assets/ARCHITECTURE.template.md` as a starting point, not a mandatory format.

Do **not** create this file for trivial changes or if the repository already records architecture elsewhere.

Architecture contracts should describe:

- system shape and module owners;
- dependency direction;
- entrypoint responsibilities;
- state/data ownership;
- public module surfaces;
- shared-code promotion rules;
- relevant test/guardrail boundaries;
- intentional exceptions.

`AGENTS.md` should point agents to the architecture contract and execution checks; it should not duplicate the whole contract.

### 6. Implement a coherent slice

Prefer a vertical slice that keeps related UI/behavior/state/data/test changes understandable together.

Avoid "architecture-first scaffolding" that creates many empty layers before a real contract exists.

### 7. Run a conformance review

Before finishing a non-trivial change, ask:

- Did an entrypoint gain feature business logic?
- Did ownership move or duplicate accidentally?
- Did one feature reach into another feature's internals?
- Did `shared` receive feature-specific behavior?
- Did a wrapper/abstraction appear without a real contract?
- Did an Effect or synchronization layer compensate for unclear ownership?
- Did this change invalidate the project architecture contract?
- Did the implementation add structure that is harder to navigate than the problem requires?

Read `references/verification.md` for the full verification pass.

### 8. Harden only when justified

Read `references/guardrail-selection.md` before adding architecture checks.

A good escalation path is:

`document -> warning -> static check -> test -> CI gate`

Use the bundled `scripts/architecture-check.mjs` only for checks that fit its documented configuration. Its default line-count findings are warnings/smells, not refactoring commands.

## Refactoring rule

When repairing an existing giant file or tangled module, do not split it by arbitrary line ranges.

Read `references/refactoring-signals.md` and identify seams such as:

- independent change reasons;
- distinct workflow/domain owners;
- data access mixed with presentation;
- route/bootstrap code mixed with feature behavior;
- duplicated canonical state;
- internal contracts consumed across module boundaries.

Migrate one coherent responsibility at a time and keep behavior verifiable.

## Avoid these failure modes

- "Enterprise" interpreted as maximum layering.
- Every component receiving its own service/types/constants/utils files without need.
- `shared/` used as a dumping ground.
- A generic `utils/` layer hiding domain semantics.
- One global store becoming the default owner for unrelated local state.
- Parent components owning state merely because they are parents.
- Server data copied into local state without a distinct draft/snapshot contract.
- Effects used to synchronize two owners that should be one.
- New architecture replacing established repository conventions without evidence.
- Hard CI failure based only on file length.

## Reference routing

Load only what the task needs:

- `references/architecture-decision-process.md` — system classification, mode selection, design sequence.
- `references/module-boundaries.md` — module contracts, public surfaces, dependency direction.
- `references/component-ownership.md` — component placement, interaction ownership, wrappers, effects.
- `references/state-data-ownership.md` — local, workflow, server, URL, persisted, cross-cutting state.
- `references/frontend-profile.md` — React/Vue frontend guidance and thin route/entrypoint patterns.
- `references/node-backend-profile.md` — Node/service boundaries and data-access placement.
- `references/refactoring-signals.md` — architecture smells and seam selection.
- `references/guardrail-selection.md` — when and how to make boundaries executable.
- `references/verification.md` — conformance and regression verification.
- `references/upstream-references.md` — upstream ideas, provenance, and links.

## Completion standard

Architecture work is complete when the requested behavior is implemented and:

- the owner of the new behavior is obvious from the code structure;
- dependency direction remains explainable;
- no new duplicate source of truth was introduced;
- the entrypoint/route did not become the accidental business owner;
- durable decisions are recorded only if future work needs them;
- relevant checks/tests pass;
- any new guardrail protects a real recurrent boundary rather than enforcing personal taste.
