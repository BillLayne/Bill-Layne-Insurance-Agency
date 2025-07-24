// Unified Quote Modal Component
// This file provides a modal quote form that can be used across all pages

(function() {
    'use strict';

    // Modal HTML template
    const modalHTML = `
        <div id="quoteModal" class="quote-modal" aria-hidden="true" role="dialog" aria-labelledby="modalTitle">
            <div class="quote-modal__overlay" onclick="closeQuoteModal()"></div>
            <div class="quote-modal__content">
                <button class="quote-modal__close" onclick="closeQuoteModal()" aria-label="Close modal">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <div class="quote-form">
                    <h3 id="modalTitle">Get Your Free Quote</h3>
                    <form id="modalQuoteForm" class="form" aria-label="Insurance Quote Form">
                        <div class="form-group">
                            <label for="modalName" class="form-label">Your Name</label>
                            <input type="text" id="modalName" name="name" class="form-control" placeholder="Enter your full name" required aria-required="true" autocomplete="name">
                        </div>
                        <div class="form-group">
                            <label for="modalPhone" class="form-label">Phone Number</label>
                            <input type="tel" id="modalPhone" name="phone" class="form-control" placeholder="(xxx) xxx-xxxx" required aria-required="true" autocomplete="tel">
                        </div>
                        <div class="form-group">
                            <label for="modalEmail" class="form-label">Email Address</label>
                            <input type="email" id="modalEmail" name="email" class="form-control" placeholder="your@email.com" required aria-required="true" autocomplete="email">
                        </div>
                        <div class="form-group">
                            <label for="modalInsuranceType" class="form-label">Insurance Type</label>
                            <select id="modalInsuranceType" name="insuranceType" class="form-control" required aria-required="true">
                                <option value="">Select Insurance Type</option>
                                <option value="auto">Auto Insurance</option>
                                <option value="home">Home Insurance</option>
                                <option value="both">Auto + Home Bundle</option>
                                <option value="commercial">Commercial Insurance</option>
                                <option value="specialty">Specialty Coverage</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn--primary btn--full-width">See My Savings</button>
                    </form>
                    <p class="form-note">✓ No spam, ever. Your information is secure.</p>
                </div>
            </div>
        </div>
    `;

    // Modal CSS if not already included
    const modalCSS = `
        <style>
        /* Quote Modal Styles */
        .quote-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 9999;
            display: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .quote-modal.active {
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 1;
        }

        .quote-modal__overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            cursor: pointer;
        }

        .quote-modal__content {
            position: relative;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            animation: modalSlideUp 0.3s ease;
            z-index: 1;
        }

        .quote-modal__close {
            position: absolute;
            top: -10px;
            right: -10px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--color-primary, #1e3a8a);
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            z-index: 10;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        }

        .quote-modal__close:hover {
            background: var(--color-primary-dark, #0f172a);
            transform: rotate(90deg);
        }

        .quote-modal__close svg {
            width: 20px;
            height: 20px;
        }

        .quote-modal .quote-form {
            margin: 0;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            background: rgba(255, 255, 255, 0.98);
            padding: 2rem;
            border-radius: 1rem;
        }

        @keyframes modalSlideUp {
            from {
                transform: translateY(50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        @media (max-width: 768px) {
            .quote-modal__content {
                width: 95%;
                max-height: 95vh;
                margin: 10px;
            }
            
            .quote-modal__close {
                top: -5px;
                right: -5px;
                width: 35px;
                height: 35px;
            }
            
            .quote-modal .quote-form {
                padding: 1.5rem;
            }
            
            .quote-modal .quote-form h3 {
                font-size: 1.5rem;
                margin-bottom: 1rem;
            }
        }

        body.modal-open {
            overflow: hidden;
            position: fixed;
            width: 100%;
        }
        </style>
    `;

    // Global functions
    window.openQuoteModal = function() {
        const modal = document.getElementById('quoteModal');
        const body = document.body;
        
        if (modal) {
            modal.classList.add('active');
            body.classList.add('modal-open');
            modal.setAttribute('aria-hidden', 'false');
            
            // Focus on first input
            setTimeout(() => {
                const firstInput = modal.querySelector('input[type="text"]');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 100);
        }
    };

    window.closeQuoteModal = function() {
        const modal = document.getElementById('quoteModal');
        const body = document.body;
        
        if (modal) {
            modal.classList.remove('active');
            body.classList.remove('modal-open');
            modal.setAttribute('aria-hidden', 'true');
        }
    };

    // Initialize modal when DOM is ready
    function initQuoteModal() {
        // Check if modal already exists
        if (document.getElementById('quoteModal')) {
            return;
        }

        // Add CSS if not already present
        if (!document.querySelector('style[data-modal-css]')) {
            const styleTag = document.createElement('div');
            styleTag.innerHTML = modalCSS;
            styleTag.querySelector('style').setAttribute('data-modal-css', 'true');
            document.head.appendChild(styleTag.querySelector('style'));
        }

        // Add modal HTML to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Handle ESC key to close modal
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeQuoteModal();
            }
        });

        // Form validation helper
        function validateForm(form) {
            const inputs = form.querySelectorAll('[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add('error');
                    isValid = false;
                } else {
                    input.classList.remove('error');
                }
            });
            
            return isValid;
        }

        // Handle form submission
        const modalForm = document.getElementById('modalQuoteForm');
        if (modalForm) {
            modalForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                if (!validateForm(this)) {
                    return;
                }
                
                const submitBtn = this.querySelector('button[type="submit"]');
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
                
                // Get form data
                const formData = new FormData(this);
                
                // Determine which EmailJS configuration to use
                // Default to main site configuration
                let serviceId = 'service_4flmw3k';
                let templateId = 'template_6k9bgwi';
                
                // Check if page-specific configuration exists
                if (window.EMAILJS_CONFIG) {
                    serviceId = window.EMAILJS_CONFIG.serviceId || serviceId;
                    templateId = window.EMAILJS_CONFIG.templateId || templateId;
                }
                
                // Prepare template parameters
                const templateParams = {
                    from_name: formData.get('name'),
                    name: formData.get('name'),
                    user_name: formData.get('name'),
                    customer_name: formData.get('name'),
                    from_email: formData.get('email'),
                    email: formData.get('email'),
                    user_email: formData.get('email'),
                    reply_to: formData.get('email'),
                    phone: formData.get('phone'),
                    user_phone: formData.get('phone'),
                    insurance_type: formData.get('insuranceType'),
                    insuranceType: formData.get('insuranceType'),
                    location: window.PAGE_LOCATION || 'Website',
                    source: window.PAGE_SOURCE || 'Quote Modal',
                    message: `New quote request for ${formData.get('insuranceType')} insurance from ${formData.get('name')}. Phone: ${formData.get('phone')}, Email: ${formData.get('email')}`
                };
                
                // Check if EmailJS is loaded
                if (typeof emailjs === 'undefined') {
                    console.error('EmailJS is not loaded!');
                    alert('There was an error loading the email service. Please try again or call us at (336) 835-1993.');
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                    return;
                }
                
                // Send email using EmailJS
                emailjs.send(serviceId, templateId, templateParams)
                    .then(function(response) {
                        // Show success message
                        alert('Thank you! Your quote request has been submitted. We\'ll contact you within 24 hours.');
                        
                        // Reset form
                        modalForm.reset();
                        
                        // Close modal
                        closeQuoteModal();
                        
                        // Remove loading state
                        submitBtn.classList.remove('loading');
                        submitBtn.disabled = false;
                    })
                    .catch(function(error) {
                        console.error('EmailJS Error:', error);
                        
                        // Remove loading state
                        submitBtn.classList.remove('loading');
                        submitBtn.disabled = false;
                        
                        // Try mailto fallback
                        const mailtoLink = `mailto:Save@BillLayneInsurance.com?subject=Quote Request - ${templateParams.insurance_type}&body=Name: ${templateParams.from_name}%0AEmail: ${templateParams.from_email}%0APhone: ${templateParams.phone}%0AInsurance Type: ${templateParams.insurance_type}`;
                        
                        if (confirm('There was an error with the online form. Would you like to open your email client instead?')) {
                            window.location.href = mailtoLink;
                        } else {
                            alert('Please call us at (336) 835-1993 to request your quote.');
                        }
                    });
            });
        }
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initQuoteModal);
    } else {
        initQuoteModal();
    }
})();