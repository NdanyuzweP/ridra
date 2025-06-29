import { Request, Response } from 'express';
import Bus from '../models/Bus';
import BusLocationHistory from '../models/BusLocationHistory';
import User from '../models/User';

export const updateBusLocation = async (req: Request, res: Response) => {
  try {
    const { busId, latitude, longitude, speed = 0, heading = 0, accuracy = 0 } = req.body;
    const driverId = (req as any).user.id;

    // Verify the bus belongs to the driver
    const bus = await Bus.findOne({ _id: busId, driverId });
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found or not assigned to you' });
    }

    // Update bus current location
    const updatedBus = await Bus.findByIdAndUpdate(
      busId,
      {
        currentLocation: {
          latitude,
          longitude,
          lastUpdated: new Date(),
          speed,
          heading,
        },
        isOnline: true,
      },
      { new: true }
    ).populate('driverId', 'name email phone')
     .populate('routeId', 'name description');

    // Save location history
    const locationHistory = new BusLocationHistory({
      busId,
      location: { latitude, longitude },
      speed,
      heading,
      accuracy,
    });
    await locationHistory.save();

    res.json({
      message: 'Location updated successfully',
      bus: updatedBus,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getBusLocation = async (req: Request, res: Response) => {
  try {
    const { busId } = req.params;

    const bus = await Bus.findById(busId)
      .populate('driverId', 'name email phone')
      .populate('routeId', 'name description');

    if (!bus) {
      return res.status(404).json({ error: 'Bus not found' });
    }

    // Check if location is recent (within last 5 minutes)
    const isLocationRecent = bus.currentLocation.lastUpdated && 
      (new Date().getTime() - bus.currentLocation.lastUpdated.getTime()) < 5 * 60 * 1000;

    res.json({
      bus: {
        id: bus._id,
        plateNumber: bus.plateNumber,
        driver: bus.driverId,
        route: bus.routeId,
        currentLocation: bus.currentLocation,
        isOnline: bus.isOnline && isLocationRecent,
        lastSeen: bus.currentLocation.lastUpdated,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAllBusLocations = async (req: Request, res: Response) => {
  try {
    const { routeId, isOnline } = req.query;

    let query: any = { isActive: true };
    if (routeId) query.routeId = routeId;

    const buses = await Bus.find(query)
      .populate('driverId', 'name email phone')
      .populate('routeId', 'name description');

    // Filter and format bus locations
    const busLocations = buses.map(bus => {
      const isLocationRecent = bus.currentLocation.lastUpdated && 
        (new Date().getTime() - bus.currentLocation.lastUpdated.getTime()) < 5 * 60 * 1000;
      
      const busOnline = bus.isOnline && isLocationRecent;

      return {
        id: bus._id,
        plateNumber: bus.plateNumber,
        driver: bus.driverId,
        route: bus.routeId,
        currentLocation: bus.currentLocation,
        isOnline: busOnline,
        lastSeen: bus.currentLocation.lastUpdated,
      };
    }).filter(bus => {
      if (isOnline === 'true') return bus.isOnline;
      if (isOnline === 'false') return !bus.isOnline;
      return true;
    });

    res.json({ buses: busLocations });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getBusLocationHistory = async (req: Request, res: Response) => {
  try {
    const { busId } = req.params;
    const { hours = 1 } = req.query;

    // Calculate time range
    const timeRange = new Date();
    timeRange.setHours(timeRange.getHours() - Number(hours));

    const locationHistory = await BusLocationHistory.find({
      busId,
      timestamp: { $gte: timeRange },
    }).sort({ timestamp: -1 });

    res.json({ locationHistory });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getNearbyBuses = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Convert radius from km to degrees (approximate)
    const radiusInDegrees = Number(radius) / 111;

    const buses = await Bus.find({
      isActive: true,
      'currentLocation.latitude': {
        $gte: Number(latitude) - radiusInDegrees,
        $lte: Number(latitude) + radiusInDegrees,
      },
      'currentLocation.longitude': {
        $gte: Number(longitude) - radiusInDegrees,
        $lte: Number(longitude) + radiusInDegrees,
      },
      'currentLocation.lastUpdated': {
        $gte: new Date(Date.now() - 5 * 60 * 1000), // Within last 5 minutes
      },
    }).populate('driverId', 'name email phone')
      .populate('routeId', 'name description');

    // Calculate actual distances and filter
    const nearbyBuses = buses.map(bus => {
      const distance = calculateDistance(
        Number(latitude),
        Number(longitude),
        bus.currentLocation.latitude!,
        bus.currentLocation.longitude!
      );

      return {
        id: bus._id,
        plateNumber: bus.plateNumber,
        driver: bus.driverId,
        route: bus.routeId,
        currentLocation: bus.currentLocation,
        distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
        isOnline: true,
      };
    }).filter(bus => bus.distance <= Number(radius))
      .sort((a, b) => a.distance - b.distance);

    res.json({ buses: nearbyBuses });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const setDriverOnlineStatus = async (req: Request, res: Response) => {
  try {
    const { busId, isOnline } = req.body;
    const driverId = (req as any).user.id;

    // Verify the bus belongs to the driver
    const bus = await Bus.findOne({ _id: busId, driverId });
    if (!bus) {
      return res.status(404).json({ error: 'Bus not found or not assigned to you' });
    }

    await Bus.findByIdAndUpdate(busId, { isOnline });

    res.json({
      message: `Driver status updated to ${isOnline ? 'online' : 'offline'}`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}