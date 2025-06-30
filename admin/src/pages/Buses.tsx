import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { 
  Bus as BusIcon, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin,
  Users,
  DollarSign,
  Activity,
  AlertCircle,
  UserCheck,
  Navigation as RouteIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Bus {
  _id: string;
  plateNumber: string;
  capacity: number;
  fare: number;
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
  createdAt: string;
}

export default function Buses() {
  const { theme } = useTheme();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showBusModal, setShowBusModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [formData, setFormData] = useState({
    plateNumber: '',
    capacity: '',
    fare: '',
    driverId: '',
    routeId: '',
  });

  useEffect(() => {
    fetchBuses();
    fetchDrivers();
    fetchRoutes();
  }, []);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getBuses();
      setBuses(response.buses);
    } catch (err: any) {
      console.error('Error fetching buses:', err);
      setError(err.message || 'Failed to fetch buses');
      toast.error('Failed to fetch buses');
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await apiService.getDrivers({ isActive: true });
      setDrivers(response.drivers);
    } catch (err: any) {
      console.error('Error fetching drivers:', err);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await apiService.getRoutes();
      setRoutes(response.routes.filter(route => route.isActive));
    } catch (err: any) {
      console.error('Error fetching routes:', err);
    }
  };

  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.plateNumber || !formData.capacity || !formData.driverId || !formData.routeId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const data = {
        plateNumber: formData.plateNumber,
        capacity: parseInt(formData.capacity),
        driverId: formData.driverId,
        routeId: formData.routeId,
        ...(formData.fare && { fare: parseInt(formData.fare) }),
      };

      if (selectedBus) {
        await apiService.updateBus(selectedBus._id, data);
        toast.success('Bus updated successfully');
      } else {
        await apiService.createBus(data);
        toast.success('Bus created successfully');
      }
      
      setShowBusModal(false);
      setSelectedBus(null);
      setFormData({
        plateNumber: '',
        capacity: '',
        fare: '',
        driverId: '',
        routeId: '',
      });
      fetchBuses();
    } catch (err: any) {
      console.error('Error saving bus:', err);
      toast.error(err.message || 'Failed to save bus');
    }
  };

  const handleEditBus = (bus: Bus) => {
    setSelectedBus(bus);
    setFormData({
      plateNumber: bus.plateNumber,
      capacity: bus.capacity.toString(),
      fare: bus.fare.toString(),
      driverId: typeof bus.driverId === 'string' ? bus.driverId : bus.driverId?._id || '',
      routeId: typeof bus.routeId === 'string' ? bus.routeId : bus.routeId?._id || '',
    });
    setShowBusModal(true);
  };

  const handleDeleteBus = async (bus: Bus) => {
    if (!window.confirm(`Are you sure you want to delete bus ${bus.plateNumber}?`)) {
      return;
    }

    try {
      await apiService.deleteBus(bus._id);
      toast.success('Bus deleted successfully');
      fetchBuses();
    } catch (err: any) {
      console.error('Error deleting bus:', err);
      toast.error(err.message || 'Failed to delete bus');
    }
  };

  const filteredBuses = buses.filter(bus =>
    bus.plateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bus.driverId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bus.routeId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(bus => {
    if (statusFilter === 'active') return bus.isActive;
    if (statusFilter === 'inactive') return !bus.isActive;
    if (statusFilter === 'online') return bus.isOnline;
    if (statusFilter === 'offline') return !bus.isOnline;
    return true;
  });

  if (loading && buses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
            Buses Management
          </h1>
          <p style={{ color: theme.textSecondary }}>
            Manage your bus fleet and assignments
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setSelectedBus(null);
            setFormData({
              plateNumber: '',
              capacity: '',
              fare: '',
              driverId: '',
              routeId: '',
            });
            setShowBusModal(true);
          }}
        >
          <Plus size={20} />
          Add Bus
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Total Buses
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {buses.length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.primary + '20' }}
              >
                <BusIcon size={24} style={{ color: theme.primary }} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Active Buses
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {buses.filter(b => b.isActive).length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.success + '20' }}
              >
                <Activity size={24} style={{ color: theme.success }} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Online Now
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {buses.filter(b => b.isOnline).length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.warning + '20' }}
              >
                <MapPin size={24} style={{ color: theme.warning }} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Total Capacity
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {buses.reduce((sum, bus) => sum + bus.capacity, 0)}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.secondary + '20' }}
              >
                <Users size={24} style={{ color: theme.secondary }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search 
                size={16} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: theme.textSecondary }}
              />
              <input
                type="text"
                placeholder="Search buses..."
                className="form-input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.text,
                }}
              />
            </div>
            
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.text,
              }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
            
            <button
              onClick={fetchBuses}
              className="btn btn-outline"
              disabled={loading}
            >
              {loading ? <div className="spinner" /> : <Filter size={16} />}
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Buses Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold" style={{ color: theme.text }}>
            Buses ({filteredBuses.length})
          </h3>
        </div>
        <div className="card-body p-0">
          {error ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <AlertCircle size={48} style={{ color: theme.error }} className="mx-auto mb-4" />
                <p style={{ color: theme.error }} className="text-lg font-semibold mb-2">
                  Error Loading Buses
                </p>
                <p style={{ color: theme.textSecondary }} className="mb-4">
                  {error}
                </p>
                <button
                  onClick={fetchBuses}
                  className="btn btn-primary"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : filteredBuses.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <BusIcon size={48} style={{ color: theme.textSecondary }} className="mx-auto mb-4" />
                <p style={{ color: theme.text }} className="text-lg font-semibold mb-2">
                  No Buses Found
                </p>
                <p style={{ color: theme.textSecondary }}>
                  {searchTerm || statusFilter 
                    ? 'Try adjusting your filters' 
                    : 'No buses have been added yet'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ color: theme.textSecondary }}>Bus</th>
                    <th style={{ color: theme.textSecondary }}>Driver</th>
                    <th style={{ color: theme.textSecondary }}>Route</th>
                    <th style={{ color: theme.textSecondary }}>Capacity</th>
                    <th style={{ color: theme.textSecondary }}>Fare</th>
                    <th style={{ color: theme.textSecondary }}>Status</th>
                    <th style={{ color: theme.textSecondary }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBuses.map((bus) => (
                    <tr key={bus._id}>
                      <td>
                        <div className="flex items-center">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                            style={{ backgroundColor: bus.isOnline ? theme.success + '20' : theme.textSecondary + '20' }}
                          >
                            <BusIcon size={20} style={{ color: bus.isOnline ? theme.success : theme.textSecondary }} />
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: theme.text }}>
                              {bus.plateNumber}
                            </p>
                            <p className="text-sm" style={{ color: theme.textSecondary }}>
                              ID: {bus._id.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        {bus.driverId ? (
                          <div className="flex items-center">
                            <div 
                              className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                              style={{ backgroundColor: theme.primary + '20' }}
                            >
                              <UserCheck size={16} style={{ color: theme.primary }} />
                            </div>
                            <div>
                              <p className="font-medium text-sm" style={{ color: theme.text }}>
                                {bus.driverId.name || 'Unknown Driver'}
                              </p>
                              <p className="text-xs" style={{ color: theme.textSecondary }}>
                                {bus.driverId.phone || 'No phone'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm" style={{ color: theme.textSecondary }}>
                            No driver assigned
                          </span>
                        )}
                      </td>
                      <td>
                        {bus.routeId ? (
                          <div className="flex items-center">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                              style={{ backgroundColor: theme.secondary + '20' }}
                            >
                              <RouteIcon size={16} style={{ color: theme.secondary }} />
                            </div>
                            <div>
                              <p className="font-medium text-sm" style={{ color: theme.text }}>
                                {bus.routeId.name || 'Unknown Route'}
                              </p>
                              <p className="text-xs" style={{ color: theme.textSecondary }}>
                                {bus.routeId.description || 'No description'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm" style={{ color: theme.textSecondary }}>
                            No route assigned
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center">
                          <Users size={16} className="mr-2" style={{ color: theme.textSecondary }} />
                          <span style={{ color: theme.text }}>{bus.capacity}</span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center">
                          <DollarSign size={16} className="mr-1" style={{ color: theme.success }} />
                          <span style={{ color: theme.text }}>{bus.fare} RWF</span>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className={`badge ${bus.isActive ? 'badge-success' : 'badge-error'}`}>
                            {bus.isActive ? 'Active' : 'Inactive'}
                          </div>
                          <div className={`badge ${bus.isOnline ? 'badge-success' : 'badge-secondary'}`}>
                            {bus.isOnline ? 'Online' : 'Offline'}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditBus(bus)}
                            className="p-1 rounded hover:bg-opacity-10"
                            style={{ color: theme.primary }}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteBus(bus)}
                            className="p-1 rounded hover:bg-opacity-10"
                            style={{ color: theme.error }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Bus Modal */}
      {showBusModal && (
        <div className="modal-overlay" onClick={() => setShowBusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <h3 className="text-lg font-semibold" style={{ color: theme.text }}>
                {selectedBus ? 'Edit Bus' : 'Add New Bus'}
              </h3>
            </div>
            <form onSubmit={handleCreateBus}>
              <div className="card-body space-y-4">
                <div className="form-group">
                  <label className="form-label">Plate Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.plateNumber}
                    onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                    placeholder="e.g., RAD 123 A"
                    required
                    style={{
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                      color: theme.text,
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Capacity *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      placeholder="e.g., 30"
                      min="1"
                      required
                      style={{
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                        color: theme.text,
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fare (RWF)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.fare}
                      onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
                      placeholder="e.g., 400"
                      min="0"
                      style={{
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                        color: theme.text,
                      }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Driver *</label>
                  <select
                    className="form-select"
                    value={formData.driverId}
                    onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                    required
                    style={{
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                      color: theme.text,
                    }}
                  >
                    <option value="">Select a driver</option>
                    {drivers.map((driver) => (
                      <option key={driver._id} value={driver._id}>
                        {driver.name} - {driver.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Route *</label>
                  <select
                    className="form-select"
                    value={formData.routeId}
                    onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                    required
                    style={{
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                      color: theme.text,
                    }}
                  >
                    <option value="">Select a route</option>
                    {routes.map((route) => (
                      <option key={route._id} value={route._id}>
                        {route.name} - {route.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="card-footer">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowBusModal(false)}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {selectedBus ? 'Update Bus' : 'Create Bus'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}