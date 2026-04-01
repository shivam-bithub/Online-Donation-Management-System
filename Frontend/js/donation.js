const token = localStorage.getItem('token');
const userId = localStorage.getItem('userId');
const username = localStorage.getItem('username');
const userType = localStorage.getItem('userType');
const email = localStorage.getItem('email');

// Auto-fill donor info
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch(`http://localhost:3000/api/auth/user/${userId}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    if (res.ok) {
      const userData = await res.json();
      document.getElementById('donorEmail').value = userData.email || email || 'Not available';
      document.getElementById('donorName').value = userData.username || username || 'Donor';
    } else {
      document.getElementById('donorEmail').value = 'Email not available';
      document.getElementById('donorName').value = username || 'Donor';
    }
  } catch (err) {
    console.error('Error loading user info:', err);
    document.getElementById('donorEmail').value = 'Email not available';
    document.getElementById('donorName').value = username || 'Donor';
  }
});

// Select elements
const forDonationSelect = document.getElementById('forDonation');
const donationForm = document.getElementById('donationForm');
const donationStatus = document.getElementById('donationStatus');

// Create dynamic dropdown
const dynamicDropdown = document.createElement('select');
dynamicDropdown.id = 'ngoReceiverList';
dynamicDropdown.name = 'ngoReceiverList';
dynamicDropdown.required = true;
dynamicDropdown.style.marginTop = '8px';
dynamicDropdown.style.display = 'none';
donationForm.insertBefore(dynamicDropdown, document.getElementById('amount').previousElementSibling);

const dynamicLabel = document.createElement('label');
dynamicLabel.setAttribute('for', 'ngoReceiverList');
dynamicLabel.textContent = 'Select NGO or Receiver Name *';
dynamicLabel.style.display = 'none';
donationForm.insertBefore(dynamicLabel, dynamicDropdown);

// Handle NGO/Receiver selection
forDonationSelect.addEventListener('change', async (e) => {
  const value = e.target.value;
  dynamicDropdown.innerHTML = '';
  dynamicDropdown.style.display = 'none';
  dynamicLabel.style.display = 'none';

  if (!value) return;

  dynamicDropdown.style.display = 'block';
  dynamicLabel.style.display = 'block';
  dynamicDropdown.innerHTML = `<option value="">Loading...</option>`;

  let url = '';
  if (value === 'Ngo') url = 'http://localhost:3000/api/ngo';
  if (value === 'Receiver') url = 'http://localhost:3000/api/receiver';

  // Updated backend endpoints
  if (value === 'Ngo') url = 'http://localhost:3000/api/donation/ngos';
  if (value === 'Receiver') url = 'http://localhost:3000/api/donation/receivers';

  try {
    const res = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const data = await res.json();

    dynamicDropdown.innerHTML = '<option value="">Select from list</option>';

    if (Array.isArray(data) && data.length > 0) {
      data.forEach(item => {
        const option = document.createElement('option');
        if (value === 'Ngo') {
          option.value = item._id;
          option.textContent = `${item.name} — ${item.cause || 'General Cause'}`;
        } else {
          option.value = item._id;
          option.textContent = item.name || 'Unnamed Receiver';
        }
        dynamicDropdown.appendChild(option);
      });
    } else {
      dynamicDropdown.innerHTML = '<option value="">No records found</option>';
    }
  } catch (err) {
    console.error('Error loading list:', err);
    dynamicDropdown.innerHTML = '<option value="">Error loading data</option>';
  }
});

// Donation form submission
donationForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const donorId = userId;
  const amount = parseFloat(document.getElementById('amount').value);
  const paymentMethod = document.getElementById('paymentMethod').value;
  const message = document.getElementById('message').value.trim();
  const forDonation = document.getElementById('forDonation').value;
  const selectedEntityId = document.getElementById('ngoReceiverList').value;

  donationStatus.style.display = 'none';

  if (!forDonation) return showError('Please select NGO or Receiver for donation.');
  if (!selectedEntityId) return showError('Please select a name from the list.');
  if (!amount || amount <= 0) return showError('Please enter a valid donation amount.');
  if (!paymentMethod) return showError('Please select a payment method.');

  try {
    // ✅ Build correct payload expected by backend
    let bodyPayload = {
      donorId,
      forDonation,
      amount,
      paymentMethod,
      message
    };

    if (forDonation === 'Ngo') {
      bodyPayload.ngoId = selectedEntityId;
    } else if (forDonation === 'Receiver') {
      bodyPayload.receiverId = selectedEntityId;
    }

    const res = await fetch('http://localhost:3000/api/donation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(bodyPayload)
    });

    const data = await res.json();

    if (res.ok) {
      showSuccess('✓ Thank you for your donation! Your contribution makes a difference.');

      // Reset form
      document.getElementById('amount').value = '';
      document.getElementById('paymentMethod').value = '';
      document.getElementById('message').value = '';
      forDonationSelect.value = '';
      dynamicDropdown.style.display = 'none';
      dynamicLabel.style.display = 'none';
    } else {
      showError('Donation failed: ' + (data.message || 'Unknown error'));
    }
  } catch (err) {
    console.error('Donation error:', err);
    showError('Network error. Please try again later.');
  }
});

// Helper functions
function showError(msg) {
  donationStatus.style.color = 'red';
  donationStatus.style.background = '#ffebee';
  donationStatus.textContent = msg;
  donationStatus.style.display = 'block';
}

function showSuccess(msg) {
  donationStatus.style.color = 'green';
  donationStatus.style.background = '#e8f5e9';
  donationStatus.textContent = msg;
  donationStatus.style.display = 'block';
}
