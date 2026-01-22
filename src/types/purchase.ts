export interface Purchase {
    id: string
    productId: string
    productName: string
    quantity: number
    costPrice: number
    supplier?: string
    date: string
}
