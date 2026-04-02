# ECHO — Deployment Runbook

This document is the single source of truth for shipping ECHO to the App Store and Google Play.

---

## Prerequisites Checklist

Complete every item before triggering an EAS production build.

### Accounts
- [ ] Apple Developer Program account ($99/yr) — developer.apple.com
- [ ] Google Play Developer account ($25 one-time) — play.google.com/console
- [ ] Expo / EAS account — expo.dev
- [ ] RevenueCat account — revenuecat.com
- [ ] Sentry account (optional but recommended) — sentry.io

### Credentials & Keys
- [ ] `EXPO_PUBLIC_REVENUECAT_IOS_KEY` — set in `.env`
- [ ] `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` — set in `.env`
- [ ] `EXPO_PUBLIC_SENTRY_DSN` — set in `.env` (optional)
- [ ] `EXPO_PUBLIC_PRIVACY_POLICY_URL` — set in `.env` (must be a live URL)
- [ ] `google-service-account.json` — placed at repo root (gitignored, never commit)
- [ ] EAS credentials configured: `eas credentials` for iOS; Play Console key for Android

### App Store Connect (iOS)
- [ ] App created in App Store Connect (Bundle ID: `com.echo.mood`)
- [ ] App name, subtitle, description, keywords filled
- [ ] Screenshots prepared: 6.7" iPhone, 6.1" iPhone (minimum)
- [ ] Privacy policy URL live and accessible
- [ ] Age rating completed (likely 4+)
- [ ] `appleId`, `ascAppId`, `appleTeamId` filled in `eas.json` → `submit.production.ios`

### Google Play Console (Android)
- [ ] App created in Play Console (package: `com.echo.mood`)
- [ ] App name, short description, full description filled
- [ ] Screenshots prepared: phone (16:9 ratio, minimum 2)
- [ ] Feature graphic prepared (1024×500px)
- [ ] Privacy policy URL live and accessible
- [ ] Content rating questionnaire completed
- [ ] `google-service-account.json` created with Release Manager role
- [ ] Path verified in `eas.json` → `submit.production.android.serviceAccountKeyPath`

### RevenueCat Setup
- [ ] iOS app created in RevenueCat dashboard
- [ ] Android app created in RevenueCat dashboard
- [ ] Products created in App Store Connect:
  - `echo_premium_monthly` — subscription ($4.99/mo)
  - `echo_premium_yearly` — subscription ($29.99/yr)
- [ ] Products created in Google Play Console (same IDs)
- [ ] Offerings configured in RevenueCat → reference the two products above
- [ ] Entitlement `premium` created and linked to both products

---

## Step-by-Step Release Process

### 1. Final verification locally

```bash
npm run verify          # typecheck + all tests must pass
```

If anything fails, fix before proceeding.

### 2. Update CHANGELOG.md

Move items from `[Unreleased]` to a new version block (e.g., `[1.0.0] — 2026-XX-XX`).

### 3. Update version (if needed)

Edit `app.json` → `version` for a marketing version change.
EAS `production` profile auto-increments the build number.

### 4. Commit and tag

```bash
git add -A
git commit -m "chore: release v1.0.0"
git tag v1.0.0
git push origin main --tags
```

Pushing a `v*` tag automatically triggers the **EAS Build** GitHub Actions workflow.

### 5. Monitor the build

- Go to expo.dev → your project → Builds
- Or watch the GitHub Actions run
- iOS build takes ~20 min; Android ~15 min

### 6. Submit to stores

After builds complete:

```bash
# Submit iOS
eas submit --platform ios --profile production

# Submit Android
eas submit --platform android --profile production
```

Or use `eas submit --platform all --profile production` for both.

### 7. Store review

- **App Store:** review typically 1–3 days; expedited review available for critical bugs
- **Google Play:** review typically 1–3 hours for updates, longer for first submission

### 8. After approval

- Verify the live build on a real device
- Tag the release in GitHub if not already done
- Update CHANGELOG.md with the release date

---

## Staging Release (Pre-Production Testing)

Use the `staging` EAS profile for internal distribution before a production build:

```bash
eas build --platform all --profile staging
```

Distribute via EAS internal distribution to your test devices. Verify:
- Notification tap routing (cold start + foreground)
- Breathing animation on real device
- Weekly reflection trigger (force a Sunday date for testing)
- RevenueCat purchase flow (use sandbox accounts)
- App closes after 3 minutes

---

## Hotfix Process

For urgent production bugs:

1. Branch off the release tag: `git checkout -b hotfix/1.0.1 v1.0.0`
2. Fix and test: `npm run verify`
3. Update `CHANGELOG.md` with patch version notes
4. Merge to `main` and tag: `git tag v1.0.1`
5. Push tag → triggers automated EAS production build
6. Submit via `eas submit`

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_EDGE_FUNCTION_URL` | Yes | Supabase Edge Function URL for AI relay |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | Yes (iOS) | RevenueCat public key for iOS |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` | Yes (Android) | RevenueCat public key for Android |
| `EXPO_PUBLIC_PRIVACY_POLICY_URL` | Yes | Live URL to privacy policy page |
| `EXPO_PUBLIC_SENTRY_DSN` | No | Sentry DSN; leave empty to disable crash reporting |
| `SENTRY_ORG` | No | For native sourcemap uploads during build |
| `SENTRY_PROJECT` | No | For native sourcemap uploads during build |
| `SENTRY_AUTH_TOKEN` | No | For native sourcemap uploads during build |

All `EXPO_PUBLIC_*` vars are bundled into the client app. Never put secrets in them.

---

## GitHub Actions Secrets Required

Set these in GitHub → Settings → Secrets and variables → Actions:

| Secret | Description |
|---|---|
| `EXPO_TOKEN` | EAS personal access token from expo.dev |

---

## Known Risks at Launch

| Risk | Mitigation |
|---|---|
| RevenueCat entitlements not verified on real device | Test on physical device with sandbox account before launch |
| Notification permissions on iOS first launch | Covered in onboarding flow; monitor Sentry for permission errors |
| 3-min hard cap relies on AppContext state | Test complete session manually on both platforms |
| Crisis detection is client-side only | Edge Function returns `crisis: true`; client falls back to CrisisCardScreen |
| No data backup | Document clearly in App Store description; planned for v2 |
