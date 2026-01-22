import NepaliDate from 'nepali-date-converter';

export const formatToNepaliDate = (date: Date): string => {
    try {
        const bsDate = new NepaliDate(date);
        return bsDate.format('YYYY-MM-DD');
    } catch (e) {
        console.error('Error converting date:', e);
        return date.toISOString().split('T')[0]; // Fallback
    }
};
