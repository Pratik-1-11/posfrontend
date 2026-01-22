import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsApi } from '@/services/api/settingsApi';

interface StoreSettings {
    // Basic Store Information
    name: string;
    address: string;
    phone: string;
    email: string;
    pan: string;
    footerMessage: string;
    taxRate: number;
    currency: string;

    // Receipt Settings
    receipt?: {
        header: string;
        footer: string;
        showTax: boolean;
        showLogo: boolean;
    };

    // Notification Settings
    notifications?: {
        email: boolean;
        sms: boolean;
        lowStock: boolean;
    };

    // Security Settings
    security?: {
        twoFactorAuth: boolean;
        sessionTimeout: number;
        requirePasswordForDelete: boolean;
    };
}

const defaultSettings: StoreSettings = {
    // Basic Store Information
    name: 'My Local Mart',
    address: 'Kathmandu, Nepal',
    phone: '9800000000',
    email: 'store@example.com',
    pan: '000000000',
    footerMessage: 'Thank you for shopping with us!',
    taxRate: 13,
    currency: 'NPR',

    // Receipt Settings
    receipt: {
        header: 'Thank you for your purchase!',
        footer: 'Please come again!',
        showTax: true,
        showLogo: true
    },

    // Notification Settings
    notifications: {
        email: true,
        sms: true,
        lowStock: true
    },

    // Security Settings
    security: {
        twoFactorAuth: false,
        sessionTimeout: 30, // minutes
        requirePasswordForDelete: true
    }
};

interface SettingsContextType {
    settings: StoreSettings;
    updateSettings: (newSettings: StoreSettings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<StoreSettings>(() => {
        const saved = localStorage.getItem('store_settings');
        return saved ? JSON.parse(saved) : defaultSettings;
    });

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await settingsApi.get();
                if (response.status === 'success' && response.data.settings) {
                    const dbSettings = response.data.settings;
                    const mappedSettings: StoreSettings = {
                        name: dbSettings.name,
                        address: dbSettings.address,
                        phone: dbSettings.phone,
                        email: dbSettings.email,
                        pan: dbSettings.pan,
                        footerMessage: dbSettings.footer_message,
                        taxRate: Number(dbSettings.tax_rate),
                        currency: dbSettings.currency,
                        receipt: dbSettings.receipt_settings,
                        notifications: dbSettings.notification_settings,
                        security: dbSettings.security_settings,
                    };
                    setSettings(mappedSettings);
                    localStorage.setItem('store_settings', JSON.stringify(mappedSettings));
                }
            } catch (error) {
                console.error('Failed to fetch settings from server:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const updateSettings = async (newSettings: StoreSettings) => {
        setSettings(newSettings);
        localStorage.setItem('store_settings', JSON.stringify(newSettings));

        try {
            await settingsApi.update({
                name: newSettings.name,
                address: newSettings.address,
                phone: newSettings.phone,
                email: newSettings.email,
                pan: newSettings.pan,
                footerMessage: newSettings.footerMessage,
                taxRate: newSettings.taxRate,
                currency: newSettings.currency,
                receiptSettings: newSettings.receipt,
                notificationSettings: newSettings.notifications,
                securitySettings: newSettings.security,
            });
        } catch (error) {
            console.error('Failed to save settings to server:', error);
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {!isLoading && children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
