document.addEventListener('DOMContentLoaded', () => {
  renderLayout('Quotation Comparison');
  VB.requireRole(['Procurement Officer']);
  renderComparison();
});

function renderComparison(selectedId = '') {
  const root = document.getElementById('comparisonRoot');
  const rfqs = RFQService.getAll().filter(rfq => ['Open', 'Closed'].includes(rfq.status));
  root.innerHTML = `
    <div class="card">
      <label class="form-label">Select RFQ</label>
      <select class="form-control" id="rfqSelect">
        <option value="">Choose RFQ</option>
        ${rfqs.map(rfq => `<option value="${rfq.id}" ${rfq.id === selectedId ? 'selected' : ''}>${rfq.rfqNumber} - ${rfq.title}</option>`).join('')}
      </select>
    </div>
    <div id="compareTable"></div>
  `;
  document.getElementById('rfqSelect').onchange = event => renderComparison(event.target.value);
  if (selectedId) renderCompareTable(selectedId);
}

function renderCompareTable(rfqId) {
  const quotes = QuotationService.getByRFQ(rfqId);
  const box = document.getElementById('compareTable');
  if (!quotes.length) {
    box.innerHTML = `<div class="card empty-state"><span class="icon">QC</span>No quotations submitted for selected RFQ.</div>`;
    return;
  }

  const minPrice = Math.min(...quotes.map(quote => Number(quote.totalPrice)));
  const minDays = Math.min(...quotes.map(quote => Number(quote.deliveryDays)));

  box.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Vendor Name</th>
            <th>Vendor Category</th>
            <th>Unit Price</th>
            <th>Total Price</th>
            <th>Delivery Days</th>
            <th>Notes</th>
            <th>Vendor Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${quotes.map(quote => {
            const vendor = VendorService.getById(quote.vendorId) || {};
            const lowest = Number(quote.totalPrice) === minPrice;
            const fastest = Number(quote.deliveryDays) === minDays;
            const rowClass = lowest && fastest ? 'row-both' : lowest ? 'row-lowest' : fastest ? 'row-fastest' : '';
            return `
              <tr class="${rowClass}">
                <td>${quote.vendorName} ${lowest ? VB.badge('Lowest Price') : ''} ${fastest ? VB.badge('Fastest Delivery') : ''}</td>
                <td>${vendor.category || ''}</td>
                <td>${VB.money(quote.unitPrice)}</td>
                <td>${VB.money(quote.totalPrice)}</td>
                <td>${quote.deliveryDays}</td>
                <td>${quote.notes || ''}</td>
                <td>${VB.badge(vendor.status || 'Active')}</td>
                <td><button class="btn btn-sm btn-primary" onclick="sendApproval('${quote.id}')">Select and Send for Approval</button></td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function sendApproval(quoteId) {
  const quote = QuotationService.getById(quoteId);
  const rfq = RFQService.getById(quote.rfqId);
  const user = VB.currentUser();

  VB.confirm('Send for Approval', `Send ${quote.vendorName} quotation totaling ${VB.money(quote.totalPrice)} for approval?`, () => {
    QuotationService.updateStatus(quote.id, 'Selected');
    RFQService.updateStatus(rfq.id, 'Closed');
    ApprovalService.add({
      rfqId: rfq.id,
      quotationId: quote.id,
      rfqNumber: rfq.rfqNumber,
      rfqTitle: rfq.title,
      vendorId: quote.vendorId,
      vendorName: quote.vendorName,
      totalAmount: quote.totalPrice,
      requestedBy: user.name,
      requestedById: user.id,
      rfqCreatedAt: rfq.createdAt,
      quotationCreatedAt: quote.createdAt
    });
    LogService.add(user.id, user.name, user.role, `Approval requested for ${rfq.rfqNumber} - ${quote.vendorName}`, 'Approvals');
    LogService.add(user.id, user.name, user.role, `Comparison selection made for ${rfq.rfqNumber}`, 'Quotations');
    VB.toast('Approval request sent');
    window.location.href = 'approvals.html';
  });
}
