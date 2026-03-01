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
    WHATSAPP_NUMBER: "60123456789",
    GOOGLE_APPS_SCRIPT_URL: "YOUR_DEPLOY_URL_HERE"
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

        // Store reference to previously focused element
        this.previousFocus = document.activeElement;
        this.currentModal = modal;

        // Show the modal
        modal.style.display = 'flex';
        
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
        // Automatically switch to 'Custom' package if Custom Bespoke is selected
        if (themeName === 'Custom Bespoke') {
            const customCard = document.querySelector('.package-card[onclick*="Custom"]');
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
 * Send form data to WhatsApp
 * Creates a pre-filled message with all wedding details including package
 */
function sendToWhatsApp() {
    // Validate terms first
    if (!validateTerms()) {
        return;
    }

    // Haptic feedback for mobile (Metaverse tactile feel)
    if (window.navigator.vibrate) {
        window.navigator.vibrate(50); // A tiny haptic tap
    }

    // Get and sanitize form values
    const theme = sanitizeInput(document.getElementById('themeInput').value) || 'Custom Bespoke';
    const pkg = sanitizeInput(document.getElementById('packageInput').value) || 'Premium';
    const names = sanitizeInput(document.getElementById('coupleNames').value);
    const date = sanitizeInput(document.getElementById('weddingDate').value);
    const venue = sanitizeInput(document.getElementById('venue').value);

    // Validation
    if (!names || !date || !venue) {
        alert("Please fill in all required details first!");
        return;
    }

    // Validate date is in the future
    if (!isValidFutureDate(date)) {
        alert("Please select a future wedding date!");
        return;
    }

    // Construct the pre-filled message with beautiful formatting
    const message = `Hello Sabah Wedding E-Invites! 👋

I would love to chat about designing our digital invitation. Here are our details so far:

*Couple:* ${names}
*Date:* ${date}
*Venue:* ${venue}
*Theme:* ${theme}
*Package:* ${pkg}

Could you let me know what the next steps are?`;

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

    try {
        const response = await fetch(CONFIG.GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Required for Google Apps Script
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

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
    
    if (pkg === 'Custom') {
        successHeader.innerText = "Bespoke Request Received!";
        successMessage.innerHTML = "Because you've chosen our <strong>Custom Bespoke</strong> service, our Lead Designer will contact you directly for a 1-on-1 consultation to bring your unique vision to life.";
    } else {
        successHeader.innerText = "Request Received!";
        successMessage.innerText = "We are excited to help you create your dream wedding in Sabah. Our designer will contact you shortly.";
    }
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
console.log('Templates: Modern (1), Classic (2), Rustic Garden (3), Minimalist (4), Floral Romance (5), Custom Bespoke (6)');
console.log('Packages: Basic (RM 49), Premium (RM 99), Custom (RM 149+)');
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
 * Initialize Bento Grid Event Listeners
 */
function initBentoGridListeners() {
    // Template demo buttons
    document.querySelectorAll('.bento-item[data-demo]').forEach(item => {
        item.addEventListener('click', function() {
            const demoUrl = this.dataset.demo;
            openDemo(demoUrl);
        });
    });
    
    // Custom bespoke button
    document.querySelectorAll('.bento-item[data-theme]').forEach(item => {
        item.addEventListener('click', function() {
            const theme = this.dataset.theme;
            selectTheme(theme);
        });
    });
    
    // Bespoke button inside overlay
    document.querySelectorAll('.btn-bespoke').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent double-triggering
            selectTheme('Custom Bespoke');
        });
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initBentoGridListeners);
document.addEventListener('DOMContentLoaded', initBotanicalPattern);
document.addEventListener('DOMContentLoaded', initScrollReveal);

/**
 * Open template demo in new tab
 * @param {string} templatePath - Path to template folder
 */
function openDemo(templatePath) {
    // Open the demo in a new tab
    const url = `${templatePath}/index.html`;
    window.open(url, '_blank');
}

/**
 * Initialize Form Event Listeners
 */
function initFormListeners() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const weddingDateInput = document.getElementById('weddingDate');
    if (weddingDateInput) {
        weddingDateInput.min = today;
    }
    
    // Primary button (Save to Records)
    const btnSubmit = document.getElementById('btnSubmitForm');
    if (btnSubmit) {
        btnSubmit.addEventListener('click', sendToSheet);
    }
    
    // Secondary button (WhatsApp)
    const btnWhatsApp = document.getElementById('btnWhatsApp');
    if (btnWhatsApp) {
        btnWhatsApp.addEventListener('click', sendToWhatsApp);
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
        // Set Premium as active by default
        packageCards.forEach(card => {
            if (card.getAttribute('data-package') === 'Premium') {
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

    // Trigger confetti ONLY for the Custom Bespoke tier
    if (selectedPackage === 'Custom') {
        triggerConfetti(element);
    }
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
