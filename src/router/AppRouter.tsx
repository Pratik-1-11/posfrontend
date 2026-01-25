import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Layout } from '@/layouts/Layout';
import { LoginScreen } from '@/pages/LoginScreen';
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
import SystemConsolePage from '@/pages/admin/SystemConsolePage';
import { UpgradeRequestsPage } from '@/pages/admin/UpgradeRequestsPage';
import { StoreManagement } from '@/pages/StoreManagement';
import { SubscriptionPlansPage } from '@/pages/admin/SubscriptionPlansPage';

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

// Guard for role-specific routes
const RoleGuard = ({ roles }: { roles: string[] }) => {
    const { user } = useAuth();
    const userRole = user?.role?.toLowerCase();
    const canAccess = user && (
        roles.some(r => r.toLowerCase() === userRole) ||
        userRole === 'super_admin' ||
        userRole === 'super-admin'
    );

    if (canAccess) return <Outlet />;

    // Redirect logic
    if (userRole === 'super_admin' || userRole === 'super-admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/pos" replace />;
};

// Landing page to redirect based on role
const RoleBasedLanding = () => {
    const { user } = useAuth();
    const userRole = user?.role?.toLowerCase();
    if (userRole === 'super_admin' || userRole === 'super-admin') {
        return <Navigate to="/admin" replace />;
    }

    if (userRole === 'admin' || userRole === 'manager' || userRole === 'vendor_admin' || userRole === 'branch_admin') {
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
        element: <ProtectedLayout />,
        children: [
            {
                path: "/admin",
                element: <RoleGuard roles={[]} />, // Empty roles but RoleGuard allows SUPER_ADMIN
                children: [
                    { index: true, element: <Navigate to="/admin/tenants" replace /> },
                    { path: "tenants", element: <TenantListPage /> },
                    {
                        path: "tenants/:id",
                        element: <TenantLayout />,
                        children: [
                            { index: true, element: <Navigate to="overview" replace /> },
                            { path: "overview", element: <TenantOverviewPage /> },
                            { path: "users", element: <TenantUsersPage /> },
                            { path: "activity", element: <TenantActivityPage /> },
                            { path: "settings", element: <TenantSettingsPage /> },
                        ]
                    },
                    { path: "console", element: <SystemConsolePage /> },
                    { path: "upgrade-requests", element: <UpgradeRequestsPage /> },
                    { path: "subscriptions", element: <SubscriptionPlansPage /> },
                ]
            },
            {
                path: "/",
                element: <RoleBasedLanding />
            },
            {
                path: "/pos",
                element: <PosScreen />
            },
            {
                path: "/products",
                element: <InventoryScreen />
            },
            {
                path: "/customers",
                element: <CustomersScreen />
            },
            {
                path: "/returns",
                element: <ReturnsScreen />
            },
            {
                element: <RoleGuard roles={['admin', 'super_admin', 'manager', 'VENDOR_ADMIN', 'vendor_admin']} />,
                children: [
                    {
                        path: "/customers/recovery",
                        element: <CreditRecoveryScreen />
                    },
                    {
                        path: "/dashboard",
                        element: <DashboardScreen />
                    },
                    {
                        path: "/purchases",
                        element: <PurchaseScreen />
                    },
                    {
                        path: "/expenses",
                        element: <ExpenseScreen />
                    },
                    {
                        path: "/reports",
                        element: <ReportsScreen />
                    },
                    {
                        path: "/reports/vat",
                        element: <VatReportScreen />
                    },
                    {
                        path: "/reports/purchase-book",
                        element: <PurchaseBookScreen />
                    },
                    {
                        path: "/settings",
                        element: <SettingsScreen />
                    },
                    {
                        path: "/stores",
                        element: <StoreManagement />
                    },
                ]
            },
            {
                element: <RoleGuard roles={['admin', 'super_admin', 'VENDOR_ADMIN', 'vendor_admin']} />,
                children: [
                    {
                        path: "/employees",
                        element: <EmployeesScreen />
                    },
                ]
            },
            {
                path: "*",
                element: <Navigate to="/pos" replace />
            }
        ]
    }
]);

export const AppRouter = () => (
    <RouterProvider router={router} />
);
