# Design: GDGoC CNU Chapter Activity Hub

Status: DRAFT - Approach C approved, grill-me updates applied  
Date: 2026-05-11  
Branch: main  
Target demo date: 2026-05-16

## Summary

GDGoC CNU's homepage should become a two-sided chapter activity hub.

For external visitors, it should work as a polished public showcase: the chapter's brand, achievements, seasonal onboarding, and visible proof of active community work.

For logged-in members, it should work as a structured activity dashboard: members can quickly see current notices, upcoming events, active studies/projects, challenges, social activities, and recent outcomes without digging through Discord.

For organizers, it should become an operations console: team members can register activities, set visibility, route people to official event pages when needed, and inspect participation analytics.

After grill-me refinement, the first demo is no longer a pure mock bridge. It should include a Firebase-backed thin slice: Google Auth, Firestore Activity CRUD, and Gemini-based writing assistance inside the organizer authoring flow. Mock/seed data still exists to make the Saturday demo feel deep, but the core "write activity -> save -> member home updates" loop should actually work.

## Problem Statement

The chapter already uses Discord for community conversation, but Discord is weak as a long-lived source of truth. Notices and activities disappear into chat history, external visitors cannot easily see proof of chapter momentum, and organizers do not get structured participation data.

The homepage should not replace Discord. It should become the canonical, structured layer above it.

## What Makes This Cool

- The public site can feel like a creative portfolio for the chapter, not a generic club page.
- Seasonal onboarding can change for recruiting, Build with AI, seminars, demo days, and other campaigns.
- Members get a single place to understand "what is happening now."
- Organizers get participation analytics that help improve community operations.
- Gemini helps operators turn rough activity notes into structured summaries and audience-specific copy.
- Discord becomes an announcement channel fed by the website, not the source of truth.

## Core Premises

1. The homepage is not a Discord replacement. It is the official structured hub for chapter activities.
2. The external page should lead with brand and achievements, while seasonal campaigns are swappable presentation layers.
3. The logged-in member home should make current chapter activity visible at a glance.
4. The admin system should become the source of truth for notices, activities, events, and publishing.
5. Discord should receive announcements from the website through webhook/bot integration.
6. The 2026-05-16 presentation should include a real Firebase-backed product loop, while avoiding full production infrastructure.
7. Long-term architecture should be Next.js plus Firebase/Google Cloud-first, with Docker/Cloud Run maturity deferred until after the prototype.
8. Activity application and session attendance are different concepts and should not be collapsed.
9. Notices and showcases are not activities; they require separate content collections.
10. AI assistance should support human operators, not silently publish generated official copy.

## Users And Roles

### Visitor

Unauthenticated user who can see public chapter brand, public activities, selected projects, event history, gallery content, and public seasonal onboarding.

### Guest

Logged-in user who has not yet been approved as a chapter member.

### Member

Approved active chapter member. Can view members-only content, apply to activities, participate in challenges, and submit selected long-form records such as reviews or retrospectives.

### Alumni

Past member. Alumni are excluded from default active participation metrics, but can be included for specific events or views.

### Team Member

Chapter operator. Can create official notices, events, challenges, and manage content workflows.

### Organizer

Responsible person for a specific event, study, project, or campaign. Can manage assigned activities.

### Admin

System-level operator. Can manage roles, system settings, dangerous edits, integrations, and final permissions.

## Role Management Rules

- `admin` can change any role, including `team_member`, `organizer`, and `admin`.
- `admin` cannot remove their own admin role.
- The system must prevent removal of the last remaining admin.
- `team_member` can approve `guest -> member`.
- `team_member` cannot grant `team_member`, `organizer`, or `admin`.
- `organizer` can manage assigned activities but cannot change roles.
- `member` can manage their own profile and apply to activities but cannot change roles.
- Every role change should create a `roleChangeLogs` record containing actor, target user, previous role, next role, and timestamp.

## Functional Requirements

### Public Showcase

- Show GDGoC CNU brand, values, atmosphere, and proof of activity.
- Highlight achievements, projects, event outcomes, and galleries.
- Support seasonal hero/onboarding experiences.
- Allow seasonal visual themes and motion assets.
- Keep Build with AI as a campaign/season, not the permanent product identity.

### Member Home

The first logged-in screen must separate activity categories rather than merge everything into one feed:

1. Pinned notices.
2. Upcoming activities.
3. My applications / my next sessions.
4. Active studies and projects.
5. Challenges and social activities.
6. Showcase/gallery preview.
7. Participation snapshot.

### Content And Activity Management

