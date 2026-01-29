import type { User } from "../../types/user";
import { apiClient, tokenStorage } from "./apiClient";

type LoginResponse = {
  status: "success";
  data: {
    accessToken: string;
    user: {
      id: string;
      full_name: string;
      email: string;
      role: string;
    };
  };
};

const mapRole = (role: string): User["role"] => {
  const normalized = (role || '').toUpperCase().trim();

  const validRoles: User["role"][] = [
    "SUPER_ADMIN",
    "VENDOR_ADMIN",
    "VENDOR_MANAGER",
    "CASHIER",
    "INVENTORY_MANAGER",
    "WAITER"
  ];

  // Handle common variations by normalizing
  const roleMap: Record<string, User["role"]> = {
    'SUPER_ADMIN': 'SUPER_ADMIN',
    'SUPER-ADMIN': 'SUPER_ADMIN',
    'SUPERADMIN': 'SUPER_ADMIN',
    'VENDOR_ADMIN': 'VENDOR_ADMIN',
    'VENDOR-ADMIN': 'VENDOR_ADMIN',
    'VENDORADMIN': 'VENDOR_ADMIN',
    'ADMIN': 'VENDOR_ADMIN', // Legacy mapping
    'VENDOR_MANAGER': 'VENDOR_MANAGER',
    'VENDOR-MANAGER': 'VENDOR_MANAGER',
    'MANAGER': 'VENDOR_MANAGER', // Legacy mapping
    'CASHIER': 'CASHIER',
    'INVENTORY_MANAGER': 'INVENTORY_MANAGER',
    'INVENTORY-MANAGER': 'INVENTORY_MANAGER',
    'WAITER': 'WAITER'
  };

  const mappedRole = roleMap[normalized];

  if (mappedRole && validRoles.includes(mappedRole)) {
    return mappedRole;
  }

  // ⚠️ SECURITY: Do NOT default to any role - throw error
  console.error(`[AUTH] Invalid role received from backend: "${role}"`);
  throw new Error(`Invalid user role: ${role}. Please contact support.`);
};

export const authApi = {
  login: async (usernameOrEmail: string, password: string): Promise<User> => {
    // Backend expects email + password
    const res = await apiClient.request<LoginResponse>("/api/auth/login", {
      method: "POST",
      json: {
        email: usernameOrEmail,
        password,
      },
    });

    tokenStorage.set(res.data.accessToken);

    const { id, full_name, email, role, tenant, branch_id } = res.data.user as any;

    return {
      id: id,
      name: full_name || email.split('@')[0],
      username: email.split('@')[0],
      email: email,
      role: mapRole(role),
      tenant: tenant ? {
        id: tenant.id,
        name: tenant.name,
        subscription_status: tenant.subscription_status,
        subscription_end_date: tenant.subscription_end_date,
        plan_interval: tenant.plan_interval
      } : undefined,
      branchId: branch_id
    };
  },
  logout: async () => {
    try {
      await apiClient.request("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Backend logout failed:", error);
    } finally {
      tokenStorage.clear();
    }
  },
};
