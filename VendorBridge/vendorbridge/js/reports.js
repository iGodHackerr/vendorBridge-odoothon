document.addEventListener('DOMContentLoaded', () => { renderLayout('Reports'); VB.requireRole(['Admin','Manager']); renderReports(); });
function renderReports() {
  const vendors = VendorService.getAll(), pos = POService.getAll(), rfqs = RFQService.getAll(), invoices = InvoiceService.getAll(), quotes = QuotationService.getAll();
  const spend = pos.reduce((s,p)=>s+Number(p.grandTotal),0), root = document.getElementById('reportsRoot');
  root.innerHTML = `<section class="grid-4">${reportStat('Total Procurement Spend', VB.money(spend), 'green', '💰')}${reportStat('Total Active Vendors', vendors.filter(v=>v.status==='Active').length, '', '🏢')}${reportStat('Total RFQs Created', rfqs.length, 'orange', '📄')}${reportStat('Total Invoices Generated', invoices.length, 'purple', '🧾')}</section><section class="card report-section"><div class="page-toolbar"><h2>Vendor Performance</h2><button class="btn btn-outline" id="exportCsv">Export CSV</button></div><div class="table-wrapper"><table><thead><tr><th>Vendor Name</th><th>Quotes Submitted</th><th>Quotes Won</th><th>Win Rate</th><th>Avg Delivery Days</th><th>Total Value Won</th></tr></thead><tbody>${vendors.map(v=>vendorPerf(v,quotes,pos)).join('')}</tbody></table></div></section><section class="card report-section"><h2>Monthly Procurement Trend</h2><div class="bar-chart">${trendBars(pos)}</div></section><section class="card report-section"><h2>Procurement by Category</h2>${categoryBars(vendors,pos)}</section>`;
  exportCsv.onclick = () => exportPerformance(vendors, quotes, pos);
}
function reportStat(label, value, cls, icon) { return `<div class="card stat-card ${cls}"><div><div class="muted">${label}</div><div class="stat-number">${value}</div></div><div class="stat-icon">${icon}</div></div>`; }
function vendorPerf(v, quotes, pos) {
  const submitted = quotes.filter(q=>q.vendorId===v.id), won = pos.filter(p=>p.vendorId===v.id), avg = submitted.length ? Math.round(submitted.reduce((s,q)=>s+Number(q.deliveryDays),0)/submitted.length) : 0, total = won.reduce((s,p)=>s+Number(p.grandTotal),0), rate = submitted.length ? Math.round((won.length/submitted.length)*100) : 0;
  return `<tr><td>${v.name}</td><td>${submitted.length}</td><td>${won.length}</td><td>${rate}%</td><td>${avg}</td><td>${VB.money(total)}</td></tr>`;
}
function lastMonths() { const out=[]; const d=new Date(); for(let i=5;i>=0;i--){ const x=new Date(d.getFullYear(), d.getMonth()-i, 1); out.push(x); } return out; }
function trendBars(pos) {
  const months = lastMonths().map(d => ({ label: d.toLocaleString('en-IN',{month:'short'}), total: pos.filter(p => new Date(p.date).getMonth()===d.getMonth() && new Date(p.date).getFullYear()===d.getFullYear()).reduce((s,p)=>s+Number(p.grandTotal),0) }));
  const max = Math.max(1, ...months.map(m=>m.total));
  return months.map(m=>`<div class="bar" data-tip="${VB.money(m.total)}" style="height:${35 + (m.total/max)*160}px"><span>${m.label}</span></div>`).join('');
}
function categoryBars(vendors, pos) {
  const totals = {};
  pos.forEach(p => { const c = vendors.find(v=>v.id===p.vendorId)?.category || 'Other'; totals[c] = (totals[c] || 0) + Number(p.grandTotal); });
  const max = Math.max(1, ...Object.values(totals));
  return Object.keys(totals).length ? Object.entries(totals).map(([c,t])=>`<div class="form-group"><div class="hbar"><div class="hbar-fill" style="width:${(t/max)*100}%"></div><div class="hbar-label">${c} - ${VB.money(t)}</div></div></div>`).join('') : '<div class="empty-state">No category spend yet.</div>';
}
function exportPerformance(vendors, quotes, pos) {
  const rows = [['Vendor Name','Quotes Submitted','Quotes Won','Win Rate','Avg Delivery Days','Total Value Won']];
  vendors.forEach(v => {
    const submitted = quotes.filter(q=>q.vendorId===v.id), won = pos.filter(p=>p.vendorId===v.id), avg = submitted.length ? Math.round(submitted.reduce((s,q)=>s+Number(q.deliveryDays),0)/submitted.length) : 0, total = won.reduce((s,p)=>s+Number(p.grandTotal),0), rate = submitted.length ? Math.round((won.length/submitted.length)*100) : 0;
    rows.push([v.name, submitted.length, won.length, `${rate}%`, avg, total]);
  });
  const blob = new Blob([rows.map(r=>r.join(',')).join('\n')], { type: 'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'vendor-performance.csv'; a.click(); URL.revokeObjectURL(a.href);
}
