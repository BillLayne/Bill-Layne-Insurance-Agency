const quizQuestions = [
    {
        question: "What is a deductible in insurance?",
        options: [
            "The maximum amount the insurance company will pay",
            "The amount you pay before insurance coverage begins",
            "The monthly payment for insurance",
            "The total value of your insurance policy"
        ],
        correct: 1,
        explanation: "A deductible is the amount you must pay out-of-pocket before your insurance company starts paying for covered expenses. For example, if you have a $1,000 deductible and file a $3,000 claim, you pay the first $1,000 and your insurance covers the remaining $2,000."
    },
    {
        question: "Which type of life insurance provides coverage for a specific period?",
        options: [
            "Whole life insurance",
            "Universal life insurance",
            "Term life insurance",
            "Variable life insurance"
        ],
        correct: 2,
        explanation: "Term life insurance provides coverage for a specific period (term), such as 10, 20, or 30 years. It's typically more affordable than permanent life insurance and is ideal for temporary needs like mortgage protection or income replacement during working years."
    },
    {
        question: "What does liability coverage in auto insurance protect?",
        options: [
            "Damage to your own vehicle",
            "Your medical expenses",
            "Damage you cause to others and their property",
            "Theft of your vehicle"
        ],
        correct: 2,
        explanation: "Liability coverage protects you financially if you're responsible for injuring others or damaging their property in an accident. It covers the other party's medical bills, property damage, and legal fees if you're sued."
    },
    {
        question: "What is the purpose of an insurance premium?",
        options: [
            "To cover the deductible",
            "To pay for insurance coverage",
            "To receive a discount on services",
            "To file a claim"
        ],
        correct: 1,
        explanation: "An insurance premium is the amount you pay (monthly, quarterly, or annually) to maintain your insurance coverage. It's essentially the cost of having insurance protection."
    },
    {
        question: "Which type of insurance is typically required by mortgage lenders?",
        options: [
            "Life insurance",
            "Homeowners insurance",
            "Umbrella insurance",
            "Flood insurance"
        ],
        correct: 1,
        explanation: "Mortgage lenders typically require homeowners insurance to protect their investment in your property. This ensures that if the home is damaged or destroyed, there's coverage to repair or rebuild it."
    },
    {
        question: "What does 'co-insurance' mean in health insurance?",
        options: [
            "Insurance shared between two companies",
            "The percentage of costs you share with your insurer after meeting the deductible",
            "Insurance for multiple family members",
            "Coverage for pre-existing conditions"
        ],
        correct: 1,
        explanation: "Co-insurance is the percentage of covered healthcare costs you pay after meeting your deductible. For example, with 80/20 co-insurance, your insurance pays 80% of covered costs and you pay 20%."
    },
    {
        question: "What is an insurance rider?",
        options: [
            "A person who drives your insured vehicle",
            "An add-on to customize your insurance policy",
            "A discount on your premium",
            "A type of motorcycle insurance"
        ],
        correct: 1,
        explanation: "An insurance rider is an add-on or amendment to your basic insurance policy that provides additional coverage or modifies the terms. For example, adding valuable items coverage to a homeowners policy."
    },
    {
        question: "What type of insurance covers lost income due to disability?",
        options: [
            "Life insurance",
            "Health insurance",
            "Disability insurance",
            "Workers' compensation"
        ],
        correct: 2,
        explanation: "Disability insurance replaces a portion of your income if you become unable to work due to illness or injury. It helps maintain your financial stability during periods when you can't earn your regular income."
    },
    {
        question: "What is the difference between HMO and PPO health plans?",
        options: [
            "HMO is more expensive than PPO",
            "PPO requires referrals, HMO doesn't",
            "HMO typically requires choosing a primary care physician and getting referrals",
            "There is no difference"
        ],
        correct: 2,
        explanation: "HMO (Health Maintenance Organization) plans typically require you to choose a primary care physician and get referrals for specialists, while PPO (Preferred Provider Organization) plans offer more flexibility to see any healthcare provider without referrals."
    },
    {
        question: "What is underwriting in insurance?",
        options: [
            "Writing checks for claims",
            "The process of evaluating risk and determining coverage terms",
            "Signing insurance documents",
            "Canceling an insurance policy"
        ],
        correct: 1,
        explanation: "Underwriting is the process insurance companies use to evaluate the risk of insuring you and determine your premium rates, coverage limits, and whether to offer you coverage at all."
    },
    {
        question: "What does 'actual cash value' mean in property insurance?",
        options: [
            "The original purchase price",
            "The replacement cost minus depreciation",
            "The current market value",
            "The amount of cash in your bank"
        ],
        correct: 1,
        explanation: "Actual cash value (ACV) is the replacement cost of damaged or stolen property minus depreciation. It represents what the item was worth at the time of loss, not what it would cost to buy new."
    },
    {
        question: "What is an insurance deductible waiver?",
        options: [
            "Permanently removing your deductible",
            "Circumstances where you don't have to pay the deductible",
            "Increasing your deductible",
            "Transferring your deductible to someone else"
        ],
        correct: 1,
        explanation: "A deductible waiver applies in certain situations where you don't have to pay your deductible, such as when you're not at fault in an auto accident and the other party's insurance covers the damage."
    },
    {
        question: "What is gap insurance for vehicles?",
        options: [
            "Insurance for parking spaces",
            "Coverage for the gap between spaces",
            "Coverage for the difference between what you owe and the car's value",
            "Insurance for mechanical breakdowns"
        ],
        correct: 2,
        explanation: "Gap insurance covers the 'gap' between what you owe on your car loan and the actual cash value of your vehicle if it's totaled. This is important because cars depreciate quickly and you might owe more than the car is worth."
    },
    {
        question: "What factors typically affect life insurance premiums?",
        options: [
            "Only your age",
            "Age, health, lifestyle, and coverage amount",
            "Only the coverage amount",
            "Your credit score only"
        ],
        correct: 1,
        explanation: "Life insurance premiums are determined by multiple factors including your age, health status, lifestyle choices (like smoking), occupation, hobbies, and the amount of coverage you want. Younger, healthier individuals typically pay lower premiums."
    },
    {
        question: "What is an insurance grace period?",
        options: [
            "Time to file a claim",
            "Extra time to pay premiums without losing coverage",
            "Waiting period before coverage starts",
            "Time between claims"
        ],
        correct: 1,
        explanation: "A grace period is the time after your premium due date during which you can still make a payment without losing coverage. This protects you from accidental lapses in coverage due to late payments."
    }
];

