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
- Keep gym invoice records in the existing transaction snapshots and archive deletions; retained numbered records preserve the per-gym sequence while database guards prevent duplicate or changed numbers. Trainer schedules use optional weekly rows so legacy trainer details remain compatible.
- Keep platform expenses, gym-scoped prototype invitations and workout assignment snapshots in the existing demo store, and session client selections keyed by gym; this preserves local persistence without granting Cloud access or mixing platform and gym finances.
- Preserve the existing TanStack routes and UI kit; extend the existing store with authenticated Cloud persistence to avoid replacing working screens.
- Store gym records under a gym ID with permission-enforced access; keep account profiles, gym role associations, invitations and approval requests in separate tables so editable profile data never grants access.
- Real authentication uses provider password auth without OTP; `otp_verified()` remains an authenticated-session compatibility shim so existing RLS policies stay intact.
- Prototype login uses isolated local demo sessions selected by destination, never provider authentication or account lookup; display preferences exclude passwords so fictional access cannot grant Cloud permissions.
- Demo member identities are normalized from display email; gym snapshots are keyed by gym, and accepted staff roles and personal programs live in the demo store to preserve associations without granting Cloud access.

- Gym-record writes compare the exact previously read snapshot under a transaction lock before replacement; return canonical saved rows to prevent lost updates and preserve server-set subscription history.
