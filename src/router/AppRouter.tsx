import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Layout } from '@/layouts/Layout';
import { LoginScreen } from '@/pages/LoginScreen';
import { AccessDenied } from '@/pages/AccessDenied';
import type { Role } from '@/types/user';
import { DashboardScreen } from '@/pages/DashboardScreen';
import { PosScreen } from '@/pages/PosScreen';
import { InventoryScreen } from '@/pages/InventoryScreen';
import { PurchaseScreen } from '@/pages/purchase/PurchaseScreen';
import { ExpenseScreen } from '@/pages/ExpenseScreen';
import { ReportsScreen } from '@/pages/ReportsScreen';
import { SettingsScreen } from '@/pages/SettingsScreen';
import { CustomersScreen } from '@/pages/CustomersScreen';
import { EmployeesScreen } from '@/pages/EmployeesScreen';
import { CreditRecoveryScreen } from '@/pages/CreditRecoveryScreen';
import { VatReportScreen } from '@/pages/VatReportScreen';
import { PurchaseBookScreen } from '@/pages/PurchaseBookScreen';
import { ReturnsScreen } from '@/pages/ReturnsScreen';
import TenantListPage from '@/pages/admin/tenants/TenantListPage';
import TenantLayout from '@/pages/admin/tenants/TenantLayout';
import TenantOverviewPage from '@/pages/admin/tenants/overview/TenantOverviewPage';
import TenantUsersPage from '@/pages/admin/tenants/users/TenantUsersPage';
import TenantActivityPage from '@/pages/admin/tenants/activity/TenantActivityPage';
import TenantSettingsPage from '@/pages/admin/tenants/settings/TenantSettingsPage';
import { TenantIntegrationsPage } from '@/pages/admin/tenants/integration/TenantIntegrationsPage';
import SystemConsolePage from '@/pages/admin/SystemConsolePage';
import { UpgradeRequestsPage } from '@/pages/admin/UpgradeRequestsPage';
import { StoreManagement } from '@/pages/StoreManagement';
import { SubscriptionPlansPage } from '@/pages/admin/SubscriptionPlansPage';
import SalesHistoryScreen from '@/pages/SalesHistoryScreen';
import { SubscriptionsDashboard } from '@/pages/admin/SubscriptionsDashboard';
import { AuditLogsPage } from '@/pages/admin/AuditLogsPage';
import { PlatformConsoleOverview } from '@/pages/admin/PlatformConsoleOverview';
import { SupportCenterPage } from '@/pages/admin/SupportCenterPage';

// Layout wrapper for protected routes
const ProtectedLayout = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <Layout>
            <Outlet />
        </Layout>
    );
};

// Strict role-based guard with security logging
const StrictRoleGuard = ({ allowedRoles }: { allowedRoles: Role[] }) => {
    const { user } = useAuth();

    if (!user) {
        console.warn('[SECURITY] Unauthenticated access attempt to protected route');
        return <Navigate to="/login" replace />;
    }

    const hasAccess = allowedRoles.includes(user.role);

    if (!hasAccess) {
        console.warn(`[SECURITY] Access denied: User ${user.email} (${user.role}) attempted to access route requiring: ${allowedRoles.join(', ')}`);
        return <Navigate to="/access-denied" replace />;
    }

    return <Outlet />;
};

// Landing page to redirect based on role
const RoleBasedLanding = () => {
    const { user } = useAuth();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role === 'SUPER_ADMIN') {
        return <Navigate to="/admin" replace />;
    }

    if (['VENDOR_ADMIN', 'VENDOR_MANAGER', 'INVENTORY_MANAGER'].includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Navigate to="/pos" replace />;
};


