const VendorService = {
  getAll: () => StorageService.get('vendors'),
  getById: (id) => VendorService.getAll().find(v => v.id === id),
  getActive: () => VendorService.getAll().filter(v => v.status === 'Active'),
  add: (vendor) => {
    const vendors = VendorService.getAll();
    const item = { id: StorageService.generateId(), createdAt: new Date().toISOString(), ...vendor };
    vendors.push(item); StorageService.set('vendors', vendors); return item;
  },
  update: (id, data) => {
    const vendors = VendorService.getAll().map(v => v.id === id ? { ...v, ...data, updatedAt: new Date().toISOString() } : v);
    StorageService.set('vendors', vendors); return VendorService.getById(id);
  },
  delete: (id) => StorageService.set('vendors', VendorService.getAll().filter(v => v.id !== id)),
  toggleStatus: (id) => {
    const vendor = VendorService.getById(id);
    return VendorService.update(id, { status: vendor.status === 'Active' ? 'Inactive' : 'Active' });
  }
};
