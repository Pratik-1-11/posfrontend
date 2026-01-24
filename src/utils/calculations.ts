import type { CartItem } from '@/types/sales';

/**
 * Calculate subtotal from cart items
 */
export function calculateSubtotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

/**
 * Calculate tax amount
 * @param subtotal - Subtotal amount
 * @param taxRate - Tax rate as decimal (e.g., 0.13 for 13%)
 */
export function calculateTax(subtotal: number, taxRate: number = 0): number {
    return subtotal * taxRate;
}

/**
 * Calculate grand total
 */
export function calculateTotal(subtotal: number, tax: number, discount: number = 0): number {
    return subtotal + tax - discount;
}

/**
 * Calculate all order totals at once
 */
export function calculateOrderTotals(items: CartItem[], taxRate: number = 0, discount: number = 0) {
    const subtotal = calculateSubtotal(items);
    const tax = calculateTax(subtotal, taxRate);
    const total = calculateTotal(subtotal, tax, discount);

    return {
        subtotal,
        tax,
        discount,
        total
    };
}

/**
 * Calculate total item count in cart
 */
export function calculateItemCount(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity, 0);
}
