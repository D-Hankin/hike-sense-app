import { ExpoConfig, ConfigContext } from '@expo/config';
import * as dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'HikeSense',
  slug: 'HikeSense',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/hikeSenseLogo.png',
  scheme: 'myapp',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/images/hikeSenseLogo.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/hikeSenseLogo.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.dhankin.HikeSense',
    permissions: [
      'android.permission.BLUETOOTH',
      'android.permission.BLUETOOTH_ADMIN',
      'android.permission.BLUETOOTH_CONNECT',
      'android.permission.NOTIFICATIONS',
    ],
    config: {
      googleMaps: {
        apiKey: process.env.MAPS_API_KEY, // Use the API key from .env
      },
    },
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/hikeSenseLogo.png',
  },
  plugins: ['expo-router', 'expo-font', 'react-native-ble-plx'],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    eas: {
      projectId: 'dedaca5c-d2af-4a9a-9a1f-076ef671c7d0',
    },
  },
});
