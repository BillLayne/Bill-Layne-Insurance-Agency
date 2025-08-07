/* 
 * Bill Layne Insurance - JavaScript
 * Version: 2024.12.13.2
 * Last Updated: December 13, 2024
 * Update History:
 * - 2024.12.13.2: Fixed mobile menu functionality
 */



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
// DISABLED: This conflicts with the form handler in index.html
// const originalHandleQuoteSubmission = window.handleQuoteSubmission;
// window.handleQuoteSubmission = function(e) {
//     e.preventDefault();
//     
//     const form = e.target;
//     const submitBtn = form.querySelector('button[type="submit"]');
//     const formData = new FormData(form);
//     
//     // Validate form
//     if (!validateForm(form)) {
//         return;
//     }
//     
//     // Show loading state
//     submitBtn.classList.add('loading');
//     submitBtn.disabled = true;
//     
//     // Get analyzer data if available
//     const analyzerData = sessionStorage.getItem('analyzer_data');
//     let additionalInfo = '';
//     
//     if (analyzerData) {
//         const data = JSON.parse(analyzerData);
//         additionalInfo = `\n\nAnalyzer Data:\n- Type: ${data.analyzer_type}\n- Analysis Score: ${data.analysis_score}\n- Completed: ${new Date(data.timestamp).toLocaleString()}`;
//         
//         // Clear the stored data
//         sessionStorage.removeItem('analyzer_data');
//     }
//     
//     // Prepare template parameters for EmailJS
//     const templateParams = {
//         name: formData.get('name'),
//         email: formData.get('email'),
//         phone: formData.get('phone'),
//         insuranceType: formData.get('insuranceType'),
//         message: `New quote request from ${formData.get('name')}${additionalInfo}`,
//         submission_date: new Date().toLocaleString()
//     };
//     
//     // Send email using EmailJS
//     emailjs.send('service_4flmw3k', 'template_6k9bgwi', templateParams)
//         .then(function(response) {
//             console.log('SUCCESS!', response.status, response.text);
//             
//             // Show success message
//             showSuccessMessage();
//             
//             // Reset form
//             form.reset();
//             
//             // Remove loading state
//             submitBtn.classList.remove('loading');
//             submitBtn.disabled = false;
//             
//             // Clear validation classes
//             const formControls = form.querySelectorAll('.form-control');
//             formControls.forEach(control => {
//                 control.classList.remove('error', 'success');
//             });
//         })
//         .catch(function(error) {
//             console.error('FAILED...', error);
//             
//             // Remove loading state
//             submitBtn.classList.remove('loading');
//             submitBtn.disabled = false;
//             
//             // Try mailto fallback
//             const mailtoLink = `mailto:Save@BillLayneInsurance.com?subject=Quote Request - ${templateParams.insuranceType}&body=Name: ${templateParams.name}%0AEmail: ${templateParams.email}%0APhone: ${templateParams.phone}%0AInsurance Type: ${templateParams.insuranceType}${encodeURIComponent(additionalInfo)}`;
//             
//             // Show error message with fallback option
//             showErrorMessage(mailtoLink);
//         });
// };
// Interactive Learning Center Enhancement for Bill Layne Insurance
// This adds Insurance IQ Quiz and Risk Assessment Questionnaire to your existing system

