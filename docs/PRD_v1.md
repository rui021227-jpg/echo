# Product Requirements Document
## [App Name TBD]
*Emoji. Word. Breath. Done.*

| Field | Value |
|---|---|
| **Version** | 1.0 — Draft |
| **Status** | For review — not final |
| **Product** | Daily mood check-in with AI weekly reflection |
| **Target users** | University students, age 18–25 |
| **v1 Scope** | English only. China localisation deferred. |
| **Build type** | Solo indie developer — vibe-coding first, hire for critical paths |
| **Date** | March 2026 |

---

## 1. Product Summary

### 1.1 One-Line Definition

A daily mood check-in app that comes to you — one emoji, one word, one optional breath — then closes itself in 3 minutes. Every Sunday, a 3-sentence AI reflection paired with a visual avatar summarises the week.

### 1.2 The Problem

University students aged 18–25 face among the highest rates of anxiety and burnout, yet they are the least likely demographic to seek support. Existing wellness apps either demand too much — journaling, CBT exercises, daily streaks — or return too little, such as mood charts no one reads. The structural failure is consistent: every competitor is designed to maximise time inside the app. This product is designed to minimise it.

### 1.3 The Solution

A notification arrives once a day. The user taps it, picks an emoji, types one word, optionally breathes for 60 seconds, and the app closes itself. The session is capped at 3 minutes by architecture. Every Sunday at 9:00 AM local time, an AI reads the week's data and returns exactly 3 sentences and a visual avatar representing the week's emotional texture. That is the complete product.

### 1.4 Core Design Pillars

- **Slumber, not failure** — missed days put the app to sleep. No streak breaks, no red markers, no guilt.
- **AI as mirror, not coach** — the weekly reflection describes patterns; it never advises, diagnoses, or scores.
- **The notification is the interface** — the daily ritual begins and resolves in the notification tray.
- **Radical minimalism** — every feature proposal must answer what it replaces. Nothing is added, only substituted.
- **On-device privacy** — raw entries never leave the device. Only an anonymised weekly summary is sent for AI processing.

---

## 2. Target Users

### 2.1 Primary Audience

University students aged 18–25. Digitally native. Emotionally aware but time-poor. Sceptical of apps demanding daily effort without clear payoff. Aware they should probably do something about stress or burnout but unwilling to commit to therapy, journaling, or meditation courses.

### 2.2 User Personas

| Persona | Context | Core frustration | What they need |
|---|---|---|---|
| **The Overwhelmed Student** — Aged 20, mid-semester | Finals pressure, five assignments, doom-scrolling at midnight. Tried Headspace twice. | Every wellness app feels like another task on the list. | Something that takes zero willpower. A 10-second tap and it is done. |
| **The Burnt-Out Graduate** — Aged 23, first job | Imposter syndrome, new city, tracking sleep and spending but not emotions. | Mood apps give charts, not insight. Data without meaning. | A weekly reflection that actually says something about the week. |
| **The Therapy-Curious** — Aged 22, on a waitlist | Knows she probably needs therapy. Three-month waitlist. Journaling feels too intense to start. | Nothing bridges the gap between 'I am fine' and getting professional help. | A low-pressure way to build emotional vocabulary before therapy begins. |

---

## 3. Core Loop — Daily Ritual

The loop is the product. Every feature decision must preserve it. It cannot be extended without explicit justification against the design pillars above.

| # | Step | What happens | Required? | Design note |
|---|---|---|---|---|
| 1 | **Notify** | Push notification arrives at user-set time. Tapping opens directly to the emoji screen with no home screen or loading. | Yes | Five rotating copy variants prevent a robotic feel. The notification is the UI — not a door to the UI. |
| 2 | **One emoji** | Five emoji states shown as large tappable circles, arranged dark to bright. Tap one. Entry is recorded immediately. | Yes | No numerical labels. No clinical scale language. Intentionally abstract — the user projects their own meaning. |
| 3 | **One word** | Text field, maximum 20 characters enforced. Placeholder: 'one word'. Keyboard appears immediately after emoji tap. | Yes — v1. Voice in v2. | Required because a single word gives the AI texture beyond the emoji alone. v2 replaces with voice mic tap — 5 seconds, no keyboard. |
| 4 | **60 seconds** | A soft breathing circle appears with label '60 seconds?' and a gentle skip link below. If taken, a quiet animation guides one breath cycle. | Optional. Never tracked. | No streak credit for completing. Skipping shows 'Rest counts too.' — not a blank. Not tracked in any metric. |
| 5 | **App closes** | After the breath step or skip, a quiet completion state shows for 3 seconds, then the app closes itself automatically. | **Always — non-negotiable** | 3-minute hard cap from notification tap to app close. No home screen. No 'while you are here'. This is an architectural commitment, not a setting. |

