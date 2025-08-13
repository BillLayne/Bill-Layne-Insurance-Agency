// Auto Coverage Checkup JavaScript

let currentStep = 1;
const totalSteps = 5;
let formData = {};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    populateYearDropdown();
    setupFormValidation();
    updateProgressBar();
});

// Populate vehicle year dropdown
function populateYearDropdown() {
    const yearSelect = document.getElementById('vehicleYear');
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear + 1; year >= currentYear - 20; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

// Setup form validation
function setupFormValidation() {
    const form = document.getElementById('autoCheckupForm');
    const inputs = form.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        input.addEventListener('change', function() {
            if (this.validity.valid) {
                this.classList.remove('error');
            }
        });
    });
    
    // Handle clean record checkbox
    const cleanRecord = document.getElementById('cleanRecord');
    const otherCheckboxes = ['hasAccidents', 'hasTickets', 'hasClaims', 'hasDUI'];
    
    cleanRecord.addEventListener('change', function() {
        if (this.checked) {
            otherCheckboxes.forEach(id => {
                document.getElementById(id).checked = false;
            });
        }
    });
    
    otherCheckboxes.forEach(id => {
        document.getElementById(id).addEventListener('change', function() {
            if (this.checked) {
                cleanRecord.checked = false;
            }
        });
    });
}

// Update progress bar
function updateProgressBar() {
    const progressBar = document.getElementById('progressBar');
    const progress = (currentStep / totalSteps) * 100;
    progressBar.style.width = `${progress}%`;
}

// Navigate to next step
function nextStep() {
    if (validateCurrentStep()) {
        saveStepData();
        currentStep++;
        showStep(currentStep);
        updateProgressBar();
    }
}

// Navigate to previous step
function previousStep() {
    currentStep--;
    showStep(currentStep);
    updateProgressBar();
}

// Show specific step
function showStep(step) {
    const steps = document.querySelectorAll('.form-step');
    steps.forEach(s => s.classList.remove('active'));
    
    const targetStep = document.querySelector(`[data-step="${step}"]`);
    if (targetStep) {
        targetStep.classList.add('active');
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Validate current step
function validateCurrentStep() {
    const activeStep = document.querySelector('.form-step.active');
    const requiredFields = activeStep.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value) {
            field.classList.add('error');
            isValid = false;
        } else {
            field.classList.remove('error');
        }
    });
    
    if (!isValid) {
        alert('Please fill in all required fields.');
    }
    
    return isValid;
}

// Save step data
function saveStepData() {
    const activeStep = document.querySelector('.form-step.active');
    const inputs = activeStep.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        if (input.type === 'checkbox') {
            formData[input.name || input.id] = input.checked;
        } else {
            formData[input.name || input.id] = input.value;
        }
    });
}

// Generate report
function generateReport() {
    if (validateCurrentStep()) {
        saveStepData();
        analyzeData();
        showResults();
    }
}

// Analyze form data and generate recommendations
function analyzeData() {
    const score = calculateCoverageScore();
    const gaps = identifyCoverageGaps();
    const recommendations = generateRecommendations();
    const savings = identifySavings();
    
    // Display score
    const scoreCircle = document.getElementById('scoreCircle');
    const scoreNumber = document.getElementById('scoreNumber');
    const scoreMessage = document.getElementById('scoreMessage');
    
    scoreNumber.textContent = score;
    scoreCircle.style.setProperty('--score-deg', `${(score / 100) * 360}deg`);
    
    if (score >= 80) {
        scoreMessage.textContent = "Excellent coverage! You're well protected.";
    } else if (score >= 60) {
        scoreMessage.textContent = "Good coverage with room for improvement.";
    } else if (score >= 40) {
        scoreMessage.textContent = "Your coverage needs attention.";
    } else {
        scoreMessage.textContent = "Critical gaps in your coverage identified.";
    }
    
    // Display gaps
    const gapsList = document.getElementById('coverageGaps');
    gapsList.innerHTML = gaps.map(gap => `<li>${gap}</li>`).join('');
    
    // Display recommendations
    const recList = document.getElementById('recommendations');
    recList.innerHTML = recommendations.map(rec => `<li>${rec}</li>`).join('');
    
    // Display savings
    const savingsList = document.getElementById('savingsOpportunities');
    savingsList.innerHTML = savings.map(saving => `<li>${saving}</li>`).join('');
}

// Calculate coverage score
function calculateCoverageScore() {
    let score = 100;
    
    // Liability limits check
    if (formData.liabilityLimits === 'state-minimum') {
        score -= 30;
    } else if (formData.liabilityLimits === '25/50/25') {
        score -= 20;
    } else if (formData.liabilityLimits === '50/100/50') {
        score -= 10;
    } else if (formData.liabilityLimits === 'not-sure') {
        score -= 15;
    }
    
    // Coverage types check
    if (!formData.hasUninsured) score -= 15;
    if (!formData.hasCollision && formData.vehicleValue !== '<5000') score -= 10;
    if (!formData.hasComprehensive && formData.vehicleValue !== '<5000') score -= 10;
    
    // Financial protection check
    const netWorthValue = {
        '<50k': 50000,
        '50k-100k': 75000,
        '100k-250k': 175000,
        '250k-500k': 375000,
        '500k-1m': 750000,
        '1m+': 1500000
    };
    
    const liabilityValue = {
        'state-minimum': 25000,
        '25/50/25': 50000,
        '50/100/50': 100000,
        '100/300/100': 300000,
        '250/500/250': 500000,
        '500/500/500': 500000
    };
    
    const netWorth = netWorthValue[formData.netWorth] || 100000;
    const liability = liabilityValue[formData.liabilityLimits] || 50000;
    
    if (liability < netWorth * 0.5) {
        score -= 20;
    }
    
    // Driving history
    if (formData.hasAccidents) score -= 5;
    if (formData.hasTickets) score -= 5;
    if (formData.hasDUI) score -= 15;
    
    return Math.max(0, Math.min(100, score));
}

