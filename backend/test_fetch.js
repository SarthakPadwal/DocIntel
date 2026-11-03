const axios = require('axios');

async function test() {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'rajtest123@gmail.com',
      password: 'password123'
    });
    const token = loginRes.data.data.token;
    console.log('Login OK');

    const docsRes = await axios.get('http://localhost:5000/api/documents', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Docs OK:', JSON.stringify(docsRes.data));
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}
test();
