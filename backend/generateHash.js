const bcrypt = require('bcryptjs');

async function generateHash() {
  const password1 = 'Admin123!';
  const password2 = 'Test123!';
  
  const salt = await bcrypt.genSalt(10);
  const hash1 = await bcrypt.hash(password1, salt);
  const hash2 = await bcrypt.hash(password2, salt);
  
  console.log('Admin123! ->', hash1);
  console.log('Test123!  ->', hash2);
}

generateHash();
