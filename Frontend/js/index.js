/* index.js — Home page behavior */

// ---------- Helpers ----------
const apiBase = 'http://localhost:3000/api'; // Backend API base URL

async function fetchWithAuth(url, opts = {}) {
  const token = localStorage.getItem('token');
  opts.headers = opts.headers || {};
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  return fetch(url, opts);
}

// Try to read user's role: prefer a secure me endpoint, fallback to token decode
async function getUserRole() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  // First, try to decode locally and check expiration
  let decoded = null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    decoded = payload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.warn('Token expired at', new Date(payload.exp * 1000));
      localStorage.removeItem('token');
      return null;
    }
  } catch (e) {
    console.warn('Failed to decode token:', e.message);
    return null;
  }
  
  // try endpoint
  try {
    const res = await fetchWithAuth(`${apiBase}/auth/me`);
    if (res.ok) {
      const j = await res.json();
      // Prefer explicit role; fallback to userType lowercased
      if (j && j.role) return j.role;
      if (j && j.userType) return String(j.userType).toLowerCase();
      return null;
    } else if (res.status === 403) {
      console.error('Token rejected by server (403):', res);
      localStorage.removeItem('token');
      return null;
    } else {
      console.warn('getUserRole: /auth/me returned', res.status);
    }
  } catch (e) {
    console.warn('getUserRole: fetch error', e.message);
  }

  // fallback: use decoded token
  return decoded?.userType ? String(decoded.userType).toLowerCase() : null;
}

// ---------- NAVBAR ROLE DISPLAY ----------
async function initNavbar() {
  const navLinks = document.getElementById('nav-links');
  const authLink = document.getElementById('auth-link');
  const orgLink = document.getElementById('org-link');

  const role = await getUserRole();
  if (role) {
    // logged in
    authLink.style.display = 'none';

    // fetch current user to show name/initials and photo
    let displayName = 'Profile';
    let userPhoto = '';
    try {
      const meRes = await fetchWithAuth(`${apiBase}/auth/me`);
      if (meRes.ok) {
        const me = await meRes.json();
        displayName = me?.username || me?.email || 'Profile';
        userPhoto = me?.avatarUrl || '';
      } else if (meRes.status === 403) {
        // Token was rejected - force logout
        console.error('Token rejected (403), logging out');
        localStorage.removeItem('token');
        location.reload();
        return;
      }
    } catch (err) {
      console.error('Navbar fetch error:', err);
    }

    // dashboard link depending on role
    let dashHref = 'donor-dashboard.html';
    if (role === 'staff') dashHref = 'staff-dashboard.html';
    if (role === 'receiver') dashHref = 'receiver-dashboard.html';

    // append Dashboard link if not present
    if (!document.querySelector('#nav-links a[href="'+dashHref+'"]')) {
      const li = document.createElement('li');
      li.innerHTML = `<a href="${dashHref}">Dashboard</a>`;
      navLinks.insertBefore(li, navLinks.children[navLinks.children.length-1]);
    }

    // show Register Organization only for staff
    if (role === 'staff') {
      orgLink.style.display = 'block';
    } else {
      orgLink.style.display = 'none';
    }

    // add Profile dropdown with icon (last item, right)
    if (!document.getElementById('profile-menu')) {
      const profileLi = document.createElement('li');
      profileLi.id = 'profile-menu';
      profileLi.style.position = 'relative';
      
      const photoHtml = userPhoto ? 
        `<img src="${userPhoto}" alt="Profile" style="width:32px;height:32px;border-radius:50%;object-fit:cover;border:2px solid #2a62ff;">` :
        `<div style="width:32px;height:32px;border-radius:50%;background:#2a62ff;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;">${displayName.charAt(0).toUpperCase()}</div>`;
      
      profileLi.innerHTML = `
        <a href="#" id="profile-toggle" aria-haspopup="true" aria-expanded="false" style="display:flex;align-items:center;gap:8px;text-decoration:none;padding:6px 10px;border-radius:8px;transition:background 0.2s;cursor:pointer;">
          ${photoHtml}
          <span style="font-weight:600;color:#111;">${displayName}</span>
        </a>
        <div id="profile-dropdown" style="position:absolute;right:0;top:120%;background:#fff;border:1px solid #e5e7eb;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.10);padding:8px;min-width:200px;display:none;z-index:999;">
          <a href="profile.html" style="display:block;padding:10px 12px;color:#111;border-radius:8px;transition:background 0.2s;cursor:pointer;" onmouseover="this.style.background='#f5f7fb'" onmouseout="this.style.background='transparent'">👤 Profile</a>
          <a href="${dashHref}" style="display:block;padding:10px 12px;color:#111;border-radius:8px;transition:background 0.2s;cursor:pointer;" onmouseover="this.style.background='#f5f7fb'" onmouseout="this.style.background='transparent'">⚙️ Dashboard</a>
          <hr style="margin:4px 0;border:none;border-top:1px solid #e5e7eb;">
          <a href="#" id="logout-btn" style="display:block;padding:10px 12px;color:#c00;border-radius:8px;transition:background 0.2s;cursor:pointer;" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='transparent'">🚪 Logout</a>
        </div>
      `;
      navLinks.appendChild(profileLi);

      const toggle = profileLi.querySelector('#profile-toggle');
      const dropdown = profileLi.querySelector('#profile-dropdown');
      
      // Add hover effect to toggle
      toggle.addEventListener('mouseover', () => {
        toggle.style.background = '#f5f7fb';
      });
      toggle.addEventListener('mouseout', () => {
        toggle.style.background = 'transparent';
      });
      
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const open = dropdown.style.display === 'block';
        dropdown.style.display = open ? 'none' : 'block';
        toggle.setAttribute('aria-expanded', String(!open));
      });
      document.addEventListener('click', (e) => {
        if (!profileLi.contains(e.target)) {
          dropdown.style.display = 'none';
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
      profileLi.querySelector('#logout-btn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.href = 'index.html';
      });
    }
  } else {
    // not logged in
    authLink.innerHTML = `<a href="login.html">Login</a>`;
    orgLink.style.display = 'none';
  }
}

