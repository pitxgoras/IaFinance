// IA Finance - App Principal
document.addEventListener('DOMContentLoaded', function() {
    console.log('IA Finance Platform - Inicializando...');
    
    // Ocultar overlay de carga inmediatamente
    hideLoadingOverlay();
    
    // Inicializar la aplicación
    initApp();
    
    function hideLoadingOverlay() {
        const loadingOverlay = document.getElementById('loading-overlay');
        const mainContainer = document.getElementById('main-container');
        
        if (loadingOverlay && mainContainer) {
            // Ocultar overlay después de 500ms (solo para efecto visual)
            setTimeout(() => {
                loadingOverlay.style.opacity = '0';
                loadingOverlay.style.transition = 'opacity 0.5s ease';
                
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                    mainContainer.style.display = 'flex';
                    
                    // Pequeño retraso para animación de entrada
                    setTimeout(() => {
                        mainContainer.style.opacity = '1';
                    }, 50);
                }, 500);
            }, 500);
        } else {
            // Si hay error, mostrar contenido de todos modos
            if (mainContainer) mainContainer.style.display = 'flex';
            console.log('Elementos del DOM no encontrados, continuando...');
        }
    }
    
    function initApp() {
        console.log('Inicializando funcionalidades...');
        
        // Configurar eventos básicos primero
        setupBasicEvents();
        setupFormToggle();
        setupPasswordToggles();
        
        // Configurar login y registro
        setupLogin();
        setupRegister();
        
        // Configurar modal de recuperación
        setupRecoveryModal();
        
        console.log('Aplicación inicializada correctamente');
    }
    
    function setupBasicEvents() {
        console.log('Configurando eventos básicos...');
        
        // Validación en tiempo real para registro
        const registerPassword = document.getElementById('register-password');
        if (registerPassword) {
            registerPassword.addEventListener('input', function(e) {
                validatePasswordStrength(e.target.value);
            });
        }
        
        // Enlaces para cambiar entre formularios
        const goToRegister = document.getElementById('go-to-register');
        const goToLogin = document.getElementById('go-to-login');
        
        if (goToRegister) {
            goToRegister.addEventListener('click', function(e) {
                e.preventDefault();
                switchToForm('register');
            });
        }
        
        if (goToLogin) {
            goToLogin.addEventListener('click', function(e) {
                e.preventDefault();
                switchToForm('login');
            });
        }
    }
    
    function setupFormToggle() {
        console.log('Configurando toggle de formularios...');
        
        const loginToggle = document.getElementById('login-toggle');
        const registerToggle = document.getElementById('register-toggle');
        
        if (loginToggle) {
            loginToggle.addEventListener('click', function() {
                switchToForm('login');
            });
        }
        
        if (registerToggle) {
            registerToggle.addEventListener('click', function() {
                switchToForm('register');
            });
        }
    }
    
    function switchToForm(formType) {
        console.log('Cambiando a formulario:', formType);
        
        const loginToggle = document.getElementById('login-toggle');
        const registerToggle = document.getElementById('register-toggle');
        const toggleSlider = document.getElementById('toggle-slider');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        
        if (formType === 'login') {
            // Actualizar botones toggle
            if (loginToggle) loginToggle.classList.add('active');
            if (registerToggle) registerToggle.classList.remove('active');
            
            // Mover slider
            if (toggleSlider) toggleSlider.style.transform = 'translateX(0)';
            
            // Mostrar/ocultar formularios
            if (loginForm) {
                loginForm.classList.add('active');
                loginForm.style.display = 'block';
            }
            if (registerForm) {
                registerForm.classList.remove('active');
                registerForm.style.display = 'none';
            }
        } else {
            // Actualizar botones toggle
            if (registerToggle) registerToggle.classList.add('active');
            if (loginToggle) loginToggle.classList.remove('active');
            
            // Mover slider
            if (toggleSlider) toggleSlider.style.transform = 'translateX(100%)';
            
            // Mostrar/ocultar formularios
            if (registerForm) {
                registerForm.classList.add('active');
                registerForm.style.display = 'block';
            }
            if (loginForm) {
                loginForm.classList.remove('active');
                loginForm.style.display = 'none';
            }
        }
    }
    
    function setupPasswordToggles() {
        console.log('Configurando toggle de contraseñas...');
        
        const passwordToggles = document.querySelectorAll('.password-toggle');
        passwordToggles.forEach(toggle => {
            toggle.addEventListener('click', function() {
                const input = this.parentElement.querySelector('input');
                const icon = this.querySelector('i');
                
                if (input && icon) {
                    if (input.type === 'password') {
                        input.type = 'text';
                        icon.classList.remove('fa-eye');
                        icon.classList.add('fa-eye-slash');
                    } else {
                        input.type = 'password';
                        icon.classList.remove('fa-eye-slash');
                        icon.classList.add('fa-eye');
                    }
                }
            });
        });
    }
    
    function setupLogin() {
        console.log('Configurando login...');
        
        const loginSubmit = document.getElementById('login-submit');
        if (!loginSubmit) {
            console.error('Botón de login no encontrado');
            return;
        }
        
        loginSubmit.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Login iniciado...');
            
            const email = document.getElementById('login-email')?.value;
            const password = document.getElementById('login-password')?.value;
            
            console.log('Email:', email);
            console.log('Contraseña:', password ? '***' : 'vacía');
            
            // Validaciones básicas
            if (!email || !password) {
                showNotification('Por favor completa todos los campos', 'error');
                return;
            }
            
            // Verificar credenciales de prueba
            if (email === 'admin@iafinance.com' && password === 'Admin123!') {
                showNotification('¡Acceso exitoso! Credenciales correctas.', 'success');
                
                // Simular redirección después de 2 segundos
                setTimeout(() => {
                    showNotification('Redirigiendo al dashboard...', 'info');
                    // window.location.href = 'dashboard.html'; // Descomentar en producción
                }, 2000);
            } else {
                showNotification('Credenciales incorrectas. Usa: admin@iafinance.com / Admin123!', 'error');
            }
        });
    }
    
    function setupRegister() {
        console.log('Configurando registro...');
        
        const registerSubmit = document.getElementById('register-submit');
        if (!registerSubmit) {
            console.error('Botón de registro no encontrado');
            return;
        }
        
        registerSubmit.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Registro iniciado...');
            
            const firstName = document.getElementById('first-name')?.value;
            const lastName = document.getElementById('last-name')?.value;
            const email = document.getElementById('register-email')?.value;
            const confirmEmail = document.getElementById('confirm-email')?.value;
            const password = document.getElementById('register-password')?.value;
            const terms = document.getElementById('terms')?.checked;
            
            // Validaciones
            if (!firstName || !lastName || !email || !confirmEmail || !password) {
                showNotification('Por favor completa todos los campos', 'error');
                return;
            }
            
            if (email !== confirmEmail) {
                showNotification('Los emails no coinciden', 'error');
                return;
            }
            
            if (!validatePassword(password)) {
                showNotification('La contraseña no cumple los requisitos de seguridad', 'error');
                return;
            }
            
            if (!terms) {
                showNotification('Debes aceptar los términos y condiciones', 'error');
                return;
            }
            
            // Simular registro exitoso
            showNotification('¡Cuenta creada exitosamente! Revisa tu email para confirmar.', 'success');
            
            // Cambiar a login después de 2 segundos
            setTimeout(() => {
                switchToForm('login');
                // Prellenar email en login
                const loginEmail = document.getElementById('login-email');
                if (loginEmail) {
                    loginEmail.value = email;
                }
            }, 2000);
        });
    }
    
    function validatePassword(password) {
        // Validaciones básicas de contraseña
        if (password.length < 8) return false;
        if (!/[A-Z]/.test(password)) return false; // Al menos una mayúscula
        if (!/\d/.test(password)) return false; // Al menos un número
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false; // Al menos un carácter especial
        return true;
    }
    
    function validatePasswordStrength(password) {
        const strengthBar = document.querySelector('#register-password-strength .strength-bar');
        const strengthText = document.querySelector('#register-password-strength .strength-text span');
        
        if (!strengthBar || !strengthText) return;
        
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/\d/.test(password)) score++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
        
        const percentage = (score / 4) * 100;
        strengthBar.style.width = percentage + '%';
        
        // Determinar color y texto
        let color = '#f44336'; // Rojo (débil)
        let text = 'Débil';
        
        if (percentage >= 75) {
            color = '#4CAF50'; // Verde (fuerte)
            text = 'Fuerte';
        } else if (percentage >= 50) {
            color = '#FF9800'; // Naranja (media)
            text = 'Media';
        }
        
        strengthBar.style.backgroundColor = color;
        strengthText.textContent = text;
        strengthText.style.color = color;
        
        // Actualizar lista de requisitos
        updatePasswordRequirements(password);
    }
    
    function updatePasswordRequirements(password) {
        const requirements = {
            length: document.getElementById('req-length'),
            uppercase: document.getElementById('req-uppercase'),
            number: document.getElementById('req-number'),
            special: document.getElementById('req-special')
        };
        
        // Actualizar cada requisito
        if (requirements.length) {
            requirements.length.classList.toggle('valid', password.length >= 8);
            requirements.length.classList.toggle('invalid', password.length < 8);
        }
        
        if (requirements.uppercase) {
            requirements.uppercase.classList.toggle('valid', /[A-Z]/.test(password));
            requirements.uppercase.classList.toggle('invalid', !/[A-Z]/.test(password));
        }
        
        if (requirements.number) {
            requirements.number.classList.toggle('valid', /\d/.test(password));
            requirements.number.classList.toggle('invalid', !/\d/.test(password));
        }
        
        if (requirements.special) {
            requirements.special.classList.toggle('valid', /[!@#$%^&*(),.?":{}|<>]/.test(password));
            requirements.special.classList.toggle('invalid', !/[!@#$%^&*(),.?":{}|<>]/.test(password));
        }
    }
    
    function setupRecoveryModal() {
        console.log('Configurando modal de recuperación...');
        
        const forgotPassword = document.getElementById('forgot-password');
        const recoveryModal = document.getElementById('recovery-modal');
        const closeModal = document.querySelector('.close-modal');
        const sendRecovery = document.getElementById('send-recovery');
        
        if (forgotPassword && recoveryModal) {
            forgotPassword.addEventListener('click', function(e) {
                e.preventDefault();
                recoveryModal.style.display = 'flex';
            });
        }
        
        if (closeModal && recoveryModal) {
            closeModal.addEventListener('click', function() {
                recoveryModal.style.display = 'none';
            });
        }
        
        if (sendRecovery) {
            sendRecovery.addEventListener('click', function() {
                const recoveryEmail = document.getElementById('recovery-email')?.value;
                if (recoveryEmail && isValidEmail(recoveryEmail)) {
                    showNotification(`Enlace de recuperación enviado a ${recoveryEmail}`, 'success');
                    recoveryModal.style.display = 'none';
                } else {
                    showNotification('Por favor ingresa un email válido', 'error');
                }
            });
        }
        
        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', function(e) {
            if (e.target === recoveryModal) {
                recoveryModal.style.display = 'none';
            }
        });
    }
    
    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function showNotification(message, type = 'info') {
        console.log('Mostrando notificación:', message, type);
        
        const notification = document.getElementById('notification');
        if (!notification) {
            console.error('Elemento de notificación no encontrado');
            return;
        }
        
        // Configurar notificación
        notification.textContent = message;
        notification.className = 'notification ' + type;
        notification.style.display = 'block';
        notification.style.opacity = '1';
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 500);
        }, 3000);
    }
    
    // Exponer funciones útiles al scope global
    window.showNotification = showNotification;
    window.switchToForm = switchToForm;
    
    console.log('IA Finance Platform - Listo para usar!');
});