# GDGoC CNU Homepage Context

## Domain Terms

- **Activity Hub**: The homepage product surface that gathers chapter notices, activities, applications, records, showcases, and lightweight participation state.
- **Activity Participation Snapshot**: The loaded, activity-indexed participation view for operator surfaces and analytics. It centralizes application lists, default session sync, session attendance loading, attendance summaries, and flat analytics inputs for a set of activities.
- **Activity Schedule Module**: The domain module that interprets an activity's schedule, derives the prototype default session window, and answers upcoming/recent-ended schedule questions for operations and analytics.
- **Data Adapter Split**: The adapter selection rule that keeps local demo seed data separate from production Firestore reads. Production Firestore adapters return persisted documents only; demo depth comes from local demo storage or explicit seed actions.
- **Firestore Mutation Seam**: The server-owned write path for sensitive Firestore changes. Clients send mutation intent, while actor identity, role policy, document writes, and audit logs stay behind the seam.
- **Member Home**: The logged-in chapter surface where approved members and alumni scan what is happening now.
- **Member Home Snapshot**: The loaded, role-aware view model for Member Home. It centralizes content-role selection, visible home content, member application state, participation counts, and activity section grouping before the React screen renders it.

## Constraints

- Member Home shows member-level content to alumni and operator roles, but it does not expose operator-only content there.
- Alumni can read member content but cannot apply to activities.
- Activity Participation Snapshot may synchronize default sessions while loading participation state, because the current prototype derives a default two-hour session from scheduled activities.
- Activity Schedule Module owns the current prototype rule that a scheduled activity derives one default two-hour session from `startsAt`.
- Production Firestore adapters must not substitute seed data when a collection is empty.
- Role changes and guest approvals must go through the Firestore Mutation Seam when Firebase is configured; client-side direct role document edits are reserved only for local demo storage.
- Discord remains the live conversation channel; this product is the source of truth for structured chapter activity.
