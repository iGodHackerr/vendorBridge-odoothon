let rfqSearch = '';
let rfqStatus = 'All';

document.addEventListener('DOMContentLoaded', () => {
  renderLayout('RFQs');
  renderRFQs();
});

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
  const user = VB.currentUser();
  const root = document.getElementById('rfqRoot');
  let rfqs = rfqsForUser().filter(rfq => [rfq.title, rfq.product].join(' ').toLowerCase().includes(rfqSearch.toLowerCase()));
  if (rfqStatus !== 'All') rfqs = rfqs.filter(rfq => rfq.status === rfqStatus);

  const toolbar = user.role === 'Procurement Officer'
    ? `
      <div class="page-toolbar">
        <div class="toolbar-left">
          <input class="form-control" id="rfqSearch" placeholder="Search title or product" value="${rfqSearch}">
          <select class="form-control" id="rfqStatus">
            <option>All</option>
            <option>Open</option>
            <option>Closed</option>
            <option>Awarded</option>
          </select>
        </div>
        <button class="btn btn-primary" id="createRFQ">Create RFQ</button>
      </div>
    `
    : `
      <div class="card">
        <h2>My Assigned RFQs</h2>
        <p class="muted">RFQs assigned to your vendor account.</p>
        <a class="btn btn-primary" href="quotations.html">Submit Quotation</a>
      </div>
    `;

  root.innerHTML = `
    ${toolbar}
    ${rfqs.length ? `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>RFQ Number</th>
              <th>Title</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Deadline</th>
              <th>Assigned Vendors</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rfqs.map(rfq => `
              <tr>
                <td>${rfq.rfqNumber}</td>
                <td>${rfq.title}</td>
                <td>${rfq.product}</td>
                <td>${rfq.quantity} ${rfq.unit}</td>
                <td>${VB.date(rfq.deadline)}</td>
                <td>${(rfq.assignedVendorIds || []).length}</td>
                <td>${VB.badge(rfq.status)}</td>
                <td>
                  <div class="actions">
                    <button class="btn btn-sm btn-outline" onclick="viewRFQ('${rfq.id}')">View</button>
                    ${user.role === 'Procurement Officer' ? `
                      <button class="btn btn-sm btn-outline" onclick="openRFQModal('${rfq.id}')">Edit</button>
                      <button class="btn btn-sm btn-warning" ${rfq.status !== 'Open' ? 'disabled' : ''} onclick="closeRFQ('${rfq.id}')">Close</button>
                    ` : ''}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : `<div class="card empty-state"><span class="icon">RFQ</span>No RFQs found.</div>`}
  `;

  if (user.role === 'Procurement Officer') {
    document.getElementById('rfqSearch').oninput = event => {
      rfqSearch = event.target.value;
      renderRFQs();
    };
    document.getElementById('rfqStatus').value = rfqStatus;
    document.getElementById('rfqStatus').onchange = event => {
      rfqStatus = event.target.value;
      renderRFQs();
    };
    document.getElementById('createRFQ').onclick = () => openRFQModal();
  }
}

function openRFQModal(id) {
  const rfq = id ? RFQService.getById(id) : { unit: 'pcs', assignedVendorIds: [] };
  const vendors = VendorService.getActive();
  const body = `
    <form id="rfqForm">
      <div class="form-group">
        <label class="form-label">RFQ Title</label>
        <input class="form-control" id="rTitle" value="${rfq.title || ''}" required>
      </div>
      <div class="form-group">
        <label class="form-label">Description</label>
        <textarea class="form-control" id="rDescription">${rfq.description || ''}</textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Product or Service Name</label>
        <input class="form-control" id="rProduct" value="${rfq.product || ''}" required>
      </div>
      <div class="detail-grid">
        <div class="form-group">
          <label class="form-label">Quantity</label>
          <input class="form-control" id="rQuantity" type="number" min="1" value="${rfq.quantity || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Unit</label>
          <select class="form-control" id="rUnit">${['pcs', 'kg', 'litres', 'hours', 'metres'].map(unit => `<option ${rfq.unit === unit ? 'selected' : ''}>${unit}</option>`).join('')}</select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Required By</label>
        <input class="form-control" id="rDeadline" type="date" value="${rfq.deadline || ''}" required>
      </div>
      <div class="form-group">
        <label class="form-label">File Attachment</label>
        <input class="form-control" id="rFile" type="file">
      </div>
      <div class="form-group">
        <label class="form-label">Assign Vendors</label>
        <div class="vendor-checklist">
          ${vendors.map(vendor => `<label><input type="checkbox" value="${vendor.id}" ${(rfq.assignedVendorIds || []).includes(vendor.id) ? 'checked' : ''}> ${vendor.name} (${vendor.category})</label>`).join('')}
        </div>
      </div>
    </form>
  `;
  const overlay = VB.modal(
    id ? 'Edit RFQ' : 'Create RFQ',
    body,
    `<button class="btn btn-outline" data-close>Cancel</button><button class="btn btn-primary" id="saveRFQ">Save</button>`
  );

  overlay.querySelector('#saveRFQ').onclick = () => {
    const selected = [...overlay.querySelectorAll('.vendor-checklist input:checked')].map(input => input.value);
    if (!rTitle.value.trim() || !rProduct.value.trim() || Number(rQuantity.value) <= 0 || !rDeadline.value || new Date(rDeadline.value) <= new Date() || !selected.length) {
      VB.toast('Please complete RFQ fields with a future date and assigned vendor.', 'danger');
      return;
    }

    const data = {
      title: rTitle.value.trim(),
      description: rDescription.value.trim(),
      product: rProduct.value.trim(),
      quantity: Number(rQuantity.value),
      unit: rUnit.value,
      deadline: rDeadline.value,
      attachmentName: rFile.files[0]?.name || rfq.attachmentName || '',
      assignedVendorIds: selected
    };
    const saved = id ? RFQService.update(id, data) : RFQService.add(data);
    const user = VB.currentUser();
    LogService.add(user.id, user.name, user.role, id ? `RFQ updated: ${saved.rfqNumber}` : `RFQ created: ${saved.rfqNumber}`, 'RFQ');
    overlay.remove();
    VB.toast('RFQ saved successfully');
    renderRFQs();
  };
}

function viewRFQ(id) {
  const rfq = RFQService.getById(id);
  const names = (rfq.assignedVendorIds || [])
    .map(vendorId => VendorService.getById(vendorId)?.name)
    .filter(Boolean)
    .join(', ');

  VB.modal('RFQ Details', `
    <div class="detail-grid">
      <p><strong>RFQ:</strong> ${rfq.rfqNumber}</p>
      <p><strong>Status:</strong> ${VB.badge(rfq.status)}</p>
      <p><strong>Title:</strong> ${rfq.title}</p>
      <p><strong>Product:</strong> ${rfq.product}</p>
      <p><strong>Quantity:</strong> ${rfq.quantity} ${rfq.unit}</p>
      <p><strong>Deadline:</strong> ${VB.date(rfq.deadline)}</p>
      <p><strong>Attachment:</strong> ${rfq.attachmentName || 'None'}</p>
      <p><strong>Vendors:</strong> ${names || 'None'}</p>
    </div>
    <p><strong>Description:</strong><br>${rfq.description || 'No description'}</p>
  `);
}

function closeRFQ(id) {
  const rfq = RFQService.updateStatus(id, 'Closed');
  const user = VB.currentUser();
  LogService.add(user.id, user.name, user.role, `RFQ closed: ${rfq.rfqNumber}`, 'RFQ');
  VB.toast('RFQ closed');
  renderRFQs();
}
