document.addEventListener('DOMContentLoaded', () => {
  renderLayout('My Assigned RFQs');
  VB.requireRole(['Vendor']);
  renderQuotations();
});

function renderQuotations() {
  const user = VB.currentUser();
  const vendor = VB.activeVendorForUser(user);
  const root = document.getElementById('quotationsRoot');
  const rfqs = vendor ? RFQService.getByVendor(vendor.id) : [];

  root.innerHTML = `
    <div class="card">
      <h2>My Assigned RFQs</h2>
      <p class="muted">Submit, edit, or view quotations for RFQs assigned to ${vendor?.name || user.name}.</p>
    </div>
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
              <th>RFQ Status</th>
              <th>Quotation Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${rfqs.map(rfq => {
              const quote = QuotationService.getByRFQ(rfq.id).find(item => item.vendorId === vendor.id);
              const label = !quote ? 'Submit Quote' : rfq.status === 'Open' ? 'Edit Quote' : 'View Quote';
              return `
                <tr>
                  <td>${rfq.rfqNumber}</td>
                  <td>${rfq.title}</td>
                  <td>${rfq.product}</td>
                  <td>${rfq.quantity} ${rfq.unit}</td>
                  <td>${VB.date(rfq.deadline)}</td>
                  <td>${VB.badge(rfq.status)}</td>
                  <td>${quote ? VB.badge(quote.status) : VB.badge('Pending')}</td>
                  <td><button class="btn btn-sm btn-primary" onclick="openQuote('${rfq.id}','${quote?.id || ''}')">${label}</button></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    ` : `<div class="card empty-state"><span class="icon">QT</span>No assigned RFQs found.</div>`}
  `;
}

function openQuote(rfqId, quoteId) {
  const rfq = RFQService.getById(rfqId);
  const quote = quoteId ? QuotationService.getById(quoteId) : null;
  const readonly = quote && rfq.status !== 'Open';
  const body = `
    <form id="quoteForm">
      <div class="detail-grid">
        <p><strong>RFQ Title:</strong> ${rfq.title}</p>
        <p><strong>Product:</strong> ${rfq.product}</p>
        <p><strong>Quantity:</strong> ${rfq.quantity} ${rfq.unit}</p>
      </div>
      <div class="form-group">
        <label class="form-label">Unit Price in rupees</label>
        <input class="form-control" id="unitPrice" type="number" min="1" value="${quote?.unitPrice || ''}" ${readonly ? 'readonly' : ''} required>
      </div>
      <div class="form-group">
        <label class="form-label">Total Price</label>
        <div class="calc-total" id="totalPrice">${VB.money(quote?.totalPrice || 0)}</div>
      </div>
      <div class="form-group">
        <label class="form-label">Delivery Timeline in days</label>
        <input class="form-control" id="deliveryDays" type="number" min="1" value="${quote?.deliveryDays || ''}" ${readonly ? 'readonly' : ''} required>
      </div>
      <div class="form-group">
        <label class="form-label">Notes or Comments</label>
        <textarea class="form-control" id="notes" ${readonly ? 'readonly' : ''}>${quote?.notes || ''}</textarea>
      </div>
    </form>
  `;
  const overlay = VB.modal(
    readonly ? 'View Quote' : quote ? 'Edit Quote' : 'Submit Quote',
    body,
    readonly ? `<button class="btn btn-outline" data-close>Close</button>` : `<button class="btn btn-outline" data-close>Cancel</button><button class="btn btn-primary" id="saveQuote">Submit</button>`
  );

  const updateTotal = () => {
    overlay.querySelector('#totalPrice').textContent = VB.money(Number(unitPrice.value || 0) * Number(rfq.quantity));
  };
  overlay.querySelector('#unitPrice').oninput = updateTotal;
  updateTotal();

  if (!readonly) {
    overlay.querySelector('#saveQuote').onclick = () => {
      if (Number(unitPrice.value) <= 0 || Number(deliveryDays.value) <= 0) {
        VB.toast('Enter valid price and delivery days.', 'danger');
        return;
      }

      const user = VB.currentUser();
      const vendor = VB.activeVendorForUser(user);
      const data = {
        rfqId: rfq.id,
        vendorId: vendor.id,
        vendorName: vendor.name,
        unitPrice: Number(unitPrice.value),
        totalPrice: Number(unitPrice.value) * Number(rfq.quantity),
        deliveryDays: Number(deliveryDays.value),
        notes: notes.value.trim(),
        status: 'Submitted'
      };

      quote ? QuotationService.update(quote.id, data) : QuotationService.add(data);
      LogService.add(user.id, user.name, user.role, quote ? `Quotation edited for ${rfq.rfqNumber}` : `Quotation submitted for ${rfq.rfqNumber}`, 'Quotations');
      overlay.remove();
      VB.toast('Quotation saved');
      renderQuotations();
    };
  }
}
