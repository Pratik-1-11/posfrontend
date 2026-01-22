export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ne-NP', {
        style: 'currency',
        currency: 'NPR',
        minimumFractionDigits: 2,
    }).format(amount);
};
