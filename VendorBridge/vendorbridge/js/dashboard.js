document.addEventListener('DOMContentLoaded', () => {
  renderLayout('Dashboard');

  const user = VB.currentUser();
  if (!user) return;

  const root = document.getElementById('dashboardRoot');
  const data = collectDashboardData(user);
  const greeting = getGreeting();

  root.innerHTML = `
    <section class="dashboard-hero">
      <div class="hero-copy">
        <span class="hero-kicker">Procurement Command Center</span>
        <h1>${greeting}, ${escapeHtml(user.name.split(' ')[0] || 'User')}</h1>
        <p>${heroMessage(user, data)}</p>
        <div class="hero-actions">
          ${roleActions(user).map(action => `
            <a class="btn ${action.primary ? 'btn-primary' : 'btn-outline'}" href="${action.href}">
              <span class="btn-mark">${action.code}</span>${action.label}
            </a>
          `).join('')}
        </div>
      </div>
      <div class="hero-visual" aria-hidden="true">
        <div class="flow-node node-rfq"><span>RFQ</span><strong>${data.metrics.openRfqs}</strong></div>
        <div class="flow-node node-quote"><span>Quotes</span><strong>${data.metrics.submittedQuotes}</strong></div>
        <div class="flow-node node-po"><span>PO</span><strong>${data.metrics.purchaseOrders}</strong></div>
        <div class="flow-node node-invoice"><span>INV</span><strong>${data.metrics.outstandingInvoices}</strong></div>
        <div class="flow-rail rail-one"></div>
        <div class="flow-rail rail-two"></div>
        <div class="flow-rail rail-three"></div>
      </div>
    </section>

    <section class="metric-grid" aria-label="Dashboard metrics">
      ${metricCard('Active RFQs', data.metrics.openRfqs, `${data.metrics.totalRfqs} total requests`, 'RFQ', 'blue')}
      ${metricCard(data.pendingLabel, data.pendingValue, data.pendingDetail, 'AP', 'amber')}
      ${metricCard('PO Value', VB.money(data.metrics.poValue), `${data.metrics.purchaseOrders} purchase orders`, 'PO', 'green')}
      ${metricCard('Invoices Open', data.metrics.outstandingInvoices, `${VB.money(data.metrics.invoiceExposure)} outstanding`, 'INV', 'rose')}
    </section>

    <section class="dashboard-main-grid">
      <article class="card dashboard-card spend-card">
        <div class="card-heading">
          <div>
            <span class="section-kicker">Spend Rhythm</span>
            <h2>Monthly procurement value</h2>
          </div>
          <strong>${VB.money(data.metrics.poValue)}</strong>
        </div>
        <div class="chart-bars">
          ${renderMonthlyBars(data.monthlySpend)}
        </div>
      </article>

      <article class="card dashboard-card">
        <div class="card-heading">
          <div>
            <span class="section-kicker">Smart Focus</span>
            <h2>Today&apos;s priorities</h2>
          </div>
        </div>
        <div class="insight-list">
          ${data.insights.map(renderInsight).join('')}
        </div>
      </article>
    </section>

    <section class="dashboard-main-grid dashboard-main-grid-secondary">
      <article class="card dashboard-card">
        <div class="card-heading">
          <div>
            <span class="section-kicker">Workflow</span>
            <h2>Procurement pipeline</h2>
          </div>
        </div>
        <div class="pipeline-list">
          ${data.pipeline.map(step => renderPipelineStep(step, data.pipelineMax)).join('')}
        </div>
      </article>

      <article class="card dashboard-card">
        <div class="card-heading">
          <div>
            <span class="section-kicker">${user.role === 'Vendor' ? 'My Work' : 'Vendor Network'}</span>
            <h2>${user.role === 'Vendor' ? 'Submission health' : 'Top vendor signals'}</h2>
          </div>
          <a class="text-link" href="${user.role === 'Vendor' ? 'quotations.html' : 'vendors.html'}">Open</a>
        </div>
        <div class="vendor-list">
          ${data.vendorSignals.length ? data.vendorSignals.map(renderVendorSignal).join('') : emptyLine('No vendor data yet')}
        </div>
      </article>
    </section>

    <section class="dashboard-main-grid dashboard-main-grid-secondary">
      <article class="card dashboard-card">
        <div class="card-heading">
          <div>
            <span class="section-kicker">RFQ Radar</span>
            <h2>Nearest deadlines</h2>
          </div>
          <a class="text-link" href="rfq.html">View RFQs</a>
        </div>
        <div class="radar-list">
          ${data.urgentRfqs.length ? data.urgentRfqs.map(renderRfqRadar).join('') : emptyLine('No open RFQ deadlines')}
        </div>
      </article>

      <article class="card dashboard-card">
        <div class="card-heading">
          <div>
            <span class="section-kicker">Audit Trail</span>
            <h2>Recent activity</h2>
          </div>
          <a class="text-link" href="activity-logs.html">Logs</a>
        </div>
        <div class="activity-list">
          ${data.recentLogs.length ? data.recentLogs.map(renderActivity).join('') : emptyLine('No activity recorded')}
        </div>
      </article>
    </section>
  `;
});