- The main content collections should be split into `activities`, `notices`, and `showcases`.
- `activities` are participation, schedule, and analytics targets.
- `notices` are announcements. They can be pinned and visible to public or members, but they are not participation targets.
- `showcases` are gallery, achievement, retrospective, or project-result archive content. They can reference activities but are not activities.
- Team members, organizers, and admins can create official notices/events/challenges.
- Members can propose or open studies.
- Members can propose projects, with organizer/team review before official recruiting.
- Members can write long-form records such as event reviews, study retrospectives, project retrospectives, and technical posts.
- Free-form discussion board is out of scope for first launch. Discord remains the place for live conversation.
- Good long-form posts can be promoted into showcase/gallery surfaces.

### Activity And Session Model

Reference projects:

- [Palkia](https://github.com/PoolC/Palkia) backend separates `Activity` and `Session`.
- [Dialga](https://github.com/PoolC/Dialga) frontend exposes activity list, activity detail, activity form, and session attendance flows.

Apply the same conceptual split:

- `Activity` is the top-level activity: event, study, project, challenge, or social activity.
- `Session` is a concrete meeting, round, event day, or attendance unit inside an activity.
- Application/registration intent is tracked at the Activity level.
- Attendance/completion evidence is tracked at the Session level.
- A one-off event can be treated as an activity with one session.
- Saturday demo implements real Activity CRUD. Session CRUD can wait, but the long-term domain model must leave room for sessions.

### Visibility

Every major content or activity item should support a visibility policy:

- `public`
- `members_only`
- `admins_only`

Events and galleries are public-first. Notices can be public or members-only. Studies/projects can expose public summaries while keeping details or participation members-only. Challenges are members-first but can be public when needed.

### Onboarding And Approval

- Anyone can sign in.
- New accounts start as `guest`.
- Guests submit profile details such as name, school/department, cohort or join path, and short reason.
- Operators approve users into `member`, `alumni`, `team_member`, `organizer`, or `admin`.
- Later, invite codes or invite links can auto-approve members or event participants.
- Full role management is in product scope, not just a mock. Implementation may land progressively, but the design must support it.

### Participation

The system should track member-specific participation records.

Participation is split between activity application and session attendance.

Recommended `activityApplications` states:

- `applied`: user applied.
- `approved`: user was accepted or confirmed.
- `cancelled`: user cancelled before participation.

Recommended `sessionAttendances` state:

- `attended`: user attended or completed a session.

Do not store `absent` as a first-class state initially. After a session ends, an approved application without matching attendance can be displayed and calculated as absent. Do not add `rejected` initially; unapproved `applied` records can remain pending or be handled later if rejection audit becomes necessary.

Suggested Firestore IDs:

```text
activityApplications/{activityId_userId}
sessionAttendances/{sessionId_userId}
```

Each document should duplicate key query fields such as `activityId`, `sessionId`, `userId`, `activityType`, `roleSnapshot`, and timestamps because Firestore does not support relational joins well.

### Participation Sources

Activities should support different participation input methods:

- `manual`: operators manage participation directly.
- `check_in`: QR or on-site check-in, added later if needed.
- `external_import`: imported or manually reflected from gdg.community.dev.
- `api_sync`: automated sync for development challenges such as GitHub or problem-solving platforms.
- `proof_review`: operator-approved proof for social or certification-style challenges.

### Participation Analytics

The first serious version should include analysis-level operations dashboard, not just lists.

Analytics should support:

- Recent 30-day active member attendance rate.
- Activity-level applied/approved/attended/absent counts.
- Attendance rate by activity type: event, study, project, challenge, social.
- Low-participation member list over recent N activities.
- Upcoming activity application rate and capacity fill rate.

The purpose is operational improvement, not surveillance. The dashboard should help organizers understand where participation drops and improve notice timing, activity design, onboarding, and follow-up.

### AI Writing Assistance

Gemini-based writing assistance is part of the first implementation scope.

The AI assistance lives inside the organizer writing flow, not on list pages.

Flow:

1. Operator writes rough title, body notes, type, visibility, and registration information.
2. Operator clicks an AI assistance action.
3. Gemini returns structured suggestions in a side panel:
   - Card summary for member home.
   - Member-facing copy.
   - Public-facing copy.
   - Suggested tags.
   - Optional missing-information checks.
4. Operator applies selected suggestions into form fields.
5. Operator can edit everything before saving.
6. Saving writes the approved result to Firestore.

AI output must not silently overwrite official content. The operator remains responsible for the final saved copy.

### Discord Integration

- Discord is not a content source of truth.
- Publishing selected website notices/activities should trigger a Discord announcement.
- Initial prototype can show "Discord notification will be sent" as a flow state.
- Later implementation can use Discord webhooks or a bot called from Cloud Functions/Cloud Run.

### External Events

- Some official events must route to `gdg.community.dev`.
- Not every chapter event appears on `gdg.community.dev`.
- Each event should support flexible registration mode:
  - external registration URL
  - internal website application
  - hybrid internal tracking plus external official registration

### Member Feedback

- Sli.do is a feedback and idea collection channel, not a product source of truth.
- Member ideas, Easter eggs, and feature requests can later feed an idea backlog.

## Nonfunctional Requirements

- The public site should look polished enough to support recruiting and chapter credibility.
- The member portal should favor scannability over decorative density.
- Admin flows should avoid ambiguity around visibility and publish actions.
- The design must follow `DESIGN.md` and Wanted Montage WDS by default.
- Seasonal visual variants may override the base mood, but should remain bounded by reusable component slots.
- The system should be easy to hand off to future operators.
- Long-lived content and analytics data should not depend on Discord history.
- The architecture should support gradual migration from prototype data to Firebase-backed repositories.

## Recommended Approach

Approach C: Product Demo Bridge.

Build a working prototype that has real product flow and shallow but structured data. The core loop should be Firebase-backed: Google Auth, Firestore Activity CRUD, and Gemini authoring assistance. Use mock or seed data where needed for the 2026-05-16 presentation, but shape the code around future Firebase repositories.

The goal is to show:

1. A public home with brand, achievements, and seasonal onboarding.
2. A member home with structured activity visibility.
3. An organizer/admin screen for publishing content and seeing participation analytics.

This is not a static throwaway mockup. It should be implemented as a bridge:

- Typed domain models.
- Firestore-backed thin slice for Activity CRUD.
- Mock/seed repositories only where depth is needed for the demo.
- Service boundaries.
- UI components that can later swap mock data for Firestore adapters.
- Admin and member routes that reflect the future product shape.
- Gemini writing-assistance service boundary that can later move behind Cloud Functions or a secure server endpoint.

## Architecture Direction

### Prototype

- Next.js App Router.
- Wanted Montage WDS.
- Firebase Authentication with Google OAuth.
- Firestore-backed `activities` CRUD.
- Firestore-backed users/roles at least enough to gate admin/member screens.
- Gemini writing assistance for Activity authoring.
- Mock/seed data stored in TypeScript modules or Firestore seed scripts where needed for demo depth.
- Repository/service interfaces that allow Firestore-backed and mock-backed data to coexist.
- No Docker requirement for the Saturday prototype.
- No heavy CI/CD requirement before presentation.

### Long-Term

- Next.js App Router.
- Firebase Authentication with Google OAuth.
- Firestore for structured content, users, roles, participation records, and analytics source data.
- Firebase Storage for images, gallery assets, and seasonal media.
- Firebase App Hosting or Cloud Run for Next.js runtime.
- Cloud Functions or Cloud Run Jobs for Discord notifications, external imports, API sync, and scheduled analytics jobs.
- Custom domain attached through Firebase Hosting, Firebase App Hosting, or Cloud Run routing.
- Docker/Cloud Run standalone deployment can be introduced when operational maturity matters.

## Suggested Route Structure

```text
/(public)
  /
  /activities
  /events/[id]
  /showcase
  /gallery

/(member)
  /home
  /notices
  /events
  /studies
  /projects
  /challenges
  /me

/admin
  /dashboard
  /activities/new
  /activities/[id]
  /notices
  /showcases
  /members
  /analytics
  /settings
```

## Suggested Domain Models

These are planning shapes, not final database schemas.

```ts
type Role =
  | 'guest'
  | 'member'
  | 'alumni'
  | 'team_member'
  | 'organizer'
  | 'admin';

type Visibility = 'public' | 'members_only' | 'admins_only';

type ActivityType =
  | 'event'
  | 'study'
  | 'project'
  | 'challenge'
  | 'social';

type NoticeType =
  | 'general'
  | 'urgent'
  | 'recruiting'
  | 'event';

type ShowcaseType =
  | 'gallery'
  | 'achievement'
  | 'retrospective'
  | 'project_result';

type ContentStatus =
  | 'draft'
  | 'published'
  | 'archived';

type RegistrationMode =
  | 'none'
  | 'internal'
  | 'external'
  | 'hybrid';

type Schedule = {
  startsAt?: string;
  endsAt?: string;
  timezone: 'Asia/Seoul';
};

type ParticipationStatus =
  | 'applied'
  | 'approved'
  | 'cancelled';

type AttendanceStatus = 'attended';

type ParticipationSource =
  | 'manual'
  | 'check_in'
  | 'external_import'
  | 'api_sync'
  | 'proof_review';

type ActivityApplication = {
  activityId: string;
  userId: string;
  status: ParticipationStatus;
  createdAt: string;
  updatedAt: string;
};

type SessionAttendance = {
  activityId: string;
  sessionId: string;
  userId: string;
  status: AttendanceStatus;
  source: ParticipationSource;
  recordedBy: string;
  recordedAt: string;
};
```

## Firestore Collection Direction

```text
users/{uid}
roleChangeLogs/{logId}

activities/{activityId}
sessions/{sessionId}
activityApplications/{activityId_userId}
sessionAttendances/{sessionId_userId}

notices/{noticeId}
showcases/{showcaseId}
```

Saturday demo must prioritize `users` and `activities`. `notices`, `showcases`, `sessions`, applications, and analytics can be implemented as far as time allows, but the domain direction should stay consistent.

## Phase Plan

### Phase 1: Saturday Demo

- Firebase Auth.
- Firestore Activity CRUD.
- Gemini Activity writing assistance.
- Activity appears on member home after creation.
- Role gate for admin/member surfaces.
- Seed/mock analytics and showcases to make the demo narrative credible.
- Optional: activity application/cancel flow.

### Phase 2: First Usable Release

- Notice CRUD.
- Activity application persistence.
- Session model and attendance flow.
- Full role management.
- Five analytics metrics calculated from real data.
- Showcase management.

### Phase 3: Operations Platform

- Discord notification publishing.
- gdg.community.dev import or assisted reflection.
- GitHub/problem-solving platform sync.
- Invite links and invite codes.
- Seasonal hero CMS and motion asset management.
- Firebase App Hosting or Cloud Run operational hardening.

## Saturday Demo Scope

### Screen 1: Public Home

- Seasonal hero.
- Chapter brand and achievements.
- Recent gallery/showcase preview.
- Featured activities.
- Recruiting or campaign CTA slot.

### Screen 2: Member Home

- Pinned notices.
- Upcoming events.
- Active studies/projects.
- Challenges and social activities.
- Gallery/showcase archive preview.

### Screen 3: Organizer/Admin

- Create or edit activity.
- Set visibility.
- Select registration mode.
- Use Gemini writing assistance to generate summary/member copy/public copy/tag suggestions.
- Save to Firestore.
- Manage member roles according to role safety rules.
- View participation analytics by activity, activity type, role, and period.
- See low-participation member list.

## Open Questions

- Exact first-season hero visual direction and motion asset format.
- Whether Firebase App Hosting or Cloud Run should be the first production runtime.
- Whether studies can truly be member-created without approval.
- What member profile fields are required for approval.
- Which external challenge APIs are realistic to integrate first.
- Whether gdg.community.dev has a reliable import path for event participants.
- Whether role management should use Firestore-only role documents for the demo or migrate to Firebase custom claims later.
- How Gemini calls should be protected in production so API keys are not exposed to the client.

## Success Criteria

### For The Saturday Demo

- A viewer can understand the public brand and community momentum in under 30 seconds.
- A member can see current chapter activity without reading Discord.
- An organizer can create an Activity through Firebase-backed CRUD and see it reflected in the member home.
- An organizer can use Gemini suggestions while drafting an Activity.
- Admin/member route access visibly respects role gates.
- The prototype feels like a real product direction, not a static slide.

### For The First Real Release

- Operators can publish notices/events/activities from an admin interface.
- Members can see structured activity sections after login.
- Visibility rules work for public and members-only content.
- Participation can be recorded and analyzed.
- Discord receives announcements from website publishing.

## The Assignment

Before implementation, create the Saturday demo plan as a Firebase-backed thin vertical slice:

1. Scaffold Next.js, Montage WDS, Firebase Auth, Firestore, and Gemini service access.
2. Define domain models for users, roles, activities, sessions, applications, attendances, notices, and showcases.
3. Implement real Activity CRUD in Firestore.
4. Implement role-gated admin/member route access.
5. Implement Gemini suggestion panel inside Activity authoring.
6. Build member home sections in the approved priority order.
7. Build public home with brand, achievements, seasonal hero, and showcase preview.
8. Add seed/mock data for analytics and showcases where real data is too shallow.
9. Defer Docker, Cloud Run, production security hardening, real Discord bot execution, and external imports until after the presentation prototype.

## Next Skill Recommendations

- Use `/plan-design-review` next to pressure-test the visual direction and seasonal hero system.
- Use `/plan-eng-review` after that to lock the route structure, data model, permissions, and Firebase migration path.
- Use `/to-issues` once the plan is approved to split the prototype into vertical implementation slices.
