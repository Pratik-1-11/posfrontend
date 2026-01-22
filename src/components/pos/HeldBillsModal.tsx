import { X, Pause } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

interface HeldBill {
    id: string;
    items: CartItem[];
    timestamp: Date;
}

interface HeldBillsModalProps {
    isOpen: boolean;
    onClose: () => void;
    heldBills: HeldBill[];
    onRetrieve: (billId: string) => void;
    onDelete: (billId: string) => void;
}

export const HeldBillsModal: React.FC<HeldBillsModalProps> = ({
    isOpen,
    onClose,
    heldBills,
    onRetrieve,
    onDelete
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h3 className="text-xl font-black text-slate-800">Held Bills ({heldBills.length})</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {heldBills.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Pause size={48} className="mx-auto mb-2 opacity-50" />
                            <p>No held bills</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {heldBills.map(bill => (
                                <div key={bill.id} className="border rounded p-3 hover:bg-gray-50">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-semibold text-sm">#{bill.id.slice(-6)}</div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(bill.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-sm">
                                                {formatCurrency(bill.items.reduce((sum, item) => sum + item.price * item.quantity, 0))}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {bill.items.reduce((sum, item) => sum + item.quantity, 0)} items
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => onRetrieve(bill.id)}
                                            className="flex-1 px-3 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                                        >
                                            Retrieve
                                        </button>
                                        <button
                                            onClick={() => onDelete(bill.id)}
                                            className="px-3 py-1.5 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
