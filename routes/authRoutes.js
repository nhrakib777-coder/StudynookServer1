import fetch from 'node-fetch';
import express from 'express';
const router = express.Router();
import { register, login, logout, getMe } from '../controllers/authController.js';
import auth from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Regular auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', auth, getMe);

// Google login route
router.get('/google', (req, res) => {
  const { GOOGLE_CLIENT_ID, GOOGLE_CALLBACK_URL } = process.env;

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(GOOGLE_CALLBACK_URL)}&response_type=code&scope=email%20profile`;

  res.redirect(url);
});

// Google callback route
router.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();

    const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const googleUser = await userRes.json();

    let user = await User.findOne({ email: googleUser.email });
    if (!user) {
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        photo: googleUser.picture,
        password: null,
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send token to frontend
    res.redirect(`http://localhost:5173?token=${token}`);

  } catch (err) {
    console.error('Google Auth Error:', err);
    res.redirect('http://localhost:5173/login');
  }
});

export default router;