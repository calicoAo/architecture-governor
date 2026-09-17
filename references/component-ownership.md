# Component Ownership

This reference adapts component-ownership ideas from Dify's `how-to-write-component` skill to the broader Engineering Architecture workflow. See `upstream-references.md` for provenance.

## Placement default

Keep a component with the product workflow, route, or feature that owns its behavior.

Do not move a component to `shared` merely because it is visually reusable-looking.

Promote when multiple independent verticals rely on the same stable semantic contract.

## Lowest visual owner

Local interaction state should usually live in the lowest component that needs to coordinate it.

Examples:

- a dialog used only by one feature section owns its open/close state there;
- a parent owns state when it genuinely coordinates multiple children in one workflow;
- a top-level App should not own modal/form/filter state merely because it can.

## Interaction ownership

Business event handlers belong with the workflow owner.

Reusable interaction components may own generic interaction behavior such as:

- focus management;
- keyboard navigation;
- menu/dialog state machines;
- accessibility semantics.

They should not silently absorb feature-specific business decisions.

## Wrapper test

A wrapper earns its existence when it owns at least one real contract:

- behavior;
- validation;
- state;
- domain semantics;
- accessibility behavior;
- stable visual semantics.

A wrapper that only forwards props usually adds navigation cost without adding architecture.

## Effects

Prefer render-time derivation or event-time work when possible.

Use Effects for synchronization with something external to the current render model, such as:

- browser APIs;
- subscriptions;
- imperative widgets;
- network/system synchronization;
- external stores.

If an Effect exists mainly to keep two React/Vue owners synchronized, revisit ownership first.

## Component splitting signals

Split when a component has distinct owners/change reasons, for example:

- workflow coordination + large presentational region;
- remote data mutation + reusable display;
- feature policy + generic interaction primitive;
- independent sections that evolve/test separately.

Do not split only because a file crossed an arbitrary LOC threshold.
