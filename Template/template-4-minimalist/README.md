# ⬡ Minimalist Wedding Template

A clean, modern, Scandinavian-inspired wedding invitation template. Features precise typography, generous white space, and refined interactions for the contemporary couple.

## ✨ Features

### Design Elements
- **Minimalist Navigation**: Fixed header with blur backdrop effect
- **Progress Bar**: Scroll progress indicator at top
- **Bold Typography**: Large, impactful hero text with Inter font
- **Monospace Accents**: JetBrains Mono for labels and details
- **Grayscale Photography**: Black & white couple photos with color reveal on hover
- **Clean Forms**: Underlined inputs with minimal styling
- **Copy-to-Clipboard**: Gift registry numbers with one-click copy

### Technical Features
- GSAP scroll animations
- Mobile-responsive design
- LocalStorage for RSVP data
- Google Sheets integration ready
- Accessibility optimized
- Reduced motion support

## 🎨 Color Scheme

| Color | Hex | Usage |
|-------|-----|-------|
| Black | `#0a0a0a` | Primary text, buttons |
| White | `#ffffff` | Background |
| Gray 50 | `#fafafa` | Section backgrounds |
| Gray 200 | `#e5e5e5` | Borders, dividers |
| Gray 400 | `#a3a3a3` | Placeholder text |
| Gray 500 | `#737373` | Secondary text |

## 🚀 Quick Start

### Option 1: Development Server
```bash
cd template-4-minimalist
npm install
npm run dev
```

### Option 2: Build for Production
```bash
npm run build
# Output in /dist folder
```

## ⚙️ Customization

### Change Couple Names
Edit `index.html` lines ~85-95:
```html
<h1 class="hero-title">
    <span class="title-line">
        <span class="groom-first-name">ADAM</span>
    </span>
    <span class="title-ampersand">&</span>
    <span class="title-line">
        <span class="bride-first-name">HAWA</span>
    </span>
</h1>
```

### Change Date & Location
Edit `index.html` lines ~105-107:
```html
<div class="hero-date">
    <span class="mono-text">28 . 08 . 2027</span>
    <span class="date-location">KUALA LUMPUR</span>
</div>
```

### Update Event Details
Edit `index.html` lines ~200-250 (Event Section)

## 📁 File Structure

```
template-4-minimalist/
├── index.html              # Main HTML file
├── src/
│   ├── styles.css         # All styling
│   └── main.js            # JavaScript logic
├── assets/
│   └── images/            # Photos
├── package.json
├── vite.config.js
└── README.md
```

## 🎯 Comparison with Other Templates

| Feature | Modern | Classic | Rustic | **Minimalist** |
|---------|--------|---------|--------|----------------|
| Style | Contemporary | Traditional | Natural | **Scandinavian** |
| Colors | Sage green | Gold/brown | Sage/terracotta | **Black/white** |
| Fonts | Playfair Display | Cinzel | Cormorant | **Inter + Mono** |
| Effects | 3D cards | Ornate frames | Parallax | **Typography** |
| Best For | City weddings | Formal events | Outdoor venues | **Modern couples** |

## 📱 Responsive Breakpoints

- **Desktop**: Full navigation, large typography
- **Tablet**: Adjusted grid layouts
- **Mobile**: Hidden navigation, stacked content

## 💡 Pro Tips

1. **Use high-contrast photos** - Black and white works best
2. **Keep text minimal** - Let white space breathe
3. **Choose modern venues** - Urban, gallery, loft spaces
4. **Test typography** - Ensure readability at all sizes

## 🔧 Troubleshooting

### Photos not showing color on hover?
- Check browser compatibility
- Ensure images are not already grayscale
- Try on desktop (mobile has simplified effects)

### Form not submitting?
- Check browser console for errors
- Verify Google Sheets URL if connected
- Test localStorage functionality

## 📄 License

MIT License - Free for personal and commercial use.

---

**Made with precision for modern couples** ⬡