const router = createBrowserRouter([
    {
        path: "/login",
        element: <LoginScreen />
    },
    {
        path: "/access-denied",
        element: <AccessDenied />
    },
    {
        element: <ProtectedLayout />,
        children: [
            // Super Admin Routes
            {
                path: "/admin",
                element: <StrictRoleGuard allowedRoles={['SUPER_ADMIN']} />,
                children: [
                    { index: true, element: <Navigate to="/admin/dashboard" replace /> },
                    { path: "dashboard", element: <PlatformConsoleOverview /> },
                    { path: "tenants", element: <TenantListPage /> },
                    {
                        path: "tenants/:id",
                        element: <TenantLayout />,
                        children: [
                            { index: true, element: <Navigate to="overview" replace /> },
                            { path: "overview", element: <TenantOverviewPage /> },
                            { path: "users", element: <TenantUsersPage /> },
                            { path: "activity", element: <TenantActivityPage /> },
                            { path: "integrations", element: <TenantIntegrationsPage /> },
                            { path: "settings", element: <TenantSettingsPage /> },
                        ]
                    },
                    { path: "console", element: <SystemConsolePage /> },
                    { path: "upgrade-requests", element: <UpgradeRequestsPage /> },
                    { path: "subscriptions", element: <SubscriptionPlansPage /> },
                    { path: "billing", element: <SubscriptionsDashboard /> },
                    { path: "logs", element: <AuditLogsPage /> },
                    { path: "support", element: <SupportCenterPage /> },
                ]
            },
            // Root redirect
            {
                path: "/",
                element: <RoleBasedLanding />
            },
            // POS Route - Cashiers, Waiters, Managers, Admins
            {
                path: "/pos",
                element: <StrictRoleGuard allowedRoles={['VENDOR_ADMIN', 'VENDOR_MANAGER', 'CASHIER', 'WAITER']} />,
                children: [
                    { index: true, element: <PosScreen /> }
                ]
            },
            // Products Route - Inventory Managers, Managers, Admins (Cashiers can view only)
            {
                path: "/products",
                element: <StrictRoleGuard allowedRoles={['VENDOR_ADMIN', 'VENDOR_MANAGER', 'INVENTORY_MANAGER', 'CASHIER']} />,
                children: [
                    { index: true, element: <InventoryScreen /> }
                ]
            },
            // Customers Route - Most roles
            {
                path: "/customers",
                element: <StrictRoleGuard allowedRoles={['VENDOR_ADMIN', 'VENDOR_MANAGER', 'CASHIER', 'WAITER']} />,
                children: [
                    { index: true, element: <CustomersScreen /> }
                ]
            },
            // Returns Route
            {
                path: "/returns",
                element: <StrictRoleGuard allowedRoles={['VENDOR_ADMIN', 'VENDOR_MANAGER', 'CASHIER']} />,
                children: [
                    { index: true, element: <ReturnsScreen /> }
                ]
            },
            // Dashboard - Managers and above
            {
                path: "/dashboard",
                element: <StrictRoleGuard allowedRoles={['VENDOR_ADMIN', 'VENDOR_MANAGER', 'INVENTORY_MANAGER']} />,
                children: [
                    { index: true, element: <DashboardScreen /> }
                ]
            },
            // Credit Recovery - Managers and above
            {
                path: "/customers/recovery",
                element: <StrictRoleGuard allowedRoles={['VENDOR_ADMIN', 'VENDOR_MANAGER']} />,
                children: [
                    { index: true, element: <CreditRecoveryScreen /> }
                ]
            },
            // Purchases - Inventory and above
            {
                path: "/purchases",
                element: <StrictRoleGuard allowedRoles={['VENDOR_ADMIN', 'VENDOR_MANAGER', 'INVENTORY_MANAGER']} />,
                children: [
                    { index: true, element: <PurchaseScreen /> }
                ]
            },
            // Expenses - Managers and above
            {
                path: "/expenses",
                element: <StrictRoleGuard allowedRoles={['VENDOR_ADMIN', 'VENDOR_MANAGER']} />,
                children: [
                    { index: true, element: <ExpenseScreen /> }
                ]
            },
            // Reports - Managers and above
            {
                path: "/reports",
                element: <StrictRoleGuard allowedRoles={['VENDOR_ADMIN', 'VENDOR_MANAGER']} />,
                children: [
                    { index: true, element: <ReportsScreen /> },
                    { path: "vat", element: <VatReportScreen /> },
                    { path: "purchase-book", element: <PurchaseBookScreen /> },
                ]
            },
            // Settings - Admin only
            {
                path: "/settings",
                element: <StrictRoleGuard allowedRoles={['VENDOR_ADMIN']} />,
                children: [
                    { index: true, element: <SettingsScreen /> }
                ]
            },
            // Stores - Admin only
            {
                path: "/stores",
                element: <StrictRoleGuard allowedRoles={['VENDOR_ADMIN']} />,
                children: [
                    { index: true, element: <StoreManagement /> }
                ]
            },
            // Sales History - Managers and Cashiers
            {
                path: "/sales",
                element: <StrictRoleGuard allowedRoles={['VENDOR_ADMIN', 'VENDOR_MANAGER', 'CASHIER']} />,
                children: [
                    { index: true, element: <SalesHistoryScreen /> }
                ]
            },
            // Employees - Admin only
            {
                path: "/employees",
                element: <StrictRoleGuard allowedRoles={['VENDOR_ADMIN']} />,
                children: [
                    { index: true, element: <EmployeesScreen /> }
                ]
            },
            // Fallback - redirect to access denied instead of POS
            {
                path: "*",
                element: <Navigate to="/access-denied" replace />
            }
        ]
    }
]);

export const AppRouter = () => (
    <RouterProvider router={router} />
);
