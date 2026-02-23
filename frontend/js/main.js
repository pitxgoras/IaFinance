document.addEventListener('DOMContentLoaded', function() {
    // Mostrar pantalla de carga por 2 segundos
    const loadingOverlay = document.getElementById('loading-overlay');
    setTimeout(() => {
        loadingOverlay.style.opacity = '0';
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
        }, 300);
    }, 2000);

    // Variables principales
    const loginToggle = document.getElementById('login-toggle');
    const registerToggle = document.getElementById('register-toggle');
    const toggleSlider = document.getElementById('toggle-slider');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const goToRegister = document.getElementById('go-to-register');
    const goToLogin = document.getElementById('go-to-login');

    // Toggle entre Login y Register
    loginToggle.addEventListener('click', () => {
        loginToggle.classList.add('active');
        registerToggle.classList.remove('active');
        toggleSlider.style.transform = 'translateX(0)';
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    });

    registerToggle.addEventListener('click', () => {
        registerToggle.classList.add('active');
        loginToggle.classList.remove('active');
        toggleSlider.style.transform = 'translateX(100%)';
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    });

    // Enlaces para cambiar entre formularios
    goToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        registerToggle.click();
    });

    goToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        loginToggle.click();
    });

    // Toggle para mostrar/ocultar contraseña
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
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

    // Modal de recuperación de contraseña
    const forgotPassword = document.getElementById('forgot-password');
    const recoveryModal = document.getElementById('recovery-modal');
    const closeModal = document.querySelector('.close-modal');
    const sendRecovery = document.getElementById('send-recovery');

    forgotPassword.addEventListener('click', (e) => {
        e.preventDefault();
        recoveryModal.style.display = 'flex';
    });

    closeModal.addEventListener('click', () => {
        recoveryModal.style.display = 'none';
    });

    sendRecovery.addEventListener('click', () => {
        const recoveryEmail = document.getElementById('recovery-email').value;
        if (recoveryEmail && validateEmail(recoveryEmail)) {
            showNotification('Enlace de recuperación enviado a ' + recoveryEmail, 'success');
            recoveryModal.style.display = 'none';
        } else {
            showNotification('Por favor ingresa un email válido', 'error');
        }
    });

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (e) => {
        if (e.target === recoveryModal) {
            recoveryModal.style.display = 'none';
        }
    });

    // Función para mostrar notificaciones
    window.showNotification = function(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = 'notification ' + type;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                notification.style.display = 'none';
                notification.style.opacity = '1';
            }, 300);
        }, 3000);
    };

    // Función de validación básica de email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Inicializar funcionalidades
    console.log('IA Finance Platform - Cargado exitosamente');
});