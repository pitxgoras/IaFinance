// src/app/services/modules/cfil.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root'
})
export class CFILService {
  private apiUrl = 'http://localhost:3000/api/cfil';

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders() {
    return { Authorization: `Bearer ${this.auth.getToken()}` };
  }

  startConversation(): Observable<any> {
    return this.http.post(`${this.apiUrl}/conversations/start`, {}, { 
      headers: this.getHeaders() 
    });
  }

  getConversations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/conversations`, { 
      headers: this.getHeaders() 
    });
  }

  getConversationHistory(conversationId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/conversations/${conversationId}`, { 
      headers: this.getHeaders() 
    });
  }

  sendMessage(conversationId: number, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/conversations/${conversationId}/messages`, 
      { message }, { headers: this.getHeaders() });
  }

  sendFeedback(messageId: number, feedback: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/messages/${messageId}/feedback`, 
      feedback, { headers: this.getHeaders() });
  }
}