import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class IOIEService {
  private apiUrl = 'http://localhost:3000/api/ioie';

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

  // Oportunidades
  getRecommendedOpportunities(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/opportunities/recommended`, { headers });
  }

  applyToOpportunity(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/opportunities/${id}/apply`, {}, { headers });
  }

  // Habilidades
  getUserSkills(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${this.apiUrl}/skills`, { headers });
  }

  addUserSkill(skillData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/skills`, skillData, { headers });
  }

  deleteSkill(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.apiUrl}/skills/${id}`, { headers });
  }

  // Experiencias
  shareExperience(experienceData: any): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${this.apiUrl}/experiences/share`, experienceData, { headers });
  }
}