/* ========================================
   SABAH WEDDING E-INVITE - SCRIPT.JS
   ======================================== */

/**
 * Configuration Object
 * Replace with your actual WhatsApp number and Google Apps Script URL
 * 
 * @type {Object}
 * @property {string} WHATSAPP_NUMBER - Format: Country code + number (e.g., 60 for Malaysia)
 * @property {string} GOOGLE_APPS_SCRIPT_URL - Your deployed Google Apps Script URL
 */
const CONFIG = Object.freeze({
    WHATSAPP_NUMBER: "60162395689",
    GOOGLE_APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbzQZMs6ioVQ3h3rZAXSoxiDTWJ8tTGXOAUcikd-zrH-bemqOJfwDOG_0U8hAdrVS5MWuQ/exec"
});

/* ========================================
   SECURITY: INPUT SANITIZATION
   ======================================== */

/**
 * Sanitize HTML to prevent XSS attacks
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string with HTML entities encoded
 */
function sanitizeHTML(str) {
    if (typeof str !== 'string') return str;
    
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Sanitize user input for WhatsApp message
 * Removes potentially dangerous characters and scripts
 * @param {string} input - User input to sanitize
 * @returns {string} Cleaned input safe for display
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    return input
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .replace(/on\w+=/gi, '') // Remove event handlers like onclick=
        .trim();
}

/**
 * Validate and sanitize form data
 * @param {Object} formData - Form data object
 * @returns {Object} Sanitized form data
 */
