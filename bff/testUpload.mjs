import fs from 'fs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import FormData from 'form-data';

const JWT_SECRET = 'super-secret-iso27001-key';
const token = jwt.sign({ userId: '123e4567-e89b-12d3-a456-426614174000', organizationId: '123e4567-e89b-12d3-a456-426614174000', role: 'ADMIN' }, JWT_SECRET, { expiresIn: '24h' });

const form = new FormData();
form.append('soa_id', '123e4567-e89b-12d3-a456-426614174000');
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
