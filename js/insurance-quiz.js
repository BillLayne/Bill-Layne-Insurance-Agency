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
        question: "What are North Carolina's mandatory minimum auto liability insurance limits?",
        options: [
            "25/50/25",
            "30/60/25",
            "50/100/50",
            "100/300/100"
        ],
        correct: 2,
        explanation: "Under North Carolina General Statute § 20-279.21 (SB 452), NC requires minimum auto liability limits of $50,000 bodily injury per person, $100,000 bodily injury per accident, and $50,000 property damage (50/100/50)."
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
            "Boat insurance",
            "Homeowners insurance",
            "Umbrella insurance",
            "Travel insurance"
        ],
        correct: 1,
        explanation: "Mortgage lenders require homeowners insurance to protect the dwelling securing your loan. Note that if a home is in a FEMA high-risk flood zone, lenders also require separate flood insurance."
    },
    {
        question: "Under North Carolina DMV law, what must you do BEFORE canceling auto insurance on a registered vehicle?",
        options: [
            "Nothing if the vehicle is parked in your driveway",
            "Turn in the license plate to an NC DMV plate agency first",
            "Wait 30 days for the carrier to notify NCDMV",
            "Remove the registration sticker from the bumper"
        ],
        correct: 1,
        explanation: "Under N.C.G.S. § 20-309(d), North Carolina requires continuous liability coverage on every active license plate. Always surrender your license plate at an NCDMV license plate agency BEFORE canceling insurance to avoid civil lapse fines."
    },
    {
        question: "What is an insurance endorsement (or rider)?",
        options: [
            "A person who drives your insured vehicle",
            "An add-on that customizes or expands your insurance policy",
            "A discount on your monthly payment",
            "A traffic citation surcharge"
        ],
        correct: 1,
        explanation: "An endorsement (or scheduled rider) modifies a base policy to add or adjust coverage — such as adding water backup protection, equipment breakdown, or scheduled jewelry coverage to a homeowners policy."
    },
    {
        question: "What does a Personal Umbrella insurance policy cover in North Carolina?",
        options: [
            "Flooding from rising surface water",
            "Excess personal liability above your auto and homeowners limits",
            "Routine roof wear and tear",
            "Vehicle mechanical breakdowns"
        ],
        correct: 1,
        explanation: "A personal umbrella policy provides an extra $1 million to $5 million+ layer of personal liability and legal defense protection above your underlying auto, homeowners, boat, or rental property liability limits."
    },
    {
        question: "How does a 1% wind/hail deductible work on a $350,000 North Carolina homeowners policy?",
        options: [
            "You pay 1% of the contractor's repair bill",
            "You pay $3,500 (1% of the Coverage A dwelling limit) on a covered wind or hail claim",
            "Your annual premium rises by 1% after a storm",
            "The carrier covers only 1% of roof damage"
        ],
        correct: 1,
        explanation: "Percentage wind/hail deductibles in North Carolina are calculated as a percentage of your Coverage A dwelling limit — so a 1% deductible on a $350,000 dwelling equals $3,500 out of pocket on a covered wind or hail loss."
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
        question: "What does a North Carolina renters insurance policy (HO-4) cover?",
        options: [
            "Only the landlord's building roof and walls",
            "Your personal belongings, personal liability, and loss-of-use living expenses",
            "Routine apartment plumbing wear and tear",
            "Your roommate's vehicle collision damage"
        ],
        correct: 1,
        explanation: "While a landlord's policy covers the building structure, an HO-4 renters policy protects your personal belongings (Coverage C), personal liability (Coverage E), and temporary living expenses (Coverage D) after a covered loss."
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
            const qText = quizQuestions[answer.questionIndex].question.toLowerCase();
            if (qText.includes('deductible')) incorrectTopics.add('deductibles');
            if (qText.includes('dmv') || qText.includes('canceling')) incorrectTopics.add('dmv');
            if (qText.includes('umbrella')) incorrectTopics.add('umbrella');
            if (qText.includes('auto') || qText.includes('vehicle') || qText.includes('gap')) incorrectTopics.add('auto');
            if (qText.includes('property') || qText.includes('homeowners') || qText.includes('renters') || qText.includes('endorsement')) incorrectTopics.add('property');
        }
    });
    
    if (incorrectTopics.has('deductibles')) {
        recommendations.push("Review how flat dollar deductibles and NC percentage wind/hail deductibles affect out-of-pocket claim costs");
    }
    if (incorrectTopics.has('dmv')) {
        recommendations.push("Bookmark NC DMV rules: always turn in license plates before canceling auto coverage (N.C.G.S. § 20-309)");
    }
    if (incorrectTopics.has('umbrella')) {
        recommendations.push("Check whether a $1M+ personal umbrella policy makes sense above your auto and home limits");
    }
    if (incorrectTopics.has('auto')) {
        recommendations.push("Compare your current NC auto liability and UM/UIM limits against 100/300/100+ protection");
    }
    if (incorrectTopics.has('property')) {
        recommendations.push("Review replacement cost vs. actual cash value on your homeowners or renters declarations page");
    }
    
    if (recommendations.length === 0) {
        recommendations.push("Outstanding NC insurance IQ — keep reviewing your auto and homeowners renewals annually");
        recommendations.push("Consider checking personal umbrella limits as household savings and home equity grow");
    }
    
    recommendations.push("Compare side-by-side NC auto or home options with our licensed team whenever your policy renews");
    
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