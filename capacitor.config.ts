import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.e67e4c3e112141a298bae8d6f113f820',
  appName: 'RecoveryCooler',
  webDir: 'dist',
  server: {
    url: 'https://e67e4c3e-1121-41a2-98ba-e8d6f113f820.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#14B8A6',
      showSpinner: false,
    },
  },
};

export default config;
