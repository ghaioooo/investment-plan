// Utils Module - Helper functions and utilities
import { VALIDATION_RULES, ERROR_MESSAGES } from './data.js';

// Number formatting utilities
export function formatNumber(n) {
  if (n >= 1000000000) return (n / 1000000000).toFixed(2) + 'B';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
  return Math.round(n).toString();
}

export function formatNumberFull(n) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatCurrency(amount, currency = 'USD') {
  const symbols = { USD: '$', IQD: '\u062f.\u0639' };
  return symbols[currency] + formatNumberFull(amount);
}

// Validation utilities
export function validateField(fieldName, value) {
  const rules = VALIDATION_RULES[fieldName];
  if (!rules) return { valid: true };

  const errors = [];

  // Required validation
  if (rules.required && (!value || value === '')) {
    errors.push(ERROR_MESSAGES.required);
  }

  // Type validation
  const numValue = parseFloat(value);
  if (value !== '' && isNaN(numValue)) {
    errors.push(ERROR_MESSAGES.invalid);
    return { valid: false, errors };
  }

  // Range validation
  if (rules.min !== undefined && numValue < rules.min) {
    errors.push(ERROR_MESSAGES.min.replace('{min}', rules.min));
  }

  if (rules.max !== undefined && numValue > rules.max) {
    errors.push(ERROR_MESSAGES.max.replace('{max}', rules.max));
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateForm(formData) {
  const errors = {};
  let isValid = true;

  Object.entries(formData).forEach(([field, value]) => {
    const validation = validateField(field, value);
    if (!validation.valid) {
      errors[field] = validation.errors;
      isValid = false;
    }
  });

  // Business logic validation
  const income = parseFloat(formData.monthlyIncome) || 0;
  const expenses = parseFloat(formData.monthlyExpenses) || 0;
  
  if (income < expenses) {
    errors.monthlyIncome = [ERROR_MESSAGES.incomeLessExpenses];
    errors.monthlyExpenses = [ERROR_MESSAGES.incomeLessExpenses];
    isValid = false;
  }

  return { isValid, errors };
}

// Currency conversion
export function convertToDollar(dinars, exchangeRate) {
  const rate = parseFloat(exchangeRate) || 1500;
  return dinars / rate;
}

export function convertToDinar(dollars, exchangeRate) {
  const rate = parseFloat(exchangeRate) || 1500;
  return dollars * rate;
}

// Input sanitization
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

export function sanitizeNumber(input) {
  const sanitized = sanitizeInput(input.toString());
  const number = parseFloat(sanitized.replace(/,/g, ''));
  return isNaN(number) ? 0 : number;
}

// Date utilities
export function formatDate(date, locale = 'ar-IQ') {
  return new Date(date).toLocaleDateString(locale);
}

export function getCurrentMonthYear(locale = 'ar-IQ') {
  const now = new Date();
  const months = [
    '\u064a\u0646\u0627\u064a\u0631', '\u0641\u0628\u0631\u0627\u064a\u0631', '\u0645\u0627\u0631\u0633', '\u0623\u0628\u0631\u064a\u0644',
    '\u0645\u0627\u064a\u0648', '\u064a\u0648\u0646\u064a\u0648', '\u064a\u0648\u0644\u064a\u0648', '\u0623\u063a\u0633\u0637\u0633',
    '\u0633\u0628\u062a\u0645\u0628\u0631', '\u0623\u0643\u062a\u0648\u0628\u0631', '\u0646\u0648\u0641\u0645\u0628\u0631', '\u062f\u064a\u0633\u0645\u0628\u0631'
  ];
  return months[now.getMonth()] + ' ' + now.getFullYear();
}

// DOM utilities
export function getElement(id) {
  return document.getElementById(id);
}

export function setValue(id, value) {
  const element = getElement(id);
  if (element) {
    element.value = value;
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

export function setText(id, text) {
  const element = getElement(id);
  if (element) {
    element.textContent = text;
  }
}

export function setHTML(id, html) {
  const element = getElement(id);
  if (element) {
    element.innerHTML = html;
  }
}

export function addClass(id, className) {
  const element = getElement(id);
  if (element) {
    element.classList.add(className);
  }
}

export function removeClass(id, className) {
  const element = getElement(id);
  if (element) {
    element.classList.remove(className);
  }
}

export function toggleClass(id, className) {
  const element = getElement(id);
  if (element) {
    element.classList.toggle(className);
  }
}

// Loading states
export function setLoading(id, loading = true) {
  const element = getElement(id);
  if (element) {
    if (loading) {
      element.classList.add('loading');
      element.setAttribute('aria-busy', 'true');
    } else {
      element.classList.remove('loading');
      element.removeAttribute('aria-busy');
    }
  }
}

export function setButtonLoading(button, loading = true) {
  if (loading) {
    button.disabled = true;
    button.classList.add('is-loading');
    button.setAttribute('aria-busy', 'true');
  } else {
    button.disabled = false;
    button.classList.remove('is-loading');
    button.removeAttribute('aria-busy');
  }
}

// Error handling
export function showError(fieldId, errors) {
  const field = getElement(fieldId);
  if (!field) return;

  // Remove existing error
  removeError(fieldId);

  // Add error styling
  field.classList.add('error');
  field.setAttribute('aria-invalid', 'true');
  field.setAttribute('aria-describedby', `${fieldId}-error`);

  // Create error message
  const errorElement = document.createElement('div');
  errorElement.id = `${fieldId}-error`;
  errorElement.className = 'error-message';
  errorElement.setAttribute('role', 'alert');
  errorElement.textContent = Array.isArray(errors) ? errors[0] : errors;

  // Insert error message
  field.parentNode.insertBefore(errorElement, field.nextSibling);
}

export function removeError(fieldId) {
  const field = getElement(fieldId);
  if (!field) return;

  field.classList.remove('error');
  field.removeAttribute('aria-invalid');
  field.removeAttribute('aria-describedby');

  const errorElement = getElement(`${fieldId}-error`);
  if (errorElement) {
    errorElement.remove();
  }
}

export function clearAllErrors() {
  document.querySelectorAll('.error-message').forEach(el => el.remove());
  document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
  document.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
  document.querySelectorAll('[aria-describedby]').forEach(el => el.removeAttribute('aria-describedby'));
}

// Animation utilities
export function animateValue(element, start, end, duration = 1000) {
  const startTime = performance.now();
  const startValue = parseFloat(start) || 0;
  const endValue = parseFloat(end) || 0;
  const difference = endValue - startValue;

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function
    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
    const currentValue = startValue + (difference * easeOutQuart);
    
    element.textContent = formatNumberFull(Math.round(currentValue));

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

export function fadeIn(element, duration = 300) {
  element.style.opacity = '0';
  element.style.display = 'block';
  
  const startTime = performance.now();
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    element.style.opacity = progress.toString();

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

export function fadeOut(element, duration = 300) {
  const startTime = performance.now();
  const startOpacity = parseFloat(element.style.opacity) || 1;
  
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    element.style.opacity = (startOpacity * (1 - progress)).toString();

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.style.display = 'none';
    }
  }

  requestAnimationFrame(update);
}

// Storage utilities
export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save to storage:', error);
    return false;
  }
}

export function loadFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to load from storage:', error);
    return defaultValue;
  }
}

export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to remove from storage:', error);
    return false;
  }
}

// Debounce utility
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle utility
export function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Accessibility utilities
export function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

export function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  function handleKeydown(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }
  }

  element.addEventListener('keydown', handleKeydown);
  
  return {
    remove: () => element.removeEventListener('keydown', handleKeydown)
  };
}

// Performance utilities
export function measurePerformance(name, fn) {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
  return result;
}

export function createLazyLoadObserver(callback, options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver(callback, { ...defaultOptions, ...options });
  return observer;
}
