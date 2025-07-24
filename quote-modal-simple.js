// Simple Quote Modal - Temporary test version
(function() {
    'use strict';

    // Simple modal HTML
    const modalHTML = `
        <div id="quoteModal" class="simple-quote-modal" style="display: none;">
            <div class="simple-modal-overlay" onclick="closeQuoteModal()"></div>
            <div class="simple-modal-content">
                <button class="simple-modal-close" onclick="closeQuoteModal()">×</button>
                <div class="simple-modal-body">
                    <h3>Get Your Free Auto Insurance Quote</h3>
                    <p>Save up to 40% on your auto insurance in just 5 minutes</p>
                    
                    <form action="https://formspree.io/f/xkgbdjgy" method="POST">
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem;">First Name</label>
                            <input type="text" name="firstname" style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;" required>
                        </div>
                        
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem;">Last Name</label>
                            <input type="text" name="lastname" style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;" required>
                        </div>
                        
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem;">Email</label>
                            <input type="email" name="email" style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;" required>
                        </div>
                        
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem;">Phone</label>
                            <input type="tel" name="phone" style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;" required>
                        </div>
                        
                        <div style="margin-bottom: 1rem;">
                            <label style="display: block; margin-bottom: 0.5rem;">ZIP Code</label>
                            <input type="text" name="zip" style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px;" maxlength="5" required>
                        </div>
                        
                        <button type="submit" style="width: 100%; padding: 0.75rem; background: #1e3a8a; color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer;">Get My Quote</button>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Simple CSS
    const modalCSS = `
        <style>
        .simple-quote-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            display: flex !important;
            align-items: center;
            justify-content: center;
        }

        .simple-modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
        }

        .simple-modal-content {
            position: relative;
            background: white;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            z-index: 1;
        }

        .simple-modal-body {
            padding: 2rem;
        }

        .simple-modal-close {
            position: absolute;
            top: 10px;
            right: 10px;
            background: none;
            border: none;
            font-size: 2rem;
            cursor: pointer;
            color: #666;
        }

        .simple-modal-close:hover {
            color: #000;
        }
        </style>
    `;

    // Global functions
    window.openQuoteModal = function() {
        const modal = document.getElementById('quoteModal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    };

    window.closeQuoteModal = function() {
        const modal = document.getElementById('quoteModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    };

    // Initialize
    function init() {
        if (!document.getElementById('quoteModal')) {
            document.head.insertAdjacentHTML('beforeend', modalCSS);
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();