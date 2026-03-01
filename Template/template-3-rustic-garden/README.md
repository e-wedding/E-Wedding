# 🌿 Rustic Garden Wedding Template

A natural, organic wedding invitation template perfect for **outdoor & garden weddings** in Sabah. Features botanical parallax effects, polaroid-style photos, and earthy color palettes inspired by Cowie Bay's natural beauty.

## ✨ Features

### Design Elements
- **Botanical Parallax**: Floating leaves and flowers that move with scroll
- **Polaroid Photo Cards**: Nostalgic photo frames for couple portraits
- **Garden Sign Cards**: Information cards styled like garden markers
- **Notebook Paper Form**: RSVP form with lined paper aesthetic
- **Hanging Wish Tags**: Guest wishes displayed as decorative tags
- **Earthy Color Palette**: Sage green, terracotta, cream, and brown tones

### Technical Features
- GSAP scroll animations
- Mobile-responsive design
- Background music control
- Gift registry with copy-to-clipboard
- LocalStorage for wishes
- Google Sheets integration ready
- Accessibility optimized

## 🎨 Color Scheme

| Color | Hex | Usage |
|-------|-----|-------|
| Sage Green | `#9CAF88` | Primary accent, buttons |
| Terracotta | `#C77D63` / `#E5989B` | Secondary accent, flowers |
| Cream | `#FDF6E3` / `#FFFBF0` | Backgrounds, cards |
| Brown | `#8B7355` / `#3D3026` | Text, borders |

## 🚀 Quick Start

### Option 1: Development Server
```bash
cd template-3-rustic-garden
npm install
npm run dev
```

### Option 2: Build for Production
```bash
npm run build
# Output in /dist folder
```

## ⚙️ Customization

### Change Couple Details
Edit `index.html`:
```html
<!-- Line ~85 -->
<h1>
    <span class="groom-first-name">Daniel</span>
    <span class="bride-first-name">Emilia</span>
</h1>
```

### Change Wedding Date
```html
<!-- Line ~97 -->
<p class="event-date">Sabtu, 15 Oktober 2027</p>
<p class="event-time">11:00 Pagi - 5:00 Petang</p>
```

### Change Venue
```html
<!-- Line ~104 -->
<p class="event-venue-name">Taman Botani, Cowie Bay, Sabah</p>
```

### Add Background Music
1. Add your music file to `assets/music/background.mp3`
2. The music player is already configured in `src/main.js`

### Connect Google Sheets
Edit `src/main.js` - add your Google Apps Script URL in the form submission handler.

## 📁 File Structure

```
template-3-rustic-garden/
├── index.html              # Main HTML file
├── src/
│   ├── styles.css         # All styling
│   ├── main.js            # JavaScript logic
│   └── config-loader.js   # Configuration (optional)
├── assets/
│   ├── images/            # Photos
│   └── music/             # Background music
├── config/
│   └── wedding.json       # Wedding data (optional)
├── package.json
├── vite.config.js
└── README.md
```

## 🌸 Perfect For

- Garden weddings at Cowie Bay
- Outdoor rustic ceremonies
- Bohemian-themed weddings
- Nature-loving couples
- Intimate, intimate gatherings
- Beach-adjacent venues

## 🎯 Comparison with Other Templates

| Feature | Modern | Classic | **Rustic Garden** |
|---------|--------|---------|-------------------|
| Style | Contemporary | Traditional | Natural/Organic |
| Colors | Sage + Earth | Gold + Brown | Sage + Terracotta |
| Effects | 3D cards, video | Ornate frames | Parallax botanicals |
| Best For | City weddings | Formal events | Outdoor venues |

## 📱 Responsive Breakpoints

- **Desktop**: Full parallax effects, hover animations
- **Tablet**: Simplified parallax, adjusted spacing
- **Mobile**: No parallax (performance), touch-optimized

## 🎵 Music Control

Click the music button (bottom-right) to toggle background music. Music auto-plays on first user interaction.

## 💡 Pro Tips

1. **Use natural lighting photos** for best results with this theme
2. **Add real venue photos** to the hero section for authenticity
3. **Keep text concise** - let the natural beauty shine through
4. **Test on mobile** - parallax is disabled for performance

## 🔧 Troubleshooting

### Parallax not working?
- Check browser compatibility
- Disable reduced motion settings
- Try on desktop (mobile has simplified effects)

### Music not playing?
- Browser requires user interaction first
- Check file path in `src/main.js`
- Verify audio file format (MP3 recommended)

## 📄 License

MIT License - Free for personal and commercial use.

---

**Made with 💚 for Sabah couples**
