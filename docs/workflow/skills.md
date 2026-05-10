# Skill Workflow Setup

## Installed / Available Skill Families

### gstack

Status: available in the current Codex skill list.

Use for:

- `office-hours` for early product interrogation.
- `plan-ceo-review` for scope and strategy.
- `plan-design-review` and `design-review` for UI quality.
- `plan-eng-review` for architecture.
- `qa`, `qa-only`, `review`, and `ship` for verification and publishing.
- `context-save` and `context-restore` for handoff.

Source: https://github.com/garrytan/gstack

### Matt Pocock Skills

Status: available, with missing skills installed during setup.

Core use:

- `grill-me` and `grill-with-docs` for alignment.
- `setup-matt-pocock-skills` for repo-level issue/domain configuration.
- `tdd` for red-green-refactor implementation.
- `diagnose` for disciplined debugging.
- `to-prd` and `to-issues` for planning and vertical-slice issues.
- `zoom-out` and `improve-codebase-architecture` for architecture understanding.

Additional installed skills include `triage`, `caveman`, `write-a-skill`, `git-guardrails-claude-code`, `migrate-to-shoehorn`, `scaffold-exercises`, and `setup-pre-commit`.

Source: https://github.com/mattpocock/skills

### Superpowers

Status: installed for Codex native skill discovery.

Local install:

- Repository: `C:\Users\cjh51\.codex\superpowers`
- Junction: `C:\Users\cjh51\.agents\skills\superpowers`

Use for:

- `brainstorming`
- `writing-plans`
- `test-driven-development`
- `systematic-debugging`
- `dispatching-parallel-agents`
- `subagent-driven-development`
- `requesting-code-review`
- `finishing-a-development-branch`

Restart Codex to pick up newly installed Superpowers skills.

Source: https://github.com/obra/superpowers

## Recommended Project Flow

1. **Before planning:** Use `office-hours` or `grill-me` to sharpen the homepage/event concept.
2. **When writing the first plan:** Use `grill-with-docs` so `CONTEXT.md` and ADRs capture the shared language.
3. **Before implementation:** Use `plan-design-review` and `plan-eng-review`.
4. **When creating tasks:** Use `to-issues` with the local markdown tracker in `docs/agents/issue-tracker.md`.
5. **During implementation:** Use `tdd` or Superpowers `test-driven-development`.
6. **For bugs:** Use `investigate`, `diagnose`, or Superpowers `systematic-debugging`.
7. **Before handoff:** Use `qa` or `qa-only`, then `review`.

## Restart Note

Codex only discovers newly installed skills at startup. Restart Codex before relying on the Matt Pocock skills installed during this setup or the Superpowers junction.
