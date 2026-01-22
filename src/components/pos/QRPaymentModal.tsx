import { CheckCircle, X } from 'lucide-react';
import type { PaymentMethod } from '@/types/payment';
import { formatCurrency } from '@/utils/currency';

interface QRPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    qrCodeUrl: string;
    paymentMethod: PaymentMethod;
    amount: number;
}

export const QRPaymentModal: React.FC<QRPaymentModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    qrCodeUrl,
    paymentMethod,
    amount
}) => {
    if (!isOpen || !qrCodeUrl) return null;

    const paymentName = paymentMethod === 'fonepay' ? 'FonePay' : 'eSewa';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h3 className="text-xl font-black text-slate-800">Scan to Pay</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="flex flex-col items-center justify-center mb-6">
                    <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 mb-4">
                        <img src={qrCodeUrl} alt={`${paymentName} QR Code`} className="w-64 h-64 object-contain" />
                    </div>

                    <div className="text-center space-y-2">
                        <h4 className="text-xl font-bold text-gray-800">{formatCurrency(amount)}</h4>
                        <p className="text-gray-500 flex items-center justify-center gap-2">
                            Pay with {paymentName}
                        </p>
                    </div>
                </div>

                <div className="p-6 flex flex-col gap-3">
                    <button
                        className="w-full py-4 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
                        onClick={onClose}
                    >
                        Back
                    </button>
                    <button
                        className="w-full py-4 rounded-2xl font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all active:scale-95 flex items-center justify-center"
                        onClick={() => {
                            onClose();
                            onConfirm();
                        }}
                    >
                        <CheckCircle size={18} className="mr-2" />
                        Payment Received
                    </button>
                </div>
            </div>
        </div>
    );
};
