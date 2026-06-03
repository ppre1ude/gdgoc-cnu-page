# Resolve dependency audit findings

Labels: needs-triage, ready-for-human
Type: HITL
Status: repo-side resolved; release risk decision remains

## What to build

Decide and apply the safest dependency update path for the current `npm audit --audit-level=high` findings without destabilizing Next.js, Firebase Admin, Firebase Tools, or WDS package resolution.

## Acceptance criteria

- [x] Each high or moderate audit finding is classified as production runtime, build-time tooling, emulator tooling, or transitive false urgency.
- [x] Non-breaking `npm audit fix` changes are applied only when they keep tests and build green.
- [x] Breaking updates such as `firebase-tools@15` or any Next.js-adjacent change are explicitly approved before landing.
- [x] The final branch records the remaining accepted risk, if any.

## Evidence

- `npm audit fix --package-lock-only --dry-run --json` reported 0 lockfile changes.
- `npm update protobufjs qs tmp` applied only dependency-range-compatible transitive updates.
- Audit count changed from 16 total findings (3 high, 13 moderate) to 13 total findings (2 high, 11 moderate).
- Updated transitive packages:
  - `protobufjs`: `7.5.7` -> `7.6.2`
  - `qs`: `6.15.1` -> `6.15.2`
  - `tmp`: `0.2.5` -> `0.2.7`

## Classification

| Finding | Path | Classification | Current decision |
| --- | --- | --- | --- |
| `protobufjs` moderate | Firebase/Google transitive | Transitive runtime/tooling | Fixed by range-compatible update to `7.6.2`. |
| `qs` moderate | `firebase-tools` transitive | Emulator/CLI tooling | Fixed by range-compatible update to `6.15.2`. |
| `tmp` high | `firebase-tools` transitive | Emulator/CLI tooling | Fixed by range-compatible update to `0.2.7`. |
| `tar` high | `firebase-tools@14` direct transitive | Emulator/CLI tooling | Not fixed. `firebase-tools@14` depends on `tar@^6`; patched audit path requires `firebase-tools@15` and explicit approval. |
| `firebase-tools` high | direct devDependency | Emulator/CLI tooling | Not upgraded because `firebase-tools@15` is semver-major and JDK 21 readiness must be confirmed first. |
| `@google-cloud/pubsub`, `gaxios`, `google-gax`, `uuid` moderate | `firebase-tools` transitive | Emulator/CLI tooling | Requires `firebase-tools@15` or upstream patch path; no non-breaking npm fix available. |
| `firebase-admin`, `@google-cloud/firestore`, `@google-cloud/storage`, `google-gax`, `retry-request`, `teeny-request`, `uuid` moderate | `firebase-admin@13` transitive | Production server runtime | npm suggests a semver-major downgrade to `firebase-admin@10.3.0`; not applied. Needs release-risk approval or upstream patch path before public production. |
| `next` / `postcss` moderate | `next@16.2.6` direct dependency with internal `postcss@8.4.31` | Next build/runtime-adjacent | Not overridden. Any Next-adjacent dependency override or version change needs explicit approval. |

## Remaining risk

Accepted for this local branch only:

- The branch keeps `firebase-tools@14.21.0` and `next@16.2.6` to avoid destabilizing emulator, build, and WDS integration.
- Do not treat this as production release approval. Public deployment still needs a human decision on:
  - whether to adopt `firebase-tools@15` after JDK 21 is available,
  - whether to wait for/pin a safe `firebase-admin` upstream path,
  - whether to override or upgrade the Next/PostCSS path.

## Blocked by

None - repo-side dependency mitigation is complete. Release approval remains a human decision.
