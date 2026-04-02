# ECHO — Project Structure

A quick reference for what every folder does and where to make changes.

---

## Top-Level Layout

```
ECHO/
├── src/            ← All app source code (front-end)
├── supabase/       ← Server-side code (back-end)
├── assets/         ← Images: app icon, splash screen
├── docs/           ← Product & engineering documents
├── scripts/        ← Dev utilities, not shipped in the app
├── __tests__/      ← Automated tests (mirrors src/ structure)
└── __mocks__/      ← Fake modules used by tests
```

---

## Front-End (`src/`)

```
src/
│
│  ── SCREENS ───────────────────────────────────────────────
├── screens/
│   ├── daily/          What the user sees every day:
│   │                     EmojiPicker → WordInput → Breathing → Completion
│   │
│   ├── onboarding/     First-time setup (8 screens):
│   │                     Welcome → Explain → Notifications → Reminder → Practice check-in → Done
│   │
│   ├── reflection/     Weekly review screens:
│   │                     ReflectionCard (AI summary) + CrisisCard (support resources)
│   │
│   ├── paywall/        Premium upgrade screen
│   └── settings/       Settings + About
│
│  ── UI BUILDING BLOCKS ─────────────────────────────────────
├── components/         Reusable UI pieces used across screens:
│                         EmojiCircle, BreathingAnimation, WeatherAvatar,
│                         FadeOverlay, GlassCard
│
│  ── NAVIGATION ─────────────────────────────────────────────
├── navigation/         How screens connect to each other:
│                         RootNavigator (decides onboarding vs main)
│                         MainNavigator (daily loop + reflection + settings)
│                         OnboardingNavigator (8-screen onboarding flow)
│
│  ── STATE ──────────────────────────────────────────────────
├── state/              Global app state shared across all screens:
│                         AppContext.tsx — what the whole app knows (is ready? is premium? timer?)
│                         bootstrap.ts  — startup logic (DB init, settings load)
│
│  ── LOGIC ──────────────────────────────────────────────────
├── services/           Business logic that screens call into:
│                         timer.ts          — 3-minute session hard cap
│                         notifications.ts  — daily + Sunday reminder scheduling
│                         reflection.ts     — sends weekly data to Supabase, gets AI summary back
│                         purchases.ts      — RevenueCat in-app purchase integration
│                         contentFilter.ts  — screens AI output for prohibited content
│                         crisisDetector.ts — detects if a reflection should show crisis resources
│
├── hooks/              Reusable React logic that screens/components plug into:
│                         useTimer            — tracks seconds remaining in a session
│                         useEntitlements     — is the user free or premium?
│                         useNotificationResponse — handles tapping a push notification
│
│  ── DATA ───────────────────────────────────────────────────
├── database/           Local SQLite storage (stays on device):
│                         database.ts    — opens DB, creates tables, settings CRUD
│                         entries.ts     — save/read daily mood check-ins
│                         reflections.ts — save/read weekly AI reflections
│
├── constants/          Static values used all over the app:
│                         theme.ts      — colors, font sizes, spacing, border radii
│                         copy.ts       — every user-facing string (no hardcoded text in screens)
│                         emojis.ts     — the 5-level mood emoji scale
│                         avatars.ts    — 9 weather avatar states with gradient colors
│                         crisis.ts     — crisis helpline numbers by locale
│                         prohibited.ts — words the AI output filter blocks
│
│  ── SHARED UTILITIES ────────────────────────────────────────
├── types/              TypeScript type definitions:
│                         navigation.ts — screen param types for React Navigation
│                         entry.ts      — shape of a mood entry
│                         reflection.ts — shape of a weekly reflection
│
├── utils/              Small helper functions:
│                         dateHelpers.ts — week start/end, formatting
│                         validators.ts  — word length, input checks
│                         closeApp.ts    — platform-safe app exit
│
│  ── ENTRY ──────────────────────────────────────────────────
├── AppRoot.tsx         Root component: wraps everything in AppProvider + NavigationContainer
└── config.ts           Reads runtime env vars from app.config.ts (Supabase URL, RevenueCat keys, etc.)
```

---

## Back-End (`supabase/`)

```
supabase/
└── functions/
    └── weekly-reflection/
        └── index.ts    Server-side Edge Function (runs on Supabase, not the user's phone):
                          1. Receives anonymized weekly entries from the app
                          2. Calls OpenAI to generate a 3-sentence reflection
                          3. Returns the reflection + a weather avatar key
                          Note: OPENAI_API_KEY lives here only — never in the app
```

---

## Config Files (Root)

| File | What it does |
|------|-------------|
| `App.tsx` | Entry point — initializes Sentry, mounts AppRoot |
| `index.ts` | Registers App with Expo |
| `app.config.ts` | Expo config: injects env vars, Sentry plugin |
| `app.json` | Expo base manifest: bundle ID, version, icon paths |
| `eas.json` | EAS build profiles (development / preview / production) |
| `tsconfig.json` | TypeScript compiler settings |
| `.env` | Local secrets — never committed |
| `.env.example` | Template showing which env vars are needed |

---

## Where to Make Common Changes

| What you want to change | Where to look |
|------------------------|---------------|
| Screen layout or copy | `src/screens/<flow>/` |
| Reusable button/card/animation | `src/components/` |
| Any user-facing text | `src/constants/copy.ts` |
| Colors, font sizes, spacing | `src/constants/theme.ts` |
| How screens link together | `src/navigation/` |
| Daily 3-minute timer | `src/services/timer.ts` |
| Push notifications | `src/services/notifications.ts` |
| AI reflection logic | `src/services/reflection.ts` + `supabase/functions/weekly-reflection/` |
| Paywall / purchases | `src/services/purchases.ts` + `src/screens/paywall/` |
| What gets stored locally | `src/database/` |
| Global app state | `src/state/AppContext.tsx` |
| App icon / splash | `assets/` + `app.json` |
| CI/CD pipelines | `.github/workflows/` |
