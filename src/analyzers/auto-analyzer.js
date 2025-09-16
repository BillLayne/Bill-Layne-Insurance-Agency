/**
 * Auto Insurance Analyzer Module
 * Handles auto insurance coverage analysis and recommendations
 */

export const autoQuestions = [
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
];

/**
 * Analyze auto insurance coverage and provide recommendations
 * @param {Object} userData - User's answers to analyzer questions
 * @returns {Object} Analysis results and recommendations
 */
export function analyzeAutoCoverage(userData) {
    const recommendations = [];
    const risks = [];
    let riskScore = 0;

    // Analyze liability limits
    if (userData.liability_limits === '25_50_25') {
        recommendations.push({
            priority: 'high',
            category: 'Liability Coverage',
            message: 'Your liability limits are at state minimum. Consider increasing to at least $100k/$300k/$100k for better protection.',
            potentialSavings: 'Better coverage for only $10-20/month more'
        });
        riskScore += 3;
    }

    // Analyze deductible
    if (userData.deductible === '250') {
        recommendations.push({
            priority: 'medium',
            category: 'Deductible',
            message: 'Consider raising your deductible to $500 or $1,000 to lower your premium.',
            potentialSavings: 'Save $100-300/year'
        });
    }

    // Analyze vehicle value vs coverage
    if (userData.primary_vehicle_value === 'under_5k' && userData.deductible !== 'no_coverage') {
        recommendations.push({
            priority: 'high',
            category: 'Comprehensive/Collision',
            message: 'Your vehicle value may not justify comprehensive/collision coverage.',
            potentialSavings: 'Save $500-1,000/year'
        });
    }

    // Analyze additional coverages
    const additionalCoverages = userData.additional_coverage || [];
    if (!additionalCoverages.includes('uninsured_motorist')) {
        recommendations.push({
            priority: 'high',
            category: 'Uninsured Motorist',
            message: 'Add uninsured/underinsured motorist coverage for protection against uninsured drivers.',
            potentialSavings: 'Essential coverage for $50-100/year'
        });
        riskScore += 2;
    }

    // Calculate risk level
    let riskLevel = 'Low';
    if (riskScore >= 5) riskLevel = 'High';
    else if (riskScore >= 3) riskLevel = 'Medium';

    return {
        recommendations,
        risks,
        riskLevel,
        riskScore,
        summary: generateAutoSummary(userData, recommendations)
    };
}

/**
 * Generate a summary of the auto insurance analysis
 * @param {Object} userData - User's answers
 * @param {Array} recommendations - Generated recommendations
 * @returns {String} Summary text
 */
function generateAutoSummary(userData, recommendations) {
    const vehicleCount = userData.vehicle_count || 1;
    const highPriorityCount = recommendations.filter(r => r.priority === 'high').length;
    
    let summary = `Based on your analysis of ${vehicleCount} vehicle${vehicleCount > 1 ? 's' : ''}, `;
    
    if (highPriorityCount > 0) {
        summary += `we found ${highPriorityCount} important area${highPriorityCount > 1 ? 's' : ''} that need attention. `;
    } else {
        summary += 'your coverage appears to be well-balanced. ';
    }
    
    const totalSavings = calculatePotentialSavings(recommendations);
    if (totalSavings > 0) {
        summary += `You could potentially save up to $${totalSavings}/year by optimizing your coverage.`;
    }
    
    return summary;
}

/**
 * Calculate total potential savings from recommendations
 * @param {Array} recommendations - List of recommendations
 * @returns {Number} Total potential savings
 */
function calculatePotentialSavings(recommendations) {
    let totalSavings = 0;
    
    recommendations.forEach(rec => {
        const savingsMatch = rec.potentialSavings?.match(/\$(\d+)/);
        if (savingsMatch) {
            totalSavings += parseInt(savingsMatch[1]);
        }
    });
    
    return totalSavings;
}

export default {
    questions: autoQuestions,
    analyze: analyzeAutoCoverage
};