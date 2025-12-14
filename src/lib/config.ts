/**
 * Application Configuration
 * Centralized configuration management with environment variables
 */

const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  // apiUrl: import.meta.env.VITE_API_URL || 'https://dennise-canonical-undivergently.ngrok-free.dev/api/v1',

  apiTimeout: 30000, // 30 seconds
  
  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || 'MenuLogs',
  appEnv: import.meta.env.VITE_APP_ENV || 'development',
  
  // Feature Flags
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableDebugMode: import.meta.env.VITE_APP_ENV === 'development',
  },
  
  // Storage Keys
  storageKeys: {
    accessToken: 'menulogs_access_token',
    refreshToken: 'menulogs_refresh_token',
    user: 'menulogs_user',
    business: 'menulogs_business',
    currentLocation: 'menulogs_current_location',
  },
  
  // Pagination
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100,
  },
} as const;

export default config;

