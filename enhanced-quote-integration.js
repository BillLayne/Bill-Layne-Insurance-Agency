// Enhanced Quote Section Integration Script
// This script replaces the existing quote form with the enhanced multi-step forms

// Function to create the enhanced quote HTML
function createEnhancedQuoteHTML() {
    return `
    <!-- Enhanced Quote Section Styles -->
    <style>
        /* Enhanced Quote Section Styles */
        .enhanced-hero-form {
            background: white;
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 500px;
        }

        .quote-type-selector {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
        }

        .quote-type-btn {
            flex: 1;
            padding: 0.75rem;
            background: #f0f0f0;
            border: 2px solid transparent;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            text-align: center;
            font-size: 0.9rem;
        }

        .quote-type-btn:hover {
            background: #e0e0e0;
            transform: translateY(-2px);
        }

        .quote-type-btn.active {
            background: var(--color-primary);
            color: white;
            border-color: var(--color-primary);
        }

        .mini-form-step {
            display: none;
            animation: fadeIn 0.5s ease;
        }

        .mini-form-step.active {
            display: block;
        }

        .progress-mini {
            height: 4px;
            background: #e0e0e0;
            border-radius: 2px;
            margin-bottom: 1.5rem;
            overflow: hidden;
        }

        .progress-mini-fill {
            height: 100%;
            background: var(--color-primary);
            transition: width 0.5s ease;
        }

        .form-nav-mini {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
        }

        .btn-mini {
            flex: 1;
            padding: 0.75rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-mini-prev {
            background: #f0f0f0;
            color: var(--color-text);
        }

        .btn-mini-next {
            background: var(--color-primary);
            color: white;
        }

        .btn-mini:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        .btn-mini:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        .upload-mini {
            border: 2px dashed #ccc;
            border-radius: 8px;
            padding: 1.5rem;
            text-align: center;
            background: #f9f9f9;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .upload-mini:hover {
            border-color: var(--color-primary);
            background: #f0f4ff;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    </style>

    <div class="enhanced-hero-form">
        <h3 style="margin-bottom: 1rem; text-align: center;">Get Your Free Quote</h3>
        
        <!-- Quote Type Selector -->
        <div class="quote-type-selector">
            <button class="quote-type-btn active" onclick="selectQuoteType('auto')">
                🚗 Auto
            </button>
            <button class="quote-type-btn" onclick="selectQuoteType('home')">
                🏠 Home
            </button>
        </div>

        <!-- Progress Bar -->
        <div class="progress-mini">
            <div class="progress-mini-fill" id="mini-progress" style="width: 33.33%"></div>
        </div>

        <!-- Auto Insurance Mini Form -->
        <form id="auto-mini-form" class="mini-quote-form active" action="https://formspree.io/f/xkgbdjgy" method="POST" enctype="multipart/form-data">
            <input type="hidden" name="form_type" value="Auto Insurance Quick Quote">
            
            <!-- Step 1: Basic Info -->
            <div class="mini-form-step active" data-step="1">
                <div class="form-group">
                    <label for="auto-name" class="sr-only">Your Name</label>
                    <input type="text" id="auto-name" name="name" class="form-control" placeholder="Your Name" required>
                </div>
                <div class="form-group">
                    <label for="auto-phone" class="sr-only">Phone Number</label>
                    <input type="tel" id="auto-phone" name="phone" class="form-control" placeholder="Phone Number" required>
                </div>
                <div class="form-group">
                    <label for="auto-email" class="sr-only">Email Address</label>
                    <input type="email" id="auto-email" name="email" class="form-control" placeholder="Email Address" required>
                </div>
                <div class="form-group">
                    <label for="auto-zip" class="sr-only">ZIP Code</label>
                    <input type="text" id="auto-zip" name="zip" class="form-control" placeholder="ZIP Code" pattern="[0-9]{5}" required>
                </div>
            </div>

            <!-- Step 2: Vehicle Info -->
            <div class="mini-form-step" data-step="2">
                <h4 style="margin-bottom: 1rem;">Vehicle Information</h4>
                <div class="form-group">
                    <label for="vehicle-year" class="sr-only">Vehicle Year</label>
                    <input type="number" id="vehicle-year" name="vehicle_year" class="form-control" placeholder="Year (e.g., 2020)" min="1900" max="2025" required>
                </div>
                <div class="form-group">
                    <label for="vehicle-make" class="sr-only">Vehicle Make</label>
                    <input type="text" id="vehicle-make" name="vehicle_make" class="form-control" placeholder="Make (e.g., Honda)" required>
                </div>
                <div class="form-group">
                    <label for="vehicle-model" class="sr-only">Vehicle Model</label>
                    <input type="text" id="vehicle-model" name="vehicle_model" class="form-control" placeholder="Model (e.g., Civic)" required>
                </div>
            </div>

            <!-- Step 3: Upload Option -->
            <div class="mini-form-step" data-step="3">
                <h4 style="margin-bottom: 1rem;">Current Insurance (Optional)</h4>
                <p style="font-size: 0.9rem; color: var(--color-text-secondary); margin-bottom: 1rem;">
                    Upload your declaration page for faster, more accurate quotes
                </p>
                <div class="upload-mini" onclick="document.getElementById('dec-page-mini').click()">
                    <span style="font-size: 2rem;">📄</span>
                    <p style="margin: 0.5rem 0;">Click to upload declaration page</p>
                    <p style="font-size: 0.8rem; color: var(--color-text-secondary);">PDF, JPG, or PNG</p>
                    <input type="file" id="dec-page-mini" name="declaration_page" accept=".pdf,.jpg,.jpeg,.png" style="display: none;" onchange="handleMiniFileUpload(event, 'auto')">
                    <div id="auto-file-preview" style="display: none; margin-top: 0.5rem; color: var(--color-success);">
                        ✓ <span id="auto-file-name"></span>
                    </div>
                </div>
                <div style="text-align: center; margin-top: 1rem;">
                    <a href="#" onclick="skipUpload('auto'); return false;" style="font-size: 0.9rem; color: var(--color-primary);">Skip this step →</a>
                </div>
            </div>

            <!-- Navigation -->
            <div class="form-nav-mini">
                <button type="button" class="btn-mini btn-mini-prev" onclick="previousMiniStep('auto')" disabled>Back</button>
                <button type="button" class="btn-mini btn-mini-next" onclick="nextMiniStep('auto')">Next</button>
                <button type="submit" class="btn-mini btn-mini-next" style="display: none; width: 100%;">Get My Quote</button>
            </div>
        </form>

        <!-- Home Insurance Mini Form -->
        <form id="home-mini-form" class="mini-quote-form" style="display: none;" action="https://formspree.io/f/xkgbdjgy" method="POST">
            <input type="hidden" name="form_type" value="Homeowners Insurance Quick Quote">
            
            <!-- Step 1: Basic Info -->
            <div class="mini-form-step active" data-step="1">
                <div class="form-group">
                    <label for="home-name" class="sr-only">Your Name</label>
                    <input type="text" id="home-name" name="name" class="form-control" placeholder="Your Name" required>
                </div>
                <div class="form-group">
                    <label for="home-phone" class="sr-only">Phone Number</label>
                    <input type="tel" id="home-phone" name="phone" class="form-control" placeholder="Phone Number" required>
                </div>
                <div class="form-group">
                    <label for="home-email" class="sr-only">Email Address</label>
                    <input type="email" id="home-email" name="email" class="form-control" placeholder="Email Address" required>
                </div>
            </div>

            <!-- Step 2: Property Info -->
            <div class="mini-form-step" data-step="2">
                <h4 style="margin-bottom: 1rem;">Property Information</h4>
                <div class="form-group">
                    <label for="property-address" class="sr-only">Property Address</label>
                    <input type="text" id="property-address" name="property_address" class="form-control" placeholder="Property Address" required>
                </div>
                <div class="form-group">
                    <label for="property-zip" class="sr-only">ZIP Code</label>
                    <input type="text" id="property-zip" name="property_zip" class="form-control" placeholder="ZIP Code" pattern="[0-9]{5}" required>
                </div>
                <div class="form-group">
                    <label for="property-type" class="sr-only">Property Type</label>
                    <select id="property-type" name="property_type" class="form-control" required>
                        <option value="">Property Type</option>
                        <option value="Single Family">Single Family Home</option>
                        <option value="Townhouse">Townhouse</option>
                        <option value="Condo">Condominium</option>
                        <option value="Mobile">Mobile Home</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="year-built" class="sr-only">Year Built</label>
                    <input type="number" id="year-built" name="year_built" class="form-control" placeholder="Year Built" min="1800" max="2025" required>
                </div>
            </div>

            <!-- Step 3: Additional Info -->
            <div class="mini-form-step" data-step="3">
                <h4 style="margin-bottom: 1rem;">Quick Details</h4>
                <div class="form-group">
                    <label for="square-feet" class="sr-only">Square Footage</label>
                    <input type="number" id="square-feet" name="square_feet" class="form-control" placeholder="Square Footage" required>
                </div>
                <div class="form-group">
                    <label for="home-value" class="sr-only">Estimated Home Value</label>
                    <input type="number" id="home-value" name="home_value" class="form-control" placeholder="Estimated Home Value" required>
                </div>
                <div class="form-group">
                    <label for="current-insurance" class="sr-only">Current Insurance Status</label>
                    <select id="current-insurance" name="current_insurance" class="form-control">
                        <option value="">Current Insurance Status</option>
                        <option value="Currently Insured">Currently Insured</option>
                        <option value="Shopping Around">Shopping Around</option>
                        <option value="First Time Buyer">First Time Buyer</option>
                    </select>
                </div>
            </div>

            <!-- Navigation -->
            <div class="form-nav-mini">
                <button type="button" class="btn-mini btn-mini-prev" onclick="previousMiniStep('home')" disabled>Back</button>
                <button type="button" class="btn-mini btn-mini-next" onclick="nextMiniStep('home')">Next</button>
                <button type="submit" class="btn-mini btn-mini-next" style="display: none; width: 100%;">Get My Quote</button>
            </div>
        </form>

        <p class="form-note" style="margin-top: 1rem;">✓ No spam, ever. Your information is secure.</p>
        <p style="text-align: center; margin-top: 1rem; font-size: 0.9rem;">
            <a href="enhanced-quote-section.html" style="color: var(--color-primary);">Need a detailed quote? Click here →</a>
        </p>
    </div>
    `;
}

