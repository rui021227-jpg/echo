# Design System Specification: The Digital Embrace

## 1. Overview & Creative North Star

### Creative North Star: "The Radiant Sanctuary"
This design system is not a utility; it is a destination. For university students navigating the high-pressure environment of academia, this system acts as a "mental health hug"—a digital space that feels like a sun-drenched library at golden hour. 

To move beyond the "standard app" look, we reject the rigid, boxy constraints of traditional material design. Instead, we embrace **Organic Editorialism**. This is achieved through:
*   **Intentional Asymmetry:** Breaking the grid with staggered element placement to mimic the natural randomness of organic forms.
*   **Breathable Composition:** Prioritizing extreme white space (using the upper tiers of our Spacing Scale) to reduce cognitive load.
*   **High-Contrast Scale:** Utilizing dramatic shifts between `display-lg` and `body-md` to create a sophisticated, editorial rhythm that feels premium and curated.

---

## 2. Colors & Tonal Depth

The palette is rooted in warmth, moving away from "clinical" whites toward "nurturing" creams and sage.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. 
Boundaries must be defined solely through background color shifts. Use `surface-container-low` (#f6f3eb) to sit on a `surface` (#fcf9f1) background. If an element needs to stand out, use a tonal transition rather than a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine, heavy-stock paper.
*   **Base:** `surface` (#fcf9f1)
*   **Secondary Sections:** `surface-container-low` (#f6f3eb)
*   **Floating Cards/Interactive Elements:** `surface-container-lowest` (#ffffff)
*   **Sun-Drenched Accents:** Use gradients transitioning from `secondary_container` (#ffcf93) to `tertiary_fixed` (#ffdcc4) for a "golden hour" glow on primary CTAs.

### The "Glass & Gradient" Rule
For overlays or floating navigation bars (like the bottom nav in reference images), use **Glassmorphism**. Apply `surface_container_lowest` at 80% opacity with a `20px` backdrop blur. This allows the sage and peach background tones to bleed through, softening the interface's edges.

---

## 3. Typography: Plus Jakarta Sans

We use **Plus Jakarta Sans** for its geometric clarity paired with soft, humanist terminals. It feels modern but never cold.

*   **The Narrative Voice (Display/Headline):** Use `display-md` or `headline-lg` for check-in questions (e.g., "How are you today?"). These should be set in `on_surface` (#1c1c17) with a slight negative letter-spacing (-0.02em) to feel authoritative yet gentle.
*   **The Supportive Voice (Body):** `body-lg` is your workhorse. Ensure a generous line-height (1.6x) to maintain the "breathable" feel.
*   **The Subtle Hint (Labels):** Use `label-md` in `on_surface_variant` (#4f453a) for metadata, ensuring it never competes with the primary emotional prompt.

---

## 4. Elevation & Depth

In this system, light is the primary architect. We avoid dark, heavy shadows in favor of **Ambient Glows**.

*   **The Layering Principle:** Depth is achieved by stacking. A `surface-container-lowest` card placed on a `surface-container` background creates a natural, soft lift.
*   **Ambient Shadows:** When a "floating" effect is required (e.g., for an emoji selector or floating action button), use an extra-diffused shadow:
    *   *Blur:* 40px - 60px
    *   *Opacity:* 4% - 8%
    *   *Color:* Tinted with `primary` (#536346) or `secondary` (#7b5827) to mimic natural light diffraction.
*   **The "Ghost Border" Fallback:** If accessibility requires a container boundary, use `outline-variant` (#d3c4b5) at **15% opacity**. Never use 100% opaque lines.

---

## 5. Components

### Buttons & Interaction
*   **Primary Action:** Rounded at `full` (9999px). Use the sun-drenched peach/gold gradient. No border.
*   **Secondary Action:** Rounded at `xl` (3rem). Use `primary_container` (#b4c6a2) with `on_primary_container` text.
*   **Floating Navigation:** As seen in the reference, the bottom nav should be an extra-rounded (`xl`) container with high-diffusion ambient shadows.

### Chips & Choice Elements
*   **Mood Chips:** Use the `lg` (2rem) roundedness scale. Instead of a border, use a soft glow (e.g., a sage-tinted shadow) to indicate selection.
*   **State:** Selected chips should utilize `secondary_fixed` (#ffddb5) to feel "illuminated" by the sun.

### Inputs & Cards
*   **Text Fields:** Utilize `surface_container_high` (#ebe8e0) with `xl` corners. The label should float above in `on_surface_variant`.
*   **Cards:** Forbid divider lines. Separate content using `spacing-8` (2.75rem) or subtle background shifts between `surface-container-low` and `surface-container-high`.

---

## 6. Do's and Don'ts

### Do
*   **DO** use organic, staggered layouts. If you have four cards, consider making one slightly larger or offset to break the "template" feel.
*   **DO** use the `full` roundedness for icons and avatars to maintain the "soft" atmosphere.
*   **DO** prioritize the "Golden Hour" palette. Every screen should feel like it's being hit by late-afternoon sun.

### Don't
*   **DON'T** use #000000 for text. Use `on_surface` (#1c1c17) to keep the contrast soft and readable.
*   **DON'T** use sharp corners (0px - 8px). The minimum acceptable roundedness for any container is `sm` (0.5rem), but `lg` (2rem) is preferred.
*   **DON'T** use standard 1px dividers. If you feel the need to separate two pieces of content, use a wider spacing gap or a very subtle background tint change.
*   **DON'T** crowd the screen. If a student is stressed, a dense UI is the enemy. When in doubt, add more whitespace.