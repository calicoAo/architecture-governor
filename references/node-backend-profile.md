# Node / Backend Profile

This profile applies to Node.js services and backend portions of full-stack repositories.

## Entry points

Bootstrap/server entrypoints should primarily:

- configure process/runtime;
- assemble dependencies;
- register transport/routes;
- start the service.

Avoid placing domain policy, SQL/query logic, or unrelated endpoint behavior directly in bootstrap files.

## Transport ownership

HTTP/RPC/queue handlers should own transport concerns:

- input decoding;
- authentication/authorization handoff;
- transport-specific status/error mapping;
- response serialization.

Do not let transport handlers become the canonical home for reusable business rules.

## Application/domain behavior

Introduce an application/domain boundary when the behavior has an independent business contract or is reused across transports/workflows.

Do not create service/repository/use-case layers mechanically for CRUD that has no such distinction.

## Data access

Keep data-access details behind the smallest useful contract when:

- queries are reused;
- storage can change independently;
- business logic should be testable without storage details;
- transactions span several operations.

For very simple endpoints, direct colocated data access may be more maintainable than ceremonial repositories. Decide from change boundaries.

## Cross-module calls

Prefer module public contracts or an application orchestrator over reaching into another module's persistence/internal helper files.

## Background jobs and events

Treat jobs/consumers as transport/adapters when they trigger the same business capability as HTTP or other entrypoints. Avoid duplicating business rules in each delivery mechanism.
