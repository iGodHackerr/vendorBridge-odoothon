const ApprovalService = {
  getAll: () => StorageService.get('approvals'),
  getById: (id) => ApprovalService.getAll().find(a => a.id === id),
  getPending: () => ApprovalService.getAll().filter(a => a.status === 'Pending'),
  add: (approval) => {
    const approvals = ApprovalService.getAll();
    const item = { id: StorageService.generateId(), status: 'Pending', requestedAt: new Date().toISOString(), ...approval };
    approvals.push(item); StorageService.set('approvals', approvals); return item;
  },
  approve: (id, remarks, approver) => {
    StorageService.set('approvals', ApprovalService.getAll().map(a => a.id === id ? { ...a, status: 'Approved', remarks, approvedBy: approver.name, approvedById: approver.id, decisionAt: new Date().toISOString() } : a));
    return ApprovalService.getById(id);
  },
  reject: (id, remarks, approver) => {
    StorageService.set('approvals', ApprovalService.getAll().map(a => a.id === id ? { ...a, status: 'Rejected', remarks, approvedBy: approver.name, approvedById: approver.id, decisionAt: new Date().toISOString() } : a));
    return ApprovalService.getById(id);
  },
  getTimeline: (approval) => {
    const pending = approval.status === 'Pending';
    return [
      { label: 'RFQ Created', dot: 'green', time: approval.rfqCreatedAt, user: approval.requestedBy || 'Procurement Officer' },
      { label: 'Quotation Submitted', dot: 'green', time: approval.quotationCreatedAt, user: approval.vendorName },
      { label: 'Sent for Approval', dot: 'green', time: approval.requestedAt, user: approval.requestedBy },
      { label: 'Under Review', dot: pending ? 'orange' : 'green', time: approval.requestedAt, user: 'Manager' },
      { label: 'Final Decision', dot: pending ? 'grey' : approval.status === 'Approved' ? 'green' : 'red', time: approval.decisionAt, user: approval.approvedBy || 'Awaiting decision' }
    ];
  }
};