function collectDashboardData(user) {
  const all = {
    vendors: VendorService.getAll(),
    rfqs: RFQService.getAll(),
    quotes: QuotationService.getAll(),
    approvals: ApprovalService.getAll(),
    pos: POService.getAll(),
    invoices: InvoiceService.getAll(),
    logs: LogService.getAll()
  };

  const activeVendor = user.role === 'Vendor' ? VB.activeVendorForUser(user) : null;
  const scope = getScope(user, activeVendor, all);

  const openRfqs = scope.rfqs.filter(rfq => rfq.status === 'Open');
  const submittedQuotes = scope.quotes.filter(quote => ['Submitted', 'Accepted'].includes(quote.status));
  const pendingApprovals = scope.approvals.filter(approval => approval.status === 'Pending');
  const outstandingInvoices = scope.invoices.filter(invoice => invoice.status !== 'Paid');
  const poValue = sum(scope.pos, 'grandTotal');
  const invoiceExposure = sum(outstandingInvoices, 'grandTotal');

  const metrics = {
    totalRfqs: scope.rfqs.length,
    openRfqs: openRfqs.length,
    submittedQuotes: submittedQuotes.length,
    pendingApprovals: pendingApprovals.length,
    purchaseOrders: scope.pos.length,
    outstandingInvoices: outstandingInvoices.length,
    poValue,
    invoiceExposure
  };

  const pendingMode = user.role === 'Vendor'
    ? {
        pendingLabel: 'Submitted Quotes',
        pendingValue: submittedQuotes.length,
        pendingDetail: `${scope.quotes.filter(quote => quote.status === 'Accepted').length} accepted quotes`
      }
    : {
        pendingLabel: 'Pending Approvals',
        pendingValue: pendingApprovals.length,
        pendingDetail: `${VB.money(sum(pendingApprovals, 'totalAmount'))} waiting`
      };

  const pipeline = [
    { label: 'RFQs Created', value: scope.rfqs.length, helper: `${openRfqs.length} active`, tone: 'blue' },
    { label: 'Quotes Received', value: scope.quotes.length, helper: `${submittedQuotes.length} submitted`, tone: 'teal' },
    { label: 'Approvals', value: scope.approvals.length, helper: `${pendingApprovals.length} pending`, tone: 'amber' },
    { label: 'Purchase Orders', value: scope.pos.length, helper: VB.money(poValue), tone: 'green' },
    { label: 'Invoices', value: scope.invoices.length, helper: `${outstandingInvoices.length} open`, tone: 'rose' }
  ];

  return {
    activeVendor,
    metrics,
    ...pendingMode,
    monthlySpend: getMonthlySpend(scope.pos),
    insights: buildInsights(scope, metrics),
    pipeline,
    pipelineMax: Math.max(...pipeline.map(step => step.value), 1),
    vendorSignals: getVendorSignals(user, activeVendor, all, scope),
    urgentRfqs: getUrgentRfqs(openRfqs),
    recentLogs: scope.logs.slice(0, 5)
  };
}

function getScope(user, activeVendor, all) {
  if (user.role !== 'Vendor') return all;
  if (!activeVendor) {
    return { vendors: [], rfqs: [], quotes: [], approvals: [], pos: [], invoices: [], logs: all.logs.filter(log => log.userId === user.id) };
  }

  return {
    vendors: [activeVendor],
    rfqs: all.rfqs.filter(rfq => (rfq.assignedVendorIds || []).includes(activeVendor.id)),
    quotes: all.quotes.filter(quote => quote.vendorId === activeVendor.id),
    approvals: all.approvals.filter(approval => approval.vendorId === activeVendor.id),
    pos: all.pos.filter(po => po.vendorId === activeVendor.id),
    invoices: all.invoices.filter(invoice => invoice.vendorId === activeVendor.id),
    logs: all.logs.filter(log => log.userId === user.id || log.userName === user.name || log.module === 'Quotations')
  };
}

