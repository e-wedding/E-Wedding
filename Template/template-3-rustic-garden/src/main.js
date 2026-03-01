/**
 * Rustic Garden Wedding Invitation - Main JavaScript
 * Natural, organic animations with botanical themes
 * Includes: Parallax effects, form handling, music control
 */

// Initialize application
document.addEventListener('DOMContentLoaded', init);

function init() {
    // 1. GSAP Scroll Animations
    initGSAPAnimations();

    // 2. Parallax Effects for botanical elements
    initParallaxEffects();

    // 3. Countdown Timer (if element exists)
    initCountdown();

    // 4. Form Handling
    initFormHandling();

    // 5. Background Music Control
    initBackgroundMusic();

    // 6. Gift Button Copy Functionality
    initGiftButtons();

    // 7. Smooth Scroll for Anchor Links
    initSmoothScroll();
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

    gsap.utils.toArray('.gs_reveal').forEach((elem) => {
        const delay = parseFloat(elem.dataset.gsDelay) || 0;
        gsap.fromTo(elem,
            {
                opacity: 0,
                y: 50,
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
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                }
            }
        );
    });

    // Parallax animation for botanical elements
    gsap.utils.toArray('.leaf, .flower').forEach((elem, i) => {
        gsap.to(elem, {
            y: -30,
            rotation: 10,
            duration: 3 + i,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            scrollTrigger: {
                trigger: 'body',
                start: 'top top',
                end: 'bottom bottom',
                scrub: 1
            }
        });
    });
}

/**
 * Initialize parallax effects for botanical elements
 */
function initParallaxEffects() {
    const leaves = document.querySelectorAll('.leaf, .flower');
    
    if (leaves.length === 0) return;

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        leaves.forEach((leaf, index) => {
            const speed = 0.1 + (index * 0.05);
            const yPos = -(scrolled * speed);
            leaf.style.transform = `translateY(${yPos}px) rotate(${yPos * 0.1}deg)`;
        });
    });
}

/**
 * Initialize countdown timer (if element exists)
 */
function initCountdown() {
    const weddingDateStr = document.querySelector('.event-date')?.textContent;
    if (!weddingDateStr) return;

    // Parse date (format: "Sabtu, 15 Oktober 2027")
    const months = {
        'Januari': 0, 'Februari': 1, 'Mac': 2, 'April': 3, 'Mei': 4, 'Jun': 5,
        'Julai': 6, 'Ogos': 7, 'September': 8, 'Oktober': 9, 'November': 10, 'Disember': 11
    };

    const dateParts = weddingDateStr.split(', ')[1]?.split(' ');
    if (!dateParts) return;

    const day = parseInt(dateParts[0]);
    const month = months[dateParts[1]];
    const year = parseInt(dateParts[2]);

    const weddingDate = new Date(year, month, day, 11, 0, 0);

    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance < 0) return;

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // You can add countdown display elements here if needed
        console.log(`Countdown: ${days}d ${hours}h ${minutes}m ${seconds}s`);
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

/**
 * Initialize form handling with loading state
 */
function initFormHandling() {
    const attendanceSelect = document.getElementById('attendance');
    const paxContainer = document.getElementById('paxContainer');
    const paxSelect = document.getElementById('pax');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnIcon = document.getElementById('btnIcon');

    // Toggle pax dropdown based on attendance
    if (attendanceSelect) {
        attendanceSelect.addEventListener('change', function() {
            if (this.value === 'Tidak Hadir') {
                if (paxContainer) paxContainer.style.display = 'none';
                if (paxSelect) paxSelect.required = false;
            } else {
                if (paxContainer) paxContainer.style.display = 'block';
                if (paxSelect) paxSelect.required = true;
            }
        });
    }

    // Form submission
    const rsvpForm = document.getElementById('rsvpForm');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', function(e) {
            e.preventDefault();

            setLoading(true);

            const name = document.getElementById('name').value;
            const attendance = document.getElementById('attendance').value;
            const pax = document.getElementById('pax')?.value || '0';
            const message = document.getElementById('message').value;
            const phone = document.getElementById('phone').value;

            // Create wish object
            const wish = {
                name: name,
                attendance: attendance,
                pax: pax,
                message: message,
                phone: phone,
                timestamp: new Date().toISOString()
            };

            // Save to localStorage
            saveWish(wish);

            // Add to wishes display
            if (message.trim() !== '') {
                const container = document.getElementById('wishesContainer');
                if (container) {
                    const newWish = createWishElement(name, attendance, pax, message);
                    container.insertBefore(newWish, container.firstChild);
                }
            }

            // Show success message
            const successMsg = document.getElementById('successMsg');
            if (successMsg) {
                successMsg.classList.remove('hidden');
            }

            // Reset form
            this.reset();
            if (paxContainer) paxContainer.style.display = 'block';

            // Reset button state
            setTimeout(() => {
                setLoading(false);
                setTimeout(() => {
                    if (successMsg) successMsg.classList.add('hidden');
                }, 3000);
            }, 1500);
        });
    }

    function setLoading(isLoading) {
        if (!submitBtn) return;

        if (isLoading) {
            submitBtn.disabled = true;
            if (btnText) btnText.textContent = 'Menghantar...';
            if (btnIcon) {
                btnIcon.className = 'ph ph-spinner animate-spin';
            }
        } else {
            submitBtn.disabled = false;
            if (btnText) btnText.textContent = 'Hantar RSVP';
            if (btnIcon) {
                btnIcon.className = 'ph ph-paper-plane-right';
            }
        }
    }
}

