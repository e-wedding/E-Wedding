# 🎨 Customization Guide - Rustic Garden Template

Complete guide to customizing every aspect of your rustic garden wedding invitation.

---

## 📝 Table of Contents

1. [Text Content](#text-content)
2. [Colors & Fonts](#colors--fonts)
3. [Images & Media](#images--media)
4. [Features](#features)
5. [Advanced Customization](#advanced-customization)

---

## Text Content

### Couple Names

**Location:** `index.html` lines 85-91

```html
<h1 class="font-display ...">
    <span class="groom-first-name">Daniel</span>
    <span class="block font-handwritten ...">&</span>
    <span class="bride-first-name">Emilia</span>
</h1>
```

**Tip:** Keep names short (1-2 words each) for best visual impact.

### Parents' Names

**Location:** `index.html` lines 146-147 (Groom), 163-164 (Bride)

```html
<p class="font-body text-textLight">
    Putera kepada 
    <span class="font-medium text-primary groom-father">En. David</span> & 
    <span class="font-medium text-primary groom-mother">Pn. Deborah</span>
</p>
```

### Wedding Date & Time

**Location:** `index.html` lines 97-104

```html
<p class="font-display ... event-date">
    Sabtu, 15 Oktober 2027
</p>
<p class="font-handwritten ... event-time">
    11:00 Pagi - 5:00 Petang
</p>
```

### Venue Information

**Location:** `index.html` lines 107-108, 234-235

```html
<p class="event-venue-name">Taman Botani</p>
<p class="event-venue-address">Cowie Bay, Sabah</p>
```

---

## Colors & Fonts

### Color Variables

**Location:** `index.html` lines 28-40

```css
@theme {
    --color-primary: #8B7355;      /* Main brown */
    --color-secondary: #A89F91;    /* Secondary brown */
    --color-accent: #C77D63;       /* Terracotta */
    --color-sage: #9CAF88;         /* Sage green */
    --color-terracotta: #E5989B;   /* Pink terracotta */
    --color-cream: #FDF6E3;        /* Cream */
    --color-background: #FAF3E0;   /* Background */
    --color-textMain: #3D3026;     /* Main text */
    --color-textLight: #6B5D52;    /* Light text */
}
```

### Font Variables

**Location:** `index.html` lines 42-46

```css
--font-display: "Cormorant Garamond", serif;
--font-handwritten: "Yellowtail", cursive;
--font-sans: "Work Sans", sans-serif;
--font-body: "Alice", serif;
```

**Alternative Fonts:**
- Display: `Playfair Display`, `Cinzel`, `Lora`
- Handwritten: `Great Vibes`, `Caveat`, `Dancing Script`
- Body: `Lora`, `Merriweather`, `Source Serif Pro`

---

## Images & Media

### Hero Background

**Location:** `index.html` line 68

```html
<img src="https://images.unsplash.com/..." 
     alt="Garden wedding venue" 
     class="w-full h-full object-cover opacity-40">
```

**Recommended size:** 1920x1080px minimum

### Couple Photos

**Location:** `index.html` lines 140, 157

```html
<img src="https://images.unsplash.com/..." 
     alt="Portrait of groom/bride" 
     class="w-full h-full object-cover">
```

**Recommended size:** 800x1000px (4:5 aspect ratio)

### Background Music

**Location:** `src/main.js` line 209

```javascript
const audio = new Audio('assets/music/background.mp3');
```

**Add your music:**
1. Place MP3 file in `assets/music/background.mp3`
2. Recommended: Instrumental, acoustic, or piano versions
3. File size: Keep under 5MB for fast loading

---

## Features

### RSVP Form Fields

**Location:** `index.html` lines 268-307

**Add custom field:**
```html
<div>
    <label for="custom" class="sr-only">Custom Field</label>
    <input type="text" id="custom" name="custom" 
           placeholder="Your Question"
           class="w-full bg-transparent border-b-2 border-sage/30 py-3 px-0 focus:border-sage focus:outline-none transition-colors font-body text-lg">
</div>
```

### Gift Registry

**Location:** `index.html` lines 359-376

```html
<button class="gift-btn">
    <i class="ph ph-wallet text-2xl text-sage mb-2"></i>
    <p class="font-display text-sm tracking-widest">Touch 'n Go</p>
    <p class="font-body text-textLight text-sm mt-1">012-345 6789</p>
</button>
```

**To add more:** Copy the button block and change details.

### Social Media Links

**Location:** `index.html` lines 150, 167

```html
<a href="https://instagram.com/yourusername" 
   class="inline-flex items-center gap-2 mt-4 text-accent hover:text-primary transition-colors">
    <i class="ph ph-instagram-logo text-xl"></i>
    <span class="font-handwritten text-sm">@yourhandle</span>
</a>
```

---

## Advanced Customization

### Add New Section

**Step 1:** Add to `index.html`

```html
<section class="py-24 px-6 bg-white" aria-labelledby="new-section">
    <div class="max-w-5xl mx-auto">
        <div class="text-center mb-16 gs_reveal">
            <h2 id="new-section" class="font-display font-semibold text-4xl text-primary mb-4">
                Your Title
            </h2>
        </div>
        <!-- Your content here -->
    </div>
</section>
```

**Step 2:** Add styles to `src/styles.css`

### Change Parallax Speed

**Location:** `src/main.js` lines 48-58

```javascript
leaves.forEach((leaf, index) => {
    const speed = 0.1 + (index * 0.05); // Adjust multiplier
    // ...
});
```

### Customize Wish Tags

**Location:** `src/main.js` function `createWishElement`

```javascript
function createWishElement(name, attendance, pax, message) {
    const newWish = document.createElement('div');
    newWish.className = `wish-tag ...`;
    newWish.innerHTML = `
        <p class="font-display ...">${escapeHtml(name)}</p>
        <p class="font-handwritten ...">${attendanceText}</p>
        <p class="font-body ...">"${escapeHtml(message)}"</p>
    `;
    return newWish;
}
```

### Add Countdown Timer

**Location:** `index.html` - add after venue section

```html
<div class="text-center gs_reveal">
    <div class="flex justify-center gap-4" id="countdown">
        <div class="text-center">
            <div class="text-4xl font-display" id="days">00</div>
            <p class="text-sm">Hari</p>
        </div>
        <!-- Add hours, minutes, seconds -->
    </div>
</div>
```

---

## Mobile Optimization

### Hide Elements on Mobile

Add to `src/styles.css`:

```css
@media (max-width: 768px) {
    .hide-mobile {
        display: none;
    }
}
```

### Adjust Spacing on Mobile

```css
@media (max-width: 768px) {
    section {
        padding-top: 3rem;
        padding-bottom: 3rem;
    }
}
```

---

## Performance Tips

1. **Compress images** before uploading (use TinyPNG or Squoosh)
2. **Use WebP format** for better compression
3. **Lazy load** images below the fold
4. **Minimize custom fonts** - load only needed weights
5. **Test on mobile** - use Chrome DevTools Device Mode

---

## Accessibility

- All images have `alt` text
- Form inputs have associated `label` elements
- Colors meet WCAG contrast requirements
- Keyboard navigation supported
- Screen reader friendly with ARIA labels

---

## Browser Support

- Chrome (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)
- Mobile Safari (iOS 12+)
- Chrome Mobile (Android 5+)

---

**Need more help?** Check `README.md` or `QUICK_START.md`
