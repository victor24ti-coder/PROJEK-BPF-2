/**
 * Mock Backend API - Simple Express server untuk testing
 * 
 * Endpoints:
 * POST /api/auth/login - Login dengan email & password
 * POST /api/auth/signup - Sign up user baru
 * POST /api/auth/logout - Logout
 * GET /api/auth/me - Get current user info
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const SECRET_KEY = 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database untuk testing
const users = [
  {
    id: 1,
    name: 'Demo User',
    email: 'demo@example.com',
    password: 'password123', // HASHED passwords should be used in production
  },
];

/**
 * Middleware untuk verify JWT token
 */
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * POST /api/auth/login
 * Login dengan email & password
 */
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasi input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // Cari user by email
    const user = users.find((u) => u.email === email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email or password is incorrect',
      });
    }

    // Validasi password (dalam production gunakan bcrypt)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Email or password is incorrect',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    // Return response
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * POST /api/auth/signup
 * Sign up user baru
 */
app.post('/api/auth/signup', (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validasi input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    // Check jika email sudah terdaftar
    if (users.find((u) => u.email === email)) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered',
      });
    }

    // Buat user baru
    const newUser = {
      id: users.length + 1,
      name,
      email,
      password, // HASHED passwords should be used in production
    };

    users.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      SECRET_KEY,
      { expiresIn: '24h' }
    );

    // Return response
    res.json({
      success: true,
      message: 'Sign up successful',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout (server-side, untuk invalidate token jika menggunakan blacklist)
 */
app.post('/api/auth/logout', verifyToken, (req, res) => {
  // Dalam production, tambahkan token ke blacklist atau hapus dari database
  res.json({
    success: true,
    message: 'Logout successful',
  });
});

/**
 * GET /api/auth/me
 * Get current user info
 */
app.get('/api/auth/me', verifyToken, (req, res) => {
  try {
    const user = users.find((u) => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log(`\n✅ Mock Backend API is running on http://localhost:${PORT}`);
  console.log(`\n📝 Demo Credentials:`);
  console.log(`   Email: demo@example.com`);
  console.log(`   Password: password123\n`);
  console.log(`📚 Endpoints:`);
  console.log(`   POST /api/auth/login`);
  console.log(`   POST /api/auth/signup`);
  console.log(`   POST /api/auth/logout`);
  console.log(`   GET /api/auth/me\n`);
});
