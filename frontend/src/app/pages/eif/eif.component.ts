import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EIFService } from '../../services/modules/eif.service';

@Component({
  selector: 'app-eif',
  templateUrl: './eif.component.html',
  styleUrls: ['./eif.component.css']
})
export class EifComponent implements OnInit {
  // Servicios conectados
  connectedServices: any[] = [];
  loadingServices = false;
  showConnectForm = false;
  selectedService: any = null;
  showSyncData = false;
  syncData: any = null;
  
  // APIs externas
  externalApis: any[] = [];
  
  // Webhooks
  webhooks: any[] = [];
  showWebhookForm = false;
  
  // Nuevo servicio
  newService = {
    serviceName: '',
    serviceType: 'bank',
    credentials: {}
  };
  
  // Nuevo webhook
  newWebhook = {
    serviceId: null,
    webhookUrl: '',
    eventType: 'all'
  };
  
  // Tipos de servicio
  serviceTypes = [
    { value: 'bank', label: 'Banco', icon: 'fa-university', color: '#1e3799' },
    { value: 'freelance', label: 'Freelance', icon: 'fa-laptop-code', color: '#27ae60' },
    { value: 'investment', label: 'Inversiones', icon: 'fa-chart-line', color: '#f39c12' },
    { value: 'payment', label: 'Pagos', icon: 'fa-credit-card', color: '#8e44ad' },
    { value: 'other', label: 'Otro', icon: 'fa-plug', color: '#95a5a6' }
  ];

  constructor(
    private eifService: EIFService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadServices();
    this.loadExternalApis();
    this.loadWebhooks();
  }

  // ===== MÉTODO PARA VOLVER AL DASHBOARD =====
  goBack() {
    this.router.navigate(['/dashboard']);
  }

  // ===== SERVICIOS CONECTADOS =====
  loadServices() {
    this.loadingServices = true;
    this.eifService.getConnectedServices().subscribe({
      next: (data) => {
        this.connectedServices = data.services || [];
        this.loadingServices = false;
      },
      error: (err) => {
        console.error('Error loading services:', err);
        this.loadingServices = false;
      }
    });
  }

  connectService() {
    if (!this.newService.serviceName) {
      alert('Nombre del servicio requerido');
      return;
    }

    this.eifService.connectService(this.newService).subscribe({
      next: (data) => {
        this.showConnectForm = false;
        this.newService = { serviceName: '', serviceType: 'bank', credentials: {} };
        this.loadServices();
        alert('✅ Servicio conectado exitosamente');
      },
      error: (err) => {
        console.error('Error connecting service:', err);
        alert('Error al conectar servicio');
      }
    });
  }

  syncService(service: any) {
    this.eifService.syncService(service.id).subscribe({
      next: (data) => {
        this.selectedService = service;
        this.syncData = data.data;
        this.showSyncData = true;
        this.loadServices();
      },
      error: (err) => {
        console.error('Error syncing service:', err);
        alert('Error al sincronizar');
      }
    });
  }

  disconnectService(id: number) {
    if (confirm('¿Estás seguro de desconectar este servicio?')) {
      this.eifService.disconnectService(id).subscribe({
        next: () => {
          this.loadServices();
          if (this.selectedService?.id === id) {
            this.selectedService = null;
            this.showSyncData = false;
          }
        },
        error: (err) => console.error('Error disconnecting service:', err)
      });
    }
  }

  // ===== APIS EXTERNAS =====
  loadExternalApis() {
    this.eifService.getExternalApis().subscribe({
      next: (data) => {
        this.externalApis = data.apis || [];
      },
      error: (err) => console.error('Error loading external APIs:', err)
    });
  }

  // ===== WEBHOOKS =====
  loadWebhooks() {
    this.eifService.getWebhooks().subscribe({
      next: (data) => {
        this.webhooks = data.webhooks || [];
      },
      error: (err) => console.error('Error loading webhooks:', err)
    });
  }

  registerWebhook() {
    if (!this.newWebhook.serviceId || !this.newWebhook.webhookUrl) {
      alert('Servicio y URL del webhook son requeridos');
      return;
    }

    this.eifService.registerWebhook(this.newWebhook).subscribe({
      next: (data) => {
        this.showWebhookForm = false;
        this.newWebhook = { serviceId: null, webhookUrl: '', eventType: 'all' };
        this.loadWebhooks();
        alert(`✅ Webhook registrado. Secret Key: ${data.secretKey}`);
      },
      error: (err) => {
        console.error('Error registering webhook:', err);
        alert('Error al registrar webhook');
      }
    });
  }

  // ===== UTILIDADES =====
  getServiceTypeInfo(type: string) {
    return this.serviceTypes.find(t => t.value === type) || this.serviceTypes[4];
  }

  getStatusClass(status: string): string {
    const classes: any = {
      'active': 'status-active',
      'inactive': 'status-inactive',
      'error': 'status-error'
    };
    return classes[status] || '';
  }

  formatDate(date: string): string {
    if (!date) return 'Nunca';
    return new Date(date).toLocaleString('es-PE');
  }
}