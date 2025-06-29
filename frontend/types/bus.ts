export interface Bus {
  id: string;
  route: string;
  destination: string;
  currentLocation: {
    latitude: number;
    longitude: number;
  };
  nextStop: string;
  eta: number; // in minutes
  capacity: number;
  currentPassengers: number;
  isActive: boolean;
  interested: number; // number of people interested
  fare?: number; // in RWF
  schedule?: string;
  distance?: number; // distance from user in km
}

export interface BusStop {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  routes: string[];
}

export interface Route {
  id: string;
  name: string;
  stops: BusStop[];
  color: string;
  fare?: number;
  schedule?: string;
}