// Bill Layne Insurance Website JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initQuoteForm();
    initSmoothScrolling();
    initServiceCards();
    initMobileMenu();
    initFormValidation();
});

// Quote Form Functionality
function initQuoteForm() {
    const quoteForm = document.getElementById('quoteForm');
    
    if (quoteForm) {
        quoteForm.addEventListener('submit', handleQuoteSubmission);
    }
}

function handleQuoteSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    
    // Validate form
    if (!validateForm(form)) {
        return;
    }
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Prepare template parameters for EmailJS
    const templateParams = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        insuranceType: formData.get('insuranceType'),
        message: `New quote request from ${formData.get('name')}`,
        submission_date: new Date().toLocaleString()
    };
    
    // Send email using EmailJS
    emailjs.send('service_4flmw3k', 'template_6k9bgwi', templateParams)
        .then(function(response) {
            console.log('SUCCESS!', response.status, response.text);
            
            // Show success message
            showSuccessMessage();
            
            // Reset form
            form.reset();
            
            // Remove loading state
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            
            // Clear validation classes
            const formControls = form.querySelectorAll('.form-control');
            formControls.forEach(control => {
                control.classList.remove('error', 'success');
            });
        })
        .catch(function(error) {
            console.error('FAILED...', error);
            
            // Remove loading state
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            
            // Try mailto fallback
            const mailtoLink = `mailto:Save@BillLayneInsurance.com?subject=Quote Request - ${templateParams.insuranceType}&body=Name: ${templateParams.name}%0AEmail: ${templateParams.email}%0APhone: ${templateParams.phone}%0AInsurance Type: ${templateParams.insuranceType}`;
            
            // Show error message with fallback option
            showErrorMessage(mailtoLink);
        });
}

function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        const value = field.value.trim();
        
        // Remove previous validation classes
        field.classList.remove('error', 'success');
        
        if (!value) {
            field.classList.add('error');
            isValid = false;
        } else if (field.type === 'email' && !validateEmail(value)) {
            field.classList.add('error');
            isValid = false;
        } else if (field.type === 'tel' && !validatePhone(value)) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.add('success');
        }
    });
    
    return isValid;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    return cleanPhone.length >= 10 && phoneRegex.test(cleanPhone);
}

