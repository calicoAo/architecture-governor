# Guardrail Selection

Guardrails should enforce architecture facts, not taste.

## When to automate a rule

Automate when all are true:

1. The boundary is deliberate and documented or clearly established.
2. The same violation is plausible or recurrent.
3. The violation is mechanically detectable with acceptable false positives.
4. The check does not freeze legitimate architecture evolution.

## Enforcement ladder

Start with the lightest effective mechanism:

```text
document
-> warning
-> static check
-> test
-> CI gate
```

A new rule does not need to jump directly to CI failure.

## Good candidates

- forbidden cross-package imports;
- deep imports into another module's internals;
- dependency cycles;
- package export boundaries;
- dead/unused files and exports;
- generated-code boundaries;
- layering rules that can be expressed precisely.

## Weak candidates for hard enforcement

- component/file LOC alone;
- subjective "too complex" judgments;
- number of hooks/components;
- universal folder names;
- speculative future reuse.

Use these as review smells, not hard architecture laws.

## Bundled checker

`scripts/architecture-check.mjs` is dependency-free and intentionally conservative.

Without configuration it reports only entrypoint-size smells.

To enforce repository-specific import boundaries, create `.architecture-guardrails.json` from `assets/architecture-guardrails.example.json` and define explicit rules.

Recommended workflow:

1. run in warning mode locally;
2. inspect false positives;
3. document the boundary;
4. promote selected rules to `error` severity;
5. add the command to CI only after it is stable.

## Existing ecosystem

Prefer mature repository tooling when already present, e.g. ESLint import restrictions, dependency-cruiser, Nx boundaries, package exports, or dead-code tools such as Knip. Do not install overlapping tools without need.
