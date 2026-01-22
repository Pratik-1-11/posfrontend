import React, { createContext, useContext, useState, useEffect } from 'react';

interface LayoutContextType {
    isMobileSidebarOpen: boolean;
    isSidebarCollapsed: boolean;
    isMobileView: boolean;
    toggleSidebar: () => void;
    toggleSidebarCollapse: () => void;
    closeSidebar: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => {
            const isMobile = window.innerWidth < 1024;
            setIsMobileView(isMobile);
            if (!isMobile) {
                setIsMobileSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = () => {
        setIsMobileSidebarOpen(prev => !prev);
    };

    const toggleSidebarCollapse = () => {
        if (!isMobileView) {
            setIsSidebarCollapsed(prev => !prev);
        }
    };

    const closeSidebar = () => {
        if (isMobileView) {
            setIsMobileSidebarOpen(false);
        }
    };

    return (
        <LayoutContext.Provider
            value={{
                isMobileSidebarOpen,
                isSidebarCollapsed,
                isMobileView,
                toggleSidebar,
                toggleSidebarCollapse,
                closeSidebar,
            }}
        >
            {children}
        </LayoutContext.Provider>
    );
};

export const useLayout = () => {
    const context = useContext(LayoutContext);
    if (context === undefined) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
    return context;
};
