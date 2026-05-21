import express from 'express';
const router = express.Router();
import { bookRoom, getMyBookings, cancelBooking } from '../controllers/bookingController.js';
import auth from '../middleware/authMiddleware.js';

router.post('/', auth, bookRoom);
router.get('/my', auth, getMyBookings);
router.patch('/:id/cancel', auth, cancelBooking);

export default router;