import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { 
  UserCheck, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Bus,
  MapPin,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  Activity,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Driver {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalDrivers: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function Drivers() {
  const { theme } = useTheme();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchDrivers();
    fetchBuses();
  }, [currentPage, statusFilter]);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: currentPage,
        limit: 10,
      };
      
      if (statusFilter) params.isActive = statusFilter === 'active';
      
      const response = await apiService.getDrivers(params);
      setDrivers(response.drivers);
      setPagination(response.pagination || null);
    } catch (err: any) {
      console.error('Error fetching drivers:', err);
      setError(err.message || 'Failed to fetch drivers');
      toast.error('Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  const fetchBuses = async () => {
    try {
      const response = await apiService.getBuses();
      setBuses(response.buses);
    } catch (err: any) {
      console.error('Error fetching buses:', err);
    }
  };

  const handleStatusToggle = async (driver: Driver) => {
    try {
      await apiService.updateUserStatus(driver._id, !driver.isActive);
      toast.success(`Driver ${!driver.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchDrivers();
    } catch (err: any) {
      console.error('Error updating driver status:', err);
      toast.error(err.message || 'Failed to update driver status');
    }
  };

  const getDriverBus = (driverId: string) => {
    return buses.find(bus => 
      (bus.driverId?._id === driverId || bus.driverId?.id === driverId || bus.driverId === driverId) && 
      bus.isActive
    );
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.phone.includes(searchTerm)
  );

  if (loading && drivers.length === 0) {
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
            Drivers Management
          </h1>
          <p style={{ color: theme.textSecondary }}>
            Manage bus drivers and their assignments
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={20} />
          Add Driver
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Total Drivers
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {pagination?.totalDrivers || drivers.length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.primary + '20' }}
              >
                <UserCheck size={24} style={{ color: theme.primary }} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                  Active Drivers
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {drivers.filter(d => d.isActive).length}
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
                  Assigned Buses
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                  {buses.filter(bus => bus.driverId && bus.isActive).length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.warning + '20' }}
              >
                <Bus size={24} style={{ color: theme.warning }} />
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
                  {buses.filter(bus => bus.isOnline && bus.isActive).length}
                </p>
              </div>
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: theme.success + '20' }}
              >
                <MapPin size={24} style={{ color: theme.success }} />
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
                placeholder="Search drivers..."
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
            </select>
            
            <button
              onClick={fetchDrivers}
              className="btn btn-outline"
              disabled={loading}
            >
              {loading ? <div className="spinner" /> : <Filter size={16} />}
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Drivers Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold" style={{ color: theme.text }}>
            Drivers ({pagination?.totalDrivers || filteredDrivers.length})
          </h3>
        </div>
        <div className="card-body p-0">
          {error ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <AlertCircle size={48} style={{ color: theme.error }} className="mx-auto mb-4" />
                <p style={{ color: theme.error }} className="text-lg font-semibold mb-2">
                  Error Loading Drivers
                </p>
                <p style={{ color: theme.textSecondary }} className="mb-4">
                  {error}
                </p>
                <button
                  onClick={fetchDrivers}
                  className="btn btn-primary"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <UserCheck size={48} style={{ color: theme.textSecondary }} className="mx-auto mb-4" />
                <p style={{ color: theme.text }} className="text-lg font-semibold mb-2">
                  No Drivers Found
                </p>
                <p style={{ color: theme.textSecondary }}>
                  {searchTerm || statusFilter 
                    ? 'Try adjusting your filters' 
                    : 'No drivers have been added yet'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ color: theme.textSecondary }}>Driver</th>
                    <th style={{ color: theme.textSecondary }}>Contact</th>
                    <th style={{ color: theme.textSecondary }}>Assigned Bus</th>
                    <th style={{ color: theme.textSecondary }}>Status</th>
                    <th style={{ color: theme.textSecondary }}>Joined</th>
                    <th style={{ color: theme.textSecondary }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrivers.map((driver) => {
                    const assignedBus = getDriverBus(driver._id);
                    
                    return (
                      <tr key={driver._id}>
                        <td>
                          <div className="flex items-center">
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                              style={{ backgroundColor: theme.primary + '20' }}
                            >
                              <span className="font-semibold" style={{ color: theme.primary }}>
                                {driver.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium" style={{ color: theme.text }}>
                                {driver.name}
                              </p>
                              <p className="text-sm" style={{ color: theme.textSecondary }}>
                                Driver ID: {driver._id.slice(-8)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail size={14} className="mr-2" style={{ color: theme.textSecondary }} />
                              <span style={{ color: theme.text }}>{driver.email}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Phone size={14} className="mr-2" style={{ color: theme.textSecondary }} />
                              <span style={{ color: theme.text }}>{driver.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          {assignedBus ? (
                            <div className="flex items-center">
                              <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                                style={{ backgroundColor: assignedBus.isOnline ? theme.success + '20' : theme.textSecondary + '20' }}
                              >
                                <Bus size={16} style={{ color: assignedBus.isOnline ? theme.success : theme.textSecondary }} />
                              </div>
                              <div>
                                <p className="font-medium text-sm" style={{ color: theme.text }}>
                                  {assignedBus.plateNumber}
                                </p>
                                <p className="text-xs" style={{ color: theme.textSecondary }}>
                                  {assignedBus.routeId?.name || 'No Route'}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm" style={{ color: theme.textSecondary }}>
                              No bus assigned
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="space-y-1">
                            <button
                              onClick={() => handleStatusToggle(driver)}
                              className={`badge ${driver.isActive ? 'badge-success' : 'badge-error'}`}
                            >
                              {driver.isActive ? 'Active' : 'Inactive'}
                            </button>
                            {assignedBus && (
                              <div className={`badge ${assignedBus.isOnline ? 'badge-success' : 'badge-secondary'}`}>
                                {assignedBus.isOnline ? 'Online' : 'Offline'}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center text-sm">
                            <Calendar size={14} className="mr-2" style={{ color: theme.textSecondary }} />
                            <span style={{ color: theme.text }}>
                              {new Date(driver.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center space-x-2">
                            <button
                              className="p-1 rounded hover:bg-opacity-10"
                              style={{ color: theme.primary }}
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="p-1 rounded hover:bg-opacity-10"
                              style={{ color: theme.error }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="card-footer">
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalDrivers)} of {pagination.totalDrivers} drivers
              </p>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="btn btn-outline btn-sm"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm" style={{ color: theme.text }}>
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="btn btn-outline btn-sm"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}