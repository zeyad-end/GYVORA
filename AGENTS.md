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
- Preserve the existing TanStack routes and UI kit; extend the existing store with authenticated Cloud persistence to avoid replacing working screens.
- Store gym records under a gym ID with permission-enforced access; keep account profiles, gym role associations, invitations and approval requests in separate tables so editable profile data never grants access.
- Enforce OTP session claims and approval in database authorization helpers, not browser flags, so direct requests cannot bypass access gates.
