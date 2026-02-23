import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class EIFService {
  private apiUrl = 'http://localhost:3000/api/eif';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Servicios conectados
  getConnectedServices(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/services`, { headers });
  }

  connectService(data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/services/connect`, data, { headers });
  }

  syncService(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/services/${id}/sync`, {}, { headers });
  }

  disconnectService(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/services/${id}`, { headers });
  }

  // APIs externas
  getExternalApis(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/external-apis`, { headers });
  }

  // Webhooks
  registerWebhook(data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/webhooks/register`, data, { headers });
  }

  getWebhooks(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/webhooks`, { headers });
  }

  // Logs
  getServiceLogs(serviceId: number, limit: number = 50): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/logs/${serviceId}?limit=${limit}`, { headers });
  }
}