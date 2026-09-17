# Codex Architecture Governor

A reusable architecture-governance skill for Codex.

It helps Codex make better decisions about:

* module boundaries
* component ownership
* state ownership
* dependency direction
* code placement
* architecture contracts
* maintainability
* executable guardrails

Instead of forcing every project into the same folder structure, it teaches Codex to **inspect the repository, understand the existing architecture, identify ownership and boundaries, and then choose an appropriate structure for the actual project**.

---

## Why this exists

Coding agents are very good at making a feature work.

They are not always equally good at protecting the long-term structure of a codebase.

Without explicit architectural guidance, a perfectly reasonable sequence of tasks can gradually produce something like:

```text
App.tsx
├── routing
├── authentication
├── API requests
├── dashboard state
├── form validation
├── dialogs
├── settings
├── event handlers
└── 800 lines of JSX
```

Every individual change may have been locally reasonable.

The resulting codebase is not.

The usual response is to add instructions such as:

```text
Keep components small.
Use clean architecture.
Split large files.
Follow best practices.
```

These rules are too vague to reliably change agent behavior.

At the other extreme, forcing every project into a fixed structure such as:

```text
controllers/
services/
repositories/
hooks/
components/
utils/
```

often creates unnecessary abstraction and makes small projects harder to maintain.

**Codex Architecture Governor takes a different approach.**

It governs the **architecture decision process**, rather than prescribing one universal architecture.

---

# Core idea

The skill follows this workflow:

```text
Inspect
  ↓
Classify
  ↓
Identify ownership
  ↓
Identify boundaries
  ↓
Choose structure
  ↓
Persist architecture contract
  ↓
Implement
  ↓
Review conformance
  ↓
Harden repeated violations
```

The goal is not:

> "Make the code look enterprise."

The goal is:

> Make ownership, boundaries, dependency direction, and change cost explicit before the codebase starts drifting.

---

# Design principles

## Architecture is ownership, not folders

The skill first asks questions such as:

```text
Who owns this behavior?
Who owns this state?
Who owns this data?
Which module may import which module?
What is the public surface?
Where should a reader naturally look for this behavior?
```

The directory structure comes afterwards.

---

## Thin entrypoints

Application entrypoints such as:

```text
App.tsx
page.tsx
main.ts
route handlers
```

should primarily handle composition and wiring.

They should not gradually become the default owner of:

* feature-specific business rules
* unrelated state
* data fetching
* workflow logic
* form validation
* multiple independent UI domains

A large entrypoint is treated as an **architecture smell**, not automatically as a violation.

---

## Split by responsibility, not line count

This project deliberately avoids rules such as:

```text
Component > 300 lines → split
```

LOC can be a useful signal, but it is not an architecture decision.

More meaningful split signals include:

* multiple independent reasons to change
* multiple owners
* unrelated domain concepts
* business logic mixed with presentation
* data access mixed with reusable UI
* independent evolution paths
* unclear test boundaries
* cross-feature reach-through

A coherent 500-line parser may be fine.

A 180-line `App.tsx` containing authentication, API calls, dialog state, routing and form validation may already have an ownership problem.

---

## Local first, promote by evidence

Code should stay close to the feature or workflow that owns it.

A piece of code should become `shared` only when there is actual evidence that it has a stable cross-feature contract.

Do not build abstractions for hypothetical future reuse.

---

## One canonical owner

The skill tries to prevent duplicated ownership such as:

```text
server data
→ local state
→ effect synchronization
```

or:

```text
store A
↔ synchronization effect
↔ store B
```

State should have one clear canonical owner whenever possible.

---

## Respect existing architecture

This is not a greenfield-only architecture generator.

For an existing repository, the default behavior is:

```text
understand current architecture
→ identify the highest-value seam
→ improve it incrementally
```

not:

```text
replace the entire repository with a preferred architecture
```

---

# Operating modes

The skill uses four levels of architectural involvement.

## Lightweight

For trivial changes such as:

* copy changes
* styling-only changes
* simple renames
* isolated bug fixes
* static asset replacement

No architecture ceremony is required.

---

## Design

Used when architecture has not yet been established.

Typical cases:

* new application
* new service
* major new feature area
* new package or domain module

The skill determines:

* ownership
* module boundaries
* dependency direction
* state ownership
* public surfaces
* project structure

---

## Deepen

Used when the application works but the architecture is becoming expensive to change.

