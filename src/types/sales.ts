import type { Product } from "./product"

export interface CartItem extends Product {
    quantity: number;
    originalPrice?: number;
    overrideReason?: string;
    authorizedBy?: string; // Manager ID
}

export interface Sale {
    id: string
    items: CartItem[]
    subtotal: number
    discount: number
    vat: number
    total: number
    paymentMethod: "cash" | "card" | "qr"
    date: string
    cashierId: string
}
