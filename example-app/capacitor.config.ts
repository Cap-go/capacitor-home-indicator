import type { CapacitorConfig } from '@capacitor/cli';

import pkg from './package.json';

const config: CapacitorConfig = {
  appId: 'app.capgo.home.indicator.example',
  appName: '@capgo/capacitor-home-indicator',
  bundledWebRuntime: false,
  webDir: 'dist',
  plugins: {
    CapacitorUpdater: {
      appId: 'app.capgo.home.indicator.example',
      autoUpdate: true,
      autoSplashscreen: true,
      directUpdate: 'always',
      version: pkg.version,
    },
  },
};

export default config;
