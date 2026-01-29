/**
 * Super Admin API Service
 * 
 * API calls for managing tenants, monitoring, and control
 */

import { apiClient } from './apiClient';

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    type: 'super' | 'vendor';
    business_name?: string;
    business_registration_number?: string;
    contact_email: string;
    contact_phone?: string;
    address?: string;
    plan_id?: string;
    deleted_at?: string;
    subscription_tier: string;
    subscription_status: 'active' | 'trial' | 'suspended' | 'cancelled';
    plan_interval?: 'monthly' | 'yearly' | string;
    subscription_start_date?: string;
    subscription_end_date?: string;
    subscription_started_at?: string;
    subscription_expires_at?: string;
    settings?: Record<string, any>;
    resource_limits?: {
        max_users: number;
        max_products: number;
        max_branches: number;
        storage_gb: number;
        features: string[];
    };
    plans?: Plan; // Joined plan data
    is_active: boolean;
    verified?: boolean;
    max_stores?: number;
    current_stores_count?: number;
    onboarded_at?: string;
    created_at: string;
    updated_at: string;
}

export interface TenantStats {
    users: number;
    products: number;
    customers: number;
    sales: number;
    revenue: number;
    activeUsers: number;
    storageUsed: number; // in MB
}

export interface TenantWithStats extends Tenant {
    stats: any;
}

export interface PlatformStats {
    totalTenants: number;
    activeTenants: number;
    suspendedTenants: number;
    totalUsers: number;
    totalRevenue: number;
    totalSales: number;
    systemUptime: number;
    arpu?: number;
    tierDistribution?: Record<string, number>;
    growthData?: Array<{ name: string; tenants: number; revenue: number }>;
}


export interface UpgradeRequest {
    id: string;
    tenant_id: string;
    requested_tier: 'pro' | 'enterprise';
    current_tier: string;
    requested_stores_count: number;
    business_justification: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewed_by?: string;
    reviewed_at?: string;
    rejection_reason?: string;
    created_at: string;
    tenant?: {
        name: string;
        subscription_tier: string;
    };
}

export interface Plan {
    id: string;
    name: string;
    slug: string;
    description: string;
    price_monthly: number;
    price_yearly: number;
    currency: string;
    max_users: number;
    max_stores: number;
    max_products: number;
    max_customers: number;
    features: {
        api_access: boolean;
        custom_reports: boolean;
        inventory_v2: boolean;
        loyalty_program: boolean;
        multi_branch_sync: boolean;
    };
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

class SuperAdminApi {
    /**
     * Get all tenants
     */
    async getAllTenants(): Promise<TenantWithStats[]> {
        const response = await apiClient.get<{ status: string, data: TenantWithStats[] }>('/api/admin/tenants');
        return response.data || (response as any);
    }

    /**
     * Get single tenant by ID
     */
    async getTenant(tenantId: string): Promise<TenantWithStats> {
        const response = await apiClient.get<{ data: TenantWithStats }>(`/api/admin/tenants/${tenantId}`);
        return response.data;
    }

    /**
     * Create new tenant
     */
    async createTenant(data: {
        name: string;
        slug: string;
        contact_email: string;
        contact_phone?: string;
        subscription_tier?: 'basic' | 'pro' | 'enterprise';
        password?: string;
    }): Promise<Tenant> {
        const response = await apiClient.post<{ data: Tenant }>('/api/admin/tenants', data);
        return response.data;
    }

    /**
     * Update tenant
     */
    async updateTenant(tenantId: string, data: Partial<Tenant>): Promise<Tenant> {
        const response = await apiClient.put<{ data: Tenant }>(`/api/admin/tenants/${tenantId}`, data);
        return response.data;
    }

    /**
     * Delete tenant (soft delete)
     */
    async deleteTenant(tenantId: string): Promise<void> {
        await apiClient.delete(`/api/admin/tenants/${tenantId}`);
    }

    /**
     * Suspend tenant
     */
    async suspendTenant(tenantId: string, reason?: string): Promise<Tenant> {
        const response = await apiClient.post<{ data: Tenant }>(`/api/admin/tenants/${tenantId}/suspend`, { reason });
        return response.data;
    }

