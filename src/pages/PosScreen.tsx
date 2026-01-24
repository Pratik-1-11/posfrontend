import React, { useState, useMemo, useCallback, useEffect } from 'react';
import QRCode from 'qrcode';
import { X, ShoppingCart, TrendingUp, History } from 'lucide-react';
import { motion } from 'framer-motion';

import { useQuery } from '@tanstack/react-query';

import { Invoice } from '@/components/pos/Invoice';
import { Card } from '@/components/ui/Card';
import { ProductSearch } from '@/components/pos/ProductSearch';
import { CategoryFilter } from '@/components/pos/CategoryFilter';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { CartSection } from '@/components/pos/CartSection';
import { PaymentModal } from '@/components/pos/PaymentModal';
import { QRPaymentModal } from '@/components/pos/QRPaymentModal';
import { HeldBillsModal } from '@/components/pos/HeldBillsModal';
import { CustomerSelect } from '@/components/pos/CustomerSelect';

import { playBeep, playSuccess, playError } from '@/utils/sounds';
import { useHoldBill } from '@/context/HoldBillContext';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';
import { useModal } from '@/hooks/useModal';
import { calculateOrderTotals } from '@/utils/calculations';
import { generateInvoiceNumber } from '@/utils/invoice';
import { formatCurrency } from '@/utils/currency';
import { useLayout } from '@/context/LayoutContext';
import { useAuth } from '@/context/AuthContext';
import { useProductContext } from '@/context/ProductContext';
import { useToast } from '@/hooks/use-toast';
import { orderApi } from '@/services/api/orderApi';
import { reportApi } from '@/services/api/reportApi';

import type { PaymentMethod } from '@/types/payment';
import type { Customer } from '@/types/customer';
import type { Product } from '@/types/product';
import type { CartItem } from '@/types/sales';