function showSuccessMessage() {
    // Create success modal/message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-modal';
    successMessage.innerHTML = `
        <div class="success-modal__content">
            <div class="success-modal__icon">✓</div>
            <h3>Quote Request Sent!</h3>
            <p>Thank you for your interest! We'll contact you within 24 hours with your personalized quote.</p>
            <p><strong>Call us now for immediate assistance:</strong><br>
            <a href="tel:3368351993" class="phone-link">(336) 835-1993</a></p>
            <button class="btn btn--primary" onclick="closeSuccessModal()">Close</button>
        </div>
    `;
    
    // Add styles for success modal
    const modalStyles = `
        .success-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease;
        }
        
        .success-modal__content {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            text-align: center;
            max-width: 400px;
            margin: 1rem;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
            animation: slideUp 0.3s ease;
        }
        
        .success-modal__icon {
            width: 60px;
            height: 60px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            font-size: 24px;
            color: white;
            font-weight: bold;
        }
        
        .success-modal h3 {
            color: #0A61C9;
            margin-bottom: 1rem;
        }
        
        .success-modal p {
            margin-bottom: 1rem;
            color: #64748b;
        }
        
        .phone-link {
            font-size: 1.2rem;
            font-weight: bold;
            color: #0A61C9;
            text-decoration: none;
        }
        
        .phone-link:hover {
            color: #064089;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes slideUp {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    
    // Add styles to head
    const styleSheet = document.createElement('style');
    styleSheet.textContent = modalStyles;
    document.head.appendChild(styleSheet);
    
    // Add modal to body
    document.body.appendChild(successMessage);
    
    // Auto close after 8 seconds
    setTimeout(() => {
        closeSuccessModal();
    }, 8000);
}

function closeSuccessModal() {
    const modal = document.querySelector('.success-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

function showErrorMessage(mailtoLink) {
    // Create error modal with fallback
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-modal';
    errorMessage.innerHTML = `
        <div class="error-modal__content">
            <div class="error-modal__icon">!</div>
            <h3>Unable to Send Quote Request</h3>
            <p>We're having trouble submitting your request automatically. Please try one of these options:</p>
            <div class="error-modal__options">
                <a href="${mailtoLink}" class="btn btn--primary">Open Email Client</a>
                <p class="error-modal__divider">OR</p>
                <p><strong>Call us directly:</strong><br>
                <a href="tel:3368351993" class="phone-link">(336) 835-1993</a></p>
            </div>
            <button class="btn btn--outline" onclick="closeErrorModal()">Close</button>
        </div>
    `;
    
    // Add styles for error modal
    const modalStyles = `
        .error-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            animation: fadeIn 0.3s ease;
        }
        
        .error-modal__content {
            background: white;
            padding: 2rem;
            border-radius: 12px;
            text-align: center;
            max-width: 450px;
            margin: 1rem;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
            animation: slideUp 0.3s ease;
        }
        
        .error-modal__icon {
            width: 60px;
            height: 60px;
            background: #ef4444;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            font-size: 28px;
            color: white;
            font-weight: bold;
        }
        
        .error-modal h3 {
            color: #ef4444;
            margin-bottom: 1rem;
        }
        
        .error-modal p {
            margin-bottom: 1rem;
            color: #64748b;
        }
        
        .error-modal__options {
            margin: 1.5rem 0;
            padding: 1.5rem;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .error-modal__divider {
            margin: 1rem 0;
            font-weight: 600;
            color: #94a3b8;
        }
        
        .phone-link {
            font-size: 1.2rem;
            font-weight: bold;
            color: #0A61C9;
            text-decoration: none;
        }
        
        .phone-link:hover {
            color: #064089;
        }
    `;
    
    // Check if styles already exist, if not add them
    if (!document.querySelector('#error-modal-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'error-modal-styles';
        styleSheet.textContent = modalStyles;
        document.head.appendChild(styleSheet);
    }
    
    // Add modal to body
    document.body.appendChild(errorMessage);
}

function closeErrorModal() {
    const modal = document.querySelector('.error-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Smooth Scrolling Navigation
function initSmoothScrolling() {
    // Handle navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Scroll to quote form function
function scrollToQuote() {
    const quoteForm = document.querySelector('.quote-form');
    if (quoteForm) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = quoteForm.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = quoteForm.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 500);
    }
}

// Service Cards Functionality
function initServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-4px)';
        });
    });
}

// Select insurance type and scroll to form
function selectInsurance(type) {
    const insuranceSelect = document.getElementById('insuranceType');
    const quoteForm = document.querySelector('.quote-form');
    const formHeadline = quoteForm ? quoteForm.querySelector('h3') : null;
    
    if (insuranceSelect && quoteForm && formHeadline) {
        // Set the insurance type
        insuranceSelect.value = type;
        
        // Dynamically change form headline
        const typeNames = {
            'auto': 'Auto',
            'home': 'Home',
            'both': 'Auto + Home Bundle',
            'commercial': 'Commercial',
            'specialty': 'Specialty'
        };
        const typeName = typeNames[type] || type.charAt(0).toUpperCase() + type.slice(1);
        formHeadline.textContent = `Get Your Free ${typeName} Insurance Quote`;
        
        // Scroll to form
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = quoteForm.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        // Focus on first input after scroll
        setTimeout(() => {
            const firstInput = quoteForm.querySelector('input[type="text"]');
            if (firstInput) {
                firstInput.focus();
            }
        }, 500);
        
        // Add visual feedback
        insuranceSelect.style.borderColor = '#0A61C9';
        insuranceSelect.style.boxShadow = '0 0 0 3px rgba(10, 97, 201, 0.1)';
        
        setTimeout(() => {
            insuranceSelect.style.borderColor = '';
            insuranceSelect.style.boxShadow = '';
        }, 2000);
    }
}

// Mobile Menu Functionality
function initMobileMenu() {
    // Handle mobile navigation if needed
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Close mobile menu if it exists (for future mobile menu implementation)
            const mobileMenu = document.querySelector('.mobile-menu');
            if (mobileMenu && mobileMenu.classList.contains('open')) {
                mobileMenu.classList.remove('open');
            }
        });
    });
}

// Form Validation with Real-time Feedback
function initFormValidation() {
    const formInputs = document.querySelectorAll('.form-control');
    
    formInputs.forEach(input => {
        // Real-time validation on blur
        input.addEventListener('blur', function() {
            validateSingleField(this);
        });
        
        // Clear error state on focus
        input.addEventListener('focus', function() {
            this.classList.remove('error');
        });
        
        // Format phone number as user types
        if (input.type === 'tel') {
            input.addEventListener('input', function() {
                formatPhoneNumber(this);
            });
        }
    });
}

function validateSingleField(field) {
    const value = field.value.trim();
    
    field.classList.remove('error', 'success');
    
    if (field.hasAttribute('required') && !value) {
        field.classList.add('error');
        return false;
    }
    
    if (field.type === 'email' && value && !validateEmail(value)) {
        field.classList.add('error');
        return false;
    }
    
    if (field.type === 'tel' && value && !validatePhone(value)) {
        field.classList.add('error');
        return false;
    }
    
    if (value) {
        field.classList.add('success');
    }
    
    return true;
}

function formatPhoneNumber(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length >= 6) {
        value = value.substring(0, 3) + '-' + value.substring(3, 6) + '-' + value.substring(6, 10);
    } else if (value.length >= 3) {
        value = value.substring(0, 3) + '-' + value.substring(3);
    }
    
    input.value = value;
}

// Scroll animations (simple fade-in effect)
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.service-card, .feature-card, .testimonial-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Initialize scroll animations when page loads
window.addEventListener('load', initScrollAnimations);

// Header scroll effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Removed demo prevention - form now submits with EmailJS

// Add CSS animation styles dynamically
const additionalStyles = `
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    .service-card:hover {
        transition: all 0.3s ease;
    }
    
    .form-control:focus {
        transform: scale(1.02);
        transition: all 0.2s ease;
    }
    
    .btn:hover {
        transform: translateY(-2px);
        transition: all 0.2s ease;
    }
    
    .btn:active {
        transform: translateY(0);
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.scrollY > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

// NC Insurance Points Calculator
const rateIncreases = {
    0: 0,
    1: 30,
    2: 45,
    3: 60,
    4: 80,
    5: 110,
    6: 135,
    7: 165,
    8: 195,
    9: 225,
    10: 260,
    11: 295,
    12: 340
};

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const calculatorForm = document.getElementById('points-calculator-form');
    if (calculatorForm) {
        calculatorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateInsuranceImpact();
        });

        // Auto-calculate when violation is selected (if premium is already entered)
        const violationSelect = document.getElementById('violation-type');
        const premiumInput = document.getElementById('current-premium');
        
        if (violationSelect) {
            violationSelect.addEventListener('change', function() {
                const premium = premiumInput ? premiumInput.value : '';
                if (premium && this.value) {
                    calculateInsuranceImpact();
                }
            });
        }

        // Add input formatting for premium field
        if (premiumInput) {
            premiumInput.addEventListener('blur', function() {
                if (this.value) {
                    const value = parseFloat(this.value);
                    if (!isNaN(value)) {
                        this.value = value.toFixed(2);
                    }
                }
            });
        }
    }
});

