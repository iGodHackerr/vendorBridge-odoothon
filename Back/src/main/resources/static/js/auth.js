const AuthUI = {
  message: (id, text, type) => { const el = document.getElementById(id); el.className = `message ${type} show`; el.textContent = text; },
  users: () => StorageService.get('users')
};

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.authPage;
  if (page === 'login') {
    const params = new URLSearchParams(location.search);
    if (params.get('registered')) AuthUI.message('message', 'Account created successfully. Please log in.', 'success');
    document.getElementById('togglePassword').onclick = () => {
      const input = document.getElementById('password');
      input.type = input.type === 'password' ? 'text' : 'password';
      document.getElementById('togglePassword').textContent = input.type === 'password' ? 'Show' : 'Hide';
    };
    document.getElementById('forgotLink').onclick = (e) => { e.preventDefault(); loginCard.classList.add('hidden'); forgotCard.classList.remove('hidden'); };
    document.getElementById('backLogin').onclick = (e) => { e.preventDefault(); forgotCard.classList.add('hidden'); loginCard.classList.remove('hidden'); };
    document.getElementById('forgotForm').onsubmit = (e) => { e.preventDefault(); AuthUI.message('forgotMessage', 'Password reset link has been sent to your email', 'success'); };
    document.getElementById('loginForm').onsubmit = (e) => {
      e.preventDefault();
      const email = emailEl().value.trim().toLowerCase();
      const password = document.getElementById('password').value;
      const user = AuthUI.users().find(u => u.email.toLowerCase() === email && u.password === password);
      if (!user) { AuthUI.message('message', 'Invalid email or password.', 'error'); return; }
      const session = { id: user.id, name: user.name, email: user.email, role: user.role };
      StorageService.set('currentUser', session);
      LogService.add(user.id, user.name, user.role, 'User logged in', 'Auth');
      window.location.href = 'dashboard.html';
    };
  }
  if (page === 'signup') {
    document.getElementById('signupForm').onsubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const role = document.getElementById('role').value;
      if (!name || !email || !password || !confirmPassword) { AuthUI.message('message', 'All fields are required.', 'error'); return; }
      if (password !== confirmPassword) { AuthUI.message('message', 'Passwords do not match.', 'error'); return; }
      const users = AuthUI.users();
      if (users.some(u => u.email.toLowerCase() === email)) { AuthUI.message('message', 'Email is already registered.', 'error'); return; }
      users.push({ id: StorageService.generateId(), name, email, password, role });
      StorageService.set('users', users);
      window.location.href = 'login.html?registered=1';
    };
  }
});

function emailEl() { return document.getElementById('email'); }
