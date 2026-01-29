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
  const normalized = (role || '').toLowerCase().trim();

  const validRoles: User["role"][] = [
    "admin",
    "super_admin",
    "super-admin",
    "branch_admin",
    "cashier",
    "waiter",
    "manager",
    "inventory_manager",
    "vendor_admin",
    "vendor_manager"
  ];

  if (validRoles.includes(normalized as any)) {
    return normalized as any;
  }

  // Handle common variations
  if (normalized === 'vendor_admin' || normalized === 'vendor-admin') return 'vendor_admin';
  if (normalized === 'vendor_manager' || normalized === 'vendor-manager') return 'vendor_manager';
  if (normalized === 'super_admin' || normalized === 'super-admin') return 'super_admin';

  return "cashier"; // Fallback
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

    const { id, full_name, email, role } = res.data.user;

    return {
      id: id,
      name: full_name || email.split('@')[0],
      username: email.split('@')[0],
      email: email,
      role: mapRole(role),
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
