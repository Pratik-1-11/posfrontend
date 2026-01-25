import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { FiPrinter, FiX } from 'react-icons/fi';
import type { Product } from '@/types/product';
import { generateBarcodeDataURL, type BarcodeFormat } from '@/utils/barcodeGenerator';

interface BarcodeLabelDesignerProps {
    isOpen: boolean;
    onClose: () => void;
    products: Product[];
}

type LabelSize = '40x30' | '50x25' | '60x40' | 'custom';
type LabelTemplate = 'minimal' | 'standard' | 'detailed';

interface LabelSettings {
    size: LabelSize;
    template: LabelTemplate;
    format: BarcodeFormat;
    showName: boolean;
    showPrice: boolean;
    showCategory: boolean;
    showSKU: boolean;
    fontSize: number;
    columns: number;
}

export const BarcodeLabelDesigner: React.FC<BarcodeLabelDesignerProps> = ({
    isOpen,
    onClose,
    products,
}) => {
    const [settings, setSettings] = useState<LabelSettings>({
        size: '50x25',
        template: 'standard',
        format: 'CODE128',
        showName: true,
        showPrice: true,
        showCategory: false,
        showSKU: false,
        fontSize: 10,
        columns: 3,
    });

    const [quantities, setQuantities] = useState<Record<string, number>>({});

    useEffect(() => {
        if (isOpen) {
            // Initialize quantities to 1 for each product
            const initialQuantities: Record<string, number> = {};
            products.forEach(p => {
                initialQuantities[p.id] = 1;
            });
            setQuantities(initialQuantities);
        }
    }, [isOpen, products]);

    const updateSetting = <K extends keyof LabelSettings>(key: K, value: LabelSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const updateQuantity = (productId: string, quantity: number) => {
        setQuantities(prev => ({ ...prev, [productId]: Math.max(1, quantity) }));
    };

    const getLabelDimensions = () => {
        switch (settings.size) {
            case '40x30': return { width: 151, height: 113 }; // 40mm x 30mm in pixels at 96 DPI
            case '50x25': return { width: 189, height: 94 };  // 50mm x 25mm
            case '60x40': return { width: 226, height: 151 }; // 60mm x 40mm
            default: return { width: 189, height: 94 };
        }
    };

    const generateLabelHTML = (product: Product): string => {
        const barcodeDataURL = product.barcode
            ? generateBarcodeDataURL(product.barcode, { format: settings.format, height: 40 })
            : null;

        const { width, height } = getLabelDimensions();

        let content = '';

        if (settings.template === 'minimal') {
            content = barcodeDataURL
                ? `<img src="${barcodeDataURL}" style="max-width: 90%; height: auto; margin: auto;" />`
                : '<p style="color: red; font-size: 10px;">NO BARCODE</p>';
        } else if (settings.template === 'standard') {
            content = `
        ${settings.showName ? `<p style="font-size: ${settings.fontSize}px; font-weight: bold; margin: 2px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${product.name}</p>` : ''}
        ${barcodeDataURL ? `<img src="${barcodeDataURL}" style="max-width: 90%; height: auto; margin: 4px auto;" />` : '<p style="color: red; font-size: 8px;">NO BARCODE</p>'}
        ${settings.showPrice ? `<p style="font-size: ${settings.fontSize}px; font-weight: bold; margin: 2px 0;">Rs. ${product.price.toFixed(2)}</p>` : ''}
      `;
        } else { // detailed
            content = `
        ${settings.showCategory ? `<p style="font-size: ${settings.fontSize - 2}px; color: #666; margin: 1px 0; text-transform: uppercase;">${product.category}</p>` : ''}
        ${settings.showName ? `<p style="font-size: ${settings.fontSize}px; font-weight: bold; margin: 2px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${product.name}</p>` : ''}
        ${barcodeDataURL ? `<img src="${barcodeDataURL}" style="max-width: 90%; height: auto; margin: 4px auto;" />` : '<p style="color: red; font-size: 8px;">NO BARCODE</p>'}
        <div style="display: flex; justify-content: space-between; font-size: ${settings.fontSize - 1}px; margin-top: 2px;">
          ${settings.showPrice ? `<span style="font-weight: bold;">Rs. ${product.price.toFixed(2)}</span>` : ''}
          ${settings.showSKU && product.barcode ? `<span style="color: #666; font-size: ${settings.fontSize - 2}px;">${product.barcode}</span>` : ''}
        </div>
      `;
        }

        return `
      <div style="
        width: ${width}px;
        height: ${height}px;
        border: 1px dashed #ccc;
        padding: 8px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        page-break-inside: avoid;
        font-family: Arial, sans-serif;
      ">
        ${content}
      </div>
    `;
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        let allLabels = '';
        products.forEach(product => {
            const quantity = quantities[product.id] || 1;
            for (let i = 0; i < quantity; i++) {
                allLabels += generateLabelHTML(product);
            }
        });

        const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Barcode Labels</title>
        <style>
          @page {
            size: auto;
            margin: 10mm;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .labels-container {
            display: grid;
            grid-template-columns: repeat(${settings.columns}, 1fr);
            gap: 10px;
            padding: 10px;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="labels-container">
          ${allLabels}
        </div>
      </body>
      </html>
    `;

        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();

        setTimeout(() => {
            printWindow.print();
        }, 250);
    };

    const productsWithoutBarcodes = products.filter(p => !p.barcode);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                        Barcode Label Designer
                    </DialogTitle>
                </DialogHeader>

                {productsWithoutBarcodes.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                        <p className="text-sm font-bold text-amber-800">
                            ⚠️ {productsWithoutBarcodes.length} product(s) without barcode will show "NO BARCODE"
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                            Generate barcodes for these products in the inventory screen first.
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Settings Panel */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="space-y-4 bg-slate-50 p-4 rounded-2xl">
                            <h3 className="font-black text-sm uppercase tracking-widest text-slate-600">Label Settings</h3>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold">Label Size</Label>
                                <Select value={settings.size} onValueChange={(v) => updateSetting('size', v as LabelSize)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="40x30">40mm × 30mm</SelectItem>
                                        <SelectItem value="50x25">50mm × 25mm (Recommended)</SelectItem>
                                        <SelectItem value="60x40">60mm × 40mm</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold">Template</Label>
                                <Select value={settings.template} onValueChange={(v) => updateSetting('template', v as LabelTemplate)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="minimal">Minimal (Barcode Only)</SelectItem>
                                        <SelectItem value="standard">Standard</SelectItem>
                                        <SelectItem value="detailed">Detailed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold">Barcode Format</Label>
                                <Select value={settings.format} onValueChange={(v) => updateSetting('format', v as BarcodeFormat)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CODE128">CODE128 (Recommended)</SelectItem>
                                        <SelectItem value="EAN13">EAN-13</SelectItem>
                                        <SelectItem value="EAN8">EAN-8</SelectItem>
                                        <SelectItem value="UPC">UPC</SelectItem>
                                        <SelectItem value="CODE39">CODE39</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold">Print Columns</Label>
                                <Select value={settings.columns.toString()} onValueChange={(v) => updateSetting('columns', parseInt(v))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 Column</SelectItem>
                                        <SelectItem value="2">2 Columns</SelectItem>
                                        <SelectItem value="3">3 Columns</SelectItem>
                                        <SelectItem value="4">4 Columns</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {settings.template !== 'minimal' && (
                                <>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold">Font Size: {settings.fontSize}px</Label>
                                        <Input
                                            type="range"
                                            min="8"
                                            max="16"
                                            value={settings.fontSize}
                                            onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold">Display Options</Label>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="showName"
                                                    checked={settings.showName}
                                                    onChange={(e) => updateSetting('showName', e.target.checked)}
                                                    className="h-4 w-4 rounded border-gray-300"
                                                />
                                                <Label htmlFor="showName" className="text-sm cursor-pointer">Show Name</Label>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    id="showPrice"
                                                    checked={settings.showPrice}
                                                    onChange={(e) => updateSetting('showPrice', e.target.checked)}
                                                    className="h-4 w-4 rounded border-gray-300"
                                                />
                                                <Label htmlFor="showPrice" className="text-sm cursor-pointer">Show Price</Label>
                                            </div>
                                            {settings.template === 'detailed' && (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            id="showCategory"
                                                            checked={settings.showCategory}
                                                            onChange={(e) => updateSetting('showCategory', e.target.checked)}
                                                            className="h-4 w-4 rounded border-gray-300"
                                                        />
                                                        <Label htmlFor="showCategory" className="text-sm cursor-pointer">Show Category</Label>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            id="showSKU"
                                                            checked={settings.showSKU}
                                                            onChange={(e) => updateSetting('showSKU', e.target.checked)}
                                                            className="h-4 w-4 rounded border-gray-300"
                                                        />
                                                        <Label htmlFor="showSKU" className="text-sm cursor-pointer">Show SKU</Label>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Product List with Quantities */}
                        <div className="space-y-3 bg-white p-4 rounded-2xl border">
                            <h3 className="font-black text-sm uppercase tracking-widest text-slate-600">Products ({products.length})</h3>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {products.map(product => (
                                    <div key={product.id} className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded-lg">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold truncate">{product.name}</p>
                                            <p className="text-xs text-slate-500">{product.barcode || 'No barcode'}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Label className="text-xs">Qty:</Label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={quantities[product.id] || 1}
                                                onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 1)}
                                                className="w-16 h-8 text-center"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Preview Panel */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-slate-50 p-4 rounded-2xl">
                            <h3 className="font-black text-sm uppercase tracking-widest text-slate-600 mb-4">Preview</h3>
                            <div
                                className="bg-white p-6 rounded-xl border-2 border-dashed border-slate-200 overflow-auto"
                                style={{ maxHeight: '600px' }}
                            >
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: `repeat(${settings.columns}, 1fr)`,
                                        gap: '10px'
                                    }}
                                >
                                    {products.slice(0, 6).map(product => {
                                        const quantity = quantities[product.id] || 1;
                                        return Array.from({ length: Math.min(quantity, 3) }).map((_, idx) => (
                                            <div key={`${product.id}-${idx}`} dangerouslySetInnerHTML={{ __html: generateLabelHTML(product) }} />
                                        ));
                                    })}
                                </div>
                                {products.length > 6 && (
                                    <p className="text-center text-sm text-slate-500 mt-4">
                                        + {products.reduce((sum, p) => sum + (quantities[p.id] || 1), 0) - 6} more labels...
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose} className="gap-2">
                        <FiX /> Cancel
                    </Button>
                    <Button onClick={handlePrint} className="gap-2 font-black uppercase tracking-widest">
                        <FiPrinter /> Print Labels
                    </Button>
                </DialogFooter>
            </DialogContent >
        </Dialog >
    );
};
