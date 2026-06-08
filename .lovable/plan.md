# Recovery Cooler — Major Feature Pass

This is a large request covering 7 areas. Here is the plan, grouped by feature. I will ship them in this order and check the build between groups.

## 1. Onboarding tutorial (Breathing • Journaling • Cooldown)
- Add a new `/onboarding/tutorial` flow with 4 slides:
  1. Welcome + what RecoveryCooler does
  2. Breathing — animated bubble + "Try a 30-sec breath" CTA
  3. Journaling — show example entry + "Skip / Try it" buttons
  4. Cooldown — explain urge surfing, big "Start Cooldown" CTA
- Skip / Next / Back controls, dots progress, swipeable on mobile.
- After last slide → `/home`. Store `tutorial_completed` flag in `profiles` so we don't show again.

## 2. Weekly Progress Dashboard
- New route `/progress/weekly` (also a card on `/progress`).
- Summarizes the last 7 / 30 days:
  - Cooldown sessions count (from `session_logs`)
  - Meditation minutes (new `meditation_sessions` table)
  - Goal adherence % (check-ins completed vs scheduled)
  - Current streak / longest streak
- Charts via existing `recharts` (bar + line).

## 3. Journaling screen
- The `Journal.tsx` page already exists. Polish:
  - Daily prompt of the day
  - Mood slider, gratitude field, free-form reflection
  - Save to existing `journal_entries` table
  - List of past entries with date filter

## 4. Push notifications (spending + time reminders)
- Use existing web-push + native FCM/APNs hook.
- New `notification_schedules` rows for:
  - Spending-limit alerts (triggers when daily total > limit)
  - Time reminders (user-set HH:MM)
- Edge function `send-scheduled-notifications` already exists — extend it to handle these two types and schedule via pg_cron every 5 min.

## 5. Self-exclusion lockout
- Extend `self_exclusion_domains` purpose: add a new table `self_exclusion_periods` (start, end, reason).
- New page `/exclusion/setup` to pick duration (24h, 7d, 30d, 90d, custom).
- `<ExclusionGate>` wrapper checks for active period and renders a full-screen lockout (countdown + crisis resources + "Call helpline" button). Cannot be bypassed except by waiting; emergency contact always available.

## 6. Meditation soundtracks
- Add a **Recovery Cooler Originals** section in `/meditation` with all 10 tracks (Spirit, One More Day, A New Chapter, Broken No More, I Choose Life, Scars Into Strength, Freedom From Chains, Rise Again, Road Back Home, Still Standing).
- Each track embedded via YouTube IFrame (lazy-loaded) with cover art, title, play button.
- Visual upgrade to existing meditation cards: gradient covers, duration, "Now playing" state, looped background option.

## 7. Share My Recovery Journey
- New table `public_journeys`:
  - `user_id`, `slug` (unique, default = username or random), `is_public`, `nickname`, `story`, `show_avatar`, `show_streak`, `show_milestones`, `show_achievements`
- New public route `/journey/:slug` (no auth required, public RLS read on `public_journeys` where `is_public = true`).
  - Shows: avatar (signed URL OK), nickname, days-sober counter, milestones, story, public achievements, rotating inspirational quote.
- New `/profile/share` settings page: toggle public, edit slug, edit story, pick what to show.
- Share button (existing `ShareJourney` component) updated to use `https://recoverycooler.lovable.app/journey/{slug}` with WhatsApp / Facebook / X / Copy.
- URLs are slug-based so a custom domain can be swapped in later with zero link changes.

## Database migrations (one batch)
- `ALTER profiles ADD tutorial_completed boolean default false`
- `CREATE TABLE meditation_sessions`
- `CREATE TABLE self_exclusion_periods`
- `CREATE TABLE public_journeys` + anon SELECT policy for `is_public = true`
- `ALTER notification_preferences` add `spending_alerts`, `time_reminder_enabled`, `time_reminder_at`

All tables get the required GRANTs + RLS + policies.

## Technical notes
- Reuse existing components (`Card`, `Button`, `Slider`, `BottomNav`, `useHapticFeedback`).
- No design-token violations — semantic colors only.
- Avatars stay private; public journey uses signed URLs refreshed server-side via an edge function `get-public-journey`.
- No third-party deps added — YouTube via iframe.
- Estimated ~20 new/edited files plus 1 SQL migration.

Reply **approve** and I'll start with the migration, then ship the features in the order above.
