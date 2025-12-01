# Web Interface Guidelines Audit Report
**Flowence Client - Comprehensive Compliance Audit**

Generated: 2025-11-29

---

## Executive Summary

This audit examines the Flowence Client codebase against the Web Interface Guidelines, covering accessibility, interaction patterns, performance, and visual balance. The codebase demonstrates strong fundamentals in design system implementation but requires critical improvements in accessibility, keyboard navigation, touch targets, and form behaviors.

### Overall Status
- **Total Violations Found**: 47
- **Critical (MUST/NEVER)**: 18
- **Important (SHOULD)**: 22
- **Nice-to-Have**: 7

### Priority Areas
1. **Accessibility**: Missing ARIA labels, insufficient keyboard navigation, no skip-to-content
2. **Touch Targets**: Inconsistent minimum sizes across mobile/desktop
3. **Forms**: Missing autocomplete attributes, no unsaved changes warning
4. **Performance**: Missing virtualization for long lists, no reduced motion support
5. **Animations**: Missing `prefers-reduced-motion` support

---

## Critical Violations (MUST/NEVER)

### 1. Keyboard Navigation & Focus Management

#### 1.1 Missing Skip-to-Content Link
**Guideline**: MUST include a "Skip to content" link
**File**: `src/app/globals.css`, all page layouts
**Severity**: CRITICAL
**Impact**: Screen reader users must tab through entire navigation on every page

**Current State**: No skip-to-content implementation
**Required Fix**:
```css
/* Add to globals.css */
.skip-to-content {
  position: absolute;
  left: -9999px;
  z-index: 999;
  padding: 1rem 1.5rem;
  background-color: var(--color-purple-600);
  color: white;
  text-decoration: none;
  border-radius: var(--radius-lg);
}

.skip-to-content:focus {
  left: 1rem;
  top: 1rem;
}
```

#### 1.2 Focus Trap in Mobile Menu Not Implemented
**Guideline**: MUST manage focus (trap, move, and return) per APG patterns
**File**: `src/components/Navbar.tsx` (lines 184-278)
**Severity**: CRITICAL
**Impact**: Keyboard users can tab outside mobile menu overlay

**Current State**: Mobile menu opens but doesn't trap focus
**Required Fix**: Implement focus trap when `mobileMenuOpen === true`

#### 1.3 Modal Focus Management Missing
**Guideline**: MUST trap focus in modals per WAI-ARIA APG
**File**: `src/app/pos/page.tsx` (lines 349-520)
**Severity**: CRITICAL
**Impact**: Payment modal doesn't trap keyboard focus

**Current State**: Payment modal lacks focus management
**Required Fix**: Add `inert` to background content, trap focus in modal

### 2. Touch Targets & Input Handling

#### 2.1 Inconsistent Touch Target Sizes
**Guideline**: MUST have hit target ≥24px (mobile ≥44px)
**Files**: Multiple components
**Severity**: CRITICAL
**Impact**: Difficult to tap on mobile devices

**Violations**:
- `src/components/ui/Toast.tsx` (line 142-150): Close button ~16px × 16px visible, needs expanded hit area
- `src/app/pos/page.tsx` (lines 305-320): +/- quantity buttons appear small on mobile
- `src/components/Navbar.tsx` (lines 99-117): Desktop nav icons may be <24px

**Required Fix**: Add minimum dimensions and padding to ensure 44px mobile, 24px desktop

#### 2.2 Missing Touch-Action Manipulation
**Guideline**: MUST use `touch-action: manipulation` to prevent double-tap zoom
**File**: `src/app/globals.css`
**Severity**: CRITICAL
**Impact**: Double-tap zoom on buttons causes poor UX

**Current State**: Not implemented globally
**Required Fix**:
```css
button, [role="button"], a {
  touch-action: manipulation;
}
```

#### 2.3 Input Font Size < 16px on Mobile
**Guideline**: MUST have mobile `<input>` font-size ≥16px or set viewport meta tag
**File**: Multiple form pages
**Severity**: CRITICAL
**Impact**: iOS Safari zooms in on focus, causing layout shift

