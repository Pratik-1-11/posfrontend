import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { useToast } from '@/hooks/use-toast';
import { tenantApi, type Branch, type SubscriptionInfo } from '@/services/api/tenantApi';
import { FiPlus, FiMapPin, FiPhone, FiMail, FiCheck, FiBriefcase, FiArrowUpCircle, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { cn } from '@/lib/utils';

export const StoreManagement: React.FC = () => {
    const [stores, setStores] = useState<Branch[]>([]);
    const [subInfo, setSubInfo] = useState<SubscriptionInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [newStore, setNewStore] = useState({ name: '', address: '', phone: '', email: '' });
    const [upgradeRequest, setUpgradeRequest] = useState({ tier: 'pro', justification: '', stores: 5 });

    const { toast } = useToast();

    const fetchData = async () => {
        try {
            setLoading(true);
            const [storesData, subscriptionData] = await Promise.all([
                tenantApi.getBranches(),
                tenantApi.getSubscriptionInfo()
            ]);
            setStores(storesData);
            setSubInfo(subscriptionData);
        } catch (error) {
            console.error('Failed to fetch store data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load store and subscription information.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateStore = async () => {
        if (!newStore.name) return;

        try {
            setSubmitting(true);
            await tenantApi.createBranch(newStore);
            toast({ title: 'Success', description: 'New store branch created successfully.' });
            setIsAddModalOpen(false);
            setNewStore({ name: '', address: '', phone: '', email: '' });
            fetchData();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to create store branch.',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleRequestUpgrade = async () => {
        if (!upgradeRequest.justification) return;

        try {
            setSubmitting(true);
            await tenantApi.requestUpgrade({
                requested_tier: upgradeRequest.tier as any,
                justification: upgradeRequest.justification,
                stores_count: upgradeRequest.stores
            });
            toast({
                title: 'Request Submitted',
                description: 'Your upgrade request has been sent for approval.',
            });
            setIsUpgradeModalOpen(false);
            setUpgradeRequest({ tier: 'pro', justification: '', stores: 5 });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to submit upgrade request.',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <FiLoader className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const limitReached = subInfo && subInfo.current_stores_count >= subInfo.max_stores;

    return (
        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase italic">Store Management</h1>
                    <p className="text-slate-500 font-medium">Manage your retail locations and branch network.</p>
                </div>
                <div className="flex gap-2">
                    {limitReached ? (
                        <Button
                            onClick={() => setIsUpgradeModalOpen(true)}
                            className="bg-primary hover:bg-primary/90 text-white gap-2 font-black uppercase tracking-widest px-6 shadow-lg shadow-primary/20"
                        >
                            <FiArrowUpCircle className="w-5 h-5" /> Upgrade for More Stores
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-black uppercase tracking-widest px-8 shadow-lg shadow-indigo-100"
                        >
                            <FiPlus className="w-5 h-5" /> Add New Branch
                        </Button>
                    )}
                </div>
            </div>

            {/* Subscription Card */}
            <Card className="border-none shadow-2xl bg-indigo-600 text-white rounded-[32px] overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
                <CardContent className="p-8 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 opacity-80 uppercase font-black text-[10px] tracking-[0.2em]">
                            Current Subscription
                        </div>
                        <h2 className="text-4xl font-black uppercase italic tracking-tight flex items-center gap-4">
                            {subInfo?.subscription_tier} Tier
                            {subInfo?.verified && <Badge className="bg-white/20 text-white border-white/20 gap-1"><FiCheck /> Verified Business</Badge>}
                        </h2>
                        <p className="text-white/70 font-medium font-inter max-w-md">
                            Your subscription allows you to manage up to <span className="text-white font-black underline underline-offset-4 decoration-2">{subInfo?.max_stores} stores</span> concurrently.
                        </p>
                    </div>

                    <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/10 text-center min-w-[200px]">
                        <div className="text-5xl font-black mb-1">{subInfo?.current_stores_count} / {subInfo?.max_stores}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Branches Active</div>
                        <div className="mt-4 w-full bg-white/20 h-2 rounded-full overflow-hidden">
                            <div
                                className="bg-white h-full transition-all duration-1000"
                                style={{ width: `${Math.min(((subInfo?.current_stores_count || 0) / (subInfo?.max_stores || 1)) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stores Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stores.map((store) => (
                    <Card key={store.id} className="border-none shadow-xl hover:shadow-2xl transition-all rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm group border border-slate-100 hover:border-indigo-100">
                        <CardHeader className="p-6 pb-0 flex flex-row items-start justify-between">
                            <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all shadow-inner">
                                <FiBriefcase className="w-7 h-7" />
                            </div>
                            <Badge variant={store.is_active ? 'success' : 'secondary'} className="uppercase font-black text-[10px]">
                                {store.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-6 pt-4 space-y-6">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{store.name}</h3>
                                <p className="text-slate-400 text-xs font-mono font-medium truncate">ID: {store.id}</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3 text-slate-500 text-sm font-medium">
                                    <FiMapPin className="mt-1 flex-shrink-0" />
                                    <span>{store.address || 'No address provided'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                                    <FiPhone className="flex-shrink-0" />
                                    <span>{store.phone || 'No phone'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500 text-sm font-medium">
                                    <FiMail className="flex-shrink-0" />
                                    <span>{store.email || 'No email email'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Add Store Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="max-w-md rounded-[32px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase italic tracking-tight">Add New Branch</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="font-bold">Branch Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. Biratnagar Main Store"
                                value={newStore.name}
                                onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                                className="h-12 rounded-xl"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="address" className="font-bold">Address</Label>
                            <Input
                                id="address"
                                placeholder="Main Street, Biratnagar"
                                value={newStore.address}
                                onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
                                className="h-12 rounded-xl"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="font-bold">Phone</Label>
                                <Input
                                    id="phone"
                                    placeholder="+977-..."
                                    value={newStore.phone}
                                    onChange={(e) => setNewStore({ ...newStore, phone: e.target.value })}
                                    className="h-12 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-bold">Email</Label>
                                <Input
                                    id="email"
                                    placeholder="store1@example.com"
                                    value={newStore.email}
                                    onChange={(e) => setNewStore({ ...newStore, email: e.target.value })}
                                    className="h-12 rounded-xl"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                        <Button className="font-black uppercase tracking-widest px-8" onClick={handleCreateStore} disabled={submitting || !newStore.name}>
                            {submitting && <FiLoader className="animate-spin mr-2" />}
                            Create Branch
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Upgrade Modal */}
            <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
                <DialogContent className="max-w-lg rounded-[32px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase italic tracking-tight text-primary">Upgrade Subscription</DialogTitle>
                        <CardDescription className="text-slate-500 font-medium">Unlock multi-store capabilities by upgrading to a higher tier.</CardDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex gap-3">
                            <FiAlertCircle className="text-amber-600 w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-amber-800">Branch Limit Reached</h4>
                                <p className="text-xs text-amber-600 mt-1">Your current plan limit of {subInfo?.max_stores} stores has been reached. Admins must verify upgrades manually.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setUpgradeRequest({ ...upgradeRequest, tier: 'pro', stores: 5 })}
                                className={cn(
                                    "p-4 rounded-2xl border-2 transition-all text-left",
                                    upgradeRequest.tier === 'pro' ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200"
                                )}
                            >
                                <div className="font-black text-xl italic mb-1 uppercase tracking-tight">PRO</div>
                                <div className="text-xs font-bold text-slate-500 mb-4">Up to 5 stores</div>
                                <div className="text-lg font-black text-primary">₹2,999 / mo</div>
                            </button>
                            <button
                                onClick={() => setUpgradeRequest({ ...upgradeRequest, tier: 'enterprise', stores: 100 })}
                                className={cn(
                                    "p-4 rounded-2xl border-2 transition-all text-left",
                                    upgradeRequest.tier === 'enterprise' ? "border-indigo-600 bg-indigo-50" : "border-slate-100 hover:border-slate-200"
                                )}
                            >
                                <div className="font-black text-xl italic mb-1 uppercase tracking-tight text-indigo-600">ENTERPRISE</div>
                                <div className="text-xs font-bold text-slate-500 mb-4">Unlimited stores</div>
                                <div className="text-lg font-black text-indigo-600">Custom Pricing</div>
                            </button>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="justification" className="font-bold">Business Justification</Label>
                            <textarea
                                id="justification"
                                placeholder="Tell us why you need more stores (e.g., expansion to new city...)"
                                value={upgradeRequest.justification}
                                onChange={(e) => setUpgradeRequest({ ...upgradeRequest, justification: e.target.value })}
                                className="w-full min-h-[100px] p-4 rounded-2xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsUpgradeModalOpen(false)}>Maybe Later</Button>
                        <Button className="font-black uppercase tracking-widest px-8 bg-primary hover:bg-primary/90" onClick={handleRequestUpgrade} disabled={submitting || !upgradeRequest.justification}>
                            {submitting && <FiLoader className="animate-spin mr-2" />}
                            Submit Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