function sanitizeFormData(formData) {
    return {
        theme: sanitizeInput(formData.theme),
        package: sanitizeInput(formData.package),
        coupleNames: sanitizeInput(formData.coupleNames),
        weddingDate: sanitizeInput(formData.weddingDate),
        venue: sanitizeInput(formData.venue),
        email: formData.email ? sanitizeInput(formData.email) : ''
    };
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
function isValidEmail(email) {
    if (!email) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate date is in the future
 * @param {string} date - Date string in ISO format
 * @returns {boolean} True if date is valid and in the future
 */
function isValidFutureDate(date) {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inputDate = new Date(date);
    return inputDate >= today;
}

/* ========================================
   MODAL MANAGER: Reusable Modal System
   With Focus Trap for Accessibility
   ======================================== */

/**
 * Modal Manager - Handles all modal operations with focus management
 * Implements focus trap for WCAG 2.1 compliance
 */
const ModalManager = {
    /** @type {HTMLElement|null} Currently open modal */
    currentModal: null,
    
    /** @type {HTMLElement|null} Element that had focus before modal opened */
    previousFocus: null,
    
    /** @type {string[]} Selectors for focusable elements */
    focusableSelectors: [
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])'
    ].join(', '),

    /**
     * Open a modal with focus trap
     * @param {string} modalId - ID of the modal element
     * @param {Function} [onOpenCallback] - Optional callback after opening
     */
    open(modalId, onOpenCallback) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal "${modalId}" not found`);
            return;
        }

        console.log('ModalManager.open called for:', modalId);
        console.log('Modal element:', modal);
        console.log('Modal display before:', modal.style.display);
        console.log('Modal style.cssText before:', modal.style.cssText);

        // Store reference to previously focused element
        this.previousFocus = document.activeElement;
        this.currentModal = modal;

        // Clear any existing display style and set to flex
        modal.style.removeProperty('display');
        modal.style.display = 'flex';

        console.log('Modal display after:', modal.style.display);
        console.log('Modal style.cssText after:', modal.style.cssText);

        // Lock background scroll
        document.body.classList.add('modal-open');

        // Set focus to the first focusable element or the modal itself
        requestAnimationFrame(() => {
            const firstFocusable = modal.querySelector(this.focusableSelectors);
            if (firstFocusable) {
                firstFocusable.focus();
            } else {
                modal.setAttribute('tabindex', '-1');
                modal.focus();
            }
        });

        // Add focus trap listener
        modal.addEventListener('keydown', this.handleFocusTrap);

        // Execute callback if provided
        if (typeof onOpenCallback === 'function') {
            onOpenCallback(modal);
        }
    },

    /**
     * Close the currently open modal
     * @param {HTMLElement} [modal] - Specific modal to close (optional)
     * @param {Function} [onCloseCallback] - Optional callback after closing
     */
    close(modal, onCloseCallback) {
        const modalToClose = modal || this.currentModal;
        if (!modalToClose) return;

        // Hide the modal
        modalToClose.style.display = 'none';

        // Unlock background scroll
        document.body.classList.remove('modal-open');

        // Remove focus trap listener
        modalToClose.removeEventListener('keydown', this.handleFocusTrap);

        // Restore focus to previous element
        if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
            this.previousFocus.focus();
        }

        // Execute callback if provided
        if (typeof onCloseCallback === 'function') {
            onCloseCallback(modalToClose);
        }

        // Clear references
        this.currentModal = null;
        this.previousFocus = null;
    },

    /**
     * Focus trap handler - keeps focus within modal
     * @param {KeyboardEvent} e - Keydown event
     */
    handleFocusTrap(e) {
        if (e.key !== 'Tab') return;

        const modal = ModalManager.currentModal;
        if (!modal) return;

        const focusableElements = modal.querySelectorAll(ModalManager.focusableSelectors);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        // Shift + Tab
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } 
        // Tab
        else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    },

    /**
     * Close modal when clicking outside content
     * @param {MouseEvent} e - Click event
     * @param {string} modalId - ID of the modal to close
     */
    handleOutsideClick(e, modalId) {
        const modal = document.getElementById(modalId);
        if (e.target === modal) {
            this.close(modal);
        }
    }
};

/**
 * Open the booking modal with selected theme
 * @param {string} themeName - The selected wedding theme
 */
function selectTheme(themeName) {
    const themeTitle = document.getElementById('selectedThemeTitle');
    const themeInput = document.getElementById('themeInput');

    // Set the theme data
    themeTitle.innerText = themeName + " Wedding";
    themeInput.value = themeName;

    // Update confirmed theme for success overlay
    document.getElementById('confirmedTheme').innerText = themeName;

    // Open modal using ModalManager with focus trap
    ModalManager.open('bookingModal', () => {
        // Automatically switch to 'Bespoke' package if Your Design is selected
        if (themeName === 'Your Design') {
            const customCard = document.querySelector('.package-card[onclick*="Bespoke"]');
            if (customCard) {
                selectPackage(customCard);
            }
        }
    });
}

/**
 * Close the booking modal
 */
function closeModal() {
    ModalManager.close(document.getElementById('bookingModal'));
}

/**
 * Close success overlay and unlock background with reverse animation
 */
function closeSuccess() {
    const successOverlay = document.getElementById('successOverlay');

    // Reset comparison tracking for next session (when tab is closed)
    sessionStorage.removeItem('hasSeenComparison');

    // Smoothly fade it out before hiding it completely
    successOverlay.style.animation = 'fadeInBg 0.3s ease reverse forwards';

    setTimeout(() => {
        successOverlay.style.display = 'none';
        // Reset the animation property so it works the NEXT time it opens
        successOverlay.style.animation = 'fadeInBg 0.4s ease forwards';
        
        // Unlock background scroll
        document.body.classList.remove('modal-open');
        
        // Restore focus
        if (ModalManager.previousFocus) {
            ModalManager.previousFocus.focus();
        }
    }, 300); // Wait for the 0.3s reverse animation to finish

    // Reset the form for next use
    document.getElementById('inviteForm').reset();
    
    // Clear modal manager state
    ModalManager.currentModal = null;
    ModalManager.previousFocus = null;
}

/**
 * Build enhanced WhatsApp message based on user's context and intent
 * Creates structured, professional messages that improve lead qualification
 * @param {Object} data - Form and selection data
 * @returns {string} Formatted WhatsApp message with proper structure
 */
function buildWhatsAppMessage(data) {
    const { theme, pkg, names, date, venue, email, isBespoke } = data;
    
    // Format month/year for general inquiries
    const weddingDate = date ? new Date(date) : null;
    const monthYear = weddingDate ? weddingDate.toLocaleString('default', { month: 'long', year: 'numeric' }) : '[Month/Year]';
    const formattedDate = date || '[Date]';
    const coupleNames = names || '[Your Names]';
    const venueText = venue || '[Venue]';
    
    // Scenario 1: Bespoke VIP Experience - High-end inquiry tone
    if (isBespoke || pkg === 'Bespoke') {
        return `Hi Sabah Wedding Team! 💍

I'm interested in your *Bespoke VIP Experience* for a fully custom wedding invitation design.

*Theme:* ${theme}
*Couple:* ${coupleNames}
*Wedding Date:* ${formattedDate}
*Venue:* ${venueText}${email ? `\n*Email:* ${email}` : ''}

I'd love to discuss how the 1-on-1 design consultation process works and what makes the Bespoke experience unique. Could you share more details about next steps? ✨`;
    }
    
    // Scenario 2: Structured Booking Lead - Classic or Signature with form data
    if (names && date && venue) {
        return `Hi Five Team! 💍

I'm ready to book my wedding e-invite! Here are my details:

*Couple:* ${coupleNames}
*Wedding Date:* ${formattedDate}
*Venue:* ${venueText}
*Theme:* ${theme}
*Package:* ${pkg}${email ? `\n*Email:* ${email}` : ''}

Could you help me with the next steps to get started? Looking forward to hearing from you! 🥂`;
    }
    
    // Scenario 3: General Inquiry - Warm, action-oriented tone
    return `Hi there! 👋

I just saw your Sabah-inspired wedding e-invites and they're beautiful! 😍

I'm specifically interested in the *${pkg} Package* for the *${theme}* theme.

*Couple:* ${coupleNames}
*Looking for:* ${monthYear} wedding${email ? `\n*Email:* ${email}` : ''}

Do you have any available slots? Could you share more about what's included in this package? 💕`;
}

