// src/app/models/chat.model.ts

export interface Conversation {
  id: number;
  sessionId: string;
  title: string;
  status: 'active' | 'closed' | 'archived';
  lastMessage?: string;
  messageCount: number;
  sentimentScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: number;
  conversationId: number;
  sender: 'user' | 'bot';
  content: string;
  messageType: 'text' | 'question' | 'recommendation' | 'alert' | 'insight';
  intent?: string;
  entities?: any;
  sentiment?: 'positive' | 'neutral' | 'negative';
  confidence?: number;
  explanation?: AIExplanation;
  timestamp: Date;
}

export interface AIExplanation {
  type: 'recommendation' | 'prediction' | 'insight' | 'alert';
  simplified: string;
  keyFactors: string[];
  confidenceFactors: string[];
  originalReasoning?: string;
  alternativeOptions?: string[];
}

export interface MessageFeedback {
  id?: number;
  messageId: number;
  rating: number;
  helpful: boolean;
  feedbackText?: string;
  createdAt: Date;
}

export interface UserIntent {
  intentName: string;
  description: string;
  examples: string[];
  responseTemplate: string;
  category: string;
}