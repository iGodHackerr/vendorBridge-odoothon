document.addEventListener('DOMContentLoaded', () => {
  renderLayout('Purchase Orders');
  VB.requireRole(['Procurement Officer']);
  renderPOs();
});

function renderPOs() {
  const pos = POService.getAll();
  const invoices = InvoiceService.getAll();
  const root = document.getElementById('poRoot');

  root.innerHTML = pos.length ? `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>PO Number</th>
            <th>Vendor Name</th>
            <th>Item Description</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Subtotal</th>
            <th>GST Amount</th>
            <th>Grand Total</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${pos.map(po => `
            <tr>
              <td>${po.poNumber}</td>
              <td>${po.vendorName}</td>
              <td>${po.itemDescription}</td>
              <td>${po.quantity} ${po.unit}</td>
              <td>${VB.money(po.unitPrice)}</td>
              <td>${VB.money(po.subtotal)}</td>
              <td>${VB.money(po.gst)}</td>
              <td>${VB.money(po.grandTotal)}</td>
              <td>${VB.badge(po.status)}</td>
              <td>${VB.date(po.date)}</td>
              <td>
                <div class="actions">
                  <button class="btn btn-sm btn-outline" onclick="viewPO('${po.id}')">View PO</button>
                  ${invoices.some(invoice => invoice.poId === po.id) ? '' : `<button class="btn btn-sm btn-primary" onclick="generateInvoice('${po.id}')">Generate Invoice</button>`}
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  ` : `<div class="card empty-state"><span class="icon">PO</span>No purchase orders generated yet.</div>`;
}

function poDoc(po) {
  return `
    <div class="doc-layout">
      <div class="doc-header">
        <div>
          <h2>VendorBridge</h2>
          <p>Procurement Office<br>India</p>
        </div>
        <div>
          <h2>${po.poNumber}</h2>
          <p>${VB.date(po.date)}</p>
          ${VB.badge(po.status)}
        </div>
      </div>
      <div class="doc-cols">
        <div>
          <h3>Bill From</h3>
          <p>VendorBridge Procurement<br>Corporate Office<br>procurement@vendorbridge.com</p>
        </div>
        <div>
          <h3>Bill To</h3>
          <p>${po.vendorName}<br>GST: ${po.vendorGst}<br>${po.vendorEmail}<br>${po.vendorPhone}<br>${po.vendorAddress}</p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Sr No</th>
            <th>Item Description</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Unit Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>${po.itemDescription}</td>
            <td>${po.quantity}</td>
            <td>${po.unit}</td>
            <td>${VB.money(po.unitPrice)}</td>
            <td>${VB.money(po.subtotal)}</td>
          </tr>
        </tbody>
      </table>
      <div class="totals">
        <div><span>Subtotal</span><strong>${VB.money(po.subtotal)}</strong></div>
        <div><span>GST 18%</span><strong>${VB.money(po.gst)}</strong></div>
        <div class="grand"><span>Grand Total</span><strong>${VB.money(po.grandTotal)}</strong></div>
      </div>
      <p><strong>Terms and Conditions:</strong> Goods and services must match the accepted quotation and delivery schedule.</p>
      <p style="text-align:right;margin-top:40px">Authorized Signature</p>
    </div>
  `;
}

function viewPO(id) {
  const po = POService.getById(id);
  VB.modal('Purchase Order', poDoc(po), `<button class="btn btn-outline" data-close>Close</button><button class="btn btn-primary" onclick="window.print()">Print</button>`, true);
}

function generateInvoice(id) {
  const po = POService.getById(id);
  const invoice = InvoiceService.generateFromPO(po);
  const user = VB.currentUser();
  LogService.add(user.id, user.name, user.role, `Invoice generated: ${invoice.invoiceNumber}`, 'Invoices');
  VB.toast('Invoice generated');
  window.location.href = 'invoices.html';
}