Typical signals:

* giant entrypoints
* duplicated business rules
* feature-to-feature internal imports
* unclear state ownership
* `shared/` becoming a dumping ground
* UI directly reaching into infrastructure
* multiple concepts with overlapping responsibilities

The goal is not a rewrite.

The skill identifies a high-value architectural seam and migrates one coherent vertical slice at a time.

---

## Harden

Used when the architecture is understood but keeps being violated.

At this stage, architectural intent is converted into executable checks where appropriate.

Examples:

```text
import boundary rules
dependency cycle detection
package export restrictions
dead-code checks
architecture scripts
CI gates
```

---

# Architecture Contract

For non-trivial repositories, the skill can maintain a project-level architecture contract such as:

```text
docs/ARCHITECTURE.md
```

This document acts as the repository's architecture system of record.

Typical contents:

```text
System shape
Modules and ownership
Dependency direction
Entry points
State ownership
Data access
Public module surfaces
Shared-code promotion rules
Testing boundaries
Guardrails
Known exceptions
Architecture decisions
```

The global skill defines **how to make architecture decisions**.

`ARCHITECTURE.md` records **the answer for this specific repository**.

---

# AGENTS.md integration

`AGENTS.md` should remain short.

Instead of duplicating the entire architecture specification, it can point Codex toward the architecture contract:

```text
For non-trivial implementation:

- Read docs/ARCHITECTURE.md before changing module boundaries.
- Respect module public surfaces and dependency direction.
- Do not introduce cross-feature internal imports.
- If a requested change conflicts with the architecture contract,
  make the conflict explicit instead of silently bypassing it.
- Run the architecture checks defined by the owning package.
```

This also works well in monorepos:

```text
/AGENTS.md
/apps/web/AGENTS.md
/services/core/AGENTS.md
```

---

# Component ownership

Repository-level architecture is only half the problem.

Inside a feature, Codex still needs to decide:

```text
Who owns this state?
Where should this handler live?
Who should fetch this data?
Should this wrapper exist?
Does this Effect represent a real side effect or broken ownership?
```

The skill therefore includes component-level ownership guidance.

## State

Default:

> Keep state at the lowest meaningful owner.

Lift it only when:

* siblings need the same source of truth
* a parent coordinates the workflow
* scoped persistence requires it
* the state is genuinely cross-cutting

---

## Remote state

Avoid unnecessary duplication:

```tsx
const query = useQuery(...)

useEffect(() => {
  setItems(query.data)
}, [query.data])
```

unless the local state has a distinct semantic role such as an editable draft.

---

## URL state

Route identity, filters and search parameters often already have a natural owner:

```text
the URL
```

Avoid maintaining the same canonical value simultaneously in:

```text
URL
+
global store
+
component state
```

---

## Effects

Prefer:

```text
derive during render
```

or:

```text
handle the change in the event that caused it
```

Use Effects primarily when synchronizing with an external system.

---

## Wrappers

A wrapper should usually own a real contract:

* behavior
* validation
* state
* domain semantics
* accessibility behavior
* stable visual semantics

Pure prop-forwarding wrappers usually add navigation cost without improving architecture.

---

# Executable guardrails

Documentation alone is not enough for rules that are repeatedly violated.

The project follows an enforcement ladder:

```text
documentation
    ↓
warning
    ↓
static check
    ↓
test
    ↓
CI gate
```

Only rules that are both important and mechanically verifiable should become hard checks.

Examples include:

* cross-feature internal imports
* forbidden dependency directions
* circular dependencies
* package-boundary violations
* unused files and exports

File size is intentionally treated as a **warning signal**, not a universal hard gate.

---

# Repository structure

```text
engineering-architecture/
├── SKILL.md
│
├── agents/
│   └── openai.yaml
│
├── references/
│   ├── architecture-decision-process.md
│   ├── module-boundaries.md
│   ├── component-ownership.md
│   ├── state-ownership.md
│   ├── frontend.md
│   ├── react.md
│   ├── vue.md
│   ├── node.md
│   ├── refactoring-signals.md
│   ├── guardrail-selection.md
│   └── verification.md
│
├── assets/
│   └── ARCHITECTURE.template.md
│
└── scripts/
    └── architecture-check.*
```

The main `SKILL.md` stays intentionally small.

Conditional knowledge belongs in `references/`.

Deterministic checks belong in `scripts/`.

