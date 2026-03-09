import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Plus, Minus, CreditCard, Smartphone, DollarSign, Gift, Wallet } from 'lucide-react';

// Simple toast notification system
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  console.log(`${type.toUpperCase()}: ${message}`);
  // In a real implementation, you would use a proper toast library
  alert(`${type === 'success' ? '✅' : '❌'} ${message}`);
};

interface PaymentSplit {
  payment_method: 'cash' | 'card' | 'qr' | 'gift_card' | 'store_credit';
  amount: number;
  transaction_reference?: string;
  card_last_four?: string;
  qr_provider?: 'esewa' | 'khalti' | 'fonepay' | 'other';
  gift_card_number?: string;
  store_credit_reference?: string;
}

interface SplitPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onPaymentComplete: (paymentSplits: PaymentSplit[]) => void;
}

const SplitPaymentModal: React.FC<SplitPaymentModalProps> = ({
  isOpen,
  onClose,
  totalAmount,
  onPaymentComplete
}) => {
  const [paymentSplits, setPaymentSplits] = useState<PaymentSplit[]>([
    { payment_method: 'cash', amount: totalAmount }
  ]);
  const [selectedMethod, setSelectedMethod] = useState<string>('cash');
  const [amount, setAmount] = useState<string>('');
  const [transactionReference, setTransactionReference] = useState<string>('');
  const [cardLastFour, setCardLastFour] = useState<string>('');
  const [qrProvider, setQrProvider] = useState<string>('esewa');
  const [giftCardNumber, setGiftCardNumber] = useState<string>('');
  const [storeCreditReference, setStoreCreditReference] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const remainingAmount = totalAmount - paymentSplits.reduce((sum, split) => sum + split.amount, 0);

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: DollarSign },
    { value: 'card', label: 'Card', icon: CreditCard },
    { value: 'qr', label: 'QR Payment', icon: Smartphone },
    { value: 'gift_card', label: 'Gift Card', icon: Gift },
    { value: 'store_credit', label: 'Store Credit', icon: Wallet }
  ];

  const qrProviders = [
    { value: 'esewa', label: 'eSewa' },
    { value: 'khalti', label: 'Khalti' },
    { value: 'fonepay', label: 'FonePay' },
    { value: 'other', label: 'Other' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ne-NP', {
      style: 'currency',
      currency: 'NPR'
    }).format(amount);
  };

  const addPaymentSplit = () => {
    const splitAmount = parseFloat(amount);
    
    if (!splitAmount || splitAmount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    if (splitAmount > remainingAmount) {
      showToast('Amount exceeds remaining balance', 'error');
      return;
    }

    const newSplit: PaymentSplit = {
      payment_method: selectedMethod as any,
      amount: splitAmount
    };

    // Add method-specific fields
    if (selectedMethod === 'card' && cardLastFour) {
      newSplit.card_last_four = cardLastFour;
    }
    if (selectedMethod === 'qr' && qrProvider !== 'other') {
      newSplit.qr_provider = qrProvider as any;
    }
    if (selectedMethod === 'qr' && transactionReference) {
      newSplit.transaction_reference = transactionReference;
    }
    if (selectedMethod === 'gift_card' && giftCardNumber) {
      newSplit.gift_card_number = giftCardNumber;
    }
    if (selectedMethod === 'store_credit' && storeCreditReference) {
      newSplit.store_credit_reference = storeCreditReference;
    }

    setPaymentSplits([...paymentSplits, newSplit]);
    
    // Reset form
    setAmount('');
    setTransactionReference('');
    setCardLastFour('');
    setGiftCardNumber('');
    setStoreCreditReference('');
    
    showToast('Payment method added');
  };

  const removePaymentSplit = (index: number) => {
    const newSplits = paymentSplits.filter((_, i) => i !== index);
    setPaymentSplits(newSplits);
  };

  const validateGiftCard = async (cardNumber: string) => {
    try {
      const response = await fetch(`/api/gift-cards/validate/${cardNumber}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        if (data.data.current_balance < parseFloat(amount)) {
          showToast(`Insufficient balance. Available: ${formatCurrency(data.data.current_balance)}`, 'error');
          return false;
        }
        return true;
      } else {
        showToast(data.message || 'Gift card validation failed', 'error');
        return false;
      }
    } catch (error) {
      showToast('Failed to validate gift card', 'error');
      return false;
    }
  };

  const validateStoreCredit = async (reference: string) => {
    try {
      const response = await fetch(`/api/store-credit/validate/${reference}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        if (data.data.balance_remaining < parseFloat(amount)) {
          showToast(`Insufficient credit. Available: ${formatCurrency(data.data.balance_remaining)}`, 'error');
          return false;
        }
        return true;
      } else {
        showToast(data.message || 'Store credit validation failed', 'error');
        return false;
      }
    } catch (error) {
      showToast('Failed to validate store credit', 'error');
      return false;
    }
  };

  const processPayment = async () => {
    if (Math.abs(remainingAmount) > 0.01) {
      showToast('Payment amounts must equal total amount', 'error');
      return;
    }

    setLoading(true);
    try {
      // Validate gift cards and store credit if present
      for (const split of paymentSplits) {
        if (split.payment_method === 'gift_card' && split.gift_card_number) {
          const isValid = await validateGiftCard(split.gift_card_number);
          if (!isValid) {
            setLoading(false);
            return;
          }
        }
        if (split.payment_method === 'store_credit' && split.store_credit_reference) {
          const isValid = await validateStoreCredit(split.store_credit_reference);
          if (!isValid) {
            setLoading(false);
            return;
          }
        }
      }

      onPaymentComplete(paymentSplits);
      onClose();
      showToast('Payment processed successfully');
    } catch (error) {
      console.error('Payment processing error:', error);
      showToast('Failed to process payment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentIcon = (method: string) => {
    const paymentMethod = paymentMethods.find(m => m.value === method);
    return paymentMethod ? paymentMethod.icon : DollarSign;
  };

  const getPaymentLabel = (method: string) => {
    const paymentMethod = paymentMethods.find(m => m.value === method);
    return paymentMethod ? paymentMethod.label : method;
  };

  useEffect(() => {
    if (isOpen) {
      setPaymentSplits([{ payment_method: 'cash', amount: totalAmount }]);
      setAmount('');
      setTransactionReference('');
      setCardLastFour('');
      setGiftCardNumber('');
      setStoreCreditReference('');
    }
  }, [isOpen, totalAmount]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Split Payment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Total Amount Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <Label>Total Amount</Label>
                  <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
                </div>
                <div className="text-right">
                  <Label>Remaining</Label>
                  <p className={`text-xl font-semibold ${Math.abs(remainingAmount) < 0.01 ? 'text-green-600' : 'text-orange-600'}`}>
                    {formatCurrency(remainingAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Splits List */}
          <div className="space-y-2">
            <Label>Payment Methods</Label>
            {paymentSplits.map((split, index) => {
              const Icon = getPaymentIcon(split.payment_method);
              return (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <div>
                      <p className="font-medium">{getPaymentLabel(split.payment_method)}</p>
                      {split.card_last_four && (
                        <p className="text-sm text-gray-500">Card ending in {split.card_last_four}</p>
                      )}
                      {split.gift_card_number && (
                        <p className="text-sm text-gray-500">Gift Card: {split.gift_card_number}</p>
                      )}
                      {split.store_credit_reference && (
                        <p className="text-sm text-gray-500">Store Credit: {split.store_credit_reference}</p>
                      )}
                      {split.transaction_reference && (
                        <p className="text-sm text-gray-500">Ref: {split.transaction_reference}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{formatCurrency(split.amount)}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removePaymentSplit(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Payment Method Form */}
          {remainingAmount > 0.01 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentMethods.map((method) => {
                          const Icon = method.icon;
                          return (
                            <SelectItem key={method.value} value={method.value}>
                              <div className="flex items-center space-x-2">
                                <Icon className="h-4 w-4" />
                                <span>{method.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      max={remainingAmount}
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Method-specific fields */}
                {selectedMethod === 'card' && (
                  <div>
                    <Label htmlFor="cardLastFour">Card Last 4 Digits</Label>
                    <Input
                      id="cardLastFour"
                      placeholder="1234"
                      value={cardLastFour}
                      onChange={(e) => setCardLastFour(e.target.value)}
                      maxLength={4}
                    />
                  </div>
                )}

                {selectedMethod === 'qr' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="qrProvider">QR Provider</Label>
                      <Select value={qrProvider} onValueChange={setQrProvider}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {qrProviders.map((provider) => (
                            <SelectItem key={provider.value} value={provider.value}>
                              {provider.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="transactionReference">Transaction ID (Optional)</Label>
                      <Input
                        id="transactionReference"
                        placeholder="Transaction ID"
                        value={transactionReference}
                        onChange={(e) => setTransactionReference(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {selectedMethod === 'gift_card' && (
                  <div>
                    <Label htmlFor="giftCardNumber">Gift Card Number</Label>
                    <Input
                      id="giftCardNumber"
                      placeholder="Enter gift card number"
                      value={giftCardNumber}
                      onChange={(e) => setGiftCardNumber(e.target.value)}
                    />
                  </div>
                )}

                {selectedMethod === 'store_credit' && (
                  <div>
                    <Label htmlFor="storeCreditReference">Store Credit Reference</Label>
                    <Input
                      id="storeCreditReference"
                      placeholder="Enter store credit reference"
                      value={storeCreditReference}
                      onChange={(e) => setStoreCreditReference(e.target.value)}
                    />
                  </div>
                )}

                <Button 
                  onClick={addPaymentSplit}
                  disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > remainingAmount}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={processPayment}
              disabled={Math.abs(remainingAmount) > 0.01 || loading}
            >
              {loading ? 'Processing...' : 'Complete Payment'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SplitPaymentModal;
