import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { 
  Route as RouteIcon, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin,
  Clock,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Route {
  _id: string;
  name: string;
  description: string;
  pickupPoints: any[];
  estimatedDuration: number;
  fare: number;
  isActive: boolean;
  createdAt: string;
}

export default function Routes() {
  const { theme } = useTheme();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    estimatedDuration: '',
    fare: '',
  });

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getRoutes();
      setRoutes(response.routes);
    } catch (err: any) {
      console.error('Error fetching routes:', err);
      setError(err.message || 'Failed to fetch routes');
      toast.error('Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.estimatedDuration) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const data = {
        name: formData.name,
        description: formData.description,
        estimatedDuration: parseInt(formData.estimatedDuration),
        ...(formData.fare && { fare: parseInt(formData.fare) }),
      };

      if (selectedRoute) {
        await apiService.updateRoute(selectedRoute._id, data);
        toast.success('Route updated successfully');
      } else {
        await apiService.createRoute(data);
        toast.success('Route created successfully');
      }
      
      setShowRouteModal(false);
      setSelectedRoute(null);
      setFormData({
        name: '',
        description: '',
        estimatedDuration: '',
        fare: '',
      });
      fetchRoutes();
    } catch (err: any) {
      console.error('Error saving route:', err);
      toast.error(err.message || 'Failed to save route');
    }
  };

  const handleEditRoute = (route: Route) => {
    setSelectedRoute(route);
    setFormData({
      name: route.name,
      description: route.description,
      estimatedDuration: route.estimatedDuration.toString(),
      fare: route.fare.toString(),
    });
    setShowRouteModal(true);
  };

  const handleDeleteRoute = async (route: Route) => {
    if (!window.confirm(`Are you sure you want to delete route "${route.name}"?`)) {
      return;
    }

    try {
      await apiService.deleteRoute(route._id);
      toast.success('Route deleted successfully');
      fetchRoutes();
    } catch (err: any) {
      console.error('Error deleting route:', err);
      toast.error(err.message || 'Failed to delete route');
    }
  };

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && routes.length === 0) {
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
            Routes Management
          </h1>
          <p style={{ color: theme.textSecondary }}>
            Manage bus routes and their configurations
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setSelectedRoute(null);
            setFormData({
              name: '',
              description: '',
              estimatedDuration: '',
              fare: '',
            });
            setShowRouteModal(true);
          }}
        >
          <Plus size={20} />
          Add Route
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Total Routes
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {routes.length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.primary + '20' }}
              >
                <RouteIcon size={24} style={{ color: theme.primary }} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Active Routes
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {routes.filter(r => r.isActive).length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.success + '20' }}
              >
                <RouteIcon size={24} style={{ color: theme.success }} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Pickup Points
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {routes.reduce((sum, route) => sum + route.pickupPoints.length, 0)}
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
                  Avg Duration
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {routes.length > 0 
                    ? Math.round(routes.reduce((sum, route) => sum + route.estimatedDuration, 0) / routes.length)
                    : 0
                  } min
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.secondary + '20' }}
              >
                <Clock size={24} style={{ color: theme.secondary }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search 
                size={16} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: theme.textSecondary }}
              />
              <input
                type="text"
                placeholder="Search routes..."
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
            
            <button
              onClick={fetchRoutes}
              className="btn btn-outline"
              disabled={loading}
            >
              {loading ? <div className="spinner" /> : <Filter size={16} />}
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {error ? (
          <div className="col-span-full flex items-center justify-center p-8">
            <div className="text-center">
              <AlertCircle size={48} style={{ color: theme.error }} className="mx-auto mb-4" />
              <p style={{ color: theme.error }} className="text-lg font-semibold mb-2">
                Error Loading Routes
              </p>
              <p style={{ color: theme.textSecondary }} className="mb-4">
                {error}
              </p>
              <button
                onClick={fetchRoutes}
                className="btn btn-primary"
              >
                Retry
              </button>
            </div>
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="col-span-full flex items-center justify-center p-8">
            <div className="text-center">
              <RouteIcon size={48} style={{ color: theme.textSecondary }} className="mx-auto mb-4" />
              <p style={{ color: theme.text }} className="text-lg font-semibold mb-2">
                No Routes Found
              </p>
              <p style={{ color: theme.textSecondary }}>
                {searchTerm 
                  ? 'Try adjusting your search' 
                  : 'No routes have been added yet'
                }
              </p>
            </div>
          </div>
        ) : (
          filteredRoutes.map((route) => (
            <div key={route._id} className="card">
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                      style={{ backgroundColor: theme.primary + '20' }}
                    >
                      <RouteIcon size={20} style={{ color: theme.primary }} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: theme.text }}>
                        {route.name}
                      </h3>
                      <p className="text-sm" style={{ color: theme.textSecondary }}>
                        {route.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditRoute(route)}
                      className="p-1 rounded hover:bg-opacity-10"
                      style={{ color: theme.primary }}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteRoute(route)}
                      className="p-1 rounded hover:bg-opacity-10"
                      style={{ color: theme.error }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-2" style={{ color: theme.textSecondary }} />
                      <span className="text-sm" style={{ color: theme.textSecondary }}>
                        Pickup Points
                      </span>
                    </div>
                    <span className="font-medium" style={{ color: theme.text }}>
                      {route.pickupPoints.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock size={16} className="mr-2" style={{ color: theme.textSecondary }} />
                      <span className="text-sm" style={{ color: theme.textSecondary }}>
                        Duration
                      </span>
                    </div>
                    <span className="font-medium" style={{ color: theme.text }}>
                      {route.estimatedDuration} min
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <DollarSign size={16} className="mr-2" style={{ color: theme.textSecondary }} />
                      <span className="text-sm" style={{ color: theme.textSecondary }}>
                        Fare
                      </span>
                    </div>
                    <span className="font-medium" style={{ color: theme.success }}>
                      {route.fare} RWF
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: theme.textSecondary }}>
                      Status
                    </span>
                    <div className={`badge ${route.isActive ? 'badge-success' : 'badge-error'}`}>
                      {route.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Route Modal */}
      {showRouteModal && (
        <div className="modal-overlay" onClick={() => setShowRouteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="card-header">
              <h3 className="text-lg font-semibold" style={{ color: theme.text }}>
                {selectedRoute ? 'Edit Route' : 'Add New Route'}
              </h3>
            </div>
            <form onSubmit={handleCreateRoute}>
              <div className="card-body space-y-4">
                <div className="form-group">
                  <label className="form-label">Route Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Route 302"
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
                    placeholder="e.g., Kimironko - Downtown/CBD"
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
                    <label className="form-label">Duration (minutes) *</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.estimatedDuration}
                      onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                      placeholder="e.g., 45"
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
              </div>
              <div className="card-footer">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowRouteModal(false)}
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {selectedRoute ? 'Update Route' : 'Create Route'}
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