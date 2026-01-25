import { apiClient } from './apiClient';

export interface Branch {
    id: string;
    tenant_id: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    manager_id?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface SubscriptionInfo {
    id: string;
    name: string;
    subscription_tier: 'basic' | 'pro' | 'enterprise';
    subscription_status: string;
    max_stores: number;
    current_stores_count: number;
    verified: boolean;
}

export interface UpgradeRequest {
    id: string;
    requested_tier: 'pro' | 'enterprise';
    current_tier: string;
    requested_stores_count?: number;
    business_justification?: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

class TenantApi {
    /**
     * Get current tenant subscription and store limits
     */
    async getSubscriptionInfo(): Promise<SubscriptionInfo> {
        const response = await apiClient.get<{ data: SubscriptionInfo }>('/api/tenants/subscription');
        return response.data;
    }

    /**
     * Request a tier upgrade
     */
    async requestUpgrade(data: {
        requested_tier: 'pro' | 'enterprise';
        justification: string;
        stores_count?: number
    }): Promise<UpgradeRequest> {
        const response = await apiClient.post<{ data: UpgradeRequest }>('/api/tenants/upgrade-requests', data);
        return response.data;
    }

    /**
     * Get my upgrade requests
     */
    async getUpgradeRequests(): Promise<UpgradeRequest[]> {
        const response = await apiClient.get<{ data: UpgradeRequest[] }>('/api/tenants/upgrade-requests');
        return response.data;
    }

    /**
     * List all stores (branches)
     */
    async getBranches(): Promise<Branch[]> {
        const response = await apiClient.get<{ data: Branch[] }>('/api/tenants/branches');
        return response.data;
    }

    /**
     * Create a new store
     */
    async createBranch(data: Partial<Branch>): Promise<Branch> {
        const response = await apiClient.post<{ data: Branch }>('/api/tenants/branches', data);
        return response.data;
    }

    /**
     * Update an existing store
     */
    async updateBranch(branchId: string, data: Partial<Branch>): Promise<Branch> {
        const response = await apiClient.put<{ data: Branch }>(`/api/tenants/branches/${branchId}`, data);
        return response.data;
    }
}

export const tenantApi = new TenantApi();
