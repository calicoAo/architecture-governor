# Refactoring Signals

Use smells to locate investigation targets, not to issue automatic refactoring commands.

## High-value architecture smells

### Giant entrypoint / route

Signal: app root or route file owns several feature-specific behaviors, states, requests, or policies.

Action: identify feature/workflow owners and migrate one coherent slice.

### Mega-component

Signal: independent sections change for different reasons or require unrelated data/interaction context. This includes the common post-refactor failure where a giant `App` is replaced by one giant `FeatureRoot`.

Action: separate internal workflow/interaction owners before extracting files; move state and lifecycle with those owners rather than only moving JSX.

### Shared dumping ground

Signal: `shared`, `common`, or `utils` contains feature-specific semantics or one-off helpers.

Action: move code back to its semantic owner; keep shared only for stable cross-owner contracts.

### Mirrored state

Signal: state is copied and synchronized across query/store/component/URL layers.

Action: declare one canonical owner; derive or bridge the others.

### Reach-through imports

Signal: feature/package consumers import another owner's internal file paths.

Action: define public contract, merge wrongly split ownership, or add a higher-level orchestrator.

### Repeated glue Effects

Signal: Effects exist mainly to synchronize internal state owners.

Action: revisit data flow and canonical ownership.

### Naming divergence

Signal: the same concept appears under several names across layers.

Action: establish one contract/name at the owning boundary before broad renaming.

### Shotgun change

Signal: one product behavior requires small edits across many unrelated folders/layers.

Action: check whether horizontal technical layers are obscuring a vertical owner.

## LOC signals

Large files can indicate navigation/change-cost problems. Treat thresholds as review triggers only.

For React/Vue components, use roughly:

- 400–500 LOC: mandatory cohesion review;
- 800+ LOC: strong decomposition smell;
- 1000+ LOC: presume internal decomposition is needed unless semantic cohesion is explicitly justified.

These thresholds must not become automatic extraction or default CI-failure rules.

A 700-line cohesive parser may be acceptable.
A 180-line App that owns auth, routing, forms, requests, and modal workflows may already be architecturally overloaded.
A 1000-line feature root is not justified merely because all code belongs to the same product feature.
