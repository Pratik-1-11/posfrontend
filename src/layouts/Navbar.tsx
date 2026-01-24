import React from 'react';
import { Menu, Bell, User } from 'lucide-react';
import { useProductContext } from '@/context/ProductContext';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  toggleCollapse?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleSidebar, isSidebarOpen, toggleCollapse }) => {
  const { user } = useAuth();
  const { products } = useProductContext();
  const [showNotifications, setShowNotifications] = React.useState(false);

  // Filter low stock products
  const lowStockProducts = React.useMemo(() => {
    return products.filter(p => {
      // Default threshold is 10 if not specified
      const threshold = p.minStockLevel ?? 10;
      return p.stock <= threshold;
    });
  }, [products]);

  const notificationCount = lowStockProducts.length;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-white/5 flex items-center justify-between px-4 md:px-6 z-[50] font-inter no-print">
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <span className="font-black text-xs">P</span>
          </div>
          <h1 className="text-lg font-black text-white tracking-tight uppercase hidden sm:block">
            Vishma <span className="text-primary">POS</span>
          </h1>
        </div>

        {!isSidebarOpen && toggleCollapse && (
          <button
            className="hidden lg:flex p-2 rounded-lg bg-white/5 text-slate-400 hover:text-primary hover:bg-primary/10 transition-all"
            onClick={toggleCollapse}
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 md:gap-4">
        <div className="relative">
          <button
            className={`relative p-2 rounded-xl bg-white/5 ${showNotifications ? 'text-white' : 'text-slate-400'} hover:text-white hover:bg-white/10 transition-all`}
            aria-label="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            onBlur={() => setTimeout(() => setShowNotifications(false), 200)}
          >
            <Bell size={20} />
            {notificationCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-slate-900 animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Notifications</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                  {notificationCount} New
                </span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map(product => (
                    <div key={product.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 text-left">
                      <div className="w-2 h-2 mt-2 rounded-full bg-orange-500 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{product.name}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Low stock warning: Only <span className="font-bold text-orange-600">{product.stock}</span> remaining.
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    No new notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pl-4 border-l border-white/10 group cursor-pointer hover:bg-white/5 p-1 rounded-2xl transition-all">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform font-bold text-xs">
            {user?.name || user?.username ? (
              (user.name || user.username || '').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
            ) : (
              <User size={18} />
            )}
          </div>
          <div className="hidden md:block">
            <span className="block text-xs font-black text-white leading-none">
              {user?.name || user?.username || 'User'}
            </span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              {user?.role?.replace(/_/g, ' ') || 'Staff'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
