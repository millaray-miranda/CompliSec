const fs = require('fs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const FormData = require('form-data');

async function run() {
  const JWT_SECRET = 'super-secret-iso27001-key';
  // Use the valid user ID from the database
  const token = jwt.sign({ userId: '00000000-0000-0000-0000-000000000000', role: 'ADMIN' }, JWT_SECRET, { expiresIn: '24h' });

  const form = new FormData();
  form.append('soa_id', '00000000-0000-0000-0000-000000000000');
  form.append('file', Buffer.from('test content'), { filename: 'test.pdf' });

  try {
    const response = await axios.post('http://localhost:4000/api/evidences', form, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...form.getHeaders()
      }
    });
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}
run();
