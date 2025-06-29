import { Request, Response } from 'express';
import User from '../models/User';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { role, isActive, page = 1, limit = 10 } = req.query;
    
    // Build query
    let query: any = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get users with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalUsers: total,
        hasNext: skip + users.length < total,
        hasPrev: Number(page) > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { isActive } = req.body;
    const userId = req.params.id;

    // Prevent admin from deactivating themselves
    const currentUserId = (req as any).user.id;
    if (userId === currentUserId && isActive === false) {
      return res.status(400).json({ error: 'Cannot deactivate your own account' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    // Prevent admin from changing their own role
    const currentUserId = (req as any).user.id;
    if (userId === currentUserId) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const currentUserId = (req as any).user.id;

    // Prevent admin from deleting themselves
    if (userId === currentUserId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserStats = async (req: Request, res: Response) => {
  try {
    const stats = await Promise.all([
      User.countDocuments({ role: 'user', isActive: true }),
      User.countDocuments({ role: 'driver', isActive: true }),
      User.countDocuments({ role: 'admin', isActive: true }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({}),
    ]);

    res.json({
      stats: {
        activeUsers: stats[0],
        activeDrivers: stats[1],
        activeAdmins: stats[2],
        inactiveUsers: stats[3],
        totalUsers: stats[4],
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getDrivers = async (req: Request, res: Response) => {
  try {
    const { isActive = true, page = 1, limit = 10 } = req.query;
    
    // Build query for drivers only
    let query: any = { role: 'driver' };
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get drivers with pagination
    const drivers = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await User.countDocuments(query);

    res.json({
      drivers,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalDrivers: total,
        hasNext: skip + drivers.length < total,
        hasPrev: Number(page) > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getRegularUsers = async (req: Request, res: Response) => {
  try {
    const { isActive = true, page = 1, limit = 10 } = req.query;
    
    // Build query for regular users only
    let query: any = { role: 'user' };
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Get users with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalUsers: total,
        hasNext: skip + users.length < total,
        hasPrev: Number(page) > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};