// Identify coverage gaps
function identifyCoverageGaps() {
    const gaps = [];
    
    if (formData.liabilityLimits === 'state-minimum' || formData.liabilityLimits === '25/50/25') {
        gaps.push('Your liability limits are dangerously low for protecting your assets');
    }
    
    if (!formData.hasUninsured) {
        gaps.push('No uninsured/underinsured motorist coverage leaves you vulnerable');
    }
    
    if (formData.vehicleValue !== '<5000' && !formData.hasCollision) {
        gaps.push('No collision coverage on a valuable vehicle');
    }
    
    if (formData.vehicleValue !== '<5000' && !formData.hasComprehensive) {
        gaps.push('No comprehensive coverage for theft, vandalism, or weather damage');
    }
    
    const highNetWorth = ['250k-500k', '500k-1m', '1m+'].includes(formData.netWorth);
    const lowLiability = ['state-minimum', '25/50/25', '50/100/50'].includes(formData.liabilityLimits);
    
    if (highNetWorth && lowLiability) {
        gaps.push('Your liability coverage is insufficient for your asset level - consider umbrella policy');
    }
    
    if (formData.primaryUse === 'rideshare' && !gaps.includes('rideshare')) {
        gaps.push('Standard policies may not cover rideshare activities - specialized coverage needed');
    }
    
    return gaps.length > 0 ? gaps : ['No critical gaps identified - great job!'];
}

// Generate recommendations
function generateRecommendations() {
    const recommendations = [];
    
    // Liability recommendations
    const netWorthToLiability = {
        '<50k': '50/100/50',
        '50k-100k': '100/300/100',
        '100k-250k': '100/300/100',
        '250k-500k': '250/500/250',
        '500k-1m': '250/500/250 plus $1M umbrella',
        '1m+': '500/500/500 plus $2M+ umbrella'
    };
    
    const recommendedLiability = netWorthToLiability[formData.netWorth];
    recommendations.push(`Based on your assets, we recommend ${recommendedLiability} liability coverage`);
    
    // Deductible recommendations
    if (formData.deductible === '250' || formData.deductible === '500') {
        recommendations.push('Consider raising your deductible to $1,000 to save on premiums');
    }
    
    // Coverage recommendations
    if (!formData.hasUninsured) {
        recommendations.push('Add uninsured/underinsured motorist coverage matching your liability limits');
    }
    
    // Vehicle-specific recommendations
    const vehicleAge = new Date().getFullYear() - parseInt(formData.vehicleYear);
    if (vehicleAge > 10 && (formData.hasCollision || formData.hasComprehensive)) {
        recommendations.push('Consider dropping collision/comprehensive on older vehicles to save money');
    }
    
    return recommendations;
}

// Identify savings opportunities
function identifySavings() {
    const savings = [];
    
    savings.push('Bundle auto with home insurance for up to 25% discount');
    
    if (formData.cleanRecord) {
        savings.push('Your clean driving record qualifies you for safe driver discounts');
    }
    
    if (formData.annualMileage === '<5000' || formData.annualMileage === '5000-10000') {
        savings.push('Low mileage discount available for driving less than 10,000 miles/year');
    }
    
    savings.push('Pay-in-full discount can save 5-10% vs monthly payments');
    savings.push('Defensive driving course completion can save 5-15%');
    
    if (formData.deductible === '250' || formData.deductible === '500') {
        savings.push('Raising deductible from $500 to $1,000 could save $200-400/year');
    }
    
    return savings;
}

// Show results
function showResults() {
    document.getElementById('autoCheckupForm').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Start over
function startOver() {
    currentStep = 1;
    formData = {};
    document.getElementById('autoCheckupForm').reset();
    document.getElementById('autoCheckupForm').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    showStep(1);
    updateProgressBar();
}

// Download report
function downloadReport() {
    const score = document.getElementById('scoreNumber').textContent;
    const gaps = Array.from(document.querySelectorAll('#coverageGaps li')).map(li => li.textContent);
    const recommendations = Array.from(document.querySelectorAll('#recommendations li')).map(li => li.textContent);
    const savings = Array.from(document.querySelectorAll('#savingsOpportunities li')).map(li => li.textContent);
    
    const report = `
AUTO COVERAGE CHECKUP REPORT
Generated: ${new Date().toLocaleDateString()}
Bill Layne Insurance - (336) 835-1993

COVERAGE SCORE: ${score}/100

COVERAGE GAPS IDENTIFIED:
${gaps.map(gap => `• ${gap}`).join('\n')}

OUR RECOMMENDATIONS:
${recommendations.map(rec => `• ${rec}`).join('\n')}

POTENTIAL SAVINGS:
${savings.map(saving => `• ${saving}`).join('\n')}

NEXT STEPS:
1. Call Bill Layne Insurance at (336) 835-1993 for a personalized quote
2. Review your current policy documents
3. Consider the recommended coverage changes
4. Ask about available discounts

This report is for informational purposes only and does not constitute insurance advice.
Please consult with a licensed insurance professional for personalized recommendations.
    `;
    
    // Create download
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auto-coverage-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Add error class styles
const style = document.createElement('style');
style.textContent = `
    input.error, select.error {
        border-color: #E74C3C !important;
    }
`;
document.head.appendChild(style);