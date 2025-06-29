import { Request, Response } from 'express';
import BusSchedule from '../models/BusSchedule';
import Bus from '../models/Bus';
import Route from '../models/Route';
import UserInterest from '../models/UserInterest';

export const createBusSchedule = async (req: Request, res: Response) => {
  try {
    const { busId, routeId, departureTime, estimatedArrivalTimes } = req.body;

    // Verify bus exists
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(400).json({ error: 'Invalid bus' });
    }

    // Verify route exists
    const route = await Route.findById(routeId);
    if (!route) {
      return res.status(400).json({ error: 'Invalid route' });
    }

    const busSchedule = new BusSchedule({
      busId,
      routeId,
      departureTime,
      estimatedArrivalTimes,
    });

    await busSchedule.save();

    const populatedSchedule = await BusSchedule.findById(busSchedule._id)
      .populate('busId', 'plateNumber capacity')
      .populate('routeId', 'name description')
      .populate('estimatedArrivalTimes.pickupPointId', 'name description');

    res.status(201).json({
      message: 'Bus schedule created successfully',
      schedule: populatedSchedule,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllBusSchedules = async (req: Request, res: Response) => {
  try {
    const { status, routeId, date } = req.query;
    
    let query: any = {};
    if (status) query.status = status;
    if (routeId) query.routeId = routeId;
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      query.departureTime = { $gte: startDate, $lt: endDate };
    }

    const schedules = await BusSchedule.find(query)
      .populate('busId', 'plateNumber capacity')
      .populate('routeId', 'name description')
      .populate('estimatedArrivalTimes.pickupPointId', 'name description')
      .sort({ departureTime: 1 });

    res.json({ schedules });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getBusScheduleById = async (req: Request, res: Response) => {
  try {
    const schedule = await BusSchedule.findById(req.params.id)
      .populate('busId', 'plateNumber capacity')
      .populate('routeId', 'name description')
      .populate('estimatedArrivalTimes.pickupPointId', 'name description');

    if (!schedule) {
      return res.status(404).json({ error: 'Bus schedule not found' });
    }

    res.json({ schedule });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateBusSchedule = async (req: Request, res: Response) => {
  try {
    const { departureTime, estimatedArrivalTimes, status } = req.body;

    const schedule = await BusSchedule.findByIdAndUpdate(
      req.params.id,
      { departureTime, estimatedArrivalTimes, status },
      { new: true }
    ).populate('busId', 'plateNumber capacity')
     .populate('routeId', 'name description')
     .populate('estimatedArrivalTimes.pickupPointId', 'name description');

    if (!schedule) {
      return res.status(404).json({ error: 'Bus schedule not found' });
    }

    res.json({
      message: 'Bus schedule updated successfully',
      schedule,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateArrivalTime = async (req: Request, res: Response) => {
  try {
    const { pickupPointId, actualTime } = req.body;

    const schedule = await BusSchedule.findOneAndUpdate(
      { 
        _id: req.params.id,
        'estimatedArrivalTimes.pickupPointId': pickupPointId 
      },
      { 
        $set: { 'estimatedArrivalTimes.$.actualTime': actualTime }
      },
      { new: true }
    ).populate('busId', 'plateNumber capacity')
     .populate('routeId', 'name description')
     .populate('estimatedArrivalTimes.pickupPointId', 'name description');

    if (!schedule) {
      return res.status(404).json({ error: 'Bus schedule or pickup point not found' });
    }

    res.json({
      message: 'Arrival time updated successfully',
      schedule,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getInterestedUsers = async (req: Request, res: Response) => {
  try {
    const interests = await UserInterest.find({
      busScheduleId: req.params.id,
      status: { $in: ['interested', 'confirmed'] }
    }).populate('userId', 'name email phone')
      .populate('pickupPointId', 'name description');

    res.json({ interests });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteBusSchedule = async (req: Request, res: Response) => {
  try {
    const schedule = await BusSchedule.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!schedule) {
      return res.status(404).json({ error: 'Bus schedule not found' });
    }

    res.json({ message: 'Bus schedule cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};