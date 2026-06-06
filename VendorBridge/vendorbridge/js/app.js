const VB = {
  pagePath: (file) => window.location.pathname.includes('/pages/') ? file : `pages/${file}`,
  rootPath: () => window.location.pathname.includes('/pages/') ? '../' : '',
  currentUser: () => StorageService.getObject('currentUser'),
  money: (value) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`,
  date: (value) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
  dateTime: (value) => value ? new Date(value).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '',
  badgeClass: (status) => {
    if (['Active', 'Approved', 'Paid', 'Accepted'].includes(status)) return 'badge-green';
    if (['Inactive', 'Rejected'].includes(status)) return 'badge-red';
    if (['Pending', 'Open'].includes(status)) return 'badge-orange';
    if (['Submitted', 'Generated', 'Sent', 'In Progress'].includes(status)) return 'badge-blue';
    return 'badge-grey';
  },
  badge: (status) => `<span class="badge ${VB.badgeClass(status)}">${status || 'N/A'}</span>`,
  toast: (message, type = 'success') => {
    document.querySelectorAll('.toast').forEach(toast => toast.remove());
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },
  modal: (title, body, footer = '', large = false) => {
    const existing = document.getElementById('modal-root');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'modal-root';
    overlay.className = 'modal-overlay open';
    overlay.innerHTML = `
      <div class="modal-box ${large ? 'modal-large' : ''}">
        <div class="modal-header">
          <h2>${title}</h2>
          <button class="modal-close" data-close aria-label="Close">&times;</button>
        </div>
        <div class="modal-body">${body}</div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', event => {
      if (event.target === overlay || event.target.dataset.close !== undefined) overlay.remove();
    });
    return overlay;
  },
  confirm: (title, message, onConfirm, danger = false) => {
    const overlay = VB.modal(
      title,
      `<p>${message}</p>`,
      `<button class="btn btn-outline" data-close>Cancel</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="confirm-action">Confirm</button>`
    );
    overlay.querySelector('#confirm-action').addEventListener('click', () => {
      onConfirm();
      overlay.remove();
    });
  },
  requireRole: (roles) => {
    const user = VB.currentUser();
    if (!user || !roles.includes(user.role)) window.location.href = 'dashboard.html';
    return user;
  },
  activeVendorForUser: (user) => VendorService.getAll().find(vendor => vendor.email.toLowerCase() === user.email.toLowerCase())
};

