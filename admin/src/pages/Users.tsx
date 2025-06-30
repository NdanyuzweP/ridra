import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { 
  Users as UsersIcon, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
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
  totalUsers: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function Users() {
  const { theme } = useTheme();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: currentPage,
        limit: 10,
      };
      
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.isActive = statusFilter === 'active';
      
      const response = await apiService.getUsers(params);
      setUsers(response.users);
      setPagination(response.pagination || null);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message || 'Failed to fetch users');
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (user: User) => {
    try {
      await apiService.updateUserStatus(user._id, !user.isActive);
      toast.success(`User ${!user.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (err: any) {
      console.error('Error updating user status:', err);
      toast.error(err.message || 'Failed to update user status');
    }
  };

  const handleRoleChange = async (user: User, newRole: string) => {
    try {
      await apiService.updateUserRole(user._id, newRole);
      toast.success('User role updated successfully');
      fetchUsers();
    } catch (err: any) {
      console.error('Error updating user role:', err);
      toast.error(err.message || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      return;
    }

    try {
      await apiService.deleteUser(user._id);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err: any) {
      console.error('Error deleting user:', err);
      toast.error(err.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return theme.error;
      case 'driver':
        return theme.warning;
      default:
        return theme.primary;
    }
  };

  if (loading && users.length === 0) {
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
            Users Management
          </h1>
          <p style={{ color: theme.textSecondary }}>
            Manage all users, drivers, and administrators
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={20} />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search 
                size={16} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: theme.textSecondary }}
              />
              <input
                type="text"
                placeholder="Search users..."
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
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                backgroundColor: theme.background,
                borderColor: theme.border,
                color: theme.text,
              }}
            >
              <option value="">All Roles</option>
              <option value="user">Users</option>
              <option value="driver">Drivers</option>
              <option value="admin">Admins</option>
            </select>
            
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
              onClick={fetchUsers}
              className="btn btn-outline"
              disabled={loading}
            >
              {loading ? <div className="spinner" /> : <Filter size={16} />}
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold" style={{ color: theme.text }}>
            Users ({pagination?.totalUsers || filteredUsers.length})
          </h3>
        </div>
        <div className="card-body p-0">
          {error ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <AlertCircle size={48} style={{ color: theme.error }} className="mx-auto mb-4" />
                <p style={{ color: theme.error }} className="text-lg font-semibold mb-2">
                  Error Loading Users
                </p>
                <p style={{ color: theme.textSecondary }} className="mb-4">
                  {error}
                </p>
                <button
                  onClick={fetchUsers}
                  className="btn btn-primary"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <UsersIcon size={48} style={{ color: theme.textSecondary }} className="mx-auto mb-4" />
                <p style={{ color: theme.text }} className="text-lg font-semibold mb-2">
                  No Users Found
                </p>
                <p style={{ color: theme.textSecondary }}>
                  {searchTerm || roleFilter || statusFilter 
                    ? 'Try adjusting your filters' 
                    : 'No users have been added yet'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ color: theme.textSecondary }}>User</th>
                    <th style={{ color: theme.textSecondary }}>Contact</th>
                    <th style={{ color: theme.textSecondary }}>Role</th>
                    <th style={{ color: theme.textSecondary }}>Status</th>
                    <th style={{ color: theme.textSecondary }}>Joined</th>
                    <th style={{ color: theme.textSecondary }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="flex items-center">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                            style={{ backgroundColor: theme.primary + '20' }}
                          >
                            <span className="font-semibold" style={{ color: theme.primary }}>
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: theme.text }}>
                              {user.name}
                            </p>
                            <p className="text-sm" style={{ color: theme.textSecondary }}>
                              ID: {user._id.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Mail size={14} className="mr-2" style={{ color: theme.textSecondary }} />
                            <span style={{ color: theme.text }}>{user.email}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Phone size={14} className="mr-2" style={{ color: theme.textSecondary }} />
                            <span style={{ color: theme.text }}>{user.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user, e.target.value)}
                          className="text-xs px-2 py-1 rounded border-0"
                          style={{
                            backgroundColor: getRoleBadgeColor(user.role) + '20',
                            color: getRoleBadgeColor(user.role),
                          }}
                        >
                          <option value="user">User</option>
                          <option value="driver">Driver</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <button
                          onClick={() => handleStatusToggle(user)}
                          className={`badge ${user.isActive ? 'badge-success' : 'badge-error'}`}
                        >
                          {user.isActive ? (
                            <>
                              <UserCheck size={12} className="mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <UserX size={12} className="mr-1" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td>
                        <div className="flex items-center text-sm">
                          <Calendar size={14} className="mr-2" style={{ color: theme.textSecondary }} />
                          <span style={{ color: theme.text }}>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="p-1 rounded hover:bg-opacity-10"
                            style={{ color: theme.primary }}
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
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
        
        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="card-footer">
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalUsers)} of {pagination.totalUsers} users
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