// src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { DSEService } from './services/modules/dse.service';
import { PFSEService } from './services/modules/pfse.service';
import { IOIEService } from './services/modules/ioie.service';
import { EIFService } from './services/modules/eif.service';
import { CFILService } from './services/modules/cfil.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  currentView: 'login' | 'dashboard' | 'chat' = 'login';
  isLoginMode = true;
  loading = false;
  
  // Datos del usuario
  user: any = null;

  // Credenciales de admin
  adminCredentials = {
    email: 'admin@iafinance.com',
    password: 'Admin123!'
  };

  // Formularios
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

  // ===== CHATBOT ROMAN =====
  chatOpen = false;
  chatbotName = 'Roman';
  chatMessages: Array<{
    sender: 'user' | 'bot';
    text: string;
    timestamp: Date;
  }> = [];
  userMessage = '';
  isTyping = false;

  // ===== DATOS DE MÓDULOS =====
  simulations: any[] = [];
  strategies: any[] = [];
  prescriptions: any[] = [];
  opportunities: any[] = [];
  connectedServices: any[] = [];
  conversations: any[] = [];
  metrics: any = {};

  // ===== ESTADÍSTICAS DEL DASHBOARD =====
  stats = {
    balance: 25430.50,
    income: 4250.00,
    expenses: 2150.00,
    savings: 2100.00,
    incomeChange: 8.3,
    expensesChange: -5.2,
    savingsChange: 15.7,
    balanceChange: 12.5
  };

  transactions = [
    { icon: 'shopping-cart', description: 'Compra en Amazon', category: 'Compras', categoryClass: 'shopping', date: 'Hoy, 10:30 AM', amount: -89.99, status: 'completed', statusText: 'Completado' },
    { icon: 'money-bill-wave', description: 'Depósito de nómina', category: 'Ingreso', categoryClass: 'income', date: 'Ayer, 2:00 PM', amount: 2500.00, status: 'completed', statusText: 'Completado' },
    { icon: 'utensils', description: 'Cena restaurante', category: 'Alimentación', categoryClass: 'food', date: '15 Feb, 8:00 PM', amount: -45.50, status: 'completed', statusText: 'Completado' },
    { icon: 'gas-pump', description: 'Gasolina', category: 'Transporte', categoryClass: 'transport', date: '14 Feb, 4:30 PM', amount: -65.75, status: 'pending', statusText: 'Pendiente' },
    { icon: 'film', description: 'Netflix Subscription', category: 'Entretenimiento', categoryClass: 'entertainment', date: '13 Feb, 12:00 PM', amount: -15.99, status: 'completed', statusText: 'Completado' }
  ];

  constructor(
    private router: Router,
    public authService: AuthService,
    private dseService: DSEService,
    private pfseService: PFSEService,
    private ioieService: IOIEService,
    private eifService: EIFService,
    private cfilService: CFILService
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      this.user = user;
      if (user) {
        this.loadModuleData();
        this.currentView = 'dashboard';
      } else {
        this.currentView = 'login';
      }
    });
  }

  loadModuleData() {
    if (!this.authService.isAuthenticated()) return;

    // Cargar simulaciones DSE
    this.dseService.getSimulations().subscribe({
      next: (data) => this.simulations = data.simulations || [],
      error: (err) => console.error('Error loading DSE:', err)
    });

    // Cargar estrategias PFSE
    this.pfseService.getStrategies().subscribe({
      next: (data) => this.strategies = data.strategies || [],
      error: (err) => console.error('Error loading PFSE:', err)
    });

    // Generar prescripciones PFSE
    this.pfseService.generatePrescriptions().subscribe({
      next: (data) => this.prescriptions = data.prescriptions || [],
      error: (err) => console.error('Error loading prescriptions:', err)
    });

    // Cargar oportunidades IOIE
    this.ioieService.getRecommendedOpportunities().subscribe({
      next: (data) => this.opportunities = data.recommendations || [],
      error: (err) => console.error('Error loading IOIE:', err)
    });

    // Cargar servicios EIF
    this.eifService.getConnectedServices().subscribe({
      next: (data) => this.connectedServices = data.services || [],
      error: (err) => console.error('Error loading EIF:', err)
    });

    // Cargar conversaciones CFIL
    this.cfilService.getConversations().subscribe({
      next: (data) => this.conversations = data.conversations || [],
      error: (err) => console.error('Error loading CFIL:', err)
    });

    // Cargar métricas de comportamiento
    this.pfseService.getBehavioralMetrics().subscribe({
      next: (data) => this.metrics.behavioral = data.metrics || [],
      error: (err) => console.error('Error loading metrics:', err)
    });
  }

  // ===== MÉTODOS DE AUTENTICACIÓN =====
  onLogin() {
    if (!this.validateLogin()) return;
    this.loading = true;

    // Verificar admin local (respaldo)
    if (this.loginForm.email === this.adminCredentials.email && 
        this.loginForm.password === this.adminCredentials.password) {
      setTimeout(() => {
        this.loading = false;
        this.user = {
          id: 0,
          nombre: 'Administrador',
          email: this.loginForm.email,
          isAdmin: true
        };
        this.currentView = 'dashboard';
      }, 1000);
      return;
    }

    this.authService.login(this.loginForm).subscribe({
      next: (response) => {
        this.loading = false;
        this.user = response.user;
        this.currentView = 'dashboard';
        this.loadModuleData();
      },
      error: (error) => {
        this.loading = false;
        console.error('Login error:', error);
        alert('Error al iniciar sesión. Verifica tus credenciales.');
      }
    });
  }

  loginAsAdmin() {
    this.loginForm.email = 'admin@iafinance.com';
    this.loginForm.password = 'Admin123!';
    this.onLogin();
  }

  onRegister() {
    if (!this.validateRegister()) return;
    this.loading = true;

    this.authService.register(this.registerForm).subscribe({
      next: (response) => {
        this.loading = false;
        this.user = response.user;
        this.currentView = 'dashboard';
        this.loadModuleData();
      },
      error: (error) => {
        this.loading = false;
        console.error('Register error:', error);
        alert('Error al registrarse. Intenta con otro email.');
      }
    });
  }

  logout() {
    this.authService.logout();
    this.user = null;
    this.currentView = 'login';
    this.isLoginMode = true;
    this.resetForms();
    this.chatMessages = [];
    this.chatOpen = false;
    this.router.navigate(['/login']);
  }

  // ===== MÉTODOS DE NAVEGACIÓN =====
  showLogin() {
    this.currentView = 'login';
    this.isLoginMode = true;
  }

  showDashboard() {
    this.currentView = 'dashboard';
    this.loadModuleData();
  }

  showChat() {
    this.currentView = 'chat';
    this.chatOpen = true;
    if (this.chatMessages.length === 0) {
      this.startChat();
    }
  }

  toggleChat() {
    this.chatOpen = !this.chatOpen;
    if (this.chatOpen && this.chatMessages.length === 0) {
      this.startChat();
    }
    if (!this.chatOpen) {
      this.currentView = 'dashboard';
    }
  }

  // ===== MÉTODOS DEL CHAT =====
  startChat() {
    if (this.authService.isAuthenticated()) {
      this.cfilService.startConversation().subscribe({
        next: (response) => {
          this.addBotMessage(response.welcomeMessage);
        },
        error: () => {
          this.addBotMessage('¡Hola! Soy Roman, tu asistente financiero. ¿En qué puedo ayudarte?');
        }
      });
    } else {
      this.addBotMessage('¡Hola! Soy Roman, tu asistente financiero. ¿En qué puedo ayudarte?');
    }
  }

  sendMessage() {
    if (!this.userMessage.trim()) return;
    
    const message = this.userMessage;
    this.addUserMessage(message);
    this.userMessage = '';
    this.isTyping = true;

    if (this.authService.isAuthenticated() && this.conversations.length > 0) {
      const conversationId = this.conversations[0].id;
      this.cfilService.sendMessage(conversationId, message).subscribe({
        next: (response) => {
          this.isTyping = false;
          this.addBotMessage(response.response);
        },
        error: () => {
          this.isTyping = false;
          this.generateLocalResponse(message);
        }
      });
    } else {
      setTimeout(() => {
        this.isTyping = false;
        this.generateLocalResponse(message);
      }, 800);
    }
  }

  generateLocalResponse(message: string) {
    const lowerMsg = message.toLowerCase();
    let response = '';

    if (lowerMsg.includes('invertir') || lowerMsg.includes('inversión')) {
      response = 'Para invertir, primero define tu perfil de riesgo. Como principiante, te recomiendo fondos indexados o ETFs. Recuerda diversificar y empezar con montos pequeños. ¿Te gustaría saber más sobre algún tipo de inversión en particular?';
    } else if (lowerMsg.includes('ahorrar') || lowerMsg.includes('ahorro')) {
      response = 'El ahorro es la base de la libertad financiera. Aplica la regla 50/30/20: 50% necesidades, 30% deseos, 20% ahorro. Automatiza tus ahorros cada mes. ¿Quieres que te ayude a crear un plan de ahorro personalizado?';
    } else if (lowerMsg.includes('deuda') || lowerMsg.includes('préstamo')) {
      response = 'Para pagar deudas, usa el método "bola de nieve": paga las deudas más pequeñas primero para ganar motivación. Luego ataca las más grandes. ¿Cuál es tu situación actual de deudas?';
    } else if (lowerMsg.includes('presupuesto') || lowerMsg.includes('gastos')) {
      response = 'Un buen presupuesto te da control. Registra todos tus gastos por 30 días, identifica gastos hormiga y establece límites por categoría. ¿Te gustaría que te recomiende alguna app para presupuestos?';
    } else if (lowerMsg.includes('jubilación') || lowerMsg.includes('retiro')) {
      response = 'Nunca es demasiado temprano para planificar tu jubilación. El interés compuesto es tu mejor aliado. Aporta a tu AFP y considera fondos voluntarios. ¿A qué edad te gustaría jubilarte?';
    } else if (lowerMsg.includes('hola') || lowerMsg.includes('buenos')) {
      response = '¡Hola! Soy Roman, tu asesor financiero personal. Estoy aquí para ayudarte con todo lo relacionado a finanzas: inversiones, ahorro, deudas, presupuestos y planificación para el retiro. ¿En qué tema te gustaría profundizar hoy?';
    } else {
      response = 'Entiendo tu consulta. Como asesor financiero, puedo ayudarte específicamente con inversiones, ahorro, deudas, presupuestos y planificación para el retiro. ¿Podrías ser más específico sobre lo que necesitas?';
    }

    this.addBotMessage(response);
  }

  addUserMessage(text: string) {
    this.chatMessages.push({
      sender: 'user',
      text: text,
      timestamp: new Date()
    });
    setTimeout(() => this.scrollToBottom(), 100);
  }

  addBotMessage(text: string) {
    this.chatMessages.push({
      sender: 'bot',
      text: text,
      timestamp: new Date()
    });
    setTimeout(() => this.scrollToBottom(), 100);
  }

  scrollToBottom() {
    const container = document.querySelector('.chat-messages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  quickQuestion(question: string) {
    this.userMessage = question;
    this.sendMessage();
  }

  clearChat() {
    this.chatMessages = [];
    this.startChat();
  }

  getTimeString(date: Date): string {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  getCurrentDateTime(): Date {
    return new Date();
  }

  // ===== MÉTODOS DE UTILIDAD =====
  toggleLoginMode() {
    this.isLoginMode = !this.isLoginMode;
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

  resetForms() {
    this.loginForm = { email: '', password: '', rememberMe: false };
    this.registerForm = { nombre: '', email: '', password: '', confirmPassword: '' };
  }

  getAvatarInitial(): string {
    if (this.user?.nombre) {
      return this.user.nombre.charAt(0).toUpperCase();
    }
    return 'U';
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getRandomHeight(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

  get emailPatternError(): boolean {
    return !!this.loginForm.email && !this.loginForm.email.includes('@');
  }

  passwordsMatch(): boolean {
    return this.registerForm.password === this.registerForm.confirmPassword;
  }

  // ===== MÉTODOS DE MÓDULOS =====
  createSimulation() {
    const newSim = {
      name: 'Nueva Simulación',
      type: 'custom',
      description: 'Simulación creada desde el dashboard'
    };
    this.dseService.createSimulation(newSim).subscribe({
      next: (data) => {
        alert('Simulación creada exitosamente');
        this.loadModuleData();
      },
      error: (err) => console.error('Error creating simulation:', err)
    });
  }

  generateReport() {
    alert('Generando reporte financiero...');
  }

  configureAlerts() {
    alert('Configurando alertas...');
  }
}