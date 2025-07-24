// Enhanced Quote Modal Component with Full Auto Quote Functionality
// This file provides a comprehensive modal quote form matching the hero section

(function() {
    'use strict';

    // Modal state
    let currentStep = 1;
    const totalSteps = 6;

    // Modal HTML template with multi-step form
    const modalHTML = `
        <div id="quoteModal" class="quote-modal" aria-hidden="true" role="dialog" aria-labelledby="modalTitle">
            <div class="quote-modal__overlay" onclick="closeQuoteModal()"></div>
            <div class="quote-modal__content quote-modal__content--enhanced">
                <button class="quote-modal__close" onclick="closeQuoteModal()" aria-label="Close modal">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <div class="auto-quote-hero modal-quote-form">
                    <h3 id="modalTitle">Get Your Free Auto Insurance Quote</h3>
                    <p class="form-subtitle">Save up to 40% on your auto insurance in just 5 minutes</p>
                    
                    <div class="progress-bar">
                        <div class="progress-fill" id="modal-progress-fill" style="width: 16.66%"></div>
                    </div>
                    <div class="progress-text" id="modal-progress-text">Step 1 of 6</div>

                    <form id="modalQuoteForm" action="https://formspree.io/f/xkgbdjgy" method="POST" enctype="multipart/form-data">
                        <input type="hidden" name="form_type" value="Auto Insurance Quote - Modal">
                        <input type="hidden" name="source" value="Quote Modal">
                        
                        <!-- Step 1: Personal Information -->
                        <div class="form-step active" data-step="1">
                            <h4 class="step-title">Tell us about yourself</h4>
                            
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
                            
                            <div class="info-method-card" onclick="selectModalInfoMethod('upload')">
                                <input type="radio" name="info_method" value="upload" style="display: none;">
                                <div class="method-icon">📄</div>
                                <div class="method-title">Upload Declaration Page</div>
                                <div class="method-description">Quick and easy - we'll extract your information automatically</div>
                            </div>
                            
                            <div class="info-method-card" onclick="selectModalInfoMethod('manual')">
                                <input type="radio" name="info_method" value="manual" style="display: none;" checked>
                                <div class="method-icon">✏️</div>
                                <div class="method-title">Enter Information Manually</div>
                                <div class="method-description">I'll provide my coverage details step by step</div>
                            </div>

                            <div id="modal-upload-section" style="display: none;">
                                <div class="upload-area" onclick="document.getElementById('modal-declaration-file').click()">
                                    <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📤</div>
                                    <div style="font-weight: 600; margin-bottom: 0.5rem;">Click to upload or drag and drop</div>
                                    <div style="font-size: 0.85rem; color: var(--color-text-secondary);">PDF, JPG, or PNG (Max 10MB)</div>
                                    <input type="file" id="modal-declaration-file" name="declaration_page" accept=".pdf,.jpg,.jpeg,.png" style="display: none;" onchange="handleModalFileUpload(event)">
                                    <div id="modal-file-info" style="margin-top: 1rem; display: none;">
                                        <span style="color: var(--color-success); font-weight: 600;">✓ File selected: </span>
                                        <span id="modal-file-name"></span>
                                    </div>
                                </div>
                            </div>

                            <div id="modal-manual-section">
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
                            
                            <div id="modal-drivers-container">
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
                            
                            <button type="button" class="btn-add-item" onclick="addModalDriver()">+ Add Another Driver</button>
                        </div>

                        <!-- Step 4: Vehicles -->
                        <div class="form-step" data-step="4">
                            <h4 class="step-title">Tell us about your vehicles</h4>
                            
                            <div id="modal-vehicles-container">
                                <div class="driver-vehicle-entry">
                                    <h5 style="margin: 0 0 1rem 0; font-size: 1rem;">Vehicle 1</h5>
                                    <div class="form-group">
                                        <label class="form-label">Year <span class="required">*</span></label>
                                        <input type="number" name="vehicle_year[]" class="form-control" min="1900" max="2025" required>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Make <span class="required">*</span></label>
                                        <input type="text" name="vehicle_make[]" class="form-control" placeholder="e.g., Toyota" required>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Model <span class="required">*</span></label>
                                        <input type="text" name="vehicle_model[]" class="form-control" placeholder="e.g., Camry" required>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Primary Use <span class="required">*</span></label>
                                        <select name="vehicle_use[]" class="form-control" required>
                                            <option value="">Select Use</option>
                                            <option value="Commute">Commute to Work/School</option>
                                            <option value="Pleasure">Pleasure/Personal Use</option>
                                            <option value="Business">Business</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Annual Miles Driven <span class="required">*</span></label>
                                        <select name="vehicle_miles[]" class="form-control" required>
                                            <option value="">Select Miles</option>
                                            <option value="Under 5000">Under 5,000</option>
                                            <option value="5000-7500">5,000 - 7,500</option>
                                            <option value="7500-10000">7,500 - 10,000</option>
                                            <option value="10000-15000">10,000 - 15,000</option>
                                            <option value="Over 15000">Over 15,000</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <button type="button" class="btn-add-item" onclick="addModalVehicle()">+ Add Another Vehicle</button>
                        </div>

                        <!-- Step 5: Coverage Preferences -->
                        <div class="form-step" data-step="5">
                            <h4 class="step-title">Coverage Preferences</h4>
                            
                            <div class="form-group">
                                <label class="form-label">Bodily Injury Liability <span class="required">*</span></label>
                                <select name="bodily_injury" class="form-control" required>
                                    <option value="">Select Coverage</option>
                                    <option value="State Minimum">State Minimum</option>
                                    <option value="50/100">$50,000/$100,000</option>
                                    <option value="100/300">$100,000/$300,000</option>
                                    <option value="250/500">$250,000/$500,000</option>
                                    <option value="500/1000">$500,000/$1,000,000</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Property Damage Liability <span class="required">*</span></label>
                                <select name="property_damage" class="form-control" required>
                                    <option value="">Select Coverage</option>
                                    <option value="State Minimum">State Minimum</option>
                                    <option value="25000">$25,000</option>
                                    <option value="50000">$50,000</option>
                                    <option value="100000">$100,000</option>
                                    <option value="250000">$250,000</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Comprehensive Deductible</label>
                                <select name="comprehensive_deductible" class="form-control">
                                    <option value="No Coverage">No Coverage</option>
                                    <option value="250">$250</option>
                                    <option value="500">$500</option>
                                    <option value="1000">$1,000</option>
                                    <option value="2500">$2,500</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Collision Deductible</label>
                                <select name="collision_deductible" class="form-control">
                                    <option value="No Coverage">No Coverage</option>
                                    <option value="250">$250</option>
                                    <option value="500">$500</option>
                                    <option value="1000">$1,000</option>
                                    <option value="2500">$2,500</option>
                                </select>
                            </div>
                        </div>

                        <!-- Step 6: Additional Information -->
                        <div class="form-step" data-step="6">
                            <h4 class="step-title">Almost done!</h4>
                            
                            <div class="form-group">
                                <label class="form-label">Have you had any accidents or claims in the past 5 years?</label>
                                <select name="claims_history" class="form-control">
                                    <option value="No">No</option>
                                    <option value="Yes - 1">Yes - 1 incident</option>
                                    <option value="Yes - 2">Yes - 2 incidents</option>
                                    <option value="Yes - 3+">Yes - 3 or more incidents</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Do you own or rent your home?</label>
                                <select name="home_ownership" class="form-control">
                                    <option value="Own">Own</option>
                                    <option value="Rent">Rent</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Additional Comments or Questions</label>
                                <textarea name="comments" class="form-control" rows="3" placeholder="Tell us anything else that might help us get you the best rate..."></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" name="consent" required>
                                    <span>I agree to be contacted about my quote request</span>
                                </label>
                            </div>
                        </div>

                        <!-- Navigation Buttons -->
                        <div class="form-navigation">
                            <button type="button" class="btn btn-secondary btn-prev" onclick="modalPreviousStep()" disabled>
                                ← Previous
                            </button>
                            <button type="button" class="btn btn-primary btn-next" onclick="modalNextStep()">
                                Next →
                            </button>
                            <button type="submit" class="btn btn-primary btn-submit" style="display: none;">
                                Get My Quote
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;

    // Enhanced Modal CSS
    const modalCSS = `
        <style>
        /* Base Modal Styles - Fixed Positioning */
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

        /* Enhanced Quote Modal Styles */
        .quote-modal__content {
            position: relative;
            z-index: 1;
        }

        .quote-modal__content--enhanced {
            max-width: 800px;
            width: 95%;
            max-height: 90vh;
            animation: modalSlideUp 0.3s ease;
            display: flex;
            flex-direction: column;
            position: relative;
        }

        .quote-modal__close {
            position: fixed;
            top: 20px;
            right: 20px;
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
            z-index: 10000;
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

        .modal-quote-form {
            background: white;
            padding: 2rem;
            border-radius: 1rem;
            min-height: 500px;
            max-height: 90vh;
            overflow-y: auto;
            overflow-x: hidden;
            display: flex;
            flex-direction: column;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: thin;
            scrollbar-color: rgba(0,0,0,0.2) transparent;
        }

        .modal-quote-form::-webkit-scrollbar {
            width: 8px;
        }

        .modal-quote-form::-webkit-scrollbar-track {
            background: transparent;
        }

        .modal-quote-form::-webkit-scrollbar-thumb {
            background-color: rgba(0,0,0,0.2);
            border-radius: 4px;
        }

        .modal-quote-form form {
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        .modal-quote-form h3 {
            font-size: 1.75rem;
            color: var(--color-primary, #1e3a8a);
            margin-bottom: 0.5rem;
            text-align: center;
        }

        .form-subtitle {
            text-align: center;
            color: var(--color-text-secondary, #64748b);
            margin-bottom: 2rem;
        }

        /* Form Elements Styling */
        .form-group {
            margin-bottom: 1.5rem;
        }

        .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
            color: var(--color-text, #2c3e50);
            font-size: 0.95rem;
        }

        .form-control {
            width: 100%;
            padding: 0.75rem 1rem;
            font-size: 1rem;
            line-height: 1.5;
            color: var(--color-text, #2c3e50);
            background-color: #fff;
            background-clip: padding-box;
            border: 2px solid #e0e0e0;
            border-radius: 0.5rem;
            transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
            box-sizing: border-box;
        }

        .form-control:focus {
            color: var(--color-text, #2c3e50);
            background-color: #fff;
            border-color: var(--color-primary, #1e3a8a);
            outline: 0;
            box-shadow: 0 0 0 0.2rem rgba(30, 58, 138, 0.25);
        }

        .form-control::placeholder {
            color: #999;
            opacity: 1;
        }

        select.form-control {
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 1rem center;
            background-size: 12px;
            padding-right: 2.5rem;
        }

        textarea.form-control {
            resize: vertical;
        }

        .required {
            color: #dc3545;
        }

        /* Progress Bar */
        .progress-bar {
            background: #f0f0f0;
            height: 8px;
            border-radius: 4px;
            margin-bottom: 0.5rem;
            overflow: hidden;
        }

        .progress-fill {
            background: var(--color-primary, #1e3a8a);
            height: 100%;
            transition: width 0.3s ease;
        }

        .progress-text {
            text-align: center;
            font-size: 0.875rem;
            color: var(--color-text-secondary);
            margin-bottom: 2rem;
        }

        /* Form Steps */
        .form-step {
            display: none;
            min-height: 300px;
            flex: 1;
        }

        .form-step.active {
            display: block;
            animation: fadeIn 0.3s ease;
        }

        .step-title {
            font-size: 1.25rem;
            margin-bottom: 1.5rem;
            color: var(--color-primary);
        }

        /* Info Method Cards */
        .info-method-card {
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            padding: 1.5rem;
            margin-bottom: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
        }

        .info-method-card:hover {
            border-color: var(--color-primary);
            background: #f8f9fa;
        }

        .info-method-card.selected {
            border-color: var(--color-primary);
            background: #e6f2ff;
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
            font-size: 0.875rem;
            color: var(--color-text-secondary);
        }

        /* Upload Area */
        .upload-area {
            border: 2px dashed #ccc;
            border-radius: 10px;
            padding: 2rem;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 1rem;
        }

        .upload-area:hover {
            border-color: var(--color-primary);
            background: #f8f9fa;
        }

        /* Driver/Vehicle Entries */
        .driver-vehicle-entry {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 10px;
            margin-bottom: 1rem;
        }

        .btn-add-item {
            background: transparent;
            border: 2px dashed var(--color-primary);
            color: var(--color-primary);
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            width: 100%;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .btn-add-item:hover {
            background: var(--color-primary);
            color: white;
        }

        /* Form Navigation */
        .form-navigation {
            display: flex;
            justify-content: space-between;
            margin-top: 2rem;
            gap: 1rem;
        }

        .btn {
            display: inline-block;
            font-weight: 600;
            text-align: center;
            white-space: nowrap;
            vertical-align: middle;
            user-select: none;
            border: 1px solid transparent;
            padding: 0.75rem 2rem;
            font-size: 1rem;
            line-height: 1.5;
            border-radius: 0.5rem;
            transition: all 0.15s ease-in-out;
            cursor: pointer;
            text-decoration: none;
        }

        .btn-prev, .btn-next, .btn-submit {
            padding: 0.75rem 2rem;
            border-radius: 8px;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .btn-secondary {
            background: #e0e0e0;
            color: #333;
        }

        .btn-secondary:hover:not(:disabled) {
            background: #d0d0d0;
        }

        .btn-primary, .btn--primary {
            background: var(--color-primary, #1e3a8a);
            color: white;
        }

        .btn-primary:hover, .btn--primary:hover {
            background: var(--color-primary-dark, #0f172a);
        }

        .btn-prev:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .btn--full-width {
            width: 100%;
        }

        .checkbox-label {
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
            font-size: 0.9rem;
        }

        .checkbox-label input[type="checkbox"] {
            margin-top: 0.25rem;
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

        /* Prevent body scroll when modal is open */
        body.modal-open {
            overflow: hidden;
            position: fixed;
            width: 100%;
        }

        /* Mobile Optimizations */
        @media (max-width: 768px) {
            .quote-modal__content--enhanced {
                width: 100%;
                max-height: 100vh;
                margin: 0;
            }

            .modal-quote-form {
                padding: 1.5rem;
                min-height: 100vh;
                max-height: 100vh;
                border-radius: 0;
            }

            .quote-modal__close {
                top: 10px;
                right: 10px;
                width: 35px;
                height: 35px;
            }

            .step-title {
                font-size: 1.1rem;
            }

            .info-method-card {
                padding: 1rem;
            }

            .driver-vehicle-entry {
                padding: 1rem;
            }

            .form-navigation {
                flex-direction: column;
            }

            .btn-prev, .btn-next, .btn-submit {
                width: 100%;
            }
        }
        </style>
    `;

    // Global functions for the enhanced modal
    window.openQuoteModal = function() {
        const modal = document.getElementById('quoteModal');
        const body = document.body;
        
        if (modal) {
            modal.classList.add('active');
            body.classList.add('modal-open');
            modal.setAttribute('aria-hidden', 'false');
            
            // Reset to step 1
            currentStep = 1;
            updateModalProgress();
            updateModalButtons();
            
            // Show step 1
            document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
            document.querySelector('.form-step[data-step="1"]').classList.add('active');
            
            // Focus on first input
            setTimeout(() => {
                const firstInput = modal.querySelector('.form-step.active input[type="text"]');
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

    // Navigation functions
    window.modalNextStep = function() {
        const currentStepElement = document.querySelector('.form-step.active');
        const inputs = currentStepElement.querySelectorAll('[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                input.classList.add('error');
                isValid = false;
            } else {
                input.classList.remove('error');
            }
        });
        
        if (!isValid) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Special validation for step 2
        if (currentStep === 2) {
            const infoMethod = document.querySelector('input[name="info_method"]:checked');
            if (infoMethod && infoMethod.value === 'upload') {
                const fileInput = document.getElementById('modal-declaration-file');
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
            
            updateModalProgress();
            updateModalButtons();
        }
    };

    window.modalPreviousStep = function() {
        if (currentStep > 1) {
            const currentStepElement = document.querySelector('.form-step.active');
            currentStepElement.classList.remove('active');
            
            currentStep--;
            const prevStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
            prevStepElement.classList.add('active');
            
            updateModalProgress();
            updateModalButtons();
        }
    };

    function updateModalProgress() {
        const progressFill = document.getElementById('modal-progress-fill');
        const progressText = document.getElementById('modal-progress-text');
        
        if (progressFill) {
            const percentage = (currentStep / totalSteps) * 100;
            progressFill.style.width = percentage + '%';
        }
        
        if (progressText) {
            progressText.textContent = `Step ${currentStep} of ${totalSteps}`;
        }
    }

    function updateModalButtons() {
        const prevBtn = document.querySelector('.btn-prev');
        const nextBtn = document.querySelector('.btn-next');
        const submitBtn = document.querySelector('.btn-submit');
        
        if (prevBtn) prevBtn.disabled = currentStep === 1;
        
        if (currentStep === totalSteps) {
            if (nextBtn) nextBtn.style.display = 'none';
            if (submitBtn) submitBtn.style.display = 'block';
        } else {
            if (nextBtn) nextBtn.style.display = 'block';
            if (submitBtn) submitBtn.style.display = 'none';
        }
    }

    // Info method selection
    window.selectModalInfoMethod = function(method) {
        const cards = document.querySelectorAll('.info-method-card');
        cards.forEach(card => card.classList.remove('selected'));
        
        const selectedCard = event.currentTarget;
        selectedCard.classList.add('selected');
        selectedCard.querySelector('input[type="radio"]').checked = true;
        
        const uploadSection = document.getElementById('modal-upload-section');
        const manualSection = document.getElementById('modal-manual-section');
        
        if (method === 'upload') {
            uploadSection.style.display = 'block';
            manualSection.style.display = 'none';
        } else {
            uploadSection.style.display = 'none';
            manualSection.style.display = 'block';
        }
    };

    // File upload handler
    window.handleModalFileUpload = function(event) {
        const file = event.target.files[0];
        if (file) {
            const fileInfo = document.getElementById('modal-file-info');
            const fileName = document.getElementById('modal-file-name');
            
            if (fileInfo && fileName) {
                fileName.textContent = file.name;
                fileInfo.style.display = 'block';
            }
        }
    };

    // Add driver
    window.addModalDriver = function() {
        const container = document.getElementById('modal-drivers-container');
        const driverCount = container.querySelectorAll('.driver-vehicle-entry').length + 1;
        
        const newDriver = document.createElement('div');
        newDriver.className = 'driver-vehicle-entry';
        newDriver.innerHTML = `
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
            <button type="button" class="btn btn-secondary" onclick="this.parentElement.remove()" style="width: 100%; margin-top: 1rem;">Remove Driver</button>
        `;
        
        container.appendChild(newDriver);
    };

    // Add vehicle
    window.addModalVehicle = function() {
        const container = document.getElementById('modal-vehicles-container');
        const vehicleCount = container.querySelectorAll('.driver-vehicle-entry').length + 1;
        
        const newVehicle = document.createElement('div');
        newVehicle.className = 'driver-vehicle-entry';
        newVehicle.innerHTML = `
            <h5 style="margin: 0 0 1rem 0; font-size: 1rem;">Vehicle ${vehicleCount}</h5>
            <div class="form-group">
                <label class="form-label">Year <span class="required">*</span></label>
                <input type="number" name="vehicle_year[]" class="form-control" min="1900" max="2025" required>
            </div>
            <div class="form-group">
                <label class="form-label">Make <span class="required">*</span></label>
                <input type="text" name="vehicle_make[]" class="form-control" placeholder="e.g., Toyota" required>
            </div>
            <div class="form-group">
                <label class="form-label">Model <span class="required">*</span></label>
                <input type="text" name="vehicle_model[]" class="form-control" placeholder="e.g., Camry" required>
            </div>
            <div class="form-group">
                <label class="form-label">Primary Use <span class="required">*</span></label>
                <select name="vehicle_use[]" class="form-control" required>
                    <option value="">Select Use</option>
                    <option value="Commute">Commute to Work/School</option>
                    <option value="Pleasure">Pleasure/Personal Use</option>
                    <option value="Business">Business</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Annual Miles Driven <span class="required">*</span></label>
                <select name="vehicle_miles[]" class="form-control" required>
                    <option value="">Select Miles</option>
                    <option value="Under 5000">Under 5,000</option>
                    <option value="5000-7500">5,000 - 7,500</option>
                    <option value="7500-10000">7,500 - 10,000</option>
                    <option value="10000-15000">10,000 - 15,000</option>
                    <option value="Over 15000">Over 15,000</option>
                </select>
            </div>
            <button type="button" class="btn btn-secondary" onclick="this.parentElement.remove()" style="width: 100%; margin-top: 1rem;">Remove Vehicle</button>
        `;
        
        container.appendChild(newVehicle);
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

        // Handle form submission
        const modalForm = document.getElementById('modalQuoteForm');
        if (modalForm) {
            modalForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const submitBtn = this.querySelector('button[type="submit"]');
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
                
                // Submit to Formspree
                const formData = new FormData(this);
                
                fetch(this.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(response => {
                    if (response.ok) {
                        alert('Thank you! Your comprehensive quote request has been submitted. We\'ll contact you within 24 hours with your personalized quote.');
                        modalForm.reset();
                        closeQuoteModal();
                    } else {
                        throw new Error('Form submission failed');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('There was an error submitting your request. Please try again or call us at (336) 835-1993.');
                })
                .finally(() => {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Get My Quote';
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