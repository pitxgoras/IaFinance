import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardService } from './dashboard.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Usuario
  userName: string = '';
  userEmail: string = '';
  userInitial: string = '';
  isAdmin: boolean = false;
  currentDate: string = '';
  
  // Stats
  stats = {
    balance: 45890.75,
    balanceChange: 12.5,
    income: 12450.30,
    incomeChange: 8.2,
    expenses: 3560.45,
    expensesChange: 3.1,
    savings: 8890.30,
    savingsChange: 15.3
  };

  // Gráfico de barras
  selectedPeriod: string = '3months';
  incomeColor: string = '#27ae60';
  expenseColor: string = '#e74c3c';
  
  currentChartData = {
    labels: ['Ene', 'Feb', 'Mar'],
    income: [8500, 9200, 12450],
    expense: [2800, 3100, 3560]
  };

  // Categorías para gráfico circular
  categories = [
    { name: 'Vivienda', percent: 35, amount: 1246.16, color: '#10b1b0' },
    { name: 'Alimentación', percent: 25, amount: 890.11, color: '#4a90e2' },
    { name: 'Transporte', percent: 15, amount: 534.07, color: '#9b59b6' },
    { name: 'Ocio', percent: 15, amount: 534.07, color: '#e67e22' },
    { name: 'Otros', percent: 10, amount: 356.04, color: '#e74c3c' }
  ];

  // Transacciones
  transactions = [
    { 
      id: 1,
      description: 'Nómina mensual',
      category: 'Ingreso',
      amount: 2850.00,
      type: 'income',
      icon: 'fa-money-bill-wave',
      status: 'completed',
      date: '2024-03-01'
    },
    { 
      id: 2,
      description: 'Pago de alquiler',
      category: 'Vivienda',
      amount: -850.00,
      type: 'expense',
      icon: 'fa-home',
      status: 'completed',
      date: '2024-03-02'
    },
    { 
      id: 3,
      description: 'Supermercado',
      category: 'Alimentación',
      amount: -156.32,
      type: 'expense',
      icon: 'fa-shopping-cart',
      status: 'completed',
      date: '2024-03-03'
    },
    { 
      id: 4,
      description: 'Freelance Web',
      category: 'Ingreso Extra',
      amount: 450.00,
      type: 'income',
      icon: 'fa-laptop-code',
      status: 'pending',
      date: '2024-03-04'
    },
    { 
      id: 5,
      description: 'Netflix',
      category: 'Suscripción',
      amount: -15.99,
      type: 'expense',
      icon: 'fa-film',
      status: 'completed',
      date: '2024-03-05'
    }
  ];

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
    this.loadDashboardData();
    this.updateDate();
  }

  loadUserData(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName = user.name || 'Usuario';
      this.userEmail = user.email || 'usuario@iafinance.com';
      this.userInitial = this.userName.charAt(0).toUpperCase();
      this.isAdmin = user.role === 'admin';
    }
  }

  loadDashboardData(): void {
    // Cargar datos reales desde el backend
    this.dashboardService.getStats().subscribe({
      next: (data) => this.stats = data,
      error: (err) => console.error('Error cargando stats', err)
    });

    this.dashboardService.getTransactions().subscribe({
      next: (data) => this.transactions = data,
      error: (err) => console.error('Error cargando transacciones', err)
    });
  }

  updateDate(): void {
    const today = new Date();
    this.currentDate = today.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  }

  getBarHeight(value: number): number {
    const maxValue = Math.max(...this.currentChartData.income, ...this.currentChartData.expense);
    return (value / maxValue) * 180;
  }

  changePeriod(period: string): void {
    this.dashboardService.getChartData(period).subscribe(data => {
      this.currentChartData = data;
    });
  }

  navigateToTransactions(): void {
    this.router.navigate(['/transactions']);
  }

  toggleEditMode(): void {
    console.log('Modo edición activado');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}