// Format currency for calculator
function formatCalcCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Calculate insurance impact function
function calculateInsuranceImpact() {
    // Get input values
    const currentPremium = parseFloat(document.getElementById('current-premium').value);
    const violationType = document.getElementById('violation-type');
    const selectedOption = violationType.options[violationType.selectedIndex];
    
    if (!currentPremium || !violationType.value) {
        return;
    }

    // Extract points from violation value
    const points = parseInt(violationType.value);
    const violationText = selectedOption.text;
    
    // Get rate increase percentage
    const increasePercentage = rateIncreases[points] || 0;
    
    // Calculate new premium and increase
    const increaseAmount = (currentPremium * increasePercentage) / 100;
    const newPremium = currentPremium + increaseAmount;
    
    // Update results
    document.getElementById('violation-name').textContent = violationText;
    document.getElementById('points-value').textContent = points;
    document.getElementById('increase-percentage').textContent = increasePercentage + '%';
    document.getElementById('annual-increase').textContent = formatCalcCurrency(increaseAmount);
    document.getElementById('new-premium').textContent = formatCalcCurrency(newPremium);
    
    // Update impact bar
    const impactFill = document.getElementById('impact-fill');
    const impactPercentageDisplay = document.getElementById('impact-percentage');
    const fillWidth = Math.min((increasePercentage / 340) * 100, 100);
    
    // Show results with animation
    const resultsSection = document.getElementById('calc-results');
    resultsSection.classList.add('show');
    
    // Animate the bar after a short delay
    setTimeout(() => {
        impactFill.style.width = fillWidth + '%';
        impactPercentageDisplay.textContent = increasePercentage + '%';
    }, 100);
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Interactive Coverage Analyzer Functions
function startAnalyzer(type) {
    // Placeholder for analyzer functionality
    // In a real implementation, this would open a modal or redirect to a tool
    alert(`Starting ${type} coverage analysis tool. This feature will be available soon!`);
    
    // Track analyzer usage
    console.log(`User started ${type} analyzer`);
    
    // You can implement actual analyzer logic here:
    // - Open a modal with questions
    // - Redirect to a dedicated analyzer page
    // - Start an interactive form
}

// Toggle all claims contacts
function toggleAllClaims() {
    const button = event.target;
    const contactsContainer = button.previousElementSibling;
    
    // Check if we're showing all or just the main ones
    if (button.textContent === 'View All Carriers') {
        // Add more carrier contacts
        const additionalContacts = `
            <a href="tel:8008427892" class="emergency-contact">
                <span class="carrier-name">Alamance Farmers</span>
                <span class="phone">1-800-842-7892</span>
            </a>
            <a href="tel:8003423008" class="emergency-contact">
                <span class="carrier-name">NC Grange</span>
                <span class="phone">1-800-342-3008</span>
            </a>
            <a href="tel:8002748006" class="emergency-contact">
                <span class="carrier-name">Dairyland</span>
                <span class="phone">1-800-274-8006</span>
            </a>
            <a href="tel:8009227548" class="emergency-contact">
                <span class="carrier-name">Hagerty</span>
                <span class="phone">1-800-922-7548</span>
            </a>
        `;
        
        contactsContainer.insertAdjacentHTML('beforeend', additionalContacts);
        button.textContent = 'Show Fewer';
    } else {
        // Remove additional contacts
        const contacts = contactsContainer.querySelectorAll('.emergency-contact');
        for (let i = contacts.length - 1; i >= 4; i--) {
            contacts[i].remove();
        }
        button.textContent = 'View All Carriers';
    }
}

// Make functions available globally
window.scrollToQuote = scrollToQuote;
window.selectInsurance = selectInsurance;
window.closeSuccessModal = closeSuccessModal;
window.closeErrorModal = closeErrorModal;
window.scrollToTop = scrollToTop;
window.calculateInsuranceImpact = calculateInsuranceImpact;
window.startAnalyzer = startAnalyzer;
window.toggleAllClaims = toggleAllClaims;