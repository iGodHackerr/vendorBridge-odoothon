document.addEventListener('DOMContentLoaded', () => {
  renderLayout('Dashboard');
  const user = VB.currentUser();
  const root = document.getElementById('dashboardRoot');
  const stats = {
    pending: ApprovalService.getPending().length,
    rfqs: RFQService.getAll().filter(r => r.status === 'Open').length,
    pos: POService.getAll().length,
    invoices: InvoiceService.getAll().length
  };
  const quick = {
    'Procurement Officer': [['Create RFQ','rfq.html'],['View Vendors','vendors.html'],['Go to Approvals','comparison.html']],
    'Vendor': [['View Assigned RFQs','rfq.html'],['Submit Quotation','quotations.html']],
    'Manager': [['Go to Approvals','approvals.html'],['View Reports','reports.html']],
    'Admin': [['Manage Vendors','vendors.html'],['View Reports','reports.html']]
  }[user.role] || [];
  root.innerHTML = `
    <section class="grid-4">
      ${stat('Pending Approvals', stats.pending, 'orange', '✅')}
      ${stat('Active RFQs', stats.rfqs, '', '📄')}
      ${stat('Total Purchase Orders', stats.pos, 'green', '📦')}
      ${stat('Total Invoices', stats.invoices, 'purple', '🧾')}
    </section>
    <section class="card"><h2>Quick Actions</h2><div class="quick-actions">${quick.map(q => `<a class="btn btn-primary" href="${q[1]}">${q[0]}</a>`).join('')}</div></section>
    <section><h2>Recent Activity</h2><div class="table-wrapper"><table><thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Module</th></tr></thead><tbody>${LogService.getRecent(5).map(l => `<tr><td>${VB.dateTime(l.timestamp)}</td><td>${l.userName}</td><td>${l.action}</td><td>${l.module}</td></tr>`).join('')}</tbody></table></div></section>
    <section class="card"><h2>Monthly Procurement Spend</h2><div class="bar-chart">${monthlyBars()}</div></section>`;
});
function stat(label, value, cls, icon) { return `<div class="card stat-card ${cls}"><div><div class="muted">${label}</div><div class="stat-number">${value}</div></div><div class="stat-icon">${icon}</div></div>`; }
function monthlyBars() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun']; const pos = POService.getAll(); const max = Math.max(1, ...pos.map(p => p.grandTotal));
  return months.map((m, i) => { const total = pos[i % Math.max(pos.length,1)]?.grandTotal || (i + 1) * 30000; return `<div class="bar" style="height:${40 + (total / max) * 150}px"><span>${m}</span></div>`; }).join('');
}