function renderLayout(pageTitle) {
  const user = VB.currentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  const navs = {
    'Procurement Officer': [
      ['dashboard.html', 'Dashboard', 'Home'],
      ['vendors.html', 'Vendors', 'Vendors'],
      ['rfq.html', 'RFQs', 'RFQs'],
      ['comparison.html', 'Quotation Comparison', 'Compare'],
      ['purchase-orders.html', 'Purchase Orders', 'POs'],
      ['invoices.html', 'Invoices', 'Invoices'],
      ['activity-logs.html', 'Activity Logs', 'Logs']
    ],
    Vendor: [
      ['dashboard.html', 'Dashboard', 'Home'],
      ['rfq.html', 'My RFQs', 'RFQs'],
      ['quotations.html', 'Submit Quotation', 'Quotes'],
      ['activity-logs.html', 'Activity Logs', 'Logs']
    ],
    Manager: [
      ['dashboard.html', 'Dashboard', 'Home'],
      ['approvals.html', 'Approvals', 'Approvals'],
      ['reports.html', 'Reports', 'Reports'],
      ['activity-logs.html', 'Activity Logs', 'Logs']
    ],
    Admin: [
      ['dashboard.html', 'Dashboard', 'Home'],
      ['vendors.html', 'Vendor Management', 'Vendors'],
      ['reports.html', 'Reports', 'Reports'],
      ['activity-logs.html', 'Activity Logs', 'Logs']
    ]
  };
  const icons = {
    Home: 'DB',
    Vendors: 'VN',
    RFQs: 'RFQ',
    Compare: 'QC',
    Approvals: 'AP',
    POs: 'PO',
    Invoices: 'INV',
    Logs: 'LG',
    Reports: 'RP',
    Quotes: 'QT'
  };

  const current = location.pathname.split('/').pop();
  const nav = (navs[user.role] || navs.Admin)
    .map(([href, label, key]) => `
      <a class="nav-link ${href === current ? 'active' : ''}" href="${href}">
        <span class="nav-icon">${icons[key]}</span>
        <span>${label}</span>
      </a>
    `).join('');

  document.body.insertAdjacentHTML('afterbegin', `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <span class="logo-lockup"><span class="logo-mark">VB</span><span>VendorBridge</span></span>
        <button class="sidebar-close" id="sidebarClose" aria-label="Close menu">&times;</button>
      </div>
      <nav>${nav}</nav>
    </aside>
    <div class="sidebar-backdrop" id="sidebarBackdrop"></div>
    <header class="app-header">
      <div class="header-left">
        <button class="hamburger" id="hamburger" aria-label="Open menu">&#9776;</button>
        <div class="page-title">${pageTitle}</div>
      </div>
      <div class="header-right">
        <div class="notification-wrap">
          <button class="notification-btn" id="notificationBtn" aria-label="Recent notifications">
            <span class="notification-glyph">N</span>
            <span class="notification-count" id="notificationCount">0</span>
          </button>
          <div class="notification-panel" id="notificationPanel"></div>
        </div>
        <div class="user-avatar">${getUserInitials(user.name)}</div>
        <span class="user-name">${user.name}</span>
        <span class="role-badge">${user.role}</span>
        <button class="btn btn-outline btn-sm" id="logoutBtn">Logout</button>
      </div>
    </header>
  `);

  const main = document.querySelector('main');
  if (main) main.classList.add('main-content');

  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  const closeMenu = () => {
    sidebar.classList.remove('open');
    backdrop.classList.remove('open');
  };

  document.getElementById('hamburger').onclick = () => {
    sidebar.classList.add('open');
    backdrop.classList.add('open');
  };
  document.getElementById('sidebarClose').onclick = closeMenu;
  backdrop.onclick = closeMenu;
  document.getElementById('logoutBtn').onclick = () => {
    LogService.add(user.id, user.name, user.role, 'User logged out', 'Auth');
    StorageService.remove('currentUser');
    window.location.href = 'login.html';
  };

  renderNotifications();
}

function renderNotifications() {
  const logs = LogService.getAll();
  const dayAgo = Date.now() - 86400000;
  document.getElementById('notificationCount').textContent = logs.filter(log => new Date(log.timestamp).getTime() >= dayAgo).length;

  const panel = document.getElementById('notificationPanel');
  panel.innerHTML = LogService.getRecent(5)
    .map(log => `<div class="notification-item"><strong>${log.action}</strong><br><span class="muted">${VB.dateTime(log.timestamp)}</span></div>`)
    .join('') || '<div class="notification-item muted">No recent activity</div>';

  document.getElementById('notificationBtn').onclick = () => panel.classList.toggle('open');
  panel.onclick = () => panel.classList.remove('open');
}

function getUserInitials(name) {
  return String(name || 'VB')
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function seedData() {
  if (localStorage.getItem('seeded')) return;
  const users = [
    { id: StorageService.generateId(), name: 'Arjun Sharma', email: 'officer@vendorbridge.com', password: 'password123', role: 'Procurement Officer' },
    { id: StorageService.generateId(), name: 'Riya Patel', email: 'vendor@vendorbridge.com', password: 'password123', role: 'Vendor' },
    { id: StorageService.generateId(), name: 'Suresh Mehta', email: 'manager@vendorbridge.com', password: 'password123', role: 'Manager' },
    { id: StorageService.generateId(), name: 'Admin User', email: 'admin@vendorbridge.com', password: 'password123', role: 'Admin' }
  ];
  StorageService.set('users', users);
  const vendors = [
    VendorService.add({ name: 'Tata Electronics Pvt Ltd', category: 'Electronics', gst: '27AABCT3518Q1ZS', email: 'tata@vendor.com', phone: '9876543210', status: 'Active', contactPerson: 'Tata Sales', address: 'Mumbai, Maharashtra' }),
    VendorService.add({ name: 'Infosys IT Services', category: 'IT Services', gst: '29AABCI1681G1ZK', email: 'infosys@vendor.com', phone: '9876543211', status: 'Active', contactPerson: 'Infosys Sales', address: 'Bengaluru, Karnataka' }),
    VendorService.add({ name: 'Reliance Office Supplies', category: 'Office Supplies', gst: '24AAACR5055K1ZG', email: 'vendor@vendorbridge.com', phone: '9876543212', status: 'Active', contactPerson: 'Riya Patel', address: 'Ahmedabad, Gujarat' }),
    VendorService.add({ name: 'BlueDart Logistics', category: 'Logistics', gst: '32AABCB0697M1Z4', email: 'bluedart@vendor.com', phone: '9876543213', status: 'Active', contactPerson: 'BlueDart Sales', address: 'Kochi, Kerala' })
  ];
  const deadline30 = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
  const deadline15 = new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10);
  const rfq1 = RFQService.add({ rfqNumber: 'RFQ-001', title: 'Laptop Procurement Q1', description: 'Q1 laptop procurement', product: 'Dell Laptop', quantity: 20, unit: 'pcs', deadline: deadline30, assignedVendorIds: [vendors[0].id, vendors[1].id], status: 'Open' });
  const rfq2 = RFQService.add({ rfqNumber: 'RFQ-002', title: 'Office Furniture Supply', description: 'Office chairs for expansion', product: 'Office Chair', quantity: 50, unit: 'pcs', deadline: deadline15, assignedVendorIds: [vendors[2].id], status: 'Awarded' });
  QuotationService.add({ rfqId: rfq1.id, vendorId: vendors[0].id, vendorName: vendors[0].name, unitPrice: 45000, totalPrice: 900000, deliveryDays: 10, notes: 'Standard warranty included', status: 'Submitted' });
  QuotationService.add({ rfqId: rfq1.id, vendorId: vendors[1].id, vendorName: vendors[1].name, unitPrice: 47000, totalPrice: 940000, deliveryDays: 7, notes: 'Express delivery available', status: 'Submitted' });
  const q3 = QuotationService.add({ rfqId: rfq2.id, vendorId: vendors[2].id, vendorName: vendors[2].name, unitPrice: 3500, totalPrice: 175000, deliveryDays: 5, notes: 'Bulk discount applied', status: 'Accepted' });
  const approval = ApprovalService.add({ rfqId: rfq2.id, quotationId: q3.id, rfqNumber: rfq2.rfqNumber, rfqTitle: rfq2.title, vendorId: vendors[2].id, vendorName: vendors[2].name, totalAmount: 175000, requestedBy: 'Arjun Sharma', requestedById: users[0].id, requestedAt: new Date(Date.now() - 4 * 3600000).toISOString(), rfqCreatedAt: rfq2.createdAt, quotationCreatedAt: q3.createdAt });
  ApprovalService.approve(approval.id, 'Best price and fastest delivery', users[2]);
  const approved = ApprovalService.getById(approval.id);
  POService.generateFromApproval(approved, q3, vendors[2]);
  InvoiceService.generateFromPO(POService.getAll()[0]);
  [
    ['Arjun Sharma', 'Procurement Officer', 'Seed vendors registered', 'Vendors'],
    ['Arjun Sharma', 'Procurement Officer', 'RFQ-001 and RFQ-002 created', 'RFQ'],
    ['Riya Patel', 'Vendor', 'Quotation submitted for RFQ-002', 'Quotations'],
    ['Suresh Mehta', 'Manager', 'Approved Reliance quotation for RFQ-002', 'Approvals'],
    ['Arjun Sharma', 'Procurement Officer', 'PO-001 and INV-001 generated', 'Invoices']
  ].forEach((entry, index) => LogService.add(users[index % users.length].id, entry[0], entry[1], entry[2], entry[3]));
  localStorage.setItem('seeded', 'true');
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.dataset.entry === 'index') {
    seedData();
    window.location.href = StorageService.getObject('currentUser') ? 'pages/dashboard.html' : 'pages/login.html';
  }
});
