# QA Report: GDGoC CNU Demo Readiness

Date: 2026-05-15
Base URL: `http://127.0.0.1:3001`
Framework: Next.js App Router
Mode: Standard targeted QA with subagents

## Scope

- Public home: `/`
- Member home: `/member`
- Admin dashboard: `/admin`
- Activity admin: `/admin/activities`
- Firebase/Gemini readiness code and Firestore rules
- Desktop, mobile, and small desktop visual checks

Screenshots are in `C:\gdgoc-cnu-page\.scratch\run\qa-2026-05-15`.

## Fixed Findings

1. Public home `지원하기` CTA pointed to missing `#apply-todo`.
   - Fixed by routing it to `/member`.

2. Mobile Korean hero text broke words awkwardly at 320px.
   - Fixed by preserving Korean word boundaries and simplifying mobile heading line breaks.

3. Small desktop hero poster overlapped the public-home paragraph around 900px.
   - Fixed by disabling poster `translateX` below 1280px.

4. Firebase-configured access-denied screens still described Demo role behavior.
   - Fixed by showing live Firebase Auth wording when Firebase config exists.

5. Member home showed `Demo Role` wording in Firebase-configured mode.
   - Fixed by showing `현재 역할` in live mode.

6. Demo role select had no accessible label.
   - Fixed with an `aria-label`.

7. Activity authoring allowed empty title/body and external/hybrid registration without an external URL.
   - Fixed with UI `required` fields and domain-level validation.
   - Added regression coverage for title, summary, external URL, and URL preservation on update.

8. Static public value cards were keyboard-focusable without an action.
   - Fixed by removing the unnecessary `tabIndex`.

9. Build with AI seed/admin CTA still used the generic `https://gdg.community.dev/` root.
   - Fixed by pointing the demo seed and Activity Admin draft default to the official GDG event page.

## Deferred Manual Checks

- Confirm Gemini API key restrictions, quota, and model health in the deployed Google Cloud/Firebase environment.
- Add the final production/preview/custom domain to Firebase Auth authorized domains.
- Confirm Firestore rules are deployed to the target Firebase project.
- Confirm the first operator `chapterUsers/{uid}` document is bootstrapped with `admin`.

## Verification

- `npm run test`: 136 passing
- `npm run typecheck`: passing
- `npm run build`: passing
- `npm run test:rules:emulator`: 9 passing
- Browser checks: `/`, `/member`, `/admin`, `/admin/activities` returned no console errors in tested desktop/mobile routes.
- Browser check: `/` Build with AI `바로가기` href resolves to the official GDG event page.

Note: Firebase emulator test passed, but Firebase CLI warned that Java versions below 21 will lose support in `firebase-tools@15`.
