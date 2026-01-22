import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

/**
 * Export data to CSV
 * @param data Array of objects to export
 * @param filename Name of the file to save
 * @param headers Optional custom headers. If not provided, keys of the first object are used.
 */
export const exportToCSV = (data: any[], filename: string, headers?: string[]) => {
    if (!data || data.length === 0) return;

    const dataHeaders = headers || Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        dataHeaders.join(','),
        ...data.map(row =>
            dataHeaders.map(header => {
                const cell = row[header] ?? '';
                // Handle commas in content by wrapping in quotes
                return `"${String(cell).replace(/"/g, '""')}"`;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

/**
 * Export data to PDF
 * @param headers Array of header strings
 * @param data Array of arrays (rows) containing cell data
 * @param filename Name of the file to save
 * @param title Title of the report
 */
export const exportToPDF = (headers: string[], data: any[][], filename: string, title: string = 'Report') => {
    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`, 14, 30);

    // Add Table
    autoTable(doc, {
        head: [headers],
        body: data,
        startY: 40,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });

    doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
};