// nav toggle for mobile
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  toggle && toggle.addEventListener('click', () => {
    if (links.style.display === 'flex') links.style.display = 'none';
    else links.style.display = 'flex';
  });
});

// ---------- HERO SLIDER ----------
(function sliderInit(){
  let idx = 0;
  const slides = document.querySelectorAll('.slide');
  const total = slides.length;
  
  // Only initialize if slides exist
  if (total === 0) return;
  
  const nextBtn = document.getElementById('next-slide');
  const prevBtn = document.getElementById('prev-slide');

  function show(i) {
    slides.forEach(s => s && s.classList && s.classList.remove('active'));
    if (slides[i] && slides[i].classList) slides[i].classList.add('active');
  }

  function next() { idx = (idx + 1) % total; show(idx); }
  function prev() { idx = (idx - 1 + total) % total; show(idx); }

  // controls
  nextBtn && nextBtn.addEventListener('click', next);
  prevBtn && prevBtn.addEventListener('click', prev);

  // auto rotate
  setInterval(next, 6000);
})();

// ---------- STATS FETCH ----------
async function loadStats() {
  try {
    const res = await fetch(`${apiBase}/stats`);
    if (!res.ok) throw new Error('Stats fetch failed');
    const s = await res.json();
    document.getElementById('donations-count').textContent = s.totalDonations || 0;
    document.getElementById('donors-count').textContent = s.activeDonors || 0;
    document.getElementById('receivers-count').textContent = s.totalReceivers || 0;
    document.getElementById('funds-collected').textContent = s.fundsCollected ? `₹${s.fundsCollected}` : '₹0';
    const badge = document.getElementById('live-donation-badge');
    if (badge) {
      badge.textContent = `Live donations: ${s.totalDonations || 0}`;
    }
  } catch (err) {
    console.warn('Could not load stats:', err);
  }
}

