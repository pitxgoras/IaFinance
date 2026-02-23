// src/app/models/simulation.model.ts

export interface Simulation {
  id?: number;
  name: string;
  description?: string;
  type: 'income_change' | 'expense_change' | 'debt_payment' | 'investment' | 'custom';
  status?: 'draft' | 'running' | 'completed' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SimulationVariable {
  id?: number;
  simulationId?: number;
  name: string;
  type: 'income' | 'expense' | 'debt' | 'saving' | 'investment';
  currentValue: number;
  simulatedValue: number;
  impactPercentage?: number;
}

export interface SimulationResult {
  id?: number;
  simulationId: number;
  projectedBalance: number;
  projectedSavings: number;
  projectedDebt: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  successProbability: number;
  monthlyImpact: number;
  yearlyImpact: number;
  recommendations: Recommendation[];
  executiveSummary?: string;
}

export interface Recommendation {
  type: 'critical' | 'warning' | 'success' | 'info' | 'opportunity' | 'caution';
  icon: string;
  title: string;
  description: string;
  action: string;
  priority: string;
  impact: string;
}

export interface SimulationScenario {
  id?: number;
  simulationId: number;
  name: string;
  description?: string;
  parameters: any;
  isBase: boolean;
}