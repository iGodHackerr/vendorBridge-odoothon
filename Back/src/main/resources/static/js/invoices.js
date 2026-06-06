document.addEventListener('DOMContentLoaded', () => {
  renderLayout('Invoices');
  VB.requireRole(['Procurement Officer']);
  renderInvoices();
});

function renderInvoices() {
  const invoices = InvoiceService.getAll();
  const root = document.getElementById('invoicesRoot');

  root.innerHTML = invoices.length ? `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Invoice Number</th>
            <th>PO Number</th>
            <th>Vendor Name</th>
            <th>Subtotal</th>
            <th>GST</th>
            <th>Grand Total</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${invoices.map(invoice => `
            <tr>
              <td>${invoice.invoiceNumber}</td>
              <td>${invoice.poNumber}</td>
              <td>${invoice.vendorName}</td>
              <td>${VB.money(invoice.subtotal)}</td>
              <td>${VB.money(invoice.gst)}</td>
              <td>${VB.money(invoice.grandTotal)}</td>
              <td>${VB.badge(invoice.status)}</td>
              <td>${VB.date(invoice.date)}</td>
              <td>
                <div class="actions">
                  <button class="btn btn-sm btn-outline" onclick="viewInvoice('${invoice.id}')">View Invoice</button>
                  <button class="btn btn-sm btn-outline" onclick="printInvoice('${invoice.id}')">Print</button>
                  <button class="btn btn-sm btn-outline" onclick="printInvoice('${invoice.id}')">Download PDF</button>
                  <button class="btn btn-sm btn-primary" onclick="emailInvoice('${invoice.id}')">Send Email</button>
                  <button class="btn btn-sm btn-success" ${invoice.status === 'Paid' ? 'disabled' : ''} onclick="markPaid('${invoice.id}')">Mark as Paid</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  ` : `<div class="card empty-state"><span class="icon">INV</span>No invoices generated yet.</div>`;
}

function invoiceDoc(invoice) {
  return `
    <div class="doc-layout">
      <div class="doc-header">
        <div>
          <h2>VendorBridge</h2>
          <p>Procurement Office<br>billing@vendorbridge.com</p>
        </div>
        <div>
          <h1>Invoice</h1>
          <p>${invoice.invoiceNumber}<br>Date: ${VB.date(invoice.date)}<br>Due: ${VB.date(invoice.dueDate)}</p>
          ${VB.badge(invoice.status)}
        </div>
      </div>
      <div class="doc-cols">
        <div>
          <h3>Bill From</h3>
          <p>VendorBridge<br>Corporate Procurement<br>India</p>
        </div>
        <div>
          <h3>Bill To</h3>
          <p>${invoice.vendorName}<br>GST: ${invoice.vendorGst || 'N/A'}<br>${invoice.vendorEmail}</p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Sr No</th>
            <th>Description</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Unit Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>${invoice.itemDescription}</td>
            <td>${invoice.quantity}</td>
            <td>${invoice.unit}</td>
            <td>${VB.money(invoice.unitPrice)}</td>
            <td>${VB.money(invoice.subtotal)}</td>
          </tr>
        </tbody>
      </table>
      <div class="totals">
        <div><span>Subtotal</span><strong>${VB.money(invoice.subtotal)}</strong></div>
        <div><span>GST 18%</span><strong>${VB.money(invoice.gst)}</strong></div>
        <div class="grand invoice-total"><span>Grand Total</span><strong>${VB.money(invoice.grandTotal)}</strong></div>
      </div>
      <p><strong>Payment Terms:</strong> Payment due within 15 days from invoice date.</p>
      <p style="text-align:center">Thank you for working with VendorBridge.</p>
    </div>
  `;
}

function viewInvoice(id) {
  const invoice = InvoiceService.getById(id);
  VB.modal(
    'Invoice',
    `${invoiceDoc(invoice)}<div class="invoice-actions actions"><button class="btn btn-outline" onclick="window.print()">Print</button><button class="btn btn-outline" onclick="window.print()">Download PDF</button><button class="btn btn-primary" onclick="emailInvoice('${id}')">Send Email</button><button class="btn btn-success" onclick="markPaid('${id}')">Mark Paid</button></div>`,
    `<button class="btn btn-outline" data-close>Close</button>`,
    true
  );
}

function printInvoice(id) {
  viewInvoice(id);
  setTimeout(() => window.print(), 100);
}

function emailInvoice(id) {
  const invoice = InvoiceService.getById(id);
  const bodyText = `Dear ${invoice.vendorName},\n\nPlease find invoice ${invoice.invoiceNumber} for ${VB.money(invoice.grandTotal)} due on ${VB.date(invoice.dueDate)}.\n\nRegards,\nVendorBridge`;
  const overlay = VB.modal(
    'Send Invoice Email',
    `
      <div class="form-group">
        <label class="form-label">To</label>
        <input class="form-control" id="toEmail" value="${invoice.vendorEmail}">
      </div>
      <div class="form-group">
        <label class="form-label">CC</label>
        <input class="form-control" id="ccEmail">
      </div>
      <div class="form-group">
        <label class="form-label">Subject</label>
        <input class="form-control" id="subject" value="Invoice ${invoice.invoiceNumber} from VendorBridge">
      </div>
      <div class="form-group">
        <label class="form-label">Body</label>
        <textarea class="form-control" id="emailBody" rows="7">${bodyText}</textarea>
      </div>
    `,
    `<button class="btn btn-outline" data-close>Cancel</button><button class="btn btn-primary" id="sendEmail">Send</button>`
  );

  overlay.querySelector('#sendEmail').onclick = () => {
    const user = VB.currentUser();
    InvoiceService.markSent(id);
    LogService.add(user.id, user.name, user.role, `Invoice sent: ${invoice.invoiceNumber}`, 'Invoices');
    overlay.remove();
    VB.toast(`Invoice sent successfully to ${toEmail.value}`);
    renderInvoices();
  };
}

function markPaid(id) {
  VB.confirm('Mark Invoice Paid', 'Mark this invoice as paid?', () => {
    const invoice = InvoiceService.markPaid(id);
    const user = VB.currentUser();
    LogService.add(user.id, user.name, user.role, `Invoice marked paid: ${invoice.invoiceNumber}`, 'Invoices');
    VB.toast('Invoice marked as paid');
    renderInvoices();
  });
}
