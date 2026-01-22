import { apiClient } from "./apiClient";
import type { User } from "../../types/user";

type BackendUserResponse = {
    status: string;
    data: {
        users: any[];
    };
};

type BackendSingleUserResponse = {
    status: string;
    data: {
        user: any;
    };
};

const mapUserFromBackend = (u: any): User => ({
    id: u.id,
    name: u.full_name || u.username || 'Unnamed',
    username: u.username,
    email: u.email,
    role: u.role,
});

export const employeeApi = {
    getEmployees: async (): Promise<User[]> => {
        const res = await apiClient.request<BackendUserResponse>('/api/users');
        return res.data.users.map(mapUserFromBackend);
    },

    addEmployee: async (employee: Omit<User, "id">): Promise<User> => {
        const res = await apiClient.request<BackendSingleUserResponse>('/api/users', {
            method: 'POST',
            json: {
                fullName: employee.name,
                username: employee.username,
                email: employee.email,
                password: employee.password,
                role: employee.role
            }
        });
        return mapUserFromBackend(res.data.user);
    },

    updateEmployee: async (id: string, updates: Partial<Omit<User, "id">>): Promise<User> => {
        const res = await apiClient.request<BackendSingleUserResponse>(`/api/users/${id}`, {
            method: 'PATCH',
            json: {
                fullName: updates.name,
                username: updates.username,
                email: updates.email,
                password: updates.password,
                role: updates.role
            }
        });
        return mapUserFromBackend(res.data.user);
    },

    deleteEmployee: async (id: string): Promise<void> => {
        await apiClient.request(`/api/users/${id}`, {
            method: 'DELETE'
        });
    },
};
