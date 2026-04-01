// js/authCheck.js
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login to access this page.');
    window.location.href = 'login.html';
  }
});