    /**
     * Activate tenant
     */
    async activateTenant(tenantId: string): Promise<Tenant> {
        const response = await apiClient.post<{ data: Tenant }>(`/api/admin/tenants/${tenantId}/activate`);
        return response.data;
    }

    /**
     * Get tenant statistics
     */
    async getTenantStats(tenantId: string): Promise<TenantStats> {
        const response = await apiClient.get<{ data: TenantStats }>(`/api/admin/tenants/${tenantId}/stats`);
        return response.data;
    }

    /**
     * Get platform-wide statistics
     */
    async getPlatformStats(): Promise<PlatformStats> {
        const response = await apiClient.get<{ data: PlatformStats }>('/api/admin/stats/platform');
        return response.data || (response as any);
    }

    /**
     * Get activity logs for a tenant
     */
    async getTenantActivityLogs(
        tenantId: string,
        options?: { limit?: number; offset?: number }
    ): Promise<ActivityLog[]> {
        const response = await apiClient.get<{ data: ActivityLog[] }>(`/api/admin/tenants/${tenantId}/activity`, { params: options });
        return response.data || (response as any);
    }

    /**
     * Get platform-wide activity logs
     */
    async getPlatformActivityLogs(
        options?: { limit?: number; offset?: number }
    ): Promise<ActivityLog[]> {
        const response = await apiClient.get<{ data: ActivityLog[] }>('/api/admin/activity', { params: options });
        return response.data || (response as any);
    }

    /**
     * Impersonate a user (for support)
     */
    async impersonateUser(userId: string): Promise<{ token: string; user: any }> {
        const response = await apiClient.post<{ data: { token: string; user: any } }>(`/api/admin/impersonate/${userId}`);
        return response.data;
    }

    /**
     * Stop impersonation
     */
    async stopImpersonation(): Promise<{ token: string }> {
        const response = await apiClient.post<{ data: { token: string } }>('/api/admin/stop-impersonation');
        return response.data;
    }