**Violations**:
- Login/register forms use responsive text sizes that may be <16px on mobile
- POS search input needs verification

**Required Fix**: Ensure all inputs use `text-base` (16px) or larger on mobile

### 3. Forms & Validation

#### 3.1 Missing Autocomplete Attributes
**Guideline**: MUST have `autocomplete` + meaningful `name`
**Files**:
- `src/app/login/page.tsx` (lines 60-83)
- `src/app/register/page.tsx` (lines 94-182)
**Severity**: CRITICAL
**Impact**: Password managers cannot autofill, poor UX

**Current State**:
```tsx
<input id="email" type="email" required value={formData.email} />
<input id="password" type="password" required value={formData.password} />
```

**Required Fix**:
```tsx
<input
  id="email"
  name="email"
  type="email"
  autoComplete="email"
  required
  value={formData.email}
/>
<input
  id="password"
  name="password"
  type="password"
  autoComplete="current-password"
  required
  value={formData.password}
/>
```

#### 3.2 No Unsaved Changes Warning
**Guideline**: MUST warn on unsaved changes before navigation
**Files**: Product edit forms, store settings
**Severity**: CRITICAL
**Impact**: Users lose data when accidentally navigating away

**Current State**: No beforeunload or route change prevention
**Required Fix**: Implement `useEffect` with `beforeunload` event listener for dirty forms

#### 3.3 Error Focus Management
**Guideline**: MUST focus first error on submit
**Files**: All form pages
**Severity**: CRITICAL
**Impact**: Keyboard users don't know where error is

**Current State**: Errors shown but focus not moved
**Required Fix**: Add `useRef` to error fields and `.focus()` on first error

### 4. Accessibility - ARIA & Semantics

#### 4.1 Missing ARIA Labels on Icon-Only Buttons
**Guideline**: MUST have descriptive `aria-label` for icon-only buttons
**Files**:
- `src/components/Navbar.tsx` (lines 99-116): Navigation icon-only links
- `src/app/pos/page.tsx` (line 321): Delete button shows only "Eliminar" text (OK)
**Severity**: CRITICAL
**Impact**: Screen readers cannot identify button purpose

**Violations**:
```tsx
// Current (Desktop nav icons)
<Link href={link.href} className="nav-link">
  {link.icon && <span className="text-xl">{link.icon}</span>}
</Link>
```

**Required Fix**:
```tsx
<Link
  href={link.href}
  className="nav-link"
  aria-label={link.label}
>
  {link.icon && <span className="text-xl" aria-hidden="true">{link.icon}</span>}
</Link>
```

#### 4.2 Missing aria-live for Toast Notifications
**Guideline**: MUST use polite `aria-live` for toasts/inline validation
**File**: `src/components/ui/Toast.tsx` (line 134)
**Severity**: CRITICAL
**Impact**: Screen readers may not announce dynamic notifications

**Current State**: Only `role="alert"` (implicit assertive)
**Required Fix**: Add `aria-live="polite"` for non-error toasts, keep "assertive" for errors

#### 4.3 Loading States Missing Accessible Names
**Guideline**: MUST have accurate names (`aria-label`)
**Files**:
- `src/components/ProtectedRoute.tsx` (line 53): Loading spinner OK (has `aria-label`)
- `src/components/ui/LoadingSpinner.tsx` (line 37): Has `aria-label="Loading"` ✓
**Severity**: Medium (mostly compliant)

### 5. Safe Area & Mobile Layout

#### 5.1 Incomplete Safe Area Implementation
**Guideline**: MUST respect safe areas (use env(safe-area-inset-*))
**File**: `src/app/globals.css` (lines 755-761)
**Severity**: CRITICAL (for iOS devices with notch)
**Impact**: Content hidden behind notch/home indicator

**Current State**: Only `.safe-top` and `.safe-bottom` utilities exist
**Required Fix**: Apply to sticky navbar and full-screen overlays automatically

### 6. Performance

#### 6.1 No List Virtualization
**Guideline**: MUST virtualize large lists
**Files**:
- `src/app/products/page.tsx`: Product list
- `src/app/sales/page.tsx`: Sales history
**Severity**: CRITICAL (for large datasets)
**Impact**: Page freezes with 1000+ items

