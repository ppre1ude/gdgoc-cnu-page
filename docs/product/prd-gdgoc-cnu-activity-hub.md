# PRD: GDGoC CNU Chapter Activity Hub

Status: Draft ready for implementation planning
Date: 2026-05-11
Owner: GDGoC CNU 운영진

## Problem Statement

GDGoC CNU needs a homepage that works as the official, structured hub for chapter activity.

Today, activity information is fragmented across Notion, Discord, gdg.community.dev, offline operations, and individual announcements. Discord is good for live conversation, but it is not a good source of truth for structured chapter activity. Notion has been useful, but it depends on operators manually maintaining pages and does not provide a polished public brand surface, member-first dashboard experience, or operational analytics.

The chapter needs a single place where:

- External visitors can quickly understand that GDGoC CNU is active, credible, and worth joining.
- Logged-in members can check the calendar, important notices, active studies/projects, open applications, and their own upcoming commitments without needing admin permissions.
- Operators can register and manage activities without editing static pages manually.
- Participation can be tracked well enough to improve operations and member engagement.
- Google technologies, especially Firebase and Gemini, are visibly used in the Build with AI demo.

The immediate demonstration target is Saturday, 2026-05-16. The demo must show a real, Firebase-backed product slice rather than a static mock. It can use seed/demo data for depth, but the key flow must actually change state.

The core user action is:

> An approved member can open the member dashboard and understand what is happening next, which notices matter, which studies/projects are open, and what they have already applied to.

The demo must be evaluated from the member role first. Admin and team-member flows exist to create source-of-truth content, but the presentation center should be the member experience.

For the demo, the supporting state-changing operator action is:

> An operator creates or edits an activity, optionally with Gemini writing assistance, stores it in Firebase, and the activity appears on the member dashboard.

If feasible in the same slice, a member can apply to an activity and see their participation state change.

## Solution

Build a Next.js application using Wanted Montage Web Design System and Firebase. The product is a role-aware activity hub with three primary surfaces:

1. Public homepage
   - Presents GDGoC CNU as an active, polished chapter.
   - Shows selected public activities, achievements, seasonal onboarding content, and showcase items.
   - Supports seasonal visual replacement, including future motion graphics or designer-created campaign modules.

2. Member dashboard
   - Available after login.
   - Shows the member calendar, pinned notices, the user's applications, active studies/projects, challenges/social activities, showcase previews, and a lightweight participation snapshot.
   - Prioritizes reading and deciding what to join before member authoring or operator controls.
   - Treats the website as a structured source of truth, while Discord remains the conversation channel.

3. Operator dashboard
   - Available to team members, organizers, and admins according to role.
   - Supports activity CRUD as the first priority.
   - Later supports notices, showcases, role management, applications, attendance review, and participation analytics.
   - Includes Gemini-assisted drafting in the activity authoring flow.

The architecture should be Firebase-first for the prototype:

- Firebase Auth for Google login.
- Firestore for activities, users, roles, notices, applications, attendance, and showcases.
- Gemini / Google AI Studio for activity writing assistance through a protected server boundary.
- Firebase Hosting/App Hosting or Vercel can be used for early deployment; Cloud Run and Docker hardening can come later.

The product should be built as a real MVP plus demo bridge:

- Real Firebase-backed CRUD for activities.
- Real auth and role gating where practical.
- Real member dashboard reflection after activity creation.
- Seed/mock bridge for analytics and showcase depth if full data entry is not ready.
- Clear separation between production data models and mock/demo data.

## Member-First Product Flow

The primary logged-in product is the member dashboard, not the operator console.

The approved member flow should be:

1. Open `/member`.
2. See a concise dashboard summary of what is happening now.
3. Check the next scheduled events, study meetings, project milestones, or challenge deadlines through a calendar/timeline section.
4. Read pinned or recent official notices in a board-like notice surface.
5. Browse active or recruiting studies and projects in a board-like status surface.
6. Apply to a relevant activity or follow the external registration link when required.
7. Confirm their own application state and next commitments.
8. Optionally propose a study/project or submit a record after the primary dashboard information has been surfaced.

The operator flow should support this member flow:

