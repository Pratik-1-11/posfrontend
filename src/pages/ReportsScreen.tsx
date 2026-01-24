import { useNavigate } from 'react-router-dom';

export const ReportsScreen: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState('7days');
  // ... existing state ...

  // ... inside return ...
  <div className="flex gap-2">
    {/* Quick Links to Compliance Reports */}
    <Button variant="ghost" className="gap-2 text-blue-700 font-bold bg-blue-50 border border-blue-100" onClick={() => navigate('/reports/vat')}>
      <Calendar className="h-4 w-4" /> VAT Sales Book
    </Button>
    <Button variant="ghost" className="gap-2 text-emerald-700 font-bold bg-emerald-50 border border-emerald-100" onClick={() => navigate('/reports/purchase-book')}>
      <Filter className="h-4 w-4" /> VAT Purchase Book
    </Button>
    import {
      Download,
      Filter,
      BarChart2,
      TrendingUp,
      Calendar,
      ArrowUp,
      ArrowDown
    } from 'lucide-react';
    import {exportToCSV, exportToPDF} from '@/utils/export';
    import {SalesTrendChart} from '@/components/reports/SalesTrendChart';
    import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
    import {Button} from '@/components/ui/Button';
    import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/Card';
    import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/Tabs';
    import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/Select';
    import {Input} from '@/components/ui/Input';
    import {format, subDays, parseISO} from 'date-fns';
    import {
      BarChart, Bar, PieChart, Pie, Cell,
      XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
    } from 'recharts';
    import type {PieLabelRenderProps} from 'recharts/types/polar/Pie';
    import {cn} from '@/lib/utils';
    import {useQuery} from '@tanstack/react-query';
    import {reportApi} from '@/services/api/reportApi';
    import {apiClient} from '@/services/api/apiClient';
    import {Skeleton} from '@/components/ui/Skeleton';

