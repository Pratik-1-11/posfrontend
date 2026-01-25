import JsBarcode from 'jsbarcode';

export type BarcodeFormat = 'CODE128' | 'EAN13' | 'EAN8' | 'UPC' | 'CODE39';

export interface BarcodeOptions {
    format?: BarcodeFormat;
    width?: number;
    height?: number;
    displayValue?: boolean;
    fontSize?: number;
    margin?: number;
}

/**
 * Generate a barcode as a base64 data URL
 * @param value - The barcode value to encode
 * @param options - Barcode generation options
 * @returns Base64 data URL or null if generation fails
 */
export const generateBarcodeDataURL = (
    value: string,
    options: BarcodeOptions = {}
): string | null => {
    if (!value) return null;

    try {
        const canvas = document.createElement('canvas');

        JsBarcode(canvas, value, {
            format: options.format || 'CODE128',
            width: options.width || 2,
            height: options.height || 50,
            displayValue: options.displayValue !== false,
            fontSize: options.fontSize || 12,
            margin: options.margin || 10,
        });

        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('Barcode generation failed:', error);
        return null;
    }
};

/**
 * Generate a random barcode value
 * @param format - Barcode format (determines length)
 * @returns Random barcode string
 */
export const generateRandomBarcode = (format: BarcodeFormat = 'CODE128'): string => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    switch (format) {
        case 'EAN13':
            // EAN-13 is 13 digits
            return (timestamp.slice(-12) + random.slice(-1)).padStart(13, '0').slice(0, 13);
        case 'EAN8':
            // EAN-8 is 8 digits
            return (timestamp.slice(-7) + random.slice(-1)).padStart(8, '0').slice(0, 8);
        case 'UPC':
            // UPC-A is 12 digits
            return (timestamp.slice(-11) + random.slice(-1)).padStart(12, '0').slice(0, 12);
        case 'CODE39':
        case 'CODE128':
        default:
            // CODE128 and CODE39 support alphanumeric
            return `P${timestamp.slice(-8)}${random}`;
    }
};

/**
 * Validate if a barcode value is compatible with a format
 * @param value - Barcode value
 * @param format - Barcode format
 * @returns True if valid, error message if invalid
 */
export const validateBarcode = (
    value: string,
    format: BarcodeFormat
): { valid: boolean; error?: string } => {
    if (!value) {
        return { valid: false, error: 'Barcode value is required' };
    }

    switch (format) {
        case 'EAN13':
            if (!/^\d{13}$/.test(value)) {
                return { valid: false, error: 'EAN-13 must be exactly 13 digits' };
            }
            break;
        case 'EAN8':
            if (!/^\d{8}$/.test(value)) {
                return { valid: false, error: 'EAN-8 must be exactly 8 digits' };
            }
            break;
        case 'UPC':
            if (!/^\d{12}$/.test(value)) {
                return { valid: false, error: 'UPC must be exactly 12 digits' };
            }
            break;
        case 'CODE39':
            if (!/^[A-Z0-9\-. $/+%]+$/.test(value)) {
                return { valid: false, error: 'CODE39 supports uppercase letters, numbers, and special characters (-.$/+%)' };
            }
            break;
        case 'CODE128':
            // CODE128 supports all ASCII characters
            if (value.length > 80) {
                return { valid: false, error: 'CODE128 barcode too long (max 80 characters)' };
            }
            break;
    }

    return { valid: true };
};
