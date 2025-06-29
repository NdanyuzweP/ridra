import User from '../models/User';
import Bus from '../models/Bus';
import Route from '../models/Route';
import PickupPoint from '../models/PickupPoint';
import BusSchedule from '../models/BusSchedule';

// Rwanda bus routes data
const RWANDA_ROUTES = [
  {
    name: 'Route 302',
    description: 'Kimironko - Downtown/CBD',
    estimatedDuration: 45,
  },
  {
    name: 'Route 305',
    description: 'Kimironko - Nyabugogo Bus Park',
    estimatedDuration: 60,
  },
  {
    name: 'Route 309',
    description: 'Kimironko - Kinyinya Terminal',
    estimatedDuration: 35,
  },
  {
    name: 'Route 316',
    description: 'Kimironko - Musave via Zindiro',
    estimatedDuration: 40,
  },
  {
    name: 'Route 318',
    description: 'Kimironko - Batsinda Terminal',
    estimatedDuration: 50,
  },
];

// Kigali locations
const KIGALI_LOCATIONS = [
  { name: 'Kimironko Market', latitude: -1.9441, longitude: 30.1056 },
  { name: 'Downtown/CBD', latitude: -1.9441, longitude: 30.0619 },
  { name: 'Nyabugogo Bus Park', latitude: -1.9378, longitude: 30.0434 },
  { name: 'Kinyinya Terminal', latitude: -1.9167, longitude: 30.1167 },
  { name: 'Musave', latitude: -1.9500, longitude: 30.0800 },
  { name: 'Batsinda Terminal', latitude: -1.9800, longitude: 30.1200 },
  { name: 'Remera', latitude: -1.9578, longitude: 30.1086 },
  { name: 'Kicukiro Center', latitude: -1.9706, longitude: 30.1044 },
];

export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Create sample drivers
    const drivers = [];
    for (let i = 1; i <= 10; i++) {
      const driver = new User({
        name: `Driver ${i}`,
        email: `driver${i}@ridra.rw`,
        password: 'password123',
        phone: `+25078812345${i}`,
        role: 'driver',
      });
      await driver.save();
      drivers.push(driver);
    }
    console.log(`Created ${drivers.length} drivers`);

    // Create routes
    const routes = [];
    for (const routeData of RWANDA_ROUTES) {
      const route = new Route(routeData);
      await route.save();
      routes.push(route);
    }
    console.log(`Created ${routes.length} routes`);

    // Create pickup points for each route
    const pickupPoints = [];
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      
      // Add 3-4 pickup points per route
      const pointsForRoute = KIGALI_LOCATIONS.slice(0, 4);
      
      for (let j = 0; j < pointsForRoute.length; j++) {
        const location = pointsForRoute[j];
        const pickupPoint = new PickupPoint({
          name: location.name,
          description: `${location.name} - ${route.name}`,
          latitude: location.latitude,
          longitude: location.longitude,
          routeId: route._id,
          order: j + 1,
        });
        await pickupPoint.save();
        pickupPoints.push(pickupPoint);
        
        // Add pickup point to route
        await Route.findByIdAndUpdate(
          route._id,
          { $push: { pickupPoints: pickupPoint._id } }
        );
      }
    }
    console.log(`Created ${pickupPoints.length} pickup points`);

    // Create buses
    const buses = [];
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      
      // Create 2-3 buses per route
      const busCount = Math.floor(Math.random() * 2) + 2;
      
      for (let j = 0; j < busCount; j++) {
        const driver = drivers[Math.floor(Math.random() * drivers.length)];
        const plateNumber = `RAD ${String(i * 100 + j + 1).padStart(3, '0')} A`;
        
        // Random location along the route
        const startLocation = KIGALI_LOCATIONS[0]; // Kimironko
        const endLocation = KIGALI_LOCATIONS[i + 1] || KIGALI_LOCATIONS[1]; // Route destination
        
        const progress = Math.random();
        const currentLat = startLocation.latitude + (endLocation.latitude - startLocation.latitude) * progress;
        const currentLng = startLocation.longitude + (endLocation.longitude - startLocation.longitude) * progress;
        
        const bus = new Bus({
          plateNumber,
          capacity: 30,
          driverId: driver._id,
          routeId: route._id,
          currentLocation: {
            latitude: currentLat + (Math.random() - 0.5) * 0.01,
            longitude: currentLng + (Math.random() - 0.5) * 0.01,
            lastUpdated: new Date(),
            speed: Math.random() * 40,
            heading: Math.random() * 360,
          },
          isActive: true,
          isOnline: Math.random() > 0.2, // 80% online
        });
        
        await bus.save();
        buses.push(bus);
      }
    }
    console.log(`Created ${buses.length} buses`);

    // Create bus schedules
    const schedules = [];
    for (const bus of buses) {
      // Create 2-3 schedules per bus for today and tomorrow
      for (let day = 0; day < 2; day++) {
        const scheduleCount = Math.floor(Math.random() * 2) + 2;
        
        for (let i = 0; i < scheduleCount; i++) {
          const departureTime = new Date();
          departureTime.setDate(departureTime.getDate() + day);
          departureTime.setHours(6 + i * 4, Math.random() * 60, 0, 0);
          
          // Get pickup points for this route
          const routePickupPoints = pickupPoints.filter(
            point => point.routeId.toString() === bus.routeId.toString()
          );
          
          const estimatedArrivalTimes = routePickupPoints.map((point, index) => ({
            pickupPointId: point._id,
            estimatedTime: new Date(departureTime.getTime() + (index + 1) * 15 * 60 * 1000), // 15 min intervals
          }));
          
          const schedule = new BusSchedule({
            busId: bus._id,
            routeId: bus.routeId,
            departureTime,
            estimatedArrivalTimes,
            status: 'scheduled',
          });
          
          await schedule.save();
          schedules.push(schedule);
        }
      }
    }
    console.log(`Created ${schedules.length} bus schedules`);

    console.log('Database seeding completed successfully!');
    console.log('Summary:');
    console.log(`- ${drivers.length} drivers`);
    console.log(`- ${routes.length} routes`);
    console.log(`- ${pickupPoints.length} pickup points`);
    console.log(`- ${buses.length} buses`);
    console.log(`- ${schedules.length} schedules`);

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};