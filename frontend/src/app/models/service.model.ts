// src/app/models/service.model.ts

export interface ConnectedService {
  id?: number;
  serviceName: string;
  serviceType: 'bank' | 'freelance' | 'investment' | 'payment' | 'other';
  connectionStatus: 'active' | 'inactive' | 'error';
  lastSyncAt?: Date;
  isActive: boolean;
  tokenValid: boolean;
  createdAt?: Date;
}

export interface ExternalAPI {
  id?: number;
  apiName: string;
  apiType: string;
  baseUrl: string;
  authType: 'oauth2' | 'api_key' | 'jwt' | 'none';
  documentationUrl?: string;
  status: 'active' | 'inactive' | 'maintenance';
}

export interface Webhook {
  id?: number;
  serviceId: number;
  webhookUrl: string;
  eventType: string;
  isActive: boolean;
  lastTriggeredAt?: Date;
}

export interface IntegrationLog {
  id?: number;
  serviceId: number;
  eventType: string;
  statusCode: number;
  errorMessage?: string;
  durationMs: number;
  createdAt: Date;
}