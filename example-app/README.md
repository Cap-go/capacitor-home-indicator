# Capacitor Home Indicator demo

This Vite app showcases the `@capgo/home-indicator` Capacitor plugin. The UI lets you
hide, show, and toggle the iOS home indicator while also reading the current
state and native plugin version.

## Run the demo

```bash
npm install
npm start
```

Use the `Hide`, `Show`, or `Toggle` controls while running on an iOS simulator or
physical device. When you run in the browser the native calls will reject, which
matches Capacitor's behaviour when the plugin is not available.

Use `npm run build` to produce a distributable bundle inside `dist/`.