// Extend the existing AnalyzerSystem with Learning Center functionality
Object.assign(AnalyzerSystem, {
    
    // Insurance IQ Quiz Questions
    iqQuizQuestions: [
        {
            question: "What does liability insurance cover?",
            options: [
                "Damage to your own vehicle",
                "Medical expenses for you and your passengers", 
                "Damage and injuries you cause to others",
                "Theft of personal belongings"
            ],
            correct: 2,
            explanation: "Liability insurance covers damage and injuries you cause to other people and their property. It's legally required in most states and protects you from lawsuits."
        },
        {
            question: "What's the recommended amount of emergency fund before you consider lowering your insurance deductibles?",
            options: [
                "1 month of expenses",
                "3-6 months of expenses", 
                "1 year of expenses",
                "No emergency fund needed"
            ],
            correct: 1,
            explanation: "Financial experts recommend having 3-6 months of expenses saved before considering higher deductibles. This ensures you can afford the out-of-pocket costs if you need to file a claim."
        },
        {
            question: "Which factor typically has the BIGGEST impact on your auto insurance rates?",
            options: [
                "The color of your car",
                "Your driving record",
                "Your car's age", 
                "Where you park overnight"
            ],
            correct: 1,
            explanation: "Your driving record, including accidents and violations, typically has the biggest impact on rates. Insurance companies use this to predict future risk."
        },
        {
            question: "What does 'replacement cost' coverage mean for homeowners insurance?",
            options: [
                "Pays what you originally paid for items",
                "Pays current market value of items",
                "Pays the cost to buy new items of similar quality",
                "Only covers items under 5 years old"
            ],
            correct: 2,
            explanation: "Replacement cost coverage pays to replace your belongings with new items of similar quality, regardless of depreciation. This is typically better than 'actual cash value' coverage."
        },
        {
            question: "What's the '80% rule' in homeowners insurance?",
            options: [
                "You must be home 80% of the time",
                "Coverage should equal 80% of your home's replacement cost",
                "Deductible can't exceed 80% of claim",
                "You pay 80% of all claims"
            ],
            correct: 1,
            explanation: "The 80% rule means you should insure your home for at least 80% of its replacement cost to avoid penalties and ensure full coverage for partial losses."
        },
        {
            question: "Which is NOT typically covered by standard homeowners insurance?",
            options: [
                "Fire damage",
                "Theft",
                "Flood damage", 
                "Windstorm damage"
            ],
            correct: 2,
            explanation: "Flood damage requires separate flood insurance. Standard homeowners policies exclude floods, earthquakes, and certain other natural disasters."
        },
        {
            question: "What does 'uninsured motorist' coverage protect against?",
            options: [
                "When you drive without insurance",
                "When someone without insurance hits you",
                "When your car is stolen by an uninsured person",
                "When you lend your car to an uninsured friend"
            ],
            correct: 1,
            explanation: "Uninsured motorist coverage protects you when you're hit by a driver who doesn't have insurance or doesn't have enough insurance to cover your damages."
        },
        {
            question: "How often should you review your insurance coverage?",
            options: [
                "Only when you have a claim",
                "Every 5 years",
                "Annually",
                "Only when rates increase"
            ],
            correct: 2,
            explanation: "You should review your coverage annually or after major life changes (marriage, new home, etc.) to ensure adequate protection and competitive rates."
        },
        {
            question: "What's the primary purpose of an umbrella insurance policy?",
            options: [
                "Cover weather-related damage",
                "Provide additional liability protection",
                "Replace all other insurance policies",
                "Cover only business activities"
            ],
            correct: 1,
            explanation: "Umbrella insurance provides additional liability coverage above your auto and home policy limits, protecting your assets from large liability claims."
        },
        {
            question: "Which factor does NOT typically affect life insurance premiums?",
            options: [
                "Your age",
                "Your health",
                "Your job title",
                "Your hobbies"
            ],
            correct: 2,
            explanation: "While occupation can matter for certain high-risk jobs, your job title alone typically doesn't affect premiums as much as age, health, and risky hobbies like skydiving."
        },
        {
            question: "What does GAP insurance cover?",
            options: [
                "The gap between insurance payments",
                "The difference between what you owe and your car's value",
                "Gaps in your coverage history", 
                "The gap between deductibles"
            ],
            correct: 1,
            explanation: "GAP (Guaranteed Asset Protection) insurance covers the difference between what you owe on a car loan and the car's actual cash value if it's totaled."
        },
        {
            question: "Which home feature typically provides the biggest insurance discount?",
            options: [
                "Swimming pool",
                "Home security system",
                "Granite countertops",
                "Large garage"
            ],
            correct: 1,
            explanation: "Security systems typically provide significant discounts because they reduce the risk of theft and may include fire monitoring, reducing multiple types of claims."
        },
        {
            question: "What's the difference between a premium and a deductible?",
            options: [
                "They're the same thing",
                "Premium is what you pay regularly; deductible is what you pay per claim",
                "Premium is yearly; deductible is monthly",
                "Premium is optional; deductible is required"
            ],
            correct: 1,
            explanation: "Premium is the amount you pay for insurance coverage (monthly, quarterly, or annually). Deductible is the amount you pay out-of-pocket before insurance covers a claim."
        },
        {
            question: "Which is typically the most cost-effective way to lower your insurance premiums?",
            options: [
                "Reduce coverage amounts",
                "Increase your deductibles",
                "Cancel optional coverages",
                "Switch companies every year"
            ],
            correct: 1,
            explanation: "Increasing deductibles is often the most cost-effective way to lower premiums while maintaining adequate coverage. Just ensure you can afford the higher out-of-pocket cost."
        },
        {
            question: "What should you do immediately after a car accident?",
            options: [
                "Call your insurance company first",
                "Ensure safety, call police if needed, document the scene",
                "Admit fault to be honest",
                "Leave if there's no damage"
            ],
            correct: 1,
            explanation: "First ensure safety, call police if there are injuries or significant damage, document everything with photos, exchange information, but never admit fault at the scene."
        }
    ],

    // Risk Assessment Questions
    riskAssessmentQuestions: [
        {
            id: 'personal_info',
            title: 'Personal Information',
            questions: [
                {
                    type: 'select',
                    key: 'age_group',
                    label: 'What\'s your age group?',
                    required: true,
                    options: [
                        { value: '', label: 'Select your age group' },
                        { value: '18-25', label: '18-25 years old' },
                        { value: '26-35', label: '26-35 years old' },
                        { value: '36-45', label: '36-45 years old' },
                        { value: '46-55', label: '46-55 years old' },
                        { value: '56-65', label: '56-65 years old' },
                        { value: '65+', label: '65+ years old' }
                    ]
                },
                {
                    type: 'select',
                    key: 'marital_status',
                    label: 'What\'s your marital status?',
                    required: true,
                    options: [
                        { value: '', label: 'Select marital status' },
                        { value: 'single', label: 'Single' },
                        { value: 'married', label: 'Married' },
                        { value: 'divorced', label: 'Divorced' },
                        { value: 'widowed', label: 'Widowed' }
                    ]
                },
                {
                    type: 'select',
                    key: 'dependents',
                    label: 'How many dependents do you have?',
                    required: true,
                    options: [
                        { value: '', label: 'Select number of dependents' },
                        { value: '0', label: 'No dependents' },
                        { value: '1', label: '1 dependent' },
                        { value: '2', label: '2 dependents' },
                        { value: '3', label: '3 dependents' },
                        { value: '4+', label: '4 or more dependents' }
                    ]
                }
            ]
        },
        {
            id: 'lifestyle',
            title: 'Lifestyle & Activities',
            questions: [
                {
                    type: 'checkbox',
                    key: 'activities',
                    label: 'Which activities do you regularly participate in?',
                    options: [
                        { value: 'commute_driving', label: 'Daily commuting by car (>30 minutes)' },
                        { value: 'frequent_travel', label: 'Frequent business or leisure travel' },
                        { value: 'outdoor_sports', label: 'Outdoor sports (hiking, skiing, etc.)' },
                        { value: 'water_sports', label: 'Water sports (boating, jet skiing, etc.)' },
                        { value: 'high_risk_hobbies', label: 'High-risk hobbies (motorcycling, rock climbing)' },
                        { value: 'home_business', label: 'Run business from home' },
                        { value: 'volunteer_work', label: 'Regular volunteer work' },
                        { value: 'youth_sports_coach', label: 'Coach youth sports' }
                    ]
                },
                {
                    type: 'select',
                    key: 'driving_frequency',
                    label: 'How often do you drive?',
                    required: true,
                    options: [
                        { value: '', label: 'Select driving frequency' },
                        { value: 'daily', label: 'Daily - work commute' },
                        { value: 'frequent', label: 'Several times per week' },
                        { value: 'occasional', label: 'Occasionally - weekends/errands' },
                        { value: 'rare', label: 'Rarely - special occasions only' }
                    ]
                },
                {
                    type: 'select',
                    key: 'social_media_usage',
                    label: 'How active are you on social media?',
                    required: true,
                    options: [
                        { value: '', label: 'Select social media usage' },
                        { value: 'very_active', label: 'Very active - post daily' },
                        { value: 'moderate', label: 'Moderately active - few times per week' },
                        { value: 'light', label: 'Light usage - occasionally' },
                        { value: 'minimal', label: 'Minimal or no social media use' }
                    ]
                }
            ]
        },
        {
            id: 'property_assets',
            title: 'Property & Assets',
            questions: [
                {
                    type: 'select',
                    key: 'housing_situation',
                    label: 'What\'s your current housing situation?',
                    required: true,
                    options: [
                        { value: '', label: 'Select housing situation' },
                        { value: 'own_home', label: 'Own my home' },
                        { value: 'rent_apartment', label: 'Rent apartment/condo' },
                        { value: 'rent_house', label: 'Rent house' },
                        { value: 'live_with_family', label: 'Live with family/relatives' },
                        { value: 'other', label: 'Other living situation' }
                    ]
                },
                {
                    type: 'checkbox',
                    key: 'property_features',
                    label: 'Which features apply to your living situation?',
                    options: [
                        { value: 'pool_spa', label: 'Swimming pool or spa' },
                        { value: 'trampoline', label: 'Trampoline' },
                        { value: 'playground_equipment', label: 'Playground equipment' },
                        { value: 'fireplace', label: 'Fireplace or wood stove' },
                        { value: 'basement', label: 'Basement' },
                        { value: 'attached_garage', label: 'Attached garage' },
                        { value: 'detached_structures', label: 'Detached structures (shed, garage, etc.)' },
                        { value: 'valuable_collections', label: 'Valuable collections or art' }
                    ]
                },
                {
                    type: 'checkbox',
                    key: 'vehicles_owned',
                    label: 'What types of vehicles do you own or use?',
                    options: [
                        { value: 'personal_car', label: 'Personal car/truck' },
                        { value: 'motorcycle', label: 'Motorcycle or scooter' },
                        { value: 'recreational_vehicle', label: 'RV or motorhome' },
                        { value: 'boat', label: 'Boat or watercraft' },
                        { value: 'atv', label: 'ATV or off-road vehicle' },
                        { value: 'classic_car', label: 'Classic or collector car' },
                        { value: 'commercial_vehicle', label: 'Commercial vehicle for work' }
                    ]
                }
            ]
        },
        {
            id: 'financial_health',
            title: 'Financial Considerations',
            questions: [
                {
                    type: 'select',
                    key: 'emergency_fund',
                    label: 'How much do you have in emergency savings?',
                    required: true,
                    options: [
                        { value: '', label: 'Select emergency fund level' },
                        { value: 'none', label: 'No emergency fund' },
                        { value: 'under_1000', label: 'Less than $1,000' },
                        { value: '1000_5000', label: '$1,000 - $5,000' },
                        { value: '5000_10000', label: '$5,000 - $10,000' },
                        { value: 'over_10000', label: 'More than $10,000' }
                    ]
                },
                {
                    type: 'select',
                    key: 'debt_level',
                    label: 'How would you describe your current debt level?',
                    required: true,
                    options: [
                        { value: '', label: 'Select debt level' },
                        { value: 'no_debt', label: 'No significant debt' },
                        { value: 'manageable', label: 'Manageable debt levels' },
                        { value: 'moderate', label: 'Moderate debt - manageable but noticeable' },
                        { value: 'high', label: 'High debt - struggling to keep up' }
                    ]
                },
                {
                    type: 'select',
                    key: 'insurance_priority',
                    label: 'What\'s your main priority with insurance?',
                    required: true,
                    options: [
                        { value: '', label: 'Select insurance priority' },
                        { value: 'lowest_cost', label: 'Lowest possible cost' },
                        { value: 'basic_protection', label: 'Basic protection at reasonable cost' },
                        { value: 'comprehensive', label: 'Comprehensive coverage for peace of mind' },
                        { value: 'asset_protection', label: 'Maximum asset protection' }
                    ]
                }
            ]
        }
    ],

    // Start IQ Quiz
    startIQQuiz() {
        this.currentAnalyzer = 'iq_quiz';
        this.currentStep = 0;
        this.userData = {
            answers: [],
            score: 0,
            startTime: Date.now()
        };

        const modal = document.getElementById('analyzer-modal');
        const title = document.getElementById('analyzer-title');
        title.textContent = 'Insurance IQ Quiz';

        modal.classList.add('show');
        document.body.style.overflow = 'hidden';

        this.loadIQQuizQuestion();
    },

    // Start Risk Assessment
    startRiskAssessment() {
        this.currentAnalyzer = 'risk_assessment';
        this.currentStep = 0;
        this.userData = {};

        const modal = document.getElementById('analyzer-modal');
        const title = document.getElementById('analyzer-title');
        title.textContent = 'Personal Risk Assessment';

        modal.classList.add('show');
        document.body.style.overflow = 'hidden';

        this.loadStep();
    },

    // Load IQ Quiz Question
    loadIQQuizQuestion() {
        if (this.currentStep >= this.iqQuizQuestions.length) {
            this.showIQQuizResults();
            return;
        }

        const question = this.iqQuizQuestions[this.currentStep];
        const content = document.getElementById('analyzer-content');
        
        content.innerHTML = `
            <div class="iq-quiz-question">
                <div class="question-header">
                    <span class="question-number">Question ${this.currentStep + 1} of ${this.iqQuizQuestions.length}</span>
                    <div class="question-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${((this.currentStep + 1) / this.iqQuizQuestions.length) * 100}%"></div>
                        </div>
                    </div>
                </div>
                
                <h3 class="question-text">${question.question}</h3>
                
                <div class="quiz-options">
                    ${question.options.map((option, index) => `
                        <div class="quiz-option" data-index="${index}">
                            <div class="option-letter">${String.fromCharCode(65 + index)}</div>
                            <div class="option-text">${option}</div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="quiz-explanation" id="quiz-explanation" style="display: none;">
                    <div class="explanation-content">
                        <h4>Explanation:</h4>
                        <p>${question.explanation}</p>
                    </div>
                </div>
            </div>
        `;

        // Update progress
        document.getElementById('progress-fill').style.width = `${((this.currentStep + 1) / this.iqQuizQuestions.length) * 100}%`;
        document.getElementById('progress-text').textContent = `Question ${this.currentStep + 1} of ${this.iqQuizQuestions.length}`;

        // Update navigation
        document.getElementById('analyzer-prev').style.display = this.currentStep > 0 ? 'block' : 'none';
        document.getElementById('analyzer-next').style.display = 'none';

        this.attachIQQuizListeners();
    },

    // Attach IQ Quiz listeners
    attachIQQuizListeners() {
        const options = document.querySelectorAll('.quiz-option');
        const question = this.iqQuizQuestions[this.currentStep];
        
        options.forEach((option, index) => {
            option.addEventListener('click', () => {
                // Remove previous selections
                options.forEach(opt => opt.classList.remove('selected', 'correct', 'incorrect'));
                
                // Mark selection
                option.classList.add('selected');
                
                // Check if correct
                const isCorrect = index === question.correct;
                if (isCorrect) {
                    option.classList.add('correct');
                    this.userData.score++;
                } else {
                    option.classList.add('incorrect');
                    options[question.correct].classList.add('correct');
                }

                // Store answer
                this.userData.answers[this.currentStep] = {
                    selected: index,
                    correct: question.correct,
                    isCorrect: isCorrect
                };

                // Show explanation
                const explanation = document.getElementById('quiz-explanation');
                explanation.style.display = 'block';
                explanation.scrollIntoView({ behavior: 'smooth' });

                // Show next button after delay
                setTimeout(() => {
                    const nextBtn = document.getElementById('analyzer-next');
                    if (this.currentStep >= this.iqQuizQuestions.length - 1) {
                        nextBtn.textContent = 'See My Results';
                    } else {
                        nextBtn.textContent = 'Next Question';
                    }
                    nextBtn.style.display = 'block';
                }, 1500);
            });
        });
    },

    // Show IQ Quiz Results
    showIQQuizResults() {
        const score = this.userData.score;
        const total = this.iqQuizQuestions.length;
        const percentage = Math.round((score / total) * 100);
        const timeTaken = Math.round((Date.now() - this.userData.startTime) / 1000);

        let grade, message, recommendations;

        if (percentage >= 90) {
            grade = 'A+';
            message = 'Insurance Expert!';
            recommendations = [
                'You have excellent insurance knowledge! You understand the complexities of coverage and risk management.',
                'Consider sharing your knowledge - you could help friends and family make better insurance decisions.',
                'Stay updated on insurance trends and new products to maintain your expertise.'
            ];
        } else if (percentage >= 80) {
            grade = 'A';
            message = 'Very Knowledgeable';
            recommendations = [
                'You have a strong understanding of insurance fundamentals.',
                'Review areas where you missed questions to round out your knowledge.',
                'You\'re well-equipped to make informed insurance decisions.'
            ];
        } else if (percentage >= 70) {
            grade = 'B';
            message = 'Good Foundation';
            recommendations = [
                'You have a solid basic understanding of insurance concepts.',
                'Consider learning more about specific coverage types and their benefits.',
                'Don\'t hesitate to ask questions when reviewing your policies.'
            ];
        } else if (percentage >= 60) {
            grade = 'C';
            message = 'Room for Improvement';
            recommendations = [
                'You understand some insurance basics but could benefit from additional learning.',
                'Take time to review your current policies and understand what you have.',
                'Consider meeting with an agent to discuss your coverage and ask questions.'
            ];
        } else {
            grade = 'D';
            message = 'Learning Opportunity';
            recommendations = [
                'Insurance can be complex - don\'t worry, you\'re not alone in finding it confusing!',
                'This is a great opportunity to learn more about protecting yourself and your assets.',
                'Schedule a consultation to review your needs and understand your options.'
            ];
        }

        const content = document.getElementById('analyzer-content');
        content.innerHTML = `
            <div class="quiz-results">
                <div class="results-header">
                    <div class="score-circle ${grade.toLowerCase().replace('+', '-plus')}">
                        <div class="grade">${grade}</div>
                        <div class="percentage">${percentage}%</div>
                    </div>
                    <h3>${message}</h3>
                    <p>You scored ${score} out of ${total} questions correctly in ${timeTaken} seconds.</p>
                </div>

                <div class="quiz-breakdown">
                    <h4>Question Breakdown:</h4>
                    <div class="question-results">
                        ${this.userData.answers.map((answer, index) => `
                            <div class="question-result ${answer.isCorrect ? 'correct' : 'incorrect'}">
                                <span class="question-num">Q${index + 1}</span>
                                <span class="result-icon">${answer.isCorrect ? '✓' : '✗'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="recommendations-section">
                    <h4>Recommendations for You:</h4>
                    ${recommendations.map(rec => `
                        <div class="recommendation-item">
                            <div class="recommendation-icon">💡</div>
                            <p>${rec}</p>
                        </div>
                    `).join('')}
                </div>

                <div class="quiz-cta">
                    <h4>Want to Put Your Knowledge to Work?</h4>
                    <p>Whether you're an insurance expert or just getting started, we're here to help you find the perfect coverage for your needs.</p>
                    <div class="cta-buttons">
                        <button class="btn btn--primary" onclick="AnalyzerSystem.requestPersonalizedQuote()">
                            Get My Personalized Quote
                        </button>
                        <button class="btn btn--outline" onclick="AnalyzerSystem.shareQuizResults(${percentage}, '${grade}')">
                            Share My Results
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Update navigation
        document.getElementById('analyzer-next').style.display = 'none';
        document.getElementById('analyzer-prev').textContent = 'Retake Quiz';
        document.getElementById('analyzer-prev').style.display = 'block';
    },

    // Share quiz results
    shareQuizResults(percentage, grade) {
        const text = `I just scored ${percentage}% (${grade}) on the Insurance IQ Quiz at Bill Layne Insurance! Test your insurance knowledge too:`;
        const url = window.location.href;
        
        if (navigator.share) {
            navigator.share({
                title: 'Insurance IQ Quiz Results',
                text: text,
                url: url
            });
        } else {
            // Fallback to copying to clipboard
            navigator.clipboard.writeText(`${text} ${url}`).then(() => {
                alert('Results copied to clipboard! Share with your friends.');
            });
        }
    },

    // Show Risk Assessment Results
    showRiskAssessmentResults() {
        const analysis = this.analyzeRiskData();
        const content = document.getElementById('analyzer-content');
        
        content.innerHTML = `
            <div class="risk-assessment-results">
                <div class="results-header">
                    <h3>Your Personal Risk Profile</h3>
                    <p>Based on your lifestyle and situation, here's your personalized risk assessment:</p>
                </div>
                
                <div class="risk-profile-summary">
                    <div class="risk-categories">
                        ${analysis.categories.map(category => `
                            <div class="risk-category">
                                <div class="category-header">
                                    <h4>${category.name}</h4>
                                    <div class="risk-level ${category.level}">
                                        <span class="risk-dot"></span>
                                        ${category.level.charAt(0).toUpperCase() + category.level.slice(1)} Risk
                                    </div>
                                </div>
                                <p>${category.description}</p>
                                ${category.recommendations.length > 0 ? `
                                    <ul class="category-recommendations">
                                        ${category.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                                    </ul>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="overall-recommendations">
                    <h4>Priority Recommendations:</h4>
                    ${analysis.overallRecommendations.map((rec, index) => `
                        <div class="recommendation-item priority-${rec.priority}">
                            <div class="recommendation-icon">${index + 1}</div>
                            <div class="recommendation-content">
                                <h5>${rec.title}</h5>
                                <p>${rec.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="risk-summary-cta">
                    <h4>Ready to Optimize Your Protection?</h4>
                    <p>Based on your risk profile, we can help you find coverage that fits your specific needs and budget.</p>
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

    // Analyze risk assessment data
    analyzeRiskData() {
        const data = this.userData;
        const categories = [];
        const overallRecommendations = [];

        // Auto Risk Analysis
        let autoRisk = 'low';
        let autoRecommendations = [];
        
        if (data.driving_frequency === 'daily') {
            autoRisk = 'medium';
            autoRecommendations.push('Consider higher liability limits due to daily driving exposure');
        }
        
        if (data.activities && data.activities.includes('commute_driving')) {
            autoRisk = 'medium';
            autoRecommendations.push('Long commutes increase accident risk - ensure adequate coverage');
        }

        if (data.vehicles_owned && data.vehicles_owned.includes('motorcycle')) {
            autoRisk = 'high';
            autoRecommendations.push('Motorcycle riding requires specialized coverage and safety gear');
        }

        categories.push({
            name: 'Auto Insurance Needs',
            level: autoRisk,
            description: this.getRiskDescription('auto', autoRisk, data),
            recommendations: autoRecommendations
        });

        // Home Risk Analysis
        let homeRisk = 'low';
        let homeRecommendations = [];

        if (data.housing_situation === 'own_home') {
            homeRisk = 'medium';
            if (data.property_features && data.property_features.includes('pool_spa')) {
                homeRisk = 'high';
                homeRecommendations.push('Pool/spa increases liability risk - consider umbrella coverage');
            }
            if (data.property_features && data.property_features.includes('trampoline')) {
                homeRecommendations.push('Trampolines create significant liability exposure');
            }
        } else if (data.housing_situation === 'rent_apartment' || data.housing_situation === 'rent_house') {
            homeRecommendations.push('Renters insurance is essential to protect personal belongings');
        }

        categories.push({
            name: 'Property Protection',
            level: homeRisk,
            description: this.getRiskDescription('home', homeRisk, data),
            recommendations: homeRecommendations
        });

        // Life Stage Risk Analysis
        let lifeRisk = 'low';
        let lifeRecommendations = [];

        if (data.dependents && parseInt(data.dependents) > 0) {
            lifeRisk = 'medium';
            lifeRecommendations.push('Dependents increase the need for life insurance protection');
            
            if (data.emergency_fund === 'none' || data.emergency_fund === 'under_1000') {
                lifeRisk = 'high';
                lifeRecommendations.push('Low emergency savings increases insurance needs');
            }
        }

        if (data.debt_level === 'high') {
            lifeRisk = 'high';
            lifeRecommendations.push('High debt levels require careful insurance planning');
        }

        categories.push({
            name: 'Financial Security',
            level: lifeRisk,
            description: this.getRiskDescription('life', lifeRisk, data),
            recommendations: lifeRecommendations
        });

        // Generate overall recommendations
        if (data.emergency_fund === 'none' || data.emergency_fund === 'under_1000') {
            overallRecommendations.push({
                title: 'Build Emergency Fund',
                description: 'Having 3-6 months of expenses saved allows you to choose higher deductibles and save on premiums.',
                priority: 'high'
            });
        }

        if (data.insurance_priority === 'lowest_cost') {
            overallRecommendations.push({
                title: 'Balance Cost with Protection',
                description: 'While cost is important, ensure you have adequate coverage. Consider increasing deductibles rather than reducing coverage limits.',
                priority: 'medium'
            });
        }

        // Add risk-specific recommendations
        const highRiskCategories = categories.filter(cat => cat.level === 'high');
        if (highRiskCategories.length > 0) {
            overallRecommendations.unshift({
                title: 'Address High-Risk Areas',
                description: `Your ${highRiskCategories.map(cat => cat.name.toLowerCase()).join(' and ')} ${highRiskCategories.length > 1 ? 'require' : 'requires'} immediate attention to ensure adequate protection.`,
                priority: 'high'
            });
        }

        overallRecommendations.push({
            title: 'Annual Coverage Review',
            description: 'Review your insurance annually or after major life changes to ensure your coverage keeps pace with your evolving needs.',
            priority: 'low'
        });

        return {
            categories,
            overallRecommendations: overallRecommendations.slice(0, 4) // Limit to 4 recommendations
        };
    },

    // Get risk description based on category and level
    getRiskDescription(category, level, data) {
        const descriptions = {
            auto: {
                low: 'Your driving habits and vehicle use suggest lower auto insurance risk.',
                medium: 'Your driving patterns indicate moderate risk that requires adequate coverage.',
                high: 'Your driving activities and vehicle types create elevated risk requiring comprehensive protection.'
            },
            home: {
                low: 'Your living situation presents minimal property-related risks.',
                medium: 'Your property and living situation require standard homeowner protections.',
                high: 'Your property features and assets create significant liability exposure requiring enhanced coverage.'
            },
            life: {
                low: 'Your current life stage suggests minimal additional insurance needs.',
                medium: 'Your family situation and financial obligations indicate moderate insurance needs.',
                high: 'Your dependents and financial situation require comprehensive protection planning.'
            }
        };

        return descriptions[category][level];
    },

    // Enhanced getQuestions method to handle new quiz types
    getQuestions() {
        switch (this.currentAnalyzer) {
            case 'auto': return this.autoQuestions;
            case 'home': return this.homeQuestions;
            case 'umbrella': return this.umbrellaQuestions;
            case 'risk_assessment': return this.riskAssessmentQuestions;
            case 'iq_quiz': return this.iqQuizQuestions;
            default: return [];
        }
    },

    // Enhanced handleNext for quiz types
    handleNext() {
        if (this.currentAnalyzer === 'iq_quiz') {
            this.currentStep++;
            this.loadIQQuizQuestion();
            return;
        }

        if (this.currentAnalyzer === 'risk_assessment') {
            if (!this.validateCurrentStep()) {
                this.showValidationErrors();
                return;
            }

            this.saveCurrentStepData();
            
            const questions = this.getQuestions();
            if (this.currentStep >= questions.length - 1) {
                this.showRiskAssessmentResults();
            } else {
                this.currentStep++;
                this.loadStep();
            }
            return;
        }

        // Default behavior for other analyzers
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

    // Enhanced handlePrevious for quiz types
    handlePrevious() {
        if (this.currentAnalyzer === 'iq_quiz') {
            if (this.currentStep > 0) {
                this.currentStep--;
                this.loadIQQuizQuestion();
            } else {
                this.startIQQuiz(); // Restart quiz
            }
            return;
        }

        if (this.currentAnalyzer === 'risk_assessment') {
            if (this.currentStep > 0) {
                this.currentStep--;
                this.loadStep();
                this.populateStoredData();
            } else {
                this.startRiskAssessment(); // Restart assessment
            }
            return;
        }

        // Default behavior
        if (this.currentStep > 0) {
            this.currentStep--;
            this.loadStep();
            this.populateStoredData();
        }
    }
});

// Add additional CSS styles for the Learning Center
const learningCenterStyles = `
    <style id="learning-center-styles">
        .iq-quiz-question {
            text-align: center;
            max-width: 600px;
            margin: 0 auto;
        }

        .question-header {
            margin-bottom: 30px;
        }

        .question-number {
            display: block;
            font-size: 14px;
            color: #64748b;
            margin-bottom: 15px;
            font-weight: 600;
        }

        .question-progress .progress-bar {
            height: 6px;
            background: #e9ecef;
            border-radius: 3px;
            overflow: hidden;
            margin: 0 auto;
            max-width: 300px;
        }

        .question-text {
            font-size: 24px;
            color: #2c3e50;
            margin-bottom: 40px;
            line-height: 1.4;
        }

        .quiz-options {
            display: flex;
            flex-direction: column;
            gap: 16px;
            margin-bottom: 30px;
        }

        .quiz-option {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 20px;
            background: #f8f9fa;
            border: 2px solid #e9ecef;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
        }

        .quiz-option:hover {
            background: #e9ecef;
            border-color: #0A61C9;
        }

        .quiz-option.selected {
            border-color: #0A61C9;
            background: rgba(10, 97, 201, 0.1);
        }

        .quiz-option.correct {
            border-color: #10b981;
            background: rgba(16, 185, 129, 0.1);
        }

        .quiz-option.incorrect {
            border-color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
        }

        .option-letter {
            flex-shrink: 0;
            width: 40px;
            height: 40px;
            background: #0A61C9;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 18px;
        }

        .quiz-option.correct .option-letter {
            background: #10b981;
        }

        .quiz-option.incorrect .option-letter {
            background: #ef4444;
        }

        .option-text {
            flex: 1;
            font-size: 16px;
            font-weight: 500;
            color: #2c3e50;
        }

        .quiz-explanation {
            background: linear-gradient(135deg, #f8f9fa 0%, #e6f3ff 100%);
            padding: 25px;
            border-radius: 12px;
            border-left: 4px solid #0A61C9;
            margin-top: 30px;
            animation: fadeInUp 0.5s ease;
        }

        .explanation-content h4 {
            color: #0A61C9;
            margin-bottom: 10px;
            font-size: 18px;
        }

        .explanation-content p {
            color: #2c3e50;
            line-height: 1.6;
            margin: 0;
        }

        .quiz-results {
            text-align: center;
            max-width: 600px;
            margin: 0 auto;
        }

        .score-circle {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            margin: 0 auto 30px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            font-weight: 700;
            color: white;
        }

        .score-circle.a-plus,
        .score-circle.a {
            background: linear-gradient(135deg, #10b981, #059669);
        }

        .score-circle.b {
            background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .score-circle.c,
        .score-circle.d {
            background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        .score-circle .grade {
            font-size: 32px;
            line-height: 1;
        }

        .score-circle .percentage {
            font-size: 16px;
            font-weight: 500;
        }

        .quiz-breakdown {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 12px;
            margin: 30px 0;
        }

        .quiz-breakdown h4 {
            color: #2c3e50;
            margin-bottom: 20px;
            text-align: center;
        }

        .question-results {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
            gap: 10px;
            max-width: 400px;
            margin: 0 auto;
        }

        .question-result {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
            padding: 10px;
            border-radius: 8px;
            font-size: 12px;
            font-weight: 600;
        }

        .question-result.correct {
            background: rgba(16, 185, 129, 0.1);
            color: #10b981;
        }

        .question-result.incorrect {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
        }

        .result-icon {
            font-size: 16px;
        }

        .recommendations-section {
            margin: 30px 0;
            text-align: left;
        }

        .recommendations-section h4 {
            text-align: center;
            color: #2c3e50;
            margin-bottom: 20px;
        }

        .quiz-cta {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 16px;
            margin-top: 30px;
        }

        .cta-buttons {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 20px;
        }

        .risk-assessment-results {
            max-width: 700px;
            margin: 0 auto;
        }

        .risk-categories {
            display: flex;
            flex-direction: column;
            gap: 25px;
            margin-bottom: 40px;
        }

        .risk-category {
            background: #ffffff;
            border: 1px solid #e9ecef;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .category-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 15px;
            flex-wrap: wrap;
            gap: 10px;
        }

        .category-header h4 {
            color: #2c3e50;
            margin: 0;
            font-size: 20px;
        }

        .risk-level {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
        }

        .risk-level.low {
            background: rgba(16, 185, 129, 0.1);
            color: #10b981;
        }

        .risk-level.medium {
            background: rgba(245, 158, 11, 0.1);
            color: #f59e0b;
        }

        .risk-level.high {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
        }

        .risk-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: currentColor;
        }

        .category-recommendations {
            margin: 15px 0 0 0;
            padding: 0;
            list-style: none;
        }

        .category-recommendations li {
            position: relative;
            padding-left: 25px;
            margin-bottom: 8px;
            color: #64748b;
            line-height: 1.5;
        }

        .category-recommendations li::before {
            content: '•';
            position: absolute;
            left: 0;
            color: #0A61C9;
            font-weight: bold;
        }

        .overall-recommendations {
            margin-bottom: 40px;
        }

        .overall-recommendations h4 {
            color: #2c3e50;
            margin-bottom: 25px;
            text-align: center;
        }

        .recommendation-item.priority-high {
            border-left-color: #ef4444;
        }

        .recommendation-item.priority-medium {
            border-left-color: #f59e0b;
        }

        .recommendation-item.priority-low {
            border-left-color: #10b981;
        }

        .recommendation-content h5 {
            color: #2c3e50;
            font-size: 18px;
            margin-bottom: 8px;
        }

        .risk-summary-cta {
            background: linear-gradient(135deg, #f8f9fa 0%, #e6f3ff 100%);
            padding: 30px;
            border-radius: 16px;
            text-align: center;
            border: 1px solid rgba(10, 97, 201, 0.1);
        }

        @media (max-width: 768px) {
            .question-text {
                font-size: 20px;
            }

            .quiz-option {
                padding: 16px;
            }

            .option-letter {
                width: 35px;
                height: 35px;
                font-size: 16px;
            }

            .option-text {
                font-size: 15px;
            }

            .score-circle {
                width: 100px;
                height: 100px;
            }

            .score-circle .grade {
                font-size: 28px;
            }

            .question-results {
                grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
            }

            .cta-buttons {
                flex-direction: column;
                align-items: center;
            }

            .cta-buttons .btn {
                width: 100%;
                max-width: 280px;
            }

            .category-header {
                flex-direction: column;
                align-items: flex-start;
            }
        }
    </style>
`;

// Add the styles to the head
document.head.insertAdjacentHTML('beforeend', learningCenterStyles);

// Create Learning Center section and insert it into the page
function addLearningCenterSection() {
    const learningCenterHTML = `
        <section id="learning-center" class="learning-center-section">
            <div class="container">
                <div class="section-header">
                    <h2>Interactive Learning Center</h2>
                    <p>Test your insurance knowledge and discover your personal risk profile with our educational tools</p>
                </div>
                <div class="learning-center-grid">
                    <div class="learning-tool-card">
                        <div class="tool-card__header">
                            <span class="tool-card__icon">🧠</span>
                            <h3>Insurance IQ Quiz</h3>
                        </div>
                        <p class="tool-card__description">Test your insurance knowledge with our fun, interactive quiz. Learn key concepts while discovering how much you really know about protecting your assets.</p>
                        <ul class="tool-card__features">
                            <li>15 expertly crafted questions</li>
                            <li>Instant feedback and explanations</li>
                            <li>Personalized score and recommendations</li>
                            <li>Shareable results</li>
                        </ul>
                        <button class="btn btn--primary" onclick="AnalyzerSystem.startIQQuiz()">
                            Take the Quiz
                            <svg class="icon-arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="learning-tool-card">
                        <div class="tool-card__header">
                            <span class="tool-card__icon">📊</span>
                            <h3>Personal Risk Assessment</h3>
                        </div>
                        <p class="tool-card__description">Get a comprehensive analysis of your personal risk factors and receive customized recommendations for your insurance needs.</p>
                        <ul class="tool-card__features">
                            <li>Lifestyle and activity analysis</li>
                            <li>Property and asset evaluation</li>
                            <li>Financial situation assessment</li>
                            <li>Personalized risk profile</li>
                        </ul>
                        <button class="btn btn--primary" onclick="AnalyzerSystem.startRiskAssessment()">
                            Start Assessment
                            <svg class="icon-arrow" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="learning-center-cta">
                    <p>Knowledge is power when it comes to insurance. Use these tools to become a more informed consumer and make better coverage decisions.</p>
                    <a href="tel:3368351993" class="btn btn--secondary">Questions? Call (336) 835-1993</a>
                </div>
            </div>
        </section>
    `;

    // Insert after the existing Interactive Coverage Analyzer section
    const analyzerSection = document.getElementById('coverage-analyzer');
    if (analyzerSection) {
        analyzerSection.insertAdjacentHTML('afterend', learningCenterHTML);
    }
}

// Add CSS styles for the Learning Center section
const learningCenterSectionStyles = `
    <style id="learning-center-section-styles">
        .learning-center-section {
            padding: 100px 0;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafb 100%);
            position: relative;
        }

        .learning-center-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(10, 97, 201, 0.2), transparent);
        }

        .learning-center-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 40px;
            margin-bottom: 60px;
        }

        .learning-tool-card {
            background: #ffffff;
            border: 2px solid transparent;
            border-radius: 20px;
            padding: 40px;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        }

        .learning-tool-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #0A61C9 0%, #10b981 100%);
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }

        .learning-tool-card:hover {
            border-color: #0A61C9;
            transform: translateY(-5px);
            box-shadow: 0 20px 40px rgba(10, 97, 201, 0.15);
        }

        .learning-tool-card:hover::before {
            transform: scaleX(1);
        }

        .tool-card__header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 20px;
        }

        .tool-card__icon {
            font-size: 36px;
        }

        .tool-card__header h3 {
            font-size: 24px;
            color: #13343b;
            margin: 0;
        }

        .tool-card__description {
            color: #626c71;
            line-height: 1.6;
            margin-bottom: 25px;
            font-size: 16px;
        }

        .tool-card__features {
            list-style: none;
            padding: 0;
            margin: 0 0 30px 0;
        }

        .tool-card__features li {
            position: relative;
            padding-left: 28px;
            margin-bottom: 12px;
            color: #626c71;
            line-height: 1.5;
        }

        .tool-card__features li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #0A61C9;
            font-weight: bold;
            font-size: 18px;
        }

        .learning-center-cta {
            text-align: center;
            padding: 40px;
            background: rgba(10, 97, 201, 0.05);
            border-radius: 16px;
            border: 1px solid rgba(10, 97, 201, 0.1);
        }

        .learning-center-cta p {
            font-size: 18px;
            color: #626c71;
            margin-bottom: 20px;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }

        @media (max-width: 768px) {
            .learning-center-section {
                padding: 60px 0;
            }
            
            .learning-center-grid {
                grid-template-columns: 1fr;
                gap: 30px;
                margin-bottom: 40px;
            }
            
            .learning-tool-card {
                padding: 30px;
            }
            
            .tool-card__header h3 {
                font-size: 20px;
            }

            .learning-center-cta {
                padding: 30px 20px;
            }

            .learning-center-cta p {
                font-size: 16px;
            }
        }
    </style>
`;

// Add section styles to head
document.head.insertAdjacentHTML('beforeend', learningCenterSectionStyles);

// Initialize the Learning Center when DOM is loaded
// COMMENTED OUT: This was creating a duplicate Learning Center section
// The Learning Center is already in the HTML, so we don't need to add it dynamically
/*
document.addEventListener('DOMContentLoaded', function() {
    // Add a small delay to ensure the existing analyzer system is fully loaded
    setTimeout(addLearningCenterSection, 100);
});
*/

console.log('Interactive Learning Center loaded successfully!');