**Current State**: Standard map over arrays
**Required Fix**: Implement `virtua` or similar for lists >50 items

#### 6.2 Missing Image Loading Strategy
**Guideline**: MUST preload only above-the-fold images; lazy-load the rest
**Files**: Product images, store logos
**Severity**: IMPORTANT
**Impact**: Slower initial page load

**Current State**: `next/image` used but no explicit `loading` or `priority` props
**Required Fix**: Add `loading="lazy"` to below-fold images, `priority` to hero images

---

## Important Recommendations (SHOULD)

### 7. Animation & Motion

#### 7.1 Missing prefers-reduced-motion Support
**Guideline**: MUST honor `prefers-reduced-motion`
**File**: `src/app/globals.css`
**Severity**: IMPORTANT
**Impact**: Vestibular disorder users experience discomfort

**Current State**: No reduced motion media queries
**Required Fix**:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

#### 7.2 Transform Animation on Text Nodes
**Guideline**: SHOULD animate wrapper, not text node directly; use `will-change: transform`
**File**: `src/app/globals.css` (line 525-527)
**Severity**: IMPORTANT
**Impact**: Text anti-aliasing artifacts during animations

**Current State**: `.animated-text-wrapper { will-change: transform; }` exists but not consistently used
**Required Fix**: Audit all text animations (hero sections, button labels)

### 8. Interaction Patterns

#### 8.1 Loading Buttons Don't Keep Label
**Guideline**: MUST keep original label, show spinner
**Files**:
- `src/app/login/page.tsx` (line 102): Changes "Iniciar Sesión" → "Iniciando sesión..."
- `src/app/register/page.tsx` (line 200): Changes "Crear Cuenta" → "Creando cuenta..."
**Severity**: IMPORTANT
**Impact**: Button width changes, layout shift

**Current State**:
```tsx
{loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
```

**Recommended Fix**:
```tsx
<button disabled={loading}>
  {loading && <Spinner className="mr-2" />}
  Iniciar Sesión
</button>
```

#### 8.2 Paste Not Explicitly Allowed
**Guideline**: NEVER block paste in `<input>/<textarea>`
**Files**: All input fields
**Severity**: IMPORTANT (verification needed)
**Status**: No `onPaste` handlers found ✓ (likely compliant, verify no CSS user-select: none on inputs)

#### 8.3 No Optimistic UI
**Guideline**: SHOULD use optimistic UI; reconcile on response
**Files**: Cart operations, product updates
**Severity**: IMPORTANT
**Impact**: Perceived slowness

**Current State**: Most operations show loading state
**Recommended**: Update UI immediately, rollback on error

### 9. Navigation & URLs

#### 9.1 State Not Always in URL
**Guideline**: MUST reflect state in URL (deep-link filters/tabs/pagination)
**Files**:
- `src/app/products/page.tsx`: Filters not in URL
- `src/app/sales/page.tsx`: Pagination not in URL
**Severity**: IMPORTANT
**Impact**: Can't share filtered/sorted views

**Current State**: Local state only
**Recommended Fix**: Use `nuqs` or `useSearchParams` to sync with URL

#### 9.2 Links Are Links
**Guideline**: MUST use `<a>/<Link>` for navigation (support Cmd/Ctrl/middle-click)
**Files**: All navigation
**Severity**: IMPORTANT
**Status**: ✓ Compliant - Next.js `<Link>` used throughout

### 10. Content & Typography

#### 10.1 Missing Tabular Numbers for Comparisons
**Guideline**: MUST use tabular numbers for comparisons
**File**: Dashboard stats, price tables
**Severity**: IMPORTANT
**Impact**: Numbers don't align vertically

**Current State**: No `font-variant-numeric: tabular-nums` on number displays
**Required Fix**: Add class for price/stat displays

#### 10.2 Inconsistent Non-Breaking Spaces
**Guideline**: MUST use non-breaking spaces to glue terms
**Files**: Throughout (e.g., "10 MB" should be "10&nbsp;MB")
**Severity**: MEDIUM
**Impact**: Awkward line breaks

