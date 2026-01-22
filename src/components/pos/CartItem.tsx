import React from 'react';
import { Button } from '@/components/ui/Button';
import { Minus, Plus, Trash2 } from 'lucide-react';

import { formatCurrency } from '@/utils/currency'; // Assuming this exists or I'll create it

interface CartItemProps {
    item: {
        id: string;
        name: string;
        price: number;
        quantity: number;
    };
    onUpdateQuantity: (id: string, quantity: number) => void;
    onRemove: (id: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
    return (
        <div className="flex items-center justify-between p-4 border-b">
            <div className="flex-1">
                <h4 className="font-medium">{item.name}</h4>
                <p className="text-sm text-muted-foreground">{formatCurrency(item.price)}</p>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                >
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center">{item.quantity}</span>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                >
                    <Plus className="h-4 w-4" />
                </Button>
                <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8 ml-2"
                    onClick={() => onRemove(item.id)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
