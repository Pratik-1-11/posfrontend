import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RefreshCw, BookOpen, Calculator, Calendar, Landmark, Users, ShieldCheck, History, ArrowRightLeft } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { format } from 'date-fns';
import { accountingApi, type JournalEntry, type AccountBalance } from '@/services/api/accountingApi';

export const AccountingScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'pnl' | 'journal' | 'trial' | 'balance' | 'aging' | 'audit' | 'reconcile' | 'cashflow'>('pnl');
    const [loading, setLoading] = useState(true);

    // Data State
    const [journals, setJournals] = useState<JournalEntry[]>([]);
    const [pnl, setPnl] = useState<any>(null);
    const [trial, setTrial] = useState<{ balances: AccountBalance[], totalDebit: number, totalCredit: number } | null>(null);
    const [balanceSheet, setBalanceSheet] = useState<any>(null);
    const [aging, setAging] = useState<any[]>([]);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [reconciliations, setReconciliations] = useState<any[]>([]);
    const [cashflow, setCashflow] = useState<any>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'pnl') {
                const data = await accountingApi.getProfitAndLoss();
                setPnl(data);
            } else if (activeTab === 'journal') {
                const data = await accountingApi.getJournalEntries();
                setJournals(data);
            } else if (activeTab === 'trial') {
                const data = await accountingApi.getTrialBalance();
                setTrial(data);
            } else if (activeTab === 'balance') {
                const data = await accountingApi.getBalanceSheet();
                setBalanceSheet(data);
            } else if (activeTab === 'aging') {
                const data = await accountingApi.getCustomerAging();
                setAging(data);
            } else if (activeTab === 'audit') {
                const data = await accountingApi.getAccountingAuditLogs();
                setAuditLogs(data);
            } else if (activeTab === 'reconcile') {
                const data = await accountingApi.getBankReconciliations();
                setReconciliations(data);
            } else if (activeTab === 'cashflow') {
                const data = await accountingApi.getCashFlowStatement();
                setCashflow(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [activeTab]);

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800">Financial Ledger</h1>
                    <p className="text-slate-500">Double-Entry Accounting Records & Reporting</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={loadData} variant="outline" size="sm" disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="flex space-x-2 border-b border-slate-200 overflow-x-auto pb-px">
                <button
                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'pnl' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    onClick={() => setActiveTab('pnl')}
                >
                    <Calculator className="w-4 h-4 inline-block mr-2" />
                    Profit & Loss
                </button>
                <button
                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'balance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    onClick={() => setActiveTab('balance')}
                >
                    <Landmark className="w-4 h-4 inline-block mr-2" />
                    Balance Sheet
                </button>
                <button
                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'trial' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    onClick={() => setActiveTab('trial')}
                >
                    <BookOpen className="w-4 h-4 inline-block mr-2" />
                    Trial Balance
                </button>
                <button
                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'aging' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    onClick={() => setActiveTab('aging')}
                >
                    <Users className="w-4 h-4 inline-block mr-2" />
                    Customer Aging
                </button>
                <button
                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'reconcile' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    onClick={() => setActiveTab('reconcile')}
                >
                    <ShieldCheck className="w-4 h-4 inline-block mr-2" />
                    Reconciliation
                </button>
                <button
                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'cashflow' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    onClick={() => setActiveTab('cashflow')}
                >
                    <ArrowRightLeft className="w-4 h-4 inline-block mr-2" />
                    Cash Flow
                </button>
                <button
                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'audit' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    onClick={() => setActiveTab('audit')}
                >
                    <History className="w-4 h-4 inline-block mr-2" />
                    Audit Logs
                </button>
                <button
                    className={`px-4 py-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === 'journal' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    onClick={() => setActiveTab('journal')}
                >
                    <Calendar className="w-4 h-4 inline-block mr-2" />
                    Journal Book
                </button>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
                </div>
            ) : (
                <>
                    {activeTab === 'cashflow' && cashflow && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card className="bg-slate-50 border-none shadow-sm">
                                    <CardContent className="pt-6">
                                        <p className="text-xs font-bold text-slate-500 uppercase">Starting Cash</p>
                                        <h3 className="text-xl font-black text-slate-900">{formatCurrency(cashflow.summary.beginning_cash)}</h3>
                                    </CardContent>
                                </Card>
                                <Card className="bg-indigo-50 border-none shadow-sm">
                                    <CardContent className="pt-6">
                                        <p className="text-xs font-bold text-indigo-600 uppercase">Net Increase</p>
                                        <h3 className={`text-xl font-black ${cashflow.summary.net_increase_in_cash >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {formatCurrency(cashflow.summary.net_increase_in_cash)}
                                        </h3>
                                    </CardContent>
                                </Card>
                                <Card className="bg-slate-900 border-none shadow-sm">
                                    <CardContent className="pt-6">
                                        <p className="text-xs font-bold text-slate-400 uppercase">Ending Cash</p>
                                        <h3 className="text-xl font-black text-white">{formatCurrency(cashflow.summary.ending_cash)}</h3>
                                    </CardContent>
                                </Card>
                                <Card className="bg-emerald-50 border-none shadow-sm">
                                    <CardContent className="pt-6">
                                        <p className="text-xs font-bold text-emerald-600 uppercase">Net Income</p>
                                        <h3 className="text-xl font-black text-emerald-700">{formatCurrency(cashflow.net_income)}</h3>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <Card className="shadow-sm border-slate-100">
                                    <CardHeader>
                                        <CardTitle className="text-sm">Operating Activities</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-xs font-medium border-b pb-2">
                                                <span>Net Income</span>
                                                <span className="font-bold">{formatCurrency(cashflow.net_income)}</span>
                                            </div>
                                            {cashflow.operating_activities.map((item: any, i: number) => (
                                                <div key={i} className="flex justify-between text-xs py-1">
                                                    <span className="text-slate-500">{item.name}</span>
                                                    <span className={item.change >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                                        {formatCurrency(item.change)}
                                                    </span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between text-sm font-black pt-2 border-t mt-4 text-slate-900">
                                                <span>Net Operating Cash</span>
                                                <span>{formatCurrency(cashflow.summary.net_operating_cash)}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm border-slate-100">
                                    <CardHeader>
                                        <CardTitle className="text-sm">Investing Activities</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3 min-h-[100px]">
                                            {cashflow.investing_activities.length > 0 ? (
                                                cashflow.investing_activities.map((item: any, i: number) => (
                                                    <div key={i} className="flex justify-between text-xs py-1">
                                                        <span className="text-slate-500">{item.name}</span>
                                                        <span className={item.change >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                                            {formatCurrency(item.change)}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-[10px] italic text-slate-400">No investing movements recorded.</p>
                                            )}
                                            <div className="flex justify-between text-sm font-black pt-2 border-t mt-auto text-slate-900">
                                                <span>Net Investing Cash</span>
                                                <span>{formatCurrency(cashflow.summary.net_investing_cash)}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="shadow-sm border-slate-100">
                                    <CardHeader>
                                        <CardTitle className="text-sm">Financing Activities</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3 min-h-[100px]">
                                            {cashflow.financing_activities.length > 0 ? (
                                                cashflow.financing_activities.map((item: any, i: number) => (
                                                    <div key={i} className="flex justify-between text-xs py-1">
                                                        <span className="text-slate-500">{item.name}</span>
                                                        <span className={item.change >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                                            {formatCurrency(item.change)}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-[10px] italic text-slate-400">No financing movements recorded.</p>
                                            )}
                                            <div className="flex justify-between text-sm font-black pt-2 border-t mt-auto text-slate-900">
                                                <span>Net Financing Cash</span>
                                                <span>{formatCurrency(cashflow.summary.net_financing_cash)}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                    {activeTab === 'pnl' && pnl && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Income Statement Overview</CardTitle>
                                    <CardDescription>Consolidated Revenue vs Expenses</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                        <span className="font-medium text-slate-600">Total Revenue (Sales)</span>
                                        <span className="font-semibold">{formatCurrency(pnl.totalRevenue)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-100 text-red-600">
                                        <span className="font-medium">Total Discounts</span>
                                        <span className="font-semibold">- {formatCurrency(Math.abs(pnl.salesDiscount))}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-100 text-slate-600">
                                        <span className="font-medium">Cost of Goods Sold (COGS)</span>
                                        <span className="font-semibold">- {formatCurrency(pnl.totalCOGS)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-3 border-y border-slate-300">
                                        <span className="font-bold text-slate-800">Gross Profit</span>
                                        <span className="font-bold text-slate-800">{formatCurrency(pnl.grossProfit)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-slate-100 text-slate-600">
                                        <span className="font-medium">Operating Expenses</span>
                                        <span className="font-semibold">- {formatCurrency(pnl.totalExpenses)}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-4 bg-slate-50 px-3 rounded-lg mt-4">
                                        <span className="text-lg font-black text-indigo-900">Net Income</span>
                                        <span className={`text-xl font-black ${pnl.netIncome >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                            {formatCurrency(pnl.netIncome)}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {activeTab === 'balance' && balanceSheet && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="bg-emerald-50 border-emerald-100 shadow-none">
                                    <CardContent className="p-6">
                                        <p className="text-xs font-bold text-emerald-600 tracking-wider uppercase mb-1">Total Assets</p>
                                        <h3 className="text-2xl font-black">{formatCurrency(balanceSheet.summary.total_assets)}</h3>
                                    </CardContent>
                                </Card>
                                <Card className="bg-red-50 border-red-100 shadow-none">
                                    <CardContent className="p-6">
                                        <p className="text-xs font-bold text-red-600 tracking-wider uppercase mb-1">Total Liabilities</p>
                                        <h3 className="text-2xl font-black">{formatCurrency(balanceSheet.summary.total_liabilities)}</h3>
                                    </CardContent>
                                </Card>
                                <Card className="bg-blue-50 border-blue-100 shadow-none">
                                    <CardContent className="p-6">
                                        <p className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-1">Total Equity</p>
                                        <h3 className="text-2xl font-black">{formatCurrency(balanceSheet.summary.total_equity)}</h3>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader><CardTitle>Assets</CardTitle></CardHeader>
                                    <CardContent className="space-y-2">
                                        {balanceSheet.assets.map((a: any) => (
                                            <div key={a.code} className="flex justify-between border-b pb-1 text-sm">
                                                <span>[{a.code}] {a.name}</span>
                                                <span className="font-bold">{formatCurrency(a.balance)}</span>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader><CardTitle>Liabilities</CardTitle></CardHeader>
                                        <CardContent className="space-y-2">
                                            {balanceSheet.liabilities.map((l: any) => (
                                                <div key={l.code} className="flex justify-between border-b pb-1 text-sm">
                                                    <span>[{l.code}] {l.name}</span>
                                                    <span className="font-bold">{formatCurrency(l.balance)}</span>
                                                </div>
                                            ))}
                                            {balanceSheet.liabilities.length === 0 && <p className="text-xs italic text-slate-400">No liabilities</p>}
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader><CardTitle>Equity</CardTitle></CardHeader>
                                        <CardContent className="space-y-2">
                                            {balanceSheet.equity.map((e: any) => (
                                                <div key={e.code} className="flex justify-between border-b pb-1 text-sm">
                                                    <span>[{e.code}] {e.name}</span>
                                                    <span className="font-bold">{formatCurrency(e.balance)}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between border-b pb-1 text-sm bg-slate-50 font-medium">
                                                <span>Retained Earnings (Net Income)</span>
                                                <span className="font-bold">{formatCurrency(balanceSheet.retained_earnings)}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'aging' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Accounts Receivable Aging</CardTitle>
                                <CardDescription>Tracking customer credit maturity</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
                                            <tr>
                                                <th className="px-4 py-3">Customer</th>
                                                <th className="px-4 py-3 text-right">0-30 Days</th>
                                                <th className="px-4 py-3 text-right">31-60 Days</th>
                                                <th className="px-4 py-3 text-right">61-90 Days</th>
                                                <th className="px-4 py-3 text-right">91+ Days</th>
                                                <th className="px-4 py-3 text-right font-bold text-slate-900">Total Due</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {aging.map((row, idx) => (
                                                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                                    <td className="px-4 py-3">
                                                        <div className="font-bold text-slate-800">{row.customer_name}</div>
                                                        <div className="text-[10px] text-slate-400">{row.phone}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">{formatCurrency(row.current_0_30)}</td>
                                                    <td className="px-4 py-3 text-right text-amber-600">{formatCurrency(row.overdue_31_60)}</td>
                                                    <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(row.overdue_61_90)}</td>
                                                    <td className="px-4 py-3 text-right text-red-600 font-bold">{formatCurrency(row.overdue_91_plus)}</td>
                                                    <td className="px-4 py-3 text-right font-black text-slate-900">{formatCurrency(row.total_due)}</td>
                                                </tr>
                                            ))}
                                            {aging.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="p-8 text-center text-slate-400 italic">No outstanding credit found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'reconcile' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Bank Reconciliations</CardTitle>
                                <CardDescription>Verifying ledger vs bank statements</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
                                            <tr>
                                                <th className="px-4 py-3">Date</th>
                                                <th className="px-4 py-3">Account</th>
                                                <th className="px-4 py-3 text-right">Start Balance</th>
                                                <th className="px-4 py-3 text-right">End Balance</th>
                                                <th className="px-4 py-3 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reconciliations.map((rec, idx) => (
                                                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                                    <td className="px-4 py-3">{format(new Date(rec.statement_date), 'MMM dd, yyyy')}</td>
                                                    <td className="px-4 py-3 font-medium text-slate-800">
                                                        [{rec.accounts?.code}] {rec.accounts?.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">{formatCurrency(rec.starting_balance)}</td>
                                                    <td className="px-4 py-3 text-right font-bold text-indigo-600">{formatCurrency(rec.ending_balance)}</td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${rec.status === 'finalized' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {rec.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {reconciliations.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="p-8 text-center text-slate-400 italic">No reconciliation history found.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'audit' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Accounting Audit Trail</CardTitle>
                                <CardDescription>Tracking all changes to financial records</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {auditLogs.map((log) => (
                                        <div key={log.id} className="p-4 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${log.action === 'DELETE' ? 'bg-red-100 text-red-700' : log.action === 'INSERT' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {log.action}
                                                    </span>
                                                    <span className="text-sm font-semibold text-slate-700">{log.entity_type}</span>
                                                    <span className="text-xs text-slate-400 font-mono">#{log.entity_id?.slice(0, 8)}</span>
                                                </div>
                                                <span className="text-xs text-slate-400">{format(new Date(log.created_at), 'MMM dd, HH:mm:ss')}</span>
                                            </div>
                                            <div className="text-xs text-slate-600 line-clamp-2 font-mono bg-slate-100 p-2 rounded">
                                                {JSON.stringify(log.changes)}
                                            </div>
                                        </div>
                                    ))}
                                    {auditLogs.length === 0 && (
                                        <div className="p-8 text-center text-slate-400 italic">No audit logs available for this period.</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'trial' && trial && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Trial Balance</CardTitle>
                                <CardDescription>Ensures Debits = Credits</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
                                            <tr>
                                                <th className="px-4 py-3">Account</th>
                                                <th className="px-4 py-3">Type</th>
                                                <th className="px-4 py-3 text-right">Debit Balance</th>
                                                <th className="px-4 py-3 text-right">Credit Balance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {trial.balances.map((row, idx) => (
                                                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                                    <td className="px-4 py-3 font-medium text-slate-800">{row.account}</td>
                                                    <td className="px-4 py-3 text-slate-500 capitalize">{row.type}</td>
                                                    <td className="px-4 py-3 text-right text-emerald-600">
                                                        {row.debit > 0 ? formatCurrency(row.debit) : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-blue-600">
                                                        {row.credit > 0 ? formatCurrency(row.credit) : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-indigo-50 font-bold">
                                                <td colSpan={2} className="px-4 py-3 text-right uppercase tracking-wider text-indigo-900">Totals</td>
                                                <td className="px-4 py-3 text-right text-emerald-700">{formatCurrency(trial.totalDebit)}</td>
                                                <td className="px-4 py-3 text-right text-blue-700">{formatCurrency(trial.totalCredit)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === 'journal' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Journal Entry Logs</CardTitle>
                                <CardDescription>Raw accounting debits and credits representing transactions.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {journals.map((entry) => (
                                        <div key={entry.id} className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex justify-between items-center text-sm">
                                                <div className="space-x-4">
                                                    <span className="font-semibold text-slate-700">{format(new Date(entry.entry_date), 'MMM dd, yyyy')}</span>
                                                    <span className="text-slate-500 uppercase font-mono text-xs px-2 py-0.5 bg-slate-200 rounded">{entry.reference_type}</span>
                                                </div>
                                                <div className="font-medium text-slate-600">
                                                    {entry.description}
                                                </div>
                                            </div>
                                            <table className="w-full text-sm">
                                                <thead className="bg-white border-b border-slate-100 text-slate-500">
                                                    <tr>
                                                        <th className="px-4 py-2 font-medium text-left">Account</th>
                                                        <th className="px-4 py-2 font-medium text-right w-32">Debit</th>
                                                        <th className="px-4 py-2 font-medium text-right w-32">Credit</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {entry.journal_entry_lines.map((line) => (
                                                        <tr key={line.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                                                            <td className={`px-4 py-2 ${line.credit > 0 ? 'pl-8' : ''}`}>
                                                                <span className="font-medium text-slate-800">
                                                                    [{line.accounts?.code}] {line.accounts?.name}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2 text-right font-mono">
                                                                {line.debit > 0 ? formatCurrency(line.debit) : ''}
                                                            </td>
                                                            <td className="px-4 py-2 text-right font-mono">
                                                                {line.credit > 0 ? formatCurrency(line.credit) : ''}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot className="bg-slate-50 border-t border-slate-200">
                                                    <tr>
                                                        <td className="px-4 py-2 text-right font-medium text-slate-600">Total</td>
                                                        <td className="px-4 py-2 text-right font-bold text-slate-800 border-double border-b-4 border-slate-400">
                                                            {formatCurrency(entry.journal_entry_lines.reduce((s, l) => s + Number(l.debit), 0))}
                                                        </td>
                                                        <td className="px-4 py-2 text-right font-bold text-slate-800 border-double border-b-4 border-slate-400">
                                                            {formatCurrency(entry.journal_entry_lines.reduce((s, l) => s + Number(l.credit), 0))}
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            </table>
                                        </div>
                                    ))}
                                    {journals.length === 0 && (
                                        <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg">
                                            No journal entries found for this period.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );
};

export default AccountingScreen;
