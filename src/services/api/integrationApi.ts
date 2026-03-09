import { apiClient } from './apiClient';

export interface Integration {
    integration_id: string;
    name: string;
    integration_type: string;
    provider: string;
    status: string;
    last_sync_at: string;
    error_count: number;
    last_error: string;
    total_api_calls: number;
    failed_api_calls: number;
    failure_rate: number;
}

export interface WebhookSubscription {
    subscription_id: string;
    name: string;
    target_url: string;
    events: string[];
    active: boolean;
    success_count: number;
    failure_count: number;
    success_rate: number;
    last_triggered_at: string;
    last_error: string;
}

export interface SyncJob {
    job_id: string;
    integration_name: string;
    job_type: string;
    entity_type: string;
    status: string;
    records_processed: number;
    records_success: number;
    records_failed: number;
    created_at: string;
}

export const integrationApi = {
    getIntegrations: async (): Promise<Integration[]> => {
        const res = await apiClient.request<{ status: string, data: Integration[] }>('/api/integrations');
        return res.data;
    },

    createIntegration: async (data: any): Promise<any> => {
        const res = await apiClient.post<{ status: string, data: Integration }>('/api/integrations', data);
        return res.data;
    },

    getWebhooks: async (): Promise<WebhookSubscription[]> => {
        const res = await apiClient.request<{ status: string, data: WebhookSubscription[] }>('/api/integrations/webhooks');
        return res.data;
    },

    createWebhook: async (data: any): Promise<any> => {
        const res = await apiClient.post<{ status: string, data: WebhookSubscription }>('/api/integrations/webhooks', data);
        return res.data;
    },

    getSyncJobs: async (): Promise<SyncJob[]> => {
        const res = await apiClient.request<{ status: string, data: SyncJob[] }>('/api/integrations/sync');
        return res.data;
    },

    triggerSync: async (data: { integration_id: string, entity_type: string, sync_direction?: string }): Promise<any> => {
        const res = await apiClient.post<{ status: string, data: any }>('/api/integrations/sync/trigger', data);
        return res.data;
    }
};
