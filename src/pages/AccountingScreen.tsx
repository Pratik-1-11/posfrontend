import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RefreshCw, BookOpen, Calculator, Calendar } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { format } from 'date-fns';
import { accountingApi, type JournalEntry, type AccountBalance } from '@/services/api/accountingApi';

export const AccountingScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'pnl' | 'journal' | 'trial'>('pnl');
    const [loading, setLoading] = useState(true);

    // Data State
    const [journals, setJournals] = useState<JournalEntry[]>([]);
    const [pnl, setPnl] = useState<any>(null);
    const [trial, setTrial] = useState<{ balances: AccountBalance[], totalDebit: number, totalCredit: number } | null>(null);

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
                    <p className="text-slate-500">Double-Entry Accounting Records & PNL</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={loadData} variant="outline" size="sm" disabled={loading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>
            </div>

            <div className="flex space-x-2 border-b border-slate-200">
                <button
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'pnl' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    onClick={() => setActiveTab('pnl')}
                >
                    <Calculator className="w-4 h-4 inline-block mr-2" />
                    Profit & Loss
                </button>
                <button
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'trial' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    onClick={() => setActiveTab('trial')}
                >
                    <BookOpen className="w-4 h-4 inline-block mr-2" />
                    Trial Balance
                </button>
                <button
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'journal' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
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
