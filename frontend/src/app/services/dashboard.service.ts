// src/app/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface DashboardStats {
  balance: number;
  balanceChange: number;
  income: number;
  incomeChange: number;
  expenses: number;
  expensesChange: number;
  savings: number;
  savingsChange: number;
}

export interface Transaction {
  id: number;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  icon: string;
  status: 'completed' | 'pending';
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:3000/api'; // Cambia esto después

  constructor(private http: HttpClient) {}

  // Obtener estadísticas
  getStats(): Observable<DashboardStats> {
    // Datos de prueba mientras conectas el backend
    return of({
      balance: 45890.75,
      balanceChange: 12.5,
      income: 12450.30,
      incomeChange: 8.2,
      expenses: 3560.45,
      expensesChange: 3.1,
      savings: 8890.30,
      savingsChange: 15.3
    });
  }

  // Obtener transacciones
  getTransactions(): Observable<Transaction[]> {
    return of([
      { 
        id: 1,
        description: 'Nómina mensual',
        category: 'Ingreso',
        amount: 2850.00,
        type: 'income',
        icon: 'fa-money-bill-wave',
        status: 'completed',
        date: '2024-03-01'
      },
      { 
        id: 2,
        description: 'Pago de alquiler',
        category: 'Vivienda',
        amount: -850.00,
        type: 'expense',
        icon: 'fa-home',
        status: 'completed',
        date: '2024-03-02'
      }
    ]);
  }
}