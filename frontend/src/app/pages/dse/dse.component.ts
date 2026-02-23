import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // ← IMPORTACIÓN AGREGADA
import { DSEService } from '../../services/modules/dse.service';

@Component({
  selector: 'app-dse',
  templateUrl: './dse.component.html',
  styleUrls: ['./dse.component.css']
})
export class DseComponent implements OnInit {
  simulations: any[] = [];
  selectedSimulation: any = null;
  showNewSimulation = false;
  showResults = false;
  results: any = null;
  
  newSimulation = {
    name: '',
    description: '',
    type: 'custom'
  };

  variables: any[] = [
    { name: 'Ingreso mensual', type: 'income', currentValue: 2500, simulatedValue: 2500 },
    { name: 'Gastos mensuales', type: 'expense', currentValue: 1800, simulatedValue: 1800 },
    { name: 'Deuda total', type: 'debt', currentValue: 5000, simulatedValue: 5000 },
    { name: 'Ahorros', type: 'saving', currentValue: 3000, simulatedValue: 3000 }
  ];

  constructor(
    private dseService: DSEService,
    private router: Router // ← AGREGADO Router
  ) {}

  ngOnInit() {
    this.loadSimulations();
  }

  // ===== NUEVO MÉTODO PARA VOLVER AL DASHBOARD =====
  goBack() {
    this.router.navigate(['/dashboard']);
  }

  // ===== CARGAR SIMULACIONES =====
  loadSimulations() {
    this.dseService.getSimulations().subscribe({
      next: (data) => {
        this.simulations = data.simulations || [];
      },
      error: (err) => console.error('Error loading simulations:', err)
    });
  }

  // ===== CREAR NUEVA SIMULACIÓN =====
  createSimulation() {
    if (!this.newSimulation.name) {
      alert('El nombre de la simulación es requerido');
      return;
    }

    console.log('Enviando datos:', this.newSimulation); // Depurar

    this.dseService.createSimulation(this.newSimulation).subscribe({
      next: (data) => {
        console.log('Respuesta:', data); // Depurar
        this.showNewSimulation = false;
        this.newSimulation = { name: '', description: '', type: 'custom' };
        this.loadSimulations();
        alert('✅ Simulación creada exitosamente');
      },
      error: (err) => {
        console.error('❌ Error completo:', err); // Ver error detallado
        
        // Mostrar mensaje específico del error
        if (err.status === 401) {
          alert('Error de autenticación. Por favor, inicia sesión nuevamente.');
        } else if (err.status === 500) {
          alert('Error en el servidor. Verifica que el backend esté corriendo.');
        } else {
          alert(`Error al crear simulación: ${err.message || 'Error desconocido'}`);
        }
      }
    });
  }

  // ===== EJECUTAR SIMULACIÓN =====
  runSimulation(id: number) {
    // Guardar variables primero
    this.dseService.saveVariables(id, this.variables).subscribe({
      next: () => {
        // Ejecutar simulación
        this.dseService.runSimulation(id).subscribe({
          next: (data) => {
            this.results = data.results;
            this.showResults = true;
            this.loadSimulations();
          },
          error: (err) => {
            console.error('Error running simulation:', err);
            alert('❌ Error al ejecutar simulación');
          }
        });
      },
      error: (err) => console.error('Error saving variables:', err)
    });
  }

  // ===== VER DETALLES DE SIMULACIÓN =====
  viewDetails(id: number) {
    this.dseService.getSimulation(id).subscribe({
      next: (data) => {
        this.selectedSimulation = data;
        this.variables = data.variables || this.variables;
        this.results = data.results?.[0] || null;
        this.showResults = !!this.results;
      },
      error: (err) => console.error('Error loading simulation:', err)
    });
  }

  // ===== ACTUALIZAR VARIABLE =====
  updateVariable(index: number, value: number) {
    this.variables[index].simulatedValue = value;
  }

  // ===== RESTABLECER VARIABLES =====
  resetVariables() {
    this.variables.forEach(v => v.simulatedValue = v.currentValue);
  }

  // ===== ELIMINAR SIMULACIÓN =====
  deleteSimulation(id: number) {
    if (confirm('¿Estás seguro de eliminar esta simulación?')) {
      this.dseService.deleteSimulation(id).subscribe({
        next: () => {
          this.loadSimulations();
          if (this.selectedSimulation?.id === id) {
            this.selectedSimulation = null;
            this.showResults = false;
          }
          alert('✅ Simulación eliminada');
        },
        error: (err) => console.error('Error deleting simulation:', err)
      });
    }
  }

  // ===== CREAR ESCENARIO =====
  createScenario() {
    const scenario = {
      name: 'Escenario optimista',
      description: 'Basado en aumento de ingresos',
      parameters: {
        income_increase: 20,
        expense_reduction: 10
      }
    };

    if (this.selectedSimulation) {
//      this.dseService.createScenario(this.selectedSimulation.id, scenario).subscribe({
//        next: () => alert('✅ Escenario creado'),
//        error: (err) => console.error('Error creating scenario:', err)
//      });
    }
  }

  // ===== GETTERS PARA RESULTADOS =====
  getRiskColor(risk: string): string {
    const colors = {
      low: '#27ae60',
      medium: '#f39c12',
      high: '#e74c3c',
      critical: '#c0392b'
    };
    return colors[risk as keyof typeof colors] || '#666';
  }

  getRiskText(risk: string): string {
    const texts = {
      low: 'Bajo',
      medium: 'Medio',
      high: 'Alto',
      critical: 'Crítico'
    };
    return texts[risk as keyof typeof texts] || 'Desconocido';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(value);
  }
}