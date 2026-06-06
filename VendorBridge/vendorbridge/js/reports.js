document.addEventListener('DOMContentLoaded', () => {
  renderLayout('Reports');
  VB.requireRole(['Admin', 'Manager']);
  renderReports();
});

function renderReports() {
  const vendors = VendorService.getAll();
  const pos = POService.getAll();
  const rfqs = RFQService.getAll();
  const invoices = InvoiceService.getAll();
  const quotes = QuotationService.getAll();
  const spend = pos.reduce((sum, po) => sum + Number(po.grandTotal), 0);
  const root = document.getElementById('reportsRoot');

  root.innerHTML = `
    <section class="grid-4">
      ${reportStat('Total Procurement Spend', VB.money(spend), 'green', 'SP')}
      ${reportStat('Active Vendors', vendors.filter(vendor => vendor.status === 'Active').length, 'blue', 'VN')}
      ${reportStat('RFQs Created', rfqs.length, 'orange', 'RFQ')}
      ${reportStat('Invoices Generated', invoices.length, 'purple', 'INV')}
    </section>
    <section class="card report-section">
      <div class="page-toolbar">
        <h2>Vendor Performance</h2>
        <button class="btn btn-outline" id="exportCsv">Export CSV</button>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Vendor Name</th>
              <th>Quotes Submitted</th>
              <th>Quotes Won</th>
              <th>Win Rate</th>
              <th>Avg Delivery Days</th>
              <th>Total Value Won</th>
            </tr>
          </thead>
          <tbody>${vendors.map(vendor => vendorPerf(vendor, quotes, pos)).join('')}</tbody>
        </table>
      </div>
    </section>
    <section class="card report-section">
      <h2>Monthly Procurement Trend</h2>
      <div class="bar-chart">${trendBars(pos)}</div>
    </section>
    <section class="card report-section">
      <h2>Procurement by Category</h2>
      ${categoryBars(vendors, pos)}
    </section>
  `;

  exportCsv.onclick = () => exportPerformance(vendors, quotes, pos);
}

function reportStat(label, value, cls, code) {
  return `
    <article class="card report-stat ${cls}">
      <div class="report-stat-code">${code}</div>
      <span>${label}</span>
      <strong>${value}</strong>
    </article>
  `;
}

function vendorPerf(vendor, quotes, pos) {
  const submitted = quotes.filter(quote => quote.vendorId === vendor.id);
  const won = pos.filter(po => po.vendorId === vendor.id);
  const avg = submitted.length ? Math.round(submitted.reduce((sum, quote) => sum + Number(quote.deliveryDays), 0) / submitted.length) : 0;
  const total = won.reduce((sum, po) => sum + Number(po.grandTotal), 0);
  const rate = submitted.length ? Math.round((won.length / submitted.length) * 100) : 0;

  return `<tr><td>${vendor.name}</td><td>${submitted.length}</td><td>${won.length}</td><td>${rate}%</td><td>${avg}</td><td>${VB.money(total)}</td></tr>`;
}

function lastMonths() {
  const out = [];
  const today = new Date();
  for (let index = 5; index >= 0; index -= 1) {
    out.push(new Date(today.getFullYear(), today.getMonth() - index, 1));
  }
  return out;
}

function trendBars(pos) {
  const months = lastMonths().map(date => ({
    label: date.toLocaleString('en-IN', { month: 'short' }),
    total: pos
      .filter(po => new Date(po.date).getMonth() === date.getMonth() && new Date(po.date).getFullYear() === date.getFullYear())
      .reduce((sum, po) => sum + Number(po.grandTotal), 0)
  }));
  const max = Math.max(1, ...months.map(month => month.total));

  return months.map(month => `
    <div class="bar" data-tip="${VB.money(month.total)}" style="height:${35 + (month.total / max) * 160}px">
      <span>${month.label}</span>
    </div>
  `).join('');
}

function categoryBars(vendors, pos) {
  const totals = {};
  pos.forEach(po => {
    const category = vendors.find(vendor => vendor.id === po.vendorId)?.category || 'Other';
    totals[category] = (totals[category] || 0) + Number(po.grandTotal);
  });
  const max = Math.max(1, ...Object.values(totals));

  return Object.keys(totals).length
    ? Object.entries(totals).map(([category, total]) => `
      <div class="form-group">
        <div class="hbar">
          <div class="hbar-fill" style="width:${(total / max) * 100}%"></div>
          <div class="hbar-label">${category} - ${VB.money(total)}</div>
        </div>
      </div>
    `).join('')
    : '<div class="empty-state">No category spend yet.</div>';
}

function exportPerformance(vendors, quotes, pos) {
  const rows = [['Vendor Name', 'Quotes Submitted', 'Quotes Won', 'Win Rate', 'Avg Delivery Days', 'Total Value Won']];
  vendors.forEach(vendor => {
    const submitted = quotes.filter(quote => quote.vendorId === vendor.id);
    const won = pos.filter(po => po.vendorId === vendor.id);
    const avg = submitted.length ? Math.round(submitted.reduce((sum, quote) => sum + Number(quote.deliveryDays), 0) / submitted.length) : 0;
    const total = won.reduce((sum, po) => sum + Number(po.grandTotal), 0);
    const rate = submitted.length ? Math.round((won.length / submitted.length) * 100) : 0;
    rows.push([vendor.name, submitted.length, won.length, `${rate}%`, avg, total]);
  });

  const blob = new Blob([rows.map(row => row.join(',')).join('\n')], { type: 'text/csv' });
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = 'vendor-performance.csv';
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}
