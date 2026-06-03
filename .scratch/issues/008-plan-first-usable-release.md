# Plan first usable release scope

Labels: needs-triage, ready-for-human
Type: HITL
Status: candidate/HITL backlog captured; thin implementation slices pending after decisions

## What to build

Choose the next product slice after the first deployment. The decision should use the PRD Phase 2 list and current implementation state to pick one narrow, demoable release path rather than reopening the whole roadmap.

## Acceptance criteria

- [x] Candidate slices include attendance UI, operator application management, member profile approval fields, custom claims hardening, and Discord notification publishing.
- [ ] The chosen slice has clear user value, verification path, and blockers.
- [ ] Follow-up issues are created as thin vertical slices with dependencies.
- [x] Anything intentionally deferred is recorded so the backlog stays current.

## Candidate and decision follow-up issues

- `.scratch/issues/009-attendance-ui.md`
- `.scratch/issues/010-operator-application-management.md`
- `.scratch/issues/011-member-profile-approval-fields.md`
- `.scratch/issues/012-custom-claims-hardening.md`
- `.scratch/issues/013-discord-notification-publishing.md`

`009` and `010` are implementation slice candidates. `011` through `013` are still human-decision issues; convert them into thinner implementation slices after the required policy choices are made.

## Deferred until after first usable release decision

- Notice CRUD with pinning polish beyond the current admin path.
- Real-data analytics expansion beyond the current operator analytics panel.
- Showcase management workflow polish.
- Member-created study/project proposal review expansion.
- `gdg.community.dev` import or reflection.

## Current recommendation

Do not choose the product slice before preview deployment QA and release runbook work are done. The current blocker is release readiness, not WDS/design-system migration.

## Blocked by

- `.scratch/issues/007-production-release-runbook.md`