1. Create or edit activities, notices, showcases, records, and roles in the operator console.
2. Approve project proposals and participation where needed.
3. Maintain sessions, attendance, and analytics for operations.
4. Keep the member dashboard accurate and trustworthy.

This means the prototype should not be judged complete because an admin can create content. It should be judged by whether an approved member can understand schedules, notices, open studies/projects, and their own participation state without using admin permissions.

## User Stories

### Public Visitor

1. As an unauthenticated visitor, I want to understand what GDGoC CNU is within the first screen so that I can decide whether this chapter is relevant to me.

2. As an unauthenticated visitor, I want to see recent or upcoming public activities so that the chapter feels active and concrete, not like a static club brochure.

3. As an unauthenticated visitor, I want to see seasonal campaign content, such as Build with AI, so that I understand what the chapter is currently emphasizing.

4. As an unauthenticated visitor, I want to see chapter achievements, showcases, photos, or archives so that I can trust that the community produces real outcomes.

5. As an unauthenticated visitor, I want public events that require gdg.community.dev registration to link me there so that official Google event registration still happens in the required place.

6. As an unauthenticated visitor, I want chapter-only events to have clear local descriptions so that events not listed on gdg.community.dev are still visible.

7. As an unauthenticated visitor, I want the site to feel polished and modern so that the chapter brand feels credible and attractive to prospective members.

8. As an unauthenticated visitor, I want public activity cards to avoid leaking member-only details so that internal notices and operations remain private.

9. As an unauthenticated visitor, I want a clear login or join path so that I can become a guest account and request member approval.

10. As a prospective member, I want the onboarding/hero section to change seasonally so that recruiting seasons and major campaigns can feel fresh without rebuilding the whole product.

### Guest User

11. As a logged-in guest, I want to know that my account is pending approval so that I understand why some member features are limited.

12. As a logged-in guest, I want to see only safe public or guest-visible information so that the chapter can keep member-only operations private.

13. As a logged-in guest, I want to provide enough profile information for approval so that team members can decide whether to promote me to member.

14. As a logged-in guest, I want the login flow to work with my Google account so that account creation is quick during the demo and real use.

### Member

15. As a member, I want to open the member dashboard and immediately see what is happening in the chapter so that I can decide where to participate.

16. As a member, I want pinned notices to appear first so that urgent or important information is hard to miss.

17. As a member, I want upcoming activities to be visible near the top so that I do not miss offline events, studies, projects, challenges, or social activities.

18. As a member, I want activity cards to clearly show type, visibility, schedule, location or link, application status, and next action so that I can scan quickly.

19. As a member, I want notices and activities to be separate surfaces so that announcements, events, studies, projects, and challenges do not become one overloaded board.

20. As a member, I want studies and projects to be discoverable separately from one-off events so that long-running work does not get buried.

21. As a member, I want challenges and social activities to be discoverable but not treated as the product's core purpose so that participation features stay flexible.

22. As a member, I want gallery/showcase content to be separate from activities so that static achievements, photos, and archives are not forced into an activity model.

23. As a member, I want to apply to an activity from the website when the activity supports internal application so that the chapter can track participation.

24. As a member, I want to cancel my application when cancellation is allowed so that operators have more accurate participant counts.

25. As a member, I want to see my own application state, such as applied, approved, or cancelled, so that I know what action is expected.

26. As a member, I want external registration activities to send me to gdg.community.dev when required so that official Google event registration is preserved.

27. As a member, I want some activities to support both internal tracking and external links so that hybrid programs can be handled without special one-off pages.

28. As a member, I want my next sessions or upcoming commitments to be visible so that I can prepare for activities I have joined.

29. As a member, I want long-form records such as retrospectives, reviews, or technical writeups to live on the homepage so that meaningful chapter knowledge is not lost in Discord.

30. As a member, I want a lightweight participation snapshot to help me understand my involvement without feeling like the site is only a monitoring tool.

31. As a member, I want responsive mobile layout so that checking notices and events works well during campus life.

Member story clarification:

- The first member screen is a dashboard, not a content authoring tool.
- The dashboard should expose a calendar or timeline section before lower-priority proposal forms.
- Notices should behave like an official notice board: easy to scan, clearly pinned when important, and separate from applications.
- Studies and projects should behave like a board of current opportunities: active, recruiting, pending review, closed, or archived.
- "My applications" and "my next commitments" should be first-class dashboard sections, because they answer what the member personally needs to do next.

### Member Content Contributor

32. As a member, I want to propose or create a study so that bottom-up learning activities can start without unnecessary operator friction.

33. As a member, I want to propose a project so that members can recruit collaborators while still allowing operators to review official project visibility.

34. As a member, I want to write longer retrospectives or reviews so that Discord does not have to carry every detailed record.

35. As a member author, I want my content to have clear publication status so that drafts, pending review, and published content are not confused.

36. As a member author, I want high-quality records to be eligible for showcase promotion so that outcomes can become public proof of chapter activity.

### Team Member

37. As a team member, I want to create, edit, publish, unpublish, and pin notices so that important information can be controlled from the admin surface.

38. As a team member, I want to create and edit official activities so that events, studies, projects, challenges, and social activities are registered in the source of truth.

39. As a team member, I want to approve guest users into members so that onboarding can happen without requiring an admin for every low-risk approval.

40. As a team member, I want to avoid having permission to grant team_member, organizer, or admin roles so that role escalation stays controlled.

41. As a team member, I want to manage applications and attendance for activities I operate so that participation data remains accurate.

42. As a team member, I want the dashboard to show low-participation members to operators only so that the team can follow up responsibly.

43. As a team member, I want analytics to focus on operational improvement so that we can identify whether activity formats or communication need improvement.

44. As a team member, I want to see missing information warnings while drafting activities so that public/member cards do not ship with incomplete details.

### Organizer

45. As an organizer, I want to manage assigned activities so that responsibility can be delegated without making every operator a full admin.

46. As an organizer, I want to update session attendance for assigned activities so that actual participation can be recorded after offline events.

47. As an organizer, I want to review proof or manual participation for flexible challenges or social activities so that not all participation has to be automated.

48. As an organizer, I want to see application capacity and attendance indicators for my activities so that I can make operational decisions before and after events.

49. As an organizer, I want to use Gemini drafting assistance when creating activity content so that rough notes can become polished public and member copy quickly.

### Admin

50. As an admin, I want to assign and revoke roles so that the chapter can maintain a clear operating structure.

51. As an admin, I want role changes to be logged so that permission history is auditable.

52. As an admin, I want safeguards that prevent removing my own admin role or removing the last admin so that the system cannot lock out operators.

53. As an admin, I want to configure which content is public, member-only, or operator-only so that one content system can serve several audiences.

54. As an admin, I want to manage the seasonal homepage layer separately from core product pages so that recruiting campaigns or Build with AI visuals can change without rewriting the product.

55. As an admin, I want to seed demo data safely so that Saturday's presentation has enough visual depth without corrupting real production data.

56. As an admin, I want to decide later whether roles stay Firestore-only or move partly to Firebase custom claims so that the early implementation remains fast without blocking production hardening.

### AI-Assisted Authoring

57. As an operator author, I want to write rough title/body notes/type/visibility/registration information and ask Gemini for help so that I can draft faster.

58. As an operator author, I want Gemini to propose a member-dashboard card summary so that activity cards stay concise.

59. As an operator author, I want Gemini to propose member-facing copy so that internal instructions are clear and action-oriented.

60. As an operator author, I want Gemini to propose public-facing copy so that external visitors see polished language without internal-only context.

61. As an operator author, I want Gemini to suggest tags and missing information checks so that activities become easier to scan and filter.

62. As an operator author, I want AI suggestions to appear in a side panel rather than silently overwriting my draft so that the final official content remains an operator decision.

63. As an operator author, I want to apply selected suggestions and then edit them before saving so that AI accelerates writing without becoming the source of truth.

64. As an operator author, I want the activity to save to Firebase only after I confirm the final content so that generated content is reviewed before publication.

### Analytics

65. As an operator, I want to see recent 30-day active member attendance rate so that I can understand overall participation health.

66. As an operator, I want activity-level applied, approved, attended, and derived absent counts so that each event's funnel is visible.

