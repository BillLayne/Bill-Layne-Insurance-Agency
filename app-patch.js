// Patch for app.min.js to prevent null reference errors
// This overrides the problematic attachEventListeners function

if (typeof AnalyzerSystem !== 'undefined') {
    // Override the attachEventListeners method with null checks
    AnalyzerSystem.attachEventListeners = function() {
        const modal = document.getElementById('analyzer-modal');
        if (!modal) {
            console.warn('Analyzer modal not found - skipping event listeners');
            return;
        }

        const closeBtn = modal.querySelector('.analyzer-modal-close, .analyzer-modal__close');
        const backdrop = modal.querySelector('.analyzer-modal__backdrop');
        const nextBtn = document.getElementById('analyzer-next');
        const prevBtn = document.getElementById('analyzer-prev');

        // Only add listeners if elements exist
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }
        
        if (backdrop) {
            backdrop.addEventListener('click', () => this.closeModal());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.handleNext());
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.handlePrevious());
        }

        // Keyboard events - always safe to add
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
                this.closeModal();
            }
        });
    };
}

// Also add safety to the init function
document.addEventListener('DOMContentLoaded', function() {
    // Check if AnalyzerSystem exists and has init method
    if (typeof AnalyzerSystem !== 'undefined' && typeof AnalyzerSystem.init === 'function') {
        // Override init to be safer
        const originalInit = AnalyzerSystem.init;
        AnalyzerSystem.init = function() {
            try {
                // Only attach event listeners if modal exists
                if (document.getElementById('analyzer-modal')) {
                    this.attachEventListeners();
                }
                // Call other initialization that doesn't depend on modal
                if (this.initQuoteSystem) {
                    this.initQuoteSystem();
                }
            } catch (error) {
                console.warn('AnalyzerSystem init error (non-critical):', error);
            }
        };
    }
});

console.log('App patch loaded - null reference errors should be prevented');