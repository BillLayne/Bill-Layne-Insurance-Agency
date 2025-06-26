// Enhanced Coverage Analyzer System for Bill Layne Insurance
// This replaces the placeholder analyzer functions with fully functional tools

// Analyzer data structures and logic
const AnalyzerSystem = {
    currentAnalyzer: null,
    currentStep: 0,
    userData: {},
    
    // Auto Insurance Analyzer Questions
    autoQuestions: [
        {
            id: 'current_coverage',
            title: 'Current Auto Coverage',
            questions: [
                {
                    type: 'select',
                    key: 'liability_limits',
                    label: 'What are your current liability limits?',
                    required: true,
                    options: [
                        { value: '', label: 'Select your current limits' },
                        { value: '25_50_25', label: '$25,000/$50,000/$25,000 (State Minimum)' },
                        { value: '50_100_50', label: '$50,000/$100,000/$50,000' },
                        { value: '100_300_100', label: '$100,000/$300,000/$100,000' },
                        { value: '250_500_250', label: '$250,000/$500,000/$250,000' },
                        { value: '500_1000_500', label: '$500,000/$1,000,000/$500,000' },
                        { value: 'unsure', label: 'I\'m not sure' }
                    ]
                },
                {
                    type: 'select',
                    key: 'deductible',
                    label: 'What\'s your current comprehensive/collision deductible?',
                    required: true,
                    options: [
                        { value: '', label: 'Select deductible amount' },
                        { value: '250', label: '$250' },
                        { value: '500', label: '$500' },
                        { value: '1000', label: '$1,000' },
                        { value: '2500', label: '$2,500' },
                        { value: 'no_coverage', label: 'No comprehensive/collision coverage' },
                        { value: 'unsure', label: 'I\'m not sure' }
                    ]
                },
                {
                    type: 'checkbox',
                    key: 'additional_coverage',
                    label: 'Which additional coverages do you currently have?',
                    options: [
                        { value: 'uninsured_motorist', label: 'Uninsured/Underinsured Motorist' },
                        { value: 'rental_reimbursement', label: 'Rental Car Reimbursement' },
                        { value: 'roadside_assistance', label: 'Roadside Assistance' },
                        { value: 'gap_coverage', label: 'GAP Coverage' },
                        { value: 'new_car_replacement', label: 'New Car Replacement' },
                        { value: 'unsure', label: 'I\'m not sure what I have' }
                    ]
                }
            ]
        },
        {
            id: 'vehicle_info',
            title: 'Vehicle Information',
            questions: [
                {
                    type: 'number',
                    key: 'vehicle_count',
                    label: 'How many vehicles do you need to insure?',
                    required: true,
                    min: 1,
                    max: 10
                },
                {
                    type: 'select',
                    key: 'primary_vehicle_value',
                    label: 'What\'s the approximate value of your primary vehicle?',
                    required: true,
                    options: [
                        { value: '', label: 'Select vehicle value range' },
                        { value: 'under_5k', label: 'Under $5,000' },
                        { value: '5k_10k', label: '$5,000 - $10,000' },
                        { value: '10k_20k', label: '$10,000 - $20,000' },
                        { value: '20k_35k', label: '$20,000 - $35,000' },
                        { value: '35k_50k', label: '$35,000 - $50,000' },
                        { value: 'over_50k', label: 'Over $50,000' }
                    ]
                },
                {
                    type: 'select',
                    key: 'vehicle_usage',
                    label: 'How do you primarily use your vehicle?',
                    required: true,
                    options: [
                        { value: '', label: 'Select primary usage' },
                        { value: 'commuting', label: 'Daily commuting to work' },
                        { value: 'business', label: 'Business use' },
                        { value: 'pleasure', label: 'Personal/pleasure only' },
                        { value: 'farm', label: 'Farm use' },
                        { value: 'occasional', label: 'Occasional driving' }
                    ]
                }
            ]
        },
        {
            id: 'risk_profile',
            title: 'Risk Assessment',
            questions: [
                {
                    type: 'number',
                    key: 'annual_mileage',
                    label: 'Approximately how many miles do you drive per year?',
                    required: true,
                    min: 1000,
                    max: 100000
                },
                {
                    type: 'select',
                    key: 'driving_experience',
                    label: 'How many years of driving experience do you have?',
                    required: true,
                    options: [
                        { value: '', label: 'Select experience level' },
                        { value: 'under_3', label: 'Less than 3 years' },
                        { value: '3_5', label: '3-5 years' },
                        { value: '5_10', label: '5-10 years' },
                        { value: '10_20', label: '10-20 years' },
                        { value: 'over_20', label: 'Over 20 years' }
                    ]
                },
                {
                    type: 'select',
                    key: 'claims_history',
                    label: 'How many insurance claims have you filed in the past 5 years?',
                    required: true,
                    options: [
                        { value: '', label: 'Select number of claims' },
                        { value: '0', label: 'No claims' },
                        { value: '1', label: '1 claim' },
                        { value: '2', label: '2 claims' },
                        { value: '3_plus', label: '3 or more claims' }
                    ]
                }
            ]
        }
    ],

    // Home Insurance Analyzer Questions
    homeQuestions: [
        {
            id: 'property_info',
            title: 'Property Information',
            questions: [
                {
                    type: 'select',
                    key: 'home_type',
                    label: 'What type of home do you have?',
                    required: true,
                    options: [
                        { value: '', label: 'Select home type' },
                        { value: 'single_family', label: 'Single Family Home' },
                        { value: 'townhouse', label: 'Townhouse' },
                        { value: 'condo', label: 'Condominium' },
                        { value: 'duplex', label: 'Duplex' },
                        { value: 'mobile_home', label: 'Mobile/Manufactured Home' },
                        { value: 'other', label: 'Other' }
                    ]
                },
                {
                    type: 'number',
                    key: 'home_value',
                    label: 'What\'s the estimated value of your home?',
                    required: true,
                    min: 50000,
                    max: 5000000
                },
                {
                    type: 'number',
                    key: 'year_built',
                    label: 'What year was your home built?',
                    required: true,
                    min: 1800,
                    max: new Date().getFullYear()
                },
                {
                    type: 'number',
                    key: 'square_footage',
                    label: 'What\'s the approximate square footage?',
                    required: true,
                    min: 500,
                    max: 20000
                }
            ]
        },
        {
            id: 'current_coverage',
            title: 'Current Coverage',
            questions: [
                {
                    type: 'select',
                    key: 'dwelling_coverage',
                    label: 'What\'s your current dwelling coverage amount?',
                    required: true,
                    options: [
                        { value: '', label: 'Select coverage amount' },
                        { value: 'under_100k', label: 'Under $100,000' },
                        { value: '100k_200k', label: '$100,000 - $200,000' },
                        { value: '200k_300k', label: '$200,000 - $300,000' },
                        { value: '300k_500k', label: '$300,000 - $500,000' },
                        { value: 'over_500k', label: 'Over $500,000' },
                        { value: 'unsure', label: 'I\'m not sure' }
                    ]
                },
                {
                    type: 'select',
                    key: 'deductible',
                    label: 'What\'s your current deductible?',
                    required: true,
                    options: [
                        { value: '', label: 'Select deductible amount' },
                        { value: '500', label: '$500' },
                        { value: '1000', label: '$1,000' },
                        { value: '2500', label: '$2,500' },
                        { value: '5000', label: '$5,000' },
                        { value: 'unsure', label: 'I\'m not sure' }
                    ]
                },
                {
                    type: 'checkbox',
                    key: 'additional_coverage',
                    label: 'Which additional coverages do you currently have?',
                    options: [
                        { value: 'personal_property', label: 'Personal Property Coverage' },
                        { value: 'liability', label: 'Personal Liability' },
                        { value: 'medical_payments', label: 'Medical Payments to Others' },
                        { value: 'additional_living', label: 'Additional Living Expenses' },
                        { value: 'water_backup', label: 'Water Backup Coverage' },
                        { value: 'earthquake', label: 'Earthquake Coverage' },
                        { value: 'unsure', label: 'I\'m not sure what I have' }
                    ]
                }
            ]
        },
        {
            id: 'risk_factors',
            title: 'Risk Factors',
            questions: [
                {
                    type: 'checkbox',
                    key: 'home_features',
                    label: 'Which of these features does your home have?',
                    options: [
                        { value: 'security_system', label: 'Security/Alarm System' },
                        { value: 'fire_sprinklers', label: 'Fire Sprinkler System' },
                        { value: 'smoke_detectors', label: 'Smoke Detectors' },
                        { value: 'deadbolt_locks', label: 'Deadbolt Locks' },
                        { value: 'central_air', label: 'Central Air Conditioning' },
                        { value: 'updated_electrical', label: 'Updated Electrical System' },
                        { value: 'updated_plumbing', label: 'Updated Plumbing' },
                        { value: 'new_roof', label: 'Roof Updated in Last 10 Years' }
                    ]
                },
                {
                    type: 'select',
                    key: 'claims_history',
                    label: 'How many home insurance claims have you filed in the past 5 years?',
                    required: true,
                    options: [
                        { value: '', label: 'Select number of claims' },
                        { value: '0', label: 'No claims' },
                        { value: '1', label: '1 claim' },
                        { value: '2', label: '2 claims' },
                        { value: '3_plus', label: '3 or more claims' }
                    ]
                }
            ]
        }
    ],

    // Umbrella Policy Analyzer Questions
    umbrellaQuestions: [
        {
            id: 'asset_assessment',
            title: 'Asset Assessment',
            questions: [
                {
                    type: 'select',
                    key: 'net_worth',
                    label: 'What\'s your approximate total net worth?',
                    required: true,
                    options: [
                        { value: '', label: 'Select net worth range' },
                        { value: 'under_100k', label: 'Under $100,000' },
                        { value: '100k_250k', label: '$100,000 - $250,000' },
                        { value: '250k_500k', label: '$250,000 - $500,000' },
                        { value: '500k_1m', label: '$500,000 - $1,000,000' },
                        { value: '1m_2m', label: '$1,000,000 - $2,000,000' },
                        { value: 'over_2m', label: 'Over $2,000,000' }
                    ]
                },
                {
                    type: 'select',
                    key: 'annual_income',
                    label: 'What\'s your approximate annual household income?',
                    required: true,
                    options: [
                        { value: '', label: 'Select income range' },
                        { value: 'under_50k', label: 'Under $50,000' },
                        { value: '50k_100k', label: '$50,000 - $100,000' },
                        { value: '100k_150k', label: '$100,000 - $150,000' },
                        { value: '150k_250k', label: '$150,000 - $250,000' },
                        { value: 'over_250k', label: 'Over $250,000' }
                    ]
                },
                {
                    type: 'checkbox',
                    key: 'assets',
                    label: 'Which of these assets do you own?',
                    options: [
                        { value: 'primary_home', label: 'Primary Residence' },
                        { value: 'rental_property', label: 'Rental Property' },
                        { value: 'vacation_home', label: 'Vacation Home' },
                        { value: 'investment_accounts', label: 'Investment Accounts' },
                        { value: 'retirement_accounts', label: 'Retirement Accounts' },
                        { value: 'business_ownership', label: 'Business Ownership' },
                        { value: 'valuable_collections', label: 'Valuable Collections/Art' }
                    ]
                }
            ]
        },
        {
            id: 'liability_exposure',
            title: 'Liability Exposure',
            questions: [
                {
                    type: 'checkbox',
                    key: 'risk_factors',
                    label: 'Which of these apply to your situation?',
                    options: [
                        { value: 'teenage_drivers', label: 'Teenage Drivers in Household' },
                        { value: 'pool_spa', label: 'Swimming Pool or Spa' },
                        { value: 'trampoline', label: 'Trampoline' },
                        { value: 'dog_ownership', label: 'Dog Ownership' },
                        { value: 'frequent_entertaining', label: 'Frequent Home Entertaining' },
                        { value: 'rental_property', label: 'Own Rental Property' },
                        { value: 'volunteer_work', label: 'Volunteer Work/Board Positions' },
                        { value: 'social_media', label: 'Active on Social Media' }
                    ]
                },
                {
                    type: 'select',
                    key: 'auto_liability',
                    label: 'What are your current auto liability limits?',
                    required: true,
                    options: [
                        { value: '', label: 'Select current limits' },
                        { value: '25_50', label: '$25,000/$50,000' },
                        { value: '50_100', label: '$50,000/$100,000' },
                        { value: '100_300', label: '$100,000/$300,000' },
                        { value: '250_500', label: '$250,000/$500,000' },
                        { value: '500_1000', label: '$500,000/$1,000,000' },
                        { value: 'unsure', label: 'I\'m not sure' }
                    ]
                },
                {
                    type: 'select',
                    key: 'home_liability',
                    label: 'What are your current home liability limits?',
                    required: true,
                    options: [
                        { value: '', label: 'Select current limits' },
                        { value: '100k', label: '$100,000' },
                        { value: '300k', label: '$300,000' },
                        { value: '500k', label: '$500,000' },
                        { value: '1m', label: '$1,000,000' },
                        { value: 'unsure', label: 'I\'m not sure' }
                    ]
                }
            ]
        }
    ],

    // Initialize the analyzer system
    init() {
        this.createAnalyzerModal();
        this.attachEventListeners();
    },

    // Create the modal HTML structure
    createAnalyzerModal() {
        const modalHTML = `
            <div id="analyzer-modal" class="analyzer-modal">
                <div class="analyzer-modal__backdrop"></div>
                <div class="analyzer-modal__container">
                    <div class="analyzer-modal__header">
                        <h2 id="analyzer-title">Coverage Analyzer</h2>
                        <button class="analyzer-modal__close" aria-label="Close analyzer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="analyzer-modal__progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="progress-fill"></div>
                        </div>
                        <span class="progress-text" id="progress-text">Step 1 of 3</span>
                    </div>
                    <div class="analyzer-modal__content" id="analyzer-content">
                        <!-- Dynamic content will be inserted here -->
                    </div>
                    <div class="analyzer-modal__footer">
                        <button class="btn btn--outline analyzer-btn-secondary" id="analyzer-prev" style="display: none;">Previous</button>
                        <button class="btn btn--primary analyzer-btn-primary" id="analyzer-next">Next</button>
                    </div>
                </div>
            </div>
        `;

        // Insert modal into DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Add modal styles
        this.addModalStyles();
    },

    // Add CSS styles for the analyzer modal
    addModalStyles() {
        const styles = `
            <style id="analyzer-modal-styles">
                .analyzer-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10000;
                    display: none;
                    animation: fadeIn 0.3s ease;
                }

                .analyzer-modal.show {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .analyzer-modal__backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                }

                .analyzer-modal__container {
                    position: relative;
                    background: #ffffff;
                    border-radius: 20px;
                    width: 90%;
                    max-width: 700px;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    animation: slideUp 0.3s ease;
                }

                .analyzer-modal__header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 30px 30px 20px;
                    border-bottom: 1px solid #e9ecef;
                }

                .analyzer-modal__header h2 {
                    margin: 0;
                    color: #0A61C9;
                    font-size: 28px;
                    font-weight: 600;
                }

                .analyzer-modal__close {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 8px;
                    border-radius: 8px;
                    color: #64748b;
                    transition: all 0.2s ease;
                }

                .analyzer-modal__close:hover {
                    background: #f1f5f9;
                    color: #0A61C9;
                }

                .analyzer-modal__progress {
                    padding: 20px 30px;
                    background: #f8f9fa;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 20px;
                }

                .progress-bar {
                    flex: 1;
                    height: 8px;
                    background: #e9ecef;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #0A61C9, #10b981);
                    border-radius: 4px;
                    transition: width 0.3s ease;
                    width: 33.33%;
                }

                .progress-text {
                    font-size: 14px;
                    font-weight: 600;
                    color: #64748b;
                    min-width: 80px;
                    text-align: right;
                }

                .analyzer-modal__content {
                    padding: 30px;
                    min-height: 400px;
                }

                .analyzer-step {
                    animation: fadeInUp 0.3s ease;
                }

                .analyzer-step h3 {
                    color: #2c3e50;
                    font-size: 24px;
                    margin-bottom: 24px;
                    text-align: center;
                }

                .analyzer-question {
                    margin-bottom: 32px;
                }

                .analyzer-question:last-child {
                    margin-bottom: 0;
                }

                .analyzer-question label {
                    display: block;
                    font-weight: 600;
                    margin-bottom: 12px;
                    color: #2c3e50;
                    font-size: 16px;
                }

                .analyzer-question .form-control {
                    width: 100%;
                    padding: 14px 18px;
                    border: 2px solid #e9ecef;
                    border-radius: 12px;
                    font-size: 16px;
                    transition: all 0.3s ease;
                    background: #ffffff;
                }

                .analyzer-question .form-control:focus {
                    border-color: #0A61C9;
                    outline: none;
                    box-shadow: 0 0 0 4px rgba(10, 97, 201, 0.1);
                }

                .analyzer-question .form-control.error {
                    border-color: #dc3545;
                    box-shadow: 0 0 0 4px rgba(220, 53, 69, 0.1);
                }

                .checkbox-group {
                    display: grid;
                    gap: 12px;
                    margin-top: 8px;
                }

                .checkbox-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    background: #f8f9fa;
                    border: 2px solid transparent;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .checkbox-item:hover {
                    background: #e9ecef;
                    border-color: #0A61C9;
                }

                .checkbox-item.checked {
                    background: rgba(10, 97, 201, 0.1);
                    border-color: #0A61C9;
                }

                .checkbox-item input[type="checkbox"] {
                    margin: 0;
                    cursor: pointer;
                }

                .checkbox-item label {
                    margin: 0;
                    cursor: pointer;
                    font-weight: 500;
                    flex: 1;
                }

                .analyzer-modal__footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 30px 30px;
                    border-top: 1px solid #e9ecef;
                }

                .analyzer-btn-primary,
                .analyzer-btn-secondary {
                    min-width: 120px;
                    padding: 12px 24px;
                    font-weight: 600;
                }

                .results-section {
                    text-align: center;
                    padding: 40px 0;
                }

                .results-header {
                    margin-bottom: 40px;
                }

                .results-header h3 {
                    color: #0A61C9;
                    font-size: 32px;
                    margin-bottom: 12px;
                }

                .results-summary {
                    background: linear-gradient(135deg, #f8f9fa 0%, #e6f3ff 100%);
                    padding: 30px;
                    border-radius: 16px;
                    margin-bottom: 30px;
                    border: 2px solid rgba(10, 97, 201, 0.1);
                }

                .risk-score {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    font-size: 24px;
                    font-weight: 700;
                    color: #ffffff;
                    margin: 0 auto 20px;
                }

                .risk-score.low {
                    background: linear-gradient(135deg, #10b981, #059669);
                }

                .risk-score.medium {
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                }

                .risk-score.high {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                }

                .recommendations {
                    text-align: left;
                    margin-top: 30px;
                }

                .recommendation-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 20px;
                    background: #ffffff;
                    border-radius: 12px;
                    margin-bottom: 16px;
                    border-left: 4px solid #0A61C9;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                .recommendation-icon {
                    flex-shrink: 0;
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #0A61C9, #064089);
                    color: #ffffff;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                }

                .recommendation-content h4 {
                    color: #2c3e50;
                    font-size: 18px;
                    margin-bottom: 8px;
                }

                .recommendation-content p {
                    color: #64748b;
                    margin-bottom: 0;
                    line-height: 1.6;
                }

                .results-cta {
                    background: #f8f9fa;
                    padding: 30px;
                    border-radius: 16px;
                    margin-top: 30px;
                }

                .results-cta h4 {
                    color: #2c3e50;
                    margin-bottom: 16px;
                }

                .results-cta p {
                    color: #64748b;
                    margin-bottom: 24px;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideUp {
                    from { 
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to { 
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 768px) {
                    .analyzer-modal__container {
                        width: 95%;
                        max-height: 95vh;
                    }

                    .analyzer-modal__header,
                    .analyzer-modal__content,
                    .analyzer-modal__footer {
                        padding-left: 20px;
                        padding-right: 20px;
                    }

                    .analyzer-modal__progress {
                        padding-left: 20px;
                        padding-right: 20px;
                    }

                    .analyzer-modal__header h2 {
                        font-size: 24px;
                    }

                    .analyzer-step h3 {
                        font-size: 20px;
                    }

                    .analyzer-modal__footer {
                        flex-direction: column;
                        gap: 12px;
                    }

                    .analyzer-btn-primary,
                    .analyzer-btn-secondary {
                        width: 100%;
                    }
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    },

    // Attach event listeners
    attachEventListeners() {
        const modal = document.getElementById('analyzer-modal');
        const closeBtn = modal.querySelector('.analyzer-modal__close');
        const backdrop = modal.querySelector('.analyzer-modal__backdrop');
        const nextBtn = document.getElementById('analyzer-next');
        const prevBtn = document.getElementById('analyzer-prev');

        // Close modal events
        closeBtn.addEventListener('click', () => this.closeModal());
        backdrop.addEventListener('click', () => this.closeModal());

        // Navigation events
        nextBtn.addEventListener('click', () => this.handleNext());
        prevBtn.addEventListener('click', () => this.handlePrevious());

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                this.closeModal();
            }
        });
    },

    // Start analyzer function - replaces the placeholder
    startAnalyzer(type) {
        this.currentAnalyzer = type;
        this.currentStep = 0;
        this.userData = {};

        const modal = document.getElementById('analyzer-modal');
        const title = document.getElementById('analyzer-title');

        // Set analyzer title
        const titles = {
            'auto': 'Auto Coverage Analyzer',
            'home': 'Home Insurance Evaluator', 
            'umbrella': 'Umbrella Policy Calculator'
        };
        title.textContent = titles[type] || 'Coverage Analyzer';

        // Show modal
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';

        // Load first step
        this.loadStep();
    },

    // Load current step
    loadStep() {
        const questions = this.getQuestions();
        const currentQuestionSet = questions[this.currentStep];
        
        if (!currentQuestionSet) {
            this.showResults();
            return;
        }

        this.updateProgress();
        this.renderStep(currentQuestionSet);
        this.updateNavigation();
    },

    // Get questions based on analyzer type
    getQuestions() {
        switch (this.currentAnalyzer) {
            case 'auto': return this.autoQuestions;
            case 'home': return this.homeQuestions;
            case 'umbrella': return this.umbrellaQuestions;
            default: return [];
        }
    },

    // Update progress bar
    updateProgress() {
        const questions = this.getQuestions();
        const progress = ((this.currentStep + 1) / questions.length) * 100;
        
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('progress-text').textContent = 
            `Step ${this.currentStep + 1} of ${questions.length}`;
    },

    // Render current step
    renderStep(questionSet) {
        const content = document.getElementById('analyzer-content');
        
        let html = `
            <div class="analyzer-step">
                <h3>${questionSet.title}</h3>
        `;

        questionSet.questions.forEach(question => {
            html += this.renderQuestion(question);
        });

        html += '</div>';
        content.innerHTML = html;

        // Add event listeners for checkboxes
        this.attachQuestionListeners();
    },

    // Render individual question
    renderQuestion(question) {
        const required = question.required ? 'required' : '';
        
        switch (question.type) {
            case 'select':
                return `
                    <div class="analyzer-question">
                        <label for="${question.key}">${question.label}</label>
                        <select class="form-control" id="${question.key}" name="${question.key}" ${required}>
                            ${question.options.map(option => 
                                `<option value="${option.value}">${option.label}</option>`
                            ).join('')}
                        </select>
                    </div>
                `;

            case 'number':
                return `
                    <div class="analyzer-question">
                        <label for="${question.key}">${question.label}</label>
                        <input type="number" class="form-control" id="${question.key}" name="${question.key}" 
                               ${required} ${question.min ? `min="${question.min}"` : ''} 
                               ${question.max ? `max="${question.max}"` : ''}>
                    </div>
                `;

            case 'checkbox':
                return `
                    <div class="analyzer-question">
                        <label>${question.label}</label>
                        <div class="checkbox-group">
                            ${question.options.map(option => `
                                <div class="checkbox-item">
                                    <input type="checkbox" id="${question.key}_${option.value}" 
                                           name="${question.key}" value="${option.value}">
                                    <label for="${question.key}_${option.value}">${option.label}</label>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;

            default:
                return '';
        }
    },

    // Attach question-specific event listeners
    attachQuestionListeners() {
        // Handle checkbox styling
        const checkboxItems = document.querySelectorAll('.checkbox-item');
        checkboxItems.forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            const updateStyle = () => {
                item.classList.toggle('checked', checkbox.checked);
            };
            
            checkbox.addEventListener('change', updateStyle);
            updateStyle(); // Initial state
        });
    },

    // Update navigation buttons
    updateNavigation() {
        const questions = this.getQuestions();
        const prevBtn = document.getElementById('analyzer-prev');
        const nextBtn = document.getElementById('analyzer-next');

        // Show/hide previous button
        prevBtn.style.display = this.currentStep > 0 ? 'block' : 'none';

        // Update next button text
        if (this.currentStep >= questions.length - 1) {
            nextBtn.textContent = 'Get My Analysis';
            nextBtn.classList.add('analyzer-final-step');
        } else {
            nextBtn.textContent = 'Next';
            nextBtn.classList.remove('analyzer-final-step');
        }
    },

    // Handle next button click
    handleNext() {
        if (!this.validateCurrentStep()) {
            this.showValidationErrors();
            return;
        }

        this.saveCurrentStepData();
        
        const questions = this.getQuestions();
        if (this.currentStep >= questions.length - 1) {
            this.showResults();
        } else {
            this.currentStep++;
            this.loadStep();
        }
    },

    // Handle previous button click
    handlePrevious() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.loadStep();
            this.populateStoredData();
        }
    },

    // Validate current step
    validateCurrentStep() {
        const questions = this.getQuestions();
        const currentQuestionSet = questions[this.currentStep];
        let isValid = true;

        // Clear previous errors
        document.querySelectorAll('.form-control.error').forEach(el => {
            el.classList.remove('error');
        });

        currentQuestionSet.questions.forEach(question => {
            if (question.required) {
                const element = document.getElementById(question.key) || 
                              document.querySelector(`input[name="${question.key}"]:checked`);
                
                if (!element || !element.value) {
                    isValid = false;
                    if (document.getElementById(question.key)) {
                        document.getElementById(question.key).classList.add('error');
                    }
                }
            }
        });

        return isValid;
    },

    // Show validation errors
    showValidationErrors() {
        // Scroll to first error
        const firstError = document.querySelector('.form-control.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
    },

    // Save current step data
    saveCurrentStepData() {
        const questions = this.getQuestions();
        const currentQuestionSet = questions[this.currentStep];

        currentQuestionSet.questions.forEach(question => {
            if (question.type === 'checkbox') {
                const checked = Array.from(document.querySelectorAll(`input[name="${question.key}"]:checked`))
                    .map(el => el.value);
                this.userData[question.key] = checked;
            } else {
                const element = document.getElementById(question.key);
                if (element) {
                    this.userData[question.key] = element.value;
                }
            }
        });
    },

    // Populate stored data when going back
    populateStoredData() {
        Object.keys(this.userData).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.userData[key].includes(element.value);
                } else {
                    element.value = this.userData[key];
                }
            } else {
                // Handle checkbox groups
                const checkboxes = document.querySelectorAll(`input[name="${key}"]`);
                checkboxes.forEach(checkbox => {
                    checkbox.checked = this.userData[key] && this.userData[key].includes(checkbox.value);
                });
            }
        });

        // Update checkbox styling
        this.attachQuestionListeners();
    },

    // Show results
    showResults() {
        const analysis = this.analyzeData();
        const content = document.getElementById('analyzer-content');
        
        content.innerHTML = `
            <div class="results-section">
                <div class="results-header">
                    <h3>Your ${this.getAnalyzerDisplayName()} Analysis</h3>
                    <p>Based on your responses, here's your personalized coverage analysis:</p>
                </div>
                
                <div class="results-summary">
                    <div class="risk-score ${analysis.riskLevel}">
                        ${analysis.score}
                    </div>
                    <h4>${analysis.summary.title}</h4>
                    <p>${analysis.summary.description}</p>
                </div>

                <div class="recommendations">
                    <h4>Our Recommendations:</h4>
                    ${analysis.recommendations.map((rec, index) => `
                        <div class="recommendation-item">
                            <div class="recommendation-icon">${index + 1}</div>
                            <div class="recommendation-content">
                                <h4>${rec.title}</h4>
                                <p>${rec.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="results-cta">
                    <h4>Ready to Optimize Your Coverage?</h4>
                    <p>Get a personalized quote based on this analysis. We'll shop multiple carriers to find you the best coverage at the best price.</p>
                    <button class="btn btn--primary" onclick="AnalyzerSystem.requestPersonalizedQuote()">
                        Get My Personalized Quote
                    </button>
                </div>
            </div>
        `;

        // Update navigation
        document.getElementById('analyzer-next').style.display = 'none';
        document.getElementById('analyzer-prev').textContent = 'Start Over';
        document.getElementById('analyzer-prev').style.display = 'block';
    },

    // Analyze collected data
    analyzeData() {
        switch (this.currentAnalyzer) {
            case 'auto': return this.analyzeAutoData();
            case 'home': return this.analyzeHomeData();
            case 'umbrella': return this.analyzeUmbrellaData();
            default: return this.getDefaultAnalysis();
        }
    },

    // Analyze auto insurance data
    analyzeAutoData() {
        let riskScore = 0;
        const recommendations = [];

        // Analyze liability limits
        const liability = this.userData.liability_limits;
        if (liability === '25_50_25') {
            riskScore += 3;
            recommendations.push({
                title: 'Increase Liability Coverage',
                description: 'Your current liability limits are at state minimums. Consider increasing to at least $100,000/$300,000/$100,000 for better protection.'
            });
        } else if (liability === 'unsure') {
            riskScore += 2;
            recommendations.push({
                title: 'Review Your Policy',
                description: 'It\'s important to understand your current coverage. We can help review your policy and explain your coverage levels.'
            });
        }

        // Analyze deductible
        const deductible = this.userData.deductible;
        if (deductible === 'no_coverage') {
            riskScore += 4;
            recommendations.push({
                title: 'Add Comprehensive & Collision Coverage',
                description: 'Without comprehensive and collision coverage, you\'re not protected against damage to your own vehicle. This is especially important for newer or valuable vehicles.'
            });
        } else if (deductible === '2500') {
            recommendations.push({
                title: 'Consider Lower Deductible',
                description: 'A $2,500 deductible might be high for most situations. Consider lowering to $1,000 or $500 to reduce out-of-pocket costs during claims.'
            });
        }

        // Analyze additional coverage
        const additionalCoverage = this.userData.additional_coverage || [];
        if (!additionalCoverage.includes('uninsured_motorist')) {
            riskScore += 2;
            recommendations.push({
                title: 'Add Uninsured Motorist Coverage',
                description: 'This protects you if you\'re hit by an uninsured or underinsured driver. It\'s relatively inexpensive and provides crucial protection.'
            });
        }

        // Analyze vehicle value vs coverage
        const vehicleValue = this.userData.primary_vehicle_value;
        if (vehicleValue === 'over_50k' && deductible === 'no_coverage') {
            riskScore += 3;
            recommendations.push({
                title: 'Protect Your Investment',
                description: 'Your high-value vehicle needs comprehensive and collision coverage to protect your significant investment.'
            });
        }

        // Analyze claims history
        const claims = this.userData.claims_history;
        if (claims === '3_plus') {
            riskScore += 2;
        }

        // Analyze mileage
        const mileage = parseInt(this.userData.annual_mileage);
        if (mileage > 20000) {
            riskScore += 1;
            recommendations.push({
                title: 'High Mileage Considerations',
                description: 'Your high annual mileage increases risk exposure. Make sure you have adequate coverage and consider usage-based insurance programs.'
            });
        }

        return this.formatAnalysisResults(riskScore, recommendations, 'auto');
    },

    // Analyze home insurance data
    analyzeHomeData() {
        let riskScore = 0;
        const recommendations = [];

        // Analyze dwelling coverage
        const homeValue = parseInt(this.userData.home_value);
        const dwellingCoverage = this.userData.dwelling_coverage;
        
        if (dwellingCoverage === 'unsure') {
            riskScore += 3;
            recommendations.push({
                title: 'Review Your Coverage Amounts',
                description: 'It\'s critical to know your dwelling coverage amount. We can help ensure you have adequate coverage to rebuild your home.'
            });
        } else if (dwellingCoverage === 'under_100k' && homeValue > 200000) {
            riskScore += 4;
            recommendations.push({
                title: 'Increase Dwelling Coverage',
                description: 'Your dwelling coverage appears insufficient based on your home\'s value. Consider increasing coverage to at least 80% of your home\'s replacement cost.'
            });
        }

        // Analyze age of home
        const yearBuilt = parseInt(this.userData.year_built);
        const currentYear = new Date().getFullYear();
        const homeAge = currentYear - yearBuilt;
        
        if (homeAge > 50) {
            riskScore += 1;
            recommendations.push({
                title: 'Older Home Considerations',
                description: 'Older homes may need special coverage considerations for updated building codes and replacement costs. Consider guaranteed replacement cost coverage.'
            });
        }

        // Analyze home features
        const features = this.userData.home_features || [];
        if (!features.includes('security_system')) {
            recommendations.push({
                title: 'Consider Security System Discount',
                description: 'Installing a security system can provide discounts on your insurance and improve your home\'s safety.'
            });
        }

        if (!features.includes('smoke_detectors')) {
            riskScore += 1;
            recommendations.push({
                title: 'Install Smoke Detectors',
                description: 'Smoke detectors are essential for safety and may be required for coverage. They can also provide insurance discounts.'
            });
        }

        // Analyze claims history
        const claims = this.userData.claims_history;
        if (claims === '3_plus') {
            riskScore += 2;
            recommendations.push({
                title: 'Claims History Impact',
                description: 'Multiple claims may affect your rates. Focus on prevention and consider when to file claims based on your deductible.'
            });
        }

        // Check for water backup coverage
        const additionalCoverage = this.userData.additional_coverage || [];
        if (!additionalCoverage.includes('water_backup')) {
            recommendations.push({
                title: 'Consider Water Backup Coverage',
                description: 'Water backup from sewers or drains is typically not covered by standard policies. This coverage is relatively inexpensive and covers a common claim type.'
            });
        }

        return this.formatAnalysisResults(riskScore, recommendations, 'home');
    },

    // Analyze umbrella policy data
    analyzeUmbrellaData() {
        let riskScore = 0;
        const recommendations = [];

        // Analyze net worth vs current coverage
        const netWorth = this.userData.net_worth;
        const autoLiability = this.userData.auto_liability;
        const homeLiability = this.userData.home_liability;

        if (netWorth === '500k_1m' || netWorth === '1m_2m' || netWorth === 'over_2m') {
            riskScore += 2;
            
            if (autoLiability !== '500_1000' && homeLiability !== '1m') {
                riskScore += 2;
                recommendations.push({
                    title: 'Umbrella Policy Recommended',
                    description: 'With your asset level, an umbrella policy is highly recommended to protect your wealth from liability claims that exceed your auto and home coverage.'
                });
            }

            recommendations.push({
                title: 'Asset Protection Strategy',
                description: 'Consider an umbrella policy amount equal to your net worth plus future earnings potential, typically $1-5 million for your situation.'
            });
        }

        // Analyze risk factors
        const riskFactors = this.userData.risk_factors || [];
        if (riskFactors.includes('teenage_drivers')) {
            riskScore += 2;
            recommendations.push({
                title: 'Teenage Driver Liability',
                description: 'Teenage drivers significantly increase liability risk. An umbrella policy provides additional protection against potentially large claims.'
            });
        }

        if (riskFactors.includes('pool_spa')) {
            riskScore += 1;
            recommendations.push({
                title: 'Pool Liability Protection',
                description: 'Pools and spas create additional liability exposure. Ensure adequate liability limits and consider umbrella coverage.'
            });
        }

        if (riskFactors.includes('rental_property')) {
            riskScore += 2;
            recommendations.push({
                title: 'Rental Property Liability',
                description: 'Rental properties create significant liability exposure. Umbrella coverage is essential for landlords to protect personal assets.'
            });
        }

        // Analyze current liability limits
        if (autoLiability === '25_50' || autoLiability === '50_100') {
            riskScore += 3;
            recommendations.push({
                title: 'Increase Auto Liability Limits',
                description: 'Your auto liability limits are too low for umbrella coverage. Increase to at least $250,000/$500,000 to qualify for umbrella policies.'
            });
        }

        if (homeLiability === '100k' || homeLiability === '300k') {
            riskScore += 2;
            recommendations.push({
                title: 'Increase Home Liability Limits',
                description: 'Consider increasing your home liability limits to $500,000 or $1,000,000 to provide a better foundation for umbrella coverage.'
            });
        }

        // Income analysis
        const income = this.userData.annual_income;
        if (income === 'over_250k') {
            recommendations.push({
                title: 'High Income Liability Risk',
                description: 'High earners are attractive targets for liability claims. Umbrella coverage protects your current assets and future earning potential.'
            });
        }

        return this.formatAnalysisResults(riskScore, recommendations, 'umbrella');
    },

    // Format analysis results
    formatAnalysisResults(riskScore, recommendations, type) {
        let riskLevel, score, summary;

        // Determine risk level and score
        if (riskScore <= 2) {
            riskLevel = 'low';
            score = 'A';
            summary = {
                title: 'Good Coverage Foundation',
                description: 'Your current coverage appears to be on the right track, but there are still opportunities for optimization.'
            };
        } else if (riskScore <= 5) {
            riskLevel = 'medium';
            score = 'B';
            summary = {
                title: 'Room for Improvement',
                description: 'Your coverage has some gaps that should be addressed to ensure adequate protection.'
            };
        } else {
            riskLevel = 'high';
            score = 'C';
            summary = {
                title: 'Coverage Needs Attention',
                description: 'We\'ve identified several important coverage gaps that need immediate attention to properly protect you.'
            };
        }

        // Add general recommendations if none specific
        if (recommendations.length === 0) {
            recommendations.push({
                title: 'Regular Coverage Review',
                description: 'Even with good coverage, it\'s important to review your policies annually to ensure they keep pace with your changing needs.'
            });
        }

        // Add final recommendation for quote
        recommendations.push({
            title: 'Shop for Better Rates',
            description: 'We can compare rates from multiple top-rated carriers to ensure you\'re getting the best value for your coverage needs.'
        });

        return {
            riskLevel,
            score,
            summary,
            recommendations: recommendations.slice(0, 4) // Limit to 4 recommendations
        };
    },

    // Get default analysis for unknown types
    getDefaultAnalysis() {
        return {
            riskLevel: 'medium',
            score: 'B',
            summary: {
                title: 'Coverage Analysis Complete',
                description: 'Based on your responses, we\'ve identified opportunities to optimize your insurance coverage.'
            },
            recommendations: [
                {
                    title: 'Comprehensive Review',
                    description: 'Let\'s review your current coverage together to identify the best options for your situation.'
                },
                {
                    title: 'Multiple Carrier Comparison',
                    description: 'We\'ll compare rates from multiple carriers to ensure you\'re getting the best value.'
                }
            ]
        };
    },

    // Get analyzer display name
    getAnalyzerDisplayName() {
        const names = {
            'auto': 'Auto Insurance',
            'home': 'Home Insurance',
            'umbrella': 'Umbrella Policy'
        };
        return names[this.currentAnalyzer] || 'Insurance';
    },

    // Request personalized quote
    requestPersonalizedQuote() {
        // Prepare analysis data for quote request
        const analysisData = {
            analyzer_type: this.currentAnalyzer,
            user_responses: this.userData,
            analysis_score: this.analyzeData().score,
            timestamp: new Date().toISOString()
        };

        // Close analyzer modal
        this.closeModal();

        // Scroll to quote form and pre-fill analyzer type
        setTimeout(() => {
            const quoteForm = document.querySelector('.quote-form');
            const insuranceSelect = document.getElementById('insuranceType');
            
            if (insuranceSelect) {
                // Map analyzer type to form options
                const typeMapping = {
                    'auto': 'auto',
                    'home': 'home',
                    'umbrella': 'specialty'
                };
                insuranceSelect.value = typeMapping[this.currentAnalyzer] || '';
            }

            if (quoteForm) {
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
            }
        }, 100);

        // Store analysis data for potential use in form submission
        sessionStorage.setItem('analyzer_data', JSON.stringify(analysisData));
    },

    // Close modal
    closeModal() {
        const modal = document.getElementById('analyzer-modal');
        modal.classList.remove('show');
        document.body.style.overflow = '';
        
        // Reset analyzer state
        this.currentAnalyzer = null;
        this.currentStep = 0;
        this.userData = {};
    }
};

// Initialize the analyzer system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    AnalyzerSystem.init();
});

// Update the global startAnalyzer function to use the new system
window.startAnalyzer = function(type) {
    AnalyzerSystem.startAnalyzer(type);
};

// Enhanced quote form submission to include analyzer data
const originalHandleQuoteSubmission = window.handleQuoteSubmission;
window.handleQuoteSubmission = function(e) {
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
    
    // Get analyzer data if available
    const analyzerData = sessionStorage.getItem('analyzer_data');
    let additionalInfo = '';
    
    if (analyzerData) {
        const data = JSON.parse(analyzerData);
        additionalInfo = `\n\nAnalyzer Data:\n- Type: ${data.analyzer_type}\n- Analysis Score: ${data.analysis_score}\n- Completed: ${new Date(data.timestamp).toLocaleString()}`;
        
        // Clear the stored data
        sessionStorage.removeItem('analyzer_data');
    }
    
    // Prepare template parameters for EmailJS
    const templateParams = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        insuranceType: formData.get('insuranceType'),
        message: `New quote request from ${formData.get('name')}${additionalInfo}`,
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
            const mailtoLink = `mailto:Save@BillLayneInsurance.com?subject=Quote Request - ${templateParams.insuranceType}&body=Name: ${templateParams.name}%0AEmail: ${templateParams.email}%0APhone: ${templateParams.phone}%0AInsurance Type: ${templateParams.insuranceType}${encodeURIComponent(additionalInfo)}`;
            
            // Show error message with fallback option
            showErrorMessage(mailtoLink);
        });
};
