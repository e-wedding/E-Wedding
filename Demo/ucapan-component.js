/**
 * ========================================
 * LIVE UCAPAN (WISHES) COMPONENT
 * Realtime wishes display for wedding templates
 * ========================================
 */

// Storage key for wishes
const WISHES_STORAGE_KEY = 'wedding_ucapan_wishes';

/**
 * Initialize Ucapan component
 */
function initUcapan() {
    loadWishes();
    setupFormHandler();
}

/**
 * Load wishes from localStorage
 */
function loadWishes() {
    const container = document.getElementById('ucapanContainer');
    if (!container) return;

    const savedWishes = localStorage.getItem(WISHES_STORAGE_KEY);
    const wishes = savedWishes ? JSON.parse(savedWishes) : [];

    if (wishes.length === 0) {
        // Add default wishes
        const defaultWishes = [
            {
                name: 'Ahmad & Family',
                attendance: 'Hadir',
                message: 'Selamat pengantin baru! Moga kekal selamanya.'
            },
            {
                name: 'Siti Nurhaliza',
                attendance: 'Hadir',
                message: 'Semoga berbahagia hingga ke Jannah.'
            }
        ];

        defaultWishes.forEach(wish => {
            const wishEl = createWishElement(wish.name, wish.attendance, wish.message);
            container.appendChild(wishEl);
        });
    } else {
        wishes.forEach(wish => {
            const wishEl = createWishElement(wish.name, wish.attendance, wish.message);
            container.appendChild(wishEl);
        });
    }
}

/**
 * Create wish DOM element
 */
function createWishElement(name, attendance, message) {
    const div = document.createElement('div');
    div.className = 'ucapan-card';
    
    const statusClass = attendance === 'Hadir' ? 'status-hadir' : 'status-tidak';
    const statusText = attendance === 'Hadir' ? '✓ Hadir' : '✗ Tidak Hadir';
    
    div.innerHTML = `
        <div class="ucapan-card-header">
            <span class="ucapan-card-name">${escapeHtml(name)}</span>
            <span class="ucapan-card-status ${statusClass}">${statusText}</span>
        </div>
        <p class="ucapan-card-message">"${escapeHtml(message)}"</p>
    `;
    
    return div;
}

/**
 * Setup form handler
 */
function setupFormHandler() {
    const form = document.getElementById('ucapanForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('ucapanName').value;
        const attendance = document.getElementById('ucapanAttendance').value;
        const message = document.getElementById('ucapanMessage').value;

        if (!name || !message) {
            alert('Sila isi nama dan ucapan');
            return;
        }

        // Save to localStorage
        const wish = { name, attendance, message, timestamp: new Date().toISOString() };
        saveWish(wish);

        // Add to display
        const container = document.getElementById('ucapanContainer');
        if (container) {
            const wishEl = createWishElement(name, attendance, message);
            container.insertBefore(wishEl, container.firstChild);
        }

        // Reset form
        form.reset();

        // Show success
        alert('Terima kasih! Ucapan anda telah direkodkan.');
    });
}

/**
 * Save wish to localStorage
 */
function saveWish(wish) {
    const savedWishes = localStorage.getItem(WISHES_STORAGE_KEY);
    const wishes = savedWishes ? JSON.parse(savedWishes) : [];
    wishes.unshift(wish); // Add to beginning
    localStorage.setItem(WISHES_STORAGE_KEY, JSON.stringify(wishes));
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUcapan);
} else {
    initUcapan();
}
