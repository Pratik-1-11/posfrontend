import { apiClient } from "./apiClient";

export const settingsApi = {
    get: async () => {
        return await apiClient.request<any>('/api/settings', { method: 'GET' });
    },
    update: async (settings: any) => {
        return await apiClient.request<any>('/api/settings', {
            method: 'PUT',
            json: settings
        });
    }
};
