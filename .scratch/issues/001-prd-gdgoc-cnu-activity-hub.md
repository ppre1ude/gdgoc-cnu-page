# PRD: GDGoC CNU Chapter Activity Hub

Labels: ready-for-agent
Status: ready-for-planning
Source PRD: `docs/product/prd-gdgoc-cnu-activity-hub.md`
Created: 2026-05-11

## Summary

Build a Firebase-backed GDGoC CNU chapter activity hub.

The product should serve three audiences:

1. External visitors who need a polished public view of chapter activity, achievements, and seasonal campaigns.
2. Logged-in members who need to see chapter activities and notices at a glance.
3. Operators who need to register activities, manage participation, and eventually analyze engagement.

The first demo target is Saturday, 2026-05-16. The demo must show a real state-changing flow:

1. Operator creates or edits an Activity.
2. Gemini helps draft or structure the Activity content.
3. Activity is saved to Firebase.
4. Member home reflects the saved Activity.

Application state changes are strongly preferred if they fit the first slice.

## Acceptance Criteria

1. The canonical PRD exists at `docs/product/prd-gdgoc-cnu-activity-hub.md`.

2. The PRD captures the agreed product direction:
   - Activity hub, not Discord replacement.
   - Website/admin system as structured source of truth.
   - Public visitor, member, and operator surfaces.
   - Firebase-backed real demo slice.
   - Gemini-assisted Activity authoring.

3. The PRD captures the agreed domain model:
   - Activity, Session, Activity Application, Session Attendance, Notice, Showcase.
   - Activity and Session are separate.
   - Showcases are not Activities.
   - Notices are not forced into Activities.
   - Application states: `applied`, `approved`, `cancelled`.
   - Absence is derived, not stored initially.

4. The PRD captures the agreed role model:
   - visitor, guest, member, alumni, team_member, organizer, admin.
   - team_member can approve guest to member.
   - admin manages privileged roles with safeguards.
   - role changes are logged.

5. The PRD captures delivery phases:
   - Saturday demo slice.
   - First usable release.
   - Operations platform.

6. The PRD includes user stories, implementation decisions, testing decisions, out-of-scope items, and open questions.

## Implementation Follow-Up

Use this PRD as the source for the next `to-issues` or implementation planning step. The likely first vertical slice is:

1. App shell and WDS-aligned layout.
2. Firebase Auth.
3. Firestore Activity model/repository.
4. Operator Activity CRUD.
5. Gemini-assisted authoring.
6. Member home Activity feed.
7. Demo seed/mock bridge.

