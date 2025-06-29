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

interface BackendBus {
  _id: string;
  plateNumber: string;
  capacity: number;
  driverId: any;
  routeId: any;
  currentLocation: {
    latitude: number | null;
    longitude: number | null;
    lastUpdated: Date | null;
    speed: number;
    heading: number;
  };
  isActive: boolean;
  isOnline: boolean;
}

export function useBuses(userLocation?: { latitude: number; longitude: number }) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const transformBackendBusToFrontendBus = (backendBus: BackendBus, distance?: number): Bus => {
    // Use actual route data from your database
    const routeName = backendBus.routeId?.name || `Bus ${backendBus.plateNumber}`;
    const routeDescription = backendBus.routeId?.description || 'Route Description';
    
    // Use actual driver data from your database
    const driverName = backendBus.driverId?.name || 'Driver';
    
    // Calculate ETA based on distance and estimated duration
    let eta = Math.floor(Math.random() * 20) + 5; // Default fallback
    if (distance && backendBus.routeId?.estimatedDuration) {
      // Use route's estimated duration and distance to calculate ETA
      eta = Math.max(Math.floor(distance * 3), 2); // Minimum 2 minutes
    }

    return {
      id: backendBus._id,
      route: routeName,
      destination: routeDescription,
      currentLocation: {
        latitude: backendBus.currentLocation.latitude || -1.9441,
        longitude: backendBus.currentLocation.longitude || 30.0619,
      },
      nextStop: 'Next Stop', // You can enhance this with actual pickup point data
      eta,
      capacity: backendBus.capacity || 30,
      currentPassengers: Math.floor(Math.random() * (backendBus.capacity || 25)),
      isActive: backendBus.isActive && backendBus.isOnline,
      interested: Math.floor(Math.random() * 10),
      fare: 400, // You can add fare to your bus/route model
      schedule: '05:00–23:00', // You can enhance this with actual schedule data
      distance: distance,
    };
  };

  const transformApiBusToFrontendBus = (apiBus: ApiBus): Bus => {
    return {
      id: apiBus.id,
      route: apiBus.route?.name || `Bus ${apiBus.plateNumber}`,
      destination: apiBus.route?.description || 'Unknown Destination',
      currentLocation: {
        latitude: apiBus.currentLocation.latitude || -1.9441,
        longitude: apiBus.currentLocation.longitude || 30.0619,
      },
      nextStop: 'Next Stop',
      eta: apiBus.distance ? Math.max(Math.floor(apiBus.distance * 3), 2) : Math.floor(Math.random() * 20) + 5,
      capacity: 30,
      currentPassengers: Math.floor(Math.random() * 25),
      isActive: apiBus.isOnline,
      interested: Math.floor(Math.random() * 10),
      fare: 400,
      schedule: '05:00–23:00',
      distance: apiBus.distance,
    };
  };

  const fetchBuses = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching buses from your database...');

      if (userLocation) {
        // Try to fetch nearby buses first
        try {
          const response = await apiService.getNearbyBuses(
            userLocation.latitude,
            userLocation.longitude,
            15 // 15km radius
          );
          console.log('Found nearby buses:', response.buses.length);
          const transformedBuses = response.buses.map(transformApiBusToFrontendBus);
          setBuses(transformedBuses);
          return;
        } catch (nearbyError) {
          console.log('Nearby buses API failed, trying all buses:', nearbyError);
        }
      }

      // Fetch all buses from your database
      const response = await apiService.getBuses();
      console.log('Fetched buses from your database:', response.buses.length);
      
      if (response.buses.length === 0) {
        console.log('No buses found in your database');
        setError('No buses found in database. Please add some buses first.');
        setBuses([]);
        return;
      }
      
      let transformedBuses = response.buses
        .filter(bus => bus.isActive)
        .map(bus => {
          let distance: number | undefined;
          if (userLocation && bus.currentLocation.latitude && bus.currentLocation.longitude) {
            distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              bus.currentLocation.latitude,
              bus.currentLocation.longitude
            );
          }
          return transformBackendBusToFrontendBus(bus, distance);
        });

      // Sort by distance if user location is available
      if (userLocation) {
        transformedBuses = transformedBuses
          .filter(bus => !bus.distance || bus.distance <= 20) // Within 20km
          .sort((a, b) => (a.distance || 999) - (b.distance || 999));
      }

      console.log('Transformed buses for frontend:', transformedBuses.length);
      setBuses(transformedBuses);

    } catch (err: any) {
      console.error('Error fetching buses from your database:', err);
      setError(err.message || 'Failed to fetch buses from database');
      setBuses([]);
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