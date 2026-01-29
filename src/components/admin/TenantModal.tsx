import React, { useState, useEffect } from 'react';
import { X, Save, Building2, Mail, Phone, Tag, Zap } from 'lucide-react';
import { useAdminPlans } from '@/hooks/admin/useAdminPlans';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

interface TenantModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
    initialData?: any;
    mode: 'create' | 'edit';
}

export const TenantModal: React.FC<TenantModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    initialData,
    mode
}) => {
    const { plans, loading: plansLoading } = useAdminPlans();
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        contact_email: '',
        contact_phone: '',
        subscription_tier: 'basic',
        subscription_status: 'trial',
        plan_interval: 'monthly',
        subscription_end_date: '',
        password: '',
        is_active: true
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                slug: initialData.slug || '',
                contact_email: initialData.contact_email || '',
                contact_phone: initialData.contact_phone || '',
                subscription_tier: initialData.subscription_tier || 'basic',
                subscription_status: initialData.subscription_status || 'active',
                plan_interval: initialData.plan_interval || 'monthly',
                subscription_end_date: initialData.subscription_end_date ? new Date(initialData.subscription_end_date).toISOString().split('T')[0] : '',
                password: '',
                is_active: initialData.is_active !== false
            });
        } else {
            setFormData({
                name: '',
                slug: '',
                contact_email: '',
                contact_phone: '',
                subscription_tier: 'basic',
                subscription_status: 'trial',
                plan_interval: 'monthly',
                subscription_end_date: '',
                password: '',
                is_active: true
            });
        }
    }, [initialData, isOpen]);

    // Auto-generate slug from name
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        if (mode === 'create') {
            const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            setFormData(prev => ({ ...prev, name, slug }));
        } else {
            setFormData(prev => ({ ...prev, name }));
        }
    };

    const [successData, setSuccessData] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await onSubmit(formData);
            if (mode === 'create' && (result as any)?.adminSetup) {
                setSuccessData((result as any).adminSetup);
            } else {
                onClose();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    if (successData) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-8 text-center animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-emerald-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Save className="h-10 w-10 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Tenant Ready!</h2>
                    <p className="text-slate-500 font-medium mb-8">Access node initialized successfully.</p>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left space-y-4 mb-8">
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Admin Email</span>
                            <span className="text-sm font-bold text-slate-800">{successData.email}</span>
                        </div>
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Temporary Password</span>
                            <span className="text-sm font-bold text-indigo-600 font-mono bg-indigo-50 px-2 py-1 rounded">{successData.password}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setSuccessData(null);
                            onClose();
                        }}
                        className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                    >
                        Got It, Done
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-8 border-b border-slate-100 flex-shrink-0">
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                        <Building2 className="h-7 w-7 text-indigo-600" />
                        {mode === 'create' ? 'Provision Vendor Node' : 'Update Parameters'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                        <X className="h-7 w-7" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Business Identity</Label>
                        <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                                value={formData.name}
                                onChange={handleNameChange}
                                className="pl-12 h-14 rounded-2xl border-slate-200 focus:ring-indigo-500/20 shadow-none text-base font-bold"
                                placeholder="Store Name"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">System Slug</Label>
                            <div className="relative">
                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    value={formData.slug}
                                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                    className="pl-12 h-12 rounded-2xl border-slate-200 font-mono text-sm bg-slate-50"
                                    placeholder="id-string"
                                    required
                                    disabled={mode === 'edit'}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Plan Tier</Label>
                            <div className="relative">
                                <select
                                    value={formData.subscription_tier}
                                    onChange={(e) => setFormData(prev => ({ ...prev, subscription_tier: e.target.value }))}
                                    className="w-full h-12 px-4 border border-slate-200 rounded-2xl text-sm font-bold appearance-none bg-slate-50 focus:ring-2 focus:ring-indigo-500/20 outline-none pr-10"
                                    disabled={plansLoading}
                                >
                                    {plansLoading ? (
                                        <option>Loading plans...</option>
                                    ) : (
                                        plans.map(plan => (
                                            <option key={plan.id} value={plan.slug}>
                                                {plan.name} ({plan.currency}{plan.price_monthly}/mo)
                                            </option>
                                        ))
                                    )}
                                </select>
                                <Zap className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Billing Cycle</Label>
                            <select
                                value={formData.plan_interval}
                                onChange={(e) => setFormData(prev => ({ ...prev, plan_interval: e.target.value }))}
                                className="w-full h-12 px-4 border border-slate-200 rounded-2xl text-sm font-bold appearance-none bg-slate-50 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                            >
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly (Save 20%)</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Account Status</Label>
                            <select
                                value={formData.subscription_status}
                                onChange={(e) => setFormData(prev => ({ ...prev, subscription_status: e.target.value }))}
                                className="w-full h-12 px-4 border border-slate-200 rounded-2xl text-sm font-bold appearance-none bg-slate-50 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                            >
                                <option value="trial">Trialing</option>
                                <option value="active">Active</option>
                                <option value="suspended">Suspended</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subscription Expiry Date</Label>
                        <div className="relative">
                            <Input
                                type="date"
                                value={formData.subscription_end_date}
                                onChange={(e) => setFormData(prev => ({ ...prev, subscription_end_date: e.target.value }))}
                                className="h-14 rounded-2xl border-slate-200 text-base font-bold bg-slate-50"
                            />
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium px-2">Access will be automatically blocked after this date.</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Primary Controller (Owner)</Label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                                type="email"
                                value={formData.contact_email}
                                onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                                className="pl-12 h-14 rounded-2xl border-slate-200 text-base font-bold"
                                placeholder="admin@store.io"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Service Contact</Label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                                value={formData.contact_phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                                className="pl-12 h-14 rounded-2xl border-slate-200"
                                placeholder="+1 000 000 0000"
                            />
                        </div>
                    </div>

                    {mode === 'create' && (
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Initial Admin Password</Label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center text-slate-400 font-bold">*</div>
                                <Input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    className="pl-12 h-14 rounded-2xl border-slate-200 text-base font-bold"
                                    placeholder="Set temporary password"
                                    required={mode === 'create'}
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium px-2">Leave blank to auto-generate a secure password.</p>
                        </div>
                    )}

                    <div className="pt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">
                            Discard
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 flex items-center"
                        >
                            {loading ? 'Initializing Node...' : (
                                <>
                                    <Save className="h-5 w-5 mr-3" />
                                    {mode === 'create' ? 'Start Merchant Node' : 'Update Record'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
