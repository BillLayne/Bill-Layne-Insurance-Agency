const assessmentQuestions = {
    lifestyle: [
        {
            question: "What is your primary mode of transportation?",
            type: "single",
            options: [
                { text: "Personal vehicle (car/truck)", value: 2 },
                { text: "Motorcycle", value: 5 },
                { text: "Public transportation", value: 1 },
                { text: "Bicycle", value: 3 },
                { text: "Walking", value: 1 }
            ]
        },
        {
            question: "How many miles do you typically drive per year?",
            type: "single",
            options: [
                { text: "Less than 10,000 miles", value: 1 },
                { text: "10,000 - 15,000 miles", value: 2 },
                { text: "15,000 - 20,000 miles", value: 3 },
                { text: "More than 20,000 miles", value: 4 }
            ]
        },
        {
            question: "Which recreational activities do you regularly participate in? (Select all that apply)",
            type: "multiple",
            options: [
                { text: "Swimming/Water sports", value: 3 },
                { text: "Skiing/Snowboarding", value: 4 },
                { text: "Rock climbing", value: 5 },
                { text: "Hunting", value: 4 },
                { text: "Golfing", value: 1 },
                { text: "Hiking", value: 2 },
                { text: "Contact sports", value: 4 },
                { text: "None of the above", value: 0 }
            ]
        },
        {
            question: "Do you own or regularly use any of the following? (Select all that apply)",
            type: "multiple",
            options: [
                { text: "Swimming pool", value: 4 },
                { text: "Trampoline", value: 5 },
                { text: "ATV/Off-road vehicles", value: 5 },
                { text: "Boat/Watercraft", value: 4 },
                { text: "RV/Motorhome", value: 3 },
                { text: "Firearms", value: 3 },
                { text: "None of the above", value: 0 }
            ]
        },
        {
            question: "Do you have any pets?",
            type: "single",
            options: [
                { text: "No pets", value: 0 },
                { text: "Small pets (cats, small dogs, etc.)", value: 1 },
                { text: "Large dogs", value: 3 },
                { text: "Multiple large dogs", value: 4 },
                { text: "Exotic pets", value: 5 }
            ]
        }
    ],
    property: [
        {
            question: "What type of residence do you live in?",
            type: "single",
            options: [
                { text: "Single-family home", value: 2 },
                { text: "Townhouse/Duplex", value: 2 },
                { text: "Condominium", value: 1 },
                { text: "Apartment (renting)", value: 1 },
                { text: "Mobile home", value: 3 }
            ]
        },
        {
            question: "How old is your primary residence?",
            type: "single",
            options: [
                { text: "Less than 10 years", value: 1 },
                { text: "10-25 years", value: 2 },
                { text: "25-50 years", value: 3 },
                { text: "More than 50 years", value: 4 }
            ]
        },
        {
            question: "What is the approximate value of your home?",
            type: "slider",
            min: 50000,
            max: 2000000,
            step: 50000,
            default: 300000
        },
        {
            question: "What security features does your home have? (Select all that apply)",
            type: "multiple",
            options: [
                { text: "Security system", value: -2 },
                { text: "Deadbolt locks", value: -1 },
                { text: "Motion sensor lights", value: -1 },
                { text: "Security cameras", value: -2 },
                { text: "Gated community", value: -1 },
                { text: "None of the above", value: 3 }
            ]
        },
        {
            question: "Do you own any high-value items? (Select all that apply)",
            type: "multiple",
            options: [
                { text: "Jewelry worth over $5,000", value: 3 },
                { text: "Art/Collectibles", value: 3 },
                { text: "Electronics over $10,000", value: 2 },
                { text: "Musical instruments", value: 2 },
                { text: "Designer clothing/accessories", value: 2 },
                { text: "None of the above", value: 0 }
            ]
        },
        {
            question: "How close is your home to potential hazards?",
            type: "single",
            options: [
                { text: "Near water (ocean, lake, river)", value: 4 },
                { text: "In a flood zone", value: 5 },
                { text: "Near wildfire-prone areas", value: 5 },
                { text: "In a high-crime area", value: 4 },
                { text: "None of the above", value: 1 }
            ]
        }
    ],
    financial: [
        {
            question: "What is your annual household income?",
            type: "slider",
            min: 25000,
            max: 500000,
            step: 5000,
            default: 75000
        },
        {
            question: "How many people depend on your income?",
            type: "single",
            options: [
                { text: "Just myself", value: 1 },
                { text: "1-2 dependents", value: 2 },
                { text: "3-4 dependents", value: 3 },
                { text: "5 or more dependents", value: 4 }
            ]
        },
        {
            question: "What percentage of your income goes to debt payments?",
            type: "single",
            options: [
                { text: "Less than 20%", value: 1 },
                { text: "20-35%", value: 2 },
                { text: "35-50%", value: 3 },
                { text: "More than 50%", value: 4 }
            ]
        },
        {
            question: "How many months of expenses do you have in emergency savings?",
            type: "single",
            options: [
                { text: "6+ months", value: 1 },
                { text: "3-6 months", value: 2 },
                { text: "1-3 months", value: 3 },
                { text: "Less than 1 month", value: 5 }
            ]
        },
        {
            question: "Do you have any of the following? (Select all that apply)",
            type: "multiple",
            options: [
                { text: "Life insurance", value: -2 },
                { text: "Disability insurance", value: -2 },
                { text: "Health insurance", value: -1 },
                { text: "Retirement savings", value: -1 },
                { text: "Investment portfolio", value: -1 },
                { text: "None of the above", value: 3 }
            ]
        },
        {
            question: "What is your total net worth (assets minus debts)?",
            type: "slider",
            min: -50000,
            max: 2000000,
            step: 10000,
            default: 100000
        }
    ]
};

