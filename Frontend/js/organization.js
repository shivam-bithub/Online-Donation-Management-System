document.getElementById('orgForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const body = {
    name: name.value,
    registrationNumber: regNo.value,
    email: email.value,
    phone: phone.value,
    address: address.value
  };
  const res = await fetch('http://localhost:3000/api/organizations/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  alert(data.message);
});
