// ==================== UTILITY FUNCTIONS ====================

/**
 * Create a DOM element with classes and attributes
 */
function createElement(tag, { classes = [], attributes = {}, innerHTML = '', textContent = '' } = {}) {
    const el = document.createElement(tag);
    
    if (classes.length) {
        el.classList.add(...classes);
    }
    
    Object.entries(attributes).forEach(([key, value]) => {
        el.setAttribute(key, value);
    });
    
    if (innerHTML) {
        el.innerHTML = innerHTML;
    } else if (textContent) {
        el.textContent = textContent;
    }
    
    return el;
}

/**
 * Generate a unique ID
 */
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

/**
 * Navigate between pages
 */
function navigateTo(pageName) {
    document.querySelectorAll('[data-page]').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.querySelector(`[data-page="${pageName}"]`);
    if (targetPage) {
        targetPage.classList.add('active');
        window.scrollTo(0, 0);
    }
}

/**
 * Show alert dialog
 */
function showAlert(message) {
    alert(message);
}

/**
 * Debounce function for search/input events
 */
function debounce(func, delay = 300) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

/**
 * Highlight active navigation item
 */
function setActive(selector, value) {
    document.querySelectorAll(selector).forEach(el => {
        if (el.getAttribute('data-value') === value || el.textContent === value) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

/**
 * Show/hide element
 */
function toggleVisibility(element, show) {
    if (show) {
        element.style.display = '';
    } else {
        element.style.display = 'none';
    }
}

/**
 * Add event listener with cleanup
 */
function on(element, event, handler) {
    element.addEventListener(event, handler);
    return () => element.removeEventListener(event, handler);
}

/**
 * Emit custom event
 */
function emit(eventName, detail = {}) {
    document.dispatchEvent(new CustomEvent(eventName, { detail }));
}

/**
 * Listen to custom event
 */
function onEvent(eventName, handler) {
    document.addEventListener(eventName, handler);
    return () => document.removeEventListener(eventName, handler);
}
