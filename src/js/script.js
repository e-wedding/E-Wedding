/* ========================================
   SABAH WEDDING E-INVITE - SCRIPT.JS
   Refactored with IIFE to protect global scope
   ======================================== */

/**
 * Immediately Invoked Function Expression (IIFE)
 * Encapsulates all module code to prevent global scope pollution
 */
(function() {
    'use strict';

    /* ========================================
       CONFIGURATION OBJECT
       ======================================== */
    const CONFIG = Object.freeze({
        WHATSAPP_NUMBER: "60162395689",
        GOOGLE_APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbzQZMs6ioVQ3h3rZAXSoxiDTWJ8tTGXOAUcikd-zrH-bemqOJfwDOG_0U8hAdrVS5MWuQ/exec"
    });

    /* ========================================
       SECURITY: INPUT SANITIZATION
       ======================================== */
    function sanitizeHTML(str) {
        if (typeof str !== 'string') return str;
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        return input
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .trim();
    }

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

    function isValidEmail(email) {
        if (!email) return true;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidFutureDate(date) {
        if (!date) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const inputDate = new Date(date);
        return inputDate >= today;
    }

    /* ========================================
       MODAL MANAGER
       ======================================== */
    const ModalManager = {
        currentModal: null,
        previousFocus: null,
        focusableSelectors: [
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            'a[href]',
            '[tabindex]:not([tabindex="-1"])'
        ].join(', '),

        open(modalId, onOpenCallback) {
            const modal = document.getElementById(modalId);
            if (!modal) {
                console.error(`Modal "${modalId}" not found`);
                return;
            }

            this.previousFocus = document.activeElement;
            this.currentModal = modal;

            modal.style.removeProperty('display');
            modal.style.display = 'flex';

            document.body.classList.add('modal-open');

            requestAnimationFrame(() => {
                const firstFocusable = modal.querySelector(this.focusableSelectors);
                if (firstFocusable) {
                    firstFocusable.focus();
                } else {
                    modal.setAttribute('tabindex', '-1');
                    modal.focus();
                }
            });

            modal.addEventListener('keydown', this.handleFocusTrap);

            if (typeof onOpenCallback === 'function') {
                onOpenCallback(modal);
            }
        },

        close(modal, onCloseCallback) {
            const modalToClose = modal || this.currentModal;
            if (!modalToClose) return;

            modalToClose.style.display = 'none';
            document.body.classList.remove('modal-open');
            modalToClose.removeEventListener('keydown', this.handleFocusTrap);

            if (this.previousFocus && typeof this.previousFocus.focus === 'function') {
                this.previousFocus.focus();
            }

            if (typeof onCloseCallback === 'function') {
                onCloseCallback(modalToClose);
            }

            this.currentModal = null;
            this.previousFocus = null;
        },

        handleFocusTrap(e) {
            if (e.key !== 'Tab') return;

            const modal = ModalManager.currentModal;
            if (!modal) return;

            const focusableElements = modal.querySelectorAll(ModalManager.focusableSelectors);
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        },

        handleOutsideClick(e, modalId) {
            const modal = document.getElementById(modalId);
            if (e.target === modal) {
                this.close(modal);
            }
        }
    };

    /* ========================================
       CORE FUNCTIONS (Exposed to window)
       ======================================== */
    
    /**
     * Open the booking modal with selected theme
     */
    function selectTheme(themeName) {
        const themeTitle = document.getElementById('selectedThemeTitle');
        const themeInput = document.getElementById('themeInput');

        themeTitle.innerText = themeName + " Wedding";
        themeInput.value = themeName;
        document.getElementById('confirmedTheme').innerText = themeName;

        ModalManager.open('bookingModal', () => {
            if (themeName === 'Your Design') {
                const customCard = document.querySelector('.package-card[data-package="Bespoke"]');
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
     * Close success overlay
     */
    function closeSuccess() {
        const successOverlay = document.getElementById('successOverlay');
        sessionStorage.removeItem('hasSeenComparison');

        successOverlay.style.animation = 'fadeInBg 0.3s ease reverse forwards';

        setTimeout(() => {
            successOverlay.style.display = 'none';
            successOverlay.style.animation = 'fadeInBg 0.4s ease forwards';
            document.body.classList.remove('modal-open');

            if (ModalManager.previousFocus) {
                ModalManager.previousFocus.focus();
            }
        }, 300);

        document.getElementById('inviteForm').reset();
        ModalManager.currentModal = null;
        ModalManager.previousFocus = null;
    }

    /**
     * Build WhatsApp message
     */
    function buildWhatsAppMessage(data) {
        const { theme, pkg, names, date, venue, email, isBespoke } = data;
        const weddingDate = date ? new Date(date) : null;
        const monthYear = weddingDate ? weddingDate.toLocaleString('default', { month: 'long', year: 'numeric' }) : '[Month/Year]';
        const formattedDate = date || '[Date]';
        const coupleNames = names || '[Your Names]';
        const venueText = venue || '[Venue]';

        if (isBespoke || pkg === 'Bespoke') {
            return `Hi Sabah Wedding Team! 💍

I'm interested in your *Bespoke VIP Experience* for a fully custom wedding invitation design.

*Theme:* ${theme}
*Couple:* ${coupleNames}
*Wedding Date:* ${formattedDate}
*Venue:* ${venueText}${email ? `\n*Email:* ${email}` : ''}

I'd love to discuss how the 1-on-1 design consultation process works and what makes the Bespoke experience unique. Could you share more details about next steps? ✨`;
        }

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

        return `Hi there! 👋

I just saw your Sabah-inspired wedding e-invites and they're beautiful! 😍

I'm specifically interested in the *${pkg} Package* for the *${theme}* theme.

*Couple:* ${coupleNames}
*Looking for:* ${monthYear} wedding${email ? `\n*Email:* ${email}` : ''}

Do you have any available slots? Could you share more about what's included in this package? 💕`;
    }

    /**
     * Send form data to WhatsApp
     */
    function sendToWhatsApp() {
        if (window.navigator.vibrate) {
            window.navigator.vibrate(50);
        }

        const theme = sanitizeInput(document.getElementById('themeInput').value) || 'Your Design';
        const pkg = sanitizeInput(document.getElementById('packageInput').value) || 'Signature';
        const names = sanitizeInput(document.getElementById('coupleNames').value);
        const date = sanitizeInput(document.getElementById('weddingDate').value);
        const venue = sanitizeInput(document.getElementById('venue').value);
        const email = sanitizeInput(document.getElementById('email').value);

        const isBespoke = pkg === 'Bespoke' || theme === 'Your Design';

        if (date && !isValidFutureDate(date)) {
            alert("Please select a future wedding date!");
            return;
        }

        const termsCheck = document.getElementById('termsCheck');
        if (names && date && venue && !termsCheck.checked) {
            alert("Please agree to the Privacy Policy and Terms to continue.");
            return;
        }

        const message = buildWhatsAppMessage({ theme, pkg, names, date, venue, email, isBespoke });
        const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }

    /**
     * Send form data to Google Sheets
     */
    async function sendToSheet() {
        if (!validateTerms()) return;

        if (window.navigator.vibrate) {
            window.navigator.vibrate(50);
        }

        const submitBtn = document.getElementById('btnSubmitForm');
        const rawData = {
            theme: document.getElementById('themeInput').value,
            package: document.getElementById('packageInput').value,
            coupleNames: document.getElementById('coupleNames').value,
            weddingDate: document.getElementById('weddingDate').value,
            venue: document.getElementById('venue').value,
            email: document.getElementById('email').value
        };

        console.log('📝 Form Data Captured:', rawData);
        console.log('📦 Package Input Value:', document.getElementById('packageInput').value);
        console.log('🎨 Theme Input Value:', document.getElementById('themeInput').value);

        const errorMsg = document.getElementById('formErrorMessage');

        if (!rawData.coupleNames || !rawData.weddingDate || !rawData.venue) {
            alert("Please fill in all required details first!");
            return;
        }

        const data = sanitizeFormData(rawData);

        if (!isValidEmail(data.email)) {
            alert("Please enter a valid email address!");
            return;
        }

        if (!isValidFutureDate(data.weddingDate)) {
            alert("Please select a future wedding date!");
            return;
        }

        if (CONFIG.GOOGLE_APPS_SCRIPT_URL === "YOUR_DEPLOY_URL_HERE") {
            alert("Google Sheets integration not configured yet.\n\nPlease set up Google Apps Script and update the URL in script.js\n\nFor now, you can use the WhatsApp button to book!");
            return;
        }

        const originalText = submitBtn.innerText;
        submitBtn.innerText = "Saving...";
        submitBtn.disabled = true;
        if (errorMsg) errorMsg.style.display = 'none';

        console.log('🚀 Sending data to Google Sheets:', data);

        try {
            await fetch(CONFIG.GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            console.log('✅ Data sent successfully to Google Sheets');
            updateSuccessUI(data.package, data.theme);

            document.getElementById('confirmedTheme').innerText = data.theme;
            document.getElementById('bookingModal').style.display = 'none';
            document.getElementById('successOverlay').style.display = 'flex';

        } catch (error) {
            console.error('Error:', error.message);
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
     * Update success UI
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

        triggerSuccessConfetti();
    }

    /**
     * Trigger confetti
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
     * Open preview modal
     */
    function openPreview(element) {
        const theme = element.dataset.theme;
        const demoUrl = element.dataset.demo;

        console.log('openPreview called with theme:', theme, 'demoUrl:', demoUrl);

        const previewTitle = document.getElementById('previewTitle');
        previewTitle.innerText = theme;

        const demoBtn = document.getElementById('viewDemoBtn');
        if (demoUrl) {
            demoBtn.href = demoUrl;
            demoBtn.style.display = 'flex';
        } else {
            demoBtn.style.display = 'none';
        }

        const bookBtn = document.querySelector('.btn-preview-primary');
        if (bookBtn) {
            bookBtn.dataset.action = `select-theme:${theme}`;
        }

        ModalManager.open('previewModal');

        const modal = document.getElementById('previewModal');
        console.log('Modal display style after open:', modal.style.display);
    }

    /**
     * Book from preview modal
     */
    function bookFromPreview() {
        ModalManager.close(document.getElementById('previewModal'));
        const themeName = document.getElementById('previewTitle').innerText;

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
     * Select package
     */
    function selectPackage(element) {
        const cards = document.querySelectorAll('.package-card');
        cards.forEach(card => card.classList.remove('active', 'confetti-active'));

        element.classList.add('active');

        const selectedPackage = element.getAttribute('data-package');
        document.getElementById('packageInput').value = selectedPackage;

        const dateInput = document.getElementById('weddingDate');
        const today = new Date();

        if (selectedPackage === 'Bespoke') {
            today.setDate(today.getDate() + 7);
        } else {
            today.setDate(today.getDate() + 2);
        }
        dateInput.min = today.toISOString().split('T')[0];

        updatePriceFooter(selectedPackage);

        if (selectedPackage === 'Bespoke') {
            triggerConfetti(element);
        }
    }

    /**
     * Select and compare package
     */
    let hasSeenComparison = sessionStorage.getItem('hasSeenComparison') === 'true';

    function selectAndCompare(element) {
        selectPackage(element);

        if (!hasSeenComparison) {
            setTimeout(() => {
                openCompare();
                highlightTableColumn(element.dataset.package);
                scrollToHighlightedColumn(element.dataset.package);
                hasSeenComparison = true;
                sessionStorage.setItem('hasSeenComparison', 'true');
            }, 300);
        } else {
            showPackageSwitchHint();
        }
    }

    /**
     * Scroll to highlighted column
     */
    function scrollToHighlightedColumn(packageName) {
        const tableWrapper = document.querySelector('.table-wrapper');
        if (!tableWrapper) return;

        const indexMap = { 'Classic': 0, 'Signature': 1, 'Bespoke': 2 };
        const colIndex = indexMap[packageName];
        if (colIndex === undefined) return;

        const cells = tableWrapper.querySelectorAll('.compare-table tbody tr td:nth-child(' + (colIndex + 2) + ')');
        if (cells.length > 0) {
            const cell = cells[0];
            const wrapperRect = tableWrapper.getBoundingClientRect();
            const cellRect = cell.getBoundingClientRect();

            tableWrapper.scrollBy({
                left: cellRect.left - wrapperRect.left - (wrapperRect.width / 2) + (cellRect.width / 2),
                behavior: 'smooth'
            });
        }
    }

    /**
     * Show package switch hint
     */
    function showPackageSwitchHint() {
        const existingHint = document.getElementById('packageSwitchHint');
        if (existingHint) {
            existingHint.remove();
        }

        const hint = document.createElement('div');
        hint.id = 'packageSwitchHint';
        hint.className = 'package-switch-hint';
        hint.setAttribute('role', 'status');
        hint.setAttribute('aria-live', 'polite');
        hint.innerHTML = '<i class="ph ph-info"></i> <span>Package updated. Compare features anytime.</span>';

        const packageSelector = document.querySelector('.package-selector');
        if (packageSelector) {
            packageSelector.appendChild(hint);

            setTimeout(() => {
                hint.style.opacity = '0';
                setTimeout(() => hint.remove(), 300);
            }, 3000);
        }
    }

    /**
     * Highlight table column
     */
    function highlightTableColumn(packageName) {
        const table = document.querySelector('.compare-table');
        if (!table) return;

        const indexMap = { 'Classic': 1, 'Signature': 2, 'Bespoke': 3 };
        const colIndex = indexMap[packageName];
        if (colIndex === undefined) return;

        table.querySelectorAll('td, th').forEach(el => el.classList.remove('active-col'));

        table.querySelectorAll(`tr td:nth-child(${colIndex + 1}), tr th:nth-child(${colIndex + 1})`)
             .forEach(el => el.classList.add('active-col'));
    }

    /**
     * Update price footer
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
     * Trigger confetti for package
     */
    function triggerConfetti(card) {
        let wrapper = card.querySelector('.confetti-wrapper');
        if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.className = 'confetti-wrapper';
            card.appendChild(wrapper);
        }
        wrapper.innerHTML = '';
        card.classList.add('confetti-active');

        const colors = ['#D4AF37', '#F4D35E', '#FFFFFF', '#cb997e'];
        for (let i = 0; i < 12; i++) {
            const p = document.createElement('div');
            p.className = 'particle';

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
     * Open compare modal
     */
    function openCompare() {
        ModalManager.open('compareModal');
    }

    /**
     * Close compare modal
     */
    function closeCompare() {
        ModalManager.close(document.getElementById('compareModal'));
    }

    /**
     * Open legal modal
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
     * Close legal modal
     */
    function closeLegal() {
        ModalManager.close(document.getElementById('legalModal'));
    }

    /**
     * Validate terms
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
     * Toggle about section
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
            document.querySelector('.about-section').scrollIntoView({ behavior: 'smooth' });
        }
    }

    /* ========================================
       INITIALIZATION FUNCTIONS
       ======================================== */

    /**
     * Initialize botanical pattern
     */
    function initBotanicalPattern() {
        const botanicalItems = document.querySelectorAll('.botanical-sketch');
        botanicalItems.forEach(item => {
            const randomRotation = Math.floor(Math.random() * 360);
            item.style.setProperty('--pattern-rotation', `${randomRotation}deg`);
            const randomX = Math.floor(Math.random() * 100);
            const randomY = Math.floor(Math.random() * 100);
            item.style.backgroundPosition = `${randomX}px ${randomY}px`;
        });
    }

    /**
     * Initialize scroll reveal
     */
    function initScrollReveal() {
        const bentoItems = document.querySelectorAll('.bento-item');

        const revealOptions = {
            threshold: 0.15,
            rootMargin: "0px 0px -50px 0px"
        };

        const revealOnScroll = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-active');
                    observer.unobserve(entry.target);
                }
            });
        }, revealOptions);

        bentoItems.forEach(item => {
            revealOnScroll.observe(item);
        });
    }

    /**
     * Initialize bento grid listeners
     */
    function initBentoGridListeners() {
        document.querySelectorAll('.bento-item').forEach(item => {
            item.addEventListener('click', function(e) {
                const theme = this.dataset.theme;
                const demoUrl = this.dataset.demo;

                if (theme === "Your Design") {
                    selectTheme("Your Design");
                } else {
                    window.location.href = demoUrl;
                }
            });
        });

        document.querySelectorAll('.btn-bespoke').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                selectTheme('Your Design');
            });
        });
    }

    /**
     * Check URL parameters
     */
    function checkUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const themeToSelect = urlParams.get('select');
        const bookNow = urlParams.get('book');

        console.log('checkUrlParameters called:', themeToSelect, 'book:', bookNow);
        console.log('Current URL:', window.location.href);

        if (themeToSelect) {
            const item = document.querySelector(`[data-theme="${themeToSelect}"]`);
            console.log('Found item:', item);

            if (item) {
                setTimeout(() => {
                    if (bookNow === 'true') {
                        console.log('Opening booking form for:', themeToSelect);
                        selectTheme(themeToSelect);
                    } else {
                        console.log('Opening preview for:', themeToSelect);
                        openPreview(item);
                    }
                }, 100);

                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                console.error('Item not found for theme:', themeToSelect);
            }
        }
    }

    /**
     * Initialize form listeners
     */
    function initFormListeners() {
        const today = new Date();
        today.setDate(today.getDate() + 2);
        const weddingDateInput = document.getElementById('weddingDate');
        if (weddingDateInput) {
            weddingDateInput.min = today.toISOString().split('T')[0];
        }

        const inviteForm = document.getElementById('inviteForm');
        if (inviteForm) {
            inviteForm.addEventListener('submit', function(e) {
                e.preventDefault();
                sendToSheet();
            });
        }

        const btnSubmit = document.getElementById('btnSubmitForm');
        if (btnSubmit) {
            btnSubmit.addEventListener('click', function(e) {
                e.preventDefault();
                sendToSheet();
            });
        }

        const btnWhatsApp = document.getElementById('btnWhatsApp');
        if (btnWhatsApp) {
            btnWhatsApp.addEventListener('click', function(e) {
                e.preventDefault();
                sendToWhatsApp();
            });
        }
    }

    /**
     * Initialize package card listeners
     */
    function initPackageCardListeners() {
        const packageCards = document.querySelectorAll('.package-card');
        const packageInput = document.getElementById('packageInput');

        if (packageCards.length > 0 && packageInput) {
            packageCards.forEach(card => {
                if (card.getAttribute('data-package') === 'Signature') {
                    card.classList.add('active');
                }
            });
        }

        // Add click listeners to package cards
        packageCards.forEach(card => {
            card.addEventListener('click', function() {
                selectAndCompare(this);
            });
        });
    }

    /**
     * Initialize modal close listeners
     */
    function initModalCloseListeners() {
        // Close button listeners
        document.querySelectorAll('[data-close-modal]').forEach(button => {
            button.addEventListener('click', function() {
                const modalId = this.dataset.closeModal;
                if (modalId === 'compareModal') {
                    closeCompare();
                } else if (modalId === 'legalModal') {
                    closeLegal();
                } else if (modalId === 'previewModal') {
                    closePreview();
                } else if (modalId === 'bookingModal') {
                    closeModal();
                }
            });
        });

        // Outside click listeners
        ['bookingModal', 'previewModal', 'successOverlay', 'legalModal', 'compareModal'].forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.addEventListener('click', function(e) {
                    if (e.target === this) {
                        if (modalId === 'successOverlay') {
                            closeSuccess();
                        } else if (modalId === 'compareModal') {
                            closeCompare();
                        } else if (modalId === 'legalModal') {
                            closeLegal();
                        } else if (modalId === 'previewModal') {
                            closePreview();
                        } else {
                            ModalManager.handleOutsideClick(e, modalId);
                        }
                    }
                });
            }
        });
    }

    /**
     * Initialize action listeners (for data-action attributes)
     */
    function initActionListeners() {
        // Read more button
        const readMoreBtn = document.getElementById('readMoreBtn');
        if (readMoreBtn) {
            readMoreBtn.addEventListener('click', toggleAbout);
        }

        // Compare links
        document.querySelectorAll('[data-action="open-compare"]').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                openCompare();
            });
        });

        // Legal links
        document.querySelectorAll('[data-action="open-legal"]').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const type = this.dataset.legalType;
                if (type) {
                    openLegal(type);
                }
            });
        });

        // Book from preview button
        const bookFromPreviewBtn = document.querySelector('[data-action="book-from-preview"]');
        if (bookFromPreviewBtn) {
            bookFromPreviewBtn.addEventListener('click', bookFromPreview);
        }

        // Close success button
        const closeSuccessBtn = document.querySelector('[data-action="close-success"]');
        if (closeSuccessBtn) {
            closeSuccessBtn.addEventListener('click', closeSuccess);
        }

        // View demo button - prevent default and stop propagation
        const viewDemoBtn = document.getElementById('viewDemoBtn');
        if (viewDemoBtn) {
            viewDemoBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const href = this.getAttribute('href');
                if (href && href !== '#') {
                    window.location.href = href;
                }
            });
        }
    }

    /**
     * Initialize scroll listener
     */
    function initScrollListener() {
        window.addEventListener('scroll', function() {
            const header = document.querySelector('header h1');
            const scrollPosition = window.scrollY;
            const maxScroll = 500;

            if (header && scrollPosition < maxScroll) {
                const weight = 200 + (scrollPosition / maxScroll) * 600;
                header.style.fontWeight = Math.min(weight, 800);
            }
        });
    }

    /**
     * Initialize form validation
     */
    function initFormValidation() {
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
    }

    /**
     * Initialize escape key listener
     */
    function initEscapeKeyListener() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (ModalManager.currentModal) {
                    ModalManager.close(ModalManager.currentModal);
                }
                const successOverlay = document.getElementById('successOverlay');
                if (successOverlay && successOverlay.style.display === 'flex') {
                    closeSuccess();
                }
            }
        });
    }

    /* ========================================
       DOM READY INITIALIZATION
       ======================================== */
    function init() {
        console.log('🎉 Sabah Wedding E-Invite Gallery Ready!');
        console.log('Themes: Beach, Rainforest, Luxury, Garden, Chapel');
        console.log('Templates: Modern (1), Classic (2), Rustic Garden (3), Minimalist (4), Floral Romance (5), Your Design (6)');
        console.log('Packages: Classic (RM 49), Signature (RM 99), Bespoke (RM 149+)');
        console.log('Features: Live Ucapan, Package Selector, Comparison Table, Haptic Feedback, VIP Treatment');

        // Initialize all components
        initBentoGridListeners();
        initBotanicalPattern();
        initScrollReveal();
        checkUrlParameters();
        initFormListeners();
        initPackageCardListeners();
        initModalCloseListeners();
        initActionListeners();
        initScrollListener();
        initFormValidation();
        initEscapeKeyListener();

        // Expose necessary functions to window for external access
        window.selectTheme = selectTheme;
        window.ModalManager = ModalManager;
        window.CONFIG = CONFIG;
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
