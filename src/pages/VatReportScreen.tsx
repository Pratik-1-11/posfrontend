import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportApi } from '@/services/api/reportApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
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
    Download,
    FileSpreadsheet,
    Calendar,
    Filter,
    CheckCircle2
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const VatReportScreen: React.FC = () => {
    const today = new Date();
    const [year, setYear] = useState<number>(today.getFullYear());
    const [month, setMonth] = useState<number>(today.getMonth() + 1);

    const { data: vatData, isLoading, refetch } = useQuery({
        queryKey: ['vat-report', year, month],
        queryFn: () => reportApi.getVatReport(year, month)
    });

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return [currentYear, currentYear - 1, currentYear - 2];
    }, []);

    const months = [
        { label: 'January', value: 1 },
        { label: 'February', value: 2 },
        { label: 'March', value: 3 },
        { label: 'April', value: 4 },
        { label: 'May', value: 5 },
        { label: 'June', value: 6 },
        { label: 'July', value: 7 },
        { label: 'August', value: 8 },
        { label: 'September', value: 9 },
        { label: 'October', value: 10 },
        { label: 'November', value: 11 },
        { label: 'December', value: 12 },
    ];

    const exportToCSV = () => {
        if (!vatData?.report || vatData.report.length === 0) return;

        const headers = ["Date", "Invoice #", "Customer", "Taxable Amount", "VAT (13%)", "Non-Taxable", "Total"];
        const rows = vatData.report.map(r => [
            format(parseISO(r.created_at), 'yyyy-MM-dd'),
            r.invoice_number,
            r.customer_name || 'Walk-in',
            r.taxable_amount,
            r.vat_amount,
            (Number(r.total_amount) - Number(r.taxable_amount) - Number(r.vat_amount)).toFixed(2),
            r.total_amount
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `VAT_Report_${year}_${month}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 font-inter animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        VAT Compliance Export
                    </h1>
                    <p className="text-slate-500 font-medium italic">Monthly tax breakdown for IRD Nepal filing</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={exportToCSV}
                        disabled={!vatData?.report?.length}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl gap-2 shadow-lg shadow-emerald-200"
                    >
                        <FileSpreadsheet size={18} />
                        EXPORT CSV
                    </Button>
                </div>
            </div>

            {/* Selection Grid */}
            <Card className="bg-white border-none shadow-sm">
                <CardContent className="pt-6">
                    <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                                <Calendar size={20} />
                            </div>
                            <div className="min-w-[140px]">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Select Year</p>
                                <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                                    <SelectTrigger className="font-bold border-none bg-slate-50 rounded-lg">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                                <Filter size={20} />
                            </div>
                            <div className="min-w-[160px]">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Select Month</p>
                                <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v))}>
                                    <SelectTrigger className="font-bold border-none bg-slate-50 rounded-lg">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button
                            variant="secondary"
                            className="rounded-xl font-black h-11 px-6 shadow-sm border border-slate-200"
                            onClick={() => refetch()}
                        >
                            Generate Report
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white border-none shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-5">
                        <Download size={80} />
                    </div>
                    <CardContent className="pt-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Sales (Inc. VAT)</p>
                        <h3 className="text-2xl font-black text-slate-900 mt-1">
                            {formatCurrency(vatData?.summary?.totalSales || 0)}
                        </h3>
                    </CardContent>
                </Card>

                <Card className="bg-white border-none shadow-sm">
                    <CardContent className="pt-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-emerald-600">Taxable Sales</p>
                        <h3 className="text-2xl font-black text-emerald-700 mt-1">
                            {formatCurrency(vatData?.summary?.taxableAmount || 0)}
                        </h3>
                    </CardContent>
                </Card>

                <Card className="bg-white border-none shadow-sm">
                    <CardContent className="pt-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-blue-600">VAT Collected (13%)</p>
                        <h3 className="text-2xl font-black text-blue-700 mt-1">
                            {formatCurrency(vatData?.summary?.vatAmount || 0)}
                        </h3>
                    </CardContent>
                </Card>

                <Card className="bg-white border-none shadow-sm">
                    <CardContent className="pt-6">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-amber-600">Non-Taxable Sales</p>
                        <h3 className="text-2xl font-black text-amber-700 mt-1">
                            {formatCurrency(vatData?.summary?.nonTaxableAmount || 0)}
                        </h3>
                    </CardContent>
                </Card>
            </div>

            {/* Details Table */}
            <Card className="bg-white border-none shadow-sm overflow-hidden">
                <CardHeader className="bg-slate-900 py-4">
                    <CardTitle className="text-white text-sm font-black flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        SALES PURCHASE BOOK BREAKDOWN
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <p className="text-xs font-bold uppercase">Processing Ledger...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead className="font-black text-[10px] uppercase text-slate-500">Date</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase text-slate-500">Invoice #</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase text-slate-500">Customer / PAN</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase text-slate-500 text-right">Taxable</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase text-slate-500 text-right">VAT (13%)</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase text-slate-500 text-right">Non-Taxable</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase text-slate-500 text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vatData?.report?.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest">
                                                No records for this period
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        vatData?.report?.map((r) => (
                                            <TableRow key={r.invoice_number} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                                                <TableCell className="font-bold text-slate-600 text-xs">
                                                    {format(parseISO(r.created_at), 'MMM dd, yyyy')}
                                                </TableCell>
                                                <TableCell className="font-black text-slate-900 text-xs">
                                                    {r.invoice_number}
                                                </TableCell>
                                                <TableCell className="font-semibold text-slate-500 text-xs italic">
                                                    {r.customer_name || 'Walk-in'}
                                                </TableCell>
                                                <TableCell className="text-right font-black text-slate-700 text-xs">
                                                    {formatCurrency(r.taxable_amount)}
                                                </TableCell>
                                                <TableCell className="text-right font-black text-blue-600 text-xs">
                                                    {formatCurrency(r.vat_amount)}
                                                </TableCell>
                                                <TableCell className="text-right font-black text-slate-700 text-xs">
                                                    {formatCurrency(Number(r.total_amount) - Number(r.taxable_amount) - Number(r.vat_amount))}
                                                </TableCell>
                                                <TableCell className="text-right font-black text-slate-900 text-xs">
                                                    {formatCurrency(r.total_amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default VatReportScreen;
