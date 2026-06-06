const POService = {
  getAll: () => StorageService.get('purchaseOrders'),
  getById: (id) => POService.getAll().find(p => p.id === id),
  nextNumber: () => `PO-${String(POService.getAll().length + 1).padStart(3, '0')}`,
  generateFromApproval: (approval, quotation, vendor) => {
    const existing = POService.getAll().find(p => p.approvalId === approval.id);
    if (existing) return existing;
    const rfq = RFQService.getById(approval.rfqId);
    const subtotal = Number(quotation.totalPrice);
    const gst = Math.round(subtotal * 0.18);
    const po = {
      id: StorageService.generateId(), poNumber: POService.nextNumber(), approvalId: approval.id, quotationId: quotation.id, rfqId: approval.rfqId,
      vendorId: vendor.id, vendorName: vendor.name, vendorGst: vendor.gst, vendorEmail: vendor.email, vendorPhone: vendor.phone, vendorAddress: vendor.address || 'Registered vendor address',
      itemDescription: rfq.product, quantity: rfq.quantity, unit: rfq.unit, unitPrice: Number(quotation.unitPrice), subtotal, gst, grandTotal: subtotal + gst,
      status: 'Generated', date: new Date().toISOString()
    };
    const pos = POService.getAll(); pos.push(po); StorageService.set('purchaseOrders', pos); return po;
  },
  updateStatus: (id, status) => {
    StorageService.set('purchaseOrders', POService.getAll().map(p => p.id === id ? { ...p, status } : p));
    return POService.getById(id);
  }
};
