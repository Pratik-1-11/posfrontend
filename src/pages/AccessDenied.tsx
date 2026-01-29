import { useAuth } from '@/context/AuthContext';
import { ShieldAlert, Home, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export const AccessDenied = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleGoBack = () => {
        // Redirect based on role to appropriate landing page
        switch (user?.role) {
            case 'SUPER_ADMIN':
                navigate('/admin');
                break;
            case 'VENDOR_ADMIN':
            case 'VENDOR_MANAGER':
            case 'INVENTORY_MANAGER':
                navigate('/dashboard');
                break;
            case 'CASHIER':
            case 'WAITER':
                navigate('/pos');
                break;
            default:
                navigate('/login');
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
            <div className="text-center max-w-md w-full bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
                <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <ShieldAlert className="w-12 h-12 text-red-500" />
                </div>

                <h1 className="text-3xl font-black text-white mb-4">Access Denied</h1>

                <p className="text-slate-400 mb-2">
                    Your current role does not have permission to access this page.
                </p>

                <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-lg border border-slate-600 mb-8">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Role:</span>
                    <span className="font-black text-white text-sm">
                        {user?.role?.replace(/_/g, ' ') || 'Unknown'}
                    </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={handleGoBack}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                    >
                        <Home size={18} />
                        Go to Dashboard
                    </Button>
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="flex items-center gap-2 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40"
                    >
                        <LogOut size={18} />
                        Logout
                    </Button>
                </div>

                <p className="text-xs text-slate-600 mt-8">
                    If you believe you should have access to this page, please contact your administrator.
                </p>
            </div>
        </div>
    );
};
