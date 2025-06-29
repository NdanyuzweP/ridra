import { Request, Response } from 'express';
import UserInterest from '../models/UserInterest';
import BusSchedule from '../models/BusSchedule';
import PickupPoint from '../models/PickupPoint';

export const createUserInterest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { busScheduleId, pickupPointId } = req.body;

    // Verify bus schedule exists
    const busSchedule = await BusSchedule.findById(busScheduleId);
    if (!busSchedule) {
      return res.status(400).json({ error: 'Invalid bus schedule' });
    }

    // Verify pickup point exists
    const pickupPoint = await PickupPoint.findById(pickupPointId);
    if (!pickupPoint) {
      return res.status(400).json({ error: 'Invalid pickup point' });
    }

    // Check if user already has interest for this schedule
    const existingInterest = await UserInterest.findOne({
      userId,
      busScheduleId,
      status: { $in: ['interested', 'confirmed'] }
    });

    if (existingInterest) {
      return res.status(400).json({ error: 'Already interested in this bus schedule' });
    }

    const userInterest = new UserInterest({
      userId,
      busScheduleId,
      pickupPointId,
    });

    await userInterest.save();

    const populatedInterest = await UserInterest.findById(userInterest._id)
      .populate('busScheduleId', 'departureTime status')
      .populate('pickupPointId', 'name description');

    res.status(201).json({
      message: 'Interest registered successfully',
      interest: populatedInterest,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getUserInterests = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    
    const interests = await UserInterest.find({ userId })
      .populate({
        path: 'busScheduleId',
        populate: [
          { path: 'busId', select: 'plateNumber capacity' },
          { path: 'routeId', select: 'name description' }
        ]
      })
      .populate('pickupPointId', 'name description')
      .sort({ createdAt: -1 });

    res.json({ interests });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateUserInterest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { status } = req.body;

    const interest = await UserInterest.findOneAndUpdate(
      { _id: req.params.id, userId },
      { status },
      { new: true }
    ).populate('busScheduleId', 'departureTime status')
     .populate('pickupPointId', 'name description');

    if (!interest) {
      return res.status(404).json({ error: 'Interest not found' });
    }

    res.json({
      message: 'Interest updated successfully',
      interest,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteUserInterest = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const interest = await UserInterest.findOneAndUpdate(
      { _id: req.params.id, userId },
      { status: 'cancelled' },
      { new: true }
    );

    if (!interest) {
      return res.status(404).json({ error: 'Interest not found' });
    }

    res.json({ message: 'Interest cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};