---

# Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/codex-architecture-governor.git
```

Copy the skill into your Codex skills directory:

```bash
cp -R codex-architecture-governor/engineering-architecture \
  ~/.codex/skills/engineering-architecture
```

Then restart or reload Codex as appropriate for your environment.

Repository-specific installation is also possible if you prefer to keep the skill alongside a project rather than globally.

---

# Example

Without architecture governance:

```text
User:
Add authentication, settings and a dashboard.

Agent:
Edits App.tsx.
```

With the skill:

```text
Inspect repository
↓
Identify application scale
↓
Identify auth / dashboard / settings as separate capabilities
↓
Determine state and data ownership
↓
Keep App.tsx as composition root
↓
Place behavior inside owning features
↓
Define public module surfaces
↓
Implement vertical slices
↓
Review architecture conformance
```

A possible result might be:

```text
src/
  app/
    App.tsx
    providers/
    router/

  features/
    auth/
    dashboard/
    settings/

  shared/
    ui/
    lib/
```

But this structure is **not hardcoded by the skill**.

Another project may legitimately produce a completely different architecture.

---

# What this project is not

This is not:

* a universal Clean Architecture template
* a fixed React folder convention
* a file-size linter
* a component generator
* a requirement to split everything into tiny files
* an excuse to introduce repositories, factories and adapters everywhere
* a replacement for project-specific architecture decisions

It is an architecture **governor**.

Its job is to make those decisions explicit, consistent and enforceable.

---

# Current scope

The first version focuses on:

* TypeScript
* React
* Vue
* Node.js
* module ownership
* component ownership
* state ownership
* architecture contracts
* architecture drift
* basic executable guardrails

Future profiles may include:

* Electron
* monorepos
* full-stack applications
* backend services
* microfrontends
* data visualization applications

These will be added based on real project needs rather than speculative completeness.

---

# Validation philosophy

Success is not measured by:

```text
number of files created
number of layers introduced
how "enterprise" the folder tree looks
```

Success is measured by whether Codex:

* keeps clear ownership
* respects existing architecture
* avoids giant default owners
* avoids premature abstraction
* keeps dependency direction understandable
* identifies meaningful refactoring seams
* turns repeated architectural violations into guardrails

The skill should improve a poorly structured repository **without overengineering a simple one**.

---

# Upstream inspiration

This project builds on ideas from several existing Agent Skills and engineering practices.

### `codebase-architecture`

The `codebase-architecture` skill from `mblode/agent-skills` strongly influenced:

* Design / Deepen / Harden modes
* architecture contracts
* architecture guardrails
* executable enforcement
* repository wayfinding

Repository:

```text
https://github.com/mblode/agent-skills
```

### Dify — `how-to-write-component`

Dify's component skill influenced:

* component placement
* component ownership
* state ownership
* remote state ownership
* Effect discipline
* wrapper discipline
* vertical-slice implementation

Repository:

```text
https://github.com/langgenius/dify
```

### OpenAI Codex Skills

The project structure and progressive-disclosure approach follow the Codex Skill model:

```text
SKILL.md
references/
scripts/
assets/
```

with the main Skill containing only the information that should directly influence agent behavior.

---

# Roadmap

Near-term priorities:

* [ ] Run real-repository replay tests
* [ ] Evaluate giant `App.tsx` recovery behavior
* [ ] Evaluate behavior on already well-architected repositories
* [ ] Refine architecture-smell detection
* [ ] Expand import-boundary guardrails
* [ ] Add more deterministic validation fixtures
* [ ] Add Electron profile
* [ ] Add monorepo profile
* [ ] Add backend-service profile

The project intentionally favors evidence from real repositories over adding more theoretical architecture rules.

---

# Contributing

Contributions are welcome, especially around:

* real-world failure cases
* architecture evaluation scenarios
* framework-specific profiles
* dependency-boundary tooling
* false positives caused by over-aggressive architecture rules
* examples where the Skill should deliberately do less

When proposing a new universal rule, please include evidence that it applies across multiple project types.

Project-specific preferences should generally become profiles or references rather than global requirements.

---

# Philosophy

Coding agents should not need one giant prompt telling them exactly where every file belongs.

They should be able to:

```text
understand the codebase
identify ownership
reason about boundaries
make an architecture decision
persist that decision
and protect it over time
```

That is the problem this project is trying to solve.
