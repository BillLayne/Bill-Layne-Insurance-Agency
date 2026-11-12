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
    if (progressBar) {
        const progress = (currentStep / totalSteps) * 100;
        progressBar.style.width = `${progress}%`;
    }
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
    steps.forEach(s => s.classList.add('hidden'));

    const targetStep = document.querySelector(`[data-step="${step}"]`);
    if (targetStep) {
        targetStep.classList.remove('hidden');
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Validate current step
function validateCurrentStep() {
    const activeStep = document.querySelector('.form-step:not(.hidden)');
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
    const activeStep = document.querySelector('.form-step:not(.hidden)');
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
    if (scoreCircle) {
        scoreCircle.style.transition = 'stroke-dashoffset 0.8s ease';
        scoreCircle.style.strokeDashoffset = (351.86 * (1 - score / 100)).toFixed(2);
    }
    
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
    
    // Liability limits check (NC mandatory minimum is 50/100/50 under N.C.G.S. § 20-279.21)
    if (formData.liabilityLimits === 'below-nc-min') {
        score -= 30;
    } else if (formData.liabilityLimits === '50/100/50') {
        score -= 20;
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
        'below-nc-min': 50000,
        '50/100/50': 100000,
        '100/300/100': 300000,
        '250/500/250': 500000,
        '500/500/500': 500000
    };
    
    const netWorth = netWorthValue[formData.netWorth] || 100000;
    const liability = liabilityValue[formData.liabilityLimits] || 100000;
    
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
    
    if (formData.liabilityLimits === 'below-nc-min') {
        gaps.push('Legacy or out-of-state limits below 50/100/50 do not meet North Carolina mandatory auto liability minimums under N.C.G.S. § 20-279.21');
    } else if (formData.liabilityLimits === '50/100/50') {
        gaps.push('Carrying only the 50/100/50 NC state minimum can leave personal savings and home equity exposed in a multi-vehicle accident');
    }
    
    if (!formData.hasUninsured) {
        gaps.push('Verify your Uninsured and Underinsured Motorist (UM/UIM) limits match your bodily injury limits');
    }
    
    if (formData.vehicleValue !== '<5000' && !formData.hasCollision) {
        gaps.push('No collision coverage selected on a vehicle worth $5,000 or more');
    }
    
    if (formData.vehicleValue !== '<5000' && !formData.hasComprehensive) {
        gaps.push('No comprehensive coverage for deer strikes, hail, falling trees, glass, or theft');
    }
    
    const highNetWorth = ['250k-500k', '500k-1m', '1m+'].includes(formData.netWorth);
    const lowLiability = ['below-nc-min', '50/100/50', '100/300/100'].includes(formData.liabilityLimits);
    
    if (highNetWorth && lowLiability) {
        gaps.push('Your liability limits are below your household asset exposure — consider 250/500/100+ with a personal umbrella policy');
    }
    
    if (formData.primaryUse === 'rideshare' && !gaps.includes('rideshare')) {
        gaps.push('Standard personal auto policies exclude active rideshare periods without a rideshare endorsement');
    }
    
    return gaps.length > 0 ? gaps : ['No critical gaps identified — great job reviewing your NC auto coverage!'];
}

// Generate recommendations
function generateRecommendations() {
    const recommendations = [];
    
    // Liability recommendations
    const netWorthToLiability = {
        '<50k': '100/300/100 (above the 50/100/50 NC minimum)',
        '50k-100k': '100/300/100',
        '100k-250k': '100/300/100 or 250/500/100',
        '250k-500k': '250/500/250',
        '500k-1m': '250/500/250 plus a $1M personal umbrella',
        '1m+': '500/500/500 plus a $2M+ personal umbrella'
    };
    
    const recommendedLiability = netWorthToLiability[formData.netWorth] || '100/300/100';
    recommendations.push(`Based on your household profile, consider ${recommendedLiability} liability coverage`);
    
    // Deductible recommendations
    if (formData.deductible === '250' || formData.deductible === '500') {
        recommendations.push('Compare a $1,000 collision deductible alongside $500 if you keep an emergency reserve');
    }
    
    // Coverage recommendations
    if (!formData.hasUninsured) {
        recommendations.push('Keep NC Uninsured/Underinsured Motorist (UM/UIM) limits aligned with your bodily injury limits');
    }
    
    // Vehicle-specific recommendations
    const vehicleAge = new Date().getFullYear() - parseInt(formData.vehicleYear);
    if (vehicleAge > 12 && formData.vehicleValue === '<5000' && (formData.hasCollision || formData.hasComprehensive)) {
        recommendations.push('Compare physical damage premium cost against actual cash value on older paid-off vehicles');
    }
    
    return recommendations;
}

// Identify savings opportunities
function identifySavings() {
    const savings = [];
    
    savings.push('Compare multi-policy auto + home or renters bundle credits across appointed NC carriers');
    
    if (formData.cleanRecord) {
        savings.push('3-year clean NC Safe Driver Incentive Plan (SDIP) history helps qualify for preferred carrier tiers');
    }
    
    if (formData.annualMileage === '<5000' || formData.annualMileage === '5000-10000') {
        savings.push('Low-mileage or pleasure-use rating may apply when driving under 10,000 miles per year');
    }
    
    savings.push('Ask about paid-in-full, EFT autopay, and paperless billing credits');
    
    if (formData.deductible === '250' || formData.deductible === '500') {
        savings.push('Compare $500 vs. $1,000 deductibles side by side (rates and discounts vary by carrier and underwriting)');
    } else {
        savings.push('Shop multiple NC auto carriers side by side at renewal (rates vary by carrier and underwriting)');
    }
    
    return savings;
}

// Show results
function showResults() {
    const formEl = document.getElementById('autoCheckupForm');
    const resultsEl = document.getElementById('resultsSection');
    formEl.classList.add('hidden');
    formEl.style.display = 'none';
    resultsEl.classList.remove('hidden');
    resultsEl.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Start over
function startOver() {
    currentStep = 1;
    formData = {};
    const formEl = document.getElementById('autoCheckupForm');
    const resultsEl = document.getElementById('resultsSection');
    formEl.reset();
    formEl.classList.remove('hidden');
    formEl.style.display = 'block';
    resultsEl.classList.add('hidden');
    resultsEl.style.display = 'none';
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