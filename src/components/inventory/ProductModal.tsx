import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { FiUpload, FiX, FiLoader, FiRefreshCw } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';
import { generateRandomBarcode } from '@/utils/barcodeGenerator';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product?: Product | null; // If null, we are adding a new product
    onSave: (product: Omit<Product, 'id'> | Product) => Promise<void>;
    categories: string[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
    isOpen,
    onClose,
    product,
    onSave,
    categories
}) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Omit<Product, 'id'>>({
        name: '',
        barcode: '',
        stock: 0,
        costPrice: 0,
        price: 0,
        category: '',
        image: ''
    });
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                barcode: product.barcode || '',
                stock: product.stock,
                costPrice: product.costPrice,
                price: product.price,
                category: product.category,
                image: product.image
            });
            if (typeof product.image === 'string' && product.image) {
                setPreviewImage(product.image);
            } else {
                setPreviewImage(null);
            }
        } else {
            // Reset for add mode
            setFormData({
                name: '',
                barcode: '',
                stock: 0,
                costPrice: 0,
                price: 0,
                category: '',
                image: ''
            });
            setPreviewImage(null);
        }
    }, [product, isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'stock' || name === 'costPrice' || name === 'price'
                ? parseFloat(value) || 0
                : value
        }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({ ...prev, category: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setPreviewImage(null);
        setFormData(prev => ({ ...prev, image: '' }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.stock || !formData.price || !formData.category) {
            // Basic html 5 required attributes handle this, but double check
            return;
        }

        try {
            setLoading(true);
            if (product) {
                // Edit mode
                await onSave({ ...formData, id: product.id } as Product);
            } else {
                // Add mode
                await onSave(formData);
            }
            onClose();
        } catch (error) {
            console.error("Failed to save product", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 sm:max-w-3xl">
                <DialogHeader className="p-6 border-b bg-muted/10">
                    <DialogTitle className="text-2xl font-bold text-primary">
                        {product ? 'Edit Product' : 'Add New Product'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-8">
                        {/* Image Upload Section */}
                        <div className="space-y-4">
                            <Label className="text-base font-semibold">Product Image</Label>
                            <div
                                className={cn(
                                    "group border-2 border-dashed rounded-xl p-8 transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-4 bg-muted/5 hover:bg-muted/10 hover:border-primary/50 relative overflow-hidden",
                                    previewImage && "border-solid border-primary/20 bg-primary/5"
                                )}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {previewImage ? (
                                    <div className="relative w-40 h-40 group-hover:scale-105 transition-transform duration-300">
                                        <img src={previewImage} alt="Preview" className="w-full h-full object-cover rounded-lg shadow-md" />
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                            className="absolute -top-2 -right-2 h-8 w-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-10"
                                        >
                                            <FiX size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                                            <FiUpload size={32} />
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="font-semibold text-gray-900">Click to upload or drag and drop</p>
                                            <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                                        </div>
                                    </>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* Form Fields Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="font-semibold">Product Name <span className="text-red-500">*</span></Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Wireless Mouse" required className="focus-visible:ring-primary" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="barcode" className="font-semibold">Barcode</Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setFormData(prev => ({ ...prev, barcode: generateRandomBarcode() }))}
                                        className="h-7 px-2 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                                    >
                                        <FiRefreshCw className="h-3 w-3" />
                                        Generate
                                    </Button>
                                </div>
                                <Input id="barcode" name="barcode" value={formData.barcode} onChange={handleInputChange} placeholder="Scan, type, or auto-generate" className="font-mono text-sm" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category" className="font-semibold">Category <span className="text-red-500">*</span></Label>
                                <Select value={formData.category} onValueChange={handleSelectChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category} value={category}>{category}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="stock" className="font-semibold">Stock Quantity <span className="text-red-500">*</span></Label>
                                <Input id="stock" name="stock" type="number" min="0" value={formData.stock} onChange={handleInputChange} required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="costPrice" className="font-semibold">Cost Price (NPR)</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">Rs.</span>
                                    <Input id="costPrice" name="costPrice" type="number" min="0" step="0.01" value={formData.costPrice} onChange={handleInputChange} className="pl-10" />
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="price" className="font-semibold">Selling Price (NPR) <span className="text-red-500">*</span></Label>
                                    {formData.costPrice > 0 && formData.price > 0 && (
                                        <span className={cn("text-xs font-semibold px-2 py-0.5 rounded", (formData.price - formData.costPrice) > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                                            Margin: {(((formData.price - formData.costPrice) / formData.price) * 100).toFixed(1)}%
                                        </span>
                                    )}
                                </div>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">Rs.</span>
                                    <Input id="price" name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleInputChange} className="pl-10 text-lg font-bold text-primary" required />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="p-6 border-t bg-muted/10 gap-3">
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
                        <Button type="submit" className="min-w-[120px] shadow-lg shadow-primary/20" disabled={loading}>
                            {loading ? <><FiLoader className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : (product ? 'Update Product' : 'Create Product')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
