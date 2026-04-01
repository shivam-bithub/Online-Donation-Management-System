const API = 'http://localhost:3000/api';
let TOKEN = localStorage.getItem('token') || '';

const logoutBtn = document.getElementById('logoutBtn');
logoutBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('token');
  window.location.href = 'login.html';
});

async function fetchWithAuth(path, options = {}) {
  if (!TOKEN) throw new Error('Missing token');
  options.headers = options.headers || {};
  options.headers['Authorization'] = `Bearer ${TOKEN}`;
  if (!options.headers['Content-Type'] && options.body) {
    options.headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API}${path}`, options);
  const text = await res.text();
  if (!text) return res.ok ? {} : Promise.reject(new Error('Empty response'));
  const data = JSON.parse(text);
  if (!res.ok) throw new Error(data.message || data.error || res.statusText);
  return data;
}

async function ensureStaff() {
  if (!TOKEN) {
    window.location.href = 'login.html';
    return false;
  }
  try {
    const me = await fetchWithAuth('/auth/me');
    if (me?.userType !== 'Staff') {
      alert('Access denied. Staff only.');
      window.location.href = 'login.html';
      return false;
    }
    return true;
  } catch (err) {
    console.error(err);
    window.location.href = 'login.html';
    return false;
  }
}

function setMetric(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

async function loadReceivers() {
  const container = document.getElementById('receiversList');
  container.innerHTML = `<article class="vc-card" style="padding:16px;border-radius:16px;background:#fff;box-shadow:0 12px 24px rgba(0,0,0,.05);"><p style="margin:0;color:#778;">Loading...</p></article>`;
  try {
    const data = await fetchWithAuth('/staff/dashboard/receivers');
    const pending = data.unverifiedReceivers || [];
    setMetric('metric-pending', pending.length);
    if (!pending.length) {
      container.innerHTML = `<article class="vc-card" style="padding:16px;border-radius:16px;background:#fff;box-shadow:0 12px 24px rgba(0,0,0,.05);"><p style="margin:0;color:#778;">No pending receivers or NGOs 🎉</p></article>`;
      return;
    }
    container.innerHTML = pending.map(r => `
      <article class="vc-card" style="padding:18px;border-radius:16px;background:#fff;box-shadow:0 10px 24px rgba(0,0,0,.05);display:flex;flex-direction:column;gap:6px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <h3 style="margin:0;font-size:18px;">${r.username}</h3>
          <span style="padding:4px 10px;border-radius:999px;background:#e8f2ff;color:#2a62ff;font-size:12px;">${r.userType || 'Receiver'}</span>
        </div>
        <p style="margin:0;color:#556;">Email: ${r.email}</p>
        <p style="margin:0;color:#556;">Phone: ${r.phone || '—'}</p>
        <p style="margin:0;color:#556;">Address: ${r.address || '—'}</p>
        ${r.age ? `<p style="margin:0;color:#556;">Age: ${r.age}</p>` : ''}
        <button class="btn btn-primary" data-verify="${r._id}" style="margin-top:10px;border-radius:999px;">Verify</button>
      </article>
    `).join('');
    container.querySelectorAll('[data-verify]').forEach(btn => {
      btn.addEventListener('click', async () => {
        btn.disabled = true;
        btn.textContent = 'Verifying...';
        try {
          await fetchWithAuth(`/staff/dashboard/verify-receiver/${btn.dataset.verify}`, { method: 'POST' });
          btn.textContent = 'Verified';
          await loadReceivers();
        } catch (err) {
          alert(err.message);
          btn.disabled = false;
          btn.textContent = 'Verify';
        }
      });
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = `<article class="vc-card" style="padding:16px;border-radius:16px;background:#fff;"><p style="margin:0;color:#c00;">${err.message}</p></article>`;
  }
}

async function loadDonations() {
  const container = document.getElementById('donationsList');
  container.innerHTML = `<p style="margin:0;padding:18px;color:#778;">Loading donations...</p>`;
  try {
    const data = await fetchWithAuth('/staff/dashboard/donations');
    const donations = data.donations || [];
    const totalAmount = donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    setMetric('metric-donations', `₹${totalAmount.toLocaleString('en-IN')}`);
    if (!donations.length) {
      container.innerHTML = `<p style="margin:0;padding:18px;color:#778;">No donations recorded yet.</p>`;
      return;
    }
    const rows = donations.slice(0, 25).map(d => `
      <tr>
        <td>${d.donor?.username || '—'}</td>
        <td>${d.receiver?.username || '—'}</td>
        <td>₹${Number(d.amount).toLocaleString('en-IN')}</td>
        <td>${d.paymentMethod || '—'}</td>
        <td>${new Date(d.date).toLocaleDateString()}</td>
      </tr>
    `).join('');
    container.innerHTML = `
      <div style="overflow:auto;">
        <table style="width:100%;border-collapse:collapse;">
          <thead style="background:#f5f7fb;color:#445;">
            <tr>
              <th>Donor</th>
              <th>Receiver</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      ${donations.length > 25 ? `<div style="padding:12px 18px;color:#778;">Showing latest 25 of ${donations.length} donations.</div>` : ''}
    `;
  } catch (err) {
    console.error(err);
    container.innerHTML = `<p style="margin:0;padding:18px;color:#c00;">${err.message}</p>`;
  }
}

async function loadFeedbacks() {
  const container = document.getElementById('feedbacksList');
  container.innerHTML = `<article class="vc-card" style="padding:16px;border-radius:16px;background:#fff;"><p style="margin:0;color:#778;">Loading feedback...</p></article>`;
  try {
    const data = await fetchWithAuth('/staff/dashboard/feedbacks');
    const feedbacks = data.feedbacks || [];
    setMetric('metric-feedbacks', feedbacks.length);
    if (!feedbacks.length) {
      container.innerHTML = `<article class="vc-card" style="padding:16px;border-radius:16px;background:#fff;"><p style="margin:0;color:#778;">No feedback submitted yet.</p></article>`;
      return;
    }
    container.innerHTML = feedbacks.slice(0, 5).map(f => `
      <article class="vc-card" style="padding:18px;border-radius:16px;background:#fff;box-shadow:0 10px 24px rgba(0,0,0,.05);display:flex;flex-direction:column;gap:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <strong>${f.name || 'Anonymous'}</strong>
          <span style="font-size:12px;color:#889;">Feedback</span>
        </div>
        <p style="margin:0;color:#334;line-height:1.5;">${f.message || ''}</p>
        <small style="color:#778;">${new Date(f.createdAt || Date.now()).toLocaleString()}</small>
      </article>
    `).join('');
    if (feedbacks.length > 5) {
      container.innerHTML += `<div style="padding:12px 18px;color:#778;font-size:13px;">Showing latest 5 of ${feedbacks.length} feedbacks.</div>`;
    }
  } catch (err) {
    console.error(err);
    container.innerHTML = `<article class="vc-card" style="padding:16px;border-radius:16px;background:#fff;"><p style="margin:0;color:#c00;">${err.message}</p></article>`;
  }
}

document.getElementById('refreshReceivers')?.addEventListener('click', loadReceivers);
document.getElementById('refreshDonations')?.addEventListener('click', loadDonations);
document.getElementById('refreshFeedbacks')?.addEventListener('click', loadFeedbacks);

// Featured campaigns CRUD
async function loadFeatured() {
  const list = document.getElementById('featuredList');
  list.innerHTML = `<article class="vc-card" style="padding:16px;border-radius:16px;background:#fff;"><p style="margin:0;color:#778;">Loading featured campaigns...</p></article>`;
  try {
    const data = await fetchWithAuth('/home/featured'); // same GET works without auth, but keep helper
    const items = data.items || [];
    if (!items.length) {
      list.innerHTML = `<article class="vc-card" style="padding:16px;border-radius:16px;background:#fff;"><p style="margin:0;color:#778;">No featured campaigns yet. Add one above.</p></article>`;
      return;
    }
    list.innerHTML = items.map(c => {
      let imgSrc = 'assets/donation.jpg';
      if (c.imageUrl) {
        // Extract just the filename from full path like /F:/assets/donation1.jpg
        const filename = c.imageUrl.split('/').pop() || 'donation.jpg';
        imgSrc = `assets/${filename}`;
      }
      return `
      <article class="vc-card" style="padding:12px;border-radius:16px;background:#fff;box-shadow:0 10px 24px rgba(0,0,0,.05);display:flex;gap:12px;">
        <img src="${imgSrc}" alt="" style="width:84px;height:84px;border-radius:10px;object-fit:cover;" onerror="this.src='assets/donation.jpg'">
        <div style="flex:1;">
          <strong>${c.title || ''}</strong>
          <div style="color:#556;font-size:13px;margin:4px 0;">${c.subtitle || ''}</div>
          <div style="color:#667;font-size:12px;">Raised ₹${Number(c.raised||0).toLocaleString('en-IN')} • Goal ₹${Number(c.goal||0).toLocaleString('en-IN')}</div>
          <div style="display:flex;gap:8px;margin-top:8px;">
            <button class="btn btn-ghost" data-edit="${c._id}">Edit</button>
            <button class="btn btn-ghost" data-delete="${c._id}" style="color:#c00;">Delete</button>
          </div>
        </div>
        <div style="font-size:12px;color:#889;">#${c.order ?? 0}</div>
      </article>
      `;
    }).join('');

    list.querySelectorAll('[data-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.edit;
        const item = items.find(i => i._id === id);
        if (!item) return;
        document.getElementById('featId').value = item._id;
        document.getElementById('featTitle').value = item.title || '';
        document.getElementById('featSubtitle').value = item.subtitle || '';
        document.getElementById('featRaised').value = item.raised || 0;
        document.getElementById('featGoal').value = item.goal || 0;
        document.getElementById('featImage').value = item.imageUrl || '';
        document.getElementById('featLink').value = item.link || 'donation.html';
        document.getElementById('featOrder').value = item.order || 0;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
    list.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this featured campaign?')) return;
        try {
          await fetchWithAuth(`/home/featured/${btn.dataset.delete}`, { method: 'DELETE' });
          await loadFeatured();
        } catch (err) {
          alert(err.message);
        }
      });
    });
  } catch (err) {
    list.innerHTML = `<article class="vc-card" style="padding:16px;border-radius:16px;background:#fff;"><p style="margin:0;color:#c00;">${err.message}</p></article>`;
  }
}

document.getElementById('refreshFeatured')?.addEventListener('click', loadFeatured);
document.getElementById('featuredForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('featId').value.trim();
  const payload = {
    title: document.getElementById('featTitle').value.trim(),
    subtitle: document.getElementById('featSubtitle').value.trim(),
    raised: Number(document.getElementById('featRaised').value || 0),
    goal: Number(document.getElementById('featGoal').value || 0),
    imageUrl: document.getElementById('featImage').value.trim(),
    link: document.getElementById('featLink').value.trim() || 'donation.html',
    order: Number(document.getElementById('featOrder').value || 0),
  };
  try {
    if (id) {
      await fetchWithAuth(`/home/featured/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
      await fetchWithAuth('/home/featured', { method: 'POST', body: JSON.stringify(payload) });
    }
    (document.getElementById('featuredForm')).reset();
    document.getElementById('featId').value = '';
    await loadFeatured();
  } catch (err) {
    alert(err.message);
  }
});
document.getElementById('resetFeatured')?.addEventListener('click', (e) => {
  e.preventDefault();
  (document.getElementById('featuredForm')).reset();
  document.getElementById('featId').value = '';
});

