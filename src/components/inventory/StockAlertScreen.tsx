import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Badge } from '../ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { ScrollArea } from '../ui/ScrollArea';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Search,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  XCircle
} from 'lucide-react';

interface StockAlert {
  id: string;
  tenant_id: string;
  branch_id: string;
  product_id: string;
  alert_type: 'low_stock' | 'out_of_stock' | 'excess_stock' | 'expiring_soon';
  alert_level: 'info' | 'warning' | 'critical';
  current_stock: number;
  min_stock_level: number;
  max_stock_level?: number;
  message: string;
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  product_name: string;
  barcode?: string;
  selling_price: number;
  branch_name: string;
  resolved_by_name?: string;
}

interface InventoryRecommendation {
  id: string;
  tenant_id: string;
  branch_id: string;
  product_id: string;
  recommendation_type: 'reorder' | 'increase_stock' | 'decrease_stock' | 'discontinue';
  current_stock: number;
  recommended_quantity: number;
  recommended_action: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reasoning: string;
  estimated_impact?: string;
  cost_impact?: number;
  is_implemented: boolean;
  implemented_by?: string;
  implemented_at?: string;
  implementation_notes?: string;
  created_at: string;
  product_name: string;
  barcode?: string;
  cost_price: number;
  selling_price: number;
  branch_name: string;
}

