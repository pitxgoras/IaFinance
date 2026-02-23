import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PFSEService } from '../../services/modules/pfse.service';

@Component({
  selector: 'app-pfse',
  templateUrl: './pfse.component.html',
  styleUrls: ['./pfse.component.css']
})
export class PfseComponent implements OnInit {
  // Estrategias
  strategies: any[] = [];
  showNewStrategy = false;
  newStrategy = {
    name: '',
    type: 'saving',
    priority: 1,
    description: ''
  };

  // Prescripciones
  prescriptions: any[] = [];
  loadingPrescriptions = false;

  // Métricas
  metrics: any[] = [];
  
  // Pestaña activa
  activeTab: 'strategies' | 'prescriptions' | 'metrics' = 'prescriptions';

  constructor(
    private pfseService: PFSEService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  // ===== MÉTODO PARA VOLVER AL DASHBOARD =====
  goBack() {
    this.router.navigate(['/dashboard']);
  }

  // ===== CARGAR TODOS LOS DATOS =====
  loadData() {
    this.loadStrategies();
    this.loadPrescriptions();
    this.loadMetrics();
  }

  // ===== ESTRATEGIAS =====
  loadStrategies() {
    this.pfseService.getStrategies().subscribe({
      next: (data) => {
        this.strategies = data.strategies || [];
      },
      error: (err) => console.error('Error loading strategies:', err)
    });
  }

  createStrategy() {
    if (!this.newStrategy.name) {
      alert('El nombre de la estrategia es requerido');
      return;
    }

    this.pfseService.createStrategy(this.newStrategy).subscribe({
      next: (data) => {
        this.showNewStrategy = false;
        this.newStrategy = { name: '', type: 'saving', priority: 1, description: '' };
        this.loadStrategies();
        alert('✅ Estrategia creada exitosamente');
      },
      error: (err) => {
        console.error('Error creating strategy:', err);
        alert('Error al crear estrategia');
      }
    });
  }

  deleteStrategy(id: number) {
    if (confirm('¿Eliminar esta estrategia?')) {
      this.pfseService.deleteStrategy(id).subscribe({
        next: () => this.loadStrategies(),
        error: (err) => console.error('Error deleting strategy:', err)
      });
    }
  }

  // ===== PRESCRIPCIONES =====
  loadPrescriptions() {
    this.pfseService.getPrescriptions().subscribe({
      next: (data) => {
        this.prescriptions = data.prescriptions || [];
      },
      error: (err) => console.error('Error loading prescriptions:', err)
    });
  }

  generatePrescriptions() {
    this.loadingPrescriptions = true;
    this.pfseService.generatePrescriptions().subscribe({
      next: (data) => {
        this.loadingPrescriptions = false;
        this.loadPrescriptions();
        alert('✅ Recomendaciones generadas');
      },
      error: (err) => {
        this.loadingPrescriptions = false;
        console.error('Error generating prescriptions:', err);
        alert('Error al generar recomendaciones');
      }
    });
  }

  updatePrescriptionStatus(id: number, status: string) {
    this.pfseService.updatePrescriptionStatus(id, status).subscribe({
      next: () => this.loadPrescriptions(),
      error: (err) => console.error('Error updating prescription:', err)
    });
  }

  // ===== MÉTRICAS =====
  loadMetrics() {
    this.pfseService.getBehavioralMetrics().subscribe({
      next: (data) => {
        this.metrics = data.metrics || [];
      },
      error: (err) => console.error('Error loading metrics:', err)
    });
  }

  getMetricIcon(type: string): string {
    const icons: any = {
      'spending_habit': 'fa-shopping-cart',
      'saving_habit': 'fa-piggy-bank',
      'debt_behavior': 'fa-credit-card',
      'investment_behavior': 'fa-chart-line'
    };
    return icons[type] || 'fa-chart-simple';
  }

  getMetricName(type: string): string {
    const names: any = {
      'spending_habit': 'Hábito de Gasto',
      'saving_habit': 'Hábito de Ahorro',
      'debt_behavior': 'Comportamiento de Deuda',
      'investment_behavior': 'Comportamiento de Inversión'
    };
    return names[type] || type;
  }

  getScoreColor(score: number): string {
    if (score >= 70) return '#27ae60';
    if (score >= 40) return '#f39c12';
    return '#e74c3c';
  }

  // Utilidades
  getPriorityClass(priority: string): string {
    const classes: any = {
      'high': 'priority-high',
      'medium': 'priority-medium',
      'low': 'priority-low'
    };
    return classes[priority] || '';
  }

  getTypeIcon(type: string): string {
    const icons: any = {
      'saving': 'fa-piggy-bank',
      'debt': 'fa-credit-card',
      'investment': 'fa-chart-line',
      'budget': 'fa-calculator'
    };
    return icons[type] || 'fa-lightbulb';
  }

  getStatusClass(status: string): string {
    const classes: any = {
      'pending': 'status-pending',
      'accepted': 'status-accepted',
      'rejected': 'status-rejected',
      'completed': 'status-completed'
    };
    return classes[status] || '';
  }
}