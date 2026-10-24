<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Application architecture
- Persisted staff page names grant read access and page:create/edit/delete grant independent actions in existing invitation/role permission arrays; database record triggers enforce actions, and member gym discovery includes owner-added memberships without manual directory links.
- Gym lifecycle uses retained tombstones and a shared database entitlement predicate; dedicated owners are provider-banned after durable access revocation, while shared owners and membership history are preserved.
- Local demo login remains destination-based without a login-mode selector; Cloud admin controls and contacts read durable shared records, while local lifecycle controls never mutate Cloud accounts.
- Existing-client memberships reuse gym_records/client_id and historical snapshots; database uniqueness and owner/approved-gym guards enforce linking, while client-owned directory links never grant access. Shared summaries expose only gym approval/plan, never billing credentials or receipts. Client portal path exceptions match /member or /member/ exactly, not /members or /memberships.
- Shared app branding uses a reusable component backed by uploaded CDN asset pointers; gym identity and legacy storage/QR namespaces stay separate to preserve user records and permanent codes.
- Super Admin plans, dates, notes, prices and branding extend existing prototype snapshots; assigning a plan copies its stable ID, billing type, duration and agreed prices into the gym, so catalog edits cannot change agreements. Projected billing uses saved billing types and anchored dates, with plan duration end dates exclusive, never payment receipts. Provider identities are read from authenticated accounts without substituting social sign-in for linking or fabricating demo connections.
- Both owner trainer views read the same gym-scoped store and persistence pipeline; optional notes and shared photo fallbacks avoid duplicate records. Trainer profile mutations merge validated fields by trainer ID and retain previous names for workout lookup; program/assignment attribution remains a historical name snapshot, so renames preserve associations without rewriting creators.
- Gym event history is appended from demo snapshot differences and Cloud record/invitation triggers; owner-only notification reads and per-user read/dismiss state stay separate from underlying gym records so notification actions cannot alter them.
- Owner personal settings use account-scoped demo profile overrides or authenticated provider updates, while gym branding reads only the saved gym snapshot; shared calendar-date filtering keeps attendance, sessions and Finance-based dashboard expenses consistent.
- Product sales reuse gym product snapshots: stable IDs identify edits, stock-only forms preserve `sales`, sales controls change `qty` by the sold delta, totals are derived, and transition validation blocks insufficient stock and deletion of recorded sales.
- Keep gym invoice records in the existing transaction snapshots and archive deletions; retained numbered records preserve the per-gym sequence while database guards prevent duplicate or changed numbers. Trainer schedules use optional weekly rows so legacy trainer details remain compatible.
- Keep platform expenses, gym-scoped prototype invitations and workout assignment snapshots in the existing demo store, and session client selections keyed by gym; this preserves local persistence without granting Cloud access or mixing platform and gym finances.
- Preserve the existing TanStack routes and UI kit; extend the existing store with authenticated Cloud persistence to avoid replacing working screens.
- Store gym records under a gym ID with permission-enforced access; keep account profiles, gym role associations, invitations and approval requests in separate tables so editable profile data never grants access.
- Real authentication uses provider password auth without OTP; `otp_verified()` remains an authenticated-session compatibility shim so existing RLS policies stay intact.
- Prototype login uses isolated local demo sessions selected by destination, never provider authentication or account lookup; display preferences exclude passwords so fictional access cannot grant Cloud permissions.
- Demo member identities are normalized from display email; gym snapshots are keyed by gym, and accepted staff roles and personal programs live in the demo store to preserve associations without granting Cloud access.

- Gym-record writes compare the exact previously read snapshot under a transaction lock before replacement; return canonical saved rows to prevent lost updates and preserve server-set subscription history.
- Client gym joins and favorites are separate from paid memberships and staff roles; client-facing reads project only public gym details, while immutable membership snapshots retain history independently of gym associations.
- Platform request notifications derive only from submitted requests, with per-admin read state; Cloud inserts fan out through an owner-request trigger and recipient/admin RLS, while prototype profiles use stable session keys and never update provider credentials.
