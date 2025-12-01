# Mobile Navigation Menu - Accessibility & UX Fixes

## Summary of Changes

Fixed the mobile navigation menu in `src/components/Navbar.tsx` to prevent background scrolling and ensure proper accessibility compliance with Web Interface Guidelines.

## Changes Implemented

### 1. Body Scroll Lock (iOS-Safe)
- **Problem**: Users could scroll the background page when mobile menu was open
- **Solution**: Implemented iOS-safe body scroll lock using `position: fixed` technique
- **Details**:
  - Saves scroll position before locking (`scrollYRef.current`)
  - Applies `position: fixed` with negative `top` offset to maintain visual position
  - Sets `left`, `right`, and `overflow` to prevent scroll on all devices
  - Restores scroll position when menu closes using `window.scrollTo()`

```typescript
// Lock body scroll
document.body.style.position = 'fixed';
document.body.style.top = `-${scrollYRef.current}px`;
document.body.style.left = '0';
document.body.style.right = '0';
document.body.style.overflow = 'hidden';

// Restore on cleanup
window.scrollTo(0, scrollYRef.current);
```

### 2. Focus Trap
- **Problem**: Tab key could move focus outside the mobile menu
- **Solution**: Implemented keyboard focus trap that cycles through menu items
- **Details**:
  - Tab on last element wraps to first element
  - Shift+Tab on first element wraps to last element
  - Only focuses on interactive elements: `a[href], button:not([disabled])`

```typescript
// Tab trap logic
if (e.key === 'Tab') {
  const focusableElements = menuRef.current?.querySelectorAll(
    'a[href], button:not([disabled])'
  );
  // ... trap logic
}
```

### 3. ESC Key to Close
- **Problem**: No keyboard way to dismiss the menu
- **Solution**: ESC key closes menu and returns focus to hamburger button
- **Details**:
  - Listens for `Escape` key event
  - Closes menu and restores focus in one action

```typescript
if (e.key === 'Escape') {
  setMobileMenuOpen(false);
  hamburgerButtonRef.current?.focus();
}
```

### 4. Focus Management
- **Problem**: Focus not properly managed when opening/closing menu
- **Solution**: Automatic focus management for optimal UX
- **Details**:
  - When menu opens: focus first interactive element (link or button)
  - When menu closes: return focus to hamburger button
  - Prevents keyboard users from losing their place

```typescript
useEffect(() => {
  if (mobileMenuOpen && menuRef.current) {
    const firstLink = menuRef.current.querySelector('a[href], button') as HTMLElement;
    firstLink?.focus();
  } else if (!mobileMenuOpen && hamburgerButtonRef.current) {
    hamburgerButtonRef.current.focus();
  }
}, [mobileMenuOpen]);
```

### 5. Accessibility Attributes
- **Problem**: Screen readers didn't understand menu as a modal dialog
- **Solution**: Added proper ARIA attributes to mobile menu
- **Details**:
  - `role="dialog"` - Identifies as modal dialog
  - `aria-modal="true"` - Indicates modal behavior
  - `aria-label="Menú de navegación móvil"` - Descriptive label
  - `id="mobile-menu"` - Linked to hamburger button's `aria-controls`

### 6. Overscroll Containment
- **Problem**: On iOS, overscroll could trigger page bounce/navigation gestures
- **Solution**: Added `overscroll-contain` CSS class
- **Details**:
  - Prevents overscroll behavior from propagating to parent elements
  - Improves mobile UX, especially on iOS Safari

### 7. Fixed Positioning
- **Problem**: Menu positioning was relative, allowing background interaction
- **Solution**: Changed menu to `fixed inset-0 top-16` positioning
- **Details**:
  - Covers entire viewport below navbar
  - `z-40` ensures it's above background content
  - `top-16` accounts for navbar height

## Files Modified

1. **`src/components/Navbar.tsx`**
   - Added `useRef` hooks for menu and hamburger button
   - Added 3 new `useEffect` hooks for scroll lock, focus trap, and focus management
   - Updated mobile menu JSX with accessibility attributes
   - Changed menu positioning from relative to fixed

## Testing Checklist

### Functional Testing
- [x] Mobile menu opens and prevents background scroll
- [x] Tab cycles only through menu items (first → last → first)
- [x] Shift+Tab cycles backwards through menu items
- [x] ESC key closes menu
- [x] Clicking hamburger button toggles menu
- [x] Focus returns to hamburger button when menu closes
- [x] Scroll position is preserved when menu closes
- [x] Background content is non-interactive when menu is open

### Cross-Browser Testing
- [ ] Chrome (Android & Desktop)
- [ ] Safari (iOS & Desktop)
- [ ] Firefox (Android & Desktop)
- [ ] Edge (Desktop)

### Accessibility Testing
- [ ] Screen reader announces menu as modal dialog
- [ ] Keyboard-only navigation works completely
- [ ] Focus indicators visible on all interactive elements
- [ ] No keyboard traps (ESC always works)

### iOS Safari Specific
**CRITICAL**: iOS Safari is notoriously difficult for scroll locking. Test thoroughly:
- [ ] Body scroll locked on iPhone (Safari)
- [ ] Body scroll locked on iPad (Safari)
- [ ] No rubber-band scroll effect when menu is open
- [ ] Scroll position correctly restored on close
- [ ] No layout shifts when opening/closing menu
- [ ] Touch gestures don't break the lock

## Web Interface Guidelines Compliance

✅ **Focus trap** - MUST for modals/overlays
✅ **ESC to close** - MUST for dismissible overlays
✅ **Inert background** - SHOULD for full-screen overlays (achieved via fixed positioning)
✅ **Restore focus** - MUST for accessibility
✅ **Prevent scroll** - UX best practice
✅ **Keyboard navigation** - Full keyboard support per WAI-ARIA APG
✅ **Visible focus rings** - Using existing `focus-contrast` utility
✅ **Accessible ARIA** - `role="dialog"`, `aria-modal="true"`, `aria-label`

## Known Limitations

1. **Scroll position preservation**: The current implementation works for most cases, but if the page has unusual positioning (e.g., `position: sticky` elements), there might be slight visual jumps. This is an inherent limitation of the `position: fixed` technique.

2. **iOS momentum scrolling**: On some iOS versions, there might be residual momentum scrolling that can't be fully prevented. The `overscroll-contain` class mitigates this.

3. **Browser zoom**: If users have zoomed the page, the scroll restoration might be slightly off by a few pixels. This is acceptable UX trade-off.

## Performance Considerations

- **No unnecessary re-renders**: Focus management and scroll lock only run when `mobileMenuOpen` changes
- **Event listener cleanup**: All event listeners are properly cleaned up in `useEffect` return functions
- **Efficient selectors**: Focus trap only queries for focusable elements when needed
- **No layout thrashing**: Body style changes are batched in a single update

## Future Enhancements

1. **Animation polish**: Add smooth transitions for focus indicators
2. **Swipe-to-close**: Add touch gesture support for closing menu
3. **Background blur**: Add backdrop-filter blur when menu is open (performance permitting)
4. **Prefetch on hover**: Prefetch linked pages when user hovers over menu items

## Resources

- [WAI-ARIA APG - Dialog Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [iOS Body Scroll Lock Techniques](https://markus.oberlehner.net/blog/simple-solution-to-prevent-body-scrolling-on-ios/)
- [Focus Management Best Practices](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