let currentSection = 'lifestyle';
let currentQuestionIndex = 0;
let answers = {
    lifestyle: [],
    property: [],
    financial: []
};

const sectionOrder = ['lifestyle', 'property', 'financial'];
let currentSectionIndex = 0;

function startAssessment() {
    currentSection = 'lifestyle';
    currentQuestionIndex = 0;
    currentSectionIndex = 0;
    answers = {
        lifestyle: [],
        property: [],
        financial: []
    };
    
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('assessment-screen').classList.add('active');
    
    showQuestion();
}

function showQuestion() {
    const questions = assessmentQuestions[currentSection];
    const question = questions[currentQuestionIndex];
    
    document.getElementById('current-section').textContent = 
        currentSection.charAt(0).toUpperCase() + currentSection.slice(1);
    
    const totalQuestions = Object.values(assessmentQuestions).reduce((sum, section) => sum + section.length, 0);
    const currentQuestionNumber = getCurrentQuestionNumber();
    const progressPercentage = (currentQuestionNumber / totalQuestions) * 100;
    document.getElementById('progress-fill').style.width = progressPercentage + '%';
    
    document.getElementById('question-text').textContent = question.question;
    
    const answerContainer = document.getElementById('answer-container');
    answerContainer.innerHTML = '';
    
    if (question.type === 'single') {
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'answer-option';
            optionDiv.textContent = option.text;
            optionDiv.onclick = () => selectSingleAnswer(index);
            answerContainer.appendChild(optionDiv);
        });
    } else if (question.type === 'multiple') {
        const checkboxGroup = document.createElement('div');
        checkboxGroup.className = 'checkbox-group';
        
        question.options.forEach((option, index) => {
            const checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'checkbox-option';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `option-${index}`;
            checkbox.value = index;
            
            const label = document.createElement('label');
            label.htmlFor = `option-${index}`;
            label.textContent = option.text;
            
            checkboxDiv.appendChild(checkbox);
            checkboxDiv.appendChild(label);
            checkboxGroup.appendChild(checkboxDiv);
        });
        
        answerContainer.appendChild(checkboxGroup);
        
        const nextBtn = document.getElementById('next-btn');
        nextBtn.style.display = 'block';
        nextBtn.textContent = 'Continue';
    } else if (question.type === 'slider') {
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';
        
        const sliderLabels = document.createElement('div');
        sliderLabels.className = 'slider-labels';
        sliderLabels.innerHTML = `
            <span>$${question.min.toLocaleString()}</span>
            <span>$${question.max.toLocaleString()}</span>
        `;
        
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'slider';
        slider.min = question.min;
        slider.max = question.max;
        slider.step = question.step;
        slider.value = question.default;
        
        const sliderValue = document.createElement('div');
        sliderValue.className = 'slider-value';
        sliderValue.textContent = `$${question.default.toLocaleString()}`;
        
        slider.oninput = () => {
            sliderValue.textContent = `$${parseInt(slider.value).toLocaleString()}`;
        };
        
        sliderContainer.appendChild(sliderLabels);
        sliderContainer.appendChild(slider);
        sliderContainer.appendChild(sliderValue);
        answerContainer.appendChild(sliderContainer);
        
        const nextBtn = document.getElementById('next-btn');
        nextBtn.style.display = 'block';
        nextBtn.textContent = 'Continue';
    }
    
    updateNavigationButtons();
}

