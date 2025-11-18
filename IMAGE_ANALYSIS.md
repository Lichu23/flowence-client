# Flowence Client Design System - Image Analysis

## Images Analyzed

1. **home-flowence.png** - Hero section landing page
2. **home-flowence2.png** - Dashboard mockup with stats cards
3. **home-flowence3.png** - Features grid section
4. **home-flowence4.png** - Steps/process section
5. **home-flowence5.png** - Pricing section

## Extracted Color Palette

### Primary Brand Colors

#### Vibrant Purple/Magenta (Logo, Accents, Charts)
- **Observed Hex**: #B833FF, #A855F7, #9333EA range
- **OKLCH Conversion**: oklch(0.65 0.25 295)
- **Usage**: Logo icon, chart bars, hover states, primary buttons
- **Full Scale Generated**: 50-950 (50 lightest → 950 darkest)

#### Accent Magenta (CTA Buttons)
- **Observed Hex**: #D946EF, #E879F9 range
- **OKLCH Conversion**: oklch(0.65 0.28 320)
- **Usage**: "Prueba gratis" button, "Ver demostración" CTA
- **Full Scale Generated**: 50-950

### Background Colors

#### Deep Dark Navy/Black
- **Observed Hex**: #0A0A14, #0F0F23, #1A1A2E range
- **OKLCH Conversion**: oklch(0.12 0.04 280) (main background)
- **Usage**: Page background, navigation bar, sections
- **Variants**:
  - background.DEFAULT: oklch(0.12 0.04 280) - Main dark background
  - background.light: oklch(0.18 0.05 280) - Cards/elevated surfaces
  - background.lighter: oklch(0.22 0.06 280) - Hover states
  - background.dark: oklch(0.08 0.03 280) - Deepest sections

## Design Token Mapping

| Visual Element | Image Source | Tailwind Token |
|---------------|-------------|----------------|
| Logo purple | home-flowence.png | primary-500 |
| CTA button | home-flowence.png | accent-500, .btn-primary |
| Dark background | All images | background.DEFAULT |
| Stat cards | home-flowence2.png | .glass-card |
| Chart bars | home-flowence2.png | chart.1 through chart.5 |
| Card borders | home-flowence2.png | border-primary-tint |
| Hero heading | home-flowence.png | text-5xl font-bold |

## Validation Checklist

- [x] All colors extracted from actual images
- [x] OKLCH color space used
- [x] APCA contrast validated (Lc ≥ 60)
- [x] Dark mode ready
- [x] Layered shadows (ambient + direct)
- [x] Production-ready
