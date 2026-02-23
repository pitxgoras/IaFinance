import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class PFSEService {
  private apiUrl = 'http://localhost:3000/api/pfse';

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

  // Estrategias
  getStrategies(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/strategies`, { headers });
  }

  createStrategy(data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/strategies`, data, { headers });
  }

  updateStrategy(id: number, data: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.apiUrl}/strategies/${id}`, data, { headers });
  }

  deleteStrategy(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/strategies/${id}`, { headers });
  }

  // Prescripciones
  getPrescriptions(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/prescriptions`, { headers });
  }

  generatePrescriptions(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/prescriptions/generate`, {}, { headers });
  }

  updatePrescriptionStatus(id: number, status: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${this.apiUrl}/prescriptions/${id}/status`, { status }, { headers });
  }

  // Métricas
  getBehavioralMetrics(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/metrics/behavioral`, { headers });
  }
}