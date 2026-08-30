// 🌾 Smart Farmer Assistant & Cold-Chain Monitoring — API Configuration
// Loaded from Next.js environment variables (.env.local)

export const API_CONFIG = {
  // ThingSpeak IoT (Cold Chain Monitoring)
  thingspeak: {
    channelId: process.env.NEXT_PUBLIC_THINGSPEAK_CHANNEL_ID || '3474082',
    readApiKey: process.env.NEXT_PUBLIC_THINGSPEAK_READ_API_KEY || 'DQY5SZKH0RMIEKWA',
    baseUrl: 'https://api.thingspeak.com',
    get feedsUrl() {
      return `${this.baseUrl}/channels/${this.channelId}/feeds.json`;
    },
    get lastEntryUrl() {
      return `${this.baseUrl}/channels/${this.channelId}/feeds/last.json`;
    },
  },

  // Google Gemini (Crop Doctor & Container Vision)
  gemini: {
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '',
    model: 'gemini-2.5-flash',
    get baseUrl() {
      return `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    },
  },

  // Google Maps (Route Planner)
  googleMaps: {
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || '',
  },

  // OpenWeatherMap (Weather & Perishable Travel Advisor)
  openWeather: {
    apiKey: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || process.env.VITE_OPENWEATHER_API_KEY || '',
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    get currentUrl() {
      return `${this.baseUrl}/weather`;
    },
    get forecastUrl() {
      return `${this.baseUrl}/forecast`;
    },
  },

  // data.gov.in (Live Mandi Market Prices)
  dataGov: {
    apiKey: process.env.NEXT_PUBLIC_DATAGOV_API_KEY || process.env.VITE_DATAGOV_API_KEY || '',
    baseUrl: 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070',
  },
};

// Check if API keys are configured
export const isConfigured = (module: 'coldchain' | 'cropdoctor' | 'route' | 'market') => {
  switch (module) {
    case 'coldchain':
      return !!(API_CONFIG.thingspeak.channelId && API_CONFIG.thingspeak.readApiKey);
    case 'cropdoctor':
      return !!API_CONFIG.gemini.apiKey;
    case 'route':
      return !!(API_CONFIG.googleMaps.apiKey && API_CONFIG.openWeather.apiKey);
    case 'market':
      return !!API_CONFIG.dataGov.apiKey;
    default:
      return false;
  }
};

// Indian states for market module
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

// Common commodities for market module
export const COMMODITIES = [
  'Tomato', 'Onion', 'Potato', 'Brinjal', 'Cabbage',
  'Cauliflower', 'Green Chilli', 'Capsicum', 'Carrot', 'Beetroot',
  'Beans', 'Ladies Finger', 'Bitter Gourd', 'Bottle Gourd', 'Ridge Gourd',
  'Pumpkin', 'Radish', 'Spinach', 'Coriander', 'Curry Leaf',
  'Drumstick', 'Banana', 'Mango', 'Grapes', 'Apple',
  'Orange', 'Lemon', 'Coconut', 'Papaya', 'Watermelon',
];