/**
 * Send form data to WhatsApp
 * Creates a pre-filled, structured message based on user's intent and package selection
 * Smart pre-filling: carries over any filled form data so users don't type twice
 */
function sendToWhatsApp() {
    // Haptic feedback for mobile (Metaverse tactile feel)
    if (window.navigator.vibrate) {
        window.navigator.vibrate(50); // A tiny haptic tap
    }

    // Get and sanitize form values (optional fields can be empty)
    const theme = sanitizeInput(document.getElementById('themeInput').value) || 'Your Design';
    const pkg = sanitizeInput(document.getElementById('packageInput').value) || 'Signature';
    const names = sanitizeInput(document.getElementById('coupleNames').value);
    const date = sanitizeInput(document.getElementById('weddingDate').value);
    const venue = sanitizeInput(document.getElementById('venue').value);
    const email = sanitizeInput(document.getElementById('email').value);

    // Check if this is a Bespoke inquiry
    const isBespoke = pkg === 'Bespoke' || theme === 'Your Design';

    // Validate date is in the future (only if date is provided)
    if (date && !isValidFutureDate(date)) {
        alert("Please select a future wedding date!");
        return;
    }

    // Validate terms if filling the form with complete data
    const termsCheck = document.getElementById('termsCheck');
    if (names && date && venue && !termsCheck.checked) {
        alert("Please agree to the Privacy Policy and Terms to continue.");
        return;
    }

    // Build the enhanced, structured message
    const message = buildWhatsAppMessage({
        theme,
        pkg,
        names,
        date,
        venue,
        email,
        isBespoke
    });

    // encodeURIComponent ensures spaces and line breaks format correctly
    const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp in new tab (keeps gallery open in original tab)
    window.open(whatsappUrl, '_blank');
}

/**
 * Send form data to Google Sheets via Google Apps Script
 * Uses async/await for modern fetch API
 */
