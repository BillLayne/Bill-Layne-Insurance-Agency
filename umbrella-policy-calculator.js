// Umbrella Policy Calculator JavaScript

let currentStep = 1;
const totalSteps = 4;
let formData = {};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    setupFormValidation();
    updateProgressBar();
});

// Setup form validation
function setupFormValidation() {
    const form = document.getElementById('umbrellaCalculatorForm');
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

// Calculate risk and generate report
function calculateRisk() {
    if (validateCurrentStep()) {
        saveStepData();
        analyzeRisk();
        showResults();
    }
}

// Analyze risk and generate recommendations
function analyzeRisk() {
    // Calculate total assets
    const totalAssets = calculateTotalAssets();
    
    // Calculate current coverage
    const currentCoverage = calculateCurrentCoverage();
    
    // Calculate risk score
    const riskScore = calculateRiskScore();
    
    // Determine recommended umbrella amount
    const recommendedAmount = calculateRecommendedAmount(totalAssets, riskScore);
    
    // Calculate coverage gap
    const coverageGap = Math.max(0, totalAssets - currentCoverage);
    
    // Display risk meter
    displayRiskMeter(riskScore);
    
    // Display exposure amount
    displayExposure(totalAssets);
    
    // Display coverage gap
    displayCoverageGap(coverageGap, currentCoverage, totalAssets);
    
    // Display recommendation
    displayRecommendation(recommendedAmount, totalAssets, riskScore);
    
    // Display risk factors
    displayRiskFactors();
    
    // Display cost estimate
    displayCostEstimate(recommendedAmount, riskScore);
    
    // Display scenarios
    displayScenarios();
}

// Calculate total assets
function calculateTotalAssets() {
    const homeValue = parseInt(formData.homeValue) || 0;
    const mortgageBalance = parseInt(formData.mortgageBalance) || 0;
    const homeEquity = Math.max(0, homeValue - mortgageBalance);
    
    const savings = parseInt(formData.savingsInvestments) || 0;
    const otherAssets = parseInt(formData.otherAssets) || 0;
    
    const annualIncome = parseInt(formData.annualIncome) || 0;
    const yearsToRetirement = parseInt(formData.yearsToRetirement) || 0;
    const futureEarnings = Math.min(annualIncome * yearsToRetirement * 0.3, 2000000); // Conservative estimate
    
    return homeEquity + savings + otherAssets + futureEarnings;
}

// Calculate current coverage
function calculateCurrentCoverage() {
    const autoLiability = parseInt(formData.autoLiability) || 0;
    const homeLiability = parseInt(formData.homeLiability) || 0;
    const currentUmbrella = parseInt(formData.currentUmbrella) || 0;
    
    // Use the highest base coverage plus umbrella
    return Math.max(autoLiability, homeLiability) + currentUmbrella;
}

// Calculate risk score
function calculateRiskScore() {
    let score = 0;
    
    // Income-based risk
    const income = parseInt(formData.annualIncome) || 0;
    if (income > 200000) score += 20;
    else if (income > 150000) score += 15;
    else if (income > 100000) score += 10;
    else if (income > 75000) score += 5;
    
    // Professional risk
    if (formData.profession === 'professional') score += 15;
    else if (formData.profession === 'executive') score += 10;
    else if (formData.profession === 'business-owner') score += 20;
    else if (formData.profession === 'public-figure') score += 25;
    
    // Property risks
    if (formData.hasPool) score += 15;
    if (formData.hasTrampoline) score += 10;
    if (formData.hasDog) score += 8;
    if (formData.hasTeenDriver) score += 20;
    if (formData.hasBoat) score += 12;
    if (formData.hasRental) score += 15;
    if (formData.hasATV) score += 10;
    
    // Activity risks
    if (formData.entertainFrequently) score += 5;
    if (formData.volunteerWork) score += 8;
    if (formData.socialMedia) score += 5;
    if (formData.longCommute) score += 5;
    if (formData.homeBusiness) score += 10;
    
    return Math.min(100, score);
}

// Calculate recommended umbrella amount
function calculateRecommendedAmount(totalAssets, riskScore) {
    let baseRecommendation = 0;
    
    // Base on total assets
    if (totalAssets < 500000) {
        baseRecommendation = 1000000;
    } else if (totalAssets < 1000000) {
        baseRecommendation = 2000000;
    } else if (totalAssets < 2000000) {
        baseRecommendation = 3000000;
    } else if (totalAssets < 5000000) {
        baseRecommendation = 5000000;
    } else {
        baseRecommendation = 10000000;
    }
    
    // Adjust based on risk score
    if (riskScore > 70 && baseRecommendation < 5000000) {
        baseRecommendation = Math.min(baseRecommendation * 2, 5000000);
    } else if (riskScore > 50 && baseRecommendation < 3000000) {
        baseRecommendation = Math.min(baseRecommendation * 1.5, 3000000);
    }
    
    // Subtract current umbrella coverage
    const currentUmbrella = parseInt(formData.currentUmbrella) || 0;
    return Math.max(baseRecommendation - currentUmbrella, 0);
}

// Display risk meter
function displayRiskMeter(riskScore) {
    const riskMeterFill = document.getElementById('riskMeterFill');
    const riskLevelText = document.getElementById('riskLevelText');
    
    riskMeterFill.style.width = `${riskScore}%`;
    
    let riskLevel, riskMessage;
    if (riskScore < 25) {
        riskLevel = 'Low Risk';
        riskMessage = 'Your liability risk is relatively low, but umbrella coverage is still recommended for asset protection.';
    } else if (riskScore < 50) {
        riskLevel = 'Moderate Risk';
        riskMessage = 'You have moderate liability exposure. Umbrella coverage is strongly recommended.';
    } else if (riskScore < 75) {
        riskLevel = 'High Risk';
        riskMessage = 'Your liability risk is high. Umbrella coverage is essential for protecting your assets.';
    } else {
        riskLevel = 'Critical Risk';
        riskMessage = 'You have critical liability exposure. Substantial umbrella coverage is urgently needed.';
    }
    
    riskLevelText.innerHTML = `<strong>${riskLevel}</strong><br>${riskMessage}`;
}

// Display exposure amount
function displayExposure(totalAssets) {
    const exposureAmount = document.getElementById('exposureAmount');
    const exposureBreakdown = document.getElementById('exposureBreakdown');
    
    exposureAmount.textContent = `$${totalAssets.toLocaleString()}`;
    
    const homeValue = parseInt(formData.homeValue) || 0;
    const mortgageBalance = parseInt(formData.mortgageBalance) || 0;
    const homeEquity = Math.max(0, homeValue - mortgageBalance);
    const savings = parseInt(formData.savingsInvestments) || 0;
    const otherAssets = parseInt(formData.otherAssets) || 0;
    const annualIncome = parseInt(formData.annualIncome) || 0;
    const yearsToRetirement = parseInt(formData.yearsToRetirement) || 0;
    const futureEarnings = Math.min(annualIncome * yearsToRetirement * 0.3, 2000000);
    
    let breakdown = '<strong>Asset Breakdown:</strong><br>';
    if (homeEquity > 0) breakdown += `• Home Equity: $${homeEquity.toLocaleString()}<br>`;
    if (savings > 0) breakdown += `• Savings & Investments: $${savings.toLocaleString()}<br>`;
    if (otherAssets > 0) breakdown += `• Other Assets: $${otherAssets.toLocaleString()}<br>`;
    if (futureEarnings > 0) breakdown += `• Future Earnings Potential: $${futureEarnings.toLocaleString()}<br>`;
    
    exposureBreakdown.innerHTML = breakdown;
}

// Display coverage gap
function displayCoverageGap(gap, currentCoverage, totalAssets) {
    const gapAmount = document.getElementById('gapAmount');
    const gapDescription = document.getElementById('gapDescription');
    const coverageVisual = document.getElementById('coverageVisual');
    
    if (gap > 0) {
        gapAmount.textContent = `$${gap.toLocaleString()}`;
        gapAmount.style.color = '#E74C3C';
        gapDescription.textContent = 'Your assets exceed your current liability coverage';
    } else {
        gapAmount.textContent = 'No Gap';
        gapAmount.style.color = '#27AE60';
        gapDescription.textContent = 'Your current coverage exceeds your total assets';
    }
    
    // Create visual representation
    const coveragePercent = Math.min(100, (currentCoverage / totalAssets) * 100);
    coverageVisual.innerHTML = `
        <div style="background: #E0E6ED; height: 30px; border-radius: 15px; overflow: hidden;">
            <div style="background: ${gap > 0 ? '#E74C3C' : '#27AE60'}; width: ${coveragePercent}%; height: 100%; transition: width 1s ease;"></div>
        </div>
        <p style="margin-top: 0.5rem; color: #5D6D7E;">Current coverage: ${coveragePercent.toFixed(0)}% of total assets</p>
    `;
}

// Display recommendation
function displayRecommendation(recommendedAmount, totalAssets, riskScore) {
    const recommendedAmountEl = document.getElementById('recommendedAmount');
    const recommendationText = document.getElementById('recommendationText');
    const recommendationReasons = document.getElementById('recommendationReasons');
    
    const totalRecommended = recommendedAmount + (parseInt(formData.currentUmbrella) || 0);
    
    if (recommendedAmount === 0 && formData.currentUmbrella !== '0') {
        recommendedAmountEl.textContent = 'Current Coverage Adequate';
        recommendedAmountEl.style.color = '#27AE60';
        recommendationText.textContent = 'Your current umbrella policy appears sufficient for your needs.';
    } else {
        recommendedAmountEl.textContent = `$${totalRecommended.toLocaleString()}`;
        recommendationText.textContent = recommendedAmount > 0 ? 
            'Additional umbrella coverage recommended' : 
            'Umbrella policy strongly recommended';
    }
    
    // Generate reasons
    const reasons = [];
    
    if (totalAssets > 500000) {
        reasons.push(`Your total assets of $${totalAssets.toLocaleString()} require substantial protection`);
    }
    
    if (riskScore > 50) {
        reasons.push('Your high-risk factors increase liability exposure');
    }
    
    if (formData.hasTeenDriver) {
        reasons.push('Teen drivers significantly increase accident risk');
    }
    
    if (formData.hasPool || formData.hasTrampoline) {
        reasons.push('Attractive nuisances on property increase liability');
    }
    
    if (parseInt(formData.annualIncome) > 150000) {
        reasons.push('High income makes you a target for larger lawsuits');
    }
    
    if (formData.profession === 'professional' || formData.profession === 'executive') {
        reasons.push('Your professional status increases lawsuit risk');
    }
    
    recommendationReasons.innerHTML = reasons.map(reason => `<li>${reason}</li>`).join('');
}

// Display risk factors
function displayRiskFactors() {
    const factorsList = document.getElementById('factorsList');
    const factors = [];
    
    // Add risk factors with impact levels
    if (formData.hasTeenDriver) factors.push({ name: 'Teen Driver', impact: 'high' });
    if (formData.hasPool) factors.push({ name: 'Swimming Pool', impact: 'high' });
    if (formData.hasRental) factors.push({ name: 'Rental Property', impact: 'high' });
    if (formData.profession === 'business-owner') factors.push({ name: 'Business Owner', impact: 'high' });
    
    if (formData.hasBoat) factors.push({ name: 'Boat Owner', impact: 'medium' });
    if (formData.hasTrampoline) factors.push({ name: 'Trampoline', impact: 'medium' });
    if (formData.hasATV) factors.push({ name: 'ATV/Motorcycle', impact: 'medium' });
    if (formData.homeBusiness) factors.push({ name: 'Home Business', impact: 'medium' });
    
    if (formData.hasDog) factors.push({ name: 'Dog Owner', impact: 'low' });
    if (formData.entertainFrequently) factors.push({ name: 'Frequent Entertaining', impact: 'low' });
    if (formData.volunteerWork) factors.push({ name: 'Volunteer Work', impact: 'low' });
    if (formData.socialMedia) factors.push({ name: 'Social Media Activity', impact: 'low' });
    
    if (factors.length === 0) {
        factors.push({ name: 'No significant risk factors identified', impact: 'low' });
    }
    
    factorsList.innerHTML = factors.map(factor => `
        <div class="factor-item">
            <span class="factor-name">${factor.name}</span>
            <span class="factor-impact impact-${factor.impact}">${factor.impact.charAt(0).toUpperCase() + factor.impact.slice(1)} Risk</span>
        </div>
    `).join('');
}

// Display cost estimate
function displayCostEstimate(recommendedAmount, riskScore) {
    const costRange = document.getElementById('costRange');
    const totalRecommended = recommendedAmount + (parseInt(formData.currentUmbrella) || 0);
    
    // Estimate cost based on coverage amount and risk
    let baseCost = 0;
    if (totalRecommended <= 1000000) baseCost = 200;
    else if (totalRecommended <= 2000000) baseCost = 375;
    else if (totalRecommended <= 3000000) baseCost = 525;
    else if (totalRecommended <= 5000000) baseCost = 800;
    else baseCost = 1200;
    
    // Adjust for risk factors
    const riskMultiplier = 1 + (riskScore / 100) * 0.5;
    const lowEstimate = Math.round(baseCost * 0.8 * riskMultiplier);
    const highEstimate = Math.round(baseCost * 1.3 * riskMultiplier);
    
    costRange.textContent = `$${lowEstimate} - $${highEstimate}`;
}

// Display scenarios
function displayScenarios() {
    const scenariosGrid = document.getElementById('scenariosGrid');
    const scenarios = [];
    
    // Add relevant scenarios based on risk factors
    if (formData.hasTeenDriver) {
        scenarios.push({
            title: 'Teen Driver Accident',
            description: 'Your teen causes a serious accident with multiple injuries. Medical bills and lawsuits exceed $2 million.'
        });
    }
    
    if (formData.hasPool) {
        scenarios.push({
            title: 'Pool Accident',
            description: 'A guest is seriously injured diving into your pool. Lifetime medical care costs exceed $1.5 million.'
        });
    }
    
    if (formData.hasDog) {
        scenarios.push({
            title: 'Dog Bite Incident',
            description: 'Your dog bites a neighbor\'s child requiring surgery. Medical bills and lawsuit total $500,000.'
        });
    }
    
    // Add general scenarios
    scenarios.push({
        title: 'Auto Accident',
        description: 'You cause a multi-vehicle accident. Several people are injured with damages exceeding $1 million.'
    });
    
    scenarios.push({
        title: 'Defamation Lawsuit',
        description: 'A social media post leads to a defamation lawsuit. Legal defense and damages total $750,000.'
    });
    
    if (formData.entertainFrequently || scenarios.length < 3) {
        scenarios.push({
            title: 'Guest Injury',
            description: 'A guest falls at your home and suffers permanent injury. Lawsuit awards $800,000 in damages.'
        });
    }
    
    // Display first 4 scenarios
    scenariosGrid.innerHTML = scenarios.slice(0, 4).map(scenario => `
        <div class="scenario-item">
            <div class="scenario-title">${scenario.title}</div>
            <div class="scenario-description">${scenario.description}</div>
        </div>
    `).join('');
}

// Show results
function showResults() {
    document.getElementById('umbrellaCalculatorForm').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Start over
function startOver() {
    currentStep = 1;
    formData = {};
    document.getElementById('umbrellaCalculatorForm').reset();
    document.getElementById('umbrellaCalculatorForm').style.display = 'block';
    document.getElementById('resultsSection').style.display = 'none';
    showStep(1);
    updateProgressBar();
}

// Download report
function downloadReport() {
    const totalAssets = calculateTotalAssets();
    const currentCoverage = calculateCurrentCoverage();
    const riskScore = calculateRiskScore();
    const recommendedAmount = calculateRecommendedAmount(totalAssets, riskScore);
    const totalRecommended = recommendedAmount + (parseInt(formData.currentUmbrella) || 0);
    
    const report = `
UMBRELLA POLICY ANALYSIS REPORT
Generated: ${new Date().toLocaleDateString()}
Bill Layne Insurance - (336) 835-1993

EXECUTIVE SUMMARY
Total Assets at Risk: $${totalAssets.toLocaleString()}
Current Total Coverage: $${currentCoverage.toLocaleString()}
Coverage Gap: $${Math.max(0, totalAssets - currentCoverage).toLocaleString()}
Risk Score: ${riskScore}/100
Recommended Umbrella Coverage: $${totalRecommended.toLocaleString()}

ASSET BREAKDOWN
- Home Equity: $${(Math.max(0, parseInt(formData.homeValue) - parseInt(formData.mortgageBalance))).toLocaleString()}
- Savings & Investments: $${parseInt(formData.savingsInvestments).toLocaleString()}
- Other Assets: $${parseInt(formData.otherAssets).toLocaleString()}
- Future Earnings Potential: Included in analysis

CURRENT COVERAGE
- Auto Liability: $${parseInt(formData.autoLiability).toLocaleString()}
- Home Liability: $${parseInt(formData.homeLiability).toLocaleString()}
- Current Umbrella: $${parseInt(formData.currentUmbrella).toLocaleString()}

RISK FACTORS IDENTIFIED
${formData.hasTeenDriver ? '• Teen driver in household\n' : ''}${formData.hasPool ? '• Swimming pool on property\n' : ''}${formData.hasTrampoline ? '• Trampoline on property\n' : ''}${formData.hasDog ? '• Dog ownership\n' : ''}${formData.hasBoat ? '• Boat ownership\n' : ''}${formData.hasRental ? '• Rental property ownership\n' : ''}${formData.hasATV ? '• ATV/Motorcycle ownership\n' : ''}${formData.homeBusiness ? '• Home-based business\n' : ''}${formData.entertainFrequently ? '• Frequent entertaining\n' : ''}${formData.volunteerWork ? '• Volunteer work exposure\n' : ''}

RECOMMENDATION
Based on your total assets of $${totalAssets.toLocaleString()} and risk profile, we recommend 
umbrella coverage of $${totalRecommended.toLocaleString()}. This will provide adequate protection 
for your assets and future earnings in the event of a catastrophic lawsuit.

ESTIMATED ANNUAL COST
$${Math.round(totalRecommended / 1000000 * 375)} - $${Math.round(totalRecommended / 1000000 * 650)}
*Actual cost depends on specific circumstances and carrier

NEXT STEPS
1. Call Bill Layne Insurance at (336) 835-1993 for a personalized quote
2. Review your auto and home policies to ensure adequate underlying limits
3. Consider increasing base liability limits if currently at state minimums
4. Implement risk reduction strategies for identified exposures

WHY UMBRELLA COVERAGE IS IMPORTANT
- Protects assets beyond auto/home policy limits
- Covers legal defense costs
- Provides worldwide coverage
- Protects future earnings
- Covers many situations not included in other policies

This analysis is for informational purposes only and does not constitute insurance advice.
Please consult with a licensed insurance professional for personalized recommendations.
    `;
    
    // Create download
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `umbrella-policy-analysis-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}