function getCurrentQuestionNumber() {
    let questionNumber = 0;
    for (let i = 0; i < currentSectionIndex; i++) {
        questionNumber += assessmentQuestions[sectionOrder[i]].length;
    }
    questionNumber += currentQuestionIndex + 1;
    return questionNumber;
}

function selectSingleAnswer(index) {
    const options = document.querySelectorAll('.answer-option');
    options.forEach(option => option.classList.remove('selected'));
    options[index].classList.add('selected');
    
    const question = assessmentQuestions[currentSection][currentQuestionIndex];
    answers[currentSection][currentQuestionIndex] = {
        type: 'single',
        value: question.options[index].value,
        text: question.options[index].text
    };
    
    setTimeout(nextQuestion, 300);
}

function getMultipleAnswers() {
    const checkboxes = document.querySelectorAll('.checkbox-option input[type="checkbox"]:checked');
    const question = assessmentQuestions[currentSection][currentQuestionIndex];
    const selectedValues = [];
    const selectedTexts = [];
    
    checkboxes.forEach(checkbox => {
        const index = parseInt(checkbox.value);
        selectedValues.push(question.options[index].value);
        selectedTexts.push(question.options[index].text);
    });
    
    return {
        type: 'multiple',
        values: selectedValues,
        texts: selectedTexts
    };
}

function getSliderAnswer() {
    const slider = document.querySelector('.slider');
    return {
        type: 'slider',
        value: parseInt(slider.value)
    };
}

function nextQuestion() {
    const question = assessmentQuestions[currentSection][currentQuestionIndex];
    
    if (question.type === 'multiple') {
        answers[currentSection][currentQuestionIndex] = getMultipleAnswers();
    } else if (question.type === 'slider') {
        answers[currentSection][currentQuestionIndex] = getSliderAnswer();
    }
    
    currentQuestionIndex++;
    
    if (currentQuestionIndex >= assessmentQuestions[currentSection].length) {
        currentSectionIndex++;
        if (currentSectionIndex >= sectionOrder.length) {
            showResults();
            return;
        }
        currentSection = sectionOrder[currentSectionIndex];
        currentQuestionIndex = 0;
    }
    
    showQuestion();
}

function previousQuestion() {
    currentQuestionIndex--;
    
    if (currentQuestionIndex < 0) {
        currentSectionIndex--;
        if (currentSectionIndex < 0) {
            currentSectionIndex = 0;
            currentQuestionIndex = 0;
            return;
        }
        currentSection = sectionOrder[currentSectionIndex];
        currentQuestionIndex = assessmentQuestions[currentSection].length - 1;
    }
    
    showQuestion();
}

function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (currentSectionIndex === 0 && currentQuestionIndex === 0) {
        prevBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'block';
    }
    
    const question = assessmentQuestions[currentSection][currentQuestionIndex];
    if (question.type === 'single') {
        nextBtn.style.display = 'none';
    }
}

