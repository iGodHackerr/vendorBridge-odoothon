const API_BASE_URL = "http://localhost:8080/api";

const AuthUI = {
  message: (id, text, type) => {
    const el = document.getElementById(id);
    el.className = `message ${type} show`;
    el.textContent = text;
  }
};

document.addEventListener('DOMContentLoaded', () => {

  const page = document.body.dataset.authPage;

  // ================= LOGIN =================

  if (page === 'login') {

    const params = new URLSearchParams(location.search);

    if (params.get('registered')) {
      AuthUI.message(
        'message',
        'Account created successfully. Please log in.',
        'success'
      );
    }

    document.getElementById('togglePassword').onclick = () => {
      const input = document.getElementById('password');

      input.type = input.type === 'password' ? 'text' : 'password';

      document.getElementById('togglePassword').textContent =
        input.type === 'password' ? 'Show' : 'Hide';
    };

    document.getElementById('forgotLink').onclick = (e) => {
      e.preventDefault();
      loginCard.classList.add('hidden');
      forgotCard.classList.remove('hidden');
    };

    document.getElementById('backLogin').onclick = (e) => {
      e.preventDefault();
      forgotCard.classList.add('hidden');
      loginCard.classList.remove('hidden');
    };

    document.getElementById('forgotForm').onsubmit = (e) => {
      e.preventDefault();

      AuthUI.message(
        'forgotMessage',
        'Password reset link has been sent to your email',
        'success'
      );
    };

    // LOGIN API

    document.getElementById('loginForm').onsubmit = async (e) => {

      e.preventDefault();

      const email = emailEl().value.trim().toLowerCase();

      const password = document.getElementById('password').value;

      try {

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email,
            password
          })
        });

        const data = await response.json();

        if (!response.ok) {
          AuthUI.message(
            'message',
            data.message || 'Invalid email or password.',
            'error'
          );
          return;
        }

        // SAVE SESSION

        localStorage.setItem(
          "currentUser",
          JSON.stringify(data)
        );

        window.location.href = "dashboard.html";

      } catch (error) {

        console.error(error);

        AuthUI.message(
          'message',
          'Server error. Please try again.',
          'error'
        );
      }
    };
  }

  // ================= SIGNUP =================

  if (page === 'signup') {

    document.getElementById('signupForm').onsubmit = async (e) => {

      e.preventDefault();

      const name = document.getElementById('name').value.trim();

      const email = document.getElementById('email').value.trim().toLowerCase();

      const password = document.getElementById('password').value;

      const confirmPassword =
        document.getElementById('confirmPassword').value;

      const role = document.getElementById('role').value;

      // VALIDATION

      if (!name || !email || !password || !confirmPassword) {

        AuthUI.message(
          'message',
          'All fields are required.',
          'error'
        );

        return;
      }

      if (password !== confirmPassword) {

        AuthUI.message(
          'message',
          'Passwords do not match.',
          'error'
        );

        return;
      }

      try {

        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name,
            email,
            password,
            role
          })
        });

        const data = await response.json();

        if (!response.ok) {

          AuthUI.message(
            'message',
            data.message || 'Registration failed.',
            'error'
          );

          return;
        }

        window.location.href = "login.html?registered=1";

      } catch (error) {

        console.error(error);

        AuthUI.message(
          'message',
          'Server error. Please try again.',
          'error'
        );
      }
    };
  }
});

function emailEl() {
  return document.getElementById('email');
}

