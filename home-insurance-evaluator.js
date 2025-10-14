// Home Insurance Evaluator JavaScript

let currentStep = 1;
const totalSteps = 5;
let formData = {};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    populateYearDropdown();
    setupFormValidation();
    updateProgressBar();
});

// Populate year built dropdown
function populateYearDropdown() {
    const yearSelect = document.getElementById('yearBuilt');
    const currentYear = new Date().getFullYear();
    
    for (let year = currentYear; year >= 1900; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }
}

// Setup form validation
function setupFormValidation() {
    const form = document.getElementById('homeEvaluatorForm');
    const inputs = form.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        input.addEventListener('change', function() {
            if (this.validity.valid) {
                this.classList.remove('error');
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
    const replacementCost = calculateReplacementCost();
    const riskProfile = assessRiskProfile();
    
    // Display score
    const scoreCircle = document.getElementById('scoreCircle');
    const scoreNumber = document.getElementById('scoreNumber');
    const scoreMessage = document.getElementById('scoreMessage');
    
    scoreNumber.textContent = score;
    scoreCircle.style.setProperty('--score-deg', `${(score / 100) * 360}deg`);
    
    if (score >= 85) {
        scoreMessage.textContent = "Excellent coverage! Your home is well protected.";
    } else if (score >= 70) {
        scoreMessage.textContent = "Good coverage with some areas for improvement.";
    } else if (score >= 55) {
        scoreMessage.textContent = "Adequate coverage but significant gaps exist.";
    } else {
        scoreMessage.textContent = "Critical coverage gaps need immediate attention.";
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
    
    // Display replacement cost analysis
    document.getElementById('replacementAnalysis').innerHTML = replacementCost;
    
    // Display risk profile
    document.getElementById('riskProfile').innerHTML = riskProfile;
}

// Calculate coverage score
function calculateCoverageScore() {
    let score = 100;
    
    // Home age factor
    const homeAge = new Date().getFullYear() - parseInt(formData.yearBuilt);
    if (homeAge > 30) score -= 5;
    if (homeAge > 50) score -= 5;
    
    // Roof age factor
    if (formData.roofAge === '15-20') score -= 5;
    if (formData.roofAge === '20+') score -= 15;
    
    // Coverage adequacy check
    const homeValueRanges = {
        '<150k': 125000,
        '150k-250k': 200000,
        '250k-350k': 300000,
        '350k-500k': 425000,
        '500k-750k': 625000,
        '750k-1m': 875000,
        '1m+': 1250000
    };
    
    const dwellingRanges = {
        '<100k': 75000,
        '100k-200k': 150000,
        '200k-300k': 250000,
        '300k-400k': 350000,
        '400k-500k': 450000,
        '500k-750k': 625000,
        '750k+': 875000
    };
    
    const estimatedValue = homeValueRanges[formData.homeValue] || 250000;
    const dwellingCoverage = dwellingRanges[formData.dwellingCoverage] || 200000;
    
    // Check if dwelling coverage is adequate (should be at least 80% of replacement cost)
    const replacementCost = estimatedValue * 1.2; // Rough estimate
    if (dwellingCoverage < replacementCost * 0.8) {
        score -= 20;
    }
    
    // Personal property coverage check
    if (formData.personalProperty === '50') score -= 10;
    
    // Liability coverage check
    const netWorthToLiability = {
        '<100k': 100000,
        '100k-250k': 300000,
        '250k-500k': 500000,
        '500k-1m': 1000000,
        '1m-2m': 1000000,
        '2m+': 1000000
    };
    
    const recommendedLiability = netWorthToLiability[formData.netWorth] || 300000;
    const currentLiability = parseInt(formData.liabilityLimit) || 100000;
    
    if (currentLiability < recommendedLiability) {
        score -= 15;
    }
    
    // Critical coverage gaps
    if (!formData.hasWaterBackup) score -= 10;
    if (!formData.hasOrdinanceLaw && homeAge > 20) score -= 10;
    
    // Risk factors
    if (formData.hasPool && currentLiability < 500000) score -= 10;
    if (formData.hasTrampoline) score -= 5;
    if (formData.previousClaims === '2') score -= 10;
    if (formData.previousClaims === '3+') score -= 20;
    
    // Safety features boost
    if (formData.hasSecuritySystem) score += 5;
    if (formData.hasSmokeDetectors) score += 3;
    if (formData.updatedElectrical) score += 3;
    if (formData.updatedPlumbing) score += 3;
    
    return Math.max(0, Math.min(100, score));
}

// Identify coverage gaps
function identifyCoverageGaps() {
    const gaps = [];
    const homeAge = new Date().getFullYear() - parseInt(formData.yearBuilt);
    
    // Dwelling coverage check
    if (formData.dwellingCoverage === 'not-sure') {
        gaps.push('Unknown dwelling coverage amount - review your policy immediately');
    }
    
    // Water backup coverage
    if (!formData.hasWaterBackup) {
        gaps.push('No water backup coverage - one of the most common and expensive claims');
    }
    
    // Ordinance or law coverage for older homes
    if (!formData.hasOrdinanceLaw && homeAge > 20) {
        gaps.push('No ordinance/law coverage - critical for older homes that may need upgrades after a loss');
    }
    
    // Flood insurance
    if (!formData.hasFloodInsurance) {
        gaps.push('No flood insurance - standard policies exclude flood damage');
    }
    
    // Liability concerns
    if (formData.hasPool && !gaps.includes('pool')) {
        const liability = parseInt(formData.liabilityLimit) || 100000;
        if (liability < 500000) {
            gaps.push('Pool increases liability risk - current coverage may be insufficient');
        }
    }
    
    if (formData.hasBusinessUse) {
        gaps.push('Home business use may not be covered - consider business insurance');
    }
    
    if (formData.hasRental) {
        gaps.push('Rental activity requires special coverage - standard policies may exclude');
    }
    
    // Roof age concern
    if (formData.roofAge === '20+') {
        gaps.push('Roof over 20 years old - may face coverage limitations or higher deductibles');
    }
    
    // High-value home concerns
    const homeValue = {
        '<150k': 125000,
        '150k-250k': 200000,
        '250k-350k': 300000,
        '350k-500k': 425000,
        '500k-750k': 625000,
        '750k-1m': 875000,
        '1m+': 1250000
    };
    
    if (homeValue[formData.homeValue] > 500000 && formData.personalProperty !== '100') {
        gaps.push('High-value home may need increased personal property coverage');
    }
    
    return gaps.length > 0 ? gaps : ['No critical gaps identified - well done!'];
}

// Generate recommendations
function generateRecommendations() {
    const recommendations = [];
    const homeAge = new Date().getFullYear() - parseInt(formData.yearBuilt);
    
    // Dwelling coverage recommendations
    recommendations.push('Review dwelling coverage annually to ensure it keeps pace with construction costs');
    
    // Personal property recommendations
    if (formData.personalProperty === '50' || formData.personalProperty === '70') {
        recommendations.push('Consider increasing personal property coverage to 75-100% of dwelling');
    }
    
    // Liability recommendations based on net worth
    const liabilityRecommendations = {
        '<100k': 'Maintain at least $300,000 liability coverage',
        '100k-250k': 'Increase liability to $300,000-$500,000',
        '250k-500k': 'Consider $500,000 liability coverage',
        '500k-1m': 'Strongly recommend $1 million liability + umbrella policy',
        '1m-2m': 'Essential: $1 million liability + $1-2 million umbrella',
        '2m+': 'Critical: Maximum liability + $2-5 million umbrella policy'
    };
    
    recommendations.push(liabilityRecommendations[formData.netWorth] || 'Review liability limits with your agent');
    
    // Deductible recommendations
    if (formData.deductible === '500') {
        recommendations.push('Consider raising deductible to $1,000-$2,500 to reduce premiums');
    }
    
    // Age-specific recommendations
    if (homeAge > 15) {
        recommendations.push('Schedule professional inspections for roof, HVAC, electrical, and plumbing');
    }
    
    // Additional coverage recommendations
    if (!formData.hasWaterBackup) {
        recommendations.push('Add water backup coverage - typically costs $30-60/year');
    }
    
    if (!formData.hasIdentityTheft) {
        recommendations.push('Consider identity theft protection - increasingly important coverage');
    }
    
    // Risk mitigation
    if (formData.hasPool || formData.hasTrampoline) {
        recommendations.push('Install security features and maintain strict safety protocols to reduce liability');
    }
    
    return recommendations;
}

// Identify savings opportunities
function identifySavings() {
    const savings = [];
    
    savings.push('Bundle home with auto insurance for 15-25% discount');
    
    if (formData.hasSecuritySystem) {
        savings.push('Monitored security system discount applied - saving 5-20%');
    } else {
        savings.push('Install monitored security system for 5-20% discount');
    }
    
    if (formData.hasSmokeDetectors && formData.hasFireExtinguisher) {
        savings.push('Fire safety features qualify for additional discounts');
    }
    
    if (formData.updatedElectrical || formData.updatedPlumbing || formData.updatedHVAC) {
        savings.push('Updated systems may qualify for modernization discounts');
    }
    
    if (formData.deductible === '500' || formData.deductible === '1000') {
        savings.push('Raising deductible to $2,500 could save 15-30% on premiums');
    }
    
    const homeAge = new Date().getFullYear() - parseInt(formData.yearBuilt);
    if (homeAge < 10) {
        savings.push('Newer home discount may be available - verify with agent');
    }
    
    if (formData.previousClaims === '0') {
        savings.push('Claims-free discount earned - maintain for continued savings');
    }
    
    savings.push('Pay annually instead of monthly to save 5-8%');
    savings.push('Review coverage annually - avoid paying for unnecessary add-ons');
    
    if (formData.mortgageBalance === 'paid-off') {
        savings.push('No mortgage requirement - flexibility to adjust coverage and save');
    }
    
    return savings;
}

// Calculate replacement cost estimate
function calculateReplacementCost() {
    const sqftRanges = {
        '<1000': 900,
        '1000-1500': 1250,
        '1500-2000': 1750,
        '2000-2500': 2250,
        '2500-3000': 2750,
        '3000-4000': 3500,
        '4000+': 4500
    };
    
    const sqft = sqftRanges[formData.squareFootage] || 2000;
    const baseRate = formData.homeType === 'single-family' ? 150 : 
                    formData.homeType === 'townhouse' ? 130 :
                    formData.homeType === 'condo' ? 110 : 120;
    
    const estimatedCost = sqft * baseRate;
    const formattedCost = estimatedCost.toLocaleString();
    
    let analysis = `<p><strong>Estimated Replacement Cost:</strong></p>`;
    analysis += `<p class="cost-estimate">$${formattedCost}</p>`;
    analysis += `<p>Based on ${sqft} sq ft at $${baseRate}/sq ft for ${formData.homeType} in your area.</p>`;
    analysis += `<p><strong>Important:</strong> This is a rough estimate. Schedule a professional replacement cost appraisal for accurate coverage needs.</p>`;
    
    const dwellingRanges = {
        '<100k': 75000,
        '100k-200k': 150000,
        '200k-300k': 250000,
        '300k-400k': 350000,
        '400k-500k': 450000,
        '500k-750k': 625000,
        '750k+': 875000
    };
    
    const currentCoverage = dwellingRanges[formData.dwellingCoverage] || 200000;
    
    if (currentCoverage < estimatedCost * 0.8) {
        analysis += `<p style="color: #E74C3C;"><strong>Warning:</strong> Your current coverage appears to be less than 80% of replacement cost. This may result in penalties at claim time.</p>`;
    }
    
    return analysis;
}

// Assess risk profile
function assessRiskProfile() {
    let riskScore = 0;
    let profile = '<div class="risk-assessment">';
    
    // Age factors
    const homeAge = new Date().getFullYear() - parseInt(formData.yearBuilt);
    if (homeAge > 30) riskScore += 2;
    if (homeAge > 50) riskScore += 3;
    
    // Roof age
    if (formData.roofAge === '15-20') riskScore += 2;
    if (formData.roofAge === '20+') riskScore += 4;
    
    // Claims history
    if (formData.previousClaims === '1') riskScore += 2;
    if (formData.previousClaims === '2') riskScore += 4;
    if (formData.previousClaims === '3+') riskScore += 6;
    
    // Liability risks
    if (formData.hasPool) riskScore += 3;
    if (formData.hasTrampoline) riskScore += 2;
    if (formData.hasDog) riskScore += 1;
    if (formData.hasBusinessUse) riskScore += 2;
    if (formData.hasRental) riskScore += 3;
    
    // Mitigation factors
    if (formData.hasSecuritySystem) riskScore -= 1;
    if (formData.hasSmokeDetectors) riskScore -= 1;
    if (formData.updatedElectrical) riskScore -= 1;
    if (formData.updatedPlumbing) riskScore -= 1;
    
    // Determine risk level
    let riskLevel, riskClass;
    if (riskScore <= 3) {
        riskLevel = 'Low Risk';
        riskClass = 'risk-low';
        profile += '<p>Your property presents a favorable risk profile with good insurability.</p>';
    } else if (riskScore <= 8) {
        riskLevel = 'Moderate Risk';
        riskClass = 'risk-medium';
        profile += '<p>Your property has moderate risk factors that may affect premiums.</p>';
    } else {
        riskLevel = 'High Risk';
        riskClass = 'risk-high';
        profile += '<p>Multiple risk factors may lead to higher premiums or coverage restrictions.</p>';
    }
    
    profile += `<p><span class="risk-level ${riskClass}">${riskLevel}</span></p>`;
    
    // Key risk factors
    profile += '<p><strong>Key factors affecting your risk:</strong></p>';
    profile += '<ul style="margin-left: 20px;">';
    
    if (homeAge > 30) profile += '<li>Older home requires more maintenance</li>';
    if (formData.roofAge === '20+') profile += '<li>Aging roof increases claim likelihood</li>';
    if (formData.previousClaims !== '0') profile += '<li>Previous claims history</li>';
    if (formData.hasPool || formData.hasTrampoline) profile += '<li>Attractive nuisance liability risks</li>';
    if (formData.hasSecuritySystem) profile += '<li>Security system reduces risk (positive)</li>';
    
    profile += '</ul></div>';
    
    return profile;
}

// Show results
function showResults() {
    document.getElementById('homeEvaluatorForm').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Start over
function startOver() {
    currentStep = 1;
    formData = {};
    document.getElementById('homeEvaluatorForm').reset();
    document.getElementById('homeEvaluatorForm').style.display = 'block';
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
    const replacement = document.getElementById('replacementAnalysis').innerText;
    const risk = document.getElementById('riskProfile').innerText;
    
    const report = `
HOME INSURANCE EVALUATION REPORT
Generated: ${new Date().toLocaleDateString()}
Bill Layne Insurance - (336) 835-1993

COVERAGE SCORE: ${score}/100

PROPERTY INFORMATION:
- Type: ${formData.homeType}
- Year Built: ${formData.yearBuilt}
- Square Footage: ${formData.squareFootage}
- Roof Age: ${formData.roofAge}

COVERAGE GAPS & RISKS:
${gaps.map(gap => `• ${gap}`).join('\n')}

OUR RECOMMENDATIONS:
${recommendations.map(rec => `• ${rec}`).join('\n')}

POTENTIAL SAVINGS:
${savings.map(saving => `• ${saving}`).join('\n')}

REPLACEMENT COST ANALYSIS:
${replacement}

RISK PROFILE:
${risk}

NEXT STEPS:
1. Call Bill Layne Insurance at (336) 835-1993 for a comprehensive policy review
2. Gather your current policy documents for comparison
3. Schedule home inspections if recommended
4. Implement safety features to reduce risk and save money

This report is for informational purposes only and does not constitute insurance advice.
Please consult with a licensed insurance professional for personalized recommendations.
    `;
    
    // Create download
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `home-insurance-evaluation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}