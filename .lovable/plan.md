# Plan: Native push, private avatars, Run-Now, polish pass

This is a large scope. I'll deliver it in clearly scoped phases so you can stop me between any of them.

---

## Phase 1 — "Run Now" button (small, ships immediately)

- Add a **Run Now** button to `NotificationsSettings.tsx` that calls `send-scheduled-notifications` with the service-role key.
- Since the service-role key must NOT live in the browser, I'll add a thin authenticated edge function `trigger-checkin-now` that:
  - Verifies the caller's JWT
  - Server-side invokes `send-scheduled-notifications` with the service-role secret
  - Forces delivery to **only the calling user** (override the hourly window check)
- Toast shows result (`X notifications dispatched` / error).

---

## Phase 2 — Private avatars + signed URLs

Migration:
- Flip `avatars` bucket `public = false`.
- Replace public-read policy with: authenticated users may read any avatar object (community feeds need to display them); only owners may insert/update/delete their own folder.

Code changes:
- New helper `src/lib/avatarUrl.ts` → `getSignedAvatarUrl(path, ttl=3600)` with in-memory LRU cache.
- New hook `useAvatarUrl(path)` returning a signed URL, refreshing before expiry.
- Replace every `getPublicUrl('avatars', …)` / direct `avatar_url` usage. Touched files (will re-grep before editing): `Profile.tsx`, `Community.tsx`, `ForumPostDetail.tsx`, `AccountabilityPartners.tsx`, `BottomNav.tsx`, `AppReviews.tsx`, `ShareJourney.tsx`, anywhere else `avatar_url` is read.
- Mark the linter "public bucket" finding as fixed; update security memory.

Trade-off you accepted: every avatar render now waits on a signed-URL request (cached for 55 min). Slight latency and more client code.

---

## Phase 3 — Native FCM (Android) + APNs (iOS) push

### Secrets you'll need to provide
1. **`FCM_SERVICE_ACCOUNT_JSON`** — full Firebase service account JSON (from Firebase Console → Project Settings → Service Accounts → Generate new private key).
2. **`APNS_AUTH_KEY_P8`** — contents of your `.p8` file (from Apple Developer → Keys).
3. **`APNS_KEY_ID`** — 10-char key ID.
4. **`APNS_TEAM_ID`** — 10-char Apple team ID.
5. **`APNS_BUNDLE_ID`** — e.g. `app.lovable.e67e4c3e112141a298bae8d6f113f820`.
6. **`APNS_USE_SANDBOX`** — `true` for TestFlight/dev, `false` for App Store.

I'll request these via the secrets tool **after you approve this plan** (and won't proceed past Phase 3 until they're added).

### Database
- New table `device_tokens(user_id, platform 'ios'|'android'|'web', token unique, created_at, last_seen_at)` with owner-scoped RLS. The existing `push_subscriptions` table stays for web push.

### Edge function `send-push` (new)
- Accepts `{ user_ids[], title, body, data? }` from internal callers (service-role only).
- Looks up `device_tokens` per user.
- For Android: signs a Google OAuth2 token from the service account JWT, POSTs to FCM HTTP v1 (`https://fcm.googleapis.com/v1/projects/<id>/messages:send`).
- For iOS: builds an APNs JWT (ES256) from the .p8, POSTs to `api.push.apple.com` (or sandbox) with `:authority`/headers.
- For web: existing VAPID path.
- Removes invalid tokens on `404`/`410`/`Unregistered`.

### Hourly cron + Run-Now
- `send-scheduled-notifications` is updated to call `send-push` instead of the placeholder logger.

### Client (Capacitor)
- `useNativePushNotifications` already exists; I'll fix it to write to the new `device_tokens` table with the correct `platform` and to register an APNs token on iOS too.
- Settings → Notifications page gains a **"Native delivery status"** card: shows platform detected, registration state, last token tail (last 8 chars), and a **Re-register** button.

### What you must do locally
After Phase 3 ships you'll need to:
1. `git pull` your repo
2. `bun install`
3. `npx cap sync`
4. For iOS: open Xcode, enable **Push Notifications** + **Background Modes → Remote notifications** capability, then run on device.
5. For Android: drop your `google-services.json` into `android/app/`.

I cannot do those native steps from inside Lovable.

---

## Phase 4 — Whole-app polish pass

I'll audit and report back **before** mass-editing. Scope:
- Loading states / skeletons on every data-fetching page.
- Empty states with a CTA (Journal, Community, Partners, Spending, Triggers, Coping Strategies, etc.).
- Error toasts on every `await supabase…` mutation.
- Accessibility: `aria-label`s on icon-only buttons, focus rings, alt text.
- Mobile spacing under the bubble bottom nav (`pb-24` consistency).
- Dead routes / broken links sweep.
- SEO tags (`<title>`, meta description, single H1) on each page.

Deliverable for Phase 4 step 1: a checklist comment in chat. Then I implement what you green-light.

---

## Order of execution
1. Phase 1 (ships in this turn)
2. Phase 2 migration + code (this turn)
3. Phase 3 — request secrets, then build (next turn after you add them)
4. Phase 4 — audit report, then incremental fixes

## Technical notes
- APNs JWT and Google service-account JWT are both signed with `crypto.subtle` in Deno; no extra deps.
- `device_tokens.token` is unique; upserts handle re-registration cleanly.
- Service-role key is never sent to the browser; `trigger-checkin-now` is the only user-facing entry point.
- Migration also revokes `EXECUTE` on `notify_required_update` from `anon`/`authenticated` (defense in depth for SECURITY DEFINER).

Approve and I'll start with Phases 1 + 2 immediately.