---
name: DevForge
colors:
  surface: '#121414'
  surface-dim: '#121414'
  surface-bright: '#383939'
  surface-container-lowest: '#0d0e0f'
  surface-container-low: '#1b1c1c'
  surface-container: '#1f2020'
  surface-container-high: '#292a2a'
  surface-container-highest: '#343535'
  on-surface: '#e3e2e2'
  on-surface-variant: '#c0caad'
  inverse-surface: '#e3e2e2'
  inverse-on-surface: '#303031'
  outline: '#8b947a'
  outline-variant: '#414a34'
  surface-tint: '#90db00'
  primary: '#ffffff'
  on-primary: '#203600'
  primary-container: '#a5fa00'
  on-primary-container: '#476f00'
  inverse-primary: '#436900'
  secondary: '#c9c6c5'
  on-secondary: '#313030'
  secondary-container: '#474646'
  on-secondary-container: '#b7b4b4'
  tertiary: '#ffffff'
  on-tertiary: '#313030'
  tertiary-container: '#e5e2e1'
  on-tertiary-container: '#656464'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#a5fa00'
  primary-fixed-dim: '#90db00'
  on-primary-fixed: '#112000'
  on-primary-fixed-variant: '#314f00'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c9c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1c1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#121414'
  on-background: '#e3e2e2'
  surface-variant: '#343535'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 72px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  margin-desktop: 64px
  margin-mobile: 24px
  gutter: 24px
  container-max: 1440px
---

## Brand & Style

The design system is engineered for the modern developer: focused, high-performance, and ruthlessly efficient. It utilizes a **Minimalist-Technic** aesthetic, characterized by an "all-dark" interface that reduces eye strain during long coding sessions while maintaining a premium, editorial edge.

The brand personality is authoritative yet innovative. It avoids the clutter of traditional enterprise software in favor of high-contrast typography and vast negative space. The visual language uses neon "signal" accents to guide attention to critical actions, mirroring the syntax highlighting of a code editor. The emotional response should be one of sophisticated control—a digital forge where complex projects are hammered into reality.

**Visual Principles:**
- **Editorial Density:** Use generous margins and wide gutters to give complex data room to breathe.
- **Signal vs. Noise:** Only use the primary accent color for interactive elements or active status indicators.
- **Geometric Precision:** Every element must align to a strict grid, emphasizing the systematic nature of development.

## Colors

This design system utilizes a high-contrast, dark-first palette. The core is an **Almost-Black (#080808)** foundation which serves as the canvas for all editorial layouts. 

Depth is achieved through tonal layering rather than shadows. **Surface-1 (#121212)** is used for primary content containers, while **Surface-2 (#181818)** is reserved for nested elements or elevated panels. 

The **Neon Green (#A8FF00)** is the "Signal Color." It must be used sparingly to maintain its impact. It is the color of progress, action, and success. Borders are kept extremely subtle to allow the typography and color blocks to define the structure of the UI.

## Typography

The typography system is a blend of precision and power. 

1.  **Hanken Grotesk** is the primary display face. It provides a sharp, contemporary look for headlines. In large formats, use tight letter-spacing for a bold, impactful appearance.
2.  **Geist** is utilized for body text. Its technical, minimal character is highly legible and reinforces the developer-centric aesthetic.
3.  **JetBrains Mono** is reserved for labels, metadata, and status tags. This monospaced choice grounds the UI in the world of code.

**Hierarchy Rules:**
- Use **Display-LG** for primary landing page hero sections only.
- **Labels** should always be uppercase with slight tracking to ensure readability at small sizes.
- **Body-LG** is the default for descriptions and project summaries to maintain the editorial feel.

## Layout & Spacing

The layout follows a **12-column fluid grid** for desktop, transitioning to a **4-column grid** for mobile. 

A strict **8px base unit** governs all spacing. The layout philosophy is "Spacious Editorial," meaning we prefer larger-than-standard margins (64px+) to create a premium, uncrowded feel. 

**Reflow Rules:**
- **Desktop:** 12 columns, 64px margins, 24px gutters.
- **Tablet:** 8 columns, 40px margins, 20px gutters.
- **Mobile:** 4 columns, 24px margins, 16px gutters.

Elements should be aligned to the grid, but the use of asymmetrical "white space blocks" (empty grid columns) is encouraged to maintain the sophisticated, minimal aesthetic.

## Elevation & Depth

In this dark-mode system, we avoid heavy drop shadows which can feel "muddy." Instead, we use **Tonal Elevation** and **Inner Glows**.

- **Level 0 (Background):** #080808. The infinite base.
- **Level 1 (Cards/Panels):** #121212. Uses a subtle 1px solid border of #242424.
- **Level 2 (Modals/Popovers):** #181818. These elements feature a very soft, diffused ambient glow (0px 20px 40px rgba(0,0,0,0.5)) to separate them from Level 1.
- **Active State Elevation:** When an element is focused or active, we replace the subtle border with a 1px #A8FF00 border. This "lit" edge effect provides clear visual feedback without needing heavy shadows.

## Shapes

The design system uses a **Rounded (Level 2)** geometry. This provides a bridge between clinical technicality and modern approachability.

- **Standard Elements (Buttons, Inputs):** 0.5rem (8px) radius.
- **Large Containers (Cards, Modals):** 1rem (16px) radius.
- **Media/Images:** 1.5rem (24px) radius to create a soft, high-end feel for visual content.

Pill shapes are strictly avoided to maintain the architectural, "forged" aesthetic.

## Components

### Buttons
- **Primary:** Background #A8FF00, Text #080808, Bold Hanken Grotesk. No shadow. On hover, background shifts to a slightly brighter lime.
- **Secondary:** Transparent background, 1px Border #242424, White text. On hover, border becomes #FFFFFF.
- **Ghost:** No background or border. Text #D0D0D0.

### Input Fields
- Dark background (#121212), subtle border (#242424), and Geist body text.
- Focused state: Border changes to #A8FF00 with a 1px inner glow.

### Cards
- Background: #121212. 
- Padding: 32px (Desktop) / 24px (Mobile).
- Content should be vertically stacked with JetBrains Mono labels at the top-left to categorize content.

### Status Badges
- Small, uppercase labels in JetBrains Mono.
- **Active/In-Progress:** 1px Border #A8FF00, Text #A8FF00, with a tiny 4px circular dot of the same color.
- **Completed/Neutral:** Border #8A8A8A, Text #8A8A8A.

### Logo & Wordmark
- **Logo Symbol:** A minimal geometric "F" and "D" combined into a single isometric hex shape, utilizing only strokes.
- **Wordmark:** Hanken Grotesk, Semi-Bold, tight kerning. The word "Forge" can optionally be styled in the accent color #A8FF00 to emphasize the platform's utility.