async function sendToSheet() {
    // Validate terms first
    if (!validateTerms()) {
        return;
    }

    // Haptic feedback for mobile
    if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
    }

    const submitBtn = document.getElementById('btnSubmitForm');

    // Get and sanitize form data
    const rawData = {
        theme: document.getElementById('themeInput').value,
        package: document.getElementById('packageInput').value,
        coupleNames: document.getElementById('coupleNames').value,
        weddingDate: document.getElementById('weddingDate').value,
        venue: document.getElementById('venue').value,
        email: document.getElementById('email').value
    };

    // DEBUG: Log the raw form data before sending
    console.log('📝 Form Data Captured:', rawData);
    console.log('📦 Package Input Value:', document.getElementById('packageInput').value);
    console.log('🎨 Theme Input Value:', document.getElementById('themeInput').value);

    const errorMsg = document.getElementById('formErrorMessage');

    // Validation - check required fields
    if (!rawData.coupleNames || !rawData.weddingDate || !rawData.venue) {
        alert("Please fill in all required details first!");
        return;
    }

    // Sanitize all form data
    const data = sanitizeFormData(rawData);

    // Validate email format if provided
    if (!isValidEmail(data.email)) {
        alert("Please enter a valid email address!");
        return;
    }

    // Validate date is in the future
    if (!isValidFutureDate(data.weddingDate)) {
        alert("Please select a future wedding date!");
        return;
    }

    // Check if Google Apps Script URL is configured
    if (CONFIG.GOOGLE_APPS_SCRIPT_URL === "YOUR_DEPLOY_URL_HERE") {
        alert("Google Sheets integration not configured yet.\n\nPlease set up Google Apps Script and update the URL in script.js\n\nFor now, you can use the WhatsApp button to book!");
        return;
    }

    // Visual feedback (Adaptive UI) - Loading state
    const originalText = submitBtn.innerText;
    submitBtn.innerText = "Saving...";
    submitBtn.disabled = true;
    if (errorMsg) errorMsg.style.display = 'none';

    console.log('🚀 Sending data to Google Sheets:', data);

    try {
        const response = await fetch(CONFIG.GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Required for Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        console.log('✅ Data sent successfully to Google Sheets');

        // Update success UI based on package
        updateSuccessUI(data.package, data.theme);

        // Show success overlay
        document.getElementById('confirmedTheme').innerText = data.theme;
        document.getElementById('bookingModal').style.display = 'none';
        document.getElementById('successOverlay').style.display = 'flex';

    } catch (error) {
        console.error('Error:', error.message);
        // Show error message
        if (errorMsg) {
            errorMsg.style.display = 'block';
        }
        alert("Something went wrong. Please try using the WhatsApp button!");
    } finally {
        submitBtn.innerText = originalText;
        submitBtn.disabled = false;
    }
}

/**
 * Update success UI based on package selected
 */
function updateSuccessUI(pkg, theme) {
    const successHeader = document.getElementById('successHeader');
    const successMessage = document.getElementById('successMessage');

    if (pkg === 'Bespoke') {
        successHeader.innerText = "Bespoke Request Received!";
        successMessage.innerHTML = "Because you've chosen our <strong>Your Design</strong> service, our Lead Designer will contact you directly for a 1-on-1 consultation to bring your unique vision to life.";
    } else {
        successHeader.innerText = "Request Received!";
        successMessage.innerText = "We are excited to help you create your dream wedding in Sabah. Our designer will contact you shortly.";
    }

    // Trigger confetti celebration
    triggerSuccessConfetti();
}

/**
 * Trigger confetti celebration on success overlay
 */
function triggerSuccessConfetti() {
    const confettiContainer = document.getElementById('successConfetti');
    if (!confettiContainer) return;

    confettiContainer.innerHTML = '';
    const colors = ['#D4AF37', '#F4D35E', '#2C5F2D', '#25D366', '#FF6B6B'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.animationDuration = (Math.random() * 1 + 1) + 's';

        confettiContainer.appendChild(confetti);
    }

    confettiContainer.classList.add('confetti-active');
}

/**
 * Close modal when clicking outside the content
 */
document.getElementById('bookingModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});

/**
 * Close preview modal when clicking outside the content
 */
document.getElementById('previewModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closePreview();
    }
});

/**
 * Close success overlay when clicking outside the card
 */
document.getElementById('successOverlay').addEventListener('click', function(e) {
    if (e.target === this) {
        closeSuccess();
    }
});

/**
 * Close modal on Escape key press
 */
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        // Close any open modal using ModalManager
        if (ModalManager.currentModal) {
            ModalManager.close(ModalManager.currentModal);
        }
        // Also handle success overlay (not managed by ModalManager)
        const successOverlay = document.getElementById('successOverlay');
        if (successOverlay.style.display === 'flex') {
            closeSuccess();
        }
    }
});

/**
 * Add smooth scroll behavior and variable typography effects on scroll
 */
window.addEventListener('scroll', function() {
    const header = document.querySelector('header h1');
    const scrollPosition = window.scrollY;
    const maxScroll = 500;
    
    // Variable font weight effect on scroll
    if (header && scrollPosition < maxScroll) {
        const weight = 200 + (scrollPosition / maxScroll) * 600;
        header.style.fontWeight = Math.min(weight, 800);
    }
});

/**
 * Form validation - Real-time feedback
 */
document.querySelectorAll('.form-group input').forEach(input => {
    input.addEventListener('blur', function() {
        if (this.hasAttribute('required') && !this.value.trim()) {
            this.style.borderColor = '#ff6b6b';
        } else {
            this.style.borderColor = '#ddd';
        }
    });

    input.addEventListener('input', function() {
        if (this.value.trim()) {
            this.style.borderColor = '#ddd';
        }
    });
});

