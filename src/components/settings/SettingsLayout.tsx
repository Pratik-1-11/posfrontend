import React from 'react';
import './SettingsLayout.css';

interface SettingsLayoutProps {
    children: React.ReactNode;
    title: string;
    description?: string;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children, title, description }) => {
    return (
        <div className="settings-layout">
            <div className="settings-header">
                <h1 className="settings-title">{title}</h1>
                {description && <p className="settings-description">{description}</p>}
            </div>
            <div className="settings-container">
                <aside className="settings-sidebar">
                    <nav className="settings-nav">
                        <a href="/settings/profile" className="settings-nav-item active">Profile</a>
                        <a href="/settings/account" className="settings-nav-item">Account</a>
                        <a href="/settings/appearance" className="settings-nav-item">Appearance</a>
                        <a href="/settings/notifications" className="settings-nav-item">Notifications</a>
                    </nav>
                </aside>
                <main className="settings-content">
                    {children}
                </main>
            </div>
        </div>
    );
};