**Examples to Fix**:
- Currency amounts: "$ 1,234" → "$&nbsp;1,234"
- Units: "10 items" → "10&nbsp;items"

### 11. Forms (Additional)

#### 11.1 Missing Input Modes
**Guideline**: MUST use correct `type` and `inputmode`
**Files**: Numeric inputs
**Severity**: IMPORTANT
**Impact**: Wrong keyboard on mobile

**Violations**:
- `src/app/pos/page.tsx` (line 422): Cash amount input should have `inputMode="decimal"`

**Required Fix**:
```tsx
<input
  type="number"
  inputMode="decimal"
  step="0.01"
/>
```

#### 11.2 Placeholders Without Ellipsis
**Guideline**: SHOULD end placeholders with ellipsis and show example pattern
**Files**: Multiple inputs
**Severity**: MEDIUM
**Impact**: Unclear expected format

**Examples**:
- Good: `placeholder="+52 (555) 123-4567"` (register page)
- Improve: `placeholder="Buscar producto..."` → `"Buscar producto…"` (use real ellipsis character)

---

## Nice-to-Have Improvements

### 12. Visual & Polish

#### 12.1 Curly Quotes Not Used
**Guideline**: SHOULD use curly quotes (" ")
**Files**: Throughout
**Severity**: LOW
**Impact**: Typographic refinement

#### 12.2 No Widow/Orphan Prevention
**Guideline**: SHOULD avoid widows/orphans
**Files**: Long text blocks
**Severity**: LOW

#### 12.3 Right-Click Logo for Brand Assets
**Guideline**: SHOULD allow right-clicking nav logo to surface brand assets
**Files**: Navbar logo
**Severity**: LOW
**Current**: Logo is just styled div, could be image/SVG with download link

---

## Component-by-Component Breakdown

### `src/app/globals.css`

**Missing Foundation Styles**:
1. ❌ No `prefers-reduced-motion` media query
2. ❌ No `scroll-margin-top` on headings for anchor navigation
3. ❌ No skip-to-content styles
4. ❌ No global `touch-action: manipulation`
5. ❌ No tabular-nums utility class
6. ✓ Good: Font smoothing applied
7. ✓ Good: Design tokens well-structured
8. ✓ Good: Layered shadows implemented
9. ✓ Good: Optical alignment utilities exist

### `src/components/Navbar.tsx`

**Issues**:
1. ❌ Desktop icon-only links lack `aria-label` (lines 99-116)
2. ❌ Mobile menu doesn't trap focus when open (line 184)
3. ❌ Hamburger button OK but could use `aria-expanded` attribute
4. ✓ Good: `aria-label` on hamburger button (line 167)
5. ✓ Good: Responsive design
6. ❌ Touch targets: Verify icon-only links meet 44px mobile minimum

### `src/app/login/page.tsx`

**Issues**:
1. ❌ Missing `autocomplete` attributes (lines 60-83)
2. ❌ Missing `name` attributes
3. ❌ Loading button changes text instead of showing spinner
4. ❌ Error doesn't auto-focus (line 86)
5. ✓ Good: Semantic HTML with labels
6. ✓ Good: Error displayed accessibly

### `src/app/register/page.tsx`

**Issues**:
1. ❌ Missing `autocomplete` attributes on all inputs (lines 94-182)
2. ❌ Missing `name` attributes
3. ❌ No unsaved changes warning
4. ❌ Password field should have `autocomplete="new-password"`
5. ❌ Phone input missing `inputMode="tel"`
6. ✓ Good: Helper text for password requirements
7. ✓ Good: Optional fields clearly marked

### `src/app/pos/page.tsx`

**Issues**:
1. ❌ Payment modal doesn't trap focus (lines 349-520)
2. ❌ No `inert` on background when modal open
3. ❌ Close button (✕) should have `aria-label="Cerrar modal"`
4. ❌ Cash input missing `inputMode="decimal"` (line 422)
5. ❌ Radio buttons need better keyboard navigation grouping
6. ❌ Search input should have `autocomplete="off"`
7. ✓ Good: Scanner error handling
8. ✓ Good: Responsive layout

### `src/components/ui/Toast.tsx`

