import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isLoginMode = true;
  loading = false;

  loginForm = {
    email: '',
    password: '',
    rememberMe: false
  };

  registerForm = {
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  // ===== LOGIN =====
  onLogin() {
    if (!this.validateLogin()) return;
    this.loading = true;

    // ADMIN
    if (this.loginForm.email === 'admin@iafinance.com' && 
        this.loginForm.password === 'Admin123!') {
      
      const user = {
        nombre: 'Administrador',
        email: 'admin@iafinance.com',
        isAdmin: true
      };
      
      this.authService.setCurrentUser(user);
      
      setTimeout(() => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      }, 1000);
      return;
    }
    
    // USUARIO DEMO
    if (this.loginForm.email === 'usuario@test.com' && 
        this.loginForm.password === 'Test123!') {
      
      const user = {
        nombre: 'Usuario Demo',
        email: 'usuario@test.com',
        isAdmin: false
      };
      
      this.authService.setCurrentUser(user);
      
      setTimeout(() => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      }, 1000);
      return;
    }

    // CUALQUIER OTRO USUARIO
    if (this.loginForm.email && this.loginForm.password) {
      
      const nombreFromEmail = this.loginForm.email.split('@')[0];
      
      const user = {
        nombre: nombreFromEmail,
        email: this.loginForm.email,
        isAdmin: false
      };
      
      this.authService.setCurrentUser(user);
      
      setTimeout(() => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      }, 1000);
      return;
    }

    this.loading = false;
    alert('Credenciales incorrectas');
  }

  // ===== REGISTRO =====
  onRegister() {
    if (!this.validateRegister()) return;
    this.loading = true;

    const user = {
      nombre: this.registerForm.nombre,
      email: this.registerForm.email,
      isAdmin: false
    };
    
    this.authService.setCurrentUser(user);
    
    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['/dashboard']);
    }, 1000);
  }

  // ===== ADMIN RÁPIDO =====
  loginAsAdmin() {
    this.loginForm.email = 'admin@iafinance.com';
    this.loginForm.password = 'Admin123!';
    this.onLogin();
  }

  // ===== MÉTODOS DE UTILIDAD =====
  toggleLoginMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  resetForms() {
    this.loginForm = { email: '', password: '', rememberMe: false };
    this.registerForm = { nombre: '', email: '', password: '', confirmPassword: '' };
  }

  validateLogin(): boolean {
    return !!this.loginForm.email && 
           !!this.loginForm.password && 
           this.loginForm.password.length >= 6;
  }

  validateRegister(): boolean {
    return !!this.registerForm.nombre && 
           !!this.registerForm.email && 
           this.registerForm.password.length >= 6 && 
           this.registerForm.password === this.registerForm.confirmPassword;
  }

  fillTestData() {
    if (this.isLoginMode) {
      this.loginForm.email = 'usuario@test.com';
      this.loginForm.password = 'Test123!';
    } else {
      this.registerForm.nombre = 'Usuario Test';
      this.registerForm.email = 'usuario@test.com';
      this.registerForm.password = 'Test123!';
      this.registerForm.confirmPassword = 'Test123!';
    }
  }

  getStrengthClass(): string {
    const length = this.registerForm.password.length;
    if (length < 3) return 'weak';
    if (length < 6) return 'medium';
    return 'strong';
  }

  getStrengthText(): string {
    const length = this.registerForm.password.length;
    if (length < 3) return 'Débil';
    if (length < 6) return 'Media';
    return 'Fuerte';
  }

  passwordsMatch(): boolean {
    return this.registerForm.password === this.registerForm.confirmPassword;
  }
}