    /**
     * Export tenant data
     */
    async exportTenantData(tenantId: string, format: 'csv' | 'json' = 'json'): Promise<Blob> {
        const token = localStorage.getItem('pos_access_token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/tenants/${tenantId}/export?format=${format}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return await response.blob();
    }

    /**
     * Generate tenant backup
     */
    async generateBackup(tenantId: string): Promise<{ backupId: string; downloadUrl: string }> {
        const response = await apiClient.post<{ data: { backupId: string; downloadUrl: string } }>(`/api/admin/tenants/${tenantId}/backup`);
        return response.data;
    }

    /**
     * Update subscription tier
     */
    async updateSubscription(
        tenantId: string,
        data: {
            tier?: string;
            status?: string;
            interval?: string;
            endDate?: string;
        }
    ): Promise<Tenant> {
        const response = await apiClient.put<{ data: Tenant }>(`/api/admin/tenants/${tenantId}/subscription`, data);
        return response.data;
    }

    /**
     * Get tenant users
     */
    async getTenantUsers(tenantId: string): Promise<any[]> {
        const response = await apiClient.get<{ data: any[] }>(`/api/admin/tenants/${tenantId}/users`);
        return response.data || (response as any);
    }

    /**
     * Create user for tenant
     */
    async createTenantUser(tenantId: string, userData: {
        email: string;
        full_name: string;
        role: string;
    }): Promise<any> {
        const response = await apiClient.post<{ data: any }>(`/api/admin/tenants/${tenantId}/users`, userData);
        return response.data;
    }

    /**
     * Get tenant analytics
     */
    async getTenantAnalytics(
        tenantId: string,
        dateRange: { from: string; to: string }
    ): Promise<{
        salesByDay: Array<{ date: string; sales: number; revenue: number }>;
        topProducts: Array<{ name: string; sales: number; revenue: number }>;
        userActivity: Array<{ date: string; activeUsers: number }>;
    }> {
        const response = await apiClient.get<{
            data: {
                salesByDay: Array<{ date: string; sales: number; revenue: number }>;
                topProducts: Array<{ name: string; sales: number; revenue: number }>;
                userActivity: Array<{ date: string; activeUsers: number }>;
            }
        }>(`/api/admin/tenants/${tenantId}/analytics`, { params: dateRange });
        return response.data;
    }

    /**
     * Get platform settings
     */
    async getPlatformSettings(): Promise<any> {
        const response = await apiClient.get<{ data: any }>('/api/admin/settings');
        return response.data;
    }

    /**
     * Update platform setting
     */
    async updatePlatformSetting(key: string, value: any): Promise<any> {
        const response = await apiClient.put<{ data: any }>('/api/admin/settings', { key, value });
        return response.data;
    }

    /**
     * Update tenant resource limits
     */
    async updateTenantLimits(tenantId: string, limits: any): Promise<any> {
        const response = await apiClient.put<{ data: any }>(`/api/admin/tenants/${tenantId}/limits`, { resource_limits: limits });
        return response.data;
    }

    /**
     * Get all tenant upgrade requests
     */
    async getAllUpgradeRequests(): Promise<UpgradeRequest[]> {
        const response = await apiClient.get<{ status: string, data: UpgradeRequest[] }>('/api/admin/upgrade-requests');
        return response.data;
    }

    /**
     * Review/Approve/Reject tenant upgrade request
     */
    async reviewUpgradeRequest(requestId: string, data: { status: 'approved' | 'rejected', rejection_reason?: string }): Promise<void> {
        await apiClient.patch(`/api/admin/upgrade-requests/${requestId}/review`, data);
    }

    async verifyTenant(tenantId: string): Promise<Tenant> {
        const response = await apiClient.patch<{ status: string, data: Tenant }>(`/api/admin/tenants/${tenantId}/verify`);
        return response.data;
    }

    /**
     * Billing & Monetization
     */
    async getAllInvoices(params?: { tenantId?: string; status?: string }): Promise<Invoice[]> {
        const response = await apiClient.get<{ data: Invoice[] }>('/api/admin/billing/invoices', { params });
        return (response as any).data || response;
    }

    async recordPayment(data: {
        invoice_id: string;
        payment_method: string;
        transaction_id?: string;
    }): Promise<any> {
        return await apiClient.post<any>('/api/admin/billing/payments', data);
    }

    async runBillingMaintenance(): Promise<{ message: string }> {
        return await apiClient.post<{ message: string }>('/api/admin/billing/maintenance');
    }

    /**
     * Support & Announcements
     */
    async createAnnouncement(data: Partial<Announcement>): Promise<Announcement> {
        const response = await apiClient.post<{ data: Announcement }>('/api/admin/announcements', data);
        return response.data;
    }

    async getAnnouncements(): Promise<Announcement[]> {
        const response = await apiClient.get<{ data: Announcement[] }>('/api/admin/announcements');
        return response.data;
    }

    async getTenantHealth(tenantId: string): Promise<{ health_score: number }> {
        const response = await apiClient.get<{ data: { health_score: number } }>(`/api/admin/tenants/${tenantId}/health`);
        return response.data;
    }
}

export interface ActivityLog {
    id: string;
    tenant_id?: string;
    actor_id: string;
    actor_role: string;
    action: string;
    entity_type: string;
    entity_id?: string;
    changes?: Record<string, any>;
    ip_address?: string;
    created_at: string;
    tenant?: {
        name: string;
    };
}

export interface Invoice {
    id: string;
    tenant_id: string;
    plan_id: string;
    invoice_number: string;
    amount: number;
    currency: string;
    status: 'paid' | 'unpaid' | 'overdue' | 'void';
    billing_reason: string;
    billing_period_start: string;
    billing_period_end: string;
    due_date: string;
    paid_at?: string;
    created_at: string;
    tenant?: {
        name: string;
        slug: string;
    };
}

export interface Announcement {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'critical' | 'success';
    target_plan_id?: string;
    starts_at: string;
    ends_at?: string;
    is_active: boolean;
    created_at: string;
}

export const superAdminApi = new SuperAdminApi();
