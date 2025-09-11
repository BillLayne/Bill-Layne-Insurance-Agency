// Lazy load non-critical scripts after page load
window.addEventListener('load', function() {
    // Delay non-critical scripts by 2 seconds after page load
    setTimeout(function() {
        // Load EmailJS only when needed
        if (document.getElementById('email-form')) {
            const emailJsScript = document.createElement('script');
            emailJsScript.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            emailJsScript.onload = function() {
                if (typeof emailjs !== 'undefined') {
                    emailjs.init("Av6wKxL6HR-FIMtgm");
                }
            };
            document.body.appendChild(emailJsScript);
        }
        
        // Initialize non-critical features
        initializeNonCriticalFeatures();
    }, 2000);
});

function initializeNonCriticalFeatures() {
    // Insurance quiz initialization
    const quizContainer = document.getElementById('quiz-container');
    if (quizContainer) {
        // Quiz code will be initialized here when needed
        console.log('Quiz ready for interaction');
    }
    
    // Tool evaluators
    const autoForm = document.getElementById('auto-coverage-form');
    const homeForm = document.getElementById('home-coverage-form');
    
    if (autoForm || homeForm) {
        console.log('Coverage evaluators ready');
    }
}