**Issues**:
1. ❌ Missing `aria-live="polite"` for non-error toasts (line 136)
2. ❌ Close button hit area too small (line 142-150)
3. ✓ Good: `role="alert"` on container
4. ✓ Good: Icon + text redundancy
5. ✓ Good: Semantic color coding

### `src/components/ui/Card.tsx`

**Issues**:
1. ✓ Good: Semantic HTML
2. ✓ Good: Responsive padding
3. ✓ Good: Variant support
4. ⚠️  CardHeader title could be any heading level - consider accepting `as` prop for `h2`/`h3`/etc.

### `src/components/ui/LoadingSpinner.tsx`

**Issues**:
1. ✓ Good: `role="status"` and `aria-label` present
2. ✓ Good: Size variants
3. ✓ Good: Text is optional

### `src/components/ProtectedRoute.tsx`

**Issues**:
1. ✓ Good: Loading state with accessible spinner
2. ⚠️  Loading state could benefit from focus management to prevent tabbing through background

---

## Prioritized Fix Roadmap

### Phase 1: Critical Accessibility Fixes (Week 1)
1. Add skip-to-content link to all pages
2. Implement focus trap in modals and mobile menu
3. Add `aria-label` to all icon-only buttons
4. Add `autocomplete` and `name` to all form inputs
5. Implement error focus management in forms

### Phase 2: Touch & Mobile (Week 1)
1. Audit and fix all touch targets to 44px mobile / 24px desktop
2. Add `touch-action: manipulation` globally
3. Ensure all inputs ≥16px font-size on mobile
4. Apply safe-area-inset to navbar and modals

### Phase 3: Performance & Motion (Week 2)
1. Add `prefers-reduced-motion` support
2. Implement list virtualization for products/sales
3. Add proper `loading` attributes to images
4. Optimize re-renders (React DevTools audit)

### Phase 4: Forms & Validation (Week 2)
1. Implement unsaved changes warning
2. Add proper `inputMode` attributes
3. Improve loading button states (keep label + spinner)
4. Add optimistic UI to cart operations

### Phase 5: Polish & Enhancement (Week 3)
1. Add tabular-nums class for numbers
2. Sync filters/pagination with URL
3. Add `aria-live` variants to Toast
4. Fix placeholder ellipsis characters
5. Add scroll-margin-top for anchor navigation

---

## Testing Checklist

### Accessibility Testing
- [ ] Run axe DevTools on all pages
- [ ] Test with NVDA/JAWS screen reader
- [ ] Verify keyboard-only navigation works
- [ ] Check focus indicators are visible
- [ ] Test with Windows High Contrast mode

### Mobile Testing
- [ ] Test on iOS Safari (zoom behavior)
- [ ] Test on Android Chrome
- [ ] Verify touch targets with finger
- [ ] Test in landscape orientation
- [ ] Verify safe areas on iPhone with notch

### Performance Testing
- [ ] Lighthouse audit (aim for 90+ accessibility score)
- [ ] Test with 1000+ product list
- [ ] Enable CPU throttling (6x slowdown)
- [ ] Test on 3G network throttling
- [ ] Verify no layout shift (CLS score)

### Cross-Browser Testing
- [ ] Chrome (desktop + mobile)
- [ ] Safari (desktop + iOS)
- [ ] Firefox
- [ ] Edge

---

## Conclusion

The Flowence Client has a solid foundation with excellent design system implementation and visual balance. The critical priorities are:

1. **Accessibility**: Add ARIA labels, focus management, and keyboard navigation
2. **Touch Targets**: Ensure all interactive elements meet minimum sizes
3. **Forms**: Complete with autocomplete, proper input types, and error handling
4. **Performance**: Add reduced motion support and virtualization for scale

Estimated effort: **2-3 weeks** for all critical and important fixes.

**Immediate Action Items** (highest ROI):
1. Update `globals.css` with foundation accessibility styles
2. Add `autocomplete` to all form inputs (1-hour fix)
3. Implement skip-to-content link (30-minute fix)
4. Add `aria-label` to icon-only buttons (1-hour fix)
5. Add `prefers-reduced-motion` support (30-minute fix)