function calculateRiskScores() {
    const scores = {
        lifestyle: 0,
        property: 0,
        financial: 0
    };
    
    for (const section in answers) {
        answers[section].forEach(answer => {
            if (answer.type === 'single') {
                scores[section] += answer.value;
            } else if (answer.type === 'multiple') {
                scores[section] += answer.values.reduce((sum, val) => sum + val, 0);
            } else if (answer.type === 'slider') {
                if (section === 'property') {
                    scores[section] += answer.value > 500000 ? 3 : answer.value > 300000 ? 2 : 1;
                } else if (section === 'financial') {
                    if (currentQuestionIndex === 0) {
                        scores[section] += answer.value < 50000 ? 3 : answer.value < 100000 ? 2 : 1;
                    } else {
                        scores[section] += answer.value < 50000 ? 4 : answer.value < 200000 ? 2 : 1;
                    }
                }
            }
        });
    }
    
    return scores;
}

function showResults() {
    document.getElementById('assessment-screen').classList.remove('active');
    document.getElementById('results-screen').classList.add('active');
    
    const scores = calculateRiskScores();
    const totalScore = scores.lifestyle + scores.property + scores.financial;
    
    let riskLevel, riskAngle;
    if (totalScore <= 20) {
        riskLevel = 'Low Risk';
        riskAngle = 30;
    } else if (totalScore <= 40) {
        riskLevel = 'Moderate Risk';
        riskAngle = 90;
    } else if (totalScore <= 60) {
        riskLevel = 'Elevated Risk';
        riskAngle = 135;
    } else {
        riskLevel = 'High Risk';
        riskAngle = 160;
    }
    
    document.getElementById('risk-meter-fill').style.transform = `rotate(${riskAngle}deg)`;
    setTimeout(() => {
        document.getElementById('risk-level').textContent = riskLevel;
    }, 1000);
    
    displayRiskBreakdown(scores);
    generateRecommendations(scores);
    identifyCoverageGaps(scores);
    createActionPlan(scores);
}

function displayRiskBreakdown(scores) {
    const maxScore = 30;
    
    const lifestylePercent = Math.min((scores.lifestyle / maxScore) * 100, 100);
    document.getElementById('lifestyle-risk-bar').style.width = lifestylePercent + '%';
    document.getElementById('lifestyle-risk-text').textContent = 
        getLifestyleRiskText(scores.lifestyle);
    
    const propertyPercent = Math.min((scores.property / maxScore) * 100, 100);
    document.getElementById('property-risk-bar').style.width = propertyPercent + '%';
    document.getElementById('property-risk-text').textContent = 
        getPropertyRiskText(scores.property);
    
    const financialPercent = Math.min((scores.financial / maxScore) * 100, 100);
    document.getElementById('financial-risk-bar').style.width = financialPercent + '%';
    document.getElementById('financial-risk-text').textContent = 
        getFinancialRiskText(scores.financial);
}

function getLifestyleRiskText(score) {
    if (score <= 10) return "Your lifestyle presents minimal insurance risks.";
    if (score <= 20) return "Some activities increase your liability exposure.";
    if (score <= 30) return "High-risk activities require additional coverage.";
    return "Your lifestyle presents significant insurance challenges.";
}

function getPropertyRiskText(score) {
    if (score <= 10) return "Your property risks are well-managed.";
    if (score <= 20) return "Some property factors need attention.";
    if (score <= 30) return "Property exposures require enhanced coverage.";
    return "Significant property risks need immediate attention.";
}

function getFinancialRiskText(score) {
    if (score <= 10) return "Strong financial position with good protection.";
    if (score <= 20) return "Moderate financial vulnerabilities exist.";
    if (score <= 30) return "Financial risks require additional planning.";
    return "Critical financial exposures need addressing.";
}

