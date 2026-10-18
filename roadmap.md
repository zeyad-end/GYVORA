# IronHaus update
- [x] Add Cloud schema, gym isolation, account profiles, password sign-in and owner approvals.
- [x] Connect gym data and requested editing flows to persisted records.
- [x] Add staff invitation records, management and attendance.
- [x] Add client attendance, subscription history, personal workouts and settings.
- [x] Check compilation, regression tests and signed-out access; document remaining setup in DELIVERY.md.
- [ ] Wire and verify invitation email delivery — blocked by missing owned sender domain.
- [ ] Verify authenticated workflows — blocked by no real account yet.
- [ ] Provision and verify super administrator approvals — blocked by missing administrator identity.
- [x] Remove phone authentication; phone fields are contact information only.

- [x] Remove OTP from sign-up and sign-in; route by account type.
- [x] Demo account registry (Gym Account / Individual / Dashboard) persisted in localStorage; Skip grants demo owner access.
- [x] Replace prototype login with immediate selected-destination demo access, restore preferences and verify all three destinations.
