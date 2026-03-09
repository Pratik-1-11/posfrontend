import type { CartItem } from '@/types/sales';

/**
 * Calculate subtotal from cart items.
 */
export function calculateSubtotal(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/**
 * Calculate tax amount.
 * @param subtotal - Subtotal after discount (if applicable).
 * @param taxRate - Tax rate as decimal (e.g., 0.13 for 13%).
 * @param mode - 'exclusive' adds tax on top, 'inclusive' extracts tax from subtotal.
 */
export function calculateTax(
    subtotal: number,
    taxRate: number = 0,
    mode: 'exclusive' | 'inclusive' = 'exclusive'
): number {
    if (taxRate === 0) return 0;
    if (mode === 'exclusive') {
        // Tax is added on top of subtotal
        return Math.round(subtotal * taxRate * 100) / 100; // round to 2 decimals
    }
    // inclusive: tax already included in subtotal; extract it
    const taxable = subtotal / (1 + taxRate);
    const tax = subtotal - taxable;
    return Math.round(tax * 100) / 100;
}

/**
 * Calculate grand total.
 */
export function calculateTotal(
    subtotal: number,
    tax: number,
    discount: number = 0
): number {
    // Apply discount first, then add tax (exclusive) or keep subtotal (inclusive)
    return Math.round((subtotal - discount + tax) * 100) / 100;
}

/**
 * Calculate all order totals at once.
 * Nepal-compliant: discount applied before VAT calculation.
 * B2B (exclusive): Subtotal → Discount → Taxable Amount → +VAT → Grand Total
 * B2C (inclusive): Prices already include VAT; VAT is extracted from the discounted total.
 */
export function calculateOrderTotals(
    items: CartItem[],
    taxRate: number = 0.13,
    discount: number = 0,
    vatMode: 'exclusive' | 'inclusive' = 'exclusive'
) {
    const rawSubtotal = calculateSubtotal(items);
    // Clamp discount: never exceed subtotal, never go negative
    const safeDiscount = Math.max(0, Math.min(discount, rawSubtotal));
    const subtotalAfterDiscount = Math.max(0, rawSubtotal - safeDiscount);
    const tax = calculateTax(subtotalAfterDiscount, taxRate, vatMode);
    const total =
        vatMode === 'exclusive'
            ? subtotalAfterDiscount + tax
            : subtotalAfterDiscount; // inclusive already includes tax
    return {
        subtotal: rawSubtotal,
        discount: safeDiscount,
        tax: isNaN(tax) ? 0 : tax,
        total: isNaN(total) ? 0 : Math.round(total * 100) / 100,
    };
}

/**
 * Calculate total item count in cart.
 */
export function calculateItemCount(items: CartItem[]): number {
    return items.reduce((sum, item) => sum + item.quantity, 0);
}
