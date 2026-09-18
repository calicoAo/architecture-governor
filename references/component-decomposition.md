# Component Decomposition

Use this reference after feature/module ownership is already clear but a feature root, route view, page, or workflow component still carries several internal responsibilities.

The purpose is not to maximize component count. The purpose is to make **internal ownership** as explicit as module ownership.

## Core rule

**Feature ownership is not component ownership.**

A feature may be the correct semantic owner for a capability while still containing several independent workflow, interaction, and presentation owners.

Treat composition recursively:

```text
Application root
  -> composes feature owners

Feature root
  -> composes workflow / major UI owners

Workflow root
  -> composes interaction and presentation owners

Leaf component
  -> owns one local interaction/presentation responsibility
```

A composition root may coordinate its children, but it should not absorb all of their internal state, handlers, validation, mutations, and rendering merely because they belong to the same parent feature.

## Internal owner types

When reviewing a large feature component, classify responsibilities into the smallest meaningful owners.

### Feature composition owner

Owns only concerns that genuinely span major workflows inside the feature, such as:

- selecting/composing feature sections;
- feature-level capability injection;
- truly shared feature state;
- orchestration that must see multiple internal owners.

### Workflow owner

Owns a coherent lifecycle with its own meaningful combination of:

- state;
- events;
- validation;
- mutations;
- loading/failure/result states;
- reset/retry behavior.

A workflow is a strong component/sub-feature boundary when it can change or be tested without understanding unrelated workflows.

### Interaction owner

Owns local interaction semantics, for example:

- an editor;
- form/dialog lifecycle;
- combobox/menu interaction;
- drag/drop behavior;
- wizard step interaction.

### Presentation owner

Owns a substantial UI region whose input/output contract is explicit and which does not need to own feature policy.

Do not extract trivial wrappers just to reduce line count.

## Mandatory cohesion review triggers

LOC is not a split rule, but large React/Vue components are useful review triggers because agents otherwise tend to normalize very large files.

Use these as review signals, not hard CI limits:

- roughly **400–500 LOC**: perform an explicit cohesion review;
- roughly **800+ LOC**: treat as a strong decomposition smell;
- roughly **1000+ LOC**: presume internal decomposition is needed unless there is concrete evidence that the unit is still one genuinely cohesive owner.

The justification must be semantic. "It all belongs to the same feature" is not sufficient evidence.

Other strong review triggers:

- multiple independently understandable workflows;
- multiple forms or modal/dialog lifecycles;
- large rendering regions plus substantial mutation/data logic;
- state groups with different initialization/reset lifecycles;
- unrelated feature requests repeatedly edit distant parts of the same component;
- one local change requires understanding unrelated sections;
- a component can be tested only through a very large parent context;
- the feature root mostly forwards large groups of workflow-specific props because state remains incorrectly lifted.

## Decomposition questions

For each candidate internal boundary, ask:

1. Does this responsibility have an independent reason to change?
2. Does it own a distinct state lifecycle?
3. Does it own a distinct workflow or interaction contract?
4. Can it be understood and tested independently?
5. Does the parent need to know its internals, or only its result/callback contract?
6. Would moving it reduce unrelated cognitive load?
7. Can state move with the new owner instead of remaining lifted in the feature root?

Extract when the answers reveal a real owner.

Do not extract when the only reason is:

- file length;
- aesthetic symmetry;
- "components should be small";
- one JSX fragment looks visually separate;
- a wrapper can forward the same props;
- a custom hook can hide lines from the component.

## State follows the internal owner

A valid decomposition moves ownership, not only JSX.

Bad decomposition:

```text
FeatureRoot
  owns 30 states + all handlers
    -> passes them to Editor
    -> passes them to History
    -> passes them to Dialog
```

This reduces file size but keeps the feature root as the accidental owner.

Better decomposition:

```text
FeatureRoot
  -> EditorWorkflow      owns editor draft + save lifecycle
  -> HistoryPanel        owns history snapshot/filter lifecycle
  -> BridgeWorkflow      owns bridge draft/generation/result lifecycle
```

Keep state in the feature root only when it truly coordinates multiple internal owners or represents a feature-wide canonical value.

## Prefer workflow components before cosmetic hooks

Do not automatically move every state group into a custom hook to make a component shorter.

A custom hook is justified when it owns a coherent reusable/testable behavior lifecycle independent of one rendering region.

When behavior and UI evolve together, a workflow component is often the clearer boundary because the owner is visible in the component tree.

Avoid structures like:

```text
FeatureRoot.tsx
useFeatureState.ts
useFeatureHandlers.ts
useFeatureEffects.ts
```

when the hooks merely split one giant owner by technical category.

That is horizontal file splitting, not semantic decomposition.

## Public surface

Feature-internal components remain private by default.

A typical feature may expose only:

```text
public:
  FeatureRoot
  stable feature-level contracts that real external consumers need

internal:
  WorkflowA
  WorkflowB
  Editor
  Dialog
  ResultView
```

Do not export every extracted component from the feature `index`.

Promotion outside the feature still follows the normal evidence rule: multiple independent consumers + stable semantic contract.

## Decomposition order

When a giant feature root needs repair, prefer this order:

1. identify independent workflows;
2. move each workflow's state/handlers/rendering together;
3. identify meaningful interaction owners inside each workflow;
4. extract large pure presentation regions only when their contract is clear;
5. promote shared primitives only after real cross-owner reuse appears.

Avoid beginning with `utils`, `hooks`, `services`, or visual fragments merely to reduce LOC.

## Stop condition

Stop decomposing when:

- each remaining component has one coherent semantic reason to change;
- state lifecycle is obvious from the owner;
- parent components primarily compose or intentionally coordinate children;
- extracting another component would mostly add prop forwarding/navigation cost;
- no unrelated workflow must be understood to make a local change.

The desired outcome is not a forest of tiny files. It is a component tree whose boundaries match the way the product changes.
