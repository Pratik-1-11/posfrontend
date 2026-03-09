import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog';
import { ScrollArea } from '../ui/ScrollArea';
import { Search, Plus, Eye, CheckCircle, XCircle, Clock, DollarSign, Package } from 'lucide-react';
import { toast } from 'sonner';

interface ReturnItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  reason: string;
  condition: string;
  exchangeProductId?: string;
}

interface Return {
  id: string;
  tenant_id: string;
  branch_id: string;
  original_sale_id?: string;
  customer_id?: string;
  return_type: 'refund' | 'exchange' | 'store_credit';
  return_reason: string;
  total_refund_amount: number;
  refund_method?: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed' | 'cancelled';
  notes?: string;
  created_at: string;
  processed_at?: string;
  customer_name?: string;
  customer_phone?: string;
  original_invoice?: string;
  item_count: number;
  total_quantity: number;
  created_by_name?: string;
  processed_by_name?: string;
}

interface ReturnDetail extends Return {
  items: Array<{
    id: string;
    product_id: string;
    product_name: string;
    product_barcode?: string;
    quantity: number;
    unit_price: number;
    total_amount: number;
    reason: string;
    condition: string;
    exchange_product_id?: string;
    exchange_product_name?: string;
  }>;
  exchanges: Array<{
    id: string;
    original_product_id: string;
    exchange_product_id: string;
    quantity: number;
    price_difference: number;
    additional_payment: number;
  }>;
}

const ReturnsManagementScreen: React.FC = () => {
  const [returns, setReturns] = useState<Return[]>([]);
  const [selectedReturn, setSelectedReturn] = useState<ReturnDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [returnTypeFilter, setReturnTypeFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Fetch returns
  const fetchReturns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (returnTypeFilter !== 'all') params.append('returnType', returnTypeFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/returns?${params}`);
      const data = await response.json();

      if (data.status === 'success') {
        setReturns(data.data.returns);
        setPagination(data.data.pagination);
      } else {
        toast.error('Failed to fetch returns');
      }
    } catch (error) {
      console.error('Fetch returns error:', error);
      toast.error('Failed to fetch returns');
    } finally {
      setLoading(false);
    }
  };

  // Get return details
  const getReturnDetails = async (returnId: string) => {
    try {
      const response = await fetch(`/api/returns/${returnId}`);
      const data = await response.json();

      if (data.status === 'success') {
        setSelectedReturn(data.data);
        setShowDetailModal(true);
      } else {
        toast.error('Failed to fetch return details');
      }
    } catch (error) {
      console.error('Get return details error:', error);
      toast.error('Failed to fetch return details');
    }
  };

  // Update return status
  const updateReturnStatus = async (returnId: string, status: string, managerReason?: string, refundMethod?: string) => {
    try {
      const response = await fetch(`/api/returns/${returnId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          managerReason,
          refundMethod
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        toast.success(`Return ${status} successfully`);
        fetchReturns();
        if (showDetailModal) {
          getReturnDetails(returnId);
        }
      } else {
        toast.error(data.message || 'Failed to update return status');
      }
    } catch (error) {
      console.error('Update return status error:', error);
      toast.error('Failed to update return status');
    }
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      processed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'processed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ne-NP', {
      style: 'currency',
      currency: 'NPR'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchReturns();
  }, [pagination.page, statusFilter, returnTypeFilter, searchTerm]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Returns Management</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Return
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search by customer, invoice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="returnType">Return Type</Label>
              <Select value={returnTypeFilter} onValueChange={setReturnTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="exchange">Exchange</SelectItem>
                  <SelectItem value="store_credit">Store Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={fetchReturns} disabled={loading}>
                {loading ? 'Loading...' : 'Apply Filters'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Returns List */}
      <Card>
        <CardHeader>
          <CardTitle>Returns ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-4">
              {returns.map((returnItem) => (
                <div
                  key={returnItem.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => getReturnDetails(returnItem.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusBadge(returnItem.status)}>
                          {getStatusIcon(returnItem.status)}
                          <span className="ml-1">{returnItem.status}</span>
                        </Badge>
                        <Badge variant="outline">
                          {returnItem.return_type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {returnItem.original_invoice && (
                          <span>Invoice: {returnItem.original_invoice}</span>
                        )}
                        {returnItem.customer_name && (
                          <span className="ml-4">Customer: {returnItem.customer_name}</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {returnItem.item_count} items • {returnItem.total_quantity} units
                      </div>
                      <div className="text-sm text-gray-500">
                        Created: {formatDate(returnItem.created_at)}
                        {returnItem.processed_at && (
                          <span className="ml-4">Processed: {formatDate(returnItem.processed_at)}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="text-lg font-semibold">
                        {formatCurrency(returnItem.total_refund_amount)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {returnItem.created_by_name}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {returns.length} of {pagination.total} returns
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              <span className="px-3 py-1 text-sm">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= pagination.pages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Return Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Return Details</DialogTitle>
          </DialogHeader>
          {selectedReturn && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6">
                {/* Return Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Return ID</Label>
                    <p className="font-mono text-sm">{selectedReturn.id}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Badge className={getStatusBadge(selectedReturn.status)}>
                      {selectedReturn.status}
                    </Badge>
                  </div>
                  <div>
                    <Label>Return Type</Label>
                    <p>{selectedReturn.return_type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <Label>Total Refund Amount</Label>
                    <p className="font-semibold">{formatCurrency(selectedReturn.total_refund_amount)}</p>
                  </div>
                  <div>
                    <Label>Customer</Label>
                    <p>{selectedReturn.customer_name || 'Walk-in'}</p>
                  </div>
                  <div>
                    <Label>Original Invoice</Label>
                    <p>{selectedReturn.original_invoice || 'N/A'}</p>
                  </div>
                </div>

                {/* Return Reason */}
                {selectedReturn.return_reason && (
                  <div>
                    <Label>Return Reason</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded">{selectedReturn.return_reason}</p>
                  </div>
                )}

                {/* Notes */}
                {selectedReturn.notes && (
                  <div>
                    <Label>Notes</Label>
                    <p className="text-sm bg-gray-50 p-2 rounded">{selectedReturn.notes}</p>
                  </div>
                )}

                {/* Items */}
                <div>
                  <Label>Items ({selectedReturn.items.length})</Label>
                  <div className="space-y-2">
                    {selectedReturn.items.map((item, index) => (
                      <div key={item.id} className="border rounded p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-gray-600">
                              {item.quantity} units × {formatCurrency(item.unit_price)} = {formatCurrency(item.total_amount)}
                            </p>
                            <p className="text-sm text-gray-500">Condition: {item.condition}</p>
                            {item.reason && (
                              <p className="text-sm text-gray-500">Reason: {item.reason}</p>
                            )}
                          </div>
                          {item.exchange_product_name && (
                            <div className="text-right">
                              <p className="text-sm font-medium">Exchange for:</p>
                              <p className="text-sm">{item.exchange_product_name}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                {selectedReturn.status === 'pending' && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => updateReturnStatus(selectedReturn.id, 'approved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => updateReturnStatus(selectedReturn.id, 'rejected')}
                      variant="destructive"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}

                {selectedReturn.status === 'approved' && (
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => updateReturnStatus(selectedReturn.id, 'processed', undefined, 'cash')}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Process Refund (Cash)
                    </Button>
                    <Button
                      onClick={() => updateReturnStatus(selectedReturn.id, 'processed', undefined, 'store_credit')}
                      variant="outline"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      Process (Store Credit)
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReturnsManagementScreen;
