import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Card, CardContent } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { FiPlus, FiSearch, FiFilter, FiGrid, FiList, FiEdit2, FiTrash2, FiChevronDown, FiChevronUp, FiRefreshCw } from 'react-icons/fi';

import type { Product } from '@/types/product';
import { useProductContext } from '@/context/ProductContext';
import { productApi } from '@/services/api/productApi';
import { ProductModal } from '@/components/inventory/ProductModal';
import { StockAdjustmentModal } from '@/components/inventory/StockAdjustmentModal';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type ProductStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

import { Skeleton } from '@/components/ui/Skeleton';

const InventorySkeleton = () => (
  <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-screen">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-10 w-32 rounded-lg" />
    </div>

    <Skeleton className="h-24 rounded-3xl w-full" />

    <div className="bg-white rounded-3xl p-6 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-4 items-center border-b pb-4">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-3 w-1/6" />
          </div>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  </div>
);

export const InventoryScreen: React.FC = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'manager' || user?.role === 'inventory_manager' || user?.role === 'VENDOR_ADMIN' || user?.role === 'vendor_admin';
  const { products, addProduct, updateProduct, deleteProduct, refreshProducts, loading } = useProductContext();
  const { toast } = useToast();

  if (loading) return <InventorySkeleton />;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [productCategories, setProductCategories] = useState<string[]>([
    'Beverages',
    'Snacks & Biscuits',
    'Dairy & Eggs',
    'Bakery & Bread',
    'Fruits & Vegetables',
    'Meat & Poultry',
    'Seafood',
    'Frozen Foods',
    'Canned & Jarred Goods',
    'Grains & Staples (Rice/Dal)',
    'Oil & Ghee',
    'Breakfast & Cereal',
    'Spices & Masalas',
    'Salt, Sugar & Baking',
    'Sweets & Chocolates',
    'Baby Care',
    'Personal Care & Beauty',
    'Health & Pharmacy',
    'Household & Cleaning',
    'Pet Care',
    'Electronics & Accessories',
    'Stationery & Office',
    'Tobacco & Lighter',
    'Liquor & Alcohol',
    'Home & Kitchen',
    'Clothing & Accessories',
    'Other'
  ]);

  React.useEffect(() => {
    productApi.getCategories().then((cats: string[]) => {
      if (cats.length > 0) setProductCategories(cats);
    }).catch(console.error);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(products.map(p => p.category))];

  const handleDeleteProduct = async (productId: string) => {
    if (!canManage) return;
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(productId);
    }
  };

  const handleSaveProduct = async (productData: Omit<Product, 'id'> | Product) => {
    if (!canManage) return;
    try {
      if ('id' in productData && (productData as Product).id) {
        await updateProduct((productData as Product).id, productData);
      } else {
        await addProduct(productData);
      }
      setIsAddModalOpen(false);
      setEditingProduct(null);
    } catch (error: any) {
      console.error("Failed to save product", error);

      // Show specific error message for barcode conflicts
      const errorMessage = error?.message || "Failed to save product";
      const isBarcodeConflict = errorMessage.includes('barcode');

      toast({
        title: isBarcodeConflict ? "Duplicate Barcode" : "Error",
        description: isBarcodeConflict
          ? `${errorMessage}\n\nTip: Leave the barcode field empty if you don't use barcodes, or change it to a unique value.`
          : errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleAdjustClick = (product: Product) => {
    if (!canManage) return;
    setAdjustingProduct(product);
    setIsAdjustModalOpen(true);
  };

  const handleEditClick = (product: Product) => {
    if (!canManage) return;
    setEditingProduct(product);
    setIsAddModalOpen(true);
  };

  const handleAddClick = () => {
    if (!canManage) return;
    setEditingProduct(null);
    setIsAddModalOpen(true);
  };


  const StatusBadge = ({ status }: { status: ProductStatus }) => {
    const variant = status === 'in_stock' ? 'success' : status === 'low_stock' ? 'warning' : 'destructive';
    return (
      <Badge variant={variant} className="capitalize font-black tracking-tight text-[10px]">
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase italic">Inventory</h1>
          <p className="text-slate-500 font-medium">Manage your products and stock levels.</p>
        </div>
        {canManage && (
          <Button onClick={handleAddClick} className="gap-2 shadow-xl shadow-primary/20 font-black uppercase tracking-widest px-8">
            <FiPlus className="h-5 w-5" /> Add Product
          </Button>
        )}
      </div>

      <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-md rounded-3xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative flex-1 max-w-md w-full">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
              <Input
                placeholder="Search products, barcodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-slate-50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-primary shadow-inner"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center border rounded-2xl p-1 bg-slate-100 shadow-inner">
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className={viewMode === 'table' ? 'rounded-xl shadow-sm bg-white' : 'rounded-xl'}
                >
                  <FiList className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'rounded-xl shadow-sm bg-white' : 'rounded-xl'}
                >
                  <FiGrid className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="gap-2 h-12 px-6 rounded-2xl border-slate-200 hover:bg-slate-50 font-bold"
              >
                <FiFilter className="h-4 w-4 text-primary" />
                Filters
                {isFilterOpen ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {isFilterOpen && (
            <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
              <div className="max-w-xs space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Filter by Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-11 rounded-xl border-slate-200">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {viewMode === 'table' ? (
        <Card className="overflow-hidden border-none shadow-2xl rounded-3xl bg-white shadow-slate-200">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-slate-100 hover:bg-transparent">
                <TableHead className="font-black text-slate-500 uppercase tracking-widest text-[11px] py-4">Product</TableHead>
                <TableHead className="font-black text-slate-500 uppercase tracking-widest text-[11px] py-4">Barcode</TableHead>
                <TableHead className="font-black text-slate-500 uppercase tracking-widest text-[11px] py-4">In Stock</TableHead>
                {canManage && <TableHead className="font-black text-slate-500 uppercase tracking-widest text-[11px] py-4">Cost</TableHead>}
                <TableHead className="font-black text-slate-500 uppercase tracking-widest text-[11px] py-4 text-right">Selling Price</TableHead>
                <TableHead className="font-black text-slate-500 uppercase tracking-widest text-[11px] py-4 text-center">Status</TableHead>
                {canManage && <TableHead className="font-black text-slate-500 uppercase tracking-widest text-[11px] py-4 text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-4">
                      {product.image ? (
                        <div className="h-12 w-12 rounded-xl border p-0.5 bg-white shadow-sm overflow-hidden">
                          <img src={typeof product.image === 'string' ? product.image : undefined} alt={product.name} className="h-full w-full object-cover rounded-lg" />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
                          <FiPlus size={20} />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{product.name}</span>
                        <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">{product.category}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-slate-500">{product.barcode || '---'}</TableCell>
                  <TableCell>
                    <span className={cn("font-black text-lg", product.stock < 10 ? "text-red-500" : "text-slate-900")}>
                      {product.stock}
                    </span>
                  </TableCell>
                  {canManage && <TableCell className="text-slate-400 font-medium italic">Rs. {product.costPrice.toFixed(0)}</TableCell>}
                  <TableCell className="text-right">
                    <span className="font-black text-primary text-lg">Rs. {product.price.toFixed(0)}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    <StatusBadge status={product.stock === 0 ? 'out_of_stock' : product.stock < 10 ? 'low_stock' : 'in_stock'} />
                  </TableCell>
                  {canManage && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl" onClick={() => handleAdjustClick(product)} title="Adjust Stock">
                          <FiRefreshCw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl" onClick={() => handleEditClick(product)} title="Edit">
                          <FiEdit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                          onClick={() => handleDeleteProduct(product.id)}
                          title="Delete"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden border-none shadow-2xl rounded-3xl bg-white hover:translate-y-[-4px] transition-all duration-300">
              <div className="aspect-[4/3] relative overflow-hidden bg-slate-100 group">
                {product.image ? (
                  <img src={typeof product.image === 'string' ? product.image : undefined} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <FiPlus className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute top-3 right-3 opacity-90 backdrop-blur-md">
                  <StatusBadge status={product.stock === 0 ? 'out_of_stock' : product.stock < 10 ? 'low_stock' : 'in_stock'} />
                </div>
              </div>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">{product.category}</p>
                  <h3 className="font-bold text-lg leading-tight truncate text-slate-900">{product.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono italic tracking-tighter">{product.barcode || 'NO BARCODE'}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1 bg-slate-50 p-3 rounded-2xl">
                    <p className="text-slate-400 text-[9px] uppercase font-black tracking-widest">In Stock</p>
                    <p className={cn("font-black text-base", product.stock < 10 ? "text-red-500" : "text-slate-900")}>{product.stock}</p>
                  </div>
                  <div className="space-y-1 bg-primary/5 p-3 rounded-2xl">
                    <p className="text-primary/50 text-[9px] uppercase font-black tracking-widest">Price</p>
                    <p className="font-black text-base text-primary">Rs. {product.price.toFixed(0)}</p>
                  </div>
                </div>

                {canManage && (
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-2 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-amber-50 hover:text-amber-600 border-slate-100 h-10" onClick={() => handleAdjustClick(product)}>
                      <FiRefreshCw className="h-3 w-3" /> Adjust
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-2 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-blue-50 border-slate-100 h-10" onClick={() => handleEditClick(product)}>
                      <FiEdit2 className="h-3 w-3" /> Edit
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      <ProductModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
        onSave={handleSaveProduct}
        product={editingProduct}
        categories={productCategories}
      />

      <StockAdjustmentModal
        isOpen={isAdjustModalOpen}
        onClose={() => { setIsAdjustModalOpen(false); setAdjustingProduct(null); }}
        product={adjustingProduct}
        onSuccess={() => refreshProducts()}
      />
    </div>
  );
};