let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    
    document.getElementById('start-screen').classList.remove('active');
    document.getElementById('quiz-screen').classList.add('active');
    document.getElementById('total-questions').textContent = quizQuestions.length;
    
    showQuestion();
}

function showQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    document.getElementById('current-question').textContent = currentQuestionIndex + 1;
    document.getElementById('question-text').textContent = question.question;
    
    const progressPercentage = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
    document.getElementById('progress-fill').style.width = progressPercentage + '%';
    
    const answerOptions = document.getElementById('answer-options');
    answerOptions.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'answer-option';
        optionDiv.textContent = option;
        optionDiv.onclick = () => selectAnswer(index);
        answerOptions.appendChild(optionDiv);
    });
    
    document.getElementById('feedback-container').classList.remove('show');
}

function selectAnswer(selectedIndex) {
    const question = quizQuestions[currentQuestionIndex];
    const answerOptions = document.querySelectorAll('.answer-option');
    
    answerOptions.forEach(option => option.classList.add('disabled'));
    
    if (selectedIndex === question.correct) {
        answerOptions[selectedIndex].classList.add('correct');
        score++;
        userAnswers.push({ questionIndex: currentQuestionIndex, correct: true });
    } else {
        answerOptions[selectedIndex].classList.add('incorrect');
        answerOptions[question.correct].classList.add('correct');
        userAnswers.push({ questionIndex: currentQuestionIndex, correct: false });
    }
    
    showFeedback(question.explanation);
}

function showFeedback(explanation) {
    document.getElementById('feedback-text').textContent = explanation;
    document.getElementById('feedback-container').classList.add('show');
}