67. As an operator, I want attendance rate by activity type so that we can compare events, studies, projects, challenges, and social activities.

68. As an operator, I want a low-participation member list over recent N activities so that the team can identify members who may need follow-up.

69. As an operator, I want upcoming activity application rate and capacity fill rate so that we can promote under-filled activities before they happen.

70. As an operator, I want alumni excluded from active participation metrics by default so that historical members do not distort current engagement.

71. As an operator, I want team members and active members included in operational participation metrics so that the chapter measures the real active community.

72. As an operator, I want derived absence to be based on approved applications without attended records after session end so that we do not need a separate absent state in the first model.

### External Integrations

73. As an operator, I want activities to optionally link to gdg.community.dev so that official Google program registration can be preserved when required.

74. As an operator, I want to manually register chapter-only events that never appear on gdg.community.dev so that the site remains the source of truth for local activities.

75. As an operator, I want gdg.community.dev participant data to be imported or reflected later if technically possible so that duplicate attendance work can be reduced.

76. As an operator, I want Discord notification publishing to happen later from website content so that Discord receives structured announcements from the source of truth.

77. As an operator, I want GitHub and problem-solving challenge integrations to remain optional automation layers so that challenges do not dominate the core activity hub.

## Implementation Decisions

### Product Shape

1. The product is an activity hub, not a Discord replacement.

2. The website/admin system is the source of truth for structured notices, activities, applications, attendance, roles, analytics, and showcases.

3. Discord is the live conversation channel and later notification target.

4. Notion is no longer the intended long-term operational source of truth, though it explains the current manual operator-driven workflow.

5. Build with AI is a seasonal campaign and demo context, not the permanent product identity.

6. The first demo should be a real Firebase-backed thin slice, supported by demo/mock data only where needed for depth.

### Technical Stack

1. Use Next.js App Router for routing, role-aware pages, server boundaries, and flexible deployment.

2. Use Wanted Montage Web Design System as the first-choice UI system. Follow `DESIGN.md` for visual decisions.

3. Use Firebase Auth for Google login.

4. Use Firestore as the first production database.

5. Use Firebase Storage later for showcase images or uploaded assets if needed.

6. Use Gemini / Google AI Studio for writing assistance through a server-protected API boundary.

7. Prefer Firebase-first deployment for early releases. Vercel is acceptable for fast preview/debugging, but long-term deployment can move to Firebase App Hosting or Cloud Run.

8. Defer Docker and AWS-style backend hardening until the prototype and first release prove the workflow.

### Architecture

The codebase should keep domain decisions separate from Firebase SDK details.

Recommended modules:

1. Domain model
   - Roles, activity types, visibility, content status, application states, attendance rules, analytics calculations.

2. Auth and role access
   - Current user loading, guest/member/operator/admin guards, permission matrix.

3. Repository/service layer
   - Activity repository, notice repository, user repository, role repository, application repository, attendance repository, showcase repository.
   - Firestore implementation first.
   - Mock/seed implementation only for demo bridge and local development.

4. Public homepage
   - Seasonal hero layer.
   - Public activity/showcase feed.
   - Join/login path.

5. Member dashboard
   - Calendar/timeline for upcoming activities and sessions.
   - Pinned and recent notices.
   - My applications and sessions.
   - Active/recruiting studies and projects.
   - Challenges/social activities.
   - Showcase preview.
   - Participation snapshot.
   - Lower-priority member proposal and record authoring.

6. Operator dashboard
   - Activity CRUD first.
   - Gemini-assisted authoring.
   - Notice CRUD later.
   - Applications/attendance review later.
   - Role management later.
   - Analytics later.
   - Showcase management later.

7. AI assistance
   - Protected server endpoint for Gemini.
   - Structured output contract.
   - Side-panel suggestion UI.
   - Operator-controlled apply/edit/save flow.

8. Analytics
   - Pure domain calculations where possible.
   - Firestore query adapters and denormalized records for production data.
   - Demo data adapter where live data is not deep enough.

### Domain Model

The product should separate `Activity`, `Session`, `Application`, and `Attendance`.

