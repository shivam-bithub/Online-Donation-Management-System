// login.js — handles login form submission (v2.0)
const API = API_CONFIG.BASE_URL;
console.log('✅ login.js loaded - Using API:', API);

// Check if running from file:// protocol and warn user
if (window.location.protocol === 'file:') {
  console.warn('⚠️ Page opened via file:// protocol. For best results, use a local web server.');
  console.warn('💡 Tip: Use VS Code Live Server extension or run: python -m http.server 5500');
}

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const userType = document.getElementById('userType').value;
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('loginError');
  errorEl.textContent = '';

  if (!email || !password || !userType) {
    errorEl.textContent = 'Please fill in all fields.';
    return;
  }
  if (!['Donor','Receiver','NGO','Staff'].includes(userType)) {
    errorEl.textContent = 'Please select a valid user type.';
    return;
  }

  try {
    const loginUrl = `${API}/auth/login`;
    console.log('Attempting login to:', loginUrl);
    const res = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, userType }),
    });

    const text = await res.text();
    if (!text) {
      errorEl.textContent = 'Empty response from server. Please check if the server is running.';
      return;
    }

    // Check if response is HTML (error page) instead of JSON
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      errorEl.textContent = 'Server error: Received HTML instead of JSON. Please check if the API server is running on port 3000.';
      console.error('Received HTML response:', text.substring(0, 200));
      return;
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      errorEl.textContent = 'Invalid response from server. Please check the server connection.';
      console.error('JSON parse error:', parseError, 'Response:', text.substring(0, 200));
      return;
    }

    if (!res.ok) {
      errorEl.textContent = data.message || data.error || 'Login failed.';
      return;
    }

    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('userType', data.userType || userType);
      // Persist basic user info expected by other frontend pages
      if (data.userId) localStorage.setItem('userId', data.userId);
      if (data.username) localStorage.setItem('username', data.username);
      if (data.email) localStorage.setItem('email', data.email);
    }
    window.location.href = 'index.html';
  } catch (err) {
    console.error('Login error:', err);
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      errorEl.textContent = 'Cannot connect to server. Please make sure the backend server is running on port 3000.';
    } else {
      errorEl.textContent = err.message || 'Network error. Please try again.';
    }
  }
});
