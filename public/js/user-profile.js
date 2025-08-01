// User Profile Management System
class UserProfile {
    constructor() {
        this.user = null;
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.updateUI();
        this.initLogout();
    }

    // Check if user is authenticated
    checkAuthStatus() {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                this.user = JSON.parse(userData);
                this.verifySession();
            } catch (error) {
                console.error('Error parsing user data:', error);
                this.logout();
            }
        }
    }

    // Verify session with backend
    async verifySession() {
        try {
            const response = await fetch('/api/auth/profile');
            if (!response.ok) {
                this.logout();
                return;
            }
            const data = await response.json();
            this.user = data.user;
            localStorage.setItem('user', JSON.stringify(data.user));
        } catch (error) {
            console.error('Session verification failed:', error);
            this.logout();
        }
    }

    // Update UI based on authentication status
    updateUI() {
        const navLinks = document.querySelector('.nav-links');
        if (!navLinks) return;

        if (this.user) {
            // User is logged in
            this.showAuthenticatedUI(navLinks);
        } else {
            // User is not logged in
            this.showUnauthenticatedUI(navLinks);
        }
    }

    // Show UI for authenticated users
    showAuthenticatedUI(navLinks) {
        // Remove login/register buttons
        const loginBtn = navLinks.querySelector('a[href="login.html"]');
        const registerBtn = navLinks.querySelector('a[href="register.html"]');
        if (loginBtn) loginBtn.remove();
        if (registerBtn) registerBtn.remove();

        // Add user profile section
        const userSection = document.createElement('div');
        userSection.className = 'user-section';
        userSection.innerHTML = `
            <div class="user-info">
                <span class="user-name">Welcome, ${this.user.name}</span>
                <button class="logout-btn" onclick="userProfile.logout()">
                    <i class="fas fa-sign-out-alt"></i>
                    Logout
                </button>
            </div>
        `;
        navLinks.appendChild(userSection);

        // Update page-specific content
        this.updatePageContent();
    }

    // Show UI for unauthenticated users
    showUnauthenticatedUI(navLinks) {
        // Remove user section if exists
        const userSection = navLinks.querySelector('.user-section');
        if (userSection) userSection.remove();

        // Add login/register buttons if not already present
        if (!navLinks.querySelector('a[href="login.html"]')) {
            const loginBtn = document.createElement('a');
            loginBtn.href = 'login.html';
            loginBtn.className = 'btn btn-primary';
            loginBtn.textContent = 'Login';
            navLinks.appendChild(loginBtn);
        }

        if (!navLinks.querySelector('a[href="register.html"]')) {
            const registerBtn = document.createElement('a');
            registerBtn.href = 'register.html';
            registerBtn.className = 'btn btn-secondary';
            registerBtn.textContent = 'Register';
            navLinks.appendChild(registerBtn);
        }
    }

    // Update page-specific content
    updatePageContent() {
        const currentPage = window.location.pathname.split('/').pop();
        
        switch (currentPage) {
            case 'index.html':
            case '':
                this.updateHomePage();
                break;
            case 'donate.html':
                this.updateDonatePage();
                break;
            case 'items.html':
                this.updateItemsPage();
                break;
            case 'my-requests.html':
                this.updateMyRequestsPage();
                break;
            case 'my-donations.html':
                this.updateMyDonationsPage();
                break;
        }
    }

    // Update home page with personalized content
    updateHomePage() {
        const heroSection = document.querySelector('.hero-section');
        if (heroSection && this.user) {
            const heroTitle = heroSection.querySelector('.hero-title');
            if (heroTitle) {
                heroTitle.innerHTML = `Welcome back, ${this.user.name}!`;
            }
        }
    }

    // Update donate page with user info
    updateDonatePage() {
        if (!this.user) return;

        const donorNameField = document.getElementById('donorName');
        const contactInfoField = document.getElementById('contactInfo');
        const locationField = document.getElementById('location');

        if (donorNameField && !donorNameField.value) {
            donorNameField.value = this.user.name;
        }
        if (contactInfoField && !contactInfoField.value) {
            contactInfoField.value = this.user.phone || this.user.email;
        }
        if (locationField && !locationField.value) {
            locationField.value = this.user.location;
        }
    }

    // Update items page
    updateItemsPage() {
        // Add user-specific features if needed
    }

    // Update my requests page
    updateMyRequestsPage() {
        if (!this.user) return;

        const requestorForm = document.getElementById('requestorForm');
        if (requestorForm) {
            const nameField = requestorForm.querySelector('#requestorName');
            if (nameField && !nameField.value) {
                nameField.value = this.user.name;
            }
        }
    }

    // Update my donations page
    updateMyDonationsPage() {
        if (!this.user) return;

        const donorForm = document.getElementById('donorForm');
        if (donorForm) {
            const nameField = donorForm.querySelector('#donorName');
            if (nameField && !nameField.value) {
                nameField.value = this.user.name;
            }
        }
    }

    // Initialize logout functionality
    initLogout() {
        // Logout button is created dynamically in showAuthenticatedUI
    }

    // Logout user
    async logout() {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Clear local storage
                localStorage.removeItem('user');
                this.user = null;
                
                // Update UI
                this.updateUI();
                
                // Show success message
                if (typeof showMessage === 'function') {
                    showMessage('Logged out successfully', 'success');
                }
                
                // Redirect to home page
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            }
        } catch (error) {
            console.error('Logout failed:', error);
            // Force logout by clearing local storage
            localStorage.removeItem('user');
            this.user = null;
            this.updateUI();
        }
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.user !== null;
    }
}

// Initialize user profile system
let userProfile;
document.addEventListener('DOMContentLoaded', function() {
    userProfile = new UserProfile();
}); 