// Authentication JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initAuthForms();
    initPasswordToggles();
    initPasswordStrength();
    initSocialLogin();
});

// Initialize mobile menu
function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            
            // Toggle icon
            const icon = this.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close menu when clicking on links
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                const icon = mobileToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
}

// Initialize authentication forms
function initAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
        loginForm.setAttribute('data-auth-handled', 'true');
        loginForm.addEventListener('submit', handleLogin);
        initAuthFormValidation(loginForm);
    }

    if (registerForm) {
        registerForm.setAttribute('data-auth-handled', 'true');
        registerForm.addEventListener('submit', handleRegister);
        initAuthFormValidation(registerForm);
    }
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.submit-btn') || form.querySelector('.auth-btn-primary');
    const formData = new FormData(form);
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Clear previous errors
    clearFormErrors(form);
    
    try {
        // Validate form
        if (!validateLoginForm(form)) {
            throw new Error('Please fix the errors below');
        }
        
        // Real API call to backend
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password')
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Success
        showMessage('Login successful! Redirecting...', 'success');
        
        // Store user data in localStorage for frontend use
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect after success
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
        
    } catch (error) {
        showMessage(error.message || 'Login failed. Please try again.', 'error');
    } finally {
        // Reset loading state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Handle register form submission
async function handleRegister(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('.submit-btn') || form.querySelector('.auth-btn-primary');
    const formData = new FormData(form);
    
    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Clear previous errors
    clearFormErrors(form);
    
    try {
        // Validate form
        if (!validateRegisterForm(form)) {
            throw new Error('Please fix the errors below');
        }
        
        // Prepare the request data
        const requestData = {
            name: `${formData.get('firstName')} ${formData.get('lastName')}`,
            email: formData.get('email'),
            password: formData.get('password'),
            phone: formData.get('phone') || '',
            location: formData.get('location') || ''
        };
        

        
        // Real API call to backend
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        const data = await response.json();

        
        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }
        
        // Success
        showMessage('Account created successfully! You can now login.', 'success');
        
        // Store user data in localStorage for frontend use
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect after success
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        
    } catch (error) {
        showMessage(error.message || 'Registration failed. Please try again.', 'error');
    } finally {
        // Reset loading state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Validate login form
function validateLoginForm(form) {
    let isValid = true;
    
    const email = form.querySelector('#email');
    const password = form.querySelector('#password');
    
    // Email validation
    if (!email.value.trim()) {
        showFieldError('emailError', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email.value)) {
        showFieldError('emailError', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Password validation
    if (!password.value.trim()) {
        showFieldError('passwordError', 'Password is required');
        isValid = false;
    } else if (password.value.length < 6) {
        showFieldError('passwordError', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    return isValid;
}

// Validate register form
function validateRegisterForm(form) {
    let isValid = true;
    
    const firstName = form.querySelector('#firstName');
    const lastName = form.querySelector('#lastName');
    const email = form.querySelector('#email');
    const phone = form.querySelector('#phone');
    const location = form.querySelector('#location');
    const password = form.querySelector('#password');
    const confirmPassword = form.querySelector('#confirmPassword');
    const agreeTerms = form.querySelector('#agreeTerms');
    
    // First name validation
    if (!firstName.value.trim()) {
        showFieldError('firstNameError', 'First name is required');
        isValid = false;
    } else if (firstName.value.trim().length < 2) {
        showFieldError('firstNameError', 'First name must be at least 2 characters');
        isValid = false;
    }
    
    // Last name validation
    if (!lastName.value.trim()) {
        showFieldError('lastNameError', 'Last name is required');
        isValid = false;
    } else if (lastName.value.trim().length < 2) {
        showFieldError('lastNameError', 'Last name must be at least 2 characters');
        isValid = false;
    }
    
    // Email validation
    if (!email.value.trim()) {
        showFieldError('emailError', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email.value)) {
        showFieldError('emailError', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Phone validation
    if (!phone.value.trim()) {
        showFieldError('phoneError', 'Phone number is required');
        isValid = false;
    } else if (!isValidPhone(phone.value)) {
        showFieldError('phoneError', 'Please enter a valid phone number');
        isValid = false;
    }
    
    // Location validation
    if (!location.value.trim()) {
        showFieldError('locationError', 'Location is required');
        isValid = false;
    } else if (location.value.trim().length < 2) {
        showFieldError('locationError', 'Please enter a valid location');
        isValid = false;
    }
    
    // Password validation
    if (!password.value.trim()) {
        showFieldError('passwordError', 'Password is required');
        isValid = false;
    } else if (password.value.length < 6) {
        showFieldError('passwordError', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    // Confirm password validation
    if (!confirmPassword.value.trim()) {
        showFieldError('confirmPasswordError', 'Please confirm your password');
        isValid = false;
    } else if (password.value !== confirmPassword.value) {
        showFieldError('confirmPasswordError', 'Passwords do not match');
        isValid = false;
    }
    
    // Terms agreement validation
    if (!agreeTerms.checked) {
        showFieldError('agreeTermsError', 'You must agree to the terms and conditions');
        isValid = false;
    }
    
    return isValid;
}

// Initialize form validation (real-time)
function initAuthFormValidation(form) {
    const inputs = form.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            // Clear error when user starts typing
            const errorId = this.id + 'Error';
            const errorElement = document.getElementById(errorId);
            if (errorElement) {
                errorElement.classList.remove('show');
            }
        });
    });
}

// Validate individual field
function validateField(field) {
    const fieldId = field.id;
    const value = field.value.trim();
    const errorId = fieldId + 'Error';
    
    switch (fieldId) {
        case 'email':
            if (!value) {
                showFieldError(errorId, 'Email is required');
            } else if (!isValidEmail(value)) {
                showFieldError(errorId, 'Please enter a valid email address');
            }
            break;
            
        case 'firstName':
        case 'lastName':
            if (!value) {
                showFieldError(errorId, `${fieldId === 'firstName' ? 'First' : 'Last'} name is required`);
            } else if (value.length < 2) {
                showFieldError(errorId, `${fieldId === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`);
            }
            break;
            
        case 'phone':
            if (!value) {
                showFieldError(errorId, 'Phone number is required');
            } else if (!isValidPhone(value)) {
                showFieldError(errorId, 'Please enter a valid phone number');
            }
            break;
            
        case 'location':
            if (!value) {
                showFieldError(errorId, 'Location is required');
            } else if (value.length < 2) {
                showFieldError(errorId, 'Please enter a valid location');
            }
            break;
            
        case 'password':
            if (!value) {
                showFieldError(errorId, 'Password is required');
            } else if (value.length < 6) {
                showFieldError(errorId, 'Password must be at least 6 characters');
            }
            break;
            
        case 'confirmPassword':
            const password = document.getElementById('password');
            if (!value) {
                showFieldError(errorId, 'Please confirm your password');
            } else if (password && password.value !== value) {
                showFieldError(errorId, 'Passwords do not match');
            }
            break;
    }
}

// Initialize password toggles
function initPasswordToggles() {
    const toggles = document.querySelectorAll('.password-toggle');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

// Initialize password strength indicator
function initPasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthIndicator = document.getElementById('passwordStrength');
    
    if (passwordInput && strengthIndicator) {
        const strengthBar = strengthIndicator.querySelector('.strength-fill');
        const strengthText = strengthIndicator.querySelector('.strength-text');
        
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = calculatePasswordStrength(password);
            
            // Update strength bar
            strengthBar.style.width = `${strength.score}%`;
            strengthText.textContent = strength.text;
            
            // Update colors based on strength
            if (strength.score < 30) {
                strengthBar.style.background = '#ef4444';
            } else if (strength.score < 70) {
                strengthBar.style.background = '#f59e0b';
            } else {
                strengthBar.style.background = '#10b981';
            }
        });
    }
}

// Calculate password strength
function calculatePasswordStrength(password) {
    let score = 0;
    let text = 'Very Weak';
    
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    if (password.length >= 16) score += 10;
    
    if (score >= 80) text = 'Very Strong';
    else if (score >= 60) text = 'Strong';
    else if (score >= 40) text = 'Medium';
    else if (score >= 20) text = 'Weak';
    
    return { score, text };
}

// Initialize social login
function initSocialLogin() {
    const socialBtns = document.querySelectorAll('.social-btn');
    
    socialBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const provider = this.classList.contains('google-btn') ? 'Google' : 'Facebook';
            showMessage(`${provider} login will be implemented soon!`, 'info');
        });
    });
}

