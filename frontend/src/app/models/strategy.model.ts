// src/app/models/strategy.model.ts

export interface FinancialStrategy {
  id?: number;
  name: string;
  type: 'debt' | 'saving' | 'investment' | 'budget' | 'income';
  priority: number;
  description?: string;
  status: 'active' | 'completed' | 'paused' | 'archived';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Prescription {
  id?: number;
  strategyId?: number;
  title: string;
  description: string;
  actionType: 'pay_debt' | 'save_money' | 'invest' | 'reduce_expense' | 'increase_income';
  targetAmount?: number;
  deadline?: Date;
  priority: 'high' | 'medium' | 'low';
  behavioralInsight?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  createdAt?: Date;
  completedAt?: Date;
}

export interface BehavioralMetric {
  id?: number;
  metricType: 'spending_habit' | 'saving_habit' | 'debt_behavior' | 'investment_behavior';
  score: number;
  insight: string;
  recommendedAction: string;
  recordedAt: Date;
}

export interface RiskStrategy {
  id?: number;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  strategyName: string;
  description: string;
  allocationRules: {
    stocks: number;
    bonds: number;
    cash: number;
    realEstate: number;
  };
  expectedReturn: number;
  volatility: number;
}