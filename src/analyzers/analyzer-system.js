/**
 * Main Analyzer System Module
 * Coordinates all insurance analyzers and manages UI interactions
 */

import autoAnalyzer from './auto-analyzer.js';
import homeAnalyzer from './home-analyzer.js';
import umbrellaAnalyzer from './umbrella-analyzer.js';
import { createModal, updateModal, showModal, hideModal } from '../components/modal.js';
import { validateForm, sanitizeInput } from '../utils/form-utils.js';
import { trackEvent } from '../services/analytics.js';

class AnalyzerSystem {
    constructor() {
        this.currentAnalyzer = null;
        this.currentStep = 0;
        this.userData = {};
        this.modal = null;
        
        // Map analyzer types to their modules
        this.analyzers = {
            auto: autoAnalyzer,
            home: homeAnalyzer,
            umbrella: umbrellaAnalyzer
        };
    }

    /**
     * Initialize the analyzer system
     */
    init() {
        this.createModal();
        this.attachEventListeners();
        console.log('AnalyzerSystem initialized');
    }

    /**
     * Create the modal for analyzer UI
     */
    createModal() {
        this.modal = createModal({
            id: 'analyzer-modal',
            title: 'Coverage Analyzer',
            className: 'analyzer-modal',
            showProgress: true
        });
    }

