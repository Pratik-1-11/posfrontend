import React from 'react';
import './BillingLayout.css';

interface BillingLayoutProps {
    children: React.ReactNode;
    cart: React.ReactNode;
}

export const BillingLayout: React.FC<BillingLayoutProps> = ({ children, cart }) => {
    return (
        <div className="billing-layout">
            <div className="billing-main">
                {children}
            </div>
            <aside className="billing-sidebar">
                {cart}
            </aside>
        </div>
    );
};
