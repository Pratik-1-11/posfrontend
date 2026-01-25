import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tenantApi, type Branch } from '@/services/api/tenantApi';
import { FiBriefcase, FiChevronDown, FiCheck, FiMapPin } from 'react-icons/fi';
import { cn } from '@/lib/utils';

export const StoreSelector: React.FC = () => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBranches = async () => {
            try {
                const data = await tenantApi.getBranches();
                setBranches(data);

                // Load saved branch from localStorage or default to first
                const savedBranchId = localStorage.getItem('pos_current_branch_id');
                const savedBranch = data.find(b => b.id === savedBranchId);

                if (savedBranch) {
                    setCurrentBranch(savedBranch);
                } else if (data.length > 0) {
                    setCurrentBranch(data[0]);
                    localStorage.setItem('pos_current_branch_id', data[0].id);
                }
            } catch (error) {
                console.error('Failed to fetch branches:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBranches();
    }, []);

    const handleSelectBranch = (branch: Branch) => {
        setCurrentBranch(branch);
        localStorage.setItem('pos_current_branch_id', branch.id);
        setIsOpen(false);
        // Dispatch custom event so other components can react
        window.dispatchEvent(new CustomEvent('pos_branch_changed', { detail: branch }));

        // Optionally redirect to dashboard or pos
        toast_notify();
    };

    const toast_notify = () => {
        // Since I don't have direct access to useToast here easily without injecting it
        // I'll just rely on the UI update for now or implement a quick success indicator
    };

    if (loading || branches.length <= 1) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all border border-slate-200 group"
            >
                <div className="h-8 w-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100 font-bold text-sm">
                    <FiBriefcase className="w-4 h-4" />
                </div>
                <div className="text-left hidden md:block">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Active Store</div>
                    <div className="text-sm font-bold text-slate-900 leading-none truncate max-w-[150px]">
                        {currentBranch?.name || 'Select Store'}
                    </div>
                </div>
                <FiChevronDown className={cn("text-slate-400 transition-transform", isOpen && "rotate-180")} />
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Your Locations</span>
                        </div>
                        <div className="p-2 space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                            {branches.map(branch => (
                                <button
                                    key={branch.id}
                                    onClick={() => handleSelectBranch(branch)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-3 rounded-2xl transition-all group",
                                        currentBranch?.id === branch.id
                                            ? "bg-indigo-50 text-indigo-700"
                                            : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                                    )}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden text-left">
                                        <div className={cn(
                                            "h-10 w-10 rounded-xl flex items-center justify-center font-bold",
                                            currentBranch?.id === branch.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                                        )}>
                                            {branch.name.charAt(0)}
                                        </div>
                                        <div className="truncate">
                                            <div className="font-bold text-sm truncate">{branch.name}</div>
                                            <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 truncate">
                                                <FiMapPin className="text-[8px]" /> {branch.address || 'No address'}
                                            </div>
                                        </div>
                                    </div>
                                    {currentBranch?.id === branch.id && <FiCheck className="w-4 h-4 text-indigo-600" />}
                                </button>
                            ))}
                        </div>
                        <div className="p-3 border-t border-slate-50 bg-slate-50/30">
                            <button
                                onClick={() => { navigate('/stores'); setIsOpen(false); }}
                                className="w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-all"
                            >
                                Manage All Stores
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
