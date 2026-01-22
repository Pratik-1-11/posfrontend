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
  // Check for new roles first (case sensitive)
  if (role === 'SUPER_ADMIN' || role === 'VENDOR_ADMIN') {
    return role;
  }

  // Fallback for legacy roles
  const lowercaseRole = role.toLowerCase() as User["role"];
  const validRoles: User["role"][] = ["admin", "super_admin", "branch_admin", "cashier", "waiter", "manager", "inventory_manager"];

  if (validRoles.includes(lowercaseRole)) {
    return lowercaseRole;
  }
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
