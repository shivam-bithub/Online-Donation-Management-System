// js/register.js
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const userType = document.getElementById('userType').value;

  // Base fields (person)
  let username = (document.getElementById('username')?.value || '').trim();
  let email = (document.getElementById('email')?.value || '').trim();
  let address = (document.getElementById('address')?.value || '').trim();
  let phone = (document.getElementById('phone')?.value || '').trim();
  let age = parseInt((document.getElementById('age')?.value || '0'), 10);
  const password = document.getElementById('password').value;
  const photoFile = document.getElementById('profilePhoto')?.files[0];

  // Log the data being sent
  console.log('Sending registration data:', { username, email, address, phone, age, userType });

  // Validations
  if (!['Donor', 'Receiver', 'NGO', 'Staff'].includes(userType)) {
    alert('Please select a valid user type');
    return;
  }

  // NGO specific mapping/validation
  let extra = {};
  if (userType === 'NGO') {
    const ngoName = (document.getElementById('ngoName')?.value || '').trim();
    const ngoAddress = (document.getElementById('ngoAddress')?.value || '').trim();
    const ngoCauses = (document.getElementById('ngoCauses')?.value || '').trim();
    const ngoRegistration = (document.getElementById('ngoRegistration')?.value || '').trim();
    const ngoWebsite = (document.getElementById('ngoWebsite')?.value || '').trim();
    const ngoContact = (document.getElementById('ngoContact')?.value || '').trim();

    if (!ngoName || !ngoAddress || !ngoCauses || !email || !phone) {
      alert('Please fill in all required NGO fields');
      return;
    }
    username = ngoName; // map NGO name to username in user model
    address = ngoAddress;
    age = 0; // not applicable
    extra = { ngoCauses, ngoRegistration, ngoWebsite, ngoContact };
  } else {
    if (!username || !email || !address || !phone || !age) {
      alert('Please fill in all required fields');
      return;
    }
    if (age < 1 || age > 120) {
      alert('Please enter a valid age');
      return;
    }
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters long');
    return;
  }

  // Validate photo size if provided
  if (photoFile && photoFile.size > 5 * 1024 * 1024) {
    alert('Photo size must be less than 5MB');
    return;
  }

  const apiBase = 'http://localhost:3000/api';

  try {
    // Use FormData to send both JSON and file
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('address', address);
    formData.append('phone', phone);
    formData.append('age', age);
    formData.append('userType', userType);
    formData.append('password', password);
    
    // Add extra fields for NGO
    Object.keys(extra).forEach(key => formData.append(key, extra[key]));
    
    // Add photo if provided
    if (photoFile) {
      formData.append('profilePhoto', photoFile);
    }

    const response = await fetch(`${apiBase}/auth/register`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - FormData will set it automatically with boundary
    });

    // ADD THESE DEBUG LOGS
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    // Get raw text first to handle empty responses safely
    const text = await response.text();
    console.log('Response text:', text); // ADD THIS
    
    if (!text) {
      alert('Server returned empty response. Please check if backend is running.');
      return;
    }

    // Check if response is HTML (error page) instead of JSON
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      alert('Server error: Received HTML instead of JSON. Please check if the API server is running on port 3000.');
      console.error('Received HTML response:', text.substring(0, 200));
      return;
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      alert('Invalid response from server. Please check the server connection.');
      console.error('JSON parse error:', parseError, 'Response:', text.substring(0, 200));
      return;
    }
    console.log('Parsed data:', data); // ADD THIS

    if (response.ok) {
      alert(data.message || 'Registration successful!');
      window.location.href = 'login.html';
    } else {
      alert('Registration failed: ' + (data.message || data.error || 'Unknown error'));
    }
  } catch (error) {
    console.error('Full registration error:', error);
    alert('An error occurred: ' + error.message);
  }
});
