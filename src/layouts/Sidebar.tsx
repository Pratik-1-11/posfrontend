import React, { useState } from 'react';
import {
  ShoppingCart,
  Package,
  Settings,
  LogOut,
  LayoutDashboard,
  PackagePlus,
  BarChart2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Users,
  Building2,
  Terminal,
  Clock,
  RefreshCw,
  FileSpreadsheet,
  ChevronDown,
  Check,
  ShieldCheck,
  CreditCard,
  History
} from 'lucide-react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAdminTenants } from '@/hooks/admin/useAdminTenants';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed?: boolean;
  onClose?: () => void;
  onToggleCollapse?: () => void;
}

interface NavItem {
  to: string;
  icon: any;
  label: string;
  roles: string[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'System',
    items: [
      { to: '/admin/tenants', icon: Building2, label: 'Tenants', roles: ['SUPER_ADMIN'] },
      { to: '/admin/upgrade-requests', icon: ShieldCheck, label: 'Upgrades', roles: ['SUPER_ADMIN'] },
      { to: '/admin/subscriptions', icon: CreditCard, label: 'Plans', roles: ['SUPER_ADMIN'] },
      { to: '/admin/console', icon: Terminal, label: 'Console', roles: ['SUPER_ADMIN'] },
    ]
  },
  {
    title: 'Overview',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['VENDOR_ADMIN', 'VENDOR_MANAGER', 'INVENTORY_MANAGER'] },
    ]
  },
  {
    title: 'Operations',
    items: [
      { to: '/pos', icon: ShoppingCart, label: 'POS Terminal', roles: ['VENDOR_ADMIN', 'VENDOR_MANAGER', 'CASHIER', 'WAITER'] },
      { to: '/sales', icon: History, label: 'Sales History', roles: ['VENDOR_ADMIN', 'VENDOR_MANAGER', 'CASHIER'] },
      { to: '/products', icon: Package, label: 'Inventory', roles: ['VENDOR_ADMIN', 'VENDOR_MANAGER', 'INVENTORY_MANAGER', 'CASHIER'] },
      { to: '/purchases', icon: PackagePlus, label: 'Stock In', roles: ['VENDOR_ADMIN', 'VENDOR_MANAGER', 'INVENTORY_MANAGER'] },
      { to: '/returns', icon: RefreshCw, label: 'Returns', roles: ['VENDOR_ADMIN', 'VENDOR_MANAGER', 'CASHIER'] },
      { to: '/expenses', icon: DollarSign, label: 'Expenses', roles: ['VENDOR_ADMIN', 'VENDOR_MANAGER'] },
    ]
  },
  {
    title: 'Relationships',
    items: [
      { to: '/customers', icon: Users, label: 'Customers', roles: ['VENDOR_ADMIN', 'VENDOR_MANAGER', 'CASHIER', 'WAITER'] },
      { to: '/customers/recovery', icon: Clock, label: 'Recoveries', roles: ['VENDOR_ADMIN', 'VENDOR_MANAGER'] },
      { to: '/employees', icon: Users, label: 'Staff Management', roles: ['VENDOR_ADMIN'] },
    ]
  },
  {
    title: 'Analytics',
    items: [
      { to: '/reports', icon: BarChart2, label: 'Sales Reports', roles: ['VENDOR_ADMIN', 'VENDOR_MANAGER'] },
      { to: '/reports/vat', icon: FileSpreadsheet, label: 'VAT Book', roles: ['VENDOR_ADMIN', 'VENDOR_MANAGER'] },
    ]
  },
  {
    title: 'Settings',
    items: [
      { to: '/stores', icon: Building2, label: 'Branch Profiles', roles: ['VENDOR_ADMIN'] },
      { to: '/settings', icon: Settings, label: 'General Settings', roles: ['VENDOR_ADMIN'] },
    ]
  }
];

const TenantSwitcher: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { tenants } = useAdminTenants();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const currentTenant = tenants.find(t => t.id === id);

  return (
    <div className="px-3 mb-2 mt-2">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all border border-slate-700 group"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-black text-sm border ${currentTenant ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' : 'bg-slate-700 text-slate-400 border-slate-600'}`}>
              {currentTenant?.name.charAt(0) || '-'}
            </div>
            <div className="text-left truncate">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {currentTenant ? 'Managing Node' : 'Select Node'}
              </div>
              <div className={`text-sm font-black truncate max-w-[120px] ${currentTenant ? 'text-white' : 'text-slate-500'}`}>
                {currentTenant?.name || 'Context'}
              </div>
            </div>
          </div>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full left-0 w-full mt-2 bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto custom-scrollbar">
              <div className="p-2 space-y-1">
                {tenants.map(tenant => (
                  <button
                    key={tenant.id}
                    onClick={() => {
                      navigate(`/admin/tenants/${tenant.id}/overview`);
                      setIsOpen(false);
                      if (onClose && window.innerWidth < 1024) onClose();
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-sm font-medium transition-all ${tenant.id === id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                      }`}
                  >
                    <span className="truncate">{tenant.name}</span>
                    {tenant.id === id && <Check className="h-3 w-3" />}
                  </button>
                ))}
                <div className="h-px bg-slate-700 my-1" />
                <button
                  onClick={() => {
                    navigate('/admin/tenants');
                    setIsOpen(false);
                    if (onClose && window.innerWidth < 1024) onClose();
                  }}
                  className="w-full text-left p-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white hover:bg-slate-700 transition-all"
                >
                  View All Nodes
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, isCollapsed = false, onClose, onToggleCollapse }) => {
  const { user, logout } = useAuth();

  const handleNavClick = () => {
    if (onClose && window.innerWidth < 1024) {
      onClose();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const renderNavSection = (section: NavSection) => {
    const userRole = user?.role;
    const filteredItems = section.items.filter(item =>
      item.roles.includes(userRole as string)
    );

    if (filteredItems.length === 0) return null;

    return (
      <div key={section.title} className="mb-6 last:mb-0">
        {!isCollapsed && (
          <h3 className="px-4 mb-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
            {section.title}
          </h3>
        )}
        <div className="space-y-1">
          {filteredItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                ${isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/25'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'}
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon
                size={isCollapsed ? 20 : 18}
                className={`transition-transform duration-200 ${isCollapsed ? '' : 'group-hover:scale-110'}`}
              />
              {!isCollapsed && (
                <span className="text-xs font-black tracking-tight uppercase tracking-wider">{item.label}</span>
              )}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[100] shadow-xl">
                  {item.label}
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    );
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 bg-slate-900 border-r border-white/5 transition-all duration-300 ease-in-out font-inter no-print
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        w-64 mt-16 lg:mt-16
      `}
    >
      <div className="flex flex-col h-full">
        {/* Header - Sticky inside sidebar */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-slate-900/50 backdrop-blur-sm">
          {!isCollapsed && (
            <div className="flex items-center gap-2 px-2">
              <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Operational Unit</span>
            </div>
          )}
          {isCollapsed && (
            <div className="mx-auto">
              <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              </div>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all ml-auto"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Tenant Switcher (Super Admin Context) */}
        {!isCollapsed && user?.role === 'SUPER_ADMIN' && (
          <TenantSwitcher onClose={onClose} />
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 custom-scrollbar scrollbar-hide">
          {navSections.map(renderNavSection)}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-slate-900/50">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all group
              ${isCollapsed ? 'justify-center' : ''}
            `}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
            {!isCollapsed && (
              <span className="text-xs font-black tracking-tight uppercase tracking-wider">Sign Out</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