1. Activity
   - Represents the top-level thing members discover and join.
   - Types: `event`, `study`, `project`, `challenge`, `social`.
   - Can be public, member-only, or operator-only.
   - Can have optional schedule fields because notices do not need start/end dates and some activities may be long-running.
   - Can have internal application, external registration, or both.
   - One-off events are activities with one session.

2. Session
   - Represents a concrete meeting, round, event day, or attendance unit.
   - Belongs to an activity.
   - Used for attendance and derived absence.
   - Can be added after the first demo.

3. Activity Application
   - Represents member intent or approval for an activity.
   - State set for the first model: `applied`, `approved`, `cancelled`.
   - Do not add `rejected` initially; lack of approval is enough unless future operator workflows require explicit rejection.

4. Session Attendance
   - Represents actual attendance evidence.
   - Initial stored state: `attended`.
   - Do not store `absent` initially.
   - Derive absence from approved application plus missing attended record after session end.

5. Notice
   - Official announcement.
   - Can be pinned.
   - Can have visibility.
   - Does not need schedule.
   - Should not be forced into the activity model.

6. Showcase
   - Static/public record such as gallery item, achievement, retrospective, project result, or archive.
   - Can include photos, body text, links, and attribution.
   - Must not be modeled as an activity.

### Firestore Collections

Initial collections:

1. `users/{uid}`
2. `roleChangeLogs/{logId}`
3. `activities/{activityId}`
4. `sessions/{sessionId}`
5. `activityApplications/{activityId_userId}`
6. `sessionAttendances/{sessionId_userId}`
7. `notices/{noticeId}`
8. `showcases/{showcaseId}`

Firestore documents should denormalize fields needed for query and analytics, including IDs, activity type, role snapshot, timestamps, and source metadata where appropriate.

### Roles And Permissions

Roles:

1. `visitor`: unauthenticated.
2. `guest`: logged in but not approved.
3. `member`: approved active member.
4. `alumni`: past member, excluded from active metrics by default.
5. `team_member`: chapter operator.
6. `organizer`: operator responsible for specific activities.
7. `admin`: system-level operator.

Role rules:

1. Admin can assign and revoke roles, including operator roles, but cannot remove their own admin role or remove the last admin.

2. Team member can approve guest to member.

3. Team member cannot grant team_member, organizer, or admin.

4. Organizer can manage assigned activities and their participation records.

5. Member can view member content, apply to activities, cancel where allowed, and create/propose selected content types.

6. Guest has limited read access and pending approval state.

7. Every role change must create a role change log.

### Content Permissions

1. Notices
   - Create/edit/publish: team_member, organizer where assigned, admin.
   - Read: depends on visibility.

2. Official events and challenges
   - Create/edit/publish: team_member, organizer where assigned, admin.
   - Apply: members where enabled.

3. Studies
   - Member can propose or create.
   - Approval requirement remains open; default should avoid unnecessary friction unless publication risk appears.

4. Projects
   - Member can propose.
   - Operator approval is likely required before official recruiting/public visibility.

5. Long-form records
   - Member can write retrospectives, reviews, and technical posts.
   - Operator can promote strong records to showcase.

6. Free-form forum
   - A live free-form chat replacement is out of scope for first release because Discord already serves live conversation.
   - Board-like member surfaces are in scope: notice board, study/project board, record list, and activity detail flows. PoolC `/board` is a reference for the browsing rhythm of these surfaces, not a mandate to clone every free-board feature immediately.

### Member Dashboard Priority

The member dashboard should prioritize:

1. Member calendar / upcoming schedule.
2. Pinned notices.
3. My applications and my next sessions.
4. Active or recruiting studies and projects.
5. Challenges and social activities.
6. Showcase/gallery preview.
7. Participation snapshot.
8. Member-created study/project proposals and long-form record authoring.

The dashboard should not lead with admin-only controls, authoring forms, or analytics. Those are important, but they are not the first question a normal member is trying to answer.

### Analytics Decisions

The first analytics set should include:

1. Recent 30-day active member attendance rate.
2. Activity-level applied/approved/attended/derived absent counts.
3. Attendance rate by activity type.
4. Low-participation member list over recent N activities.
5. Upcoming activity application rate and capacity fill rate.

