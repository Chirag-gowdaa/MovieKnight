// API Configuration
export const API_CONFIG = {
  OMDB_API_KEY: process.env.NEXT_PUBLIC_OMDB_API_KEY || 'YOUR_OMDB_API_KEY',
  OMDB_API_URL: 'https://www.omdbapi.com/',
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'CineSage',
  APP_DESCRIPTION: 'Discover and get personalized movie recommendations',
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_DEBOUNCE_TIME: 500, // ms
};

// UI Configuration
export const UI_CONFIG = {
  THEME: {
    primary: {
      light: '#F59E0B', // amber-500
      dark: '#D97706',  // amber-600
    },
    secondary: {
      light: '#EC4899', // pink-500
      dark: '#DB2777',  // pink-600
    },
    background: {
      light: '#FFFBEB', // amber-50
      dark: '#1F2937',  // gray-800
    },
    text: {
      light: '#111827', // gray-900
      dark: '#F9FAFB',  // gray-50
    },
  },
  BREAKPOINTS: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};
