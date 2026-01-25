import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/hooks/use-toast';
import { superAdminApi, type UpgradeRequest } from '@/services/api/superAdminApi';
import { FiCheck, FiX, FiInfo, FiLoader } from 'react-icons/fi';
import { format } from 'date-fns';

export const UpgradeRequestsPage: React.FC = () => {
    const [requests, setRequests] = useState<UpgradeRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<UpgradeRequest | null>(null);
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await superAdminApi.getAllUpgradeRequests();
            setRequests(data);
        } catch (error) {
            console.error('Failed to fetch upgrade requests:', error);
            toast({
                title: 'Error',
                description: 'Failed to load upgrade requests.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleReview = async (status: 'approved' | 'rejected') => {
        if (!selectedRequest) return;

        try {
            setSubmitting(true);
            await superAdminApi.reviewUpgradeRequest(selectedRequest.id, {
                status,
                rejection_reason: status === 'rejected' ? rejectionReason : undefined
            });

            toast({
                title: 'Success',
                description: `Request ${status} successfully.`,
            });

            setIsApproveOpen(false);
            setIsRejectOpen(false);
            setSelectedRequest(null);
            setRejectionReason('');
            fetchRequests();
        } catch (error) {
            console.error(`Failed to ${status} request:`, error);
            toast({
                title: 'Error',
                description: `Failed to ${status} request.`,
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return <Badge variant="warning" className="uppercase font-black">Pending</Badge>;
            case 'approved': return <Badge variant="success" className="uppercase font-black">Approved</Badge>;
            case 'rejected': return <Badge variant="destructive" className="uppercase font-black">Rejected</Badge>;
            default: return <Badge variant="secondary" className="uppercase">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <FiLoader className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900">Upgrade Requests</h1>
                    <p className="text-slate-500 font-medium">Manage tenant subscription tier upgrade requests.</p>
                </div>
                <Button onClick={fetchRequests} variant="outline" size="sm" className="gap-2">
                    Refresh
                </Button>
            </div>

            <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest py-4">Tenant</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest py-4">Requested Tier</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest py-4">Cur. Tier</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest py-4">Stores</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest py-4 text-center">Status</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest py-4">Date</TableHead>
                            <TableHead className="font-black text-[10px] uppercase tracking-widest py-4 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-slate-400 font-medium italic">
                                    No upgrade requests found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            requests.map((request: UpgradeRequest) => (
                                <TableRow key={request.id} className="hover:bg-slate-50 transition-colors">
                                    <TableCell className="font-bold py-4">{request.tenant?.name || 'Unknown'}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="uppercase font-black text-primary border-primary/20 bg-primary/5">
                                            {request.requested_tier}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-400 font-medium uppercase text-xs">{request.current_tier}</TableCell>
                                    <TableCell className="font-black text-lg">{request.requested_stores_count || '---'}</TableCell>
                                    <TableCell className="text-center">{getStatusBadge(request.status)}</TableCell>
                                    <TableCell className="text-slate-400 text-xs font-medium">
                                        {format(new Date(request.created_at), 'MMM dd, yyyy HH:mm')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {request.status === 'pending' ? (
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl"
                                                    onClick={() => { setSelectedRequest(request); setIsApproveOpen(true); }}
                                                    title="Approve"
                                                >
                                                    <FiCheck className="w-5 h-5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                                    onClick={() => { setSelectedRequest(request); setIsRejectOpen(true); }}
                                                    title="Reject"
                                                >
                                                    <FiX className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
                                                title="Details"
                                            >
                                                <FiInfo className="w-5 h-5" />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Approve Dialog */}
            <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight text-emerald-600">Approve Upgrade</DialogTitle>
                        <DialogDescription className="font-medium text-slate-500">
                            You are about to approve the upgrade for <span className="font-bold text-slate-900">{selectedRequest?.tenant?.name}</span> to the <span className="font-bold uppercase text-primary">{selectedRequest?.requested_tier}</span> tier.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedRequest?.business_justification && (
                        <div className="bg-slate-50 p-4 rounded-2xl space-y-2">
                            <Label className="uppercase font-black text-[10px] tracking-widest text-slate-400">Business Justification</Label>
                            <p className="text-sm font-medium text-slate-700 italic">"{selectedRequest.business_justification}"</p>
                        </div>
                    )}
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsApproveOpen(false)} disabled={submitting}>Cancel</Button>
                        <Button className="bg-emerald-500 hover:bg-emerald-600 font-black uppercase tracking-widest" onClick={() => handleReview('approved')} disabled={submitting}>
                            {submitting ? <FiLoader className="animate-spin mr-2" /> : <FiCheck className="mr-2" />}
                            Confirm Approval
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight text-red-600">Reject Upgrade</DialogTitle>
                        <DialogDescription className="font-medium text-slate-500">
                            Please provide a reason for rejecting <span className="font-bold text-slate-900">{selectedRequest?.tenant?.name}'s</span> request.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason" className="font-bold">Rejection Reason</Label>
                            <Textarea
                                id="reason"
                                placeholder="e.g., Incomplete business details, Outstanding payments..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="min-h-[100px] rounded-2xl"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsRejectOpen(false)} disabled={submitting}>Cancel</Button>
                        <Button className="bg-red-500 hover:bg-red-600 font-black uppercase tracking-widest" onClick={() => handleReview('rejected')} disabled={submitting || !rejectionReason}>
                            {submitting ? <FiLoader className="animate-spin mr-2" /> : <FiX className="mr-2" />}
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