### 3.1 Missed Days — Slumber State

If the user does not check in on a given day, nothing happens. No red X. No missed-day counter. No re-engagement guilt notification. The calendar entry for that day is blank. The app is considered to be sleeping — not failing. The AI weekly reflection receives no data for that day and does not reference the absence critically.

### 3.2 3-Minute Hard Cap — Implementation Note

A timer begins at the moment the notification is tapped. At 180 seconds, regardless of which step the user is on, the app fades and closes. This is enforced in code, not UI. It is not a setting. It cannot be disabled. If vibe-coding this proves unreliable, budget $100–200 to hire a developer specifically for this feature — do not ship without it.

---

## 4. Weekly Sunday Reflection

Every Sunday at 9:00 AM local time a push notification arrives: 'Your week, reflected.' Tapping opens the reflection card — not the daily entry flow. This is the only screen with substantial visual content. It is the primary reason users return week after week and the primary driver of premium conversion.

### 4.1 Reflection Card Structure

- **Sentence 1 — What happened:** Factual. Specific. Mentions check-in count and notable words. No judgment.
- **Sentence 2 — A pattern:** One observation the AI noticed across the week. Curious tone, not prescriptive.
- **Sentence 3 — Small close:** A warm, grounded observation. Never advice. Ends softly.
- **Avatar:** One of 9 weather-state figures chosen by the AI based on the week's data and words. Displayed above the 3 sentences.

### 4.2 Avatar States — Full Map

| State | Key | Trigger logic | Visual character |
|---|---|---|---|
| Sunny | `sunny` | Average emoji score 4.5–5.0 | Bright, warm. Clear sky. v1: emoji. v2: illustrated figure. |
| Mostly sunny | `mostly_sunny` | Average score 3.8–4.4 | Warm, one or two clouds. |
| Cloudy | `cloudy` | Average score 3.0–3.7 | Neutral tone, soft diffuse cloud cover. |
| Overcast | `overcast` | Average score 2.5–2.9 | Muted, heavy sky. Still and quiet. |
| Rainy | `rainy` | Average score 2.0–2.4 | Rain lines. Soft — not dramatic. |
| Stormy | `stormy` | Average score 1.0–1.9. Crisis flag checked separately. | Dark sky. Crisis card replaces avatar if crisis=true. |
| Foggy | `foggy` | Low variance, mid-range scores. Words include 'numb', 'blank', 'meh'. | Soft mist. Gentle ambiguity. |
| Clearing | `clearing` | Score trend upward across the week — low Monday, higher by Friday or Sunday. | Clouds parting. Rising brightness. Hopeful. |
| Moonlit | `moonlit` | Three or more slumber days. AI reads the present entries as the story. | Quiet night sky. Resting, not failing. |

The avatar is chosen by the AI inside the JSON output — not calculated client-side — because the AI has access to the word data, which carries nuance that a score average alone does not. The client validates that the returned avatar key is within the allowed set and falls back to `cloudy` if not.

### 4.3 AI Call — Input Payload

The following anonymised payload is built on-device and sent to the Supabase Edge Function, which makes the OpenAI call server-side. No raw entry text is transmitted. No user identifier is included.

```json
{
  "week_start": "YYYY-MM-DD",
  "entries": [
    { "day": "Mon", "emoji_score": 3, "word": "tired",    "breath": false },
    { "day": "Wed", "emoji_score": 4, "word": "grateful", "breath": true  },
    { "day": "Thu", "emoji_score": 4, "word": "focused",  "breath": true  },
    { "day": "Fri", "emoji_score": 3, "word": "okay",     "breath": false },
    { "day": "Sun", "emoji_score": 3, "word": "calm",     "breath": true  }
  ],
  "entry_count": 5,
  "emoji_scale": "1=lowest 5=highest",
  "user_locale": "en"
}
```

