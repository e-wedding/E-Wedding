/**
 * Minimalist Wedding Invitation - Main JavaScript
 * Clean, precise interactions with smooth animations
 */

// Initialize application
document.addEventListener('DOMContentLoaded', init);

function init() {
    // 1. GSAP Scroll Animations
    initGSAPAnimations();

    // 2. Progress Bar
    initProgressBar();

    // 3. Smooth Scroll for Navigation
    initSmoothScroll();

    // 4. Form Handling
    initFormHandling();

    // 5. Gift Card Copy Functionality
    initGiftCards();

    // 6. Attendance Toggle
    initAttendanceToggle();
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
                duration: 1,
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

    // Parallax effect for hero
    gsap.to('.hero-content', {
        y: 100,
        scrollTrigger: {
            trigger: '.hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: 1
        }
    });
}

/**
 * Initialize scroll progress bar
 */
function initProgressBar() {
    const progressBar = document.getElementById('progressBar');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

/**
 * Initialize smooth scroll for navigation links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Initialize attendance toggle (hide pax if not attending)
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
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnIcon = document.getElementById('btnIcon');
    const successMsg = document.getElementById('successMsg');

    if (!rsvpForm) return;

    rsvpForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Set loading state
        setLoading(true);

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

        // Simulate API call (replace with actual Google Sheets integration)
        setTimeout(() => {
            // Show success message
            successMsg.style.display = 'block';
            
            // Reset form
            rsvpForm.reset();
            
            // Reset button
            setLoading(false);

            // Hide success message after 5 seconds
            setTimeout(() => {
                successMsg.style.display = 'none';
            }, 5000);
        }, 1500);
    });

    function setLoading(isLoading) {
        if (!submitBtn) return;

        if (isLoading) {
            submitBtn.disabled = true;
            btnText.textContent = 'SUBMITTING...';
            btnIcon.className = 'ph ph-spinner animate-spin';
        } else {
            submitBtn.disabled = false;
            btnText.textContent = 'SUBMIT RSVP';
            btnIcon.className = 'ph ph-arrow-right';
        }
    }
}

/**
 * Save RSVP to localStorage
 */
function saveRSVP(data) {
    const STORAGE_KEY = 'minimalist_wedding_rsvp';
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
    const copyButtons = document.querySelectorAll('.btn-copy');
    
    copyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.gift-card');
            const number = card.querySelector('.gift-card-number');
            const textToCopy = number.textContent.trim();

            navigator.clipboard.writeText(textToCopy).then(() => {
                // Show feedback
                const originalIcon = btn.innerHTML;
                btn.innerHTML = '<i class="ph ph-check"></i>';
                btn.style.color = '#16a34a';
                
                setTimeout(() => {
                    btn.innerHTML = originalIcon;
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