export const PosScreen: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isSidebarCollapsed } = useLayout();
  const { products, refresh, loading: productsLoading } = useProductContext();

  // Queries
  const { data: reportData, refetch: refetchStats } = useQuery({
    queryKey: ['daily-sales-pos'],
    queryFn: () => reportApi.getDailySales()
  });

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cash');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [lastInvoiceData, setLastInvoiceData] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showMobileCart, setShowMobileCart] = useState(false);

  // Modal states
  const paymentModal = useModal();
  const qrModal = useModal();
  const heldBillsModal = useModal();

  // Contexts
  const { heldBills, holdCurrentBill, retrieveBill, deleteBill } = useHoldBill();

  // Memoized values
  const categories = useMemo(() => {
    const exhaustiveCategories = [
      'All',
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
    ];

    // Filter to only show 'All' and categories that actually have products in the system
    // Or just show all if the user wants to see the empty ones. 
    // Usually, showing only populated categories is better UX.
    const populated = new Set(products.map(p => p.category));
    return exhaustiveCategories.filter(cat => cat === 'All' || populated.has(cat));
  }, [products]);

  const { subtotal, tax, total: grandTotal } = useMemo(() =>
    calculateOrderTotals(cartItems),
    [cartItems]
  );

  const stats = useMemo(() => {
    if (!reportData || !Array.isArray(reportData)) return { total: 0, count: 0 };
    // Get today's date in YYYY-MM-DD format based on LOCAL time
    const today = new Date().toLocaleDateString('en-CA');
    const todayStats = reportData.find((r: any) => r.sale_date === today);
    return {
      total: todayStats?.total_revenue || 0,
      count: todayStats?.total_transactions || 0
    };
  }, [reportData]);


  // Handlers
  const handleAddToCart = useCallback((product: Product) => {
    playBeep();
    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id);
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 } as CartItem];
    });
  }, []);

  const updateQuantity = useCallback((id: string, newQuantity: number) => {
    setCartItems(prev => {
      if (newQuantity < 1) {
        return prev.filter(item => item.id !== id);
      }
      return prev.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    playBeep();
  }, []);

  const handleReprintLastInvoice = useCallback(() => {
    if (lastInvoiceData) {
      setInvoiceData(lastInvoiceData);
      setShowInvoice(true);
    }
  }, [lastInvoiceData]);

  const handlePayment = useCallback(async (method: PaymentMethod, amountReceived: number, paymentDetails?: Record<string, number>) => {
    if (cartItems.length === 0) return;

    // Credit Limit Check
    if (method === 'credit' || (method === 'mixed' && paymentDetails?.credit)) {
      const creditAmount = method === 'credit' ? grandTotal : (paymentDetails?.credit || 0);
      if (selectedCustomer) {
        const currentCredit = selectedCustomer.currentBalance || 0;
        const limit = selectedCustomer.creditLimit || 0;
        if (limit > 0 && (currentCredit + creditAmount) > limit) {
          playError();
          toast({
            title: "Credit Limit Exceeded",
            description: `Customer ${selectedCustomer.name} has a limit of Rs. ${limit}. Current balance + this sale exceeds it.`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    try {
      const orderRes = await orderApi.create({
        items: cartItems.map((i) => ({ productId: i.id, quantity: i.quantity })),
        discountAmount: 0,
        taxAmount: tax,
        paymentMethod: method,
        paymentDetails,
        customerId: selectedCustomer?.id,
        customerPan: selectedCustomer?.panNumber
      });

      await refresh(); // Refresh products (stock)
      refetchStats(); // Refresh dashboard stats

      const newInvoiceData = {
        items: [...cartItems],
        invoiceNumber: orderRes.invoice_number || generateInvoiceNumber(),
        date: new Date(),
        subtotal,
        tax,
        grandTotal,
        paymentMethod: method,
        paymentDetails,
        amountReceived,
        change: amountReceived > grandTotal ? (amountReceived - grandTotal) : 0,
        customerName: selectedCustomer?.name,
        customerPan: selectedCustomer?.panNumber,
        customer: selectedCustomer,
      };

      setInvoiceData(newInvoiceData);
      setLastInvoiceData(newInvoiceData);
      setCartItems([]);
      paymentModal.close();
      qrModal.close();
      setShowInvoice(true);
      playSuccess();

      toast({
        title: "Sale Processed",
        description: `Invoice #${newInvoiceData.invoiceNumber} printed`,
      });
    } catch (error) {
      console.error('Payment error:', error);
      playError();
      toast({
        title: "Sale Failed",
        description: error instanceof Error ? error.message : "Internal error processing sale",
        variant: "destructive",
      });
    }
  }, [cartItems, subtotal, tax, grandTotal, selectedCustomer, refresh, refetchStats, toast, paymentModal, qrModal]);

  const handleHoldBill = useCallback(() => {
    if (cartItems.length > 0) {
      const billId = holdCurrentBill(cartItems);
      setCartItems([]);
      playBeep();
      toast({
        title: "Bill Held",
        description: `Bill ID: ${billId.slice(-6)}`,
      });
    }
  }, [cartItems, holdCurrentBill, toast]);

  const handleRetrieveBill = useCallback((billId: string) => {
    const bill = retrieveBill(billId);
    if (bill) {
      setCartItems(bill.items);
      heldBillsModal.close();
      playBeep();
      toast({
        title: "Bill Restored",
      });
    }
  }, [retrieveBill, heldBillsModal, toast]);

  // Barcode Scanner
  useBarcodeScanner({
    onScan: (barcode) => {
      const product = products.find(p => p.barcode === barcode);
      if (product) {
        handleAddToCart(product);
      } else {
        playError();
        toast({
          title: "Product Not Found",
          description: `Barcode: ${barcode}`,
          variant: "destructive",
        });
      }
    },
    enabled: !paymentModal.isOpen && !heldBillsModal.isOpen && !qrModal.isOpen
  });

  // Digital Payment QR Generation
  useEffect(() => {
    if ((selectedPayment === 'fonepay' || selectedPayment === 'esewa') && paymentModal.isOpen) {
      const paymentData = `fonepay_merchant_qr_v1?amt=${grandTotal}&id=MART-${Date.now()}`;
      QRCode.toDataURL(paymentData, { width: 250, margin: 2 })
        .then(setQrCodeUrl)
        .catch(console.error);
    }
  }, [selectedPayment, grandTotal, paymentModal.isOpen]);

  // Printing
  useEffect(() => {
    if (showInvoice) {
      const timer = setTimeout(() => {
        window.print();
        // Removed auto-close to allow PDF download
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showInvoice]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        searchInput?.focus();
      }
      if (e.key === 'F4') { e.preventDefault(); handleHoldBill(); }
      if (e.key === 'F5') { e.preventDefault(); heldBillsModal.open(); }
      if (e.key === 'F9') {
        e.preventDefault();
        if (cartItems.length > 0) paymentModal.open();
      }
      if (e.key === 'Escape') {
        qrModal.close();
        paymentModal.close();
        heldBillsModal.close();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cartItems.length, paymentModal, heldBillsModal, qrModal, handleHoldBill]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] bg-slate-50 overflow-hidden relative">
      {/* Products Canvas */}
      <main className={`flex-1 flex flex-col p-4 md:p-6 pb-24 lg:pb-6 space-y-6 overflow-y-auto no-print scrollbar-hide ${showMobileCart ? 'hidden lg:flex' : ''}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="text-primary" size={24} />
            MART POS
          </h1>
          <div className="flex items-center gap-3">
            {user?.tenant?.subscription_status === 'trial' && (
              <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-[10px] font-black text-amber-600 uppercase tracking-widest animate-pulse">
                Trial Mode
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm text-xs font-bold text-slate-600">
              <TrendingUp size={14} className="text-emerald-500" />
              {stats.count} Sales Today
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm text-xs font-bold text-slate-600">
              <History size={14} className="text-blue-500" />
              Rs. {stats.total.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="border-none shadow-sm bg-white p-2">
            <ProductSearch onSearch={setSearchQuery} />
          </Card>
          <div className="w-full">
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>
        </div>

        <ProductGrid
          products={products}
          activeCategory={activeCategory}
          searchQuery={searchQuery}
          onAddToCart={handleAddToCart}
          isSidebarCollapsed={isSidebarCollapsed}
          loading={productsLoading}
        />
      </main>

      {/* Cart Glassmorphism Sidebar */}
      <aside className={`
                ${showMobileCart ? 'fixed inset-0 z-50 flex lg:relative lg:z-0' : 'hidden lg:flex'}
                lg:h-full lg:flex lg:flex-col
            `}>
        <div className={`
                    relative w-full ml-auto bg-white/80 backdrop-blur-xl h-full shadow-2xl flex flex-col border-l border-white/50
                    lg:shadow-none
                    ${isSidebarCollapsed ? 'lg:w-[420px]' : 'lg:w-[380px]'}
                `}>
          {showMobileCart && (
            <div className="p-4 border-b flex items-center justify-between bg-white lg:hidden">
              <h2 className="font-black text-slate-800">SHOPPING CART</h2>
              <button onClick={() => setShowMobileCart(false)} className="p-1 rounded-full bg-slate-100"><X size={20} /></button>
            </div>
          )}

          <CartSection
            items={cartItems}
            subtotal={subtotal}
            tax={tax}
            total={grandTotal}
            todaySales={stats}
            heldBillsCount={heldBills.length}
            canReprint={!!lastInvoiceData}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            onClearCart={clearCart}
            onHoldBill={handleHoldBill}
            onShowHeldBills={heldBillsModal.open}
            onReprintLastInvoice={handleReprintLastInvoice}
            onProcessPayment={paymentModal.open}
            isSidebarCollapsed={isSidebarCollapsed}
            customerSlot={
              <CustomerSelect
                onSelectCustomer={setSelectedCustomer}
                selectedCustomer={selectedCustomer}
              />
            }
          />
        </div>
      </aside>

      {/* Mobile Footer (Elevated) */}
      {!showMobileCart && cartItems.length > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="lg:hidden fixed bottom-6 left-6 right-6 z-40"
        >
          <button
            onClick={() => setShowMobileCart(true)}
            className="w-full bg-primary text-white p-4 rounded-3xl shadow-2xl shadow-primary/40 flex items-center justify-between ring-4 ring-white"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                <ShoppingCart size={20} />
              </div>
              <div className="text-left leading-tight">
                <span className="block text-[10px] font-black opacity-70 uppercase tracking-widest">Cart Items</span>
                <span className="text-lg font-black">{cartItems.reduce((a, b) => a + b.quantity, 0)} Items</span>
              </div>
            </div>
            <div className="text-right leading-tight">
              <span className="block text-[10px] font-black opacity-70 uppercase tracking-widest">Payable</span>
              <span className="text-xl font-black">{formatCurrency(grandTotal)}</span>
            </div>
          </button>
        </motion.div>
      )}

      {/* Modals */}
      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={paymentModal.close}
        onConfirm={handlePayment}
        total={grandTotal}
        selectedPayment={selectedPayment}
        onPaymentMethodChange={setSelectedPayment}
        customer={selectedCustomer}
      />

      <QRPaymentModal
        isOpen={qrModal.isOpen}
        onClose={qrModal.close}
        onConfirm={() => handlePayment(selectedPayment, grandTotal)}
        qrCodeUrl={qrCodeUrl}
        paymentMethod={selectedPayment}
        amount={grandTotal}
      />

      <HeldBillsModal
        isOpen={heldBillsModal.isOpen}
        onClose={heldBillsModal.close}
        heldBills={heldBills}
        onRetrieve={handleRetrieveBill}
        onDelete={deleteBill}
      />

      {/* Print Overlay */}
      {showInvoice && invoiceData && (
        <div className="fixed inset-0 z-[100] bg-white print:block hidden">
          <Invoice {...invoiceData} onClose={() => setShowInvoice(false)} />
        </div>
      )}
    </div>
  );
};