Analytics should be operator-only by default. Alumni are excluded from active metrics by default. Team members and active members are included.

### AI Assistance Flow

The first Gemini feature should live in activity authoring.

Flow:

1. Operator writes rough title, notes/body, activity type, visibility, registration mode, and schedule if relevant.
2. Operator clicks an AI assistance action.
3. Server sends the draft context to Gemini.
4. Gemini returns structured suggestions:
   - Short card summary for member dashboard.
   - Member-facing announcement copy.
   - Public-facing promotional copy.
   - Suggested tags.
   - Missing information checks.
5. UI shows suggestions in a side panel.
6. Operator applies selected suggestions.
7. Operator edits final content.
8. Operator saves to Firebase.
9. Member dashboard reflects the saved activity.

Rules:

1. AI output must not silently overwrite official content.
2. Operator confirmation is required before save.
3. The Gemini API key must not be exposed to the browser in production.
4. The demo should clearly show the story: AI helps write the activity, Firebase stores it, member dashboard updates from Firebase.

### Delivery Phases

#### Phase 1: Saturday Demo Slice

Required:

1. Next.js application shell using WDS direction from `DESIGN.md`.
2. Firebase Auth Google login.
3. Basic role-aware routing or role-aware UI states.
4. Activity CRUD backed by Firestore.
5. Activity create/edit form for operators.
6. Gemini-assisted activity drafting in the authoring flow.
7. Member dashboard that reads activities from Firestore and shows newly created activities inside schedule, board-like sections, and personal application state.
8. Seed/demo bridge for enough homepage/member-dashboard depth.
9. Public homepage with polished chapter/campaign framing.

Strongly preferred:

1. Member application action for an activity.
2. Application state shown on member dashboard.
3. Basic admin/operator dashboard navigation.
4. Minimal analytics cards using seed or real data.

#### Phase 2: First Usable Release

1. Notice CRUD with pinning.
2. Activity applications persisted and manageable by operators.
3. Session model and attendance flow.
4. Role management with role change logs.
5. The five analytics metrics from real data.
6. Showcase management.
7. Member-created study/project proposal workflows.
8. Basic security rules tests and emulator-backed verification.

#### Phase 3: Operations Platform

1. Discord notification publishing from website content.
2. gdg.community.dev import/reflection where possible.
3. GitHub or problem-solving challenge integrations.
4. Invite links or invite codes.
5. Seasonal hero CMS and motion asset management.
6. Firebase App Hosting or Cloud Run hardening.
7. Custom claims or stronger role enforcement if Firestore-only roles become insufficient.

## Testing Decisions

Testing should verify externally visible behavior and domain rules, not private implementation details.

### Domain Tests

1. Permission matrix tests for visitor, guest, member, alumni, team_member, organizer, and admin.

2. Role change guard tests:
   - Admin cannot remove own admin role.
   - Last admin cannot be removed.
   - Team member can approve guest to member.
   - Team member cannot grant privileged roles.

3. Activity visibility tests:
   - Public activities visible to visitors.
   - Member-only activities hidden from visitors/guests.
   - Operator-only content hidden from members.

4. Application state tests:
   - Member can apply when application is enabled.
   - Member can cancel when cancellation is allowed.
   - Invalid transitions are rejected.

5. Attendance derivation tests:
   - Approved application plus attended record counts as attended.
   - Approved application without attended record after session end counts as derived absent.
   - No explicit absent state is required.

6. Analytics calculation tests:
   - 30-day active attendance rate.
   - Activity funnel counts.
   - Attendance by activity type.
   - Low-participation member list.
   - Capacity fill rate.

### Integration Tests

1. Firebase Auth and role loading integration using emulator or mocked Firebase adapters.

2. Firestore repository tests for activities, applications, users, role logs, notices, sessions, attendance, and showcases.

3. Activity CRUD integration:
   - Operator creates activity.
   - Firestore stores it.
   - Member dashboard reads it.
   - Visibility rules are applied.

4. Application integration:
   - Member applies to activity.
   - Application record is stored.
   - Member dashboard shows updated state.
   - Operator dashboard sees the applicant.

