import express from 'express';
const router = express.Router();

import {
  getRooms,
  getRoom,
  addRoom,
  getMyRooms,
  updateRoom,
  deleteRoom
} from '../controllers/roomController.js';

import auth from '../middleware/authMiddleware.js';

router.get('/', getRooms);
router.get('/:id', getRoom);
router.post('/', auth, addRoom);
router.get('/my/listings', auth, getMyRooms);
router.put('/:id', auth, updateRoom);
router.delete('/:id', auth, deleteRoom);

export default router;