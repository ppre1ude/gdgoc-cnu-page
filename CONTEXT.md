# GDGoC CNU Homepage Context

## Domain Terms

- **CNU**: Chonnam National University, 전남대학교. This project must not describe CNU as Chungnam National University, 충남대학교, or 충남대.
- **GDGoC CNU Onboarding Values**: The public onboarding message system for 전남대학교 students seeing GDGoC CNU for the first time. Goal: impact students and empower them to impact their communities through technology. Values: Connect / Learn / Grow. Roles: host workshops and build projects. Benefits: professional growth, network growth, and community learning.
- **Activity Hub**: The whole homepage product that combines the public showcase, member-facing dashboard, and operator console around structured chapter activity.
- **Activity Participation Snapshot**: The loaded, activity-indexed participation view for operator surfaces and analytics. It centralizes application lists, default session sync, session attendance loading, attendance summaries, and flat analytics inputs for a set of activities.
- **Activity Schedule Module**: The domain module that interprets an activity's schedule, derives the prototype default session window, and answers upcoming/recent-ended schedule questions for operations and analytics.
- **Data Adapter Split**: The adapter selection rule that keeps local demo seed data separate from production Firestore reads. Production Firestore adapters return persisted documents only; demo depth comes from local demo storage or explicit seed actions.
- **Firestore Mutation Seam**: The server-owned write path for sensitive Firestore changes. Clients send mutation intent, while actor identity, role policy, document writes, and audit logs stay behind the seam.
- **Member Dashboard**: The member-facing logged-in product surface where approved members scan schedules, important notices, open studies/projects, available applications, and their own upcoming commitments.
- **Member Dashboard Hub**: The IA center for logged-in members. It is not just a page with widgets; it is the routing hub that answers "what should I check or do next?" and then sends members to Calendar, Notices, Studies, Projects, Records, or a specific activity detail.
- **Member Calendar**: The member-facing schedule view of upcoming activities and sessions. It answers "what is happening next?" before exposing operator analytics or management state.
- **Member Home**: The current route/screen name for the Member Dashboard. The route may remain `/member`, but product decisions should treat it as the member dashboard, not an operator dashboard.
- **Member Home Snapshot**: The loaded, role-aware view model for Member Home. It centralizes content-role selection, visible home content, member application state, participation counts, calendar summary, important notices, open study/project sections, and activity grouping before the React screen renders it.
- **Member Top Navigation**: The PoolC-inspired member navigation model. It should expose first-class member destinations such as Dashboard, Calendar, Notices, Studies, Projects, Records, and Admin only when the role can operate the chapter.
- **Notice Board**: The board-like member surface for official announcements. Notices are read-first, pinnable, and separate from participation targets.
- **Operator Console**: The team-member/admin surface for creating, approving, publishing, assigning, and analyzing chapter activity. It supports the Member Dashboard but is not the member product.
- **Study Board**: The board-like member surface for discovering active or recruiting studies, seeing status, and applying or proposing where permitted.
- **Project Board**: The board-like member surface for discovering active or recruiting projects, seeing status, and applying or proposing where permitted.
- **Korean Copy Catalog**: The shared copy module for Korean-first logged-in surfaces. It keeps role/access, Member Home, admin navigation, and operator error messages in one UTF-8-safe place.
- **Role And Access Policy Module**: The domain module that classifies chapter roles, maps them to content visibility, and answers shared access questions for navigation, member home, production adapters, operator workflows, and analytics.

## Constraints

- Member Home shows member-level content to alumni and operator roles, but it does not expose operator-only content there.
- Member Dashboard is the presentation center and routing hub for approved members. It must prioritize calendar, pinned notices, open studies/projects, available applications, and my commitments before member authoring tools or operator concerns.
- Member-facing top navigation should make the Dashboard the trunk route, then expose Calendar, Notices, Studies, Projects, and Records as first-class branches. Admin appears only for team-member/operator/admin roles.
- Calendar is not the center of the product. It is a focused branch for schedule depth; the Dashboard remains the place where schedule, notices, study/project opportunities, and personal commitments come together.
- Studies and Projects may share implementation modules, but the member IA should allow them to become separate top-level destinations so long-running work does not get buried under generic activity language.
- Alumni can read member content but cannot apply to activities.
- Operator Console responsibilities must not leak into the primary member flow. Activity creation, approval, attendance management, role management, and analytics belong to team-member/admin surfaces.
- Activity Participation Snapshot may synchronize default sessions while loading participation state, because the current prototype derives a default two-hour session from scheduled activities.
- Activity Schedule Module owns the current prototype rule that a scheduled activity derives one default two-hour session from `startsAt`.
- Production Firestore adapters must not substitute seed data when a collection is empty.
- Role changes and guest approvals must go through the Firestore Mutation Seam when Firebase is configured; client-side direct role document edits are reserved only for local demo storage.
- Korean-first logged-in copy should move through the Korean Copy Catalog when it is shared across role/access, Member Home, admin navigation, or operator feedback surfaces.
- Role And Access Policy Module is the TypeScript source of truth for role classification and content visibility. Firestore rules enforce the same cases independently and must stay aligned through rules tests.
- Discord remains the live conversation channel; this product is the source of truth for structured chapter activity.
- PoolC `/board` is a reference for member browsing rhythm and board-like category flow: list, detail, write where appropriate, comments/scraps later if needed. It is not a mandate to replace Discord with a free-form chat board in the first slice.
- Public onboarding must lead with GDGoC CNU as a trusted 전남대학교 student developer community connected to the Google Developers ecosystem.
- Build with AI is a seasonal campaign and activity example, not the permanent identity of GDGoC CNU.
