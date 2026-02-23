import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  private tokenKey = 'auth_token';
  private userSubject = new BehaviorSubject<any>(null);

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  // ===== MÉTODOS DE AUTENTICACIÓN CON BACKEND =====
  
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      tap((response: any) => {
        if (response.token) {
          this.setToken(response.token);
          this.setCurrentUser(response.user);
        }
      })
    );
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
        if (response.token) {
          this.setToken(response.token);
          this.setCurrentUser(response.user);
        }
      })
    );
  }

  // ===== MÉTODOS PARA MANEJO LOCAL (SIN BACKEND) =====
  
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    console.log('✅ Token guardado:', token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Establece el usuario actual y genera un token JWT simulado válido
   * para desarrollo cuando no hay backend de autenticación real.
   */
  setCurrentUser(user: any): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Generar token JWT simulado pero con formato válido
    if (!this.getToken()) {
      try {
        // Crear un payload con información del usuario
        const payload = {
          id: user.id || 1,
          email: user.email || 'usuario@test.com',
          name: user.first_name || user.nombre || 'Usuario',
          exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 días de expiración
        };
        
        // Codificar header y payload en base64
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const encodedPayload = btoa(JSON.stringify(payload));
        
        // Crear token simulado (solo para desarrollo)
        const fakeToken = `${header}.${encodedPayload}.simulated-signature-for-development-only`;
        
        this.setToken(fakeToken);
        console.log('✅ Token JWT simulado generado:', fakeToken.substring(0, 50) + '...');
      } catch (error) {
        console.error('❌ Error generando token simulado:', error);
        // Fallback: token simple
        const fallbackToken = 'fake-jwt-token-' + Date.now();
        this.setToken(fallbackToken);
      }
    }
    
    this.userSubject.next(user);
  }

  getCurrentUser(): Observable<any> {
    return this.userSubject.asObservable();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('currentUser');
    this.userSubject.next(null);
    console.log('✅ Sesión cerrada');
  }

  // ===== MÉTODO PARA OBTENER NOMBRE COMPLETO DEL USUARIO =====
  getUserFullName(user: any): string {
    if (!user) return 'Usuario';
    
    // Para la estructura de tu base de datos (first_name + last_name)
    if (user.first_name) {
      return user.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : user.first_name;
    }
    
    // Para la estructura anterior (nombre)
    if (user.nombre) {
      return user.nombre;
    }
    
    // Si no hay nombre, usar email
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'Usuario';
  }

  // ===== MÉTODO PARA OBTENER INICIAL DEL USUARIO =====
  getUserInitial(user: any): string {
    if (!user) return 'U';
    
    if (user.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    }
    
    if (user.nombre) {
      return user.nombre.charAt(0).toUpperCase();
    }
    
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return 'U';
  }

  // ===== MÉTODOS PRIVADOS =====
  
  private loadUserFromStorage(): void {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.userSubject.next(user);
        console.log('✅ Usuario cargado desde localStorage:', user.email);
      } catch (e) {
        console.error('❌ Error parsing user from localStorage', e);
        // Limpiar localStorage corrupto
        localStorage.removeItem('currentUser');
        localStorage.removeItem(this.tokenKey);
      }
    }
  }
}