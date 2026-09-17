# Architecture

> Keep this document short enough to remain useful. Record durable decisions and boundaries, not a tour of every file.

## System shape

Describe the application/service at one level above individual files.

## Modules and ownership

| Module / area | Owns | Does not own | Public surface |
| --- | --- | --- | --- |
| | | | |

## Dependency direction

```text
<document the intended direction using this repository's real module names>
```

List intentional exceptions explicitly.

## Entrypoints and composition roots

Document what app roots, routes, bootstrap files, or package entrypoints may own.

## State and data ownership

Document only state/data boundaries that future work could otherwise duplicate or confuse.

Examples:

- remote/server truth;
- URL truth;
- workflow state;
- persisted client state;
- cross-cutting application state.

## Shared-code promotion

Describe when local code may move to shared/common packages.

## Testing boundaries

Describe meaningful test ownership or contract tests if relevant.

## Guardrails

List architecture-specific commands and what they enforce.

```text
<command>  # <boundary/check>
```

## Known exceptions

| Exception | Reason | Scope | Revisit when |
| --- | --- | --- | --- |
| | | | |

## Architecture decisions

Keep short dated entries only when they affect future implementation choices.

### YYYY-MM-DD — <decision>

- Context:
- Decision:
- Consequences:
