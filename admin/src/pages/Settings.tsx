import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Settings as SettingsIcon, 
  User, 
  Moon, 
  Sun, 
  Bell, 
  Shield, 
  Database,
  Globe,
  Mail,
  Phone,
  Save,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [systemSettings, setSystemSettings] = useState({
    siteName: 'Ridra Bus Tracking',
    supportEmail: 'support@ridra.rw',
    maxBusCapacity: 50,
    defaultFare: 400,
    maintenanceMode: false,
    emailNotifications: true,
    smsNotifications: false,
    realTimeTracking: true,
  });

  const handleProfileSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSystemSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('System settings updated successfully');
    } catch (error) {
      toast.error('Failed to update system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDatabaseBackup = async () => {
    setLoading(true);
    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Database backup completed successfully');
    } catch (error) {
      toast.error('Database backup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
          Settings
        </h1>
        <p style={{ color: theme.textSecondary }}>
          Manage your account and system preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center">
              <User size={20} style={{ color: theme.primary }} className="mr-2" />
              <h3 className="text-lg font-semibold" style={{ color: theme.text }}>
                Profile Settings
              </h3>
            </div>
          </div>
          <div className="card-body space-y-4">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                style={{
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.text,
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                style={{
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.text,
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                style={{
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.text,
                }}
              />
            </div>

            <button
              onClick={handleProfileSave}
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="spinner mr-2"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save size={16} className="mr-2" />
                  Save Profile
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center">
              {isDark ? (
                <Moon size={20} style={{ color: theme.primary }} className="mr-2" />
              ) : (
                <Sun size={20} style={{ color: theme.primary }} className="mr-2" />
              )}
              <h3 className="text-lg font-semibold" style={{ color: theme.text }}>
                Appearance
              </h3>
            </div>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: theme.text }}>
                  Dark Mode
                </p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                  Switch between light and dark themes
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isDark ? 'bg-primary' : 'bg-gray-300'
                }`}
                style={{ backgroundColor: isDark ? theme.primary : '#d1d5db' }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isDark ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: theme.text }}>
                  Compact Mode
                </p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                  Reduce spacing for more content
                </p>
              </div>
              <button
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300"
              >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center">
              <Bell size={20} style={{ color: theme.primary }} className="mr-2" />
              <h3 className="text-lg font-semibold" style={{ color: theme.text }}>
                Notifications
              </h3>
            </div>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: theme.text }}>
                  Email Notifications
                </p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                  Receive updates via email
                </p>
              </div>
              <button
                onClick={() => setSystemSettings({
                  ...systemSettings,
                  emailNotifications: !systemSettings.emailNotifications
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                style={{ 
                  backgroundColor: systemSettings.emailNotifications ? theme.primary : '#d1d5db' 
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    systemSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: theme.text }}>
                  SMS Notifications
                </p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                  Receive updates via SMS
                </p>
              </div>
              <button
                onClick={() => setSystemSettings({
                  ...systemSettings,
                  smsNotifications: !systemSettings.smsNotifications
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                style={{ 
                  backgroundColor: systemSettings.smsNotifications ? theme.primary : '#d1d5db' 
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    systemSettings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: theme.text }}>
                  Real-time Tracking
                </p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                  Enable live bus tracking
                </p>
              </div>
              <button
                onClick={() => setSystemSettings({
                  ...systemSettings,
                  realTimeTracking: !systemSettings.realTimeTracking
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                style={{ 
                  backgroundColor: systemSettings.realTimeTracking ? theme.primary : '#d1d5db' 
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    systemSettings.realTimeTracking ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="card">
          <div className="card-header">
            <div className="flex items-center">
              <SettingsIcon size={20} style={{ color: theme.primary }} className="mr-2" />
              <h3 className="text-lg font-semibold" style={{ color: theme.text }}>
                System Settings
              </h3>
            </div>
          </div>
          <div className="card-body space-y-4">
            <div className="form-group">
              <label className="form-label">Site Name</label>
              <input
                type="text"
                className="form-input"
                value={systemSettings.siteName}
                onChange={(e) => setSystemSettings({ ...systemSettings, siteName: e.target.value })}
                style={{
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.text,
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Support Email</label>
              <input
                type="email"
                className="form-input"
                value={systemSettings.supportEmail}
                onChange={(e) => setSystemSettings({ ...systemSettings, supportEmail: e.target.value })}
                style={{
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                  color: theme.text,
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Max Bus Capacity</label>
                <input
                  type="number"
                  className="form-input"
                  value={systemSettings.maxBusCapacity}
                  onChange={(e) => setSystemSettings({ ...systemSettings, maxBusCapacity: parseInt(e.target.value) })}
                  style={{
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                    color: theme.text,
                  }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Default Fare (RWF)</label>
                <input
                  type="number"
                  className="form-input"
                  value={systemSettings.defaultFare}
                  onChange={(e) => setSystemSettings({ ...systemSettings, defaultFare: parseInt(e.target.value) })}
                  style={{
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                    color: theme.text,
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: theme.text }}>
                  Maintenance Mode
                </p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                  Temporarily disable the platform
                </p>
              </div>
              <button
                onClick={() => setSystemSettings({
                  ...systemSettings,
                  maintenanceMode: !systemSettings.maintenanceMode
                })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                style={{ 
                  backgroundColor: systemSettings.maintenanceMode ? theme.error : '#d1d5db' 
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    systemSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={handleSystemSave}
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="spinner mr-2"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save size={16} className="mr-2" />
                  Save System Settings
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Database Management */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center">
            <Database size={20} style={{ color: theme.primary }} className="mr-2" />
            <h3 className="text-lg font-semibold" style={{ color: theme.text }}>
              Database Management
            </h3>
          </div>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleDatabaseBackup}
              disabled={loading}
              className="btn btn-outline"
            >
              <Database size={16} className="mr-2" />
              Backup Database
            </button>

            <button
              className="btn btn-outline"
              disabled={loading}
            >
              <RefreshCw size={16} className="mr-2" />
              Clear Cache
            </button>

            <button
              className="btn btn-outline"
              disabled={loading}
            >
              <Shield size={16} className="mr-2" />
              Security Scan
            </button>
          </div>

          <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: theme.warning + '20' }}>
            <div className="flex items-start">
              <Shield size={20} style={{ color: theme.warning }} className="mr-2 mt-0.5" />
              <div>
                <p className="font-medium" style={{ color: theme.warning }}>
                  Database Security
                </p>
                <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>
                  Regular backups are automatically created every 24 hours. 
                  Manual backups can be created using the button above.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}