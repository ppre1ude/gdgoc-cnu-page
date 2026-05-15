# GDGoC CNU Homepage Context

## Domain Terms

- **Activity Hub**: The homepage product surface that gathers chapter notices, activities, applications, records, showcases, and lightweight participation state.
- **Member Home**: The logged-in chapter surface where approved members and alumni scan what is happening now.
- **Member Home Snapshot**: The loaded, role-aware view model for Member Home. It centralizes content-role selection, visible home content, member application state, participation counts, and activity section grouping before the React screen renders it.

## Constraints

- Member Home shows member-level content to alumni and operator roles, but it does not expose operator-only content there.
- Alumni can read member content but cannot apply to activities.
- Discord remains the live conversation channel; this product is the source of truth for structured chapter activity.
