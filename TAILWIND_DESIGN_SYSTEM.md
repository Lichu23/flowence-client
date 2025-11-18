# Flowence Tailwind Design System

Production-ready Tailwind CSS v4 design system extracted from the Flowence Client landing page, enforcing visual balance guidelines and APCA contrast standards.

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing & Layout](#spacing--layout)
4. [Shadows](#shadows)
5. [Components](#components)
6. [Custom Utilities](#custom-utilities)
7. [Visual Balance Guidelines](#visual-balance-guidelines)

---

## Color Palette

All colors use `oklch()` for perceptual uniformity and meet APCA contrast standards (Lc ≥ 60).

### Primary Colors (Purple-Fuchsia Gradient)

```tsx
// Primary brand color
<div className="bg-primary-600 text-white">Primary Button</div>
<div className="border-primary-tint">Tinted border for hue consistency</div>

// Full scale: primary-50 through primary-950
<div className="bg-primary-400">Lighter purple</div>
<div className="bg-primary-700">Darker purple</div>
```

### Secondary Colors (Fuchsia Accent)

```tsx
// Secondary accent
<div className="bg-secondary-600">Secondary accent</div>
<div className="text-secondary-400">Gradient text</div>
```

### Background Colors

```tsx
// Dark theme (default from landing page)
<div className="bg-background">Main dark background (#0a0a14)</div>
<div className="bg-background-light">Light mode background</div>
<div className="bg-background-dark">Darker variant</div>

// Grid overlay pattern (as seen on landing page)
<div className="bg-background bg-grid">Background with grid pattern</div>
```

### Foreground (Text) Colors

```tsx
// Dark mode text (APCA validated)
<p className="text-foreground">High contrast text (white)</p>
<p className="text-foreground-muted">Muted text (gray-400)</p>
<p className="text-foreground-subtle">Subtle text (gray-500)</p>

// Light mode text
<p className="text-foreground-light">Dark text on light background</p>
<p className="text-foreground-light-muted">Muted dark text</p>
```

### Card & Glass Effects

```tsx
// Glass morphism cards (landing page style)
<div className="bg-card backdrop-blur-lg">Card with glass effect</div>
<div className="bg-card-hover">Card hover state</div>
```

### Borders (Crisp & Semi-Transparent)

```tsx
// Semi-transparent borders for better edge clarity
<div className="border border-border">Default crisp border</div>
<div className="border border-border-muted">More subtle border</div>
<div className="border border-border-primary">Primary colored border</div>
```

---

## Typography

### Font Sizes with Optical Letter Spacing

```tsx
// Smaller sizes (positive letter spacing)
<p className="text-xs">Extra small (0.75rem)</p>
<p className="text-sm">Small (0.875rem)</p>
<p className="text-base">Base (1rem)</p>

// Larger sizes (negative letter spacing for optical balance)
<h1 className="text-6xl">6XL heading (3.75rem, -0.035em)</h1>
<h2 className="text-5xl">5XL heading (3rem, -0.03em)</h2>
<h3 className="text-4xl">4XL heading (2.25rem, -0.025em)</h3>
```

### Font Weights

```tsx
<p className="font-light">Light (300)</p>
<p className="font-normal">Normal (400)</p>
<p className="font-medium">Medium (500)</p>
<p className="font-semibold">Semibold (600)</p>
<p className="font-bold">Bold (700)</p>
```

---

## Spacing & Layout

### Optical Adjustments (±1-2px)

```tsx
// Micro-adjustments for visual precision
<img className="relative top-[optical-p1]" /> // +1px
<img className="relative top-[optical-n1]" /> // -1px
<img className="relative top-[optical-p2]" /> // +2px
```

### Safe Areas (Mobile)

```tsx
// iOS safe area insets
<div className="pt-safe-top pb-safe-bottom">
  Content respects notch/home indicator
</div>
```

---

## Shadows

### Layered Shadows (Ambient + Direct)

All shadows have at least 2 layers for realistic depth.

```tsx
// Small shadows
<div className="shadow-sm">Single layer small</div>
<div className="shadow-sm-ambient shadow-sm-direct">Two-layer small</div>

// Medium shadows
<div className="shadow-md">Default medium</div>
<div className="shadow-md-ambient shadow-md-direct">Two-layer medium</div>

// Large shadows (landing page cards)
<div className="shadow-lg">Default large</div>
<div className="shadow-lg-ambient shadow-lg-direct">Two-layer large</div>

// Extra large
<div className="shadow-xl">Extra large</div>
<div className="shadow-2xl">2XL</div>

// Colored shadows for brand elements
<div className="shadow-purple">Purple shadow</div>
<div className="shadow-purple-lg">Large purple shadow</div>
```

---

## Components

### Glass Cards

Pre-built glass morphism cards with crisp borders and layered shadows.

```tsx
<div className="glass-card p-6">
  <h3 className="text-xl font-semibold mb-3">Card Title</h3>
  <p className="text-foreground-muted">Card content with glass effect</p>
</div>
```

### Buttons

#### Primary Button (Gradient)

```tsx
<button className="btn-primary">
  Primary Action
</button>

// Or manually
<button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg font-medium hover:from-purple-700 hover:to-fuchsia-700 transition-all">
  Custom Primary
</button>
```

#### Secondary Button

```tsx
<button className="btn-secondary">
  Secondary Action
</button>
```

#### Ghost Button

```tsx
<button className="btn-ghost">
  Tertiary Action
</button>
```

### Input Fields

```tsx
<input
  type="text"
  className="input-field"
  placeholder="Enter text..."
/>
```

### Badge/Pill

```tsx
<span className="badge">
  PLATAFORMA POS
</span>
```

---

## Custom Utilities

### Text-Icon Pairs (Balanced Lockups)

Automatically balanced text + icon combinations.

```tsx
// Small pair
<div className="text-icon-pair-sm">
  <svg>...</svg>
  <span>Settings</span>
</div>

// Medium pair (default for nav/buttons)
<div className="text-icon-pair-md">
  <svg>...</svg>
  <span>Dashboard</span>
</div>

// Large pair
<div className="text-icon-pair-lg">
  <svg>...</svg>
  <span>Large Item</span>
</div>
```

### Interaction Contrast Boosters

```tsx
// Auto-boost contrast on hover
<button className="hover-contrast">Hover me</button>

// Active state contrast
<button className="active-contrast">Click me</button>

// Focus state contrast
<button className="focus-contrast">Tab to me</button>
```

### Text Anti-Aliasing

```tsx
// Smooth text rendering
<h1 className="text-smooth">Crisp heading</h1>

// Promote animated text to own layer (prevents blur)
<h1 className="text-layer animate-fade-in">Animated heading</h1>
```

### Nested Radius

Automatically calculate child border radius to be ≤ parent.

```tsx
<div className="nested-radius-xl p-4 rounded-xl">
  <div className="rounded-lg">
    Child radius automatically ≤ parent
  </div>
</div>
```

---

## Visual Balance Guidelines

### 1. Balance Contrast in Lockups

When text and icons sit side by side, use `text-icon-pair-{size}` utilities:

```tsx
// ❌ Unbalanced
<div className="flex items-center gap-2">
  <svg className="w-4 h-4" /> {/* Too thin */}
  <span className="font-bold">Bold Text</span>
</div>

// ✅ Balanced
<div className="text-icon-pair-md">
  <svg /> {/* Auto-sized with stroke-[2] */}
  <span>Medium Text</span>
</div>
```

### 2. Layered Shadows

Always use ambient + direct light for depth:

```tsx
// ❌ Single layer
<div className="shadow-md">Flat shadow</div>

// ✅ Two layers
<div className="shadow-md-ambient shadow-md-direct">Realistic depth</div>
```

### 3. Crisp Borders

Semi-transparent borders improve edge clarity:

```tsx
// ✅ Uses semi-transparent white/10
<div className="border border-border">Crisp edge</div>
```

### 4. Nested Radii

Child radius must be ≤ parent radius:

```tsx
// ❌ Bad (child > parent)
<div className="rounded-lg p-4">
  <div className="rounded-2xl">Wrong</div>
</div>

// ✅ Good (child < parent)
<div className="rounded-2xl p-4">
  <div className="rounded-lg">Concentric alignment</div>
</div>

// ✅ Auto-calculated
<div className="nested-radius-2xl p-4 rounded-2xl">
  <div>Child radius auto-calculated</div>
</div>
```

### 5. Hue Consistency

On colored backgrounds, tint borders/shadows toward the same hue:

```tsx
// On purple background, use purple-tinted border
<div className="bg-purple-900 border border-primary-tint">
  Hue-consistent border
</div>
```

### 6. APCA Contrast Validation

All text/background combos meet Lc ≥ 60:

```tsx
// ✅ APCA validated combinations
<div className="bg-background text-foreground">High contrast</div>
<div className="bg-background text-foreground-muted">Still readable</div>
```

### 7. Interactions Increase Contrast

Hover/active/focus states have higher contrast than rest:

```tsx
<button className="bg-primary-600 hover:bg-primary-700 active:scale-98">
  Higher contrast on interaction
</button>
```

### 8. Optical Alignment

Use micro-adjustments when perception beats geometry:

```tsx
// Icon slightly misaligned? Nudge it
<svg className="relative top-[optical-p1]" />
```

### 9. Text Anti-Aliasing

Animated text may blur—promote to own layer:

```tsx
// Before animation
<h1 className="text-layer animate-fade-in">Crisp animated text</h1>
```

---

## Landing Page Examples

### Hero Section

```tsx
<section className="pt-32 pb-20 px-4 bg-background bg-grid">
  <div className="max-w-7xl mx-auto text-center">
    {/* Badge */}
    <div className="badge mb-8">
      PLATAFORMA POS Y GESTIÓN
    </div>

    {/* Heading with gradient text */}
    <h1 className="text-5xl lg:text-6xl font-bold mb-6">
      Empieza a vender<br />
      en <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400">
        minutos
      </span>
    </h1>

    {/* Muted text */}
    <p className="text-lg text-foreground-muted max-w-3xl mx-auto mb-10">
      Flowence permite que cualquier supermercado o almacén empiece a vender...
    </p>

    {/* Buttons */}
    <div className="flex gap-4 justify-center">
      <button className="btn-primary">Ver demostración</button>
      <button className="btn-secondary">
        Solicitar cotización
        <svg className="w-4 h-4" />
      </button>
    </div>
  </div>
</section>
```

### Feature Card

```tsx
<div className="glass-card hover:bg-card-hover transition-all">
  {/* Icon container with gradient */}
  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-xl flex items-center justify-center mb-4">
    <svg className="w-6 h-6 text-white" />
  </div>

  <h3 className="text-xl font-semibold mb-3">Feature Title</h3>
  <p className="text-foreground-muted">Feature description...</p>
</div>
```

### Navigation

```tsx
<nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border-muted">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm">
          F
        </div>
        <span className="text-lg font-semibold">Flowence</span>
      </div>

      {/* Nav links */}
      <div className="flex items-center gap-8">
        <a href="#" className="text-sm text-foreground-muted hover:text-foreground transition-colors">
          Productos
        </a>
        <a href="#" className="btn-primary px-4 py-2">
          Registrate gratis
        </a>
      </div>
    </div>
  </div>
</nav>
```

---

## Dark Mode Support

The design system uses `class` strategy. Toggle dark mode by adding/removing the `dark` class to the root element.

```tsx
// Light mode
<html>
  <body className="bg-background-light text-foreground-light">
    ...
  </body>
</html>

// Dark mode (default)
<html className="dark">
  <body className="bg-background text-foreground">
    ...
  </body>
</html>
```

---

## Integration with Existing Components

### Card Component

```tsx
import { Card, CardHeader, CardFooter } from '@/components/ui/Card';

// Enhance existing Card with new design system
<Card className="glass-card shadow-lg-ambient shadow-lg-direct">
  <CardHeader title="Enhanced Card" />
  <p className="text-foreground-muted">Content...</p>
  <CardFooter>
    <button className="btn-primary">Action</button>
  </CardFooter>
</Card>
```

### Toast Component

```tsx
// Toast already uses Card-like styles
// Can now use glass-card utilities
<div className="glass-card shadow-xl border-border-primary">
  Toast content
</div>
```

---

## Build-Time Validations

The config includes custom plugins that enforce guidelines:

1. **APCA Contrast Enforcer** - Sets CSS variables for contrast thresholds
2. **Nested Radius Validator** - Generates helper utilities for nested radii
3. **Text-Icon Pair Generator** - Creates balanced lockup utilities
4. **Interaction Contrast Booster** - Auto-generates hover/active/focus utilities
5. **Component Utilities** - Pre-built component classes

These run automatically during `npm run build`.

---

## Migration from Old Styles

### Before (Manual classes)

```tsx
<div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
  ...
</div>
```

### After (Design system)

```tsx
<div className="glass-card p-6">
  ...
</div>
```

### Before (Button)

```tsx
<button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 rounded-lg font-medium hover:from-purple-700 hover:to-fuchsia-700 transition-all">
  Button
</button>
```

### After (Design system)

```tsx
<button className="btn-primary">
  Button
</button>
```

---

## Resources

- **APCA Contrast Calculator**: https://www.myndex.com/APCA/
- **oklch() Color Picker**: https://oklch.com/
- **Tailwind CSS v4 Docs**: https://tailwindcss.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## File Locations

- **Config**: `C:\Users\lisan\flowence\flowence-client\tailwind.config.ts`
- **Global Styles**: `C:\Users\lisan\flowence\flowence-client\src\app\globals.css`
- **This Document**: `C:\Users\lisan\flowence\flowence-client\TAILWIND_DESIGN_SYSTEM.md`