function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < quizQuestions.length) {
        showQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById('quiz-screen').classList.remove('active');
    document.getElementById('results-screen').classList.add('active');
    
    const percentage = Math.round((score / quizQuestions.length) * 100);
    document.getElementById('score-percentage').textContent = percentage + '%';
    document.getElementById('correct-answers').textContent = score;
    document.getElementById('total-answers').textContent = quizQuestions.length;
    
    let iqLevel, iqDescription;
    if (percentage >= 90) {
        iqLevel = "Insurance Expert";
        iqDescription = "Outstanding! You have exceptional knowledge of insurance concepts. You're well-equipped to make informed decisions about your insurance needs.";
    } else if (percentage >= 70) {
        iqLevel = "Insurance Savvy";
        iqDescription = "Great job! You have a solid understanding of insurance fundamentals. With a bit more learning, you'll be an insurance expert.";
    } else if (percentage >= 50) {
        iqLevel = "Insurance Aware";
        iqDescription = "Good effort! You understand the basics but there's room for improvement. Consider learning more about specific insurance topics that challenged you.";
    } else {
        iqLevel = "Insurance Beginner";
        iqDescription = "You're just starting your insurance education journey. Don't worry - everyone starts somewhere! Focus on learning the fundamentals and you'll improve quickly.";
    }
    
    document.getElementById('iq-level').textContent = iqLevel;
    document.getElementById('iq-description').textContent = iqDescription;
    
    const recommendations = generateRecommendations();
    const recommendationsList = document.getElementById('recommendations-list');
    recommendationsList.innerHTML = '';
    recommendations.forEach(rec => {
        const li = document.createElement('li');
        li.textContent = rec;
        recommendationsList.appendChild(li);
    });
}

function generateRecommendations() {
    const recommendations = [];
    const incorrectTopics = new Set();
    
    userAnswers.forEach(answer => {
        if (!answer.correct) {
            const question = quizQuestions[answer.questionIndex];
            if (question.question.includes('deductible')) incorrectTopics.add('deductibles');
            if (question.question.includes('life insurance')) incorrectTopics.add('life');
            if (question.question.includes('health')) incorrectTopics.add('health');
            if (question.question.includes('auto') || question.question.includes('vehicle')) incorrectTopics.add('auto');
            if (question.question.includes('property') || question.question.includes('homeowners')) incorrectTopics.add('property');
        }
    });
    
    if (incorrectTopics.has('deductibles')) {
        recommendations.push("Review how deductibles work and their impact on premiums");
    }
    if (incorrectTopics.has('life')) {
        recommendations.push("Learn more about different types of life insurance and their benefits");
    }
    if (incorrectTopics.has('health')) {
        recommendations.push("Explore health insurance plan types and coverage options");
    }
    if (incorrectTopics.has('auto')) {
        recommendations.push("Understand auto insurance coverage types and state requirements");
    }
    if (incorrectTopics.has('property')) {
        recommendations.push("Study homeowners and property insurance essentials");
    }
    
    if (recommendations.length === 0) {
        recommendations.push("Keep up the great work and stay informed about insurance updates");
        recommendations.push("Consider reviewing advanced insurance topics like umbrella policies");
    }
    
    recommendations.push("Schedule a consultation with an insurance professional for personalized advice");
    
    return recommendations;
}

function shareResults(platform) {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    const shareText = `I scored ${percentage}% on the Insurance IQ Quiz! Test your insurance knowledge at `;
    const shareUrl = window.location.href;
    
    let shareLink;
    switch(platform) {
        case 'facebook':
            shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
            break;
        case 'twitter':
            shareLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText + shareUrl)}`;
            break;
        case 'linkedin':
            shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
            break;
    }
    
    window.open(shareLink, '_blank', 'width=600,height=400');
}

function copyResultsLink() {
    const percentage = Math.round((score / quizQuestions.length) * 100);
    const shareText = `I scored ${percentage}% on the Insurance IQ Quiz! Test your insurance knowledge at ${window.location.href}`;
    
    navigator.clipboard.writeText(shareText).then(() => {
        alert('Results link copied to clipboard!');
    }).catch(() => {
        alert('Failed to copy link. Please try again.');
    });
}

function retakeQuiz() {
    document.getElementById('results-screen').classList.remove('active');
    startQuiz();
}