const ReportsSkeleton = () => (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-3xl" />
        ))}
      </div>

      <Skeleton className="h-[400px] rounded-3xl w-full" />
    </div>
    );

    // Chart color scheme
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const ReportsScreen: React.FC = () => {
  const [dateRange, setDateRange] = useState('7days');
    const [startDate, setStartDate] = useState(format(subDays(new Date(), 6), 'yyyy-MM-dd'));
    const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    // Fetch all reports
    const {data: salesData = [], isLoading: salesLoading } = useQuery({
      queryKey: ['report-sales'],
    queryFn: reportApi.getDailySales
  });

    const {data: productData = [], isLoading: productsLoading } = useQuery({
      queryKey: ['report-products'],
    queryFn: async () => {
      const res = await apiClient.request<{ status: string, data: {stats: any[] } }>('/api/reports/products');
    return res.data.stats;
    },
  });

    const {data: expenseStats = [], isLoading: expensesLoading } = useQuery({
      queryKey: ['report-expenses'],
    queryFn: reportApi.getExpenseSummary
  });

    const {data: purchaseStats = [], isLoading: purchasesLoading } = useQuery({
      queryKey: ['report-purchases'],
    queryFn: reportApi.getPurchaseSummary
  });

  const handleDateRangeChange = (value: string) => {
      setDateRange(value);
    const today = new Date();
    switch (value) {
      case '7days':
    setStartDate(format(subDays(today, 6), 'yyyy-MM-dd'));
    setEndDate(format(today, 'yyyy-MM-dd'));
    break;
    case '30days':
    setStartDate(format(subDays(today, 29), 'yyyy-MM-dd'));
    setEndDate(format(today, 'yyyy-MM-dd'));
    break;
    case '90days':
    setStartDate(format(subDays(today, 89), 'yyyy-MM-dd'));
    setEndDate(format(today, 'yyyy-MM-dd'));
    break;
    case 'thisMonth':
    setStartDate(format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd'));
    setEndDate(format(today, 'yyyy-MM-dd'));
    break;
    case 'thisYear':
    setStartDate(format(new Date(today.getFullYear(), 0, 1), 'yyyy-MM-dd'));
    setEndDate(format(today, 'yyyy-MM-dd'));
    break;
    }
  };

  const formattedSalesData = salesData.map((item: any) => ({
      ...item,
      displayDate: format(parseISO(item.sale_date), 'MMM dd'),
    amount: Number(item.total_revenue),
    orders: Number(item.total_transactions)
  }));

  const totalSales = formattedSalesData.reduce((sum, item) => sum + item.amount, 0);
  const totalOrders = formattedSalesData.reduce((sum, item) => sum + item.orders, 0);
    const averageOrderValue = totalSales / (totalOrders || 1);

    // Calculate trends (Simple: compare this half with previous half)
    const midpoint = Math.floor(formattedSalesData.length / 2);
  const currentHalfSales = formattedSalesData.slice(midpoint).reduce((sum, item) => sum + item.amount, 0);
  const previousHalfSales = formattedSalesData.slice(0, midpoint).reduce((sum, item) => sum + item.amount, 0);
  const salesTrend = previousHalfSales === 0 ? (currentHalfSales > 0 ? 100 : 0) : Math.round(((currentHalfSales - previousHalfSales) / previousHalfSales) * 100);

  const currentHalfOrders = formattedSalesData.slice(midpoint).reduce((sum, item) => sum + item.orders, 0);
  const previousHalfOrders = formattedSalesData.slice(0, midpoint).reduce((sum, item) => sum + item.orders, 0);
  const ordersTrend = previousHalfOrders === 0 ? (currentHalfOrders > 0 ? 100 : 0) : Math.round(((currentHalfOrders - previousHalfOrders) / previousHalfOrders) * 100);

  // Process Expense Data for Charts
  const totalExpenseAmount = expenseStats.reduce((sum, item: any) => sum + Number(item.total_amount), 0);
  const expenseData = expenseStats.map((item: any) => ({
      category: item.category,
    amount: Number(item.total_amount),
    percentage: totalExpenseAmount > 0 ? Math.round((Number(item.total_amount) / totalExpenseAmount) * 100) : 0
  }));

  const totalPurchases = purchaseStats.reduce((sum, item: any) => sum + Number(item.total_spent), 0);

    if (salesLoading || productsLoading || expensesLoading || purchasesLoading) {
    return <ReportsSkeleton />;
  }

    const ChangeBadge = ({value, label}: {value: number, label: string }) => (
    <div className={cn(
      "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full w-fit",
      value >= 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
    )}>
      {value >= 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
      {Math.abs(value)}% <span className="text-gray-500 font-medium">{label}</span>
    </div>
    );

  const handleExport = (type: 'csv' | 'pdf') => {
    if (!salesData.length) return;

    const filename = `Sales_Report_${startDate}_${endDate}`;

    if (type === 'csv') {
      const csvData = formattedSalesData.map(item => ({
      Date: item.displayDate,
    'Revenue (Rs)': item.amount,
    'Orders': item.orders
      }));
    exportToCSV(csvData, filename);
    } else {
      const headers = ['Date', 'Revenue (Rs)', 'Orders'];
      const rows = formattedSalesData.map(item => [
    item.displayDate,
    item.amount.toLocaleString(),
    item.orders.toString()
    ]);
    exportToPDF(headers, rows, filename, 'Sales Report');
    }
  };

    return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Reports Overview</h1>
          <p className="text-muted-foreground font-medium">Analyze your business performance and growth metrics.</p>
        </div>
        <div className="flex gap-2">
          {/* Quick Links to Compliance Reports */}
          <Button variant="ghost" className="gap-2 text-blue-700 font-bold bg-blue-50 border border-blue-100" onClick={() => window.location.href = '/reports/vat'}>
            <Calendar className="h-4 w-4" /> VAT Sales Book
          </Button>
          <Button variant="ghost" className="gap-2 text-emerald-700 font-bold bg-emerald-50 border border-emerald-100" onClick={() => window.location.href = '/reports/purchase-book'}>
            <Filter className="h-4 w-4" /> VAT Purchase Book
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 font-bold shadow-sm">
                <Download className="h-4 w-4" /> Export All Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                Export to CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                Export to PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card className="border-none shadow-sm bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase tracking-wider">
              <Calendar className="h-4 w-4 text-primary" /> Date Range
            </div>
            <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
              <Select value={dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger className="w-full sm:w-[200px] font-semibold">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                  <SelectItem value="thisMonth">This Month</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
              {dateRange === 'custom' && (
                <div className="flex gap-2 animate-in fade-in slide-in-from-left-2">
                  <Input type="date" value={startDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)} className="w-[150px]" />
                  <span className="flex items-center font-bold text-gray-400">to</span>
                  <Input type="date" value={endDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)} className="w-[150px]" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Sales</p>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><BarChart2 className="h-4 w-4" /></div>
            </div>
            <h3 className="text-2xl font-black">Rs.{totalSales.toLocaleString()}</h3>
            <ChangeBadge value={salesTrend} label="vs last period" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Orders</p>
              <div className="p-2 bg-green-50 text-green-600 rounded-lg"><PieChart className="h-4 w-4" /></div>
            </div>
            <h3 className="text-2xl font-black">{totalOrders}</h3>
            <ChangeBadge value={ordersTrend} label="vs last period" />
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-amber-500">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Avg. Order</p>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><TrendingUp className="h-4 w-4" /></div>
            </div>
            <h3 className="text-2xl font-black">Rs.{(averageOrderValue || 0).toFixed(2)}</h3>
            <p className="text-xs text-muted-foreground font-medium">Performance is stable</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
          <CardContent className="p-6 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Inventory Investment</p>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Filter className="h-4 w-4" /></div>
            </div>
            <h3 className="text-2xl font-black">Rs.{totalPurchases.toLocaleString()}</h3>
            <p className="text-xs text-muted-foreground font-medium">Total spent on stock</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="bg-white/50 p-1 rounded-xl shadow-sm border mb-6">
          <TabsTrigger value="sales" className="px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Sales Trends</TabsTrigger>
          <TabsTrigger value="products" className="px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Product Performance</TabsTrigger>
          <TabsTrigger value="expenses" className="px-8 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Expense Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <SalesTrendChart data={formattedSalesData} />
        </TabsContent>

        <TabsContent value="products" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-md">
            <CardHeader><CardTitle className="text-xl font-bold">Revenue by Product</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={[...productData].sort((a, b) => b.revenue - a.revenue)} margin={{ left: 20 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontWeight: 600, fontSize: 13 }} width={100} />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="revenue" name="Revenue (Rs.)" fill="#3b82f6" radius={[0, 10, 10, 0]}>
                      {productData.map((_: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-md">
            <CardHeader><CardTitle className="text-xl font-bold">Units Sold Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={productData} dataKey="quantity" nameKey="name" cx="50%" cy="50%" outerRadius={110} innerRadius={60} paddingAngle={5}>
                      {productData.map((_: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card className="border-none shadow-md">
            <CardHeader><CardTitle className="text-xl font-bold">Expense Structure</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
              <div className="col-span-1 space-y-6">
                {expenseData.map((expense: any, index: number) => (
                  <div key={expense.category} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-gray-700 capitalize">{expense.category}</span>
                      <span className="text-xs font-black text-blue-600">{expense.percentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${expense.percentage}%`, backgroundColor: COLORS[index % COLORS.length] }} />
                    </div>
                    <p className="text-xs text-muted-foreground font-semibold">Rs.{expense.amount.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="col-span-2 h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={130}
                      label={({ name, percent }: PieLabelRenderProps) => `${name}: ${(Number(percent || 0) * 100).toFixed(0)}%`}
                    >
                      {expenseData.map((_: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    );
};

    export default ReportsScreen;