/**
 * Initialize Random Botanical Pattern Rotation
 * Gives each botanical-sketch tile a unique rotation for organic, hand-stamped feel
 */
function initBotanicalPattern() {
    const botanicalItems = document.querySelectorAll('.botanical-sketch');
    
    botanicalItems.forEach(item => {
        // Generate a random number between 0 and 360
        const randomRotation = Math.floor(Math.random() * 360);
        
        // Apply it as a CSS variable to that specific item
        item.style.setProperty('--pattern-rotation', `${randomRotation}deg`);
        
        // Optional: Randomize the background position slightly for more variety
        const randomX = Math.floor(Math.random() * 100);
        const randomY = Math.floor(Math.random() * 100);
        item.style.backgroundPosition = `${randomX}px ${randomY}px`;
    });
}

/**
 * Initialize - Log ready message
 */
console.log('🎉 Sabah Wedding E-Invite Gallery Ready!');
console.log('Themes: Beach, Rainforest, Luxury, Garden, Chapel');
console.log('Templates: Modern (1), Classic (2), Rustic Garden (3), Minimalist (4), Floral Romance (5), Your Design (6)');
console.log('Packages: Classic (RM 49), Signature (RM 99), Bespoke (RM 149+)');
console.log('Features: Live Ucapan, Package Selector, Comparison Table, Haptic Feedback, VIP Treatment');

/**
 * Initialize Scroll Reveal Animation using Intersection Observer
 * Hardware-accelerated reveal on scroll for premium feel
 */
function initScrollReveal() {
    const bentoItems = document.querySelectorAll('.bento-item');
    
    const revealOptions = {
        threshold: 0.15, // Reveal when 15% of the item is visible
        rootMargin: "0px 0px -50px 0px"
    };

    const revealOnScroll = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                // Unobserve after revealing to prevent re-triggering
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    bentoItems.forEach(item => {
        revealOnScroll.observe(item);
    });
}

/**
 * Opens the intermediate Preview Modal
 * @param {HTMLElement} element - The clicked bento item
 */
function openPreview(element) {
    const theme = element.dataset.theme;
    const demoUrl = element.dataset.demo;

    console.log('openPreview called with theme:', theme, 'demoUrl:', demoUrl);

    // 1. Set the Title in the Preview Modal
    const previewTitle = document.getElementById('previewTitle');
    previewTitle.innerText = theme;
    console.log('Set previewTitle to:', previewTitle.innerText);

    // 2. Set the "Open Full Demo" link
    const demoBtn = document.getElementById('viewDemoBtn');
    if (demoUrl) {
        demoBtn.href = demoUrl;
        demoBtn.style.display = 'flex';
        console.log('Set demoBtn href to:', demoUrl);
    } else {
        demoBtn.style.display = 'none'; // Hide if it's "Your Design"
    }

    // 3. Store the theme name on the "Book" button inside the preview modal
    const bookBtn = document.querySelector('.btn-preview-primary');
    bookBtn.setAttribute('onclick', `selectTheme('${theme}')`);
    console.log('Set bookBtn onclick to selectTheme:', theme);

    // 4. Open the Modal
    console.log('Calling ModalManager.open for previewModal');
    ModalManager.open('previewModal');
    
    // Verify modal is visible
    const modal = document.getElementById('previewModal');
    console.log('Modal display style after open:', modal.style.display);
}

/**
 * Book from preview modal - closes preview and opens booking form
 */
function bookFromPreview() {
    // Close the preview modal
    ModalManager.close(document.getElementById('previewModal'));
    
    // Get the theme name from the preview title
    const themeName = document.getElementById('previewTitle').innerText;
    
    // Small delay to allow preview modal to close smoothly
    setTimeout(() => {
        selectTheme(themeName);
    }, 150);
}

/**
 * Close preview modal
 */
function closePreview() {
    ModalManager.close(document.getElementById('previewModal'));
}

/**
 * Initialize Bento Grid Event Listeners
 */
function initBentoGridListeners() {
    document.querySelectorAll('.bento-item').forEach(item => {
        item.addEventListener('click', function(e) {
            const theme = this.dataset.theme;
            const demoUrl = this.dataset.demo;

            if (theme === "Your Design") {
                selectTheme("Your Design"); // Custom design goes straight to form
            } else {
                // Navigate to the demo in the same tab
                window.location.href = demoUrl;
            }
        });
    });

    // Bespoke button inside overlay (extra trigger)
    document.querySelectorAll('.btn-bespoke').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent double-triggering
            selectTheme('Your Design');
        });
    });
}

