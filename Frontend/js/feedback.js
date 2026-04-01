// js/feedback.js

document.getElementById('feedbackForm').addEventListener('submit', async e => {
  e.preventDefault();

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const userTypeSelect = document.getElementById('userType');
  const userType = userTypeSelect ? userTypeSelect.value : null;
  const comment = document.getElementById('comment').value.trim();

  const feedbackStatus = document.getElementById('feedbackStatus');
  feedbackStatus.style.display = 'none';

  // Check if user is logged in
  if (!token || !userId) {
    alert('Please login to submit feedback.');
    window.location.href = 'login.html';
    return;
  }

  if (!comment) {
    feedbackStatus.style.color = 'red';
    feedbackStatus.textContent = 'Please enter your feedback.';
    feedbackStatus.style.display = 'block';
    return;
  }

  if (!userType || !['Donor', 'Receiver'].includes(userType)) {
    feedbackStatus.style.color = 'red';
    feedbackStatus.textContent = 'Invalid user type.';
    feedbackStatus.style.display = 'block';
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/feedback', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ userId, userType, comment }),
    });

    // Get raw text first to handle empty responses safely
    const text = await response.text();
    
    if (!text) {
      throw new Error('Empty response from server');
    }

    const data = JSON.parse(text);

    if (response.ok) {
      feedbackStatus.style.color = 'green';
      feedbackStatus.textContent = 'Thank you for your feedback!';
      e.target.reset();
    } else {
      feedbackStatus.style.color = 'red';
      feedbackStatus.textContent = data.message || 'Feedback submission failed';
    }
  } catch (error) {
    console.error('Feedback error:', error);
    feedbackStatus.style.color = 'red';
    feedbackStatus.textContent = 'Network error. Please try again later.';
  }
  
  feedbackStatus.style.display = 'block';
});