// Mini form state management
const miniFormStates = {
    auto: { currentStep: 1, totalSteps: 3 },
    home: { currentStep: 1, totalSteps: 3 }
};

// Quote type selection
function selectQuoteType(type) {
    // Update buttons
    document.querySelectorAll('.quote-type-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show/hide forms
    document.querySelectorAll('.mini-quote-form').forEach(form => {
        form.style.display = 'none';
        form.classList.remove('active');
    });
    document.getElementById(`${type}-mini-form`).style.display = 'block';
    document.getElementById(`${type}-mini-form`).classList.add('active');
    
    // Update progress
    updateMiniProgress(type);
}

// Navigation functions
function nextMiniStep(formType) {
    const state = miniFormStates[formType];
    const form = document.getElementById(`${formType}-mini-form`);
    const currentStep = form.querySelector(`.mini-form-step.active`);
    
    // Validate current step
    const inputs = currentStep.querySelectorAll('input[required], select[required]');
    let valid = true;
    inputs.forEach(input => {
        if (!input.value) {
            input.style.borderColor = '#ff4444';
            valid = false;
        } else {
            input.style.borderColor = '';
        }
    });
    
    if (!valid) {
        return;
    }
    
    if (state.currentStep < state.totalSteps) {
        currentStep.classList.remove('active');
        state.currentStep++;
        
        const nextStep = form.querySelector(`.mini-form-step[data-step="${state.currentStep}"]`);
        nextStep.classList.add('active');
        
        updateMiniProgress(formType);
        updateMiniButtons(formType);
    }
}

function previousMiniStep(formType) {
    const state = miniFormStates[formType];
    const form = document.getElementById(`${formType}-mini-form`);
    
    if (state.currentStep > 1) {
        const currentStep = form.querySelector(`.mini-form-step.active`);
        currentStep.classList.remove('active');
        
        state.currentStep--;
        const prevStep = form.querySelector(`.mini-form-step[data-step="${state.currentStep}"]`);
        prevStep.classList.add('active');
        
        updateMiniProgress(formType);
        updateMiniButtons(formType);
    }
}

function updateMiniProgress(formType) {
    const state = miniFormStates[formType];
    const progressBar = document.getElementById('mini-progress');
    const percentage = (state.currentStep / state.totalSteps) * 100;
    progressBar.style.width = `${percentage}%`;
}

function updateMiniButtons(formType) {
    const state = miniFormStates[formType];
    const form = document.getElementById(`${formType}-mini-form`);
    const prevBtn = form.querySelector('.btn-mini-prev');
    const nextBtn = form.querySelector('.btn-mini-next');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    prevBtn.disabled = state.currentStep === 1;
    
    if (state.currentStep === state.totalSteps) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
}

function handleMiniFileUpload(event, formType) {
    const file = event.target.files[0];
    if (file) {
        document.getElementById(`${formType}-file-name`).textContent = file.name;
        document.getElementById(`${formType}-file-preview`).style.display = 'block';
    }
}

function skipUpload(formType) {
    // Submit the form directly when skipping upload
    const form = document.getElementById(`${formType}-mini-form`);
    form.querySelector('button[type="submit"]').click();
}

// Form submission handler
function setupMiniFormSubmissions() {
    ['auto-mini-form', 'home-mini-form'].forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const submitBtn = form.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
                
                const formData = new FormData(form);
                
                fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(response => {
                    if (response.ok) {
                        // Replace form with success message
                        const heroForm = document.querySelector('.enhanced-hero-form');
                        heroForm.innerHTML = `
                            <div style="text-align: center; padding: 2rem;">
                                <div style="font-size: 3rem; color: var(--color-success); margin-bottom: 1rem;">✅</div>
                                <h3 style="margin-bottom: 1rem;">Thank You!</h3>
                                <p style="color: var(--color-text-secondary);">
                                    We've received your information and will contact you within 24 hours with your personalized quote.
                                </p>
                                <p style="margin-top: 1.5rem;">
                                    <strong>Need immediate assistance?</strong><br>
                                    Call us at <a href="tel:3368351993" style="color: var(--color-primary);">(336) 835-1993</a>
                                </p>
                                <a href="enhanced-quote-section.html" class="btn btn--primary" style="margin-top: 1.5rem; display: inline-block;">
                                    Get Detailed Quote
                                </a>
                            </div>
                        `;
                    } else {
                        throw new Error('Submission failed');
                    }
                })
                .catch(error => {
                    alert('There was a problem submitting your form. Please try again or call us at (336) 835-1993.');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Get My Quote';
                });
            });
        }
    });
}

// Initialize the enhanced quote section
function initializeEnhancedQuote() {
    // Find the existing quote form
    const existingForm = document.querySelector('.hero__form');
    
    if (existingForm) {
        // Replace with enhanced form
        existingForm.innerHTML = createEnhancedQuoteHTML();
        
        // Setup form submissions
        setupMiniFormSubmissions();
        
        // Initialize button states
        updateMiniButtons('auto');
        updateMiniButtons('home');
        
        // console.log('Enhanced quote form initialized successfully');
    } else {
        // console.error('Could not find existing quote form to replace');
    }
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEnhancedQuote);
} else {
    initializeEnhancedQuote();
}

// Export functions to global scope for onclick handlers
window.selectQuoteType = selectQuoteType;
window.nextMiniStep = nextMiniStep;
window.previousMiniStep = previousMiniStep;
window.handleMiniFileUpload = handleMiniFileUpload;
window.skipUpload = skipUpload;