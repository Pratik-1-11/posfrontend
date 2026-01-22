import { useProductContext } from "@/context/ProductContext"

export const useProducts = () => {
    const { products, loading, refresh } = useProductContext()
    return { products, loading, refresh }
}
