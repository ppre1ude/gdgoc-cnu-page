# Domain Docs

## Current Layout

Single-context layout.

## Planned Files

- `CONTEXT.md` for shared domain language and glossary.
- `docs/adr/` for architecture decision records.
- `docs/product/` for PRDs and planning docs once the user is ready.

## Current Constraint

The user explicitly wants planning documentation to happen after design-system and workflow setup. Do not create detailed PRDs, event plans, route maps, or homepage copy here yet.

## Consumer Rules

- Read `CONTEXT.md` before using project-specific vocabulary once it exists.
- Read relevant ADRs before changing architecture or implementation approach.
- If `CONTEXT.md` does not exist yet, use the brief in `AGENTS.md` and ask only when a decision would materially affect scope.
- Keep future domain terms concise and reusable in code, issue titles, PRDs, and UI copy.