function buildInsights(scope, metrics) {
  const dueSoon = getUrgentRfqs(scope.rfqs.filter(rfq => rfq.status === 'Open')).filter(item => item.days <= 7);
  const largestInvoice = scope.invoices
    .filter(invoice => invoice.status !== 'Paid')
    .sort((a, b) => Number(b.grandTotal || 0) - Number(a.grandTotal || 0))[0];
  const pendingAmount = sum(scope.approvals.filter(approval => approval.status === 'Pending'), 'totalAmount');
  const acceptedQuotes = scope.quotes.filter(quote => quote.status === 'Accepted').length;

  return [
    {
      label: 'Approval pressure',
      value: metrics.pendingApprovals ? `${metrics.pendingApprovals} waiting` : 'Clear',
      detail: metrics.pendingApprovals ? `${VB.money(pendingAmount)} needs a decision` : 'No approvals are blocked right now',
      tone: metrics.pendingApprovals ? 'amber' : 'green'
    },
    {
      label: 'Deadline risk',
      value: dueSoon.length ? `${dueSoon.length} due soon` : 'Stable',
      detail: dueSoon.length ? `${escapeHtml(dueSoon[0].rfqNumber)} is ${formatDays(dueSoon[0].days).toLowerCase()}` : 'Open RFQs have breathing room',
      tone: dueSoon.length ? 'rose' : 'blue'
    },
    {
      label: 'Conversion',
      value: `${acceptedQuotes}/${Math.max(scope.quotes.length, 1)}`,
      detail: scope.quotes.length ? 'Accepted quotes from submitted responses' : 'No quotations submitted yet',
      tone: acceptedQuotes ? 'green' : 'teal'
    },
    {
      label: 'Invoice exposure',
      value: largestInvoice ? VB.money(largestInvoice.grandTotal) : 'None',
      detail: largestInvoice ? `${escapeHtml(largestInvoice.invoiceNumber)} from ${escapeHtml(largestInvoice.vendorName)}` : 'No outstanding invoice value',
      tone: largestInvoice ? 'amber' : 'green'
    }
  ];
}

function getVendorSignals(user, activeVendor, all, scope) {
  if (user.role === 'Vendor') {
    return [{
      name: activeVendor ? activeVendor.name : user.name,
      category: activeVendor ? activeVendor.category : 'Vendor profile',
      quotes: scope.quotes.length,
      value: sum(scope.pos, 'grandTotal'),
      status: activeVendor ? activeVendor.status : 'Pending'
    }];
  }

  return all.vendors.map(vendor => {
    const vendorQuotes = all.quotes.filter(quote => quote.vendorId === vendor.id);
    const accepted = vendorQuotes.filter(quote => quote.status === 'Accepted').length;
    const vendorPOs = all.pos.filter(po => po.vendorId === vendor.id);

    return {
      name: vendor.name,
      category: vendor.category,
      quotes: vendorQuotes.length,
      accepted,
      value: sum(vendorPOs, 'grandTotal'),
      status: vendor.status
    };
  })
  .sort((a, b) => (b.value + b.accepted * 10000 + b.quotes * 1000) - (a.value + a.accepted * 10000 + a.quotes * 1000))
  .slice(0, 4);
}

function getMonthlySpend(pos) {
  const buckets = [];
  const today = new Date();

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    buckets.push({
      month: date.getMonth(),
      year: date.getFullYear(),
      label: date.toLocaleDateString('en-IN', { month: 'short' }),
      value: 0
    });
  }

  pos.forEach(po => {
    const date = new Date(po.date || po.createdAt || Date.now());
    const bucket = buckets.find(item => item.month === date.getMonth() && item.year === date.getFullYear());
    if (bucket) bucket.value += Number(po.grandTotal || 0);
  });

  const max = Math.max(...buckets.map(bucket => bucket.value), 1);
  return buckets.map(bucket => ({ ...bucket, level: Math.max(10, Math.round((bucket.value / max) * 100)) }));
}

function getUrgentRfqs(openRfqs) {
  return openRfqs
    .map(rfq => ({ ...rfq, days: daysUntil(rfq.deadline) }))
    .sort((a, b) => a.days - b.days)
    .slice(0, 4);
}

function renderMonthlyBars(items) {
  return items.map(item => `
    <div class="chart-bar">
      <div class="chart-bar-track">
        <div class="chart-bar-fill" style="--level:${item.level}"></div>
      </div>
      <span>${item.label}</span>
      <strong>${item.value ? compactMoney(item.value) : '0'}</strong>
    </div>
  `).join('');
}

function renderPipelineStep(step, max) {
  const width = Math.max(8, Math.round((step.value / max) * 100));
  return `
    <div class="pipeline-step">
      <div class="pipeline-meta">
        <span>${step.label}</span>
        <strong>${typeof step.value === 'number' ? step.value : escapeHtml(step.value)}</strong>
      </div>
      <div class="pipeline-track"><div class="pipeline-fill ${step.tone}" style="width:${width}%"></div></div>
      <small>${step.helper}</small>
    </div>
  `;
}