// ---------- TESTIMONIALS FETCH ----------
async function loadTestimonials() {
  try {
    const res = await fetch(`${apiBase}/home/testimonials`);
    if (!res.ok) throw new Error('testimonial fetch failed');
    const data = await res.json();
    const items = data.items || [];
    const container = document.getElementById('testimonial-container');

    if (!items || items.length === 0) {
      container.innerHTML = '<p>No testimonials yet — be the first to leave feedback!</p>';
      return;
    }

    container.innerHTML = items.slice(0,6).map(t => `
      <div class="testimonial" data-aos="fade-up">
        <p>"${(t.quote || t.message || t.msg || '').slice(0,220)}"</p>
        <div class="name">${t.name || t.user || 'Anonymous'}${t.role ? ` • ${t.role}` : ''}</div>
      </div>
    `).join('');
  } catch(err) {
    console.warn('Could not load testimonials', err);
  }
}

// ---------- CATEGORIES ----------
async function loadCategories() {
  const container = document.querySelector('[data-section="categories-list"]');
  if (!container) return;
  try {
    const res = await fetch(`${apiBase}/home/categories`);
    if (!res.ok) throw new Error('categories fetch failed');
    const data = await res.json();
    const items = data.items || [];
    if (!items.length) return; // keep defaults
    container.innerHTML = items.slice(0, 12).map(c => `
      <a href="${c.link || 'donation.html'}" class="btn btn-ghost" style="text-align:left;">${c.title}</a>
    `).join('');
  } catch (err) {
    console.warn('could not load categories', err);
  }
}

// ---------- BOOTSTRAP PAGE ----------
document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  initNavbar();
  loadStats();
  loadCategories();
  loadTestimonials();
  loadFeatured();
  loadDonations();
});

// ---------- RECENT DONATIONS (cards) ----------
async function loadDonations() {
  const grid = document.getElementById('vc-donations-grid');
  const loading = document.getElementById('vc-donations-loading');
  if (!grid) return;

  const render = (items) => {
    if (!items || items.length === 0) {
      grid.innerHTML = '<p>No donations yet. Be the first to donate!</p>';
      return;
    }
    grid.innerHTML = items.slice(0, 9).map((d) => {
      const donorName = d.donor && (d.donor.username || d.donor.email) ? (d.donor.username || d.donor.email) : 'Anonymous Donor';
      const receiverName = d.receiver && (d.receiver.username || d.receiver.email) ? (d.receiver.username || d.receiver.email) : 'A Receiver';
      const amount = typeof d.amount === 'number' ? d.amount : Number(d.amount || 0);
      const date = d.date ? new Date(d.date) : new Date();
      const prettyDate = date.toLocaleDateString();
      const message = (d.message || '').slice(0, 120);

      return `
        <article class="vc-card donation-card" style="background:#fff;border-radius:14px;box-shadow:0 4px 18px rgba(0,0,0,.08);overflow:hidden;">
          <div class="card-media" style="height:180px;overflow:hidden;">
            <img src="assets/donation.jpg" alt="donation" style="width:100%;height:100%;object-fit:cover;">
          </div>
          <div class="card-body" style="padding:14px 16px;">
            <div class="eyebrow" style="font-size:12px;color:#777;margin-bottom:4px;">Donation • ${prettyDate}</div>
            <h3 style="margin:4px 0 8px 0;font-size:18px;">₹${amount.toLocaleString('en-IN')} to ${receiverName}</h3>
            <p style="margin:0 0 10px 0;color:#555;">from ${donorName}${message ? ` — “${message}”` : ''}</p>
            <div class="card-meta" style="display:flex;align-items:center;gap:10px;color:#666;font-size:13px;">
              <span>Method: ${d.paymentMethod || '—'}</span>
            </div>
          </div>
        </article>
      `;
    }).join('');
  };

  try {
    const res = await fetch(`${apiBase}/donation/public`);
    if (!res.ok) {
      grid.innerHTML = '<p>Unable to load donations right now.</p>';
      return;
    }
    const data = await res.json();
    if (loading) loading.remove();
    render(data.donations || []);
  } catch (err) {
    console.warn('donations load error', err);
    grid.innerHTML = '<p>Unable to load donations right now.</p>';
  }

  // Poll every 15s for live updates after initial render
  if (!window.__donationsPoller) {
    window.__donationsPoller = setInterval(async () => {
      try {
        const res = await fetch(`${apiBase}/donation/public`);
        if (!res.ok) return;
        const data = await res.json();
        render(data.donations || []);
      } catch (_) {}
    }, 15000);
  }
}

// ---------- FEATURED CAMPAIGNS (from API) ----------
async function loadFeatured() {
  const gridSection = document.querySelector('.vc-container + .vc-donations-grid') || null;
  const container = document.querySelector('section.vc-container[data-aos="fade-up"] .vc-donations-grid') || document.querySelectorAll('.vc-donations-grid')[0];
  // Find the first grid after "Featured Campaigns" header
  const headings = Array.from(document.querySelectorAll('section.vc-container h2'));
  let featuredGrid = null;
  for (const h of headings) {
    if (h.textContent.trim().toLowerCase().includes('featured campaigns')) {
      featuredGrid = h.parentElement?.nextElementSibling;
      break;
    }
  }
  const grid = featuredGrid || container;
  if (!grid) return;

  const renderFeatured = (items) => {
    if (!items || !items.length) return; // keep placeholders if none

    grid.innerHTML = items.slice(0, 9).map(c => {
      const raised = Number(c.raised || 0);
      const goal = Number(c.goal || 0);
      const percent = goal > 0 ? Math.round((raised / goal) * 100) : 0;
      const capped = Math.min(percent, 100); // cap at 100% for visual
      
      // Extract just filename from full path like /F:/assets/donation1.jpg
      let imgSrc = 'assets/donation.jpg';
      if (c.imageUrl) {
        const filename = c.imageUrl.split('/').pop() || 'donation.jpg';
        imgSrc = `assets/${filename}`;
      }
      
      return `
        <article class="vc-card" style="background:#fff;border-radius:14px;box-shadow:0 4px 18px rgba(0,0,0,.08);overflow:hidden;display:flex;flex-direction:column;height:100%;">
          <div style="height:200px;overflow:hidden;flex-shrink:0;"><img src="${imgSrc}" alt="campaign" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='assets/donation.jpg'"></div>
          <div style="padding:16px;flex-grow:1;display:flex;flex-direction:column;justify-content:space-between;">
            <div>
              <h3 style="margin:4px 0 8px 0;font-size:18px;">${c.title || ''}</h3>
              <p style="margin:0 0 10px 0;color:#555;font-size:14px;">${c.subtitle || ''}</p>
            </div>
            <div>
              <div style="display:flex;justify-content:space-between;color:#666;font-size:13px;margin-bottom:8px;">
                <span>₹${raised.toLocaleString('en-IN')}</span>
                <span style="font-weight:600;color:#00A86B;">${capped}%</span>
              </div>
              <div style="background:#e5e7eb;height:6px;border-radius:3px;overflow:hidden;margin-bottom:8px;">
                <div style="background:linear-gradient(90deg, #00A86B 0%, #00935a 100%);height:100%;width:${capped}%;transition:width 0.3s ease;"></div>
              </div>
              <div style="font-size:12px;color:#999;margin-bottom:10px;">Goal: ₹${goal.toLocaleString('en-IN')}</div>
              <a href="${c.link || 'donation.html'}" class="btn btn-primary" style="width:100%;text-align:center;">Donate Now</a>
            </div>
          </div>
        </article>
      `;
    }).join('');
  };

  try {
    const res = await fetch(`${apiBase}/home/featured`);
    if (!res.ok) throw new Error('Failed to load featured');
    const data = await res.json();
    renderFeatured(data.items || []);
    
    // Poll every 30s for live updates of raised amounts
    if (!window.__featuredPoller) {
      window.__featuredPoller = setInterval(async () => {
        try {
          const res = await fetch(`${apiBase}/home/featured`);
          if (!res.ok) return;
          const data = await res.json();
          renderFeatured(data.items || []);
        } catch (_) {}
      }, 30000);
    }
  } catch (err) {
    console.warn('featured load error', err);
  }
}
