# BEM Naming Migration Guide

## Overview

This document outlines the plan to migrate CSS classes from the current naming convention to BEM (Block __ Element -- Modifier) for improved maintainability and scalability.

## Current State

The codebase currently uses mixed naming conventions:
- Some BEM-like: `.package-card`, `.package-header`
- Generic: `.marketing-banner`, `.variable-title`
- Too generic: `.info-item`, `.tag`

## BEM Structure

### Format
```
.block__element--modifier
```

### Examples

| Current | BEM Migration |
|---------|---------------|
| `.package-card` | `.package__card` |
| `.package-header` | `.package__header` |
| `.p-name` | `.package__name` |
| `.p-price` | `.package__price` |
| `.about-section` | `.about__section` |
| `.about-text` | `.about__text` |
| `.about-stat` | `.about__stat` |
| `.about-features` | `.about__features` |
| `.bento-grid` | `.bento__grid` |
| `.bento-item` | `.bento__item` |
| `.modal-overlay` | `.modal__overlay` |
| `.modal-content` | `.modal__content` |
| `.btn-primary` | `.button--primary` |
| `.btn-secondary` | `.button--secondary` |

## Migration Priority

### Phase 1: Core Components (High Priority)
- [ ] Package selector (`.package-*`)
- [ ] Modal system (`.modal-*`, `.booking-modal-*`)
- [ ] Button hierarchy (`.btn-*`)

### Phase 2: Layout Components (Medium Priority)
- [ ] Bento grid (`.bento-*`)
- [ ] About section (`.about-*`)
- [ ] Header (`.header-*`)

### Phase 3: Utility Classes (Low Priority)
- [ ] Info items (`.info-*`)
- [ ] Tags (`.tag-*`)
- [ ] Badges (`.badge-*`)

## Implementation Steps

1. **Add new BEM classes alongside existing classes** (do not remove old classes yet)
2. **Update CSS to use BEM selectors**
3. **Test thoroughly**
4. **Remove old class names from HTML**
5. **Remove old CSS rules**

## Example Migration

### Before
```html
<div class="package-card active" data-package="Premium">
    <span class="p-badge">Most Popular</span>
    <span class="p-name">Premium</span>
    <span class="p-desc">Animated + RSVP</span>
    <span class="p-price">RM 99</span>
</div>
```

### After
```html
<div class="package__card package__card--active" data-package="Premium">
    <span class="package__badge package__badge--gold">Most Popular</span>
    <span class="package__name">Premium</span>
    <span class="package__description">Animated + RSVP</span>
    <span class="package__price">RM 99</span>
</div>
```

### CSS Migration
```css
/* Add new BEM classes */
.package__card {
    /* existing .package-card styles */
}

.package__card--active {
    /* existing .package-card.active styles */
}

.package__badge {
    /* existing .p-badge styles */
}

.package__badge--gold {
    /* gold badge variant */
}

.package__name {
    /* existing .p-name styles */
}

.package__description {
    /* existing .p-desc styles */
}

.package__price {
    /* existing .p-price styles */
}
```

## Benefits

1. **Clear hierarchy**: Easy to see which elements belong to which block
2. **No nesting conflicts**: No need for deeply nested selectors
3. **Reusability**: Blocks can be moved anywhere without breaking styles
4. **Maintainability**: New developers can understand the structure quickly
5. **Specificity control**: Avoids CSS specificity wars

## Tools

- **BEM Validator**: Browser extension to check BEM compliance
- **PostCSS BEM Linter**: Automated linting for BEM naming
- **CSS Modules**: Consider for future framework migration

## Timeline

| Phase | Components | Estimated Time |
|-------|------------|----------------|
| 1 | Package, Modal, Buttons | 4-6 hours |
| 2 | Bento, About, Header | 3-4 hours |
| 3 | Utilities | 2-3 hours |
| **Total** | **All components** | **9-13 hours** |

## Notes

- This migration should be done during a development cycle, not before a release
- Each phase should be tested independently
- Consider using a CSS-in-JS solution or preprocessor for future projects to enforce BEM automatically
