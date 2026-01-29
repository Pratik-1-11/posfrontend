import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AppRouter } from '@/router/AppRouter';
import { Toaster } from '@/components/ui/Toaster';
import { SettingsProvider } from '@/context/SettingsContext';
import { HoldBillProvider } from '@/context/HoldBillContext';
import { CustomerProvider } from '@/context/CustomerContext';
import { ProductProvider } from '@/context/ProductContext';
import { ExpenseProvider } from '@/context/ExpenseContext';
import { PurchaseProvider } from '@/context/PurchaseContext';
import { CartProvider } from '@/context/CartContext';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { AuthProvider } from '@/context/AuthContext';
import { OfflineProvider } from '@/context/OfflineContext';
import { ShiftProvider } from '@/context/ShiftContext';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <OfflineProvider>
          <AuthProvider>
            <ShiftProvider>
              <SettingsProvider>
                <CustomerProvider>
                  <ProductProvider>
                    <ExpenseProvider>
                      <PurchaseProvider>
                        <CartProvider>
                          <HoldBillProvider>
                            <div className="min-h-screen bg-gray-50 text-gray-900">
                              <AppRouter />
                              <Toaster />
                            </div>
                            <ReactQueryDevtools initialIsOpen={false} />
                          </HoldBillProvider>
                        </CartProvider>
                      </PurchaseProvider>
                    </ExpenseProvider>
                  </ProductProvider>
                </CustomerProvider>
              </SettingsProvider>
            </ShiftProvider>
          </AuthProvider>
        </OfflineProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
