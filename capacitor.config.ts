import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lavender.lifeplanner',
  appName: 'Lavender Life Planner',
  webDir: 'dist',
  server: {
    // No URL — serves from local files
  },
  ios: {
    preferredContentMode: 'mobile',
    scheme: 'lavenderlifeplanner',
    backgroundColor: '#F8F7FC'
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 0,
      launchFadeOutDuration: 0,
      showSpinner: false
    },
    Keyboard: {
      resize: 'body',
      scrollPadding: true
    }
  }
};

export default config;
