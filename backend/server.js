const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'https://vkartshop.netlify.app'],
  credentials: true
}));

const users = [
  { id: 1, username: 'vardhan975', password: 'vardhan2181' },
  { id: 2, username: 'testuser', password: 'test@2024' }
];

const JWT_SECRET = 'my_secret_key';

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
  res.cookie('jwt_token', token, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    secure: true, // Set to true because your frontend is on HTTPS
    sameSite: 'None'
  });

  res.json({ token });
});

app.get('/api/verify', (req, res) => {
  const token = req.cookies.jwt_token;

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
