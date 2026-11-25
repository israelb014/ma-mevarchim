import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ibfix.mamevarchim',
  appName: 'מה מברכים',
  webDir: 'dist',
  android: { allowMixedContent: false },
  plugins: {
    CapacitorUpdater: {
      autoUpdate: false,
      appReadyTimeout: 10000,
      resetWhenUpdate: true,
      statsUrl: '',
      updateUrl: '',
      channelUrl: '',
    },
    LocalNotifications: {
      iconColor: '#5B6B2E',
    },
  },
};

export default config;
