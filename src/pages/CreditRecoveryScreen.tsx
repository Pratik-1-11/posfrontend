import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { customerApi } from '@/services/api/customerApi';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';

import {
    Table,
    TableHeader,
    TableBody,
    TableHead,
    TableRow,
    TableCell
} from '@/components/ui/Table';
import { formatCurrency } from '@/utils/currency';
import {
    AlertCircle,
    Clock,
    ArrowUpRight,
    MessageSquare,

    Search,
    TrendingDown,
    UserCheck,
    RefreshCw,
    Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const CreditRecoveryScreen: React.FC = () => {
    const [search, setSearch] = useState('');

    const { data: agingReport, isLoading, refetch } = useQuery({
        queryKey: ['customer-aging'],
        queryFn: () => customerApi.getAgingReport()
    });

    const metrics = useMemo(() => {
        if (!agingReport) return { total: 0, overdue: 30, count: 0, critical: 0 };
        return {
            total: agingReport.reduce((sum, r) => sum + r.balance, 0),
            overdue: agingReport.filter(r => r.daysOld > 30).reduce((sum, r) => sum + r.balance, 0),
            count: agingReport.length,
            criticalCount: agingReport.filter(r => r.daysOld > 30).length
        };
    }, [agingReport]);

    const filteredReport = useMemo(() => {
        if (!agingReport) return [];
        return agingReport.filter(r =>
            r.name.toLowerCase().includes(search.toLowerCase())
        ).sort((a, b) => b.balance - a.balance);
    }, [agingReport, search]);

    const sendWhatsApp = (phone: string, name: string, balance: number) => {
        const text = `Namaste ${name}, this is a friendly reminder from our store regarding your outstanding balance of Rs. ${balance.toLocaleString()}. Please visit us for settlement at your earliest convenience. Thank you!`;
        // Assuming Nepal context, strip non-digits and add 977 if needed
        const cleanPhone = phone.replace(/\D/g, '');
        const finalPhone = cleanPhone.startsWith('977') ? cleanPhone : `977${cleanPhone}`;
        window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`, '_blank');
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case '30+': return 'destructive';
            case '15-30': return 'warning';
            case '7-15': return 'secondary';
            default: return 'outline';
        }
    };

    if (isLoading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 font-inter animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Credit Recovery</h1>
                <p className="text-slate-500 font-medium">Aging analysis and active debt collection (Khata Ledger)</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white border-none shadow-sm overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Receivable</p>
                                <h3 className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(metrics.total)}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <TrendingDown size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-none shadow-sm overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Overdue (30+ Days)</p>
                                <h3 className="text-2xl font-black text-red-600 mt-1">{formatCurrency(metrics.overdue)}</h3>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                                <Clock size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-none shadow-sm overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">At-Risk Accounts</p>
                                <h3 className="text-2xl font-black text-amber-600 mt-1">{metrics.criticalCount} Clients</h3>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                                <AlertCircle size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-none shadow-sm overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Debtors</p>
                                <h3 className="text-2xl font-black text-green-600 mt-1">{metrics.count} Active</h3>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                <UserCheck size={24} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Table Section */}
            <Card className="bg-white border-none shadow-sm px-0">
                <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-6 px-6">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                            placeholder="Search names..."
                            className="pl-10 h-11 border-slate-200 rounded-xl focus-visible:ring-primary shadow-none"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="rounded-xl gap-2 font-bold" onClick={() => refetch()}>
                        <RefreshCw className="w-4 h-4" />
                        Refresh Analysis
                    </Button>

                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-slate-400">Customer Name</TableHead>
                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-slate-400 text-right">Outstanding Balance</TableHead>
                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-slate-400 text-center">Aging Days</TableHead>
                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-slate-400 text-center">Status</TableHead>
                                <TableHead className="py-4 px-6 font-black uppercase text-[10px] tracking-widest text-slate-400 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredReport.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center text-slate-400 font-medium">
                                        No credit accounts found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredReport.map((record) => (
                                    <TableRow key={record.id} className="group hover:bg-slate-50 transition-colors">
                                        <TableCell className="py-4 px-6 font-bold text-slate-800">
                                            {record.name}
                                        </TableCell>
                                        <TableCell className="py-4 px-6 font-black text-slate-900 text-right">
                                            {formatCurrency(record.balance)}
                                        </TableCell>
                                        <TableCell className="py-4 px-6 font-bold text-slate-600 text-center">
                                            {record.daysOld} Days
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-center">
                                            <Badge variant={getTierColor(record.tier)} className="font-black px-3 py-1">
                                                {record.tier === '30+' ? 'Critical' : record.tier === '15-30' ? 'Urgent' : record.tier === '7-15' ? 'Active' : 'Current'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 rounded-lg font-bold text-green-600 hover:text-green-700 hover:bg-green-50 px-3 border border-green-100"
                                                    onClick={() => sendWhatsApp(record.phone || '', record.name, record.balance)}
                                                >
                                                    <MessageSquare size={16} className="mr-2" />
                                                    Remind
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-lg hover:bg-slate-100"
                                                    title="View Ledger"
                                                >
                                                    <ArrowUpRight size={16} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default CreditRecoveryScreen;