// Categories admin
async function loadCategoriesAdmin() {
  const list = document.getElementById('categoryList');
  if (!list) return;
  list.innerHTML = `<article class="vc-card" style="padding:16px;border-radius:16px;background:#fff;"><p style="margin:0;color:#778;">Loading categories...</p></article>`;
  try {
    const data = await fetchWithAuth('/home/categories');
    const items = data.items || [];
    if (!items.length) {
      list.innerHTML = `<article class="vc-card" style="padding:16px;border-radius:16px;background:#fff;"><p style="margin:0;color:#778;">No categories yet. Add one above.</p></article>`;
      return;
    }
    list.innerHTML = items.map(c => `
      <article class="vc-card" style="padding:16px;border-radius:16px;background:#fff;box-shadow:0 10px 24px rgba(0,0,0,.05);display:flex;justify-content:space-between;align-items:center;">
        <div>
          <strong>${c.title}</strong>
          <div style="color:#667;font-size:12px;">${c.link || 'donation.html'}</div>
        </div>
        <div style="display:flex;gap:6px;align-items:center;">
          <span style="font-size:12px;color:#889;">#${c.order ?? 0}</span>
          <button class="btn btn-ghost" data-edit-cat="${c._id}">Edit</button>
          <button class="btn btn-ghost" data-del-cat="${c._id}" style="color:#c00;">Delete</button>
        </div>
      </article>
    `).join('');
    list.querySelectorAll('[data-edit-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = items.find(i => i._id === btn.dataset.editCat);
        if (!item) return;
        document.getElementById('catId').value = item._id;
        document.getElementById('catTitle').value = item.title || '';
        document.getElementById('catLink').value = item.link || 'donation.html';
        document.getElementById('catOrder').value = item.order || 0;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
    list.querySelectorAll('[data-del-cat]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this category?')) return;
        try {
          await fetchWithAuth(`/home/categories/${btn.dataset.delCat}`, { method: 'DELETE' });
          await loadCategoriesAdmin();
        } catch (err) {
          alert(err.message);
        }
      });
    });
  } catch (err) {
    list.innerHTML = `<article class="vc-card" style="padding:16px;border-radius:16px;background:#fff;"><p style="margin:0;color:#c00;">${err.message}</p></article>`;
  }
}

