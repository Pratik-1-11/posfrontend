import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { ScrollArea } from '../ui/ScrollArea';
import { Search, Plus, Phone, Mail, MapPin, Star, Package, DollarSign } from 'lucide-react';

interface Supplier {
  id: string;
  tenant_id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country: string;
  pan_number?: string;
  gst_number?: string;
  payment_terms: string;
  credit_limit: number;
  current_balance: number;
  is_active: boolean;
  is_preferred: boolean;
  notes?: string;
  rating?: number;
  website?: string;
  created_at: string;
  updated_at: string;
  total_orders?: number;
  total_purchase_value?: number;
  completed_orders_value?: number;
  avg_order_value?: number;
}

interface PurchaseOrder {
  id: string;
  tenant_id: string;
  supplier_id: string;
  order_number: string;
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  status: 'draft' | 'sent' | 'confirmed' | 'partial_received' | 'received' | 'cancelled';
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  payment_status: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  terms_conditions?: string;
  supplier_name?: string;
  supplier_contact?: string;
  created_by_name?: string;
  item_count?: number;
  total_quantity_ordered?: number;
  total_quantity_received?: number;
}

const SupplierManagementScreen: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'suppliers' | 'orders'>('suppliers');

  // Fetch suppliers
  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`/api/suppliers?search=${searchTerm}&active=true`);
      const data = await response.json();

      if (data.status === 'success') {
        setSuppliers(data.data.suppliers);
      } else {
        console.error('Failed to fetch suppliers:', data.message);
      }
    } catch (error) {
      console.error('Fetch suppliers error:', error);
    }
  };

  // Fetch purchase orders
  const fetchPurchaseOrders = async () => {
    try {
      const response = await fetch(`/api/purchase-orders?status=${statusFilter !== 'all' ? statusFilter : ''}`);
      const data = await response.json();

      if (data.status === 'success') {
        setPurchaseOrders(data.data.purchaseOrders);
      } else {
        console.error('Failed to fetch purchase orders:', data.message);
      }
    } catch (error) {
      console.error('Fetch purchase orders error:', error);
    }
  };

  // Get supplier details
  const getSupplierDetails = async (supplierId: string) => {
    try {
      const response = await fetch(`/api/suppliers/${supplierId}`);
      const data = await response.json();

      if (data.status === 'success') {
        setSelectedSupplier(data.data);
        setShowDetailModal(true);
      } else {
        console.error('Failed to fetch supplier details:', data.message);
      }
    } catch (error) {
      console.error('Get supplier details error:', error);
    }
  };

  // Get purchase order details (commented out for now)
  // const getPODetails = async (poId: string) => {
  //   try {
  //     const response = await fetch(`/api/purchase-orders/${poId}`);
  //     const data = await response.json();
  // 
  //     if (data.status === 'success') {
  //       console.log('PO details fetched:', data.data);
  //     } else {
  //       console.error('Failed to fetch PO details:', data.message);
  //     }
  //   } catch (error) {
  //     console.error('Get PO details error:', error);
  //   }
  // };

  // Create supplier
  const createSupplier = async (supplierData: Partial<Supplier>) => {
    try {
      const response = await fetch('/api/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(supplierData)
      });

      const data = await response.json();

      if (data.status === 'success') {
        setShowCreateModal(false);
        fetchSuppliers();
        console.log('Supplier created successfully');
      } else {
        console.error('Failed to create supplier:', data.message);
      }
    } catch (error) {
      console.error('Create supplier error:', error);
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      partial_received: 'bg-yellow-100 text-yellow-800',
      received: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
      unpaid: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  // Get rating stars
  const getRatingStars = (rating?: number) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  useEffect(() => {
    if (activeTab === 'suppliers') {
      fetchSuppliers();
    } else {
      fetchPurchaseOrders();
    }
  }, [activeTab, searchTerm, statusFilter]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Supplier Management</h1>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'suppliers' ? 'default' : 'outline'}
            onClick={() => setActiveTab('suppliers')}
          >
            <Package className="h-4 w-4 mr-2" />
            Suppliers
          </Button>
          <Button
            variant={activeTab === 'orders' ? 'default' : 'outline'}
            onClick={() => setActiveTab('orders')}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Purchase Orders
          </Button>
          {activeTab === 'suppliers' && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Supplier
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={`Search ${activeTab === 'suppliers' ? 'suppliers' : 'purchase orders'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {activeTab === 'orders' && (
              <div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="partial_received">Partial Received</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Tab */}
      {activeTab === 'suppliers' && (
        <Card>
          <CardHeader>
            <CardTitle>Suppliers ({suppliers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {suppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => getSupplierDetails(supplier.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-lg">{supplier.name}</h3>
                          {supplier.is_preferred && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                              Preferred
                            </span>
                          )}
                          {supplier.is_active && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Active
                            </span>
                          )}
                        </div>
                        {supplier.contact_person && (
                          <p className="text-sm text-gray-600">Contact: {supplier.contact_person}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          {supplier.phone && (
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {supplier.phone}
                            </div>
                          )}
                          {supplier.email && (
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {supplier.email}
                            </div>
                          )}
                        </div>
                        {supplier.address && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-3 w-3 mr-1" />
                            {supplier.address}, {supplier.city}
                          </div>
                        )}
                        <div className="flex items-center space-x-4 text-sm">
                          <span>Terms: {supplier.payment_terms}</span>
                          {supplier.rating && getRatingStars(supplier.rating)}
                        </div>
                        {supplier.total_orders && (
                          <div className="text-sm text-gray-600">
                            {supplier.total_orders} orders • Total: {formatCurrency(supplier.total_purchase_value || 0)}
                          </div>
                        )}
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-lg font-semibold">
                          {formatCurrency(supplier.current_balance)}
                        </div>
                        <div className="text-sm text-gray-600">Balance</div>
                        <div className="text-sm text-gray-500">
                          Credit: {formatCurrency(supplier.credit_limit)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Purchase Orders Tab */}
      {activeTab === 'orders' && (
        <Card>
          <CardHeader>
            <CardTitle>Purchase Orders ({purchaseOrders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {purchaseOrders.map((po) => (
                  <div
                    key={po.id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{po.order_number}</h3>
                          <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(po.status)}`}>
                            {po.status.replace('_', ' ')}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${getStatusBadge(po.payment_status)}`}>
                            {po.payment_status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Supplier: {po.supplier_name}</p>
                        {po.supplier_contact && (
                          <p className="text-sm text-gray-600">Contact: {po.supplier_contact}</p>
                        )}
                        <div className="text-sm text-gray-600">
                          {po.item_count} items • {po.total_quantity_ordered} units ordered
                          {po.total_quantity_received && (
                            <span> • {po.total_quantity_received} units received</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Order Date: {formatDate(po.order_date)}
                          {po.expected_delivery_date && (
                            <span className="ml-4">Expected: {formatDate(po.expected_delivery_date)}</span>
                          )}
                          {po.actual_delivery_date && (
                            <span className="ml-4">Received: {formatDate(po.actual_delivery_date)}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-lg font-semibold">
                          {formatCurrency(po.total_amount)}
                        </div>
                        <div className="text-sm text-gray-600">Total</div>
                        <div className="text-sm text-orange-600">
                          Paid: {formatCurrency(po.paid_amount)}
                        </div>
                        <div className="text-sm text-red-600">
                          Balance: {formatCurrency(po.balance_amount)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Supplier Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Supplier Details</DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Supplier Name</Label>
                    <p className="font-semibold">{selectedSupplier.name}</p>
                  </div>
                  <div>
                    <Label>Contact Person</Label>
                    <p>{selectedSupplier.contact_person || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <p>{selectedSupplier.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Mobile</Label>
                    <p>{selectedSupplier.mobile || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p>{selectedSupplier.email || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Website</Label>
                    <p>{selectedSupplier.website || 'N/A'}</p>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <Label>Address</Label>
                  <p className="bg-gray-50 p-2 rounded">
                    {selectedSupplier.address && `${selectedSupplier.address}, `}
                    {selectedSupplier.city && `${selectedSupplier.city}, `}
                    {selectedSupplier.state && `${selectedSupplier.state}, `}
                    {selectedSupplier.postal_code && `${selectedSupplier.postal_code}, `}
                    {selectedSupplier.country}
                  </p>
                </div>

                {/* Financial Info */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Payment Terms</Label>
                    <p>{selectedSupplier.payment_terms}</p>
                  </div>
                  <div>
                    <Label>Credit Limit</Label>
                    <p>{formatCurrency(selectedSupplier.credit_limit)}</p>
                  </div>
                  <div>
                    <Label>Current Balance</Label>
                    <p className={`font-semibold ${selectedSupplier.current_balance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(selectedSupplier.current_balance)}
                    </p>
                  </div>
                </div>

                {/* Tax Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>PAN Number</Label>
                    <p>{selectedSupplier.pan_number || 'N/A'}</p>
                  </div>
                  <div>
                    <Label>GST Number</Label>
                    <p>{selectedSupplier.gst_number || 'N/A'}</p>
                  </div>
                </div>

                {/* Performance */}
                {selectedSupplier.total_orders && (
                  <div>
                    <Label>Performance Summary</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-2xl font-bold">{selectedSupplier.total_orders}</p>
                        <p className="text-sm text-gray-600">Total Orders</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-2xl font-bold">{formatCurrency(selectedSupplier.total_purchase_value || 0)}</p>
                        <p className="text-sm text-gray-600">Total Value</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-2xl font-bold">{formatCurrency(selectedSupplier.avg_order_value || 0)}</p>
                        <p className="text-sm text-gray-600">Avg Order Value</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedSupplier.notes && (
                  <div>
                    <Label>Notes</Label>
                    <p className="bg-gray-50 p-2 rounded">{selectedSupplier.notes}</p>
                  </div>
                )}

                {/* Rating */}
                {selectedSupplier.rating && (
                  <div>
                    <Label>Rating</Label>
                    <div>{getRatingStars(selectedSupplier.rating)}</div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Supplier Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <SupplierForm onSubmit={createSupplier} onCancel={() => setShowCreateModal(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Supplier Form Component
interface SupplierFormProps {
  onSubmit: (supplierData: Partial<Supplier>) => void;
  onCancel: () => void;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Nepal',
    pan_number: '',
    gst_number: '',
    payment_terms: 'NET 30',
    credit_limit: 0,
    is_active: true,
    is_preferred: false,
    notes: '',
    website: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Supplier Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="contact_person">Contact Person</Label>
          <Input
            id="contact_person"
            value={formData.contact_person}
            onChange={(e) => handleChange('contact_person', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="mobile">Mobile</Label>
          <Input
            id="mobile"
            value={formData.mobile}
            onChange={(e) => handleChange('mobile', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => handleChange('state', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="postal_code">Postal Code</Label>
          <Input
            id="postal_code"
            value={formData.postal_code}
            onChange={(e) => handleChange('postal_code', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pan_number">PAN Number</Label>
          <Input
            id="pan_number"
            value={formData.pan_number}
            onChange={(e) => handleChange('pan_number', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="gst_number">GST Number</Label>
          <Input
            id="gst_number"
            value={formData.gst_number}
            onChange={(e) => handleChange('gst_number', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="payment_terms">Payment Terms</Label>
          <Input
            id="payment_terms"
            value={formData.payment_terms}
            onChange={(e) => handleChange('payment_terms', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="credit_limit">Credit Limit</Label>
          <Input
            id="credit_limit"
            type="number"
            value={formData.credit_limit}
            onChange={(e) => handleChange('credit_limit', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          className="w-full p-2 border rounded"
          rows={3}
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Create Supplier
        </Button>
      </div>
    </form>
  );
};

export default SupplierManagementScreen;
