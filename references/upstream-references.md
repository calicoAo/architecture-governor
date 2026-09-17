# Upstream References and Provenance

This Skill is an original synthesis. It does not vendor or reproduce upstream Skill files. The sources below informed specific design ideas.

## OpenAI Skill Creator

Codex sample Skill Creator:

https://github.com/openai/codex/blob/main/codex-rs/skills/src/assets/samples/skill-creator/SKILL.md

OpenAI Skills catalog Skill Creator:

https://github.com/openai/skills/blob/main/skills/.system/skill-creator/SKILL.md

Ideas used:

- keep `SKILL.md` focused on decision-changing procedural guidance;
- put conditional detail in `references/`;
- put deterministic operations/checks in `scripts/`;
- validate and iterate on real usage;
- do not turn one past failure into a universal rule.

## `codebase-architecture`

Repository:

https://github.com/mblode/agent-skills

Skill:

https://github.com/mblode/agent-skills/blob/main/skills/codebase-architecture/SKILL.md

Ideas used/adapted:

- Design / Deepen / Harden lifecycle;
- module contracts and clear surfaces;
- architecture guardrails as part of architecture work;
- architecture documentation plus enforcement;
- repair one useful seam rather than rewriting broadly.

Use the upstream file as the authoritative source for its exact wording and current behavior.

## Dify `how-to-write-component`

Repository:

https://github.com/langgenius/dify

Skill:

https://github.com/langgenius/dify/blob/main/.agents/skills/how-to-write-component/SKILL.md

Ideas used/adapted:

- code placement follows workflow/feature ownership;
- state remains at the lowest meaningful owner until coordination requires lifting;
- remote state should not be mirrored without a distinct contract;
- Effects are for external synchronization rather than generic internal glue;
- wrappers should own real behavior/semantics;
- implement coherent vertical slices.

Use the upstream file as the authoritative source for its exact wording and current behavior.
