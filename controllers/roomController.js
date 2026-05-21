import Room from '../models/Room.js';

// GET ALL ROOMS
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('owner', 'name email photo');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch rooms' });
  }
};

// GET SINGLE ROOM ✅ FIXED HERE
export const getRoom = async (req, res) => {
  try {
    // ✅ ADD .populate('owner', 'name email photo')
    const room = await Room.findById(req.params.id).populate('owner', 'name email photo');
    
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch room' });
  }
};

// MY LISTINGS (ONLY MY ROOMS)
export const getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ owner: req.user.id });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: "Failed to load your rooms" });
  }
};

// ADD ROOM (PRIVATE)
export const addRoom = async (req, res) => {
  try {
    const newRoom = new Room({
      ...req.body,
      owner: req.user.id
    });
    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add room' });
  }
};

// UPDATE ROOM (PRIVATE — OWNER ONLY)
export const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (room.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedRoom);
  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
};

// DELETE ROOM (PRIVATE — OWNER ONLY)
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (room.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
};