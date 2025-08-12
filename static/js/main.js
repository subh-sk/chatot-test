// Main JavaScript file for FastAPI Web App

document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations
    initAnimations();
    
    // Initialize navigation effects
    initNavEffects();
});

// Function to initialize animations
function initAnimations() {
    // Animate navbar items with staggered delay
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach((item, index) => {
        gsap.from(item, {
            opacity: 0,
            y: -20,
            delay: 0.2 + (index * 0.1),
            duration: 0.5,
            ease: "power2.out"
        });
    });
    
    // Animate logo
    gsap.from('.logo', {
        opacity: 0,
        x: -30,
        duration: 0.8,
        ease: "back.out(1.7)"
    });
    
    // Check if we're on the home page and animate hero section
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        gsap.from('.hero-content', {
            opacity: 0,
            x: -50,
            duration: 1,
            delay: 0.5
        });
        
        gsap.from('.hero-image', {
            opacity: 0,
            x: 50,
            duration: 1,
            delay: 0.7
        });
    }
}

// Function to initialize navigation effects
function initNavEffects() {
    // Add active class to current page nav item
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-item');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
        }
    });
    
    // Add hover effects to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            gsap.to(this, {scale: 1.05, duration: 0.3});
        });
        
        button.addEventListener('mouseleave', function() {
            gsap.to(this, {scale: 1, duration: 0.3});
        });
    });
}

// Form validation functions
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return true;
    
    let isValid = true;
    const inputs = form.querySelectorAll('input[required]');
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            markInvalid(input, 'This field is required');
            isValid = false;
        } else {
            markValid(input);
            
            // Email validation
            if (input.type === 'email' && !validateEmail(input.value)) {
                markInvalid(input, 'Please enter a valid email address');
                isValid = false;
            }
            
            // Password validation (if needed)
            if (input.type === 'password' && input.value.length < 6) {
                markInvalid(input, 'Password must be at least 6 characters');
                isValid = false;
            }
        }
    });
    
    return isValid;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function markInvalid(input, message) {
    input.classList.add('invalid');
    
    // Create or update error message
    let errorDiv = input.nextElementSibling;
    if (!errorDiv || !errorDiv.classList.contains('error-text')) {
        errorDiv = document.createElement('div');
        errorDiv.classList.add('error-text');
        input.parentNode.insertBefore(errorDiv, input.nextSibling);
    }
    
    errorDiv.textContent = message;
    
    // Shake animation for invalid input
    gsap.to(input, {
        x: [-5, 5, -5, 5, 0],
        duration: 0.4,
        ease: "power2.out"
    });
}

function markValid(input) {
    input.classList.remove('invalid');
    
    // Remove error message if exists
    const errorDiv = input.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('error-text')) {
        errorDiv.remove();
    }
}

// Add form validation to login and signup forms
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form[action="/login"]');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            if (!validateForm('login-form')) {
                e.preventDefault();
            }
        });
    }
    
    const signupForm = document.querySelector('form[action="/signup"]');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            if (!validateForm('signup-form')) {
                e.preventDefault();
            }
        });
    }
});