function renderInsight(item) {
  return `
    <div class="insight-row">
      <span class="status-dot ${item.tone}"></span>
      <div>
        <span>${item.label}</span>
        <strong>${item.value}</strong>
        <small>${item.detail}</small>
      </div>
    </div>
  `;
}

function renderVendorSignal(item) {
  return `
    <div class="vendor-row">
      <div class="vendor-avatar">${getInitials(item.name)}</div>
      <div class="vendor-main">
        <strong>${escapeHtml(item.name)}</strong>
        <span>${escapeHtml(item.category || 'General')}</span>
      </div>
      <div class="vendor-numbers">
        <strong>${VB.money(item.value)}</strong>
        <span>${item.quotes} quotes</span>
      </div>
      ${VB.badge(item.status)}
    </div>
  `;
}

function renderRfqRadar(rfq) {
  const tone = rfq.days < 0 ? 'rose' : rfq.days <= 3 ? 'amber' : 'blue';
  return `
    <div class="radar-row">
      <span class="status-dot ${tone}"></span>
      <div>
        <strong>${escapeHtml(rfq.rfqNumber)} - ${escapeHtml(rfq.title)}</strong>
        <small>${escapeHtml(rfq.product)} / ${rfq.quantity} ${escapeHtml(rfq.unit)}</small>
      </div>
      <span class="deadline-pill ${tone}">${formatDays(rfq.days)}</span>
    </div>
  `;
}

function renderActivity(log) {
  return `
    <div class="activity-row">
      <div class="activity-mark">${getInitials(log.module || 'Log')}</div>
      <div>
        <strong>${escapeHtml(log.action)}</strong>
        <small>${escapeHtml(log.userName)} / ${escapeHtml(log.module)} / ${VB.dateTime(log.timestamp)}</small>
      </div>
    </div>
  `;
}

function metricCard(label, value, detail, code, tone) {
  return `
    <article class="metric-card ${tone}">
      <div class="metric-icon">${code}</div>
      <span>${label}</span>
      <strong>${value}</strong>
      <small>${detail}</small>
    </article>
  `;
}

function roleActions(user) {
  const actions = {
    'Procurement Officer': [
      { label: 'Create RFQ', href: 'rfq.html', code: 'RFQ', primary: true },
      { label: 'Compare Quotes', href: 'comparison.html', code: 'QC' },
      { label: 'Manage Vendors', href: 'vendors.html', code: 'VN' }
    ],
    Vendor: [
      { label: 'View RFQs', href: 'rfq.html', code: 'RFQ', primary: true },
      { label: 'Submit Quote', href: 'quotations.html', code: 'QT' },
      { label: 'Activity', href: 'activity-logs.html', code: 'LG' }
    ],
    Manager: [
      { label: 'Review Approvals', href: 'approvals.html', code: 'AP', primary: true },
      { label: 'Reports', href: 'reports.html', code: 'RP' },
      { label: 'Activity', href: 'activity-logs.html', code: 'LG' }
    ],
    Admin: [
      { label: 'Vendors', href: 'vendors.html', code: 'VN', primary: true },
      { label: 'Reports', href: 'reports.html', code: 'RP' },
      { label: 'Activity', href: 'activity-logs.html', code: 'LG' }
    ]
  };

  return actions[user.role] || actions.Admin;
}

function heroMessage(user, data) {
  if (user.role === 'Vendor') {
    return `You have ${data.metrics.openRfqs} active RFQs, ${data.metrics.submittedQuotes} submitted quotes, and ${data.metrics.outstandingInvoices} open invoices.`;
  }
  if (user.role === 'Manager') {
    return `Approvals, risk, and spend are lined up in one view with ${data.metrics.pendingApprovals} decisions waiting.`;
  }
  return `Track vendors, RFQs, quotations, approvals, purchase orders, and invoices from one live workspace.`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getInitials(value) {
  return String(value || 'VB')
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function daysUntil(value) {
  if (!value) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(value);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due - today) / 86400000);
}

function formatDays(days) {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `${days}d left`;
}

function compactMoney(value) {
  const amount = Number(value || 0);
  if (amount >= 10000000) return `Rs ${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `Rs ${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `Rs ${(amount / 1000).toFixed(0)}K`;
  return `Rs ${amount}`;
}

function sum(items, key) {
  return items.reduce((total, item) => total + Number(item[key] || 0), 0);
}

function emptyLine(text) {
  return `<div class="empty-line">${text}</div>`;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