### 4.4 System Prompt — Core Text

The following prompt is version-controlled and stable across all users. Changes require a prompt audit before deployment.

```
You are a warm, perceptive weekly reflection for a mood app.
Your reader is a university student aged 18-25.

Return ONLY this JSON and nothing else:
{
  "s1": "[What happened — factual, specific, no judgment]",
  "s2": "[One pattern noticed — gentle, curious, not prescriptive]",
  "s3": "[One small warm observation — ends the card softly]",
  "avatar": "[one of: sunny|mostly_sunny|cloudy|overcast|rainy|stormy|foggy|clearing|moonlit]"
}

HARD RULES:
- Each sentence is 15-25 words maximum
- Never use: 'you should', 'try to', 'I recommend', 'this suggests you have'
- Never diagnose, score, or label the week as good or bad
- Never mention the app, streaks, or missing days critically
- If 4+ entries score 1, add: "crisis": true to the JSON
- Raw JSON only — no markdown, no preamble, no explanation

TONE: a wise friend who pays close attention. Warm but never saccharine.
Not a therapist. Not a coach. A mirror.
```

### 4.5 Cost

Model: GPT-4o mini. Estimated tokens per call: 420 input + 120 output. Cost per reflection: approximately $0.0001. At 10,000 weekly active users the total Sunday AI cost is approximately $1.00. At 100,000 users, approximately $10.00. This is not a cost risk at any realistic indie scale.

---

## 5. Safety, Privacy & Ethical Constraints

### 5.1 What This App Is Not

- Not a medical device. Not a therapy tool. Not a crisis service.
- This must be stated on the App Store listing, in onboarding (screen 1), and in the Settings > About screen.
- The AI output is explicitly framed as reflection, not analysis or diagnosis.

### 5.2 Crisis Handling

If the AI returns `"crisis": true` in the JSON output, the following client-side behaviour is triggered immediately:

- The normal reflection card and avatar are suppressed entirely — never shown alongside crisis copy.
- A hardcoded, pre-written card is displayed instead. The AI never writes crisis copy.
- The card text (written by a human, reviewed before ship): *'It looks like this has been a hard week. You do not have to handle it alone.'* followed by the local crisis line number determined by device locale.
- The crisis card is never logged, never sent to any server, and never referenced in future reflections.
- The crisis threshold — 4 or more entries at score 1 — is reviewed by a mental health professional before shipping.

### 5.3 AI Content Guardrails

- Prohibited strings in AI output: `'should'`, `'recommend'`, `'disorder'`, `'diagnose'`, `'depressed'`, `'anxiety disorder'`, `'mental illness'`, `'you need to'`.
- A client-side string filter scans s1, s2, and s3 before display. If any prohibited term is detected, the reflection is replaced with a hardcoded fallback card.
- Fallback card text: *'You showed up this week. That matters. See you Sunday.'*
- The AI is never told the user's age, name, or any identifying information.

### 5.4 Privacy Architecture

- All raw entries are stored in device-local SQLite only. No cloud sync in v1.
- The weekly AI payload contains zero PII — only day names, score integers, one-word strings, and a boolean.
- No analytics SDK in v1. No third-party data sharing, ever.
- No account system in v1. No email, no login. All data is tied to the device.
- Privacy policy: one page, plain English, linked from the App Store listing and Settings > About.

### 5.5 Over-Reliance Prevention

- The 3-minute hard cap is the primary architectural defence against over-reliance.
- The app has no browsable home screen, no content library, no feed, no 'while you are here' surface.
- The weekly reflection is the only AI output surface. There is no chat interface in v1.
- If a user opens the app outside of a notification session, they see only a minimal entry screen and Settings. Nothing else.

---

## 6. Feature Scope — v1 vs v2