const StockAlertScreen: React.FC = () => {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [recommendations, setRecommendations] = useState<InventoryRecommendation[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<StockAlert | null>(null);
  const [selectedRecommendation, setSelectedRecommendation] = useState<InventoryRecommendation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [alertTypeFilter, setAlertTypeFilter] = useState<string>('all');
  const [alertLevelFilter, setAlertLevelFilter] = useState<string>('all');
  const [resolvedFilter, setResolvedFilter] = useState<string>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'alerts' | 'recommendations'>('alerts');

  // Fetch stock alerts
  const fetchAlerts = async () => {
    try {
      const params = new URLSearchParams({
        limit: '100'
      });

      if (alertTypeFilter !== 'all') params.append('alert_type', alertTypeFilter);
      if (alertLevelFilter !== 'all') params.append('alert_level', alertLevelFilter);
      if (resolvedFilter !== 'all') params.append('is_resolved', resolvedFilter);
      if (searchTerm) params.append('search', searchTerm);

      const response = await fetch(`/api/stock-alerts?${params}`);
      const data = await response.json();

      if (data.status === 'success') {
        setAlerts(data.data.alerts);
      } else {
        console.error('Failed to fetch alerts:', data.message);
      }
    } catch (error) {
      console.error('Fetch alerts error:', error);
    }
  };

  // Fetch inventory recommendations
  const fetchRecommendations = async () => {
    try {
      const response = await fetch('/api/inventory-recommendations?limit=100');
      const data = await response.json();

      if (data.status === 'success') {
        setRecommendations(data.data.recommendations);
      } else {
        console.error('Failed to fetch recommendations:', data.message);
      }
    } catch (error) {
      console.error('Fetch recommendations error:', error);
    }
  };

  // Fetch alert subscriptions (commented out for now)
  // const fetchSubscriptions = async () => {
  //   try {
  //     const response = await fetch('/api/alert-subscriptions');
  //     const data = await response.json();
  // 
  //     if (data.status === 'success') {
  //       console.log('Subscriptions fetched:', data.data.subscriptions);
  //     } else {
  //       console.error('Failed to fetch subscriptions:', data.message);
  //     }
  //   } catch (error) {
  //     console.error('Fetch subscriptions error:', error);
  //   }
  // };

  // Resolve alert
  const resolveAlert = async (alertId: string, resolutionNotes?: string) => {
    try {
      const response = await fetch(`/api/stock-alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ resolution_notes: resolutionNotes })
      });

      const data = await response.json();

      if (data.status === 'success') {
        fetchAlerts();
        setShowDetailModal(false);
        console.log('Alert resolved successfully');
      } else {
        console.error('Failed to resolve alert:', data.message);
      }
    } catch (error) {
      console.error('Resolve alert error:', error);
    }
  };

  // Implement recommendation
  const implementRecommendation = async (recommendationId: string, implementationNotes?: string) => {
    try {
      const response = await fetch(`/api/inventory-recommendations/${recommendationId}/implement`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ implementation_notes: implementationNotes })
      });

      const data = await response.json();

      if (data.status === 'success') {
        fetchRecommendations();
        setShowRecommendationModal(false);
        console.log('Recommendation implemented successfully');
      } else {
        console.error('Failed to implement recommendation:', data.message);
      }
    } catch (error) {
      console.error('Implement recommendation error:', error);
    }
  };

  // Get alert details
  const getAlertDetails = async (alertId: string) => {
    try {
      const response = await fetch(`/api/stock-alerts/${alertId}`);
      const data = await response.json();

      if (data.status === 'success') {
        setSelectedAlert(data.data);
        setShowDetailModal(true);
      } else {
        console.error('Failed to fetch alert details:', data.message);
      }
    } catch (error) {
      console.error('Get alert details error:', error);
    }
  };

  // Get recommendation details
  const getRecommendationDetails = async (recommendationId: string) => {
    try {
      const response = await fetch(`/api/inventory-recommendations/${recommendationId}`);
      const data = await response.json();

      if (data.status === 'success') {
        setSelectedRecommendation(data.data);
        setShowRecommendationModal(true);
      } else {
        console.error('Failed to fetch recommendation details:', data.message);
      }
    } catch (error) {
      console.error('Get recommendation details error:', error);
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get alert icon
  const getAlertIcon = (alertType: string, alertLevel: string) => {
    if (alertType === 'out_of_stock') return <XCircle className="h-5 w-5 text-red-600" />;
    if (alertLevel === 'critical') return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (alertLevel === 'warning') return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    return <Info className="h-5 w-5 text-blue-600" />;
  };

  // Get alert badge color
  const getAlertBadge = (alertType: string, alertLevel: string) => {
    if (alertType === 'out_of_stock') return 'bg-red-100 text-red-800';
    if (alertLevel === 'critical') return 'bg-red-100 text-red-800';
    if (alertLevel === 'warning') return 'bg-yellow-100 text-yellow-800';
    return 'bg-blue-100 text-blue-800';
  };

  // Get recommendation icon
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'reorder': return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'increase_stock': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'decrease_stock': return <TrendingDown className="h-5 w-5 text-orange-600" />;
      case 'discontinue': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  // Get priority badge color
  const getPriorityBadge = (priority: string) => {
    const colors = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  useEffect(() => {
    if (activeTab === 'alerts') {
      fetchAlerts();
    } else if (activeTab === 'recommendations') {
      fetchRecommendations();
    }
    // Removed subscriptions tab for now
  }, [activeTab, alertTypeFilter, alertLevelFilter, resolvedFilter, searchTerm]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Stock Alerts & Inventory Management</h1>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'alerts' ? 'default' : 'outline'}
            onClick={() => setActiveTab('alerts')}
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Alerts ({alerts.filter(a => !a.is_resolved).length})
          </Button>
          <Button
            variant={activeTab === 'recommendations' ? 'default' : 'outline'}
            onClick={() => setActiveTab('recommendations')}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Recommendations ({recommendations.filter(r => !r.is_implemented).length})
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {activeTab === 'alerts' && (
              <>
                <div>
                  <Select value={alertTypeFilter} onValueChange={setAlertTypeFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Alert Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="low_stock">Low Stock</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                      <SelectItem value="excess_stock">Excess Stock</SelectItem>
                      <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={alertLevelFilter} onValueChange={setAlertLevelFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Alert Level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={resolvedFilter} onValueChange={setResolvedFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="false">Unresolved</SelectItem>
                      <SelectItem value="true">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <Card>
          <CardHeader>
            <CardTitle>Stock Alerts ({alerts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer ${
                      alert.is_resolved ? 'opacity-60' : ''
                    }`}
                    onClick={() => getAlertDetails(alert.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {getAlertIcon(alert.alert_type, alert.alert_level)}
                          <h3 className="font-semibold">{alert.product_name}</h3>
                          <Badge className={getAlertBadge(alert.alert_type, alert.alert_level)}>
                            {alert.alert_type.replace('_', ' ')} - {alert.alert_level}
                          </Badge>
                          {alert.is_resolved && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Resolved
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                        <div className="text-sm text-gray-600">
                          Stock: {alert.current_stock} / Min: {alert.min_stock_level}
                          {alert.max_stock_level && ` / Max: ${alert.max_stock_level}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          Branch: {alert.branch_name} • {formatDate(alert.created_at)}
                        </div>
                        {alert.is_resolved && alert.resolved_by_name && (
                          <div className="text-sm text-green-600">
                            Resolved by {alert.resolved_by_name}
                            {alert.resolved_at && ` on ${formatDate(alert.resolved_at)}`}
                          </div>
                        )}
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-lg font-semibold">
                          {formatCurrency(alert.selling_price)}
                        </div>
                        <div className="text-sm text-gray-600">Price</div>
                        {!alert.is_resolved && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              resolveAlert(alert.id);
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <Card>
          <CardHeader>
            <CardTitle>Inventory Recommendations ({recommendations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {recommendations.map((recommendation) => (
                  <div
                    key={recommendation.id}
                    className={`border rounded-lg p-4 hover:bg-gray-50 cursor-pointer ${
                      recommendation.is_implemented ? 'opacity-60' : ''
                    }`}
                    onClick={() => getRecommendationDetails(recommendation.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {getRecommendationIcon(recommendation.recommendation_type)}
                          <h3 className="font-semibold">{recommendation.product_name}</h3>
                          <Badge className={getPriorityBadge(recommendation.priority)}>
                            {recommendation.priority}
                          </Badge>
                          <Badge variant="outline">
                            {recommendation.recommendation_type.replace('_', ' ')}
                          </Badge>
                          {recommendation.is_implemented && (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Implemented
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{recommendation.recommended_action}</p>
                        <p className="text-sm text-gray-500">{recommendation.reasoning}</p>
                        <div className="text-sm text-gray-600">
                          Current: {recommendation.current_stock} → Recommended: {recommendation.recommended_quantity}
                        </div>
                        <div className="text-sm text-gray-500">
                          Branch: {recommendation.branch_name} • {formatDate(recommendation.created_at)}
                        </div>
                        {recommendation.cost_impact && (
                          <div className="text-sm text-gray-600">
                            Cost Impact: {formatCurrency(recommendation.cost_impact)}
                          </div>
                        )}
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-lg font-semibold">
                          {formatCurrency(recommendation.selling_price)}
                        </div>
                        <div className="text-sm text-gray-600">Price</div>
                        {!recommendation.is_implemented && (
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              implementRecommendation(recommendation.id);
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Implement
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Alert Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Stock Alert Details</DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Product</Label>
                  <p className="font-semibold">{selectedAlert.product_name}</p>
                </div>
                <div>
                  <Label>Barcode</Label>
                  <p>{selectedAlert.barcode || 'N/A'}</p>
                </div>
                <div>
                  <Label>Alert Type</Label>
                  <Badge className={getAlertBadge(selectedAlert.alert_type, selectedAlert.alert_level)}>
                    {selectedAlert.alert_type.replace('_', ' ')} - {selectedAlert.alert_level}
                  </Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <p>{selectedAlert.is_resolved ? 'Resolved' : 'Active'}</p>
                </div>
                <div>
                  <Label>Current Stock</Label>
                  <p className="font-semibold">{selectedAlert.current_stock}</p>
                </div>
                <div>
                  <Label>Min Stock Level</Label>
                  <p>{selectedAlert.min_stock_level}</p>
                </div>
                <div>
                  <Label>Branch</Label>
                  <p>{selectedAlert.branch_name}</p>
                </div>
                <div>
                  <Label>Created At</Label>
                  <p>{formatDate(selectedAlert.created_at)}</p>
                </div>
              </div>

              <div>
                <Label>Message</Label>
                <p className="bg-gray-50 p-2 rounded">{selectedAlert.message}</p>
              </div>

              {selectedAlert.is_resolved ? (
                <div>
                  <Label>Resolution Details</Label>
                  <div className="bg-green-50 p-2 rounded space-y-1">
                    <p>Resolved by: {selectedAlert.resolved_by_name}</p>
                    <p>Resolved at: {selectedAlert.resolved_at && formatDate(selectedAlert.resolved_at)}</p>
                    {selectedAlert.resolution_notes && (
                      <p>Notes: {selectedAlert.resolution_notes}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    onClick={() => resolveAlert(selectedAlert.id, 'Manually resolved')}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Resolved
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Recommendation Detail Modal */}
      <Dialog open={showRecommendationModal} onOpenChange={setShowRecommendationModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inventory Recommendation Details</DialogTitle>
          </DialogHeader>
          {selectedRecommendation && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Product</Label>
                  <p className="font-semibold">{selectedRecommendation.product_name}</p>
                </div>
                <div>
                  <Label>Barcode</Label>
                  <p>{selectedRecommendation.barcode || 'N/A'}</p>
                </div>
                <div>
                  <Label>Recommendation Type</Label>
                  <Badge variant="outline">
                    {selectedRecommendation.recommendation_type.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Badge className={getPriorityBadge(selectedRecommendation.priority)}>
                    {selectedRecommendation.priority}
                  </Badge>
                </div>
                <div>
                  <Label>Current Stock</Label>
                  <p className="font-semibold">{selectedRecommendation.current_stock}</p>
                </div>
                <div>
                  <Label>Recommended Quantity</Label>
                  <p className="font-semibold">{selectedRecommendation.recommended_quantity}</p>
                </div>
                <div>
                  <Label>Branch</Label>
                  <p>{selectedRecommendation.branch_name}</p>
                </div>
                <div>
                  <Label>Created At</Label>
                  <p>{formatDate(selectedRecommendation.created_at)}</p>
                </div>
              </div>

              <div>
                <Label>Recommended Action</Label>
                <p className="bg-gray-50 p-2 rounded">{selectedRecommendation.recommended_action}</p>
              </div>

              <div>
                <Label>Reasoning</Label>
                <p className="bg-gray-50 p-2 rounded">{selectedRecommendation.reasoning}</p>
              </div>

              {selectedRecommendation.cost_impact && (
                <div>
                  <Label>Cost Impact</Label>
                  <p className="font-semibold">{formatCurrency(selectedRecommendation.cost_impact)}</p>
                </div>
              )}

              {selectedRecommendation.is_implemented ? (
                <div>
                  <Label>Implementation Details</Label>
                  <div className="bg-green-50 p-2 rounded space-y-1">
                    <p>Implemented by: {selectedRecommendation.implemented_by}</p>
                    <p>Implemented at: {selectedRecommendation.implemented_at && formatDate(selectedRecommendation.implemented_at)}</p>
                    {selectedRecommendation.implementation_notes && (
                      <p>Notes: {selectedRecommendation.implementation_notes}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    onClick={() => implementRecommendation(selectedRecommendation.id, 'Implemented manually')}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Implemented
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockAlertScreen;
