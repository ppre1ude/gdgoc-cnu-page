# Agent Guide - GDGoC CNU Homepage

## Project Context

This repo is for the GDGoC CNU chapter homepage around Build with AI.

Build with AI is a Google global campaign focused on sharing modern AI-powered development trends, exploring practical use cases, shaping ideas, and producing early prototype-level outcomes.

The intended build style is AI-assisted vibe coding with tools such as Antigravity, Google Stitch, Firebase, Google AI Studio, Gemini, Nano Banana, Google Labs, and Project Genie.

## Source Of Truth

- Read `DESIGN.md` before any visual, layout, typography, or component decision.
- Use Wanted Montage Web Design System as the first-choice UI system.
- Do not introduce a second design system without explicit approval.
- Planning docs and PRDs will be created later; do not invent detailed product scope beyond the user's current brief.

## Design System

Always read `DESIGN.md` before making UI changes.

All font choices, colors, spacing, component choices, and aesthetic direction are defined there. Flag any code that diverges from `DESIGN.md` during review or QA.

## Skill Routing

Use these skill families intentionally:

- **gstack:** product strategy, design review, engineering review, QA, review, ship, retrospective, context save/restore.
- **Matt Pocock skills:** grilling, shared domain language, TDD, diagnosis, issue breakdown, PRD creation, architecture improvement, zoom-out explanations.
- **Superpowers:** brainstorming, plan writing, TDD discipline, systematic debugging, parallel/subagent execution, review, and branch finishing workflows.

When multiple skills could apply, prefer this sequence:

1. **Clarify the idea:** `office-hours`, `grill-me`, or `grill-with-docs`.
2. **Capture scope:** `to-prd` after the user asks to turn the plan into a PRD.
3. **Review the plan:** `plan-ceo-review`, then `plan-design-review` for UI, then `plan-eng-review` for architecture.
4. **Break into work:** `to-issues` for vertical slices.
5. **Implement:** `tdd` or Superpowers `test-driven-development`.
6. **Debug:** `investigate`, `diagnose`, or Superpowers `systematic-debugging`.
7. **Verify:** `qa` for test-and-fix, `qa-only` for report-only, then `review`.
8. **Ship:** `ship` or Superpowers `finishing-a-development-branch` when the user asks to publish or open a PR.

## Agent Skills

### Issue tracker

Use local markdown issues until a Git remote or GitHub Issues workflow exists. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default five-label triage vocabulary. See `docs/agents/triage-labels.md`.

### Domain docs

Use single-context domain docs once the user is ready to document the project plan. See `docs/agents/domain.md`.

## Coding Defaults

- Keep edits narrowly scoped.
- Prefer the project's existing framework once one exists.
- Use WDS components and tokens before custom primitives.
- Add tests in proportion to risk and blast radius.
- Verify UI on desktop and mobile for any homepage work.
- Do not commit, push, or create a PR unless the user asks.

## Current Setup Notes

- The workspace started empty and was not a Git repository at setup time.
- Superpowers was installed in the user's Codex environment via `C:\Users\cjh51\.codex\superpowers` and exposed through `C:\Users\cjh51\.agents\skills\superpowers`.
- Newly installed Codex skills require restarting Codex before they appear in the active skill list.
