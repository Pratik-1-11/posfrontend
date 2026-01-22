import React from 'react';
import { CartItem } from './CartItem';


interface CartListProps {
    items: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
    }>;
    onUpdateQuantity: (id: string, quantity: number) => void;
    onRemove: (id: string) => void;
}

export const CartList: React.FC<CartListProps> = ({ items, onUpdateQuantity, onRemove }) => {
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                <p>Cart is empty</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto">
                {items.map((item) => (
                    <CartItem
                        key={item.id}
                        item={item}
                        onUpdateQuantity={onUpdateQuantity}
                        onRemove={onRemove}
                    />
                ))}
            </div>
        </div>
    );
};
