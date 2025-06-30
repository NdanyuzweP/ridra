import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { 
  MapPin, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Navigation as RouteIcon,
  AlertCircle,
  Navigation
} from 'lucide-react';
import toast from 'react-hot-toast';

interface PickupPoint {
  _id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  routeId: string;
  order: number;
  isActive: boolean;
  createdAt: string;
}

interface Route {
  _id: string;
  name: string;
  description: string;
}

export default function PickupPoints() {
  const { theme } = useTheme();
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [routeFilter, setRouteFilter] = useState<string>('');
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState<PickupPoint | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    routeId: '',
    order: '',
  });

  useEffect(() => {
    fetchPickupPoints();
    fetchRoutes();
  }, [routeFilter]);

  const fetchPickupPoints = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getPickupPoints(routeFilter || undefined);
      setPickupPoints(response.pickupPoints);
    } catch (err: any) {
      console.error('Error fetching pickup points:', err);
      setError(err.message || 'Failed to fetch pickup points');
      toast.error('Failed to fetch pickup points');
    } finally {
      setLoading(false);
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

  const handleCreatePickupPoint = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.latitude || !formData.longitude || !formData.routeId || !formData.order) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const data = {
        name: formData.name,
        description: formData.description,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        routeId: formData.routeId,
        order: parseInt(formData.order),
      };

      if (selectedPickup) {
        await apiService.updatePickupPoint(selectedPickup._id, data);
        toast.success('Pickup point updated successfully');
      } else {
        await apiService.createPickupPoint(data);
        toast.success('Pickup point created successfully');
      }
      
      setShowPickupModal(false);
      setSelectedPickup(null);
      setFormData({
        name: '',
        description: '',
        latitude: '',
        longitude: '',
        routeId: '',
        order: '',
      });
      fetchPickupPoints();
    } catch (err: any) {
      console.error('Error saving pickup point:', err);
      toast.error(err.message || 'Failed to save pickup point');
    }
  };

  const handleEditPickupPoint = (pickup: PickupPoint) => {
    setSelectedPickup(pickup);
    setFormData({
      name: pickup.name,
      description: pickup.description,
      latitude: pickup.latitude.toString(),
      longitude: pickup.longitude.toString(),
      routeId: pickup.routeId,
      order: pickup.order.toString(),
    });
    setShowPickupModal(true);
  };

  const handleDeletePickupPoint = async (pickup: PickupPoint) => {
    if (!window.confirm(`Are you sure you want to delete pickup point "${pickup.name}"?`)) {
      return;
    }

    try {
      await apiService.deletePickupPoint(pickup._id);
      toast.success('Pickup point deleted successfully');
      fetchPickupPoints();
    } catch (err: any) {
      console.error('Error deleting pickup point:', err);
      toast.error(err.message || 'Failed to delete pickup point');
    }
  };

  const getRouteName = (routeId: string) => {
    const route = routes.find(r => r._id === routeId);
    return route ? route.name : 'Unknown Route';
  };

  const filteredPickupPoints = pickupPoints.filter(pickup =>
    pickup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pickup.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && pickupPoints.length === 0) {
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
            Pickup Points Management
          </h1>
          <p style={{ color: theme.textSecondary }}>
            Manage pickup points along bus routes
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setSelectedPickup(null);
            setFormData({
              name: '',
              description: '',
              latitude: '',
              longitude: '',
              routeId: '',
              order: '',
            });
            setShowPickupModal(true);
          }}
        >
          <Plus size={20} />
          Add Pickup Point
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Total Points
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {pickupPoints.length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.primary + '20' }}
              >
                <MapPin size={24} style={{ color: theme.primary }} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Active Points
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {pickupPoints.filter(p => p.isActive).length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.success + '20' }}
              >
                <Navigation size={24} style={{ color: theme.success }} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Routes Covered
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {new Set(pickupPoints.map(p => p.routeId)).size}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.warning + '20' }}
              >
                <RouteIcon size={24} style={{ color: theme.warning }} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Avg per Route
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {routes.length > 0 
                    ? Math.round(pickupPoints.length / routes.length)
                    : 0
                  }
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.secondary + '20' }}
              >
                <MapPin size={24} style={{ color: theme.secondary }} />
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
                placeholder="Search pickup points..."
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
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              style={{
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.text,
              }}
            >
              <option value="">All Routes</option>
              {routes.map((route) => (
                <option key={route._id} value={route._id}>
                  {route.name}
                </option>
              ))}
            </select>
            
            <button
              onClick={fetchPickupPoints}
              className="btn btn-outline"
              disabled={loading}
            >
              {loading ? <div className="spinner" /> : <Filter size={16} />}
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Pickup Points Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold" style={{ color: theme.text }}>
            Pickup Points ({filteredPickupPoints.length})
          </h3>
        </div>
        <div className="card-body p-0">
          {error ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <AlertCircle size={48} style={{ color: theme.error }} className="mx-auto mb-4" />
                <p style={{ color: theme.error }} className="text-lg font-semibold mb-2">
                  Error Loading Pickup Points
                </p>
                <p style={{ color: theme.textSecondary }} className="mb-4">
                  {error}
                </p>
                <button
                  onClick={fetchPickupPoints}
                  className="btn btn-primary"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : filteredPickupPoints.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <MapPin size={48} style={{ color: theme.textSecondary }} className="mx-auto mb-4" />
                <p style={{ color: theme.text }} className="text-lg font-semibold mb-2">
                  No Pickup Points Found
                </p>
                <p style={{ color: theme.textSecondary }}>
                  {searchTerm || routeFilter 
                    ? 'Try adjusting your filters' 
                    : 'No pickup points have been added yet'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ color: theme.textSecondary }}>Pickup Point</th>
                    <th style={{ color: theme.textSecondary }}>Route</th>
                    <th style={{ color: theme.textSecondary }}>Location</th>
                    <th style={{ color: theme.textSecondary }}>Order</th>
                    <th style={{ color: theme.textSecondary }}>Status</th>
                    <th style={{ color: theme.textSecondary }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPickupPoints.map((pickup) => (
                    <tr key={pickup._id}>
                      <td>
                        <div className="flex items-center">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                            style={{ backgroundColor: theme.primary + '20' }}
                          >
                            <MapPin size={20} style={{ color: theme.primary }} />
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: theme.text }}>
                              {pickup.name}
                            </p>
                            <p className="text-sm" style={{ color: theme.textSecondary }}>
                              {pickup.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                            style={{ backgroundColor: theme.secondary + '20' }}
                          >
                            <RouteIcon size={16} style={{ color: theme.secondary }} />
                          </div>
                          <span style={{ color: theme.text }}>
                            {getRouteName(pickup.routeId)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          <p style={{ color: theme.text }}>
                            {pickup.latitude.toFixed(6)}, {pickup.longitude.toFixed(6)}
                          </p>
                          <p style={{ color: theme.textSecondary }}>
                            Lat/Lng coordinates
                          </p>
                        </div>
                      </td>
                      <td>
                        <div 
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold"
                          style={{ 
                            backgroundColor: theme.primary + '20',
                            color: theme.primary 
                          }}
                        >
                          {pickup.order}
                        </div>
                      </td>
                      <td>
                        <div className={`badge ${pickup.isActive ? 'badge-success' : 'badge-error'}`}>
                          {pickup.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditPickupPoint(pickup)}
                            className="p-1 rounded hover:bg-opacity-10"
                            style={{ color: theme.primary }}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeletePickupPoint(pickup)}
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

      {/* Pickup Point Modal */}
      {showPickupModal && (
        <div className="modal-overlay" onClick={() => setShowPickupModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <h3 className="text-lg font-semibold" style={{ color: theme.text }}>
                {selectedPickup ? 'Edit Pickup Point' : 'Add New Pickup Point'}
              </h3>
            </div>
            <form onSubmit={handleCreatePickupPoint}>
              <div className="card-body space-y-4">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Kimironko Market"
                    required
                    style={{
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                      color: theme.text,
                    }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Additional details about this pickup point"
                    rows={3}
                    style={{
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                      color: theme.text,
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Latitude *</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      placeholder="e.g., -1.9441"
                      required
                      style={{
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                        color: theme.text,
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Longitude *</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      placeholder="e.g., 30.1056"
                      required
                      style={{
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                        color: theme.text,
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                          {route.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Order *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                      placeholder="e.g., 1"
                      min="1"
                      required
                      style={{
                        backgroundColor: theme.background,
                        borderColor: theme.border,
                        color: theme.text,
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowPickupModal(false)}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {selectedPickup ? 'Update Pickup Point' : 'Create Pickup Point'}
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