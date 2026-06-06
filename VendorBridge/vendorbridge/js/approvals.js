let approvalTab = 'pending';
document.addEventListener('DOMContentLoaded', () => { renderLayout('Approvals'); VB.requireRole(['Manager']); renderApprovals(); });
function renderApprovals() {
  const root = document.getElementById('approvalsRoot');
  const approvals = approvalTab === 'pending' ? ApprovalService.getPending() : ApprovalService.getAll();
  root.innerHTML = `<div class="tabs"><button class="btn tab-btn ${approvalTab==='pending'?'active':''}" onclick="approvalTab='pending';renderApprovals()">Pending Approvals</button><button class="btn tab-btn ${approvalTab==='all'?'active':''}" onclick="approvalTab='all';renderApprovals()">All Approvals</button></div>${approvals.length ? `<div class="table-wrapper"><table><thead><tr><th>Sr No</th><th>RFQ Number</th><th>RFQ Title</th><th>Vendor Name</th><th>Total Amount</th><th>Requested By</th><th>Request Date</th>${approvalTab==='all'?'<th>Status</th>':''}<th>Actions</th></tr></thead><tbody>${approvals.map((a,i)=>approvalRow(a,i)).join('')}</tbody></table></div>` : `<div class="card empty-state"><span class="icon">✅</span>No approvals found.</div>`}`;
}
function approvalRow(a, i) {
  const actions = a.status === 'Pending' ? `<button class="btn btn-sm btn-success" onclick="decision('${a.id}','approve')">Approve</button><button class="btn btn-sm btn-danger" onclick="decision('${a.id}','reject')">Reject</button>` : `<button class="btn btn-sm btn-outline" onclick="showTimeline('${a.id}')">Timeline</button>`;
  return `<tr><td>${i+1}</td><td>${a.rfqNumber}</td><td>${a.rfqTitle}</td><td>${a.vendorName}</td><td>${VB.money(a.totalAmount)}</td><td>${a.requestedBy}</td><td>${VB.date(a.requestedAt)}</td>${approvalTab==='all'?`<td>${VB.badge(a.status)}</td>`:''}<td><div class="actions">${actions}</div></td></tr><tr class="timeline-row"><td colspan="${approvalTab==='all'?9:8}">${timelineHtml(a)}</td></tr>`;
}
function timelineHtml(a) { return `<div class="timeline">${ApprovalService.getTimeline(a).map(s=>`<div class="timeline-step"><span class="timeline-dot ${s.dot}"></span><div><strong>${s.label}</strong><br><span class="muted">${VB.dateTime(s.time)} - ${s.user}</span></div></div>`).join('')}</div>`; }
function decision(id, type) {
  const a = ApprovalService.getById(id), approve = type === 'approve';
  const overlay = VB.modal(approve ? 'Approve Request' : 'Reject Request', `<p><strong>RFQ:</strong> ${a.rfqTitle}</p><p><strong>Vendor:</strong> ${a.vendorName}</p><p><strong>Total:</strong> ${VB.money(a.totalAmount)}</p><div class="form-group"><label class="form-label">Remarks</label><textarea class="form-control" id="remarks" required></textarea></div>`, `<button class="btn btn-outline" data-close>Cancel</button><button class="btn ${approve?'btn-success':'btn-danger'}" id="confirmDecision">Confirm ${approve?'Approve':'Reject'}</button>`);
  overlay.querySelector('#confirmDecision').onclick = () => {
    if (!remarks.value.trim()) { VB.toast('Remarks are required.', 'danger'); return; }
    const u = VB.currentUser();
    const updated = approve ? ApprovalService.approve(id, remarks.value.trim(), u) : ApprovalService.reject(id, remarks.value.trim(), u);
    if (approve) {
      const quote = QuotationService.getById(updated.quotationId), vendor = VendorService.getById(updated.vendorId), po = POService.generateFromApproval(updated, quote, vendor);
      RFQService.updateStatus(updated.rfqId, 'Awarded');
      LogService.add(u.id,u.name,u.role,`Approval approved for ${updated.rfqNumber}`,'Approvals');
      LogService.add(u.id,u.name,u.role,`PO generated: ${po.poNumber}`,'Purchase Orders');
    } else {
      LogService.add(u.id,u.name,u.role,`Approval rejected for ${updated.rfqNumber}`,'Approvals');
    }
    overlay.remove(); VB.toast(`Approval ${approve ? 'approved' : 'rejected'}`); renderApprovals();
  };
}
function showTimeline(id) { VB.modal('Approval Timeline', timelineHtml(ApprovalService.getById(id))); }
