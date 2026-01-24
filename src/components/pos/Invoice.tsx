import React, { useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { Download, Printer, X } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { formatToNepaliDate } from '@/utils/date';
import { useSettings } from '@/context/SettingsContext';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { PDFInvoice } from './PDFInvoice';

interface InvoiceItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface InvoiceProps {
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  grandTotal: number;
  invoiceNumber: string;
  date: Date;
  onClose: () => void;
  paymentMethod?: string;
  paymentDetails?: Record<string, number>;
  customerName?: string;
  amountReceived?: number;
  change?: number;
  previousDue?: number;
}

export const Invoice: React.FC<InvoiceProps> = ({
  items,
  subtotal,
  tax,
  grandTotal,
  invoiceNumber,
  date,
  onClose,
  paymentMethod,
  paymentDetails,
  customerName,
  amountReceived,
  change,
  previousDue,
}) => {
  const { settings } = useSettings();

  const handlePrint = () => {
    // Force a reflow before printing to ensure all styles are applied
    document.body.offsetHeight;
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Handle print styles
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'print-styles';
    style.textContent = `
      @page {
        size: 80mm auto; /* Thermal printer width */
        margin: 0;
      }

      @media print {
        body * {
          visibility: hidden;
        }

        /* Reset the modal overlay styles for print */
        .invoice-modal-overlay {
          position: absolute !important;
          left: 0;
          top: 0;
          width: 100% !important;
          height: 100% !important;
          background: none !important;
          z-index: 9999 !important;
          visibility: visible !important;
          overflow: visible !important;
          display: block !important;
        }

        /* Reset the modal content wrapper styles */
        .invoice-modal-content {
          position: static !important;
          width: 100% !important;
          height: auto !important;
          max-width: none !important;
          max-height: none !important;
          background: none !important;
          overflow: visible !important;
          visibility: visible !important;
          padding: 0 !important;
          margin: 0 !important;
          box-shadow: none !important;
        }

        /* Show only the invoice container */
        .print-invoice {
          visibility: visible !important;
          position: relative !important;
          left: 0 !important;
          top: 0 !important;
          width: 78mm !important; /* Slightly less than 80mm to prevent overflow */
          margin: 0 auto !important;
          padding: 5mm !important;
          box-shadow: none !important;
          border: none !important;
          background: white !important;
          font-size: 12px !important;
        }

        /* Ensure all children of the invoice are visible */
        .print-invoice * {
          visibility: visible !important;
        }

        /* Prevent page breaks inside important elements */
        .invoice-content {
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .invoice-table {
          page-break-inside: avoid;
          break-inside: avoid;
        }

        /* Ensure proper spacing */
        .invoice-summary {
          page-break-before: avoid;
          page-break-after: avoid;
          break-inside: avoid;
        }

        /* Hide non-printable elements */
        .no-print {
          display: none !important;
        }

        /* Print-specific styles */
        .print-invoice {
          font-family: 'Courier New', Courier, monospace; /* Monospace looks better on thermal */
          line-height: 1.2;
          color: #000 !important;
          background: #fff !important;
        }

        /* Table styles */
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 5px 0;
        }

        th, td {
          border-bottom: 1px dashed #000; /* Dashed lines for thermal look */
          padding: 4px 2px;
          text-align: left;
          color: #000 !important;
          font-size: 11px;
        }

        th {
          border-top: 1px dashed #000;
          border-bottom: 1px dashed #000;
          font-weight: bold;
        }
        
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        
        /* Hide complex headers for thermal */
        .full-header { display: none; }
        .thermal-header { display: block !important; text-align: center; margin-bottom: 10px; }
      }
      
      /* Screen styles */
      .thermal-header { display: none; }
    `;
    document.head.appendChild(style);

    return () => {
      const styleElement = document.getElementById('print-styles');
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  // ... (in the Invoice component, replace the handleDownload and button section)

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl mx-auto my-8 print:shadow-none print:p-0 print:max-w-full print:my-0 print:rounded-none print-invoice">
      {/* Header with actions - hidden when printing */}
      <div className="flex justify-end items-start mb-8 no-print">
        <div className="flex gap-2">
          <PDFDownloadLink
            document={
              <PDFInvoice
                items={items}
                subtotal={subtotal}
                tax={tax}
                grandTotal={grandTotal}
                invoiceNumber={invoiceNumber}
                date={date}
                settings={settings}
                paymentMethod={paymentMethod}
                customerName={customerName}
                amountReceived={amountReceived}
                change={change}
              />
            }
            fileName={`invoice-${invoiceNumber}.pdf`}
          >
            {({ loading }) => (
              <Button variant="outline" size="sm" disabled={loading}>
                <Download className="mr-2 h-4 w-4" />
                {loading ? 'Generating...' : 'Download PDF'}
              </Button>
            )}
          </PDFDownloadLink>

          <Button onClick={handlePrint} size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="ghost" onClick={onClose} size="sm" className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="invoice-content">
        {/* Thermal Header (Visible only on print) */}
        <div className="thermal-header">
          <h1 className="text-xl font-bold uppercase tracking-tight">{settings.name}</h1>
          <p className="text-[10px]">{settings.address}</p>
          <p className="text-[10px]">Tel: {settings.phone}</p>
          <p className="text-[10px]">PAN: {settings.pan}</p>
          <div className="border-b border-dashed border-black my-2"></div>
        </div>

        {/* Store and Invoice Info (Screen only) */}
        <div className="flex justify-between items-start mb-8 no-print">
          <div>
            <h1 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">{settings.name}</h1>
            <p className="text-slate-500 font-medium">{settings.address}</p>
            <p className="text-slate-500 font-medium">Phone: {settings.phone}</p>
            <p className="text-slate-500 font-medium">PAN: {settings.pan}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-blue-600">INVOICE</h2>
            <p className="text-gray-700">#{invoiceNumber}</p>
            <p className="text-gray-700">Date: {format(date, 'MMM dd, yyyy')}</p>
            <p className="text-gray-700">BS: {formatToNepaliDate(date)}</p>
          </div>
        </div>

        {/* Invoice Meta for Print */}
        <div className="hidden print:block mb-2 text-xs">
          <div className="flex justify-between">
            <span>Inv: #{invoiceNumber}</span>
            <span>{format(date, 'dd/MM/yyyy')}</span>
          </div>
          <div className="flex justify-between">
            <span>Miti: {formatToNepaliDate(date)}</span>
            <span>Time: {format(date, 'HH:mm')}</span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-8 bg-gray-50 p-4 rounded-lg print:p-0 print:mb-2 print:bg-transparent">
          <div className="grid grid-cols-2 gap-4 print:block">
            <div className="print:mb-1">
              <span className="font-semibold text-gray-700 print:font-normal">Bill To: </span>
              <span className="font-medium tracking-tight uppercase truncate">{customerName || 'Walk-in Customer'}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="invoice-table mb-8 print:mb-2">
          <table>
            <thead className="bg-gray-100 print:bg-transparent">
              <tr>
                <th className="print:w-1/12">#</th>
                <th className="print:w-5/12">Item</th>
                <th className="text-right print:w-2/12">Rate</th>
                <th className="text-center print:w-1/12">Qty</th>
                <th className="text-right print:w-3/12">Amt</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id} className="border-t print:border-none">
                  <td className="p-2 print:p-1">{index + 1}</td>
                  <td className="p-2 print:p-1">
                    <div className="font-medium">{item.name}</div>
                  </td>
                  <td className="p-2 text-right print:p-1">{item.price}</td>
                  <td className="p-2 text-center print:p-1">{item.quantity}</td>
                  <td className="p-2 text-right font-medium print:p-1">
                    {item.price * item.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="invoice-summary ml-auto print:w-full" style={{ maxWidth: '300px' }}>
          <div className="flex justify-between py-2 border-b print:py-1 print:border-dashed print:border-black">
            <span>Subtotal:</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          {tax > 0 && (
            <div className="flex justify-between py-2 border-b print:py-1 print:border-dashed print:border-black">
              <span>Tax:</span>
              <span className="font-medium">{formatCurrency(tax)}</span>
            </div>
          )}
          <div className="flex justify-between py-3 mt-2 text-lg font-bold print:text-sm print:mt-1 border-b border-double border-slate-300 print:border-black">
            <span>Total:</span>
            <span className="text-blue-600 print:text-black">{formatCurrency(grandTotal)}</span>
          </div>

          {/* Cash/Change/Due Info */}
          <div className="mt-2 space-y-1 text-xs border-b border-dashed border-slate-200 pb-2 print:mt-1 print:pb-1 print:border-black">
            {amountReceived !== undefined && amountReceived > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500 print:text-black">Cash Received:</span>
                <span className="font-bold tracking-tighter">{formatCurrency(amountReceived)}</span>
              </div>
            )}
            {change !== undefined && change > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-500 print:text-black">Change:</span>
                <span className="font-bold tracking-tighter">{formatCurrency(change)}</span>
              </div>
            )}
            {previousDue !== undefined && previousDue > 0 && (
              <div className="flex justify-between text-orange-600 print:text-black italic">
                <span>Previous Due:</span>
                <span className="font-bold tracking-tighter">{formatCurrency(previousDue)}</span>
              </div>
            )}
          </div>

          {/* Payment Breakdown */}
          {paymentMethod === 'mixed' && paymentDetails && (
            <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-lg print:bg-transparent print:border-none print:mt-1 print:p-0">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 print:text-[8px] print:mb-1">Payment Breakdown</p>
              {Object.entries(paymentDetails).map(([method, amount]) => (
                <div key={method} className="flex justify-between text-xs py-1 border-b border-slate-100 last:border-0 print:py-0.5 print:text-[10px]">
                  <span className="capitalize">{method}:</span>
                  <span className="font-bold">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          )}

          {paymentMethod && paymentMethod !== 'mixed' && (
            <div className="mt-2 text-right">
              <span className="text-[10px] text-slate-400 uppercase font-black print:text-[8px]">Paid via: </span>
              <span className="text-xs font-bold capitalize print:text-[10px]">{paymentMethod}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-600 print:mt-4 print:pt-2 print:border-t print:border-dashed print:border-black">
          <p className="font-bold">{settings.footerMessage || settings.receipt?.footer || 'Thank you for shopping!'}</p>
          <p className="mt-1 print:hidden">If you have any questions about this invoice, please contact us.</p>
          <div className="mt-2 text-xs text-gray-500 print:text-[10px]">
            Software by: Pratik Devkota
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;