let page = 1, logFilters = { module: 'All', from: '', to: '' };
document.addEventListener('DOMContentLoaded', () => { renderLayout('Activity Logs'); renderLogs(); });
function filteredLogs() {
  return LogService.getAll().filter(l => {
    const t = new Date(l.timestamp).getTime();
    const moduleOk = logFilters.module === 'All' || l.module === logFilters.module;
    const fromOk = !logFilters.from || t >= new Date(logFilters.from).getTime();
    const toOk = !logFilters.to || t <= new Date(logFilters.to + 'T23:59:59').getTime();
    return moduleOk && fromOk && toOk;
  });
}
function renderLogs() {
  const logs = filteredLogs(), totalPages = Math.max(1, Math.ceil(logs.length / 20)), start = (page - 1) * 20, root = document.getElementById('logsRoot');
  if (page > totalPages) page = totalPages;
  root.innerHTML = `<div class="page-toolbar"><div class="toolbar-left"><select class="form-control" id="moduleFilter">${['All','Vendors','RFQ','Quotations','Approvals','Purchase Orders','Invoices','Auth'].map(m=>`<option ${logFilters.module===m?'selected':''}>${m}</option>`).join('')}</select><input class="form-control" id="dateFrom" type="date" value="${logFilters.from}"><input class="form-control" id="dateTo" type="date" value="${logFilters.to}"></div><div class="toolbar-right"><button class="btn btn-primary" id="applyFilter">Apply Filter</button><button class="btn btn-outline" id="resetFilter">Reset</button></div></div><div class="table-wrapper"><table><thead><tr><th>Sr No</th><th>Timestamp</th><th>User Name</th><th>Role</th><th>Action Description</th><th>Module</th></tr></thead><tbody>${logs.slice(start,start+20).map((l,i)=>`<tr><td>${start+i+1}</td><td>${VB.dateTime(l.timestamp)}</td><td>${l.userName}</td><td>${VB.badge(l.role)}</td><td>${l.action}</td><td>${VB.badge(l.module)}</td></tr>`).join('') || `<tr><td colspan="6"><div class="empty-state">No activity logs found.</div></td></tr>`}</tbody></table></div><div class="pagination"><button class="btn btn-outline" ${page===1?'disabled':''} id="prevPage">Previous</button><span>Page ${page} of ${totalPages}</span><button class="btn btn-outline" ${page===totalPages?'disabled':''} id="nextPage">Next</button></div>`;
  applyFilter.onclick = () => { logFilters = { module: moduleFilter.value, from: dateFrom.value, to: dateTo.value }; page = 1; renderLogs(); };
  resetFilter.onclick = () => { logFilters = { module: 'All', from: '', to: '' }; page = 1; renderLogs(); };
  prevPage.onclick = () => { page--; renderLogs(); }; nextPage.onclick = () => { page++; renderLogs(); };
}