// Utility functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // Remove all non-digit characters and check if it's a reasonable length
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
}

function isStrongPassword(password) {
    return password.length >= 6;
}

function showFieldError(errorId, message) {
    const errorElement = document.getElementById(errorId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function clearFormErrors(form) {
    const errors = form.querySelectorAll('.form-error');
    errors.forEach(error => {
        error.classList.remove('show');
        error.textContent = '';
    });
}

function simulateApiCall() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate random success/failure for demo
            if (Math.random() > 0.1) { // 90% success rate
                resolve();
            } else {
                reject(new Error('Server error. Please try again.'));
            }
        }, 1500);
    });
}

// Message system (reuse from main.js if available)
function showMessage(message, type = 'info') {
    // Check if main.js showMessage is available and different from this one
    if (typeof window.showMessage === 'function' && window.showMessage !== showMessage) {
        window.showMessage(message, type);
        return;
    }
    
    // Fallback message system
    const container = document.getElementById('messageContainer');
    if (!container) return;
    
    const messageEl = document.createElement('div');
    messageEl.className = `message-popup ${type}`;
    messageEl.innerHTML = `
        <div class="message-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="message-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(messageEl);
    
    // Show the message
    setTimeout(() => {
        messageEl.classList.add('show');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.remove();
        }
    }, 5000);
    
    // Close button functionality
    const closeBtn = messageEl.querySelector('.message-close');
    closeBtn.addEventListener('click', () => {
        messageEl.remove();
    });
}
