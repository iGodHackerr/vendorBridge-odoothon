let rfqSearch = '', rfqStatus = 'All';
document.addEventListener('DOMContentLoaded', () => { renderLayout('RFQs'); renderRFQs(); });
function rfqsForUser() {
  const user = VB.currentUser();
  if (user.role === 'Vendor') {
    const vendor = VB.activeVendorForUser(user);
    return vendor ? RFQService.getByVendor(vendor.id) : [];
  }
  if (user.role !== 'Procurement Officer') window.location.href = 'dashboard.html';
  return RFQService.getAll();
}
function renderRFQs() {
  const user = VB.currentUser(), root = document.getElementById('rfqRoot');
  let rfqs = rfqsForUser().filter(r => [r.title,r.product].join(' ').toLowerCase().includes(rfqSearch.toLowerCase()));
  if (rfqStatus !== 'All') rfqs = rfqs.filter(r => r.status === rfqStatus);
  const toolbar = user.role === 'Procurement Officer' ? `<div class="page-toolbar"><div class="toolbar-left"><input class="form-control" id="rfqSearch" placeholder="Search title or product" value="${rfqSearch}"><select class="form-control" id="rfqStatus"><option>All</option><option>Open</option><option>Closed</option><option>Awarded</option></select></div><button class="btn btn-primary" id="createRFQ">Create RFQ</button></div>` : `<div class="card"><h2>My Assigned RFQs</h2><p class="muted">RFQs assigned to your vendor account.</p><a class="btn btn-primary" href="quotations.html">Submit Quotation</a></div>`;
  root.innerHTML = `${toolbar}${rfqs.length ? `<div class="table-wrapper"><table><thead><tr><th>RFQ Number</th><th>Title</th><th>Product</th><th>Quantity</th><th>Deadline</th><th>Assigned Vendors</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rfqs.map(r=>`<tr><td>${r.rfqNumber}</td><td>${r.title}</td><td>${r.product}</td><td>${r.quantity} ${r.unit}</td><td>${VB.date(r.deadline)}</td><td>${(r.assignedVendorIds||[]).length}</td><td>${VB.badge(r.status)}</td><td><div class="actions"><button class="btn btn-sm btn-outline" onclick="viewRFQ('${r.id}')">View</button>${user.role==='Procurement Officer'?`<button class="btn btn-sm btn-outline" onclick="openRFQModal('${r.id}')">Edit</button><button class="btn btn-sm btn-warning" ${r.status!=='Open'?'disabled':''} onclick="closeRFQ('${r.id}')">Close</button>`:''}</div></td></tr>`).join('')}</tbody></table></div>` : `<div class="card empty-state"><span class="icon">📄</span>No RFQs found.</div>`}`;
  if (user.role === 'Procurement Officer') {
    document.getElementById('rfqSearch').oninput = e => { rfqSearch = e.target.value; renderRFQs(); };
    document.getElementById('rfqStatus').value = rfqStatus;
    document.getElementById('rfqStatus').onchange = e => { rfqStatus = e.target.value; renderRFQs(); };
    document.getElementById('createRFQ').onclick = () => openRFQModal();
  }
}
function openRFQModal(id) {
  const r = id ? RFQService.getById(id) : { unit: 'pcs', assignedVendorIds: [] };
  const vendors = VendorService.getActive();
  const body = `<form id="rfqForm"><div class="form-group"><label class="form-label">RFQ Title</label><input class="form-control" id="rTitle" value="${r.title || ''}" required></div><div class="form-group"><label class="form-label">Description</label><textarea class="form-control" id="rDescription">${r.description || ''}</textarea></div><div class="form-group"><label class="form-label">Product or Service Name</label><input class="form-control" id="rProduct" value="${r.product || ''}" required></div><div class="detail-grid"><div class="form-group"><label class="form-label">Quantity</label><input class="form-control" id="rQuantity" type="number" min="1" value="${r.quantity || ''}" required></div><div class="form-group"><label class="form-label">Unit</label><select class="form-control" id="rUnit">${['pcs','kg','litres','hours','metres'].map(u=>`<option ${r.unit===u?'selected':''}>${u}</option>`).join('')}</select></div></div><div class="form-group"><label class="form-label">Required By</label><input class="form-control" id="rDeadline" type="date" value="${r.deadline || ''}" required></div><div class="form-group"><label class="form-label">File Attachment</label><input class="form-control" id="rFile" type="file"></div><div class="form-group"><label class="form-label">Assign Vendors</label><div class="vendor-checklist">${vendors.map(v=>`<label><input type="checkbox" value="${v.id}" ${(r.assignedVendorIds||[]).includes(v.id)?'checked':''}> ${v.name} (${v.category})</label>`).join('')}</div></div></form>`;
  const overlay = VB.modal(id ? 'Edit RFQ' : 'Create RFQ', body, `<button class="btn btn-outline" data-close>Cancel</button><button class="btn btn-primary" id="saveRFQ">Save</button>`);
  overlay.querySelector('#saveRFQ').onclick = () => {
    const selected = [...overlay.querySelectorAll('.vendor-checklist input:checked')].map(i => i.value);
    if (!rTitle.value.trim() || !rProduct.value.trim() || Number(rQuantity.value) <= 0 || !rDeadline.value || new Date(rDeadline.value) <= new Date() || !selected.length) { VB.toast('Please complete RFQ fields with a future date and assigned vendor.', 'danger'); return; }
    const data = { title: rTitle.value.trim(), description: rDescription.value.trim(), product: rProduct.value.trim(), quantity: Number(rQuantity.value), unit: rUnit.value, deadline: rDeadline.value, attachmentName: rFile.files[0]?.name || r.attachmentName || '', assignedVendorIds: selected };
    const saved = id ? RFQService.update(id, data) : RFQService.add(data);
    const u = VB.currentUser(); LogService.add(u.id,u.name,u.role,id?`RFQ updated: ${saved.rfqNumber}`:`RFQ created: ${saved.rfqNumber}`,'RFQ');
    overlay.remove(); VB.toast('RFQ saved successfully'); renderRFQs();
  };
}
function viewRFQ(id) {
  const r = RFQService.getById(id);
  const names = (r.assignedVendorIds||[]).map(id => VendorService.getById(id)?.name).filter(Boolean).join(', ');
  VB.modal('RFQ Details', `<div class="detail-grid"><p><strong>RFQ:</strong> ${r.rfqNumber}</p><p><strong>Status:</strong> ${VB.badge(r.status)}</p><p><strong>Title:</strong> ${r.title}</p><p><strong>Product:</strong> ${r.product}</p><p><strong>Quantity:</strong> ${r.quantity} ${r.unit}</p><p><strong>Deadline:</strong> ${VB.date(r.deadline)}</p><p><strong>Attachment:</strong> ${r.attachmentName || 'None'}</p><p><strong>Vendors:</strong> ${names || 'None'}</p></div><p><strong>Description:</strong><br>${r.description || 'No description'}</p>`);
}
function closeRFQ(id) { const r = RFQService.updateStatus(id, 'Closed'), u = VB.currentUser(); LogService.add(u.id,u.name,u.role,`RFQ closed: ${r.rfqNumber}`,'RFQ'); VB.toast('RFQ closed'); renderRFQs(); }
