document.addEventListener('DOMContentLoaded', () => { renderLayout('Quotation Comparison'); VB.requireRole(['Procurement Officer']); renderComparison(); });
function renderComparison(selectedId = '') {
  const root = document.getElementById('comparisonRoot');
  const rfqs = RFQService.getAll().filter(r => ['Open','Closed'].includes(r.status));
  root.innerHTML = `<div class="card"><label class="form-label">Select RFQ</label><select class="form-control" id="rfqSelect"><option value="">Choose RFQ</option>${rfqs.map(r=>`<option value="${r.id}" ${r.id===selectedId?'selected':''}>${r.rfqNumber} - ${r.title}</option>`).join('')}</select></div><div id="compareTable"></div>`;
  document.getElementById('rfqSelect').onchange = e => renderComparison(e.target.value);
  if (selectedId) renderCompareTable(selectedId);
}
function renderCompareTable(rfqId) {
  const quotes = QuotationService.getByRFQ(rfqId);
  const box = document.getElementById('compareTable');
  if (!quotes.length) { box.innerHTML = `<div class="card empty-state"><span class="icon">⚖️</span>No quotations submitted for selected RFQ.</div>`; return; }
  const minPrice = Math.min(...quotes.map(q => Number(q.totalPrice))), minDays = Math.min(...quotes.map(q => Number(q.deliveryDays)));
  box.innerHTML = `<div class="table-wrapper"><table><thead><tr><th>Vendor Name</th><th>Vendor Category</th><th>Unit Price</th><th>Total Price</th><th>Delivery Days</th><th>Notes</th><th>Vendor Status</th><th>Action</th></tr></thead><tbody>${quotes.map(q=>{ const v = VendorService.getById(q.vendorId) || {}; const low = Number(q.totalPrice)===minPrice, fast = Number(q.deliveryDays)===minDays; const cls = low && fast ? 'row-both' : low ? 'row-lowest' : fast ? 'row-fastest' : ''; return `<tr class="${cls}"><td>${q.vendorName} ${low ? VB.badge('Lowest Price') : ''} ${fast ? VB.badge('Fastest Delivery') : ''}</td><td>${v.category || ''}</td><td>${VB.money(q.unitPrice)}</td><td>${VB.money(q.totalPrice)}</td><td>${q.deliveryDays}</td><td>${q.notes || ''}</td><td>${VB.badge(v.status || 'Active')}</td><td><button class="btn btn-sm btn-primary" onclick="sendApproval('${q.id}')">Select and Send for Approval</button></td></tr>`; }).join('')}</tbody></table></div>`;
}
function sendApproval(quoteId) {
  const q = QuotationService.getById(quoteId), r = RFQService.getById(q.rfqId), u = VB.currentUser();
  VB.confirm('Send for Approval', `Send ${q.vendorName} quotation totaling ${VB.money(q.totalPrice)} for approval?`, () => {
    QuotationService.updateStatus(q.id, 'Selected');
    RFQService.updateStatus(r.id, 'Closed');
    ApprovalService.add({ rfqId: r.id, quotationId: q.id, rfqNumber: r.rfqNumber, rfqTitle: r.title, vendorId: q.vendorId, vendorName: q.vendorName, totalAmount: q.totalPrice, requestedBy: u.name, requestedById: u.id, rfqCreatedAt: r.createdAt, quotationCreatedAt: q.createdAt });
    LogService.add(u.id,u.name,u.role,`Approval requested for ${r.rfqNumber} - ${q.vendorName}`,'Approvals');
    LogService.add(u.id,u.name,u.role,`Comparison selection made for ${r.rfqNumber}`,'Quotations');
    VB.toast('Approval request sent'); window.location.href = 'approvals.html';
  });
}
