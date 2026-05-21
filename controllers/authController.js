import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Register User
export const register = async (req, res) => {
  try {
    const { name, email, photo,password  } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      photo
    });

    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict'
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      photo: user.photo
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict'
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      photo: user.photo
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout User
export const logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};

// Get Current User
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};