import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { Bus } from '@/types/bus';

interface ApiBus {
  id: string;
  plateNumber: string;
  driver: any;
  route: any;
  currentLocation: {
    latitude: number | null;
    longitude: number | null;
    lastUpdated: Date | null;
    speed: number;
    heading: number;
  };
  distance?: number;
  isOnline: boolean;
}

export function useBuses(userLocation?: { latitude: number; longitude: number }) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const transformApiBusToFrontendBus = (apiBus: ApiBus): Bus => {
    return {
      id: apiBus.id,
      route: apiBus.route?.name || `Bus ${apiBus.plateNumber}`,
      destination: apiBus.route?.description || 'Unknown Destination',
      currentLocation: {
        latitude: apiBus.currentLocation.latitude || 0,
        longitude: apiBus.currentLocation.longitude || 0,
      },
      nextStop: 'Next Stop', // This would need to be calculated based on route data
      eta: apiBus.distance ? Math.max(Math.floor(apiBus.distance * 3), 2) : Math.floor(Math.random() * 20) + 5,
      capacity: 30, // Default capacity
      currentPassengers: Math.floor(Math.random() * 25), // This would come from real data
      isActive: apiBus.isOnline,
      interested: Math.floor(Math.random() * 10), // This would come from user interests
      fare: 400, // Default fare, would come from route data
      schedule: '05:00–23:00', // Default schedule
      distance: apiBus.distance,
    };
  };

  const fetchBuses = async () => {
    try {
      setLoading(true);
      setError(null);

      if (userLocation) {
        // Fetch nearby buses if user location is available
        const response = await apiService.getNearbyBuses(
          userLocation.latitude,
          userLocation.longitude,
          10 // 10km radius
        );
        const transformedBuses = response.buses.map(transformApiBusToFrontendBus);
        setBuses(transformedBuses);
      } else {
        // Fetch all bus locations
        const response = await apiService.getAllBusLocations();
        const transformedBuses = response.buses
          .filter(bus => bus.isOnline)
          .map(transformApiBusToFrontendBus);
        setBuses(transformedBuses);
      }
    } catch (err: any) {
      console.error('Error fetching buses:', err);
      setError(err.message || 'Failed to fetch buses');
      // Fallback to mock data if API fails
      const { generateRealisticBuses } = await import('@/utils/rwandaBusData');
      setBuses(generateRealisticBuses(userLocation));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
    
    // Set up polling to refresh bus data every 30 seconds
    const interval = setInterval(fetchBuses, 30000);
    
    return () => clearInterval(interval);
  }, [userLocation]);

  const refetch = () => {
    fetchBuses();
  };

  return { buses, loading, error, refetch };
}