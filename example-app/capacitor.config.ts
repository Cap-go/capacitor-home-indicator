import type { CapacitorConfig } from '@capacitor/cli';

import pkg from './package.json';

const config: CapacitorConfig = {
  "appId": "app.capgo.home.indicator.example",
  "appName": "Home Indicator Example",
  "bundledWebRuntime": false,
  "webDir": "dist",
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 0
    },
    "CapacitorUpdater": {
      "appId": "app.capgo.home.indicator.example",
      "autoUpdate": true,
      "autoSplashscreen": true,
      "directUpdate": "always",
      "defaultChannel": "production",
      "version": pkg.version
    }
  }
};

export default config;
