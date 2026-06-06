const InvoiceService = {
  getAll: () => StorageService.get('invoices'),
  getById: (id) => InvoiceService.getAll().find(i => i.id === id),
  nextNumber: () => `INV-${String(InvoiceService.getAll().length + 1).padStart(3, '0')}`,
  generateFromPO: (po) => {
    const existing = InvoiceService.getAll().find(i => i.poId === po.id);
    if (existing) return existing;
    const invoice = { id: StorageService.generateId(), invoiceNumber: InvoiceService.nextNumber(), poId: po.id, poNumber: po.poNumber, vendorId: po.vendorId, vendorName: po.vendorName, vendorEmail: po.vendorEmail, vendorGst: po.vendorGst, itemDescription: po.itemDescription, quantity: po.quantity, unit: po.unit, unitPrice: po.unitPrice, subtotal: po.subtotal, gst: po.gst, grandTotal: po.grandTotal, status: 'Generated', date: new Date().toISOString(), dueDate: new Date(Date.now() + 15 * 86400000).toISOString() };
    const invoices = InvoiceService.getAll(); invoices.push(invoice); StorageService.set('invoices', invoices); return invoice;
  },
  markSent: (id) => {
    StorageService.set('invoices', InvoiceService.getAll().map(i => i.id === id ? { ...i, status: 'Sent', sentAt: new Date().toISOString() } : i));
    return InvoiceService.getById(id);
  },
  markPaid: (id) => {
    StorageService.set('invoices', InvoiceService.getAll().map(i => i.id === id ? { ...i, status: 'Paid', paidAt: new Date().toISOString() } : i));
    return InvoiceService.getById(id);
  }
};
