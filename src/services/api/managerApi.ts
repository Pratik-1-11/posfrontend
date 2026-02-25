import { apiClient } from './apiClient';

interface ApiResponse<T> {
    status: string;
    data: T;
    message?: string;
}

export interface ManagerInfo {
    id: string;
    name: string;
    role: string;
}

export const managerApi = {
    /**
     * Verifies a manager PIN and returns manager details if successful
     */
    verifyPin: async (pin: string) => {
        const response = await apiClient.post<ApiResponse<{ manager: ManagerInfo }>>('/api/manager/verify-pin', { pin });
        return response.data.manager;
    },

    /**
     * Updates or sets a manager PIN for a user
     */
    updatePin: async (userId: string, newPin: string) => {
        const response = await apiClient.post<ApiResponse<void>>('/api/manager/update-pin', { userId, newPin });
        return response.data;
    }
};