    /**
     * Attach event listeners to analyzer triggers
     */
    attachEventListeners() {
        // Auto analyzer triggers
        document.querySelectorAll('[data-analyzer="auto"]').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.startAnalyzer('auto');
            });
        });

        // Home analyzer triggers
        document.querySelectorAll('[data-analyzer="home"]').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.startAnalyzer('home');
            });
        });

        // Umbrella analyzer triggers
        document.querySelectorAll('[data-analyzer="umbrella"]').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.startAnalyzer('umbrella');
            });
        });

        // Generic analyzer links
        document.querySelectorAll('a[href*="analyzer"], button[onclick*="analyzer"]').forEach(element => {
            element.addEventListener('click', (e) => {
                const href = element.getAttribute('href') || element.getAttribute('onclick') || '';
                
                if (href.includes('autoAnalyzer')) {
                    e.preventDefault();
                    this.startAnalyzer('auto');
                } else if (href.includes('homeAnalyzer')) {
                    e.preventDefault();
                    this.startAnalyzer('home');
                } else if (href.includes('umbrellaAnalyzer')) {
                    e.preventDefault();
                    this.startAnalyzer('umbrella');
                }
            });
        });
    }

    /**
     * Start a specific analyzer
     * @param {String} type - Type of analyzer (auto, home, umbrella)
     */
    startAnalyzer(type) {
        if (!this.analyzers[type]) {
            console.error(`Unknown analyzer type: ${type}`);
            return;
        }

        this.currentAnalyzer = type;
        this.currentStep = 0;
        this.userData = {};
        
        // Track analytics event
        trackEvent('analyzer_started', {
            analyzer_type: type,
            timestamp: new Date().toISOString()
        });

        // Get questions for this analyzer
        const questions = this.analyzers[type].questions;
        
        // Update modal title
        const titles = {
            auto: 'Auto Insurance Coverage Analyzer',
            home: 'Home Insurance Evaluator',
            umbrella: 'Umbrella Policy Calculator'
        };
        
        updateModal(this.modal, {
            title: titles[type],
            content: this.renderStep(questions[0]),
            progress: {
                current: 1,
                total: questions.length
            }
        });

        // Show the modal
        showModal(this.modal);
        
        // Set up navigation
        this.setupNavigation(questions);
    }

    /**
     * Render a step of the analyzer
     * @param {Object} step - Step configuration
     * @returns {String} HTML for the step
     */
    renderStep(step) {
        let html = `
            <div class="analyzer-step" data-step-id="${step.id}">
                <h3 class="text-xl font-semibold mb-6">${step.title}</h3>
                <form class="analyzer-form space-y-6">
        `;

        step.questions.forEach(question => {
            html += this.renderQuestion(question);
        });

        html += `
                </form>
            </div>
        `;

        return html;
    }

    /**
     * Render a single question
     * @param {Object} question - Question configuration
     * @returns {String} HTML for the question
     */
    renderQuestion(question) {
        let html = `
            <div class="form-group">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    ${question.label}
                    ${question.required ? '<span class="text-red-500">*</span>' : ''}
                </label>
        `;

        switch (question.type) {
            case 'select':
                html += `
                    <select 
                        name="${question.key}" 
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        ${question.required ? 'required' : ''}
                    >
                `;
                question.options.forEach(option => {
                    const selected = this.userData[question.key] === option.value ? 'selected' : '';
                    html += `<option value="${option.value}" ${selected}>${option.label}</option>`;
                });
                html += '</select>';
                break;

            case 'number':
                html += `
                    <input 
                        type="number" 
                        name="${question.key}"
                        min="${question.min || ''}"
                        max="${question.max || ''}"
                        value="${this.userData[question.key] || ''}"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        ${question.required ? 'required' : ''}
                    >
                `;
                break;

            case 'checkbox':
                html += '<div class="space-y-2">';
                question.options.forEach(option => {
                    const checked = (this.userData[question.key] || []).includes(option.value) ? 'checked' : '';
                    html += `
                        <label class="flex items-center">
                            <input 
                                type="checkbox" 
                                name="${question.key}"
                                value="${option.value}"
                                ${checked}
                                class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            >
                            <span class="text-sm">${option.label}</span>
                        </label>
                    `;
                });
                html += '</div>';
                break;

            case 'text':
            default:
                html += `
                    <input 
                        type="text" 
                        name="${question.key}"
                        value="${this.userData[question.key] || ''}"
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        ${question.required ? 'required' : ''}
                    >
                `;
        }

        html += '</div>';
        return html;
    }

    /**
     * Set up navigation between analyzer steps
     * @param {Array} questions - All questions for current analyzer
     */
    setupNavigation(questions) {
        const nextBtn = this.modal.querySelector('#analyzer-next');
        const prevBtn = this.modal.querySelector('#analyzer-prev');
        
        // Remove old listeners
        const newNextBtn = nextBtn.cloneNode(true);
        const newPrevBtn = prevBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
        prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);

        // Next button handler
        newNextBtn.addEventListener('click', () => {
            if (this.saveStepData()) {
                if (this.currentStep < questions.length - 1) {
                    this.currentStep++;
                    this.showStep(questions);
                } else {
                    this.completeAnalyzer();
                }
            }
        });

        // Previous button handler
        newPrevBtn.addEventListener('click', () => {
            if (this.currentStep > 0) {
                this.currentStep--;
                this.showStep(questions);
            }
        });

        // Update button visibility
        this.updateNavigationButtons(questions);
    }

    /**
     * Show a specific step
     * @param {Array} questions - All questions
     */
    showStep(questions) {
        const step = questions[this.currentStep];
        
        updateModal(this.modal, {
            content: this.renderStep(step),
            progress: {
                current: this.currentStep + 1,
                total: questions.length
            }
        });

        this.updateNavigationButtons(questions);
    }

    /**
     * Update navigation button visibility and text
     * @param {Array} questions - All questions
     */
    updateNavigationButtons(questions) {
        const nextBtn = this.modal.querySelector('#analyzer-next');
        const prevBtn = this.modal.querySelector('#analyzer-prev');

        // Previous button
        prevBtn.style.display = this.currentStep > 0 ? 'block' : 'none';

        // Next button text
        if (this.currentStep === questions.length - 1) {
            nextBtn.textContent = 'Get Results';
            nextBtn.classList.add('btn--success');
        } else {
            nextBtn.textContent = 'Next';
            nextBtn.classList.remove('btn--success');
        }
    }

    /**
     * Save data from current step
     * @returns {Boolean} True if validation passes
     */
    saveStepData() {
        const form = this.modal.querySelector('.analyzer-form');
        
        if (!validateForm(form)) {
            return false;
        }

        const formData = new FormData(form);
        
        for (const [key, value] of formData.entries()) {
            const input = form.querySelector(`[name="${key}"]`);
            
            if (input.type === 'checkbox') {
                if (!this.userData[key]) {
                    this.userData[key] = [];
                }
                if (!this.userData[key].includes(value)) {
                    this.userData[key].push(value);
                }
            } else {
                this.userData[key] = sanitizeInput(value);
            }
        }

        return true;
    }

    /**
     * Complete the analyzer and show results
     */
    async completeAnalyzer() {
        // Track completion
        trackEvent('analyzer_completed', {
            analyzer_type: this.currentAnalyzer,
            timestamp: new Date().toISOString()
        });

        // Show loading state
        updateModal(this.modal, {
            content: `
                <div class="text-center py-12">
                    <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p class="mt-4 text-gray-600">Analyzing your coverage...</p>
                </div>
            `
        });

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Analyze the data
        const analyzer = this.analyzers[this.currentAnalyzer];
        const results = analyzer.analyze(this.userData);

        // Display results
        this.showResults(results);
    }

    /**
     * Display analysis results
     * @param {Object} results - Analysis results
     */
    showResults(results) {
        let html = `
            <div class="analyzer-results">
                <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                    <h3 class="text-lg font-semibold text-blue-900 mb-2">Analysis Complete!</h3>
                    <p class="text-blue-700">${results.summary}</p>
                </div>

                <div class="mb-6">
                    <h4 class="text-lg font-semibold mb-3">Risk Level</h4>
                    <div class="flex items-center space-x-2">
                        <div class="flex-1 bg-gray-200 rounded-full h-4">
                            <div class="bg-${this.getRiskColor(results.riskLevel)}-500 h-4 rounded-full" 
                                 style="width: ${this.getRiskPercentage(results.riskLevel)}%"></div>
                        </div>
                        <span class="font-medium text-${this.getRiskColor(results.riskLevel)}-600">
                            ${results.riskLevel}
                        </span>
                    </div>
                </div>
        `;

        if (results.recommendations.length > 0) {
            html += `
                <div class="mb-6">
                    <h4 class="text-lg font-semibold mb-3">Recommendations</h4>
                    <div class="space-y-3">
            `;

            results.recommendations.forEach(rec => {
                const priorityColor = rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'green';
                html += `
                    <div class="border rounded-lg p-4 bg-white">
                        <div class="flex items-start">
                            <span class="inline-block w-2 h-2 rounded-full bg-${priorityColor}-500 mt-2 mr-3"></span>
                            <div class="flex-1">
                                <h5 class="font-medium text-gray-900">${rec.category}</h5>
                                <p class="text-sm text-gray-600 mt-1">${rec.message}</p>
                                ${rec.potentialSavings ? `
                                    <p class="text-sm text-green-600 mt-1 font-medium">
                                        ${rec.potentialSavings}
                                    </p>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });

            html += '</div></div>';
        }

        html += `
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                <h4 class="text-xl font-semibold mb-2">Ready to Optimize Your Coverage?</h4>
                <p class="mb-4">Let our experts help you implement these recommendations and find the best rates.</p>
                <div class="flex flex-col sm:flex-row gap-3">
                    <a href="tel:3368351993" class="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold text-center hover:bg-blue-50 transition">
                        Call (336) 835-1993
                    </a>
                    <button onclick="window.AnalyzerSystem.startQuote()" class="bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-800 transition">
                        Get a Quote
                    </button>
                </div>
            </div>
        `;

        updateModal(this.modal, {
            title: 'Your Coverage Analysis Results',
            content: html,
            showProgress: false
        });

        // Hide navigation buttons
        this.modal.querySelector('#analyzer-next').style.display = 'none';
        this.modal.querySelector('#analyzer-prev').style.display = 'none';
    }

    /**
     * Get color for risk level
     * @param {String} level - Risk level
     * @returns {String} Tailwind color name
     */
    getRiskColor(level) {
        const colors = {
            'Low': 'green',
            'Medium': 'yellow',
            'High': 'red'
        };
        return colors[level] || 'gray';
    }

    /**
     * Get percentage for risk level
     * @param {String} level - Risk level
     * @returns {Number} Percentage value
     */
    getRiskPercentage(level) {
        const percentages = {
            'Low': 25,
            'Medium': 50,
            'High': 90
        };
        return percentages[level] || 0;
    }

    /**
     * Start quote process after analysis
     */
    startQuote() {
        hideModal(this.modal);
        
        // Redirect to quote page with analyzer data
        const queryParams = new URLSearchParams({
            source: 'analyzer',
            type: this.currentAnalyzer,
            data: JSON.stringify(this.userData)
        });
        
        window.location.href = `/quote.html?${queryParams.toString()}`;
    }
}

// Create and export singleton instance
const analyzerSystem = new AnalyzerSystem();

// Make it available globally for backward compatibility
if (typeof window !== 'undefined') {
    window.AnalyzerSystem = analyzerSystem;
}

export default analyzerSystem;