| Feature | v1 — Ship this | v2 — Upgrade path |
|---|---|---|
| Daily word input | Text field, max 20 chars, required | Voice mic — tap, speak, done in 5 seconds |
| Emoji scale | 5 Unicode emoji circles, dark-to-bright | 5 custom illustrated states — stronger identity |
| Breathing step | 60s visual animation only, optional, untracked | Optional ambient audio (nature sound or single tone) |
| Weekly avatar | 9 emoji-based weather states | 9 hand-illustrated SVG figure states, unique to the app |
| Weekly AI reflection | 3 sentences, GPT-4o mini, every Sunday | Same structure. Richer input from voice transcription. |
| Data storage | Device-local SQLite only | Optional encrypted iCloud or Google Drive backup |
| Account / login | None. No login required. | Optional account for cross-device backup only |
| AI companion chat | Not in v1 | Conversational AI — funded by v1 revenue |
| Streaks | Never — by design principle | Never — by design principle |
| Charts / history | Not in v1 | Simple year-view grid only — evaluate in v2 |
| China localisation | Not in v1 | WeChat login, Alipay, zh-CN copy, cultural reframe |

---

## 7. Technical Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | React Native (Expo) | Single codebase for iOS and Android. Expo handles device APIs and push notifications without native build knowledge. Large community for vibe-coding reference. |
| Local database | SQLite via expo-sqlite | On-device only. No network call for reads or writes. Privacy-preserving by architecture, not policy. |
| Backend | Supabase Edge Functions | Handles the weekly AI call server-side so the OpenAI API key is never exposed on the client. Free tier covers MVP scale comfortably. |
| AI model | OpenAI GPT-4o mini | Cheapest capable model. JSON mode enforced. Approximately $0.0001 per Sunday reflection. Total Sunday cost at 100,000 users is approximately $10. |
| Push notifications | Expo Push Notifications | Cross-platform. Free. Handles scheduling and delivery. Used for daily reminder and Sunday reflection notification. |
| Payments | RevenueCat | Abstracts iOS and Android in-app subscription complexity cleanly. Handles trial periods, restoration, and webhook events. |
| Analytics | None in v1 | Consistent with the on-device privacy commitment. Add only if premium conversion data is specifically needed and users are clearly informed. |
| Crash reporting | Sentry free tier | Non-PII crash data only. No user session replay. Essential for catching silent failures in the 3-minute cap logic. |

### 7.1 Build Sequence — Vibe-Code vs Hire

| Task | Description | Approach | Est. cost |
|---|---|---|---|
| All UI screens | Notification entry, emoji picker, word input, breath screen, reflection card, settings | Vibe-code | $0 |
| SQLite schema | Local entry table, weekly summary query | Vibe-code | $0 |
| AI call pipeline | Supabase Edge Function, input builder, JSON parser, content filter | Vibe-code | $0 |
| Push notifications | Daily reminder scheduler and Sunday reflection trigger | Vibe-code | $0 |
| RevenueCat integration | Paywall screen, subscription state, free vs premium gating | Vibe-code | $0 |
| 3-minute cap logic | Background timer surviving screen transitions that closes the app reliably cross-platform | Hire if needed | $100–200 |
| Security review | API key handling, Supabase RLS policies, input sanitisation | Hire 1–2 days | $300–600 |
| **Total estimated** | **v1 MVP** | | **$400–800** |

---

## 8. Onboarding

Onboarding completes in under 90 seconds. It never asks for an account. It never shows a feature tour. It sets one expectation: a daily tap and a Sunday reflection.

1. **Screen 1** — Name and tagline. 'Emoji. Word. Breath. Done.' One CTA: Get started.
2. **Screen 2** — Emoji scale. Show the 5 states. No text beyond: 'Pick how you feel. Once a day.'
3. **Screen 3** — Notification permission. Frame: 'We tap your shoulder once a day. That is it.' Request system permission here.
4. **Screen 4** — Set reminder time. Default 9:00 PM. One sentence below: 'We will come to you.'
5. **Screen 5** — First entry. Go directly into the emoji screen. No tutorial overlay. The loop teaches itself.

Account creation is never prompted during onboarding. Users who want cross-device backup can create an optional account from Settings in v2.

---

## 9. Monetisation