/**
 * Save wish to localStorage
 */
function saveWish(wish) {
    const STORAGE_KEY = 'rustic_wedding_wishes';
    const savedWishes = localStorage.getItem(STORAGE_KEY);
    const wishes = savedWishes ? JSON.parse(savedWishes) : [];
    wishes.unshift(wish);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
}

/**
 * Create a wish DOM element
 */
function createWishElement(name, attendance, pax, message) {
    const newWish = document.createElement('div');
    newWish.className = `wish-tag bg-cream p-5 rounded-xl shadow-sm border-l-4 ${attendance === 'Hadir' ? 'border-sage' : 'border-gray-300'}`;
    newWish.setAttribute('role', 'listitem');

    const attendanceText = attendance === 'Hadir' ? `Hadir (${pax} Orang)` : 'Tidak Hadir';
    const attendanceClass = attendance === 'Hadir' ? 'text-sage' : 'text-gray-400';

    newWish.innerHTML = `
        <p class="font-display font-medium text-textMain">${escapeHtml(name)}</p>
        <p class="font-handwritten text-sm ${attendanceClass} mt-1">${escapeHtml(attendanceText)}</p>
        <p class="font-body italic text-textLight mt-3">"${escapeHtml(message)}"</p>
    `;

    return newWish;
}

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Initialize background music control
 */
function initBackgroundMusic() {
    const musicToggle = document.getElementById('musicToggle');
    const musicIcon = document.getElementById('musicIcon');
    
    if (!musicToggle || !musicIcon) return;

    // Create audio element (add your music file path)
    const audio = new Audio('assets/music/background.mp3');
    audio.loop = true;
    audio.volume = 0.3;

    let isPlaying = false;

    musicToggle.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            musicIcon.className = 'ph-fill ph-speaker-high text-2xl text-sage';
        } else {
            audio.play().catch(err => {
                console.warn('Audio playback failed:', err);
                alert('Please interact with the page first before playing music.');
            });
            musicIcon.className = 'ph-fill ph-speaker-slash text-2xl text-sage';
        }
        isPlaying = !isPlaying;
    });

    // Play on first user interaction (browser policy)
    const playOnInteraction = () => {
        if (!isPlaying) {
            audio.play().catch(() => {});
            musicIcon.className = 'ph-fill ph-speaker-slash text-2xl text-sage';
            isPlaying = true;
        }
        document.removeEventListener('click', playOnInteraction);
        document.removeEventListener('scroll', playOnInteraction);
    };

    document.addEventListener('click', playOnInteraction, { once: true });
    document.addEventListener('scroll', playOnInteraction, { once: true });
}

/**
 * Initialize gift button copy functionality
 */
function initGiftButtons() {
    const giftBtns = document.querySelectorAll('.gift-btn');
    
    giftBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.querySelector('p:last-child')?.textContent;
            if (text) {
                navigator.clipboard.writeText(text.trim()).then(() => {
                    // Show feedback
                    const originalHTML = btn.innerHTML;
                    btn.innerHTML = `
                        <i class="ph-fill ph-check-circle text-2xl text-sage mb-2"></i>
                        <p class="font-display text-sm tracking-widest">Disalin!</p>
                    `;
                    setTimeout(() => {
                        btn.innerHTML = originalHTML;
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy:', err);
                });
            }
        });
    });
}

/**
 * Initialize smooth scroll for anchor links
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
