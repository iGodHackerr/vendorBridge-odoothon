const RFQService = {
  getAll: () => StorageService.get('rfqs'),
  getById: (id) => RFQService.getAll().find(r => r.id === id),
  getByVendor: (vendorId) => RFQService.getAll().filter(r => (r.assignedVendorIds || []).includes(vendorId)),
  getOpen: () => RFQService.getAll().filter(r => r.status === 'Open'),
  getAwarded: () => RFQService.getAll().filter(r => r.status === 'Awarded'),
  nextNumber: () => `RFQ-${String(RFQService.getAll().length + 1).padStart(3, '0')}`,
  add: (rfq) => {
    const rfqs = RFQService.getAll();
    const item = { id: StorageService.generateId(), rfqNumber: rfq.rfqNumber || RFQService.nextNumber(), createdAt: new Date().toISOString(), status: 'Open', ...rfq };
    rfqs.push(item); StorageService.set('rfqs', rfqs); return item;
  },
  update: (id, data) => {
    StorageService.set('rfqs', RFQService.getAll().map(r => r.id === id ? { ...r, ...data, updatedAt: new Date().toISOString() } : r));
    return RFQService.getById(id);
  },
  updateStatus: (id, status) => RFQService.update(id, { status })
};
