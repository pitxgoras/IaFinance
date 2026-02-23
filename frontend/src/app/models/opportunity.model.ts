// src/app/models/opportunity.model.ts

export interface IncomeOpportunity {
  id?: number;
  title: string;
  description: string;
  category: 'freelance' | 'part_time' | 'investment' | 'passive' | 'gig';
  estimatedIncomeMin: number;
  estimatedIncomeMax: number;
  requiredSkills: string[];
  timeCommitmentHours: number;
  difficulty: 'easy' | 'medium' | 'hard';
  successRate: number;
  matchScore?: number;
  matchReasons?: string[];
  recommendationStrength?: 'strong' | 'medium' | 'weak';
  status: 'recommended' | 'applied' | 'accepted' | 'rejected' | 'completed';
  createdAt?: Date;
}

export interface UserSkill {
  id?: number;
  skillName: string;
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsExperience: number;
  verified?: boolean;
  createdAt?: Date;
}

export interface UserExperience {
  id?: number;
  opportunityId: number;
  actualIncome: number;
  timeSpentHours: number;
  satisfactionScore: number;
  review: string;
  createdAt: Date;
}