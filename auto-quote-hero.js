// Auto Insurance Quote Form for Hero Section
// This script replaces the existing quote form with a comprehensive auto insurance form

function createAutoQuoteHeroHTML() {
    return `
    <style>
        /* Auto Quote Hero Styles */
        .auto-quote-hero {
            background: white;
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            width: 100%;
            max-width: 500px;
            transition: all 0.5s ease;
        }
        
        /* Remove full-screen overlay - keep form in hero section */

        .quote-progress {
            margin-bottom: 1.5rem;
        }

        .progress-bar {
            height: 6px;
            background: #e0e0e0;
            border-radius: 3px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
            transition: width 0.5s ease;
        }

        .progress-text {
            text-align: center;
            margin-top: 0.5rem;
            font-size: 0.85rem;
            color: var(--color-text-secondary);
            font-weight: 600;
        }

        .form-step {
            display: none;
            animation: fadeIn 0.5s ease;
        }

        .form-step.active {
            display: block;
        }

        @keyframes fadeIn {
            from { 
                opacity: 0; 
                transform: translateY(10px); 
            }
            to { 
                opacity: 1; 
                transform: translateY(0); 
            }
        }

        .step-title {
            font-size: 1.2rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: var(--color-text);
        }

        .info-method-card {
            border: 2px solid #e0e0e0;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
        }

        .info-method-card:hover {
            border-color: var(--color-primary);
            transform: translateY(-2px);
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }

        .info-method-card.selected {
            border-color: var(--color-primary);
            background: rgba(30, 58, 138, 0.05);
        }

        .info-method-card.selected::after {
            content: '✓';
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: var(--color-primary);
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
        }

        .method-icon {
            font-size: 2rem;
            margin-bottom: 0.5rem;
        }

        .method-title {
            font-weight: 600;
            margin-bottom: 0.25rem;
        }

        .method-description {
            font-size: 0.85rem;
            color: var(--color-text-secondary);
        }

        .upload-area {
            border: 2px dashed #ccc;
            border-radius: 12px;
            padding: 2rem;
            text-align: center;
            background: #f9f9f9;
            transition: all 0.3s ease;
            cursor: pointer;
            margin-top: 1rem;
        }
        
        /* Ensure upload area displays properly in fullscreen */
        .quote-fullscreen-container .upload-area,
        #auto-hero-form.in-fullscreen .upload-area {
            width: 100% !important;
            box-sizing: border-box !important;
        }
        
        /* Fix manual section in fullscreen */
        #auto-hero-form.in-fullscreen #manual-section {
            width: 100% !important;
        }

        .upload-area:hover {
            border-color: var(--color-primary);
            background: #f0f4ff;
        }

        .upload-area.has-file {
            border-color: var(--color-success);
            background: #f0fff4;
        }

        .driver-vehicle-entry {
            background: #f9f9f9;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
            position: relative;
        }

        .remove-btn {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background: #ff4444;
            color: white;
            border: none;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            cursor: pointer;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }

        .remove-btn:hover {
            background: #cc0000;
            transform: scale(1.1);
        }

        .add-btn {
            background: transparent;
            border: 2px dashed var(--color-primary);
            color: var(--color-primary);
            padding: 0.75rem;
            border-radius: 8px;
            cursor: pointer;
            width: 100%;
            font-weight: 600;
            transition: all 0.3s ease;
            margin-top: 0.5rem;
        }

        .add-btn:hover {
            background: rgba(30, 58, 138, 0.05);
            border-style: solid;
        }

        .coverage-option {
            background: #f9f9f9;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 0.75rem;
        }

        .coverage-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
        }

        .coverage-icon {
            font-size: 1.5rem;
        }

        .coverage-title {
            font-weight: 600;
            font-size: 0.95rem;
        }

        .coverage-description {
            font-size: 0.8rem;
            color: var(--color-text-secondary);
            margin-bottom: 0.5rem;
        }

        .form-navigation {
            display: flex;
            gap: 1rem;
            margin-top: 1.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e0e0e0;
        }

        .nav-btn {
            flex: 1;
            padding: 0.875rem;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 1rem;
        }

        .btn-prev {
            background: #f0f0f0;
            color: var(--color-text);
        }

        .btn-prev:hover:not(:disabled) {
            background: #e0e0e0;
            transform: translateY(-2px);
        }

        .btn-next, .btn-submit {
            background: var(--color-primary);
            color: white;
        }

        .btn-next:hover, .btn-submit:hover {
            background: var(--color-primary-light);
            transform: translateY(-2px);
            box-shadow: 0 4px 20px rgba(30, 58, 138, 0.3);
        }

        .nav-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }

        .form-group {
            margin-bottom: 1rem;
        }

        .form-control {
            width: 100%;
            padding: 0.75rem;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 0.95rem;
            transition: all 0.3s ease;
            font-family: inherit;
        }

        .form-control:focus {
            outline: none;
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
        }

        .form-label {
            display: block;
            margin-bottom: 0.4rem;
            font-weight: 600;
            font-size: 0.9rem;
            color: var(--color-text);
        }

        .required {
            color: #ff4444;
        }

        .checkbox-group {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
            cursor: pointer;
        }

        .checkbox-group input[type="checkbox"] {
            width: 18px;
            height: 18px;
            cursor: pointer;
        }

        .success-message {
            text-align: center;
            padding: 2rem;
        }

        .success-icon {
            font-size: 3rem;
            color: var(--color-success);
            margin-bottom: 1rem;
        }

        @media (max-width: 480px) {
            .auto-quote-hero {
                padding: 1.5rem;
            }

            .form-navigation {
                flex-direction: column;
            }

            .nav-btn {
                width: 100%;
            }
        }
    </style>

    <div class="auto-quote-hero" id="auto-quote-hero">
        <h3 style="text-align: center; margin-bottom: 1.5rem;">Get Your Free Auto Insurance Quote</h3>
        
        <!-- Progress Bar -->
        <div class="quote-progress">
            <div class="progress-bar">
                <div class="progress-fill" id="progress-fill" style="width: 16.66%"></div>
            </div>
            <div class="progress-text" id="progress-text">Step 1 of 6</div>
        </div>

        <form id="auto-hero-form">
            <input type="hidden" name="form_type" value="Auto Insurance Quote - Hero Section">
            
            <!-- Step 1: Personal Information -->
            <div class="form-step active" data-step="1">
                <h4 class="step-title">Get Your Auto Insurance Quote - Step 1</h4>
                <p style="text-align: center; color: #666; margin-bottom: 1.5rem; font-size: 0.95rem;">
                    Start your personalized auto insurance quote by providing your basic information
                </p>
                
                <div class="form-group">
                    <label class="form-label">First Name <span class="required">*</span></label>
                    <input type="text" name="firstname" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Last Name <span class="required">*</span></label>
                    <input type="text" name="lastname" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Email Address <span class="required">*</span></label>
                    <input type="email" name="email" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Phone Number <span class="required">*</span></label>
                    <input type="tel" name="phone" class="form-control" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">ZIP Code <span class="required">*</span></label>
                    <input type="text" name="zip" class="form-control" pattern="[0-9]{5}" maxlength="5" required>
                </div>
            </div>

            <!-- Step 2: Current Insurance -->
            <div class="form-step" data-step="2">
                <h4 class="step-title">Current Insurance Information</h4>
                <p style="font-size: 0.9rem; color: var(--color-text-secondary); margin-bottom: 1rem;">
                    How would you like to provide your current insurance details?
                </p>
                
                <div class="info-method-card" onclick="selectInfoMethod('upload')">
                    <input type="radio" name="info_method" value="upload" style="display: none;">
                    <div class="method-icon">📄</div>
                    <div class="method-title">Upload Declaration Page</div>
                    <div class="method-description">Quick and easy - we'll extract your information automatically</div>
                </div>
                
                <div class="info-method-card" onclick="selectInfoMethod('manual')">
                    <input type="radio" name="info_method" value="manual" style="display: none;" checked>
                    <div class="method-icon">✏️</div>
                    <div class="method-title">Enter Information Manually</div>
                    <div class="method-description">I'll provide my coverage details step by step</div>
                </div>

                <div id="upload-section" style="display: none;">
                    <div class="upload-area" onclick="document.getElementById('declaration-file').click()">
                        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📤</div>
                        <div style="font-weight: 600; margin-bottom: 0.5rem;">Click to upload or drag and drop</div>
                        <div style="font-size: 0.85rem; color: var(--color-text-secondary);">PDF, JPG, or PNG (Max 10MB)</div>
                        <input type="file" id="declaration-file" name="declaration_page" accept=".pdf,.jpg,.jpeg,.png" style="display: none;" onchange="handleFileUpload(event)">
                        <div id="file-info" style="margin-top: 1rem; display: none;">
                            <span style="color: var(--color-success); font-weight: 600;">✓ File selected: </span>
                            <span id="file-name"></span>
                        </div>
                    </div>
                </div>

                <div id="manual-section">
                    <div class="form-group" style="margin-top: 1rem;">
                        <label class="form-label">Current Insurance Carrier</label>
                        <input type="text" name="current_carrier" class="form-control" placeholder="e.g., State Farm, Geico">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Policy Expiration Date</label>
                        <input type="date" name="policy_expiration" class="form-control">
                    </div>
                </div>
            </div>

            <!-- Step 3: Drivers -->
            <div class="form-step" data-step="3">
                <h4 class="step-title">Who will be on the policy?</h4>
                
                <div id="drivers-container">
                    <div class="driver-vehicle-entry">
                        <h5 style="margin: 0 0 1rem 0; font-size: 1rem;">Primary Driver</h5>
                        <div class="form-group">
                            <label class="form-label">Full Name <span class="required">*</span></label>
                            <input type="text" name="driver_name[]" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Date of Birth <span class="required">*</span></label>
                            <input type="date" name="driver_dob[]" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Gender <span class="required">*</span></label>
                            <select name="driver_gender[]" class="form-control" required>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Marital Status <span class="required">*</span></label>
                            <select name="driver_marital[]" class="form-control" required>
                                <option value="">Select Status</option>
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Divorced">Divorced</option>
                                <option value="Widowed">Widowed</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <button type="button" class="add-btn" onclick="addDriver()">+ Add Another Driver</button>
            </div>

            <!-- Step 4: Vehicles -->
            <div class="form-step" data-step="4">
                <h4 class="step-title">Vehicle Information</h4>
                
                <div id="vehicles-container">
                    <div class="driver-vehicle-entry">
                        <h5 style="margin: 0 0 1rem 0; font-size: 1rem;">Vehicle 1</h5>
                        <div class="form-group">
                            <label class="form-label">Year <span class="required">*</span></label>
                            <input type="number" name="vehicle_year[]" class="form-control" min="1900" max="2025" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Make <span class="required">*</span></label>
                            <input type="text" name="vehicle_make[]" class="form-control" placeholder="e.g., Honda" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Model <span class="required">*</span></label>
                            <input type="text" name="vehicle_model[]" class="form-control" placeholder="e.g., Civic" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">VIN (Optional)</label>
                            <input type="text" name="vehicle_vin[]" class="form-control" placeholder="Vehicle Identification Number">
                        </div>
                    </div>
                </div>
                
                <button type="button" class="add-btn" onclick="addVehicle()">+ Add Another Vehicle</button>
            </div>

            <!-- Step 5: Coverage -->
            <div class="form-step" data-step="5">
                <h4 class="step-title">Coverage Preferences</h4>
                
                <div class="coverage-option">
                    <div class="coverage-header">
                        <span class="coverage-icon">🛡️</span>
                        <div class="coverage-title">Liability Coverage</div>
                    </div>
                    <div class="coverage-description">Required in NC - covers damages to others</div>
                    <select name="liability_limit" class="form-control" required>
                        <option value="">Select Coverage Limit</option>
                        <option value="50/100/50">State Minimum (50/100/50)</option>
                        <option value="100/300/50" selected>100/300/50 (Recommended)</option>
                        <option value="100/300/100">100/300/100</option>
                        <option value="250/500/100">250/500/100</option>
                    </select>
                </div>

                <div class="coverage-option">
                    <div class="coverage-header">
                        <span class="coverage-icon">💥</span>
                        <div class="coverage-title">Collision Coverage</div>
                    </div>
                    <div class="coverage-description">Covers damage to your vehicle</div>
                    <select name="collision_deductible" class="form-control">
                        <option value="None">Not Included</option>
                        <option value="250">$250 Deductible</option>
                        <option value="500" selected>$500 Deductible</option>
                        <option value="1000">$1,000 Deductible</option>
                    </select>
                </div>

                <div class="coverage-option">
                    <div class="coverage-header">
                        <span class="coverage-icon">🌪️</span>
                        <div class="coverage-title">Comprehensive Coverage</div>
                    </div>
                    <div class="coverage-description">Covers theft, weather, and other damage</div>
                    <select name="comprehensive_deductible" class="form-control">
                        <option value="None">Not Included</option>
                        <option value="100">$100 Deductible</option>
                        <option value="250">$250 Deductible</option>
                        <option value="500" selected>$500 Deductible</option>
                        <option value="1000">$1,000 Deductible</option>
                    </select>
                </div>

                <div style="margin-top: 1rem;">
                    <label class="checkbox-group">
                        <input type="checkbox" name="uninsured_motorist" value="yes" checked>
                        <span>Uninsured/Underinsured Motorist Coverage</span>
                    </label>
                    <label class="checkbox-group">
                        <input type="checkbox" name="medical_payments" value="yes">
                        <span>Medical Payments Coverage</span>
                    </label>
                    <label class="checkbox-group">
                        <input type="checkbox" name="rental_reimbursement" value="yes">
                        <span>Rental Car Reimbursement</span>
                    </label>
                    <label class="checkbox-group">
                        <input type="checkbox" name="roadside_assistance" value="yes">
                        <span>Roadside Assistance</span>
                    </label>
                </div>
            </div>

            <!-- Step 6: Additional Info -->
            <div class="form-step" data-step="6">
                <h4 class="step-title">Almost done!</h4>
                
                <div class="form-group">
                    <label class="form-label">Additional Information</label>
                    <textarea name="additional_info" class="form-control" rows="3" placeholder="Any accidents, violations, or special circumstances we should know about?"></textarea>
                </div>
                
                <div class="form-group">
                    <label class="checkbox-group">
                        <input type="checkbox" name="consent" value="yes" required>
                        <span style="font-size: 0.9rem;">I consent to be contacted about my insurance quote and understand my information will be kept secure.</span>
                    </label>
                </div>
                
                <div style="margin-top: 1rem; padding: 1rem; background: #f0f4ff; border-radius: 8px;">
                    <p style="font-size: 0.85rem; margin: 0; color: var(--color-text-secondary);">
                        <strong>What happens next?</strong><br>
                        We'll review your information and contact you within 24 hours with personalized quotes from multiple carriers.
                    </p>
                </div>
            </div>

            <!-- Navigation -->
            <div class="form-navigation">
                <button type="button" class="nav-btn btn-prev" onclick="previousStep()" disabled>Back</button>
                <button type="button" class="nav-btn btn-next" onclick="nextStep()">Next</button>
                <button type="submit" class="nav-btn btn-submit" style="display: none;">Get My Quote</button>
            </div>
        </form>

        <!-- Success Message -->
        <div id="success-message" style="display: none;">
            <div class="success-message">
                <div class="success-icon">✅</div>
                <h3 style="margin-bottom: 0.5rem;">Thank You!</h3>
                <p style="color: var(--color-text-secondary); margin-bottom: 1.5rem;">
                    We've received your information and will contact you soon with your personalized quote.
                </p>
                <a href="tel:3368351993" class="nav-btn btn-next" style="display: inline-block; text-decoration: none; width: auto; padding: 0.875rem 2rem;">
                    Call Now: (336) 835-1993
                </a>
            </div>
        </div>

        <p class="form-note" style="margin-top: 1rem;">✓ No spam, ever. Your information is secure.</p>
    </div>
    `;
}

