// Emergency fix for any JavaScript errors
// Add this script BEFORE other scripts to catch errors

// Override console methods to help debug
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = function(...args) {
    originalLog('[DEBUG]', ...args);
};

console.error = function(...args) {
    originalError('[ERROR]', ...args);
    // Log errors to help debug
    if (args[0] && args[0].toString().includes('addEventListener')) {
        originalError('Element not found for addEventListener. Check element IDs.');
    }
};

console.warn = function(...args) {
    originalWarn('[WARN]', ...args);
};

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.message, 'at', event.filename, ':', event.lineno);
    
    // Prevent the default error handling
    event.preventDefault();
});

// DOM safety wrapper
window.safeGetElement = function(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with ID "${id}" not found`);
    }
    return element;
};

// Safe event listener
window.safeAddEventListener = function(element, event, handler) {
    if (element && element.addEventListener) {
        element.addEventListener(event, handler);
        return true;
    }
    console.warn('Cannot add event listener - element is null or undefined');
    return false;
};