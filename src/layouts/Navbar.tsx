import React from 'react';
import { Menu, Bell, User } from 'lucide-react';

interface NavbarProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  toggleCollapse?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ toggleSidebar, isSidebarOpen, toggleCollapse }) => {
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
        <button className="relative p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all" aria-label="Notifications">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-slate-900 animate-pulse"></span>
        </button>

        <div className="flex items-center gap-2 pl-4 border-l border-white/10 group cursor-pointer hover:bg-white/5 p-1 rounded-2xl transition-all">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <User size={18} />
          </div>
          <div className="hidden md:block">
            <span className="block text-xs font-black text-white leading-none">Admin</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Manager</span>
          </div>
        </div>
      </div>
    </header>
  );
};
