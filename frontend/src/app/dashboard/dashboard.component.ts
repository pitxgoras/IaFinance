import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export interface Transaction {
  id: number;
  icon: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  status: 'completed' | 'pending';
}

export interface Category {
  name: string;
  percent: number;
  color: string;
  amount: number;
  rotation: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  // Datos del usuario
  userName: string = 'Usuario';
  userEmail: string = '';
  userInitial: string = 'U';
  isAdmin: boolean = false;
  
  // Fecha actual
  currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Período seleccionado para gráficos
  selectedPeriod: '3months' | '6months' | 'year' = '6months';
  
  // Colores
  incomeColor = '#27ae60';
  expenseColor = '#e74c3c';

  // Datos de estadísticas (simulados pero personalizados por usuario)
  stats = {
    balance: 36600.00,
    income: 6520.00,
    expenses: 3840.00,
    savings: 2100.00,
    balanceChange: 12.5,
    incomeChange: 8.3,
    expensesChange: -5.2,
    savingsChange: 15.7
  };

  // Datos para gráficos dinámicos
  chartData = {
    '3months': {
      labels: ['ENE', 'FEB', 'MAR'],
      income: [6520, 6100, 6350],
      expense: [3840, 3950, 3800]
    },
    '6months': {
      labels: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN'],
      income: [6520, 6100, 6350, 6700, 6900, 7200],
      expense: [3840, 3950, 3800, 4100, 4000, 4200]
    },
    'year': {
      labels: ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'],
      income: [6520, 6100, 6350, 6700, 6900, 7200, 7100, 7300, 7500, 7700, 7600, 8000],
      expense: [3840, 3950, 3800, 4100, 4000, 4200, 4300, 4250, 4400, 4500, 4450, 4600]
    }
  };

  // Distribución de gastos
  categories: Category[] = [
    { name: 'Vivienda', percent: 40, color: '#10b1b0', amount: 1536, rotation: 0 },
    { name: 'Alimentación', percent: 25, color: '#4a90e2', amount: 960, rotation: 144 },
    { name: 'Transporte', percent: 20, color: '#9b59b6', amount: 768, rotation: 234 },
    { name: 'Entretenimiento', percent: 15, color: '#e67e22', amount: 576, rotation: 306 }
  ];

  // Transacciones recientes
  transactions: Transaction[] = [
    { id: 1, icon: 'fa-money-bill-wave', description: 'Depósito de nómina', category: 'INGRESO', amount: 2250, type: 'income', date: 'Hoy', status: 'completed' },
    { id: 2, icon: 'fa-shopping-cart', description: 'Compra en supermercado', category: 'SUPERMERCADO', amount: -245.80, type: 'expense', date: 'Ayer', status: 'completed' },
    { id: 3, icon: 'fa-bolt', description: 'Recibo de luz', category: 'SERVICIOS', amount: -185.50, type: 'expense', date: '15 Feb', status: 'completed' },
    { id: 4, icon: 'fa-wifi', description: 'Internet y cable', category: 'SERVICIOS', amount: -129.90, type: 'expense', date: '14 Feb', status: 'completed' },
    { id: 5, icon: 'fa-utensils', description: 'Cena en restaurant', category: 'ALIMENTACIÓN', amount: -89.90, type: 'expense', date: '13 Feb', status: 'completed' },
    { id: 6, icon: 'fa-laptop-code', description: 'Trabajo freelance', category: 'INGRESO', amount: 850, type: 'income', date: '10 Feb', status: 'pending' }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(user => {
      if (user) {
        this.userName = this.authService.getUserFullName(user);
        this.userEmail = user.email || '';
        this.userInitial = this.userName.charAt(0).toUpperCase();
        this.isAdmin = user.isAdmin || false;
        
        // Personalizar datos según el usuario
        this.personalizeData(user);
      }
    });
  }

  // Personalizar datos para cada usuario
  personalizeData(user: any) {
    const userHash = user.email ? user.email.length : 1;
    
    // Ajustar montos según el usuario
    this.stats.balance = 30000 + (userHash * 500);
    this.stats.income = 6000 + (userHash * 100);
    this.stats.expenses = 3500 + (userHash * 50);
    this.stats.savings = this.stats.income - this.stats.expenses;
    
    // Ajustar transacciones
    this.transactions = this.transactions.map((t, index) => ({
      ...t,
      amount: t.amount * (1 + (userHash % 10) / 100),
      date: this.getRandomDate(index)
    }));
  }

  getRandomDate(index: number): string {
    const dates = ['Hoy', 'Ayer', '15 Feb', '14 Feb', '13 Feb', '12 Feb'];
    return dates[index % dates.length];
  }

  // ===== MÉTODOS DE GRÁFICOS =====
  changePeriod(period: '3months' | '6months' | 'year') {
    this.selectedPeriod = period;
  }

  get currentChartData() {
    return this.chartData[this.selectedPeriod];
  }

  get maxValue(): number {
    const data = this.currentChartData;
    const maxIncome = Math.max(...data.income);
    const maxExpense = Math.max(...data.expense);
    return Math.max(maxIncome, maxExpense);
  }

  getBarHeight(value: number): number {
    return (value / this.maxValue) * 180;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(amount);
  }

  // ===== MÉTODOS DE NAVEGACIÓN =====
  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  navigateToTransactions() {
    // Aquí iría la navegación a la página de transacciones
    alert('Próximamente: Vista completa de transacciones');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openChat() {
    this.router.navigate(['/chat']);
  }
}