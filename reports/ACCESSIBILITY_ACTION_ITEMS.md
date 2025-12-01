# Accessibility Action Items - Remaining Tasks

**Flowence Client - Post-Implementation Checklist**

This document tracks remaining accessibility tasks after the initial Web Interface Guidelines implementation.

---

## Critical Priority (Complete Before Production)

### 1. Skip-to-Content Link Implementation
**Status**: Foundation in globals.css ✅, needs layout integration ⏳

**Files to modify**:
- `src/app/layout.tsx`

**Implementation**:
```tsx
// Add before <Navbar />
<a href="#main-content" className="skip-to-content">
  Skip to main content
</a>

// Add id to main
<main id="main-content">
  {children}
</main>
```

**Testing**:
- [ ] Press Tab key on page load - link should appear
- [ ] Press Enter - should scroll to main content
- [ ] Test with screen reader

**Estimated Time**: 15 minutes

---

### 2. Focus Trap in Modals
**Status**: Not implemented ⏳

**Affected Components**:
- `src/app/pos/page.tsx` - Payment modal
- Any future modals

**Recommended Library**: `focus-trap-react`

**Implementation**:
```tsx
import FocusTrap from 'focus-trap-react';

// In payment modal
<FocusTrap>
  <div role="dialog" aria-modal="true">
    {/* modal content */}
  </div>
</FocusTrap>
```

**Testing**:
- [ ] Tab should cycle only within modal
- [ ] Shift+Tab should cycle backwards within modal
- [ ] Escape key should close modal and return focus
- [ ] Focus should return to trigger button on close

**Estimated Time**: 1-2 hours

---

### 3. Focus Trap in Mobile Menu
**Status**: Not implemented ⏳

**Affected Components**:
- `src/components/Navbar.tsx` - Mobile menu

**Implementation**:
```tsx
import FocusTrap from 'focus-trap-react';

{mobileMenuOpen && (
  <FocusTrap>
    <div id="mobile-menu" role="dialog" aria-modal="true">
      {/* menu content */}
    </div>
  </FocusTrap>
)}
```

**Testing**:
- [ ] Open mobile menu - focus should move to first link
- [ ] Tab should cycle only within menu
- [ ] Close menu - focus should return to hamburger button
- [ ] Test on actual mobile device

**Estimated Time**: 1 hour

---

### 4. Inert Background During Modals
**Status**: CSS ready ✅, needs JavaScript implementation ⏳

**Affected Components**:
- `src/app/pos/page.tsx` - Payment modal
- `src/components/Navbar.tsx` - Mobile menu

**Implementation** (React 19+):
```tsx
// When modal opens
<main inert={showPayment ? true : undefined}>
  {children}
</main>
```

**For React 18**, use `react-inert`:
```tsx
import { useInert } from 'react-inert';

const mainRef = useRef<HTMLDivElement>(null);
useInert(mainRef, showPayment);
```

**Testing**:
- [ ] Open modal - background should not be clickable
- [ ] Tab should not reach background elements
- [ ] Screen reader should not read background content

**Estimated Time**: 30 minutes

---

### 5. Error Focus Management
**Status**: Not implemented ⏳

**Affected Components**:
- `src/app/login/page.tsx`
- `src/app/register/page.tsx`
- All forms

**Implementation**:
```tsx
const emailRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  if (error && emailRef.current) {
    emailRef.current.focus();
  }
}, [error]);

<input ref={emailRef} ... />
```

**Testing**:
- [ ] Submit form with errors - focus should move to first error field
- [ ] Keyboard users should immediately know where the error is
- [ ] Screen reader should announce error

**Estimated Time**: 30 minutes per form (2 hours total)

---

## High Priority (Complete Within Sprint)

### 6. Unsaved Changes Warning
**Status**: Not implemented ⏳

**Affected Components**:
- `src/app/products/page.tsx` - Product edit
- `src/app/stores/[id]/settings/page.tsx` - Store settings
- Any forms that modify data

**Implementation**:
```tsx
const [isDirty, setIsDirty] = useState(false);

useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [isDirty]);

// Also prevent Next.js navigation
useEffect(() => {
  const handleRouteChange = () => {
    if (isDirty && !confirm('You have unsaved changes. Leave anyway?')) {
      router.events.emit('routeChangeError');
      throw 'Route change aborted';
    }
  };

  router.events.on('routeChangeStart', handleRouteChange);
  return () => router.events.off('routeChangeStart', handleRouteChange);
}, [isDirty]);
```

