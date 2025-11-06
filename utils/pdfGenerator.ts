import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Invoice } from '../types';
import { ptSansNormal } from './pt-sans-normal';

export const generateInvoicePDF = (invoice: Invoice) => {
  const doc = new jsPDF();

  // Add the custom font
  // The VFS file name must be the same as the one used in addFont
  doc.addFileToVFS('PTSans-Regular.ttf', ptSansNormal);
  doc.addFont('PTSans-Regular.ttf', 'PTSans', 'normal');
  doc.setFont('PTSans');

  // Header
  doc.setFontSize(22);
  doc.text(`Накладная #${invoice.id}`, 14, 22);

  doc.setFontSize(12);
  doc.text(`Дата: ${new Date(invoice.createdAt).toLocaleString('ru-RU')}`, 14, 32);

  // Table
  const tableColumn = ["ID товара", "Наименование", "Кол-во", "Цена", "Сумма"];
  const tableRows: (string | number)[][] = [];

  invoice.items.forEach(item => {
    const itemData = [
      item.id,
      item.name,
      item.quantity,
      `${item.price.toLocaleString('ru-RU')} ₽`,
      `${(item.price * item.quantity).toLocaleString('ru-RU')} ₽`
    ];
    tableRows.push(itemData);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    styles: {
      font: 'PTSans',
      fontStyle: 'normal',
    },
    headStyles: {
      fillColor: [38, 50, 56], // dark grey
      textColor: 255
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245] // light grey
    }
  });

  // Total
  // Using (doc as any) is a common way to access properties added by plugins
  const finalY = (doc as any).lastAutoTable.finalY;
  doc.setFontSize(14);
  doc.setFont('PTSans', 'normal');
  doc.text(
    `Итого: ${invoice.total.toLocaleString('ru-RU')} ₽`,
    14,
    finalY + 15
  );

  // Save the PDF
  doc.save(`invoice-${invoice.id}.pdf`);
};
