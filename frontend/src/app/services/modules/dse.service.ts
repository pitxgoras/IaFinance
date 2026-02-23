import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class DSEService {
  private apiUrl = 'http://localhost:3000/api/dse';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('Token enviado:', token); // Para depurar
    
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getSimulations(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/simulations`, { headers });
  }

  getSimulation(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/simulations/${id}`, { headers });
  }

  createSimulation(data: any): Observable<any> {
    const headers = this.getHeaders();
    console.log('Creando simulación con datos:', data);
    console.log('Headers:', headers);
    
    return this.http.post(`${this.apiUrl}/simulations`, data, { headers });
  }

  runSimulation(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/simulations/${id}/run`, {}, { headers });
  }

  saveVariables(id: number, variables: any[]): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/simulations/${id}/variables`, 
      { variables }, { headers });
  }

  deleteSimulation(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/simulations/${id}`, { headers });
  }
}