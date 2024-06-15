const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000', credentials: true })); // Adjust origin for your frontend URL

// In-memory database for simplicity (replace with your actual database)
const users = [
  { id: 1, username: 'vardhan975', password: 'vardhan2181' },
  { id: 2, username: 'testuser', password: 'test@2024' }
];

// Secret key for JWT (replace with a secure random string)
const JWT_SECRET = 'my_secret_key'; // Replace with a secure random string

// Login endpoint to generate JWT and set cookie
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Simulated user authentication (replace with actual database query)
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate JWT token
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

  // Set cookie with JWT token
  res.cookie('jwt', token, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
    secure: false, // Set to true in production with HTTPS
    sameSite: 'strict' // Adjust as per your requirements
  });

  // Respond with the token (optional, for demonstration)
  res.json({ token });
});

// Example route to verify JWT token (for protected routes)
app.get('/api/verify', (req, res) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ userId: decoded.userId });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
