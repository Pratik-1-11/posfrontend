// Mock data
const inventoryItems: any[] = [];

export const inventoryApi = {
    getAll: async () => {
        return inventoryItems;
    },
    updateStock: async (productId: string, quantity: number) => {
        console.log(`Updated stock for ${productId} by ${quantity}`);
        return true;
    },
};
