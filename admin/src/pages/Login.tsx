import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Bus, Eye, EyeOff, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, user, loading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);

    if (success) {
      navigate('/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.background }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: theme.background }}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div 
            className="mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-6"
            style={{ backgroundColor: theme.primary }}
          >
            <Bus size={32} color="white" />
          </div>
          <h2 className="text-3xl font-bold" style={{ color: theme.text }}>
            Ridra Admin Dashboard
          </h2>
          <p className="mt-2 text-sm" style={{ color: theme.textSecondary }}>
            Sign in to manage your bus tracking platform
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-center mb-6 p-4 rounded-lg" style={{ backgroundColor: theme.primary + '20' }}>
              <Shield size={20} style={{ color: theme.primary }} className="mr-2" />
              <span className="text-sm font-medium" style={{ color: theme.primary }}>
                Admin Access Required
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="form-input"
                  placeholder="Enter your admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                    color: theme.text,
                  }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="form-input pr-10"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      backgroundColor: theme.background,
                      borderColor: theme.border,
                      color: theme.text,
                    }}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ color: theme.textSecondary }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary w-full"
                style={{
                  backgroundColor: theme.primary,
                  borderColor: theme.primary,
                }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in to Dashboard'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs" style={{ color: theme.textSecondary }}>
                Only authorized administrators can access this dashboard.
                <br />
                Contact your system administrator for access.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs" style={{ color: theme.textSecondary }}>
            Ridra Admin Dashboard v1.0.0
            <br />
            Secure platform management for Rwanda
          </p>
        </div>
      </div>
    </div>
  );
}