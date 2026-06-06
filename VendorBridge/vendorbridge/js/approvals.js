let approvalTab = 'pending';

document.addEventListener('DOMContentLoaded', () => {
  renderLayout('Approvals');
  VB.requireRole(['Manager']);
  renderApprovals();
});

function renderApprovals() {
  const root = document.getElementById('approvalsRoot');
  const approvals = approvalTab === 'pending' ? ApprovalService.getPending() : ApprovalService.getAll();

  root.innerHTML = `
    <div class="tabs">
      <button class="btn tab-btn ${approvalTab === 'pending' ? 'active' : ''}" onclick="approvalTab='pending';renderApprovals()">Pending Approvals</button>
      <button class="btn tab-btn ${approvalTab === 'all' ? 'active' : ''}" onclick="approvalTab='all';renderApprovals()">All Approvals</button>
    </div>
    ${approvals.length ? `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Sr No</th>
              <th>RFQ Number</th>
              <th>RFQ Title</th>
              <th>Vendor Name</th>
              <th>Total Amount</th>
              <th>Requested By</th>
              <th>Request Date</th>
              ${approvalTab === 'all' ? '<th>Status</th>' : ''}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>${approvals.map((approval, index) => approvalRow(approval, index)).join('')}</tbody>
        </table>
      </div>
    ` : `<div class="card empty-state"><span class="icon">AP</span>No approvals found.</div>`}
  `;
}

function approvalRow(approval, index) {
  const actions = approval.status === 'Pending'
    ? `<button class="btn btn-sm btn-success" onclick="decision('${approval.id}','approve')">Approve</button><button class="btn btn-sm btn-danger" onclick="decision('${approval.id}','reject')">Reject</button>`
    : `<button class="btn btn-sm btn-outline" onclick="showTimeline('${approval.id}')">Timeline</button>`;

  return `
    <tr>
      <td>${index + 1}</td>
      <td>${approval.rfqNumber}</td>
      <td>${approval.rfqTitle}</td>
      <td>${approval.vendorName}</td>
      <td>${VB.money(approval.totalAmount)}</td>
      <td>${approval.requestedBy}</td>
      <td>${VB.date(approval.requestedAt)}</td>
      ${approvalTab === 'all' ? `<td>${VB.badge(approval.status)}</td>` : ''}
      <td><div class="actions">${actions}</div></td>
    </tr>
    <tr class="timeline-row">
      <td colspan="${approvalTab === 'all' ? 9 : 8}">${timelineHtml(approval)}</td>
    </tr>
  `;
}

function timelineHtml(approval) {
  return `
    <div class="timeline">
      ${ApprovalService.getTimeline(approval).map(step => `
        <div class="timeline-step">
          <span class="timeline-dot ${step.dot}"></span>
          <div>
            <strong>${step.label}</strong><br>
            <span class="muted">${VB.dateTime(step.time)} - ${step.user}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function decision(id, type) {
  const approval = ApprovalService.getById(id);
  const approve = type === 'approve';
  const overlay = VB.modal(
    approve ? 'Approve Request' : 'Reject Request',
    `
      <p><strong>RFQ:</strong> ${approval.rfqTitle}</p>
      <p><strong>Vendor:</strong> ${approval.vendorName}</p>
      <p><strong>Total:</strong> ${VB.money(approval.totalAmount)}</p>
      <div class="form-group">
        <label class="form-label">Remarks</label>
        <textarea class="form-control" id="remarks" required></textarea>
      </div>
    `,
    `<button class="btn btn-outline" data-close>Cancel</button><button class="btn ${approve ? 'btn-success' : 'btn-danger'}" id="confirmDecision">Confirm ${approve ? 'Approve' : 'Reject'}</button>`
  );

  overlay.querySelector('#confirmDecision').onclick = () => {
    if (!remarks.value.trim()) {
      VB.toast('Remarks are required.', 'danger');
      return;
    }

    const user = VB.currentUser();
    const updated = approve
      ? ApprovalService.approve(id, remarks.value.trim(), user)
      : ApprovalService.reject(id, remarks.value.trim(), user);

    if (approve) {
      const quote = QuotationService.getById(updated.quotationId);
      const vendor = VendorService.getById(updated.vendorId);
      const po = POService.generateFromApproval(updated, quote, vendor);
      RFQService.updateStatus(updated.rfqId, 'Awarded');
      LogService.add(user.id, user.name, user.role, `Approval approved for ${updated.rfqNumber}`, 'Approvals');
      LogService.add(user.id, user.name, user.role, `PO generated: ${po.poNumber}`, 'Purchase Orders');
    } else {
      LogService.add(user.id, user.name, user.role, `Approval rejected for ${updated.rfqNumber}`, 'Approvals');
    }

    overlay.remove();
    VB.toast(`Approval ${approve ? 'approved' : 'rejected'}`);
    renderApprovals();
  };
}

function showTimeline(id) {
  VB.modal('Approval Timeline', timelineHtml(ApprovalService.getById(id)));
}
