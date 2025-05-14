// @ts-ignore
import { ConfigContext, ExpoConfig } from 'expo/config';
// @ts-ignore
import { version as projectVersion } from './package.json';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  android: {
    adaptiveIcon: {
      backgroundColor: '#ffffff',
      foregroundImage: './assets/adaptive-icon.png',
    },
    package: 'my-app',
    permissions: [
      'android.permission.CAMERA',
      'android.permission.ACCESS_COARSE_LOCATION',
      'android.permission.ACCESS_FINE_LOCATION',
    ],
  },
  icon: './assets/icon.png',
  ios: {
    bundleIdentifier: 'my-app',
    supportsTablet: true,
    entitlements: {
      'aps-environment': 'production',
    },
    infoPlist: {
      CFBundleAllowMixedLocalizations: true,
      ITSAppUsesNonExemptEncryption: false,
      UIBackgroundModes: [
        'remote-notification',
      ],
    },
  },
  name: 'my-app',
  scheme: 'my-app',
  orientation: 'portrait',
  locales: {
    es: './translations/locales_es.json',
    en: './translations/locales_en.json',
  },
  notification: {
    icon: './assets/notification-icon.png',
    color: '#000000',
  },
  plugins: [
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'static',
        },
      },
    ],
    [
      'expo-localization',
    ],
    [
      'expo-camera',
      {
        recordAudioAndroid: false,
      },
    ],
    [
      'expo-image-picker',
      {
        microphonePermission: false,
      },
    ],
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
        imageWidth: 250,
      },
    ],
  ],
  slug: 'my-app',
  userInterfaceStyle: 'light',
  version: projectVersion,
  runtimeVersion: projectVersion,
  extra: {
    eas: {
      projectId: '',
    },
  },
  owner: 'smartalfred',
});
