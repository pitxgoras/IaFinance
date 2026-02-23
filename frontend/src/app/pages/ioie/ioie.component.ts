import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IOIEService } from '../../services/modules/ioie.service';

@Component({
  selector: 'app-ioie',
  templateUrl: './ioie.component.html',
  styleUrls: ['./ioie.component.css']
})
export class IoieComponent implements OnInit {
  // Oportunidades
  opportunities: any[] = [];
  loadingOpportunities = false;
  selectedCategory: string = 'all';
  
  // Habilidades
  userSkills: any[] = [];
  showAddSkill = false;
  newSkill = {
    skillName: '',
    proficiencyLevel: 'beginner',
    yearsExperience: 0
  };
  
  // Filtros
  categories = [
    { value: 'all', label: 'Todas' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'part_time', label: 'Medio Tiempo' },
    { value: 'investment', label: 'Inversión' },
    { value: 'passive', label: 'Ingreso Pasivo' },
    { value: 'gig', label: 'Trabajos por Encargo' }
  ];

  constructor(
    private ioieService: IOIEService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadOpportunities();
    this.loadUserSkills();
  }

  // ===== MÉTODO PARA VOLVER AL DASHBOARD =====
  goBack() {
    this.router.navigate(['/dashboard']);
  }

  // ===== OPORTUNIDADES =====
  loadOpportunities() {
    this.loadingOpportunities = true;
    this.ioieService.getRecommendedOpportunities().subscribe({
      next: (data) => {
        this.opportunities = data.recommendations || [];
        this.loadingOpportunities = false;
      },
      error: (err) => {
        console.error('Error loading opportunities:', err);
        this.loadingOpportunities = false;
      }
    });
  }

  getFilteredOpportunities() {
    if (this.selectedCategory === 'all') {
      return this.opportunities;
    }
    return this.opportunities.filter(opp => opp.category === this.selectedCategory);
  }

  applyToOpportunity(id: number) {
    this.ioieService.applyToOpportunity(id).subscribe({
      next: () => {
        this.loadOpportunities();
        alert('✅ Aplicación enviada');
      },
      error: (err) => console.error('Error applying:', err)
    });
  }

  // ===== HABILIDADES =====
  loadUserSkills() {
    this.ioieService.getUserSkills().subscribe({
      next: (data) => {
        this.userSkills = data.skills || [];
      },
      error: (err) => console.error('Error loading skills:', err)
    });
  }

  addSkill() {
    if (!this.newSkill.skillName) {
      alert('Nombre de habilidad requerido');
      return;
    }

    this.ioieService.addUserSkill(this.newSkill).subscribe({
      next: () => {
        this.showAddSkill = false;
        this.newSkill = { skillName: '', proficiencyLevel: 'beginner', yearsExperience: 0 };
        this.loadUserSkills();
        this.loadOpportunities();
      },
      error: (err) => console.error('Error adding skill:', err)
    });
  }

  deleteSkill(id: number) {
    if (confirm('¿Eliminar esta habilidad?')) {
      this.ioieService.deleteSkill(id).subscribe({
        next: () => {
          this.loadUserSkills();
          this.loadOpportunities();
        },
        error: (err) => console.error('Error deleting skill:', err)
      });
    }
  }

  // ===== UTILIDADES =====
  getCategoryIcon(category: string): string {
    const icons: any = {
      'freelance': 'fa-laptop-code',
      'part_time': 'fa-clock',
      'investment': 'fa-chart-line',
      'passive': 'fa-bed',
      'gig': 'fa-bolt'
    };
    return icons[category] || 'fa-briefcase';
  }

  getCategoryColor(category: string): string {
    const colors: any = {
      'freelance': '#3498db',
      'part_time': '#f39c12',
      'investment': '#27ae60',
      'passive': '#9b59b6',
      'gig': '#e74c3c'
    };
    return colors[category] || '#666';
  }

  getDifficultyText(difficulty: string): string {
    const texts: any = {
      'easy': 'Fácil',
      'medium': 'Intermedio',
      'hard': 'Avanzado'
    };
    return texts[difficulty] || difficulty;
  }

  getProficiencyText(level: string): string {
    const texts: any = {
      'beginner': 'Principiante',
      'intermediate': 'Intermedio',
      'advanced': 'Avanzado',
      'expert': 'Experto'
    };
    return texts[level] || level;
  }
}