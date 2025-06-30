import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface DriverBus {
  id: string;
  plateNumber: string;
  capacity: number;
  fare: number;
  route: {
    id: string;
    name: string;
    description: string;
    estimatedDuration: number;
  } | null;
  isOnline: boolean;
  isActive: boolean;
}

interface Schedule {
  id: string;
  departureTime: Date;
  status: string;
  estimatedArrivalTimes: Array<{
    pickupPointId: string;
    estimatedTime: Date;
    actualTime?: Date;
  }>;
}

interface Passenger {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  } | null;
  pickupPoint: {
    id: string;
    name: string;
    description: string;
  } | null;
  status: string;
  createdAt: Date;
}

export function useDriverData() {
  const { user } = useAuth();
  const [bus, setBus] = useState<DriverBus | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDriverData = async () => {
    if (!user || user.role !== 'driver') {
      setError('Not authorized as driver');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get all buses and find the one assigned to this driver
      const busesResponse = await apiService.getBuses();
      const driverBus = busesResponse.buses.find(b => b.driverId?._id === user.id || b.driverId?.id === user.id);
      
      if (!driverBus) {
        setError('No bus assigned to you. Please contact your administrator.');
        setBus(null);
        setSchedules([]);
        setPassengers([]);
        setLoading(false);
        return;
      }

      // Transform bus data
      const transformedBus: DriverBus = {
        id: driverBus._id,
        plateNumber: driverBus.plateNumber,
        capacity: driverBus.capacity,
        fare: driverBus.fare,
        route: driverBus.routeId ? {
          id: driverBus.routeId._id || driverBus.routeId.id,
          name: driverBus.routeId.name || 'Unknown Route',
          description: driverBus.routeId.description || '',
          estimatedDuration: driverBus.routeId.estimatedDuration || 0,
        } : null,
        isOnline: driverBus.isOnline,
        isActive: driverBus.isActive,
      };

      setBus(transformedBus);

      // Get schedules for this bus
      const schedulesResponse = await apiService.getBusSchedules();
      const busSchedules = schedulesResponse.schedules
        .filter(schedule => 
          schedule.busId?._id === driverBus._id || 
          schedule.busId?.id === driverBus._id ||
          schedule.busId === driverBus._id
        )
        .map(schedule => ({
          id: schedule._id,
          departureTime: new Date(schedule.departureTime),
          status: schedule.status,
          estimatedArrivalTimes: schedule.estimatedArrivalTimes.map(arrival => ({
            pickupPointId: typeof arrival.pickupPointId === 'string' ? arrival.pickupPointId : arrival.pickupPointId._id,
            estimatedTime: new Date(arrival.estimatedTime),
            actualTime: arrival.actualTime ? new Date(arrival.actualTime) : undefined,
          })),
        }));

      setSchedules(busSchedules);

      // Get interested passengers for all schedules
      const allPassengers: Passenger[] = [];
      for (const schedule of busSchedules) {
        try {
          const passengersResponse = await apiService.getInterestedPassengers(schedule.id);
          const schedulePassengers = passengersResponse.interests.map(interest => ({
            id: interest._id,
            user: interest.userId ? {
              id: interest.userId._id || interest.userId.id,
              name: interest.userId.name || 'Unknown User',
              email: interest.userId.email || '',
              phone: interest.userId.phone || '',
            } : null,
            pickupPoint: interest.pickupPointId ? {
              id: interest.pickupPointId._id || interest.pickupPointId.id,
              name: interest.pickupPointId.name || 'Unknown Stop',
              description: interest.pickupPointId.description || '',
            } : null,
            status: interest.status,
            createdAt: new Date(interest.createdAt),
          }));
          allPassengers.push(...schedulePassengers);
        } catch (passengerError) {
          console.log('Error fetching passengers for schedule:', schedule.id, passengerError);
        }
      }

      setPassengers(allPassengers);

    } catch (err: any) {
      console.error('Error fetching driver data:', err);
      setError(err.message || 'Failed to fetch driver data');
    } finally {
      setLoading(false);
    }
  };

  const updateOnlineStatus = async (isOnline: boolean): Promise<boolean> => {
    if (!bus) return false;

    try {
      await apiService.setDriverOnlineStatus(bus.id, isOnline);
      setBus(prev => prev ? { ...prev, isOnline } : null);
      return true;
    } catch (err: any) {
      console.error('Error updating online status:', err);
      setError(err.message || 'Failed to update online status');
      return false;
    }
  };

  const updateBusLocation = async (
    latitude: number, 
    longitude: number, 
    speed: number = 0, 
    heading: number = 0, 
    accuracy: number = 0
  ): Promise<boolean> => {
    if (!bus) return false;

    try {
      await apiService.updateBusLocation(bus.id, latitude, longitude, speed, heading, accuracy);
      return true;
    } catch (err: any) {
      console.error('Error updating bus location:', err);
      setError(err.message || 'Failed to update location');
      return false;
    }
  };

  useEffect(() => {
    fetchDriverData();
    
    // Set up polling to refresh data every 30 seconds
    const interval = setInterval(fetchDriverData, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  const refetch = () => {
    fetchDriverData();
  };

  return { 
    bus, 
    schedules, 
    passengers, 
    loading, 
    error, 
    refetch, 
    updateOnlineStatus, 
    updateBusLocation 
  };
}