// js/donor-dashboard.js
const token = localStorage.getItem('token');
const userId = localStorage.getItem('userId');
const userType = localStorage.getItem('userType');
const username = localStorage.getItem('username');

if (!token || userType !== 'Donor') {
  alert('Please login as Donor to access this page');
  window.location.href = 'login.html';
}

// Display username
document.getElementById('username').textContent = username || 'Donor';

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.clear();
  alert('Logged out successfully');
  window.location.href = 'login.html';
});

// Load donor's donations
async function loadDonations() {
  try {
    const res = await fetch('http://localhost:3000/api/donor/dashboard/donations', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const text = await res.text();
    if (!text) throw new Error('Empty response');

    const data = JSON.parse(text);
    const donations = data.donations || [];

    const donationsDiv = document.getElementById('donationsList');

    if (donations.length === 0) {
      donationsDiv.innerHTML = `
        <p>You have not made any donations yet. 
        <a href="donation.html">Make your first donation</a></p>`;
      return;
    }

    // ✅ Correctly show NGO or Receiver info
    donationsDiv.innerHTML = donations.map(d => {
      let recipientName = 'N/A';
      let recipientEmail = '';

      if (d.organization) {
        recipientName = d.organization.name || 'Unnamed NGO';
        recipientEmail = d.organization.email || '';
      } else if (d.receiver) {
        const rec = d.receiver;
        recipientName = rec.username || rec.name || 'Unnamed Receiver';
        recipientEmail = rec.email || '';
      }
      return `
        <div class="donation-card">
          <h3>₹${d.amount}</h3>
          <p><strong>To:</strong> ${recipientName} ${recipientEmail ? `(${recipientEmail})` : ''}</p>
          <p><strong>Payment Method:</strong> ${d.paymentMethod}</p>
          <p><strong>Message:</strong> ${d.message || 'No message'}</p>
          <p><strong>Date:</strong> ${new Date(d.date).toLocaleString()}</p>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Error loading donations:', err);
    document.getElementById('donationsList').innerHTML =
      '<p style="color:red;">Error loading donations. Please try again.</p>';
  }
}

// Load donations on page load
document.addEventListener('DOMContentLoaded', loadDonations);
