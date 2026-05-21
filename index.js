import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/roomsRoutes.js';
import bookingRoutes from './routes/bookingsRoutes.js';

dotenv.config();
connectDB();

const app = express();

// ✅ FIXED CORS (NO TRAILING SLASH + FULL SUPPORT)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://studynookclient.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('StudyNook Server Running ✅');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});