import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { LayoutProvider, useLayout } from '@/context/LayoutContext';

interface LayoutProps {
  children: React.ReactNode;
}

const LayoutContent: React.FC<LayoutProps> = ({ children }) => {
  const {
    isMobileSidebarOpen,
    isSidebarCollapsed,
    isMobileView,
    toggleSidebar,
    toggleSidebarCollapse,
    closeSidebar
  } = useLayout();

  return (
    <div className="min-h-screen bg-slate-50 font-inter">
      <Navbar
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isMobileView ? isMobileSidebarOpen : !isSidebarCollapsed}
        toggleCollapse={toggleSidebarCollapse}
      />

      {/* Mobile Overlay */}
      {isMobileView && isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 transition-opacity duration-300 no-print"
          onClick={closeSidebar}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Escape' && closeSidebar()}
          aria-label="Close menu"
        />
      )}

      <Sidebar
        isOpen={isMobileView ? isMobileSidebarOpen : true}
        isCollapsed={isSidebarCollapsed}
        onClose={closeSidebar}
        onToggleCollapse={toggleSidebarCollapse}
      />

      <main
        className={`
          pt-16 min-h-screen transition-all duration-300 ease-in-out
          ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}
          w-full
        `}
      >
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <LayoutProvider>
      <LayoutContent>{children}</LayoutContent>
    </LayoutProvider>
  );
};
