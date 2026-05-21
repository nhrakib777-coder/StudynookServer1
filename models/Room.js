import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  floor: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  hourlyRate: {
    type: Number,
    required: true,
  },
  amenities: {
    type: [String],
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bookingCount: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// ✅ THIS IS THE FIX: Use ES Module default export
const Room = mongoose.model('Room', roomSchema);
export default Room;