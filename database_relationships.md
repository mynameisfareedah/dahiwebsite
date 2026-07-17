# Database Relationships & ER Overview

Entities and Relationships

- `events` (created_by -> auth.users.id)
- `resources` (created_by -> auth.users.id)
- `team_members` (created_by -> auth.users.id)
- `messages` (no FK to users by design)
- `volunteers` (created_by -> auth.users.id)
- `sponsors` (created_by -> auth.users.id)
- `community_members` (no FK to users)
- `settings` (created_by -> auth.users.id)

Notes:
- Most admin-created content stores `created_by` referencing `auth.users(id)` to track ownership.
- Public-facing reads are gated via RLS policies.
- No cross-table foreign keys are required for current schema; if future relations are needed (e.g., event_attendees table referencing events and community_members), add migrations with FK constraints.

ER Diagram (textual)

[events] 1---* [event_attendees] *---1 [community_members] (future)
[resources] standalone
[team_members] standalone
[messages] standalone
[volunteers] standalone
[sponsors] standalone
[settings] key/value store

Recommendation: Create `event_attendees` join table in a future migration to store signup references.
