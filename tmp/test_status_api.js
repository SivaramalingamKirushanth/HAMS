const axios = require('axios');

async function testStatus() {
  const email = 'test@student.com';
  try {
    const response = await axios.get(`http://localhost:5000/api/applications/student/${email}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('Error Status:', err.response.status);
      console.error('Error Body:', err.response.data);
    } else {
      console.error('Error Message:', err.message);
    }
  }
}

testStatus();
