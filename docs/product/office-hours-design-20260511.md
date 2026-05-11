# Design: GDGoC CNU Chapter Activity Hub

Status: DRAFT - Approach C approved  
Date: 2026-05-11  
Branch: main  
Target demo date: 2026-05-16

## Summary

GDGoC CNU's homepage should become a two-sided chapter activity hub.

For external visitors, it should work as a polished public showcase: the chapter's brand, achievements, seasonal onboarding, and visible proof of active community work.

For logged-in members, it should work as a structured activity dashboard: members can quickly see current notices, upcoming events, active studies/projects, challenges, social activities, and recent outcomes without digging through Discord.

For organizers, it should become an operations console: team members can register activities, set visibility, route people to official event pages when needed, and inspect participation analytics.

## Problem Statement

The chapter already uses Discord for community conversation, but Discord is weak as a long-lived source of truth. Notices and activities disappear into chat history, external visitors cannot easily see proof of chapter momentum, and organizers do not get structured participation data.

The homepage should not replace Discord. It should become the canonical, structured layer above it.

## What Makes This Cool

- The public site can feel like a creative portfolio for the chapter, not a generic club page.
- Seasonal onboarding can change for recruiting, Build with AI, seminars, demo days, and other campaigns.
- Members get a single place to understand "what is happening now."
- Organizers get participation analytics that help improve community operations.
- Discord becomes an announcement channel fed by the website, not the source of truth.

## Core Premises

1. The homepage is not a Discord replacement. It is the official structured hub for chapter activities.
2. The external page should lead with brand and achievements, while seasonal campaigns are swappable presentation layers.
3. The logged-in member home should make current chapter activity visible at a glance.
4. The admin system should become the source of truth for notices, activities, events, and publishing.
5. Discord should receive announcements from the website through webhook/bot integration.
6. The 2026-05-16 presentation should prioritize convincing product flow over complete production infrastructure.
7. Long-term architecture should be Next.js plus Firebase/Google Cloud-first, with Docker/Cloud Run maturity deferred until after the prototype.

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

## Functional Requirements

### Public Showcase

- Show GDGoC CNU brand, values, atmosphere, and proof of activity.
- Highlight achievements, projects, event outcomes, and galleries.
- Support seasonal hero/onboarding experiences.
- Allow seasonal visual themes and motion assets.
- Keep Build with AI as a campaign/season, not the permanent product identity.

### Member Home

The first logged-in screen must separate activity categories rather than merge everything into one feed:

- Notices, including 3-5 pinned important notices.
- Upcoming events, including official GDG events and chapter-only events.
- Active studies and projects.
- Challenges and social activities.
- Gallery/showcase archive. This can be lower priority if scope must compress.

### Content And Activity Management

- Team members, organizers, and admins can create official notices/events/challenges.
- Members can propose or open studies.
- Members can propose projects, with organizer/team review before official recruiting.
- Members can write long-form records such as event reviews, study retrospectives, project retrospectives, and technical posts.
- Free-form discussion board is out of scope for first launch. Discord remains the place for live conversation.
- Good long-form posts can be promoted into showcase/gallery surfaces.

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

### Participation

The system should track member-specific participation records.

Recommended stored states:

- `applied`: user applied.
- `approved`: user was accepted or confirmed.
- `attended`: user attended, completed, or finished the activity.
- `cancelled`: user cancelled before participation.

Do not store `absent` as a first-class state initially. After an activity ends, an `approved` participation record that was not changed to `attended` can be displayed and calculated as absent. Do not add `rejected` initially; unapproved `applied` records can remain pending or be handled later if rejection audit becomes necessary.

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

- Activity-level applied/approved/attended/cancelled counts.
- Non-participant calculation by activity target group.
- Participation rates by cohort, role, activity type, and date range.
- Active member participation rate, excluding alumni by default.
- Separate operator/team-member views.
- Low-participation member surfacing for operators.
- CSV export where useful for operations.

The purpose is operational improvement, not surveillance. The dashboard should help organizers understand where participation drops and improve notice timing, activity design, onboarding, and follow-up.

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

Build a working prototype that has real product flow and shallow but structured data. Use mock or seed data where needed for the 2026-05-16 presentation, but shape the code around future Firebase repositories.

The goal is to show:

1. A public home with brand, achievements, and seasonal onboarding.
2. A member home with structured activity visibility.
3. An organizer/admin screen for publishing content and seeing participation analytics.

This is not "static throwaway mockup." It should be implemented as a bridge:

- Typed domain models.
- Mock repositories.
- Service boundaries.
- UI components that can later swap mock data for Firestore adapters.
- Admin and member routes that reflect the future product shape.

## Architecture Direction

### Prototype

- Next.js App Router.
- Wanted Montage WDS.
- Mock/seed data stored in TypeScript modules or local JSON.
- Repository interfaces that imitate future Firestore access.
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
  /content/new
  /activities/[id]
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
  | 'notice'
  | 'event'
  | 'study'
  | 'project'
  | 'challenge'
  | 'social'
  | 'showcase';

type ParticipationStatus =
  | 'applied'
  | 'approved'
  | 'attended'
  | 'cancelled';

type ParticipationSource =
  | 'manual'
  | 'check_in'
  | 'external_import'
  | 'api_sync'
  | 'proof_review';
```

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
- Toggle or preview Discord announcement.
- View participation analytics by activity, cohort, role, and period.
- See low-participation member list.

## Open Questions

- Exact first-season hero visual direction and motion asset format.
- Whether Firebase App Hosting or Cloud Run should be the first production runtime.
- Which analytics charts are essential for first implementation.
- Whether studies can truly be member-created without approval.
- What member profile fields are required for approval.
- Which external challenge APIs are realistic to integrate first.
- Whether gdg.community.dev has a reliable import path for event participants.

## Success Criteria

### For The Saturday Demo

- A viewer can understand the public brand and community momentum in under 30 seconds.
- A member can see current chapter activity without reading Discord.
- An organizer can understand how content publishing and participation analytics will work.
- The prototype feels like a real product direction, not a static slide.

### For The First Real Release

- Operators can publish notices/events/activities from an admin interface.
- Members can see structured activity sections after login.
- Visibility rules work for public and members-only content.
- Participation can be recorded and analyzed.
- Discord receives announcements from website publishing.

## The Assignment

Before implementation, create the Saturday demo plan as a thin vertical slice:

1. Define mock seed data for users, roles, notices, events, studies, projects, challenges, gallery items, and participation records.
2. Build public, member, and admin route shells around that data.
3. Use repository interfaces so mock data can later be replaced by Firestore.
4. Prioritize visual polish and clear flow for the public home and member dashboard.
5. Defer Docker, Cloud Run, production security rules, and real Discord bot execution until after the presentation prototype.

## Next Skill Recommendations

- Use `/plan-design-review` next to pressure-test the visual direction and seasonal hero system.
- Use `/plan-eng-review` after that to lock the route structure, data model, permissions, and Firebase migration path.
- Use `/to-issues` once the plan is approved to split the prototype into vertical implementation slices.
