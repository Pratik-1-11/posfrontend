import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "../types/user"
import { authApi } from "../services/api/authApi"
import { apiClient } from "../services/api/apiClient"

const USER_STORAGE_KEY = "pos_user";

type AuthContextType = {
    user: User | null
    login: (username: string, password: string) => Promise<User>
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem(USER_STORAGE_KEY);
        return saved ? (JSON.parse(saved) as User) : null;
    })

    useEffect(() => {
        apiClient.onUnauthorized(() => {
            setUser(null);
            localStorage.removeItem(USER_STORAGE_KEY);
            // Also clear the access token
            localStorage.removeItem('pos_access_token');
        });
    }, []);

    const login = async (username: string, password: string) => {
        const loggedUser = await authApi.login(username, password)
        setUser(loggedUser)
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedUser));
        return loggedUser;
    }

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (err) {
            console.error('Logout failed:', err);
        } finally {
            setUser(null);
            localStorage.removeItem(USER_STORAGE_KEY);
            localStorage.removeItem('pos_products_cache');
            localStorage.removeItem('pos_customers_cache');
            localStorage.removeItem('pos_access_token');
            // We could also clear Dexie here, but clearing storage keys is usually enough to force refetch.
        }
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
