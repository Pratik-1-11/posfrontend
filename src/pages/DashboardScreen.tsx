import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Package, Plus, RefreshCw, FileText, AlertTriangle } from 'lucide-react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '@/services/api/reportApi';
import { useProductContext } from '@/context/ProductContext';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { orderApi } from '@/services/api/orderApi';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { canViewReports, isAdmin } from '@/utils/permissions';


const RecentTransactions = ({ transactions, navigate }: { transactions: any[], navigate: (path: string) => void }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold">Recent Sales</CardTitle>
            <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
                onClick={() => navigate('/reports')}
            >
                View History
            </Button>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {transactions.length > 0 ? (
                    transactions.slice(0, 5).map((t, i) => (
                        <div
                            key={t.id || i}
                            className="flex items-center justify-between pb-4 last:pb-0 last:border-0 border-b border-gray-100 cursor-pointer hover:bg-gray-50/50 transition-colors rounded-lg px-2 -mx-2"
                            onClick={() => navigate('/reports')}
                        >
                            <div className="space-y-1">
                                <p className="text-sm font-black leading-none uppercase tracking-tight">{t.invoice_number}</p>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">{t.created_at ? format(new Date(t.created_at), 'MMM dd, HH:mm') : 'N/A'} • {t.customer_name || 'Walk-in'}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="font-black text-sm text-slate-900">Rs.{Number(t.total_amount).toLocaleString()}</div>
                                <div className="text-[10px] font-bold uppercase text-slate-400 bg-slate-100 px-1.5 rounded">{t.payment_method}</div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-8 font-bold uppercase tracking-widest bg-slate-50/50 rounded-xl">No recent sales</p>
                )}
            </div>
        </CardContent>
    </Card>
);



const QuickActions = ({ navigate }: { navigate: (path: string) => void }) => {
    const actions = [
        { icon: ShoppingCart, label: 'New Sale', className: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-100', path: '/pos' },
        { icon: Package, label: 'Add Product', className: 'bg-green-50 text-green-600 hover:bg-green-100 border-green-100', path: '/products' },
        { icon: RefreshCw, label: 'Restock', className: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-100', path: '/purchases' },
        { icon: FileText, label: 'Reports', className: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100 border-yellow-100', path: '/reports' },
    ];

    return (
        <Card className="mb-8">
            <CardHeader>
                <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {actions.map((action, index) => (
                        <Button
                            key={index}
                            variant="outline"
                            className={cn(
                                "h-auto py-6 flex flex-col gap-3 transition-all duration-200 border",
                                action.className
                            )}
                            onClick={() => navigate(action.path)}
                        >
                            <action.icon className="h-6 w-6" />
                            <span className="font-semibold text-sm">{action.label}</span>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};


const DashboardSkeleton = () => (
    <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-10 w-32 rounded-lg" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 rounded-3xl" />
            ))}
        </div>

        <Skeleton className="h-32 rounded-3xl w-full" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-[400px] rounded-3xl" />
            <Skeleton className="h-[400px] rounded-3xl" />
        </div>
    </div>
);

const DashboardContent: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { products, loading: productsLoading } = useProductContext();

    const { data: summary, isLoading: summaryLoading } = useQuery({
        queryKey: ['dashboardSummary'],
        queryFn: reportApi.getSummary,
    });

    const { data: recentOrders = [], isLoading: ordersLoading } = useQuery({
        queryKey: ['recentOrders'],
        queryFn: () => orderApi.getAll(),
    });

    const dailySales = summary?.dailySales || [];
    const health = summary?.health;
    const performance = summary?.performance;

    // Calculate metrics
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const todayStats = dailySales.find((stat) => stat.sale_date === today) || {
        total_revenue: 0,
        total_transactions: 0
    };

    const yesterdayStats = dailySales.find((stat) => stat.sale_date === yesterday) || {
        total_revenue: 0,
        total_transactions: 0
    };

    const calculateTrend = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? { value: 100, isPositive: true } : undefined;
        const diff = ((current - previous) / previous) * 100;
        return {
            value: Math.abs(Math.round(diff * 10) / 10),
            isPositive: diff >= 0
        };
    };

    const salesTrend = calculateTrend(todayStats.total_revenue, yesterdayStats.total_revenue);

    const totalProducts = products.length;

    if (productsLoading || summaryLoading || ordersLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Mart Operations Dashboard</h1>
                    <p className="text-sm text-muted-foreground font-medium">
                        {new Date().toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={() => navigate('/pos')} className="gap-2 shadow-sm font-semibold">
                        <Plus className="h-4 w-4" />
                        New Sale
                    </Button>
                </div>
            </div>

            <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <DashboardCard
                        title="Today's Sales"
                        value={`Rs.${(todayStats.total_revenue || 0).toLocaleString()}`}
                        icon={ShoppingCart}
                        trend={salesTrend}
                        onClick={() => navigate('/reports')}
                    />
                    {canViewReports(user?.role) && (
                        <DashboardCard
                            title="Active Cashiers"
                            value={`${health?.activeCashiers || 0}`}
                            icon={FileText}
                            onClick={() => navigate('/employees')}
                        />
                    )}
                    {canViewReports(user?.role) && (
                        <DashboardCard
                            title="Pending Credits"
                            value={`Rs.${(health?.pendingCredits || 0).toLocaleString()}`}
                            icon={AlertTriangle}
                            description="Customer dues"
                            onClick={() => navigate('/customers')}
                            className={(health?.pendingCredits || 0) > 10000 ? "border-orange-100" : ""}
                        />
                    )}
                    <DashboardCard
                        title="Low Stock"
                        value={`${health?.lowStockAlerts || 0}`}
                        icon={Package}
                        description={(health?.lowStockAlerts || 0) > 0 ? "Items need attention" : "All good"}
                        onClick={() => navigate('/inventory')}
                        className={(health?.lowStockAlerts || 0) > 0 ? "border-red-100" : ""}
                    />
                    <DashboardCard
                        title="Expiring Soon"
                        value={`${health?.expiringSoon || 0}`}
                        icon={AlertTriangle}
                        description={(health?.expiringSoon || 0) > 0 ? "Check batches" : "No near expiry"}
                        onClick={() => navigate('/inventory')}
                        className={(health?.expiringSoon || 0) > 0 ? "border-orange-100" : ""}
                    />
                </div>

                {/* Quick Actions */}
                <QuickActions navigate={navigate} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <RecentTransactions transactions={recentOrders} navigate={navigate} />

                    {/* Performance & Analytics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">Top Selling Products</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {performance?.topProducts && performance.topProducts.length > 0 ? (
                                    performance.topProducts.map((p, i) => (
                                        <div key={i} className="flex items-center justify-between pb-2 border-b last:border-0 border-gray-50">
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                                                <span className="text-sm font-medium">{p.name}</span>
                                            </div>
                                            <div className="text-sm font-semibold">Rs.{p.revenue?.toLocaleString()}</div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No data available</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* More Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {canViewReports(user?.role) && (
                        <Card className="col-span-1 md:col-span-1">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Payment Split (30d)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {Object.entries(performance?.paymentSplit || {}).map(([method, amount]) => (
                                        <div key={method} className="flex justify-between items-center text-sm">
                                            <span className="capitalize text-muted-foreground">{method}</span>
                                            <span className="font-medium">Rs.{amount.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {isAdmin(user?.role) && (
                        <Card className="col-span-1 md:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Operational Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-muted-foreground uppercase">Failed Orders (Today)</p>
                                        <p className={cn("text-xl font-bold mt-1", (health?.failedTransactions || 0) > 0 ? "text-red-600" : "text-gray-900")}>
                                            {health?.failedTransactions || 0}
                                        </p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-muted-foreground uppercase">Total SKUs</p>
                                        <p className="text-xl font-bold mt-1 text-gray-900">{totalProducts}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};


export const DashboardScreen: React.FC = () => {
    return <DashboardContent />;
};
