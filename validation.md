# Real-World Validation

This document records real-repository validation of the `engineering-architecture` skill.

The goal of these cases was not to prove that the skill can generate architecture documents.

The goal was to test whether it can make correct architecture decisions in both directions:

```text
change architecture when evidence requires it
+
leave architecture alone when the existing boundary is already correct
```

Validation repository: Personal Workbench
Stack: npm workspaces, React + Vite, Hono, Drizzle ORM, MySQL

---

## Summary

| Case                                 | Expected behavior                                                            | Result |
| ------------------------------------ | ---------------------------------------------------------------------------- | ------ |
| Rewards feature ownership            | Deepen a giant root-owned feature without overengineering                    | PASS   |
| Cohesive CRUD negative control       | Recognize that no refactor is required                                       | PASS   |
| Completion workflow audit            | Identify true cross-owner business invariants                                | PASS   |
| Transaction ownership implementation | Establish precise workflow and transaction owners                            | PASS   |
| Real MySQL / CI verification         | Prove transaction, retry and concurrency guarantees against real DB behavior | PASS   |

The validation demonstrates that the skill can:

* improve unclear ownership;
* preserve already-cohesive architecture;
* distinguish technical steps from semantic ownership;
* identify application/workflow boundaries from business invariants;
* avoid ceremonial service/repository extraction;
* establish transaction and idempotency boundaries;
* turn repeated correctness requirements into executable verification.

---

# Case 1 — Rewards Feature Deepen

## Initial condition

The Web root `App.tsx` owned:

* Rewards remote snapshot;
* editable Rewards draft;
* load/create/delete/redeem handlers;
* page loading Effect;
* Rewards UI;
* growth summary UI;
* client-side reward estimation logic.

The problem was not merely file length.

`App.tsx` had become the canonical owner of behavior belonging to an independent product capability.

## Governor decision

`DEEPEN`

The skill identified Rewards as one coherent vertical slice.

It did not attempt to reorganize the entire Web application.

## Result

A dedicated Rewards feature became the owner of:

* Rewards UI;
* remote snapshot;
* editable draft;
* mutations;
* feature Effects;
* feature-specific behavior.

The feature exposes an intentional public surface.

`App.tsx` remains responsible for application composition and only injects capabilities that genuinely belong outside Rewards.

## Architecture behavior validated

The skill successfully distinguished:

```text
move ownership
```

from:

```text
move JSX into another file
```

It did not introduce:

* global state;
* repository layers;
* generic services;
* speculative shared modules;
* cross-feature internal imports.

## Result

**PASS**

---

# Case 2 — Cohesive CRUD Negative Control

## Target

`GET /api/media-watch-records/list`

This route colocates:

* HTTP transport;
* validation;
* authentication context;
* simple Drizzle data access;
* response mapping.

## Question

Should this route be refactored into:

* service;
* repository;
* use case;
* domain module;
* generic list abstraction?

## Governor decision

`PASS — NO ARCHITECTURE CHANGE REQUIRED`

The route has one semantic responsibility:

> Return the authenticated user's media-watch history according to its resource contract.

The technical steps involved in fulfilling that contract do not represent separate business owners.

There was no evidence of:

* reused domain policy;
* cross-route workflow;
* multi-table invariant;
* independent persistence contract;
* transaction orchestration.

## Architecture behavior validated

The skill correctly rejected ceremonial abstractions.

It demonstrated that invoking an architecture skill does not imply that architecture must change.

## Result

**PASS**

---

# Case 3 — Completion Workflow Ownership Audit

## Initial condition

Task and Timer completion behavior crossed several resources:

* Tasks;
* Timer Sessions;
* Schedules;
* Rewards;
* Task Daily Assignments.

Some paths were transactional.

Others sequentially mutated several owners without one transaction or reliable replay boundary.

## Critical failure discovered

Timer finish could:

```text
mark Timer FINISHED
→ create Schedule
→ grant Timer reward
→ update Task
→ grant Task reward
```

without one atomic workflow boundary.

If an intermediate step failed, the Timer was already terminal.

Retrying the same request could no longer safely reconstruct the operation.

Concurrent finish requests could also establish duplicate projections.

## Governor analysis

The skill did not conclude:

```text
multiple tables
→ create a generic Service layer
```

Instead it identified separate semantic owners:

```text
Task completion
→ Tasks

Work-session finalization
→ Execution / Timer workflow

Reward calculation and ledger
→ Rewards
```

It also correctly kept independent capabilities independent:

* Task Days;
* generic Schedule CRUD;
* manual Actual records.

## Proposed contracts

Narrow semantic contracts were justified:

```text
completeTask(...)
finishWorkSession(...)
```

Broad abstractions such as:

```text
TaskService
WorkflowManager
Repository layer
```

were rejected.

## Result

The audit correctly classified the repository as:

