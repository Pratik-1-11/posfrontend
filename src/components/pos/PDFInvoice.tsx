import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Register fonts if needed (optional)
// Font.register({ family: 'Roboto', src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/Roboto-Regular.ttf' });

const styles = StyleSheet.create({
    page: {
        padding: 20,
        fontSize: 10,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 10,
        textAlign: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    shopInfo: {
        fontSize: 9,
        marginBottom: 2,
        color: '#444',
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        borderBottomStyle: 'dashed',
        marginVertical: 10,
    },
    invoiceMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    metaLeft: {
        flexDirection: 'column',
    },
    metaRight: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    metaLabel: {
        color: '#666',
        fontSize: 8,
        marginBottom: 2,
    },
    metaValue: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    table: {
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 0,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
        borderBottomWidth: 0.5,
        borderBottomColor: '#eee',
        minHeight: 24,
        alignItems: 'center',
    },
    tableHeader: {
        backgroundColor: '#f8f9fa',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tableColIndex: { width: '8%', textAlign: 'center' },
    tableColDesc: { width: '42%', textAlign: 'left', paddingLeft: 4 },
    tableColQty: { width: '10%', textAlign: 'center' },
    tableColRate: { width: '20%', textAlign: 'right', paddingRight: 4 },
    tableColAmount: { width: '20%', textAlign: 'right', paddingRight: 4 },

    tableCell: {
        margin: 'auto',
        marginTop: 5,
        marginBottom: 5,
        fontSize: 9,
    },
    summarySection: {
        marginTop: 15,
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 4,
        width: '50%',
    },
    summaryLabel: {
        width: '60%',
        textAlign: 'right',
        paddingRight: 10,
        color: '#444',
    },
    summaryValue: {
        width: '40%',
        textAlign: 'right',
        fontWeight: 'bold',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 5,
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: '#000',
        width: '50%',
    },
    footer: {
        marginTop: 30,
        textAlign: 'center',
        fontSize: 8,
        color: '#666',
    },
    footerMessage: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
});

interface InvoiceItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

interface PDFInvoiceProps {
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    grandTotal: number;
    invoiceNumber: string;
    date: Date;
    settings: any;
    paymentMethod?: string;
    customerName?: string;
    amountReceived?: number;
    change?: number;
}

export const PDFInvoice: React.FC<PDFInvoiceProps> = ({
    items = [],
    subtotal = 0,
    tax = 0,
    grandTotal = 0,
    invoiceNumber = 'N/A',
    date = new Date(),
    settings = {},
    paymentMethod,
    customerName,
    amountReceived,
    change,
}) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>{String(settings?.name || 'VISHMA POS')}</Text>
                <Text style={styles.shopInfo}>{String(settings?.address || '')}</Text>
                <Text style={styles.shopInfo}>
                    {`Phone: ${settings?.phone || 'N/A'} | PAN: ${settings?.pan || 'N/A'}`}
                </Text>
            </View>

            <View style={styles.divider} />

            {/* Meta Info */}
            <View style={styles.invoiceMeta}>
                <View style={styles.metaLeft}>
                    <Text style={styles.metaLabel}>BILL TO</Text>
                    <Text style={styles.metaValue}>{String(customerName || 'Walk-in Customer')}</Text>
                </View>
                <View style={styles.metaRight}>
                    <Text style={styles.metaLabel}>INVOICE NO</Text>
                    <Text style={styles.metaValue}>{String(invoiceNumber)}</Text>
                    <Text style={[styles.metaLabel, { marginTop: 5 }]}>DATE</Text>
                    <Text style={{ fontSize: 9 }}>
                        {format(date instanceof Date ? date : new Date(date), 'MMM dd, yyyy HH:mm')}
                    </Text>
                </View>
            </View>

            {/* Table */}
            <View style={[styles.table, { width: '100%' }]}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                    <View style={styles.tableColIndex}><Text style={styles.tableCell}>#</Text></View>
                    <View style={styles.tableColDesc}><Text style={styles.tableCell}>Item</Text></View>
                    <View style={styles.tableColRate}><Text style={styles.tableCell}>Rate</Text></View>
                    <View style={styles.tableColQty}><Text style={styles.tableCell}>Qty</Text></View>
                    <View style={styles.tableColAmount}><Text style={styles.tableCell}>Amount</Text></View>
                </View>
                {items.map((item, index) => (
                    <View style={styles.tableRow} key={item.id || index}>
                        <View style={styles.tableColIndex}><Text style={styles.tableCell}>{index + 1}</Text></View>
                        <View style={styles.tableColDesc}><Text style={styles.tableCell}>{String(item.name)}</Text></View>
                        <View style={styles.tableColRate}><Text style={styles.tableCell}>{Number(item.price).toFixed(2)}</Text></View>
                        <View style={styles.tableColQty}><Text style={styles.tableCell}>{String(item.quantity)}</Text></View>
                        <View style={styles.tableColAmount}><Text style={styles.tableCell}>{(item.price * item.quantity).toFixed(2)}</Text></View>
                    </View>
                ))}
            </View>

            {/* Summary */}
            <View style={styles.summarySection}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal:</Text>
                    <Text style={styles.summaryValue}>{Number(subtotal).toFixed(2)}</Text>
                </View>
                {tax > 0 && (
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Tax:</Text>
                        <Text style={styles.summaryValue}>{Number(tax).toFixed(2)}</Text>
                    </View>
                )}
                <View style={styles.totalRow}>
                    <Text style={[styles.summaryLabel, { fontWeight: 'bold', fontSize: 12 }]}>TOTAL:</Text>
                    <Text style={[styles.summaryValue, { fontSize: 12 }]}>{Number(grandTotal).toFixed(2)}</Text>
                </View>

                {amountReceived !== undefined && (
                    <View style={[styles.summaryRow, { marginTop: 5 }]}>
                        <Text style={[styles.summaryLabel, { fontSize: 9 }]}>Cash Received:</Text>
                        <Text style={[styles.summaryValue, { fontSize: 9 }]}>{Number(amountReceived).toFixed(2)}</Text>
                    </View>
                )}

                {change !== undefined && change > 0 && (
                    <View style={styles.summaryRow}>
                        <Text style={[styles.summaryLabel, { fontSize: 9 }]}>Change:</Text>
                        <Text style={[styles.summaryValue, { fontSize: 9 }]}>{Number(change).toFixed(2)}</Text>
                    </View>
                )}

                {paymentMethod && (
                    <View style={[styles.summaryRow, { marginTop: 5 }]}>
                        <Text style={[styles.summaryLabel, { fontSize: 8, fontStyle: 'italic' }]}>Paid via:</Text>
                        <Text style={[styles.summaryValue, { fontSize: 8, fontStyle: 'italic', textTransform: 'capitalize' }]}>
                            {String(paymentMethod)}
                        </Text>
                    </View>
                )}
            </View>

            {/* Footer */}
            <View style={{ position: 'absolute', bottom: 30, left: 0, right: 0 }}>
                <View style={styles.footer}>
                    <Text style={styles.footerMessage}>
                        {String(settings?.footerMessage || settings?.receipt?.footer || 'Thank you for shopping!')}
                    </Text>
                    <Text>Generated by Vishma POS</Text>
                </View>
            </View>
        </Page>
    </Document>
);
