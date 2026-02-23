// Validaciones de formularios en tiempo real
document.addEventListener('DOMContentLoaded', function() {
    // Validación de email en login
    const loginEmail = document.getElementById('login-email');
    if (loginEmail) {
        loginEmail.addEventListener('blur', function() {
            validateEmailField(this);
        });
    }

    // Validación de email en registro
    const registerEmail = document.getElementById('register-email');
    if (registerEmail) {
        registerEmail.addEventListener('blur', function() {
            validateEmailField(this);
            validateEmailMatch();
        });
    }

    const confirmEmail = document.getElementById('confirm-email');
    if (confirmEmail) {
        confirmEmail.addEventListener('blur', validateEmailMatch);
    }

    // Validación de contraseña en registro
    const registerPassword = document.getElementById('register-password');
    if (registerPassword) {
        registerPassword.addEventListener('input', validatePasswordStrength);
    }

    // Validación de nombre
    const firstName = document.getElementById('first-name');
    const lastName = document.getElementById('last-name');
    
    if (firstName) {
        firstName.addEventListener('blur', function() {
            validateNameField(this);
        });
    }
    
    if (lastName) {
        lastName.addEventListener('blur', function() {
            validateNameField(this);
        });
    }

    // Funciones de validación
    function validateEmailField(field) {
        const errorElement = document.getElementById(field.id + '-error');
        const email = field.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!email) {
            showFieldError(field, errorElement, 'El email es requerido');
            return false;
        }
        
        if (!emailRegex.test(email)) {
            showFieldError(field, errorElement, 'Por favor ingresa un email válido');
            return false;
        }
        
        clearFieldError(field, errorElement);
        return true;
    }

    function validateEmailMatch() {
        const email = document.getElementById('register-email');
        const confirm = document.getElementById('confirm-email');
        const errorElement = document.getElementById('confirm-email-error');
        
        if (!email || !confirm || !email.value || !confirm.value) return;
        
        if (email.value !== confirm.value) {
            showFieldError(confirm, errorElement, 'Los emails no coinciden');
            return false;
        }
        
        clearFieldError(confirm, errorElement);
        return true;
    }

    function validatePasswordStrength() {
        const password = this.value;
        const strengthBar = document.querySelector('#register-password-strength .strength-bar');
        const strengthText = document.querySelector('#register-password-strength .strength-text span');
        const requirements = {
            length: document.getElementById('req-length'),
            uppercase: document.getElementById('req-uppercase'),
            number: document.getElementById('req-number'),
            special: document.getElementById('req-special')
        };

        // Resetear estados
        Object.values(requirements).forEach(req => {
            req.classList.remove('valid', 'invalid');
        });

        let score = 0;
        const totalChecks = 4;

        // Longitud mínima
        if (password.length >= 8) {
            requirements.length.classList.add('valid');
            score++;
        } else {
            requirements.length.classList.add('invalid');
        }

        // Mayúscula
        if (/[A-Z]/.test(password)) {
            requirements.uppercase.classList.add('valid');
            score++;
        } else {
            requirements.uppercase.classList.add('invalid');
        }

        // Número
        if (/\d/.test(password)) {
            requirements.number.classList.add('valid');
            score++;
        } else {
            requirements.number.classList.add('invalid');
        }

        // Carácter especial
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            requirements.special.classList.add('valid');
            score++;
        } else {
            requirements.special.classList.add('invalid');
        }

        // Actualizar barra de fortaleza
        const percentage = (score / totalChecks) * 100;
        strengthBar.style.width = percentage + '%';
        
        // Actualizar texto
        let strengthLevel = 'Débil';
        let color = '#f44336';
        
        if (percentage >= 75) {
            strengthLevel = 'Fuerte';
            color = '#4CAF50';
        } else if (percentage >= 50) {
            strengthLevel = 'Media';
            color = '#FF9800';
        }
        
        strengthBar.style.backgroundColor = color;
        strengthText.textContent = strengthLevel;
        strengthText.style.color = color;

        return score === totalChecks;
    }

    function validateNameField(field) {
        const errorElement = document.getElementById(field.id + '-error');
        const name = field.value.trim();
        
        if (!name) {
            showFieldError(field, errorElement, 'Este campo es requerido');
            return false;
        }
        
        if (name.length < 2) {
            showFieldError(field, errorElement, 'Debe tener al menos 2 caracteres');
            return false;
        }
        
        clearFieldError(field, errorElement);
        return true;
    }

    // Funciones auxiliares
    function showFieldError(field, errorElement, message) {
        field.classList.add('error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    function clearFieldError(field, errorElement) {
        field.classList.remove('error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }
});