### 9.1 Pricing Model

| Tier | Includes | Price |
|---|---|---|
| Free | Full daily loop forever. Monthly AI reflection — once per month. Nine emoji avatars. | Free, forever |
| **Premium** | Everything free, plus weekly AI reflection every Sunday, illustrated SVG avatars in v2, optional encrypted backup in v2. | $4.99/month or $29.99/year |

### 9.2 What Is Never Paywalled

- The full daily loop — notification, emoji, word, breath — is always free.
- The 3-minute cap and slumber principle apply equally to all users.
- The monthly reflection on the free tier ensures every user experiences the product's core value before any paywall decision.

### 9.3 Revenue Projection — Conservative

| Month | Monthly active users | Premium users (2%) | MRR |
|---|---|---|---|
| 1–2 | 300 | 6 | ~$30 |
| 3–4 | 1,200 | 24 | ~$120 |
| 6 | 4,000 | 80 | ~$400 |
| 9 | 12,000 | 240 | ~$1,200 |
| 12 | 30,000 | 600 | ~$3,000 |

At 30,000 MAU and 600 premium users, total weekly AI cost is approximately $3.00. Net margin on the AI feature exceeds 99%.

---

## 10. Success Metrics

| Metric | Month 1 target | Month 6 target | Month 12 target |
|---|---|---|---|
| Day-7 retention | 40% | 50% | 55% |
| Day-30 retention | 20% | 30% | 38% |
| Entries per user per week | 3+ | 4+ | 5+ |
| Sunday reflection open rate | 60% | 70% | 75% |
| Free-to-premium conversion | — | 2% | 3% |
| App Store rating | 4.0+ | 4.3+ | 4.4+ |
| MRR | — | $400+ | $3,000+ |
| Average session length | < 90s | < 90s | < 90s — held flat intentionally |

Session length is the one metric that must never increase with product improvements. If average session length rises above 120 seconds, the 3-minute cap principle has been compromised somewhere and a feature audit is required immediately.

---

## 11. Risks & Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | Required word field causes drop-off on difficult days | Medium | High | Max 20 chars enforced. Placeholder: 'one word'. Monitor step-3 abandonment. If over 25%, make optional in hotfix. |
| 2 | AI reflection feels generic — users churn before premium paywall | Medium | High | Spend 20% of build time on prompt engineering. Test 50 reflections manually before launch. Version-control the system prompt. |
| 3 | 3-minute cap is unreliable cross-platform in background state | Medium | Medium | Budget $100–200 to hire specifically for this. Do not ship without it working reliably. |
| 4 | Crisis threshold fires incorrectly — false positive on a 'fine' user | Low | High | Crisis threshold and fallback card text reviewed by a mental health professional before shipping. |
| 5 | OpenAI API is unavailable on Sunday morning | Low | Medium | Queue and retry up to 3 times through Sunday. Fallback notification: 'Your reflection is on its way — check back later.' |
| 6 | App Store rejection due to mental health content policies | Low | High | Do not use 'mental health' in primary metadata. Category: Health and Fitness. Include crisis resource link. Review Apple guideline 5.1.3 before submission. |

---

## 12. Open Questions

| # | Question | Options | Decide before |
|---|---|---|---|
| 1 | App name. No name finalised. Shortlist: Wisp, Pulse, Nod, Blink, Felt, Hush, Ember, Tide. | App Store + trademark search needed for each candidate | Any marketing asset is created |
| 2 | Emoji scale — 5 standard Unicode emoji or 5 custom illustrated states for v1? | Unicode is faster to ship. Custom is stronger identity. | UI build begins |
| 3 | Should Sunday reflections be free for the first 4 weeks to drive premium conversion? | Free trial period vs immediate monthly-only free tier | RevenueCat setup |
| 4 | Platform launch strategy — iOS only first, or iOS and Android simultaneously? | iOS first: faster, higher ARPU. Both: wider reach, more complexity. | Build sprint begins |
| 5 | China localisation — defer entirely, or build i18n-ready string structure from day one even if not launched? | Full defer vs i18n strings only (low cost, future-proofs) | First build sprint |

---

*End of document — PRD v1.0 Draft | March 2026*
