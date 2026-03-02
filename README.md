# 🎉 Sabah Wedding E-Invite Gallery

A beautiful, modern wedding e-invitation webapp inspired by the natural beauty of Sabah. Features Bento Grid layouts, Variable Typography, Adaptive UI, and seamless WhatsApp/Google Sheets integration.

## ✨ Features

### Design Trends Implemented

-   **Bento Grids**: Asymmetrical grid layout showcasing 5 unique Sabah-inspired themes
-   **Variable Typography**: Dynamic font weights that respond to scroll interactions
-   **Adaptive UI**: Responsive design that works flawlessly on desktop, tablet, and mobile
-   **Metaverse Feel**: Glassmorphism effects, smooth animations, and spatial UI elements

### 5 Wedding Themes

Theme

Style

Best For

🏖️ Magnificent Beach

Coastal, Modern

Batu Tinagat, Tawau beaches

🌿 Enchanted Rainforest

Lush, Intimate

Rainforest venues

🏨 Luxury Resort

Elegant, Premium

Borneo Royale Hotel

🌸 Garden & Outdoor

Rustic, Casual

Cowie Bay, outdoor venues

⛪ Classical Chapel

Timeless, Traditional

Chapel/indoor weddings

### Functional Features

-   **Live Theme Selection**: Click any theme to open booking modal
-   **WhatsApp Integration**: Pre-filled messages with wedding details
-   **Google Sheets Backend**: Automatic data capture and storage
-   **Auto-Reply Email**: Professional confirmation emails (optional)
-   **Success Overlay**: Beautiful confirmation animation

---

## 🚀 Quick Start

### Option 1: Local Testing

1.  Open `index.html` in any web browser
2.  Click on any theme to test the modal
3.  Fill in the form and test WhatsApp button

### Option 2: Deploy to Vercel/Netlify

```bash
# Push to GitHub, then connect to Vercel/Netlify# Or use CLI:vercel deploy# ornetlify deploy
```

---

## ⚙️ Setup Instructions

### 1. Configure WhatsApp Number

Edit `script.js` line 5:

```javascript
const WHATSAPP_NUMBER = ""; // Your Malaysia number with country code
```

### 2. Set Up Google Sheets Integration

#### Step A: Create Google Sheet

1.  Go to [Google Sheets](https://sheets.google.com)
2.  Create a new spreadsheet
3.  In row 1, create these headers:
    -   `Timestamp` | `Theme` | `Names` | `Date` | `Venue` | `Email`
4.  Name the tab `Sheet1` (at bottom)

#### Step B: Add Google Apps Script

1.  In your Google Sheet, go to **Extensions** > **Apps Script**
2.  Delete any existing code
3.  Copy the contents of `google-apps-script.js` and paste it
4.  Click **Save** (💾 icon)

#### Step C: Deploy the Script

1.  Click **Deploy** > **New Deployment**
2.  Click the gear icon ⚙️ next to "Select type"
3.  Choose **Web App**
4.  Set **Description**: "Wedding E-Invite API"
5.  Set **Execute as**: Me
6.  Set **Who has access**: **Anyone** ⚠️
7.  Click **Deploy**
8.  Authorize the script when prompted
9.  Copy the **Web App URL**

#### Step D: Update Your Webapp

Edit `script.js` line 6:

```javascript
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
```

### 3. (Optional) Enable Auto-Reply Emails

In `google-apps-script.js`, uncomment the email section:

```javascript
// Remove the /* and */ comments around this section:if (data.email) {  sendAutoReplyEmail(data);}
```

---

## 📁 File Structure

```
Portfolio E-Wedding/├── index.html              # Main HTML structure├── style.css               # All styling (Bento Grid, themes, responsive)├── script.js               # Frontend logic (modal, forms, integrations)├── google-apps-script.js   # Backend code for Google Sheets└── README.md               # This file
```

---

## 🎨 Customization Guide

### Change Theme Colors

Edit CSS variables in `style.css`:

```css
:root {    --beach-primary: #00B4D8;      /* Beach theme color */    --rainforest-green: #2D6A4F;   /* Rainforest theme color */    --luxury-gold: #D4AF37;        /* Luxury theme accent */    --garden-sage: #9CAF88;        /* Garden theme color */}
```

### Add New Themes

1.  Add new `.bento-item` in `index.html`
2.  Create corresponding CSS class with background styling
3.  Update grid layout as needed

### Modify Form Fields

Edit the form section in `index.html` and update `google-apps-script.js` to match new fields.

---

## 🌐 Browser Support

Browser

Version

Chrome

✅ Latest

Firefox

✅ Latest

Safari

✅ Latest

Edge

✅ Latest

Mobile Safari

✅ iOS 12+

Chrome Mobile

✅ Android 5+

---

## 📱 Responsive Breakpoints

-   **Desktop**: 4-column Bento Grid (>900px)
-   **Tablet**: 2-column Bento Grid (600px - 900px)
-   **Mobile**: Single column stack (<600px)

---

## 🔧 Troubleshooting

### Google Sheets Not Saving Data

1.  Verify the Web App URL is correct in `script.js`
2.  Ensure "Who has access" is set to **Anyone**
3.  Check browser console for errors (F12)
4.  Test the script with `testFunction()` in Apps Script editor

### WhatsApp Link Not Working

1.  Verify phone number format: `60123456789` (no +, no spaces)
2.  Ensure the number can receive WhatsApp messages
3.  Test manually: `https://wa.me/`

### Modal Not Opening

1.  Check browser console for JavaScript errors
2.  Verify `script.js` is linked correctly in `index.html`
3.  Clear browser cache and reload

---

## 📊 Data Flow

```
User selects theme → Modal opens → User fills form                                         ↓                    ┌────────────────────┴────────────────────┐                    ↓                                         ↓            WhatsApp Button                           Google Sheets Button                    ↓                                         ↓    Pre-filled message sent                        Data saved to Sheet    to your WhatsApp                               (Optional: Auto-email)
```

---

## 🎯 Marketing Taglines

Use these for social media promotion:

1.  *"From the Heart of Sabah to Your Special Day 💍"*
2.  *"5 Themes. Infinite Memories. One Beautiful Invitation."*
3.  *"Modern Elegance Meets Sabah's Natural Beauty 🌺"*
4.  *"Your Love Story Deserves a Beautiful Beginning"*
5.  *"Digital Invitations, Sabah-Inspired Soul ✨"*

---

## 📝 Next Steps

1.  ✅ Test locally by opening `index.html`
2.  ✅ Set up Google Sheets integration
3.  ✅ Update WhatsApp number
4.  ✅ Deploy to Vercel/Netlify
5.  ✅ Share on social media!

---

## 🙏 Credits

**Design Inspiration**: Modern Bento Grids, Variable Typography, Metaverse UI  
**Typography**: Montserrat & Playfair Display (Google Fonts)  
**Inspired by**: Sabah's natural beauty - beaches, rainforests, and luxury venues

---

## 📞 Support

For issues or questions:

1.  Check browser console (F12) for errors
2.  Verify all configuration in `script.js`
3.  Test Google Apps Script with `testFunction()`

---

**Built with ❤️ for Sabah couples**