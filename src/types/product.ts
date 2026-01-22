export interface Product {
    id: string
    name: string
    barcode?: string
    price: number
    costPrice: number
    stock: number
    category: string
    image?: string | File
    minStockLevel?: number
}
