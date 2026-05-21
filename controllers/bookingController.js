import Booking from '../models/Booking.js';
import Room from '../models/Room.js';

// BOOK ROOM ✅ FIXED
export const bookRoom = async (req, res) => {
  try {
    const { roomId, date, startTime, endTime, totalCost, note } = req.body;

    const conflict = await Booking.findOne({
      room: roomId,
      date,
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
      ]
    });

    if (conflict) {
      return res.status(400).json({ message: 'Time slot is already booked!' });
    }

    const booking = new Booking({
      user: req.user._id,
      room: roomId,
      date,
      startTime,
      endTime,
      totalCost,
      note,
    });

    await booking.save();

    // ✅ AUTO INCREASE BOOKING COUNT
    await Room.findByIdAndUpdate(roomId, {
      $inc: { bookingCount: 1 }
    });

    res.status(201).json({ message: 'Room booked successfully!', booking });

  } catch (err) {
    res.status(500).json({ message: 'Booking failed' });
  }
};

// GET MY BOOKINGS
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('room', 'name image hourlyRate floor');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load bookings' });
  }
};

// CANCEL BOOKING
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ message: 'Cancel failed' });
  }
};