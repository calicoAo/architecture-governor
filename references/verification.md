# Architecture Verification

Architecture verification complements functional tests; it does not replace them.

## 1. Behavior

Run the repository's relevant:

- tests;
- typecheck;
- lint;
- build;
- focused integration/e2e checks.

Preserve existing behavior unless the task explicitly changes it.

## 2. Ownership

Check:

- new behavior has one obvious owner;
- state/data have one canonical owner;
- route/app roots remain composition-focused;
- feature/workflow roots remain composition-focused when they contain multiple semantic sub-owners;
- component extraction moved state/lifecycle ownership instead of only moving JSX behind prop forwarding;
- abstractions own a real contract;
- shared code is actually shared semantically.

## 3. Dependency direction

Check:

- no new cross-module internal reach-through;
- no new unexplained cycle;
- public surfaces remain intentional;
- orchestration lives at a boundary that can legitimately see participating modules.

## 4. Documentation

Update architecture docs only when a durable decision changed.

Do not create documentation churn for implementation details.

## 5. Guardrails

Run existing architecture/static checks.

If using the bundled checker:

```bash
node <skill-root>/scripts/architecture-check.mjs --root .
```

If the repository contains `.architecture-guardrails.json`, the script loads it automatically.

Treat default LOC findings as smells. Treat configured `error` rules as failures.

## 6. Final architecture delta

For a significant change, the final report should be able to state concisely:

- which owner/boundary changed;
- whether architecture docs changed;
- which checks passed;
- any intentional exception left behind;
- for large frontend roots, whether internal cohesion was reviewed and why any large unit was intentionally retained.