5. Gemini assistance integration with a mocked AI provider:
   - Sends draft context.
   - Receives structured suggestions.
   - Handles invalid AI response safely.
   - Handles API failure with a recoverable UI state.

### UI And End-To-End Tests

1. Playwright or equivalent browser tests for the Saturday demo path:
   - Login.
   - Open operator dashboard.
   - Create activity.
   - Use AI assistance or mocked AI assistance.
   - Save.
   - Open member dashboard.
   - Confirm new activity appears.

2. If application flow is included:
   - Member applies.
   - State changes to applied.
   - Operator approves.
   - Member sees approved state.

3. Public homepage responsive checks:
   - Mobile and desktop hero.
   - Public activity cards.
   - Showcase preview.
   - Login/join entry.

4. Member dashboard responsive checks:
   - Calendar/upcoming schedule remains visible.
   - Pinned notices remain prominent.
   - Study/project cards do not overflow.
   - My applications and next commitments remain scannable.

5. Operator dashboard responsive checks:
   - Forms remain usable.
   - AI side panel does not obscure required fields.
   - Save/publish actions remain clear.

### Security Tests

1. Firestore rules should prevent guests from writing member-only records.

2. Members should not be able to grant roles.

3. Team members should not be able to grant privileged roles.

4. Operators should only manage assigned activities unless their role grants broader access.

5. Visitors should not read member-only or operator-only documents.

6. Gemini API key must not be present in client bundles or browser-exposed environment variables.

## Out Of Scope

The following are intentionally out of scope for the first Saturday demo:

1. Full Discord bot publishing.

2. Full gdg.community.dev participant import.

3. GitHub contribution challenge automation.

4. Problem-solving platform integration.

5. Complete session attendance UI if Activity CRUD is not yet stable.

6. Full role-management console if basic role gating is enough for the demo.

7. Full showcase CMS if static/seeded showcases are enough for public depth.

8. Invite code system.

9. Dockerized production deployment.

10. AWS infrastructure.

11. Advanced motion graphics CMS.

12. Free-form community forum.

13. Complex rejected/absent state workflows.

14. Complete alumni lifecycle management beyond excluding alumni from active metrics.

15. Replacing Discord as the conversational community channel.

## Further Notes

### Reference Project Findings

PoolC informs two different parts of this product.

PoolC `/board` is the closest reference for the member-facing browsing rhythm:

- A member chooses a board-like category.
- The member scans a list.
- The member opens a detail page.
- The member writes only when the category and permissions make sense.
- Comments, scraps, and richer social interactions can be added later if the chapter needs them.

For GDGoC CNU, the first board-like categories should be notices, studies/projects, records, and activity details. This does not mean the first release should replace Discord with a general free-form discussion board.

The PoolC Palkia/Dialga reference supports the Activity/Session split:

- Palkia separates activity-level concepts from session-level attendance.
- Dialga exposes activity list/detail/form and session attendance flows.

This PRD adopts the same domain principle but does not copy implementation details directly. GDGoC CNU needs a broader public/member/operator homepage product, where the member dashboard is the primary logged-in experience and the operator console supports it.

### Open Questions

1. What exact visual direction should the first seasonal hero use for the Saturday demo?

2. Should the first deployment target be Vercel preview, Firebase App Hosting, or both?

3. Which member profile fields are required before a guest can be approved into member?

4. Should studies created by members publish immediately, or should they have a light review state?

5. What is the exact external registration shape for gdg.community.dev links and programs?

6. Should roles initially live only in Firestore, or should privileged roles also use Firebase custom claims after the prototype?

7. What is the minimum acceptable AI fallback when Gemini quota, network, or schema validation fails during the demo?

8. Which analytics cards must use real data in Phase 1, and which can use demo bridge data?

### Success Criteria

The Saturday demo succeeds if it shows:

1. A polished GDGoC CNU public homepage.

2. Google login through Firebase Auth.

3. An operator surface for Activity CRUD.

4. Gemini-assisted drafting in the activity creation flow.

5. Firestore persistence.

6. Member dashboard reflecting the newly created activity in a member-relevant section.

7. A credible path from prototype to operational chapter platform.