function generateRecommendations(scores) {
    const recommendationsList = document.getElementById('recommendations-list');
    recommendationsList.innerHTML = '';
    
    const recommendations = [];
    
    if (scores.lifestyle > 15) {
        recommendations.push({
            title: "Umbrella Liability Insurance",
            description: "Your active lifestyle increases liability exposure. An umbrella policy provides extra protection beyond standard limits.",
            priority: "high"
        });
    }
    
    if (scores.property > 20) {
        recommendations.push({
            title: "Enhanced Home Coverage",
            description: "Consider guaranteed replacement cost coverage and additional protection for high-value items.",
            priority: "high"
        });
    }
    
    if (scores.financial > 15) {
        recommendations.push({
            title: "Life Insurance Review",
            description: "Your financial obligations suggest a need for adequate life insurance to protect dependents.",
            priority: "medium"
        });
        
        recommendations.push({
            title: "Disability Insurance",
            description: "Protect your income with short and long-term disability coverage.",
            priority: "high"
        });
    }
    
    recommendations.push({
        title: "Annual Insurance Review",
        description: "Schedule yearly reviews to ensure coverage keeps pace with life changes.",
        priority: "low"
    });
    
    recommendations.forEach(rec => {
        const recDiv = document.createElement('div');
        recDiv.className = 'recommendation-item';
        recDiv.innerHTML = `
            <h4>${rec.title}
                <span class="recommendation-priority ${rec.priority}">${rec.priority.toUpperCase()}</span>
            </h4>
            <p>${rec.description}</p>
        `;
        recommendationsList.appendChild(recDiv);
    });
}

function identifyCoverageGaps(scores) {
    const gapsList = document.getElementById('coverage-gaps-list');
    gapsList.innerHTML = '';
    
    const gaps = [];
    
    const hasPool = answers.lifestyle.some(answer => 
        answer.texts && answer.texts.includes("Swimming pool"));
    if (hasPool) {
        gaps.push("Pool liability coverage may be insufficient");
    }
    
    const hasValuables = answers.property.some(answer => 
        answer.texts && (answer.texts.includes("Jewelry worth over $5,000") || 
                        answer.texts.includes("Art/Collectibles")));
    if (hasValuables) {
        gaps.push("Valuable items may exceed standard policy limits");
    }
    
    const lowEmergency = answers.financial.some(answer => 
        answer.text && answer.text.includes("Less than 1 month"));
    if (lowEmergency) {
        gaps.push("Limited emergency fund increases financial vulnerability");
    }
    
    if (scores.lifestyle > 20) {
        gaps.push("Current liability limits may not cover high-risk activities");
    }
    
    gaps.forEach(gap => {
        const li = document.createElement('li');
        li.textContent = gap;
        gapsList.appendChild(li);
    });
}

function createActionPlan(scores) {
    const actionList = document.getElementById('action-plan-list');
    actionList.innerHTML = '';
    
    const actions = [
        "Schedule a comprehensive insurance review with Bill Layne Insurance",
        "Document all valuable possessions for accurate coverage",
        "Review and update beneficiaries on all policies",
        "Consider bundling policies for better coverage and savings",
        "Evaluate deductibles to optimize premium costs"
    ];
    
    if (scores.financial > 20) {
        actions.unshift("Prioritize disability and life insurance evaluation");
    }
    
    if (scores.property > 20) {
        actions.splice(1, 0, "Get a professional home inventory completed");
    }
    
    actions.forEach(action => {
        const li = document.createElement('li');
        li.textContent = action;
        actionList.appendChild(li);
    });
}

function downloadReport() {
    const scores = calculateRiskScores();
    const totalScore = scores.lifestyle + scores.property + scores.financial;
    
    let report = "PERSONAL RISK ASSESSMENT REPORT\n";
    report += "================================\n\n";
    report += `Date: ${new Date().toLocaleDateString()}\n\n`;
    
    report += "RISK SCORES:\n";
    report += `Lifestyle Risk: ${scores.lifestyle}/30\n`;
    report += `Property Risk: ${scores.property}/30\n`;
    report += `Financial Risk: ${scores.financial}/30\n`;
    report += `Total Risk Score: ${totalScore}/90\n\n`;
    
    report += "RECOMMENDATIONS:\n";
    const recommendations = document.querySelectorAll('.recommendation-item');
    recommendations.forEach((rec, index) => {
        report += `${index + 1}. ${rec.querySelector('h4').textContent}\n`;
        report += `   ${rec.querySelector('p').textContent}\n\n`;
    });
    
    report += "\nCONTACT BILL LAYNE INSURANCE:\n";
    report += "Phone: (336) 835-1993\n";
    report += "Schedule a consultation to discuss your personalized insurance solutions.\n";
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'risk-assessment-report.txt';
    a.click();
    window.URL.revokeObjectURL(url);
}

function retakeAssessment() {
    document.getElementById('results-screen').classList.remove('active');
    startAssessment();
}