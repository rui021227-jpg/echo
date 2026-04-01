# ECHO — Claude Context

This file is kept for tool compatibility.

Read `ARCHITECT.md` first for the current system rules, architecture, file-routing guidance, QA checklist, and safety constraints.

Use `README.md` for setup, environment variables, and commands.

Project rule reminder:

- Do not add or use any API key unless the project owner explicitly approves it for that task.
- Run `npm run verify` before wrapping up behavior changes.
- Update `ARCHITECT.md` when the architecture or integration path changes.

---

## Figma MCP Integration Rules

These rules define how to translate Figma designs into code for ECHO and must be followed for every Figma-driven change.

### Required Flow (do not skip)

1. Run `get_design_context` first to fetch the structured representation for the exact node(s)
2. Run `get_screenshot` for a visual reference of the node being implemented
3. If the response is too large, run `get_metadata` to get the high-level node map, then re-fetch only the required nodes
4. Translate the output (usually React + Tailwind) into ECHO's React Native conventions — it is a reference, not final code
5. Validate the final UI against the Figma screenshot before marking complete

### Design Tokens

**IMPORTANT: Never hardcode colors, sizes, or spacing — always use tokens from `src/constants/theme.ts`.**

```typescript
// Colors — import from src/constants/theme.ts
COLORS.background    // #1a1a2e  — main screen background
COLORS.surface       // #16213e  — cards and surface containers
COLORS.surfaceLight  // #1f2f50  — elevated surface variant
COLORS.primary       // #e2e2f0  — primary text (light lavender)
COLORS.secondary     // #a0a0c0  — secondary/supporting text
COLORS.muted         // #6a6a8a  — disabled/tertiary text
COLORS.accent        // #7b7fda  — interactive elements (buttons, breathing circle)
COLORS.danger        // #e74c3c  — error states
COLORS.success       // #2ecc71  — success states

// Spacing — import SPACING from src/constants/theme.ts
SPACING.xs   // 4px
SPACING.sm   // 8px
SPACING.md   // 16px
SPACING.lg   // 24px
SPACING.xl   // 32px
SPACING.xxl  // 48px
SPACING.xxxl // 64px

// Font sizes — import FONT_SIZES from src/constants/theme.ts
FONT_SIZES.xs    // 12
FONT_SIZES.sm    // 14
FONT_SIZES.md    // 16
FONT_SIZES.lg    // 20
FONT_SIZES.xl    // 24
FONT_SIZES.xxl   // 32
FONT_SIZES.xxxl  // 48
FONT_SIZES.emoji // 64

// Border radius — import BORDER_RADIUS from src/constants/theme.ts
BORDER_RADIUS.sm   // 8
BORDER_RADIUS.md   // 12
BORDER_RADIUS.lg   // 16
BORDER_RADIUS.xl   // 24
BORDER_RADIUS.full // 9999
```

### Component Organization

- **Reusable UI components:** `src/components/` (4 existing: EmojiCircle, BreathingAnimation, WeatherAvatar, FadeOverlay)
- **Screen components:** `src/screens/daily/`, `src/screens/onboarding/`, `src/screens/reflection/`, `src/screens/settings/`
- **Constants (emojis, copy, avatars):** `src/constants/`
- IMPORTANT: Check `src/components/` for existing components before creating new ones
- New reusable components go in `src/components/`; new screens go in the appropriate `src/screens/` subdirectory

### Styling Rules

- **IMPORTANT: Use `StyleSheet.create()` for all styles — no styled-components, NativeWind, or inline style objects**
- Define styles at the bottom of each component file using `StyleSheet.create()`
- Import and use `COLORS`, `SPACING`, `FONT_SIZES`, `BORDER_RADIUS` from `src/constants/theme.ts`
- Use inline style composition only for dynamic values (e.g., conditional opacity, runtime-computed values)
- App is **dark mode only** — all backgrounds use `COLORS.background` or `COLORS.surface` variants
- Most screens use centered layouts (`justifyContent: 'center'`, `alignItems: 'center'`)
- Standard container padding: `paddingHorizontal: SPACING.xl` (32px)

### Typography Rules

- No custom fonts — system default font only
- Font weights: `'300'` (light, for large display text), `'600'` (semibold), `'700'` (bold)
- Text alignment: centered in most screens
- Do not hardcode fontSize — always use `FONT_SIZES.*`

### Icons & Emojis

- **IMPORTANT: No icon libraries** — ECHO uses Unicode emojis only (no react-native-vector-icons, expo icons, or SVG icons)
- Mood emojis: use `EMOJI_SCALE` from `src/constants/emojis.ts` (5-level scale with paired colors)
- Weather/avatar emojis: use `AVATAR_MAP` from `src/constants/avatars.ts` (9 states with gradient pairs)
- New emoji-based UI elements should follow the same pattern (emoji string + paired color/gradient)

### Animations

- Use **Reanimated v4** (`react-native-reanimated`) for all animations — not the built-in `Animated` API
- Add `expo-haptics` feedback on interactive taps (see `EmojiCircle.tsx` for the pattern)
- Breathing animation pattern: see `src/components/BreathingAnimation.tsx`
- Fade overlay pattern: see `src/components/FadeOverlay.tsx`

### Asset Rules

- **IMPORTANT: If the Figma MCP server returns a localhost source for an image or SVG, use that source directly**
- **IMPORTANT: Do not install new icon packages** — use emojis
- Static assets (app icon, splash) live in `assets/` and are referenced only in `app.json`/`app.config.ts`
- ECHO has no in-app image assets — the UI is purely emoji + color-driven

### Copy & Strings

- **IMPORTANT: All user-facing strings must go in `src/constants/copy.ts`** — no hardcoded UI text in components
- Import the relevant copy constant and reference it in JSX

### Navigation

- Navigation types are defined in `src/types/navigation.ts`
- New screens must be added to the appropriate navigator (`OnboardingNavigator.tsx` or `MainNavigator.tsx`) and typed in `navigation.ts`

### Example: Translating a Figma Button to ECHO

```typescript
// Figma MCP output (React + Tailwind — reference only):
// <button className="bg-indigo-500 text-white px-8 py-4 rounded-full">Continue</button>

// ECHO implementation:
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../constants/theme';
import { COPY } from '../constants/copy';

<TouchableOpacity style={styles.button} onPress={onPress}>
  <Text style={styles.buttonText}>{COPY.continue}</Text>
</TouchableOpacity>

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.accent,       // #7b7fda — not bg-indigo-500
    paddingHorizontal: SPACING.xl,        // 32px
    paddingVertical: SPACING.md,          // 16px
    borderRadius: BORDER_RADIUS.full,     // 9999
  },
  buttonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,              // 16
    fontWeight: '600',
  },
});
```