/**
 * Checks if the URL has a theme selection parameter
 * Opens preview modal if user came back from a demo
 */
function checkUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const themeToSelect = urlParams.get('select');
    const bookNow = urlParams.get('book');

    console.log('checkUrlParameters called:', themeToSelect, 'book:', bookNow);
    console.log('Current URL:', window.location.href);

    if (themeToSelect) {
        // Find the original bento item to get its data
        const item = document.querySelector(`[data-theme="${themeToSelect}"]`);
        console.log('Found item:', item);
        
        if (item) {
            // Small delay to ensure DOM is ready
            setTimeout(() => {
                if (bookNow === 'true') {
                    // Directly open booking form
                    console.log('Opening booking form for:', themeToSelect);
                    selectTheme(themeToSelect);
                } else {
                    // Open the Preview Modal
                    console.log('Opening preview for:', themeToSelect);
                    openPreview(item);
                }
            }, 100);

            // Clean the URL so it doesn't reopen on refresh
            window.history.replaceState({}, document.title, window.location.pathname);
        } else {
            console.error('Item not found for theme:', themeToSelect);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initBentoGridListeners);
document.addEventListener('DOMContentLoaded', initBotanicalPattern);
document.addEventListener('DOMContentLoaded', initScrollReveal);
document.addEventListener('DOMContentLoaded', checkUrlParameters);

/**
 * Open template demo in same tab
 * @param {string} templatePath - Path to template folder
 */
function openDemo(templatePath) {
    // Navigate to the demo in the same tab
    const url = `${templatePath}/index.html`;
    window.location.href = url;
}

/**
 * Initialize Form Event Listeners
 */
function initFormListeners() {
    // Set minimum date based on default package (Signature = 2 days)
    const today = new Date();
    today.setDate(today.getDate() + 2);
    const weddingDateInput = document.getElementById('weddingDate');
    if (weddingDateInput) {
        weddingDateInput.min = today.toISOString().split('T')[0];
    }

    // Prevent default form submission and handle it ourselves
    const inviteForm = document.getElementById('inviteForm');
    if (inviteForm) {
        inviteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendToSheet();
        });
    }

    // Primary button (Save to Records)
    const btnSubmit = document.getElementById('btnSubmitForm');
    if (btnSubmit) {
        btnSubmit.addEventListener('click', function(e) {
            e.preventDefault();
            sendToSheet();
        });
    }

    // Secondary button (WhatsApp)
    const btnWhatsApp = document.getElementById('btnWhatsApp');
    if (btnWhatsApp) {
        btnWhatsApp.addEventListener('click', function(e) {
            e.preventDefault();
            sendToWhatsApp();
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initFormListeners);

/**
 * Open template demo in new tab (alias for backward compatibility)
 */
function openTemplate(templatePath) {
    openDemo(templatePath);
}

/**
 * Initialize Package Card Event Listeners
 */
function initPackageCardListeners() {
    // Grab all package cards and the hidden input
    const packageCards = document.querySelectorAll('.package-card');
    const packageInput = document.getElementById('packageInput');

    if (packageCards.length > 0 && packageInput) {
        // Set Signature as active by default
        packageCards.forEach(card => {
            if (card.getAttribute('data-package') === 'Signature') {
                card.classList.add('active');
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initPackageCardListeners);

/**
 * Select package card with glassmorphism effect and confetti for Custom
 * @param {HTMLElement} element - The clicked package card
 */
function selectPackage(element) {
    const cards = document.querySelectorAll('.package-card');
    cards.forEach(card => card.classList.remove('active', 'confetti-active'));

    element.classList.add('active');

    const selectedPackage = element.getAttribute('data-package');
    document.getElementById('packageInput').value = selectedPackage;

    // Smart date validation: Bespoke needs 7 days lead time, others need 2 days
    const dateInput = document.getElementById('weddingDate');
    const today = new Date();

    if (selectedPackage === 'Bespoke') {
        today.setDate(today.getDate() + 7);
    } else {
        today.setDate(today.getDate() + 2);
    }
    dateInput.min = today.toISOString().split('T')[0];

    // Update floating price summary footer
    updatePriceFooter(selectedPackage);

    // Trigger confetti ONLY for the Bespoke tier
    if (selectedPackage === 'Bespoke') {
        triggerConfetti(element);
    }
}

/**
 * Track if user has seen the comparison table (stored in sessionStorage for session persistence)
 * Resets when browser tab is closed
 */
let hasSeenComparison = sessionStorage.getItem('hasSeenComparison') === 'true';

/**
 * Sales Funnel: Select package AND automatically open comparison table
 * This creates a "sales funnel" effect where customers verify features before booking
 * Only opens on first package selection to avoid interrupting decisive users
 * @param {HTMLElement} element - The clicked package card
 */
function selectAndCompare(element) {
    // First, run the existing selection logic
    selectPackage(element);
    
    // Only open comparison modal on first selection to reduce friction
    if (!hasSeenComparison) {
        // Small delay for smoother UX
        setTimeout(() => {
            openCompare();
            highlightTableColumn(element.dataset.package);
            scrollToHighlightedColumn(element.dataset.package);
            hasSeenComparison = true;
            sessionStorage.setItem('hasSeenComparison', 'true');
        }, 300);
    } else {
        // Subtle feedback that comparison won't auto-open (for users switching packages)
        showPackageSwitchHint();
    }
}

/**
 * Scroll the comparison table to show the highlighted column (mobile UX)
 * @param {string} packageName - 'Classic', 'Signature', or 'Bespoke'
 */
function scrollToHighlightedColumn(packageName) {
    const tableWrapper = document.querySelector('.table-wrapper');
    if (!tableWrapper) return;
    
    const indexMap = { 'Classic': 0, 'Signature': 1, 'Bespoke': 2 };
    const colIndex = indexMap[packageName];
    if (colIndex === undefined) return;
    
    // Calculate scroll position to center the highlighted column
    const cells = tableWrapper.querySelectorAll('.compare-table tbody tr td:nth-child(' + (colIndex + 2) + ')');
    if (cells.length > 0) {
        const cell = cells[0];
        const wrapperRect = tableWrapper.getBoundingClientRect();
        const cellRect = cell.getBoundingClientRect();
        
        // Smooth scroll to bring the highlighted column into view
        tableWrapper.scrollBy({
            left: cellRect.left - wrapperRect.left - (wrapperRect.width / 2) + (cellRect.width / 2),
            behavior: 'smooth'
        });
    }
}

/**
 * Show subtle hint when user switches packages after seeing comparison
 * Provides feedback without being intrusive
 */
function showPackageSwitchHint() {
    // Remove existing hint if any
    const existingHint = document.getElementById('packageSwitchHint');
    if (existingHint) {
        existingHint.remove();
    }
    
    // Create hint element
    const hint = document.createElement('div');
    hint.id = 'packageSwitchHint';
    hint.className = 'package-switch-hint';
    hint.setAttribute('role', 'status');
    hint.setAttribute('aria-live', 'polite');
    hint.innerHTML = '<i class="ph ph-info"></i> <span>Package updated. Compare features anytime.</span>';
    
    // Insert near package selector
    const packageSelector = document.querySelector('.package-selector');
    if (packageSelector) {
        packageSelector.appendChild(hint);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            hint.style.opacity = '0';
            setTimeout(() => hint.remove(), 300);
        }, 3000);
    }
}

/**
 * Highlight the selected package column in the comparison table
 * @param {string} packageName - 'Classic', 'Signature', or 'Bespoke'
 */
function highlightTableColumn(packageName) {
    const table = document.querySelector('.compare-table');
    if (!table) return;
    
    const indexMap = { 'Classic': 1, 'Signature': 2, 'Bespoke': 3 };
    const colIndex = indexMap[packageName];
    if (colIndex === undefined) return;

    // Remove previous highlights
    table.querySelectorAll('td, th').forEach(el => el.classList.remove('active-col'));

    // Add highlight to the selected column (nth-child is 1-indexed, so +1 for data column)
    table.querySelectorAll(`tr td:nth-child(${colIndex + 1}), tr th:nth-child(${colIndex + 1})`)
         .forEach(el => el.classList.add('active-col'));
}

/**
 * Update the floating price summary footer
 * @param {string} pkg - Selected package name
 */
function updatePriceFooter(pkg) {
    const packageNameEl = document.getElementById('footerPackageName');
    const priceEl = document.getElementById('footerPrice');
    
    const packageData = {
        'Classic': { name: 'Classic', price: 'RM 49' },
        'Signature': { name: 'Signature', price: 'RM 99' },
        'Bespoke': { name: 'Bespoke', price: 'RM 149+' }
    };
    
    const data = packageData[pkg] || packageData['Signature'];
    packageNameEl.innerText = data.name;
    priceEl.innerText = data.price;
}

/**
 * Trigger confetti burst for Custom package selection
 * @param {HTMLElement} card - The package card element
 */
function triggerConfetti(card) {
    // Create wrapper if it doesn't exist
    let wrapper = card.querySelector('.confetti-wrapper');
    if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'confetti-wrapper';
        card.appendChild(wrapper);
    }
    wrapper.innerHTML = ''; // Clear old particles
    card.classList.add('confetti-active');

    // Create 12 random confetti particles
    const colors = ['#D4AF37', '#F4D35E', '#FFFFFF', '#cb997e'];
    for (let i = 0; i < 12; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        
        // Random directions and rotations
        const x = (Math.random() - 0.5) * 200 + 'px';
        const y = (Math.random() - 0.5) * 200 + 'px';
        const r = Math.random() * 360 + 'deg';
        
        p.style.setProperty('--x', x);
        p.style.setProperty('--y', y);
        p.style.setProperty('--r', r);
        p.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        
        wrapper.appendChild(p);
    }
}

/**
 * Open package comparison modal
 */
function openCompare() {
    ModalManager.open('compareModal');
}

/**
 * Close package comparison modal
 */
function closeCompare() {
    ModalManager.close(document.getElementById('compareModal'));
}

/**
 * Close comparison modal when clicking outside
 */
document.addEventListener('DOMContentLoaded', function() {
    const compareModal = document.getElementById('compareModal');
    if (compareModal) {
        compareModal.addEventListener('click', function(e) {
            if (e.target === this) {
                ModalManager.handleOutsideClick(e, 'compareModal');
            }
        });
    }
});

/**
 * ========================================
 * LEGAL MODAL FUNCTIONS (Privacy & Terms)
 * ======================================== */

/**
 * Open legal modal with specified content
 * @param {string} type - 'privacy' or 'terms'
 */
function openLegal(type) {
    const modal = document.getElementById('legalModal');
    const title = document.getElementById('legalTitle');
    const privacyContent = document.getElementById('privacyContent');
    const termsContent = document.getElementById('termsContent');

    if (type === 'privacy') {
        title.innerText = 'Privacy Policy';
        privacyContent.style.display = 'block';
        termsContent.style.display = 'none';
    } else if (type === 'terms') {
        title.innerText = 'Terms & Conditions';
        privacyContent.style.display = 'none';
        termsContent.style.display = 'block';
    }

    ModalManager.open('legalModal');
}

/**
 * Close the legal modal and unlock background
 */
function closeLegal() {
    ModalManager.close(document.getElementById('legalModal'));
}

/**
 * Close legal modal when clicking outside
 */
document.getElementById('legalModal').addEventListener('click', function(e) {
    ModalManager.handleOutsideClick(e, 'legalModal');
});

/**
 * Close comparison modal when clicking outside
 */
document.getElementById('compareModal').addEventListener('click', function(e) {
    ModalManager.handleOutsideClick(e, 'compareModal');
});

/**
 * Close booking modal when clicking outside
 */
document.getElementById('bookingModal').addEventListener('click', function(e) {
    ModalManager.handleOutsideClick(e, 'bookingModal');
});

/**
 * Close success overlay when clicking outside
 */
document.getElementById('successOverlay').addEventListener('click', function(e) {
    if (e.target === this) {
        closeSuccess();
    }
});

/**
 * Validate terms checkbox before submission
 */
function validateTerms() {
    const termsCheck = document.getElementById('termsCheck');
    if (!termsCheck.checked) {
        alert('Please agree to the Privacy Policy and Terms to continue.');
        return false;
    }
    return true;
}

/**
 * Toggle About Us expandable content on mobile
 * Shows/hides the 5 theme descriptions with smooth animation
 */
function toggleAbout() {
    const content = document.getElementById('aboutExpandable');
    const btn = document.getElementById('readMoreBtn');
    const btnText = btn.querySelector('span');

    content.classList.toggle('expanded');
    btn.classList.toggle('active');

    if (content.classList.contains('expanded')) {
        btnText.innerText = "Show Less";
    } else {
        btnText.innerText = "Read More About Our Tech";
        // Smoothly scroll back to the top of the about section when closing
        document.querySelector('.about-section').scrollIntoView({ behavior: 'smooth' });
    }
}
