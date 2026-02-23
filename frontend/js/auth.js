// Autenticación de usuarios
document.addEventListener('DOMContentLoaded', function() {
    const loginSubmit = document.getElementById('login-submit');
    const registerSubmit = document.getElementById('register-submit');

    // Credenciales válidas
    const validCredentials = {
        email: 'admin@iafinance.com',
        password: 'Admin123!'
    };

    // Manejar login
    if (loginSubmit) {
        loginSubmit.addEventListener('click', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const rememberMe = document.getElementById('remember-me').checked;

            // Validación básica
            if (!email || !password) {
                showNotification('Por favor completa todos los campos', 'error');
                return;
            }

            // Simular validación con API
            simulateLogin(email, password, rememberMe);
        });
    }

    // Manejar registro
    if (registerSubmit) {
        registerSubmit.addEventListener('click', function(e) {
            e.preventDefault();
            
            const firstName = document.getElementById('first-name').value;
            const lastName = document.getElementById('last-name').value;
            const email = document.getElementById('register-email').value;
            const confirmEmail = document.getElementById('confirm-email').value;
            const password = document.getElementById('register-password').value;
            const terms = document.getElementById('terms').checked;

            // Validaciones
            if (!firstName || !lastName || !email || !confirmEmail || !password) {
                showNotification('Por favor completa todos los campos', 'error');
                return;
            }

            if (email !== confirmEmail) {
                showNotification('Los emails no coinciden', 'error');
                return;
            }

            if (!terms) {
                showNotification('Debes aceptar los términos y condiciones', 'error');
                return;
            }

            // Validar fortaleza de contraseña
            if (!validatePasswordStrength(password)) {
                showNotification('La contraseña no cumple con los requisitos de seguridad', 'error');
                return;
            }

            // Simular registro
            simulateRegister(firstName, lastName, email, password);
        });
    }

    // Login con Google
    const googleLogin = document.getElementById('google-login');
    if (googleLogin) {
        googleLogin.addEventListener('click', function() {
            showNotification('Redirigiendo a Google para autenticación...', 'info');
            // En una implementación real, aquí iría la integración con Google OAuth
            setTimeout(() => {
                showNotification('Funcionalidad de Google Login en desarrollo', 'info');
            }, 1500);
        });
    }

    // Login con Microsoft
    const microsoftLogin = document.getElementById('microsoft-login');
    if (microsoftLogin) {
        microsoftLogin.addEventListener('click', function() {
            showNotification('Redirigiendo a Microsoft para autenticación...', 'info');
            // En una implementación real, aquí iría la integración con Microsoft OAuth
            setTimeout(() => {
                showNotification('Funcionalidad de Microsoft Login en desarrollo', 'info');
            }, 1500);
        });
    }

    // Funciones de simulación
    function simulateLogin(email, password, rememberMe) {
        showNotification('Verificando credenciales...', 'info');
        
        // Simular delay de red
        setTimeout(() => {
            if (email === validCredentials.email && password === validCredentials.password) {
                showNotification('¡Acceso exitoso! Redirigiendo al dashboard...', 'success');
                
                // Guardar sesión si se seleccionó "Mantener sesión"
                if (rememberMe) {
                    localStorage.setItem('iafinance_user', JSON.stringify({
                        email: email,
                        timestamp: new Date().getTime()
                    }));
                }
                
                // Redirigir (en producción iría al dashboard real)
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            } else {
                showNotification('Credenciales incorrectas. Usa: admin@iafinance.com / Admin123!', 'error');
            }
        }, 1500);
    }

    function simulateRegister(firstName, lastName, email, password) {
        showNotification('Creando cuenta premium...', 'info');
        
        setTimeout(() => {
            // Simular éxito en registro
            const userData = {
                firstName: firstName,
                lastName: lastName,
                email: email,
                createdAt: new Date().toISOString(),
                premium: true
            };
            
            // Guardar en localStorage (simulando base de datos)
            localStorage.setItem('iafinance_new_user', JSON.stringify(userData));
            
            showNotification('¡Cuenta creada exitosamente! Revisa tu email para confirmar.', 'success');
            
            // Cambiar a formulario de login después de 3 segundos
            setTimeout(() => {
                document.getElementById('login-toggle').click();
                document.getElementById('login-email').value = email;
            }, 3000);
        }, 2000);
    }

    function validatePasswordStrength(password) {
        // Mínimo 8 caracteres
        if (password.length < 8) return false;
        
        // Al menos una mayúscula
        if (!/[A-Z]/.test(password)) return false;
        
        // Al menos un número
        if (!/\d/.test(password)) return false;
        
        // Al menos un carácter especial
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
        
        return true;
    }
});