import { Platform } from 'react-native';

// API Configuration
export const API_CONFIG = {
  // Backend API URL - adjust based on your environment
  BASE_URL: Platform.select({
    ios: 'http://localhost:3001/api',
    android: 'http://10.0.2.2:3001/api', // Android emulator localhost
    web: 'http://localhost:3001/api',
    default: 'http://localhost:3001/api',
  }),
  
  // Request timeout in milliseconds
  TIMEOUT: 10000,
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};

// Environment-specific configurations
export const getApiUrl = () => {
  // You can add environment-specific logic here
  // For example, check if running in development, staging, or production
  
  if (__DEV__) {
    return API_CONFIG.BASE_URL;
  }
  
  // Production API URL would go here
  return 'https://your-production-api.com/api';
};