`DEEPEN REQUIRED`

For the architecture-governor evaluation itself:

**PASS**

---

# Case 4 — Transaction Ownership Deepen

## Implementation

The proposed semantic boundaries were implemented.

### Task completion

`completeTask(...)`

became the canonical owner of:

* valid completion transition;
* completion metadata;
* reflection;
* Task completion reward;
* Task-completion transaction responsibility.

### Work-session finalization

`finishWorkSession(...)`

became the canonical owner of:

* Timer terminal transition;
* Actual projection;
* Timer reward;
* optional explicit Task completion;
* outer transaction;
* retry semantics.

Rewards remained the owner of reward policy and ledger behavior.

Generic Schedule CRUD remained independent.

## Important contract changes

Generic Task status updates no longer bypass Task completion semantics.

Timer finish now explicitly distinguishes:

```text
finish work session
```

from:

```text
finish work session and complete Task
```

Timer-derived Schedule projections received stable source identity.

Reward and workflow operations use stable idempotency identities.

## Concurrency design

Database-level locking and uniqueness protect:

* terminal Timer transition;
* Timer-derived projection;
* reward ledger events.

Same-command replay can reconstruct an already committed result.

A semantically different command against a terminal workflow returns a conflict instead of being mistaken for an idempotent retry.

## Architecture behavior validated

The skill created new abstraction only where a real semantic contract existed.

It did not convert unrelated CRUD routes into service/repository architecture.

## Initial result

Static implementation and verification:

`PARTIAL`

because real MySQL integration tests had not yet executed.

---

# Case 5 — Real MySQL and CI Verification

The previous transaction design was then verified using GitHub Actions against a real MySQL 8.0 service.

## Environment

Test database:

```text
personal_workbench_test
```

The CI environment uses an isolated test-only database.

## Migration verification

Flyway applies and validates the complete migration chain from an empty database.

The CI run exposed a real duplicate `V17` migration version.

The later workflow-projection migration was corrected to `V18`.

Final chain:

```text
19 migrations
```

All migrations apply and validate successfully.

## Workflow integration tests

Actual result:

```text
7 passed
0 failed
0 skipped
0 TODO
```

The suite covers:

* Task completion;
* reflection;
* retry;
* key conflict;
* reopen lifecycle;
* reward rollback;
* Timer finish;
* explicit Task completion;
* lost-response replay;
* concurrent Timer finish;
* transaction rollback;
* pause retry/concurrency;
* user isolation.

## Silent-skip protection

The CI workflow fails if:

* `TEST_DATABASE_URL` is missing;
* database name is not test-only;
* database is unreachable;
* zero tests execute;
* any test fails;
* any test is cancelled;
* any test is skipped;
* any test is TODO.

The strict test reporter itself has regression tests.

## Repository verification

Remote CI passed:

```text
migration apply + validate   PASS
workflow DB tests            PASS
typecheck                    PASS
lint                         PASS
build                        PASS
```

Two independent GitHub Actions runs completed successfully.

## Result

**PASS**

---

# What these cases prove

Together, the cases validate four distinct governor behaviors.

## 1. Change architecture when ownership is wrong

Rewards demonstrated:

```text
root owns feature behavior
→ identify semantic owner
→ migrate one coherent slice
```

## 2. Do nothing when architecture is already appropriate

Media Watch demonstrated:

```text
cohesive route
→ inspect
→ reject ceremonial abstraction
→ no change
```

## 3. Find boundaries from business invariants

Completion workflow demonstrated:

```text
cross-module writes
→ identify actual invariant
→ assign semantic workflow owner
→ define transaction boundary
```

rather than:

```text
many files
→ add generic service layer
```

## 4. Convert architecture claims into executable evidence

The transaction implementation was not considered complete after static inspection.

Real MySQL execution proved:

* migration correctness;
* transaction rollback;
* retry behavior;
* idempotency;
* concurrency behavior;
* user isolation.

The CI suite also prevents future silent loss of this evidence.

---

# Anti-overengineering evidence

Across the validation suite, the governor explicitly rejected unnecessary:

* repository layers;
* generic service layers;
* broad domain modules;
* global state;
* shared dumping grounds;
* event-based coordination where a local transaction was correct;
* file splitting based only on LOC.

This is an important part of the validation.

A useful architecture governor must know both:

```text
when to introduce a boundary
```

and:

```text
when not to introduce one
```

---

# v0.1 conclusion

The initial validation objective is satisfied.

`engineering-architecture` v0.1 has demonstrated real-repository behavior across:

```text
feature ownership
module boundaries
negative-control preservation
business invariants
workflow ownership
transaction boundaries
idempotency
concurrency
executable guardrails
```

Further Skill rules should not be added speculatively.

Future versions should be driven by new failure modes observed during normal repository development.

The Skill now enters normal real-world use.
