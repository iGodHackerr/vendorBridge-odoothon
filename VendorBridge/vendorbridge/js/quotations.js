document.addEventListener('DOMContentLoaded', () => { renderLayout('My Assigned RFQs'); VB.requireRole(['Vendor']); renderQuotations(); });
function renderQuotations() {
  const user = VB.currentUser(), vendor = VB.activeVendorForUser(user), root = document.getElementById('quotationsRoot');
  const rfqs = vendor ? RFQService.getByVendor(vendor.id) : [];
  root.innerHTML = `<div class="card"><h2>My Assigned RFQs</h2><p class="muted">Submit, edit, or view quotations for RFQs assigned to ${vendor?.name || user.name}.</p></div>${rfqs.length ? `<div class="table-wrapper"><table><thead><tr><th>RFQ Number</th><th>Title</th><th>Product</th><th>Quantity</th><th>Deadline</th><th>RFQ Status</th><th>Quotation Status</th><th>Action</th></tr></thead><tbody>${rfqs.map(r=>{ const q = QuotationService.getByRFQ(r.id).find(x=>x.vendorId===vendor.id); const label = !q ? 'Submit Quote' : r.status === 'Open' ? 'Edit Quote' : 'View Quote'; return `<tr><td>${r.rfqNumber}</td><td>${r.title}</td><td>${r.product}</td><td>${r.quantity} ${r.unit}</td><td>${VB.date(r.deadline)}</td><td>${VB.badge(r.status)}</td><td>${q ? VB.badge(q.status) : VB.badge('Pending')}</td><td><button class="btn btn-sm btn-primary" onclick="openQuote('${r.id}','${q?.id || ''}')">${label}</button></td></tr>`; }).join('')}</tbody></table></div>` : `<div class="card empty-state"><span class="icon">💬</span>No assigned RFQs found.</div>`}`;
}
function openQuote(rfqId, quoteId) {
  const r = RFQService.getById(rfqId), q = quoteId ? QuotationService.getById(quoteId) : null, readonly = q && r.status !== 'Open';
  const body = `<form id="quoteForm"><div class="detail-grid"><p><strong>RFQ Title:</strong> ${r.title}</p><p><strong>Product:</strong> ${r.product}</p><p><strong>Quantity:</strong> ${r.quantity} ${r.unit}</p></div><div class="form-group"><label class="form-label">Unit Price in rupees</label><input class="form-control" id="unitPrice" type="number" min="1" value="${q?.unitPrice || ''}" ${readonly?'readonly':''} required></div><div class="form-group"><label class="form-label">Total Price</label><div class="calc-total" id="totalPrice">${VB.money(q?.totalPrice || 0)}</div></div><div class="form-group"><label class="form-label">Delivery Timeline in days</label><input class="form-control" id="deliveryDays" type="number" min="1" value="${q?.deliveryDays || ''}" ${readonly?'readonly':''} required></div><div class="form-group"><label class="form-label">Notes or Comments</label><textarea class="form-control" id="notes" ${readonly?'readonly':''}>${q?.notes || ''}</textarea></div></form>`;
  const overlay = VB.modal(readonly ? 'View Quote' : q ? 'Edit Quote' : 'Submit Quote', body, readonly ? `<button class="btn btn-outline" data-close>Close</button>` : `<button class="btn btn-outline" data-close>Cancel</button><button class="btn btn-primary" id="saveQuote">Submit</button>`);
  const updateTotal = () => overlay.querySelector('#totalPrice').textContent = VB.money(Number(unitPrice.value || 0) * Number(r.quantity));
  overlay.querySelector('#unitPrice').oninput = updateTotal; updateTotal();
  if (!readonly) overlay.querySelector('#saveQuote').onclick = () => {
    if (Number(unitPrice.value) <= 0 || Number(deliveryDays.value) <= 0) { VB.toast('Enter valid price and delivery days.', 'danger'); return; }
    const user = VB.currentUser(), vendor = VB.activeVendorForUser(user);
    const data = { rfqId: r.id, vendorId: vendor.id, vendorName: vendor.name, unitPrice: Number(unitPrice.value), totalPrice: Number(unitPrice.value) * Number(r.quantity), deliveryDays: Number(deliveryDays.value), notes: notes.value.trim(), status: 'Submitted' };
    q ? QuotationService.update(q.id, data) : QuotationService.add(data);
    LogService.add(user.id,user.name,user.role,q?`Quotation edited for ${r.rfqNumber}`:`Quotation submitted for ${r.rfqNumber}`,'Quotations');
    overlay.remove(); VB.toast('Quotation saved'); renderQuotations();
  };
}
