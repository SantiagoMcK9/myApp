const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Dummy database (in-memory)
const users = [];

// Register endpoint
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const existingUser = users.find(user => user.email === email);
  
  if (existingUser) {
    return res.json({ success: false, message: 'Email already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 8);
  users.push({ email, password: hashedPassword });

  res.json({ success: true });
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(user => user.email === email);

  if (!user) {
    return res.json({ success: false, message: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.json({ success: false, message: 'Invalid credentials' });
  }

  // You can generate a token here if needed
  const token = jwt.sign({ email: user.email }, 'secretkey', { expiresIn: '1h' });

  res.json({ success: true, token });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
