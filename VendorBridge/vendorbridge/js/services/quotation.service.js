const QuotationService = {
  getAll: () => StorageService.get('quotations'),
  getById: (id) => QuotationService.getAll().find(q => q.id === id),
  getByRFQ: (rfqId) => QuotationService.getAll().filter(q => q.rfqId === rfqId),
  getByVendor: (vendorId) => QuotationService.getAll().filter(q => q.vendorId === vendorId),
  add: (quote) => {
    const quotes = QuotationService.getAll();
    const item = { id: StorageService.generateId(), status: 'Submitted', createdAt: new Date().toISOString(), ...quote };
    quotes.push(item); StorageService.set('quotations', quotes); return item;
  },
  update: (id, data) => {
    StorageService.set('quotations', QuotationService.getAll().map(q => q.id === id ? { ...q, ...data, updatedAt: new Date().toISOString() } : q));
    return QuotationService.getById(id);
  },
  updateStatus: (id, status) => QuotationService.update(id, { status })
};
