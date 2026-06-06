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

  root.innerHTML = `
  
  <section class="dashboard-hero">

      <div class="welcome-card">
          <div>
              <h1>Welcome Back 👋</h1>
              <p>Manage vendors, RFQs, quotations and procurement workflow.</p>
          </div>

          <div class="hero-badge">
              ${user.role}
          </div>
      </div>

  </section>

  <section class="grid-4">

      ${stat('Pending Approvals', stats.pending, 'orange', '✅')}
      ${stat('Active RFQs', stats.rfqs, 'blue', '📄')}
      ${stat('Purchase Orders', stats.pos, 'green', '📦')}
      ${stat('Invoices', stats.invoices, 'purple', '🧾')}

  </section>

  <section class="dashboard-grid">

      <div class="card analytics-card">

          <h2>Procurement Analytics</h2>

          <div class="bar-chart">
              ${monthlyBars()}
          </div>

      </div>

      <div class="card profile-card">

          <div class="profile-avatar">
              ${user.name?.charAt(0) || 'U'}
          </div>

          <h3>${user.name}</h3>

          <p>${user.role}</p>

          <div class="profile-stats">

              <div>
                  <strong>${stats.rfqs}</strong>
                  <span>RFQs</span>
              </div>

              <div>
                  <strong>${stats.pos}</strong>
                  <span>POs</span>
              </div>

          </div>

      </div>

  </section>

  <section class="card">

      <h2>Recent Activity</h2>

      <div class="table-wrapper">

      <table>

      <thead>
      <tr>
      <th>Time</th>
      <th>User</th>
      <th>Action</th>
      <th>Module</th>
      </tr>
      </thead>

      <tbody>

      ${LogService.getRecent(6).map(l => `
      <tr>
      <td>${VB.dateTime(l.timestamp)}</td>
      <td>${l.userName}</td>
      <td>${l.action}</td>
      <td>${l.module}</td>
      </tr>
      `).join('')}

      </tbody>

      </table>

      </div>

  </section>

  `;
});

function stat(label,value,cls,icon){
  return `
    <div class="stat-card ${cls}">
        <div>
            <div>${label}</div>
            <div class="stat-number">${value}</div>
        </div>

        <div class="stat-icon">
            ${icon}
        </div>
    </div>
  `;
}

function monthlyBars(){

  const months=['Jan','Feb','Mar','Apr','May','Jun'];

  return months.map((m,i)=>`
    <div class="bar" style="height:${80+i*25}px">
      <span>${m}</span>
    </div>
  `).join('');

}