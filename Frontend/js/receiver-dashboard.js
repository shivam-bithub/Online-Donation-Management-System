// js/receiver-dashboard.js
const token = localStorage.getItem('token');
const userId = localStorage.getItem('userId');
const userType = localStorage.getItem('userType');
const username = localStorage.getItem('username');

if (!token || userType !== 'Receiver') {
  alert('Please login as Receiver to access this page');
  window.location.href = 'login.html';
}

// Display username
document.getElementById('username').textContent = username || 'Receiver';

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.clear();
  alert('Logged out successfully');
  window.location.href = 'login.html';
});

// Load received donations
async function loadDonations() {
  try {
    const res = await fetch('http://localhost:3000/api/receiver/dashboard/donations', {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const text = await res.text();
    if (!text) throw new Error('Empty response');
    
    const data = JSON.parse(text);
    const donations = data.donationsReceived || [];

    const donationsDiv = document.getElementById('donationsList');
    
    if (donations.length === 0) {
      donationsDiv.innerHTML = '<p>No donations received yet.</p>';
      return;
    }

    donationsDiv.innerHTML = donations.map(d => `
      <div class="donation-card">
        <h3>₹${d.amount}</h3>
        <p><strong>From:</strong> ${d.donor?.username || 'Anonymous'} (${d.donor?.email || ''})</p>
        <p><strong>Payment Method:</strong> ${d.paymentMethod}</p>
        <p><strong>Message:</strong> ${d.message || 'No message'}</p>
        <p><strong>Date:</strong> ${new Date(d.date).toLocaleString()}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error('Error loading donations:', err);
    document.getElementById('donationsList').innerHTML = '<p style="color:red;">Error loading donations. Please try again.</p>';
  }
}

// Load donations on page load
document.addEventListener('DOMContentLoaded', loadDonations);
