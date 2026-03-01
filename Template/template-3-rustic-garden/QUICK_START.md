# 🚀 Quick Start - Rustic Garden Template

Get your rustic garden wedding invitation running in 5 minutes!

## Step 1: Install Dependencies

```bash
cd template-3-rustic-garden
npm install
```

## Step 2: Start Development Server

```bash
npm run dev
```

Your invitation will open at `http://localhost:3003`

## Step 3: Customize Content

### Edit Wedding Details

Open `index.html` and find these sections:

**Couple Names** (Line ~85):
```html
<span class="groom-first-name">Daniel</span>
<span class="bride-first-name">Emilia</span>
```

**Date & Time** (Line ~97):
```html
<p class="event-date">Sabtu, 15 Oktober 2027</p>
<p class="event-time">11:00 Pagi - 5:00 Petang</p>
```

**Venue** (Line ~104):
```html
<p class="event-venue-name">Taman Botani, Cowie Bay, Sabah</p>
```

### Add Your Photos

Replace image URLs in `index.html`:

```html
<!-- Groom Photo (Line ~140) -->
<img src="YOUR_GROOM_PHOTO.jpg" alt="Portrait of groom">

<!-- Bride Photo (Line ~157) -->
<img src="YOUR_BRIDE_PHOTO.jpg" alt="Portrait of bride">

<!-- Hero Background (Line ~68) -->
<img src="YOUR_VENUE_PHOTO.jpg" alt="Garden wedding venue">
```

### Add Background Music

1. Place your MP3 file in `assets/music/background.mp3`
2. The player is already configured!

## Step 4: Build for Production

```bash
npm run build
```

Your built files will be in the `dist/` folder.

## Step 5: Deploy

### Option A: Vercel
```bash
npm install -g vercel
vercel deploy
```

### Option B: Netlify
```bash
npm run build
# Drag and drop dist/ folder to Netlify
```

### Option C: GitHub Pages
```bash
npm install -g gh-pages
gh-pages -d dist
```

---

## 🎨 Quick Customizations

### Change Primary Color (Sage Green)

Edit `index.html` line ~30:
```css
--color-sage: #9CAF88; /* Change to your color */
```

### Change Fonts

Edit `index.html` line ~17:
```html
<link href="https://fonts.googleapis.com/css2?family=YourFont" rel="stylesheet">
```

Then update in `index.html` line ~33:
```css
--font-display: "Your Display Font";
```

### Add Google Sheets Integration

Edit `src/main.js` - in the `initFormHandling` function, add:

```javascript
// After creating wish object
const googleSheetUrl = 'YOUR_GOOGLE_APPS_SCRIPT_URL';

fetch(googleSheetUrl, {
    method: 'POST',
    body: JSON.stringify(wish),
    mode: 'no-cors'
}).catch(err => console.error('Error:', err));
```

---

## ✅ Checklist Before Launch

- [ ] Replace all placeholder photos
- [ ] Update couple names
- [ ] Set correct wedding date
- [ ] Add venue location
- [ ] Update map coordinates
- [ ] Add background music (optional)
- [ ] Test on mobile device
- [ ] Connect Google Sheets (optional)
- [ ] Test RSVP form
- [ ] Build and deploy

---

**Need help?** Check the full `README.md` for detailed documentation.