**Testing**:
- [ ] Make changes to form
- [ ] Try to close tab/window - should warn
- [ ] Try to navigate away - should warn
- [ ] Save form - warning should disappear

**Estimated Time**: 2 hours

---

### 7. Autocomplete for Search Inputs
**Status**: Partially implemented ⏳

**Affected Components**:
- `src/app/pos/page.tsx` - Product search
- `src/app/products/page.tsx` - Product filter
- `src/app/sales/page.tsx` - Sales filter

**Implementation**:
```tsx
<input
  type="search"
  autoComplete="off"
  aria-label="Search products"
  placeholder="Search…"
/>
```

**Testing**:
- [ ] Browser should not suggest previous searches
- [ ] Screen reader should announce search purpose

**Estimated Time**: 30 minutes

---

## Medium Priority (Complete This Quarter)

### 8. List Virtualization
**Status**: Not implemented ⏳

**Affected Components**:
- `src/app/products/page.tsx` - Product list (performance)
- `src/app/sales/page.tsx` - Sales history (performance)

**Recommended Library**: `virtua` or `react-window`

**Implementation**:
```tsx
import { VirtualScroller } from 'virtua';

<VirtualScroller>
  {products.map(product => (
    <ProductCard key={product.id} product={product} />
  ))}
</VirtualScroller>
```

**Testing**:
- [ ] Test with 1000+ products
- [ ] Verify smooth scrolling
- [ ] Check keyboard navigation still works
- [ ] Ensure screen reader can navigate

**Estimated Time**: 4 hours

---

### 9. URL State Management
**Status**: Not implemented ⏳

**Affected Components**:
- `src/app/products/page.tsx` - Filters and pagination
- `src/app/sales/page.tsx` - Filters and pagination

**Recommended Library**: `nuqs`

**Implementation**:
```tsx
import { useQueryState } from 'nuqs';

const [search, setSearch] = useQueryState('search');
const [category, setCategory] = useQueryState('category');
const [page, setPage] = useQueryState('page', { defaultValue: '1' });
```

**Testing**:
- [ ] Apply filters - URL should update
- [ ] Copy URL - filters should persist on new load
- [ ] Use browser back/forward - filters should change
- [ ] Share URL - recipient sees same filtered view

**Estimated Time**: 3 hours

---

### 10. Optimistic UI for Cart
**Status**: Not implemented ⏳

**Affected Components**:
- `src/contexts/CartContext.tsx`
- `src/app/pos/page.tsx`

**Implementation**:
```tsx
const addItem = async (product: Product, quantity: number) => {
  // Optimistic update
  setItems(prev => [...prev, { product, quantity }]);

  try {
    await validateStock(product.id, quantity);
  } catch (error) {
    // Rollback on error
    setItems(prev => prev.filter(item => item.product.id !== product.id));
    toast.error('Stock not available');
  }
};
```

**Testing**:
- [ ] Add item - should appear immediately
- [ ] Simulate stock error - should remove item and show toast
- [ ] Test with slow network

**Estimated Time**: 2 hours

---

### 11. Image Loading Strategy
**Status**: Not implemented ⏳

**Affected Components**:
- `src/app/page.tsx` - Landing page hero image
- `src/app/products/page.tsx` - Product images
- All pages with images

**Implementation**:
```tsx
// Above-the-fold images
<Image src="..." priority />

// Below-the-fold images
<Image src="..." loading="lazy" />
```

**Testing**:
- [ ] Check Network tab - priority images load first
- [ ] Scroll down - lazy images load as they enter viewport
- [ ] Run Lighthouse - verify good LCP score

**Estimated Time**: 1 hour

---

## Low Priority (Nice-to-Have)

### 12. Curly Quotes
**Status**: Not implemented ⏳

**Global search and replace**:
- Find: `"`
- Replace: `"` or `"` (contextual)

**Estimated Time**: 30 minutes

---

### 13. Non-Breaking Spaces
**Status**: Not implemented ⏳

**Patterns to fix**:
- Currency: `$1,234` → `$&nbsp;1,234`
- Units: `10 items` → `10&nbsp;items`
- Keyboard shortcuts: `⌘ + K` → `⌘&nbsp;+&nbsp;K`

