// DonateKart Main JavaScript - Enhanced UI Interactions
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all interactive components
    initMobileMenu();
    initScrollAnimations();
    initStatsCounter();
    initFormValidation();
    initMessageSystem();
    initSmoothScrolling();
});

// Mobile Menu Toggle
function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            const icon = this.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.replace('fa-bars', 'fa-times');
            } else {
                icon.classList.replace('fa-times', 'fa-bars');
            }
        });
    }
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll(
        '.feature-card, .floating-card, .hero-text, .hero-image, .section-title'
    );
    
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

// Stats Counter Animation
function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const animateCounter = (element) => {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60fps
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };
        
        updateCounter();
    };

    // Intersection observer for stats
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target.querySelector('.stat-number');
                if (statNumber && !statNumber.classList.contains('animated')) {
                    statNumber.classList.add('animated');
                    animateCounter(statNumber);
                }
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-item').forEach(item => {
        statsObserver.observe(item);
    });
}

// Enhanced Form Validation
function initFormValidation() {
    const forms = document.querySelectorAll('form:not(#loginForm):not(#registerForm):not(#donationForm):not(#requestForm):not(#donorForm):not(#requestorForm):not(#newRequestForm)');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('.form-input');
        
        inputs.forEach(input => {
            // Real-time validation
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
        
        // Form submission - only if not already handled by auth.js
        if (!form.hasAttribute('data-auth-handled')) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                let isValid = true;
                inputs.forEach(input => {
                    if (!validateField(input)) {
                        isValid = false;
                    }
                });
                
                if (isValid) {
                    submitForm(this);
                }
            });
        }
    });
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    const errorElement = field.parentNode.querySelector('.form-error');
    
    let isValid = true;
    let errorMessage = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Email validation
    if (fieldName === 'contactInfo' && value && !isValidEmail(value) && !isValidPhone(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid email or phone number';
    }
    
    // URL validation
    if (field.type === 'url' && value && !isValidURL(value)) {
        isValid = false;
        errorMessage = 'Please enter a valid URL';
    }
    
    // Display error
    if (!isValid) {
        field.classList.add('error');
        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.style.display = 'block';
        }
    } else {
        field.classList.remove('error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
    
    return isValid;
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.form-error');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

async function submitForm(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Determine the correct API endpoint based on form ID
        let endpoint = '/api/donate';
        // Note: donationForm is handled by donate.js, so this should not be reached
        
        const response = await fetch(form.action || endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            showMessage('Success! Your donation has been posted.', 'success');
            form.reset();
        } else {
            throw new Error('Failed to submit form');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        showMessage('Sorry, there was an error submitting your donation. Please try again.', 'error');
    } finally {
        // Hide loading state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Message System
function initMessageSystem() {
    // Auto-hide messages after 5 seconds
    const messages = document.querySelectorAll('.message-popup.show');
    messages.forEach(message => {
        setTimeout(() => {
            hideMessage(message);
        }, 5000);
    });
}

function showMessage(text, type = 'info') {
    const messageContainer = document.getElementById('message') || createMessageContainer();
    
    messageContainer.textContent = text;
    messageContainer.className = `message-popup ${type}`;
    
    // Trigger animation
    setTimeout(() => {
        messageContainer.classList.add('show');
    }, 100);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideMessage(messageContainer);
    }, 5000);
}

function hideMessage(messageElement) {
    messageElement.classList.remove('show');
}

function createMessageContainer() {
    const container = document.createElement('div');
    container.id = 'message';
    container.className = 'message-popup';
    document.body.appendChild(container);
    return container;
}

// Smooth Scrolling
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Utility Functions
function debounce(func, wait) {
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

// Add CSS classes for animations
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        animation: fadeInUp 0.6s ease-out forwards;
    }
    
    .form-input.error {
        border-color: #ef4444;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    
    @media (max-width: 768px) {
        .nav-links.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border-top: 1px solid rgba(236, 72, 153, 0.1);
            padding: 1rem;
            box-shadow: 0 4px 20px rgba(236, 72, 153, 0.15);
        }
        
        .nav-links.active a {
            padding: 0.75rem 1rem;
            margin: 0.25rem 0;
            border-radius: 0.5rem;
        }
    }
`;
document.head.appendChild(style);

// Export functions for use in other scripts
window.DonateKart = {
    showMessage,
    hideMessage,
    validateField,
    debounce
};