// Form state management
let currentStep = 1;
const totalSteps = 6;
let driverCount = 1;
let vehicleCount = 1;

// Update progress
function updateProgress() {
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    const percentage = (currentStep / totalSteps) * 100;
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `Step ${currentStep} of ${totalSteps}`;
}

// Navigate to next step
function nextStep() {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const inputs = currentStepElement.querySelectorAll('input[required], select[required]');
    
    // Validate current step
    let valid = true;
    inputs.forEach(input => {
        if (!input.value) {
            input.style.borderColor = '#ff4444';
            valid = false;
        } else {
            input.style.borderColor = '#e0e0e0';
        }
    });
    
    if (!valid) {
        return;
    }
    
    // Special validation for step 2
    if (currentStep === 2) {
        const infoMethod = document.querySelector('input[name="info_method"]:checked');
        if (infoMethod && infoMethod.value === 'upload') {
            const fileInput = document.getElementById('declaration-file');
            if (!fileInput.files.length) {
                alert('Please upload your declaration page or choose to enter information manually.');
                return;
            }
        }
    }
    
    if (currentStep < totalSteps) {
        currentStepElement.classList.remove('active');
        currentStep++;
        
        const nextStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        nextStepElement.classList.add('active');
        
        updateProgress();
        updateButtons();
        
        // Scroll to top of form
        document.querySelector('.auto-quote-hero').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Navigate to previous step
function previousStep() {
    if (currentStep > 1) {
        const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        currentStepElement.classList.remove('active');
        
        currentStep--;
        const prevStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        prevStepElement.classList.add('active');
        
        updateProgress();
        updateButtons();
        
        // Scroll to top of form
        document.querySelector('.auto-quote-hero').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Update navigation buttons
function updateButtons() {
    const prevBtn = document.querySelector('.btn-prev');
    const nextBtn = document.querySelector('.btn-next');
    const submitBtn = document.querySelector('.btn-submit');
    
    prevBtn.disabled = currentStep === 1;
    
    if (currentStep === totalSteps) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
}

// Select info method
function selectInfoMethod(method) {
    const cards = document.querySelectorAll('.info-method-card');
    cards.forEach(card => card.classList.remove('selected'));
    
    event.currentTarget.classList.add('selected');
    event.currentTarget.querySelector('input[type="radio"]').checked = true;
    
    const uploadSection = document.getElementById('upload-section');
    const manualSection = document.getElementById('manual-section');
    
    if (method === 'upload') {
        uploadSection.style.display = 'block';
        manualSection.style.display = 'none';
    } else {
        uploadSection.style.display = 'none';
        manualSection.style.display = 'block';
    }
}

// Handle file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const fileName = document.getElementById('file-name');
        const fileInfo = document.getElementById('file-info');
        const uploadArea = document.querySelector('.upload-area');
        
        fileName.textContent = file.name;
        fileInfo.style.display = 'block';
        uploadArea.classList.add('has-file');
    }
}

// Add driver
function addDriver() {
    driverCount++;
    const container = document.getElementById('drivers-container');
    const newDriver = document.createElement('div');
    newDriver.className = 'driver-vehicle-entry';
    newDriver.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeEntry(this)">×</button>
        <h5 style="margin: 0 0 1rem 0; font-size: 1rem;">Driver ${driverCount}</h5>
        <div class="form-group">
            <label class="form-label">Full Name <span class="required">*</span></label>
            <input type="text" name="driver_name[]" class="form-control" required>
        </div>
        <div class="form-group">
            <label class="form-label">Date of Birth <span class="required">*</span></label>
            <input type="date" name="driver_dob[]" class="form-control" required>
        </div>
        <div class="form-group">
            <label class="form-label">Gender <span class="required">*</span></label>
            <select name="driver_gender[]" class="form-control" required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">Marital Status <span class="required">*</span></label>
            <select name="driver_marital[]" class="form-control" required>
                <option value="">Select Status</option>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
            </select>
        </div>
    `;
    container.appendChild(newDriver);
}

// Add vehicle
function addVehicle() {
    vehicleCount++;
    const container = document.getElementById('vehicles-container');
    const newVehicle = document.createElement('div');
    newVehicle.className = 'driver-vehicle-entry';
    newVehicle.innerHTML = `
        <button type="button" class="remove-btn" onclick="removeEntry(this)">×</button>
        <h5 style="margin: 0 0 1rem 0; font-size: 1rem;">Vehicle ${vehicleCount}</h5>
        <div class="form-group">
            <label class="form-label">Year <span class="required">*</span></label>
            <input type="number" name="vehicle_year[]" class="form-control" min="1900" max="2025" required>
        </div>
        <div class="form-group">
            <label class="form-label">Make <span class="required">*</span></label>
            <input type="text" name="vehicle_make[]" class="form-control" placeholder="e.g., Honda" required>
        </div>
        <div class="form-group">
            <label class="form-label">Model <span class="required">*</span></label>
            <input type="text" name="vehicle_model[]" class="form-control" placeholder="e.g., Civic" required>
        </div>
        <div class="form-group">
            <label class="form-label">VIN (Optional)</label>
            <input type="text" name="vehicle_vin[]" class="form-control" placeholder="Vehicle Identification Number">
        </div>
    `;
    container.appendChild(newVehicle);
}

// Remove entry
function removeEntry(button) {
    button.parentElement.remove();
}

// Show fullscreen overlay
function showFullscreen() {
    const overlay = document.getElementById('quote-fullscreen-overlay');
    const form = document.getElementById('auto-hero-form');
    const fullscreenContent = document.getElementById('fullscreen-form-content');
    const progressFullscreen = document.getElementById('progress-fullscreen');
    
    // Clear fullscreen content first
    fullscreenContent.innerHTML = '';
    
    // Move progress bar to fullscreen
    fullscreenContent.appendChild(progressFullscreen);
    
    // Move form to fullscreen container
    fullscreenContent.appendChild(form);
    
    // Add a class to form for fullscreen styling
    form.classList.add('in-fullscreen');
    
    // Show overlay
    overlay.classList.add('active');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Force update progress bar
    updateProgress();
}

// Close fullscreen overlay
function closeFullscreen() {
    const overlay = document.getElementById('quote-fullscreen-overlay');
    const form = document.getElementById('auto-hero-form');
    const heroContainer = document.getElementById('auto-quote-hero');
    const progressStep1 = document.getElementById('progress-step1');
    
    // Remove fullscreen class
    form.classList.remove('in-fullscreen');
    
    // Move progress bar back to hero if on step 1
    if (currentStep === 1 && progressStep1) {
        heroContainer.insertBefore(progressStep1, form);
    }
    
    // Move form back to hero container
    heroContainer.appendChild(form);
    
    // Hide overlay
    overlay.classList.remove('active');
    
    // Restore body scroll
    document.body.style.overflow = '';
    
    // Reset to step 1 if closing
    if (currentStep > 1) {
        const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        currentStepElement.classList.remove('active');
        
        currentStep = 1;
        const firstStepElement = document.querySelector(`.form-step[data-step="1"]`);
        firstStepElement.classList.add('active');
        
        updateProgress();
        updateButtons();
    }
}

// Initialize form
function initializeAutoQuoteHero() {
    const heroForm = document.querySelector('.hero__form');
    
    if (heroForm) {
        // Replace existing form
        heroForm.innerHTML = createAutoQuoteHeroHTML();
        
        // Add form submission handler
        const form = document.getElementById('auto-hero-form');
        form.addEventListener('submit', handleFormSubmit);
        
        // console.log('Auto quote hero form initialized');
    }
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    const formData = new FormData(e.target);
    
    // Prepare data for EmailJS
    const templateParams = {
        // Personal Information
        from_name: `${formData.get('firstname')} ${formData.get('lastname')}`,
        firstname: formData.get('firstname'),
        lastname: formData.get('lastname'),
        from_email: formData.get('email'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        contact_method: formData.get('contact_method'),
        
        // Insurance type (always auto for this form)
        insurance_type: 'Auto Insurance',
        
        // Current Insurance Info
        current_insurance: formData.get('current_insurance'),
        current_carrier: formData.get('current_carrier') || 'N/A',
        coverage_expiration: formData.get('coverage_expiration') || 'N/A',
        
        // Additional Info
        previous_claims: formData.get('previous_claims'),
        violations: formData.get('violations'),
        additional_notes: formData.get('additional_notes') || 'None',
        
        // Process drivers data
        drivers_info: processDriversData(formData),
        
        // Process vehicles data
        vehicles_info: processVehiclesData(formData),
        
        // Coverage preferences
        coverage_info: processCoverageData(formData),
        
        // Full message for template
        message: generateFullMessage(formData)
    };
    
    // Check if EmailJS is loaded
    if (typeof emailjs === 'undefined') {
        console.error('EmailJS is not loaded!');
        alert('There was an error loading the email service. Please try again or call us at (336) 835-1993.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Get My Quote';
        return;
    }
    
    // Send email using EmailJS
    emailjs.send('service_4flmw3k', 'template_6k9bgwi', templateParams)
        .then(function(response) {
            // Show success message
            document.getElementById('auto-hero-form').style.display = 'none';
            document.querySelector('.quote-progress').style.display = 'none';
            document.getElementById('success-message').style.display = 'block';
            
            // Reset form
            e.target.reset();
            currentStep = 1;
            
            // Scroll to top
            document.querySelector('.auto-quote-hero').scrollIntoView({ behavior: 'smooth', block: 'center' });
        })
        .catch(function(error) {
            console.error('EmailJS Error:', error);
            alert('There was a problem submitting your form. Please try again or call us at (336) 835-1993.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Get My Quote';
        });
}

// Helper functions to process form data
function processDriversData(formData) {
    let driversInfo = '';
    let driverCount = 1;
    
    // Check for driver data in formData
    for (let [key, value] of formData.entries()) {
        if (key.startsWith('driver_') && key.includes('_name')) {
            const driverNum = key.match(/driver_(\d+)_name/);
            if (driverNum) {
                const num = driverNum[1];
                driversInfo += `\nDriver ${driverCount}:\n`;
                driversInfo += `- Name: ${value}\n`;
                driversInfo += `- DOB: ${formData.get(`driver_${num}_dob`) || 'N/A'}\n`;
                driversInfo += `- Gender: ${formData.get(`driver_${num}_gender`) || 'N/A'}\n`;
                driversInfo += `- Marital Status: ${formData.get(`driver_${num}_marital`) || 'N/A'}\n`;
                driverCount++;
            }
        }
    }
    
    return driversInfo || 'No driver information provided';
}

function processVehiclesData(formData) {
    let vehiclesInfo = '';
    let vehicleCount = 1;
    
    // Check for vehicle data in formData
    for (let [key, value] of formData.entries()) {
        if (key.startsWith('vehicle_') && key.includes('_year')) {
            const vehicleNum = key.match(/vehicle_(\d+)_year/);
            if (vehicleNum) {
                const num = vehicleNum[1];
                vehiclesInfo += `\nVehicle ${vehicleCount}:\n`;
                vehiclesInfo += `- Year: ${value}\n`;
                vehiclesInfo += `- Make: ${formData.get(`vehicle_${num}_make`) || 'N/A'}\n`;
                vehiclesInfo += `- Model: ${formData.get(`vehicle_${num}_model`) || 'N/A'}\n`;
                vehiclesInfo += `- VIN: ${formData.get(`vehicle_${num}_vin`) || 'N/A'}\n`;
                vehicleCount++;
            }
        }
    }
    
    return vehiclesInfo || 'No vehicle information provided';
}

function processCoverageData(formData) {
    let coverageInfo = '\nCoverage Preferences:\n';
    coverageInfo += `- Liability Limits: ${formData.get('liability_limits') || 'Not specified'}\n`;
    coverageInfo += `- Collision: ${formData.get('collision') === 'on' ? 'Yes' : 'No'}\n`;
    coverageInfo += `- Comprehensive: ${formData.get('comprehensive') === 'on' ? 'Yes' : 'No'}\n`;
    coverageInfo += `- Uninsured Motorist: ${formData.get('uninsured_motorist') === 'on' ? 'Yes' : 'No'}\n`;
    coverageInfo += `- Medical Payments: ${formData.get('medical_payments') === 'on' ? 'Yes' : 'No'}\n`;
    coverageInfo += `- Rental Reimbursement: ${formData.get('rental_reimbursement') === 'on' ? 'Yes' : 'No'}\n`;
    coverageInfo += `- Roadside Assistance: ${formData.get('roadside_assistance') === 'on' ? 'Yes' : 'No'}\n`;
    
    return coverageInfo;
}

function generateFullMessage(formData) {
    let message = `New auto insurance quote request from ${formData.get('firstname')} ${formData.get('lastname')}.\n\n`;
    message += `Contact Information:\n`;
    message += `- Phone: ${formData.get('phone')}\n`;
    message += `- Email: ${formData.get('email')}\n`;
    message += `- Preferred Contact Method: ${formData.get('contact_method')}\n\n`;
    message += processDriversData(formData) + '\n';
    message += processVehiclesData(formData) + '\n';
    message += processCoverageData(formData);
    
    return message;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAutoQuoteHero);
} else {
    initializeAutoQuoteHero();
}

// Export functions for onclick handlers
window.nextStep = nextStep;
window.previousStep = previousStep;
window.selectInfoMethod = selectInfoMethod;
window.handleFileUpload = handleFileUpload;
window.addDriver = addDriver;
window.addVehicle = addVehicle;
window.removeEntry = removeEntry;
window.showFullscreen = showFullscreen;
window.closeFullscreen = closeFullscreen;