document.getElementById('refreshCategories')?.addEventListener('click', loadCategoriesAdmin);
document.getElementById('categoryForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('catId').value.trim();
  const payload = {
    title: document.getElementById('catTitle').value.trim(),
    link: document.getElementById('catLink').value.trim() || 'donation.html',
    order: Number(document.getElementById('catOrder').value || 0),
  };
  try {
    if (!payload.title) throw new Error('Title is required');
    if (id) await fetchWithAuth(`/home/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    else await fetchWithAuth('/home/categories', { method: 'POST', body: JSON.stringify(payload) });
    (document.getElementById('categoryForm')).reset();
    document.getElementById('catId').value = '';
    await loadCategoriesAdmin();
  } catch (err) {
    alert(err.message);
  }
});
document.getElementById('resetCategory')?.addEventListener('click', (e) => {
  e.preventDefault();
  (document.getElementById('categoryForm')).reset();
  document.getElementById('catId').value = '';
});

// Testimonials admin
async function loadTestimonialsAdmin() {
  const list = document.getElementById('testimonialList');
  if (!list) return;
  list.innerHTML = `<article class="vc-card" style="padding:16px;border-radius:16px;background:#fff;"><p style="margin:0;color:#778;">Loading testimonials...</p></article>`;
  try {
    const data = await fetchWithAuth('/home/testimonials');
    const items = data.items || [];
    if (!items.length) {
      list.innerHTML = `<article class="vc-card" style="padding:16px;border-radius:16px;background:#fff;"><p style="margin:0;color:#778;">No testimonials yet. Add one above.</p></article>`;
      return;
    }
    list.innerHTML = items.map(t => `
      <article class="vc-card" style="padding:18px;border-radius:16px;background:#fff;box-shadow:0 10px 24px rgba(0,0,0,.05);display:flex;flex-direction:column;gap:8px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <strong>${t.name}</strong>
          <div style="display:flex;gap:6px;align-items:center;">
            <span style="font-size:12px;color:#889;">#${t.order ?? 0}</span>
            <button class="btn btn-ghost" data-edit-test="${t._id}">Edit</button>
            <button class="btn btn-ghost" data-del-test="${t._id}" style="color:#c00;">Delete</button>
          </div>
        </div>
        ${t.role ? `<span style="color:#667;font-size:13px;">${t.role}</span>` : ''}
        <p style="margin:0;color:#334;line-height:1.5;">"${t.quote}"</p>
      </article>
    `).join('');
    list.querySelectorAll('[data-edit-test]').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = items.find(i => i._id === btn.dataset.editTest);
        if (!item) return;
        document.getElementById('testId').value = item._id;
        document.getElementById('testName').value = item.name || '';
        document.getElementById('testRole').value = item.role || '';
        document.getElementById('testQuote').value = item.quote || '';
        document.getElementById('testOrder').value = item.order || 0;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });
    list.querySelectorAll('[data-del-test]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this testimonial?')) return;
        try {
          await fetchWithAuth(`/home/testimonials/${btn.dataset.delTest}`, { method: 'DELETE' });
          await loadTestimonialsAdmin();
        } catch (err) {
          alert(err.message);
        }
      });
    });
  } catch (err) {
    list.innerHTML = `<article class="vc-card" style="padding:16px;border-radius:16px;background:#fff;"><p style="margin:0;color:#c00;">${err.message}</p></article>`;
  }
}

document.getElementById('refreshTestimonials')?.addEventListener('click', loadTestimonialsAdmin);
document.getElementById('testimonialForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('testId').value.trim();
  const payload = {
    name: document.getElementById('testName').value.trim(),
    role: document.getElementById('testRole').value.trim(),
    quote: document.getElementById('testQuote').value.trim(),
    order: Number(document.getElementById('testOrder').value || 0),
  };
  try {
    if (!payload.name || !payload.quote) throw new Error('Name and quote are required');
    if (id) await fetchWithAuth(`/home/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
    else await fetchWithAuth('/home/testimonials', { method: 'POST', body: JSON.stringify(payload) });
    (document.getElementById('testimonialForm')).reset();
    document.getElementById('testId').value = '';
    await loadTestimonialsAdmin();
  } catch (err) {
    alert(err.message);
  }
});
document.getElementById('resetTestimonial')?.addEventListener('click', (e) => {
  e.preventDefault();
  (document.getElementById('testimonialForm')).reset();
  document.getElementById('testId').value = '';
});
document.addEventListener('DOMContentLoaded', async () => {
  const ok = await ensureStaff();
  if (!ok) return;
  loadReceivers();
  loadDonations();
  loadFeedbacks();
  loadFeatured();
  loadCategoriesAdmin();
  loadTestimonialsAdmin();
});