import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '@/services/api/orderApi';
import { invoiceApi } from '@/services/api/invoiceApi';
import { format } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/Table';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
    Search,
    Filter,
    MoreHorizontal,
    Printer,
    Ban,
    Eye
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { VoidSaleModal } from '@/components/pos/VoidSaleModal';
import { useAuth } from '@/context/AuthContext';
// import { canVoidSales } from '@/utils/permissions'; // Assuming this exists or I'll implement logic inline

const SalesHistoryScreen: React.FC = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSale, setSelectedSale] = useState<any>(null);
    const [showVoidModal, setShowVoidModal] = useState(false);

    // Fetch orders
    const { data: sales = [], isLoading, refetch } = useQuery({
        queryKey: ['sales-history'],
        queryFn: () => orderApi.getAll() // This might need pagination params in the future
    });

    // Filter sales based on search
    const filteredSales = sales.filter((sale: any) =>
        sale.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.customer_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const canVoid = (role: string) => ['SUPER_ADMIN', 'VENDOR_ADMIN', 'VENDOR_MANAGER'].includes(role);

    const handleVoidClick = (sale: any) => {
        setSelectedSale(sale);
        setShowVoidModal(true);
    };

    const handleReprint = async (saleId: string) => {
        // In a real app, this would trigger the print logic
        console.log("Reprinting", saleId);
        await invoiceApi.trackPrint(saleId);
        // Trigger print window/component... 
        // For now we just track it
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed': return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
            case 'voided': return <Badge variant="destructive">VOIDED</Badge>;
            case 'refunded': return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Refunded</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-6 bg-slate-50/50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sales History</h1>
                    <p className="text-muted-foreground">View and manage all transactions.</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            type="search"
                            placeholder="Search invoice or customer..."
                            className="pl-9 bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">Loading sales...</TableCell>
                                </TableRow>
                            ) : filteredSales.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No sales found.</TableCell>
                                </TableRow>
                            ) : (
                                filteredSales.map((sale: any) => (
                                    <TableRow key={sale.id} className={sale.status === 'voided' ? 'bg-red-50/30' : ''}>
                                        <TableCell className="font-medium">{sale.invoice_number}</TableCell>
                                        <TableCell>{format(new Date(sale.created_at), 'MMM dd, HH:mm')}</TableCell>
                                        <TableCell>{sale.customer_name || 'Walk-in'}</TableCell>
                                        <TableCell className="capitalize">{sale.payment_method}</TableCell>
                                        <TableCell className="font-bold">Rs.{Number(sale.total_amount).toLocaleString()}</TableCell>
                                        <TableCell>{getStatusBadge(sale.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleReprint(sale.id || '')}>
                                                        <Printer className="mr-2 h-4 w-4" /> Reprint Receipt
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => console.log('View details', sale.id)}>
                                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                                    </DropdownMenuItem>

                                                    {canVoid(user?.role || '') && sale.status !== 'voided' && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => handleVoidClick(sale)}
                                                                className="text-red-600 focus:text-red-600 focus:bg-red-50"
                                                            >
                                                                <Ban className="mr-2 h-4 w-4" /> Void Sale
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {selectedSale && (
                <VoidSaleModal
                    isOpen={showVoidModal}
                    onClose={() => {
                        setShowVoidModal(false);
                        setSelectedSale(null);
                    }}
                    saleId={selectedSale.id || ''}
                    invoiceNumber={selectedSale.invoice_number || 'N/A'}
                    totalAmount={selectedSale.total_amount || 0}
                    onSuccess={() => {
                        refetch(); // Refresh list after void
                        setShowVoidModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default SalesHistoryScreen;

