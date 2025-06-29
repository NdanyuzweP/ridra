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
    // Generate realistic destination based on route or use defaults
    const destinations = [
      'Downtown/CBD', 'Nyabugogo Bus Park', 'Kinyinya Terminal', 
      'Musave', 'Batsinda Terminal', 'Masaka Terminal', 'Kabuga Bus Park'
    ];
    const nextStops = [
      'Kimironko Market', 'Town Center', 'Remera', 'Kicukiro Center', 
      'Nyamirambo', 'Gisozi', 'Kanombe'
    ];

    return {
      id: backendBus._id,
      route: backendBus.routeId?.name || `Route ${backendBus.plateNumber}`,
      destination: backendBus.routeId?.description || destinations[Math.floor(Math.random() * destinations.length)],
      currentLocation: {
        latitude: backendBus.currentLocation.latitude || -1.9441,
        longitude: backendBus.currentLocation.longitude || 30.0619,
      },
      nextStop: nextStops[Math.floor(Math.random() * nextStops.length)],
      eta: distance ? Math.max(Math.floor(distance * 3), 2) : Math.floor(Math.random() * 20) + 5,
      capacity: backendBus.capacity || 30,
      currentPassengers: Math.floor(Math.random() * (backendBus.capacity || 25)),
      isActive: backendBus.isActive && backendBus.isOnline,
      interested: Math.floor(Math.random() * 10),
      fare: Math.floor(Math.random() * 300) + 250, // 250-550 RWF
      schedule: '05:00–23:00',
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
      fare: Math.floor(Math.random() * 300) + 250,
      schedule: '05:00–23:00',
      distance: apiBus.distance,
    };
  };

  const fetchBuses = async () => {
    try {
      setLoading(true);
      setError(null);

      if (userLocation) {
        // Try to fetch nearby buses first
        try {
          const response = await apiService.getNearbyBuses(
            userLocation.latitude,
            userLocation.longitude,
            15 // 15km radius
          );
          const transformedBuses = response.buses.map(transformApiBusToFrontendBus);
          setBuses(transformedBuses);
          return;
        } catch (nearbyError) {
          console.log('Nearby buses API failed, trying all buses:', nearbyError);
        }
      }

      // Fallback to all buses
      try {
        const response = await apiService.getBuses();
        console.log('Fetched buses from backend:', response.buses.length);
        
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

        setBuses(transformedBuses);
      } catch (busesError) {
        console.log('All buses API failed, using fallback data:', busesError);
        throw busesError;
      }

    } catch (err: any) {
      console.error('Error fetching buses:', err);
      setError(err.message || 'Failed to fetch buses');
      
      // Fallback to mock data if all API calls fail
      try {
        const { generateRealisticBuses } = await import('@/utils/rwandaBusData');
        const mockBuses = generateRealisticBuses(userLocation);
        setBuses(mockBuses);
        console.log('Using mock bus data:', mockBuses.length);
      } catch (mockError) {
        console.error('Failed to load mock data:', mockError);
      }
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