/**
 * Floral Romance Wedding Invitation - Main JavaScript
 * Elegant animations with floral petal effects
 */

// Initialize application
document.addEventListener('DOMContentLoaded', init);

function init() {
    // 1. GSAP Scroll Animations
    initGSAPAnimations();

    // 2. Petal Animation Enhancement
    initPetalAnimation();

    // 3. Form Handling
    initFormHandling();

    // 4. Gift Card Copy Functionality
    initGiftCards();

    // 5. Attendance Toggle
    initAttendanceToggle();

    // 6. Initialize Ucapan (from shared component)
    if (typeof initUcapan === 'function') {
        initUcapan();
    }
}

/**
 * Initialize GSAP scroll animations
 */
function initGSAPAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.warn('GSAP not loaded');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Reveal animations
    gsap.utils.toArray('.gs_reveal').forEach((elem) => {
        const delay = parseFloat(elem.dataset.gsDelay) || 0;
        
        gsap.fromTo(elem,
            {
                opacity: 0,
                y: 60,
                visibility: 'hidden'
            },
            {
                opacity: 1,
                y: 0,
                visibility: 'visible',
                duration: 1.2,
                delay: delay,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: elem,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse',
                }
            }
        );
    });

    // Parallax effect for floral elements
    gsap.to('.floral-petals', {
        y: -50,
        scrollTrigger: {
            trigger: 'body',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        }
    });
}

/**
 * Enhanced petal animation
 */
function initPetalAnimation() {
    const petals = document.querySelectorAll('.petal');
    
    petals.forEach((petal, index) => {
        // Add random horizontal movement
        const randomX = Math.random() * 100 - 50;
        petal.style.setProperty('--random-x', `${randomX}px`);
    });
}

/**
 * Initialize attendance toggle
 */
function initAttendanceToggle() {
    const attendanceSelect = document.getElementById('attendance');
    const paxContainer = document.getElementById('paxContainer');
    const paxSelect = document.getElementById('pax');

    if (!attendanceSelect || !paxContainer) return;

    attendanceSelect.addEventListener('change', function() {
        if (this.value === 'Tidak Hadir') {
            paxContainer.style.display = 'none';
            if (paxSelect) paxSelect.required = false;
        } else {
            paxContainer.style.display = 'block';
            if (paxSelect) paxSelect.required = true;
        }
    });
}

/**
 * Initialize form handling
 */
function initFormHandling() {
    const rsvpForm = document.getElementById('rsvpForm');
    const submitBtn = document.getElementById('rsvpForm')?.querySelector('button[type="submit"]');
    const successMsg = document.getElementById('successMsg');

    if (!rsvpForm) return;

    rsvpForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Set loading state
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="ph ph-spinner animate-spin"></i> Sending...';
        }

        // Collect form data
        const formData = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            attendance: document.getElementById('attendance').value,
            pax: document.getElementById('pax')?.value || '0',
            message: document.getElementById('message').value,
            timestamp: new Date().toISOString()
        };

        // Save to localStorage
        saveRSVP(formData);

        // Simulate API call
        setTimeout(() => {
            // Show success message
            if (successMsg) {
                successMsg.style.display = 'block';
            }
            
            // Reset form
            rsvpForm.reset();
            
            // Reset button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="ph ph-paper-plane-right"></i> Send RSVP';
            }

            // Hide success message after 5 seconds
            setTimeout(() => {
                if (successMsg) {
                    successMsg.style.display = 'none';
                }
            }, 5000);
        }, 1500);
    });
}

/**
 * Save RSVP to localStorage
 */
function saveRSVP(data) {
    const STORAGE_KEY = 'floral_wedding_rsvp';
    const savedData = localStorage.getItem(STORAGE_KEY);
    const entries = savedData ? JSON.parse(savedData) : [];
    entries.unshift(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    console.log('RSVP saved:', data);
}

/**
 * Initialize gift card copy functionality
 */
function initGiftCards() {
    const copyButtons = document.querySelectorAll('.btn-copy-floral');
    
    copyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.gift-card-floral');
            const number = card.querySelector('.gift-number');
            const textToCopy = number.dataset.copy || number.textContent.trim();

            navigator.clipboard.writeText(textToCopy).then(() => {
                // Show feedback
                const originalIcon = btn.innerHTML;
                btn.innerHTML = '<i class="ph ph-check"></i>';
                btn.style.color = '#16a34a';
                
                setTimeout(() => {
                    btn.innerHTML = '<i class="ph ph-copy"></i>';
                    btn.style.color = '';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy:', err);
            });
        });
    });
}

/**
 * Add loading spinner animation
 */
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    .animate-spin {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);