**Estimated Time**: 1 hour

---

### 14. Logo Right-Click Context Menu
**Status**: Not implemented ⏳

**Affected Components**:
- `src/components/Navbar.tsx` - Logo

**Implementation**:
```tsx
<a
  href="/"
  onContextMenu={(e) => {
    e.preventDefault();
    // Show custom context menu with:
    // - Download Logo (SVG)
    // - Download Logo (PNG)
    // - View Brand Guidelines
  }}
>
  <Logo />
</a>
```

**Estimated Time**: 2 hours

---

## Testing Checklist

### Before Each PR Merge

#### Accessibility Testing
- [ ] Run axe DevTools on all modified pages (0 violations)
- [ ] Test keyboard navigation through all interactive elements
- [ ] Test with screen reader (NVDA or JAWS)
- [ ] Verify focus indicators are visible
- [ ] Check color contrast meets APCA standards
- [ ] Test with browser zoom at 200%

#### Mobile Testing
- [ ] Test on iOS Safari (iPhone)
- [ ] Test on Android Chrome
- [ ] Verify touch targets are at least 44px
- [ ] Test in portrait and landscape
- [ ] Test on device with notch (safe areas)
- [ ] Verify no zoom on input focus

#### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari
- [ ] Mobile Chrome

#### Performance Testing
- [ ] Run Lighthouse audit (target: 90+ accessibility)
- [ ] Check for layout shifts (CLS < 0.1)
- [ ] Verify fast page loads (LCP < 2.5s)
- [ ] Test with CPU throttling (6x slowdown)
- [ ] Test with network throttling (Fast 3G)

#### Motion Testing
- [ ] Enable "Reduce Motion" in OS
- [ ] Verify all animations are disabled
- [ ] Check that transitions still show state changes

---

## Sprint Planning

### Sprint 1 (Week 1)
- [x] Foundation accessibility styles in globals.css
- [x] Toast notifications accessibility
- [x] Login form accessibility
- [x] Register form accessibility
- [x] Navbar accessibility
- [x] POS modal accessibility
- [ ] Skip-to-content implementation
- [ ] Focus trap in modals
- [ ] Focus trap in mobile menu

### Sprint 2 (Week 2)
- [ ] Inert background implementation
- [ ] Error focus management
- [ ] Unsaved changes warning
- [ ] Search input autocomplete
- [ ] Testing and bug fixes

### Sprint 3 (Week 3)
- [ ] List virtualization
- [ ] URL state management
- [ ] Optimistic UI for cart
- [ ] Image loading strategy
- [ ] Comprehensive testing

### Sprint 4 (Week 4)
- [ ] Polish and refinements
- [ ] Curly quotes
- [ ] Non-breaking spaces
- [ ] Logo context menu
- [ ] Final testing and documentation

---

## Success Metrics

### Target Scores
- **Lighthouse Accessibility**: 95+ (currently ~85-90)
- **Lighthouse Performance**: 90+
- **Lighthouse SEO**: 95+
- **CLS**: < 0.1
- **LCP**: < 2.5s
- **FID**: < 100ms

### Qualitative Metrics
- [ ] Keyboard users can navigate entire site
- [ ] Screen reader users can complete all tasks
- [ ] Mobile users can tap all buttons easily
- [ ] Forms work with password managers
- [ ] No user complaints about motion/animations
- [ ] Zero critical accessibility violations

---

## Resources

### Documentation
- [Web Interface Guidelines](./WEB_INTERFACE_AUDIT.md)
- [Implementation Summary](./WEB_INTERFACE_IMPLEMENTATION_SUMMARY.md)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

### Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [APCA Contrast Calculator](https://apcacontrast.com/)

### Libraries
- [focus-trap-react](https://github.com/focus-trap/focus-trap-react)
- [react-inert](https://github.com/theKashey/react-inert)
- [nuqs](https://nuqs.dev/)
- [virtua](https://github.com/inokawa/virtua)

---

## Notes

- All changes should maintain design system consistency
- Use existing Tailwind classes when possible
- Add comments referencing guidelines
- Update tests for new behaviors
- Document any breaking changes

---

**Last Updated**: 2025-11-29
**Status**: Foundation Complete ✅, Enhancements In Progress ⏳
**Next Review**: After Sprint 1 completion
