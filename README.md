# @capgo/capacitor-home-indicator

Hide or show the home indicator bar from your Capacitor app for immersive screens like video, games and kiosks.

<a href="https://capgo.app/?ref=plugin_home_indicator"><img src="https://capgo.app/readme-banner.svg?repo=Cap-go/capacitor-home-indicator" alt="Capgo - Instant updates for Capacitor" /></a>

<div align="center">
  <p><b>Capgo</b>: push fixes to your Capacitor users in minutes, build signed iOS and Android apps without a Mac, and roll back in one click.</p>
  <h2><a href="https://capgo.app/register/?ref=plugin_home_indicator">➡️ Get started for free</a></h2>
  <p>14-day unlimited free trial. No credit card required</p>
  <p><a href="https://capgo.app/consulting/?ref=plugin_home_indicator">Missing a feature? We'll build the plugin for you 💪</a></p>
</div>

<p align="center">
  <img src="https://raw.githubusercontent.com/Cap-go/capacitor-home-indicator/main/assets/github-social-preview.png" alt="@capgo/capacitor-home-indicator for Capacitor apps" width="300" />
</p>

## Key features

- **Hide**: `hide()` hides the home indicator.
- **Show**: `show()` brings it back.
- **State**: `isHidden()` reports the current state.
- **iOS**: uses the view controller's auto-hidden home indicator preference.
- **Platforms**: iOS and Android. Android needs a small `MainActivity` change described below.

hide and show home button indicator in Capacitor app

# Android

To be able to hide the home indicator on Android, you need to
update your `MainActivity.java` file to add the following code:

```java
// ...

import android.os.Build;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    void fixSafeArea() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            getWindow().setDecorFitsSystemWindows(false);
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        fixSafeArea();
    }
    // on resume
    @Override
    public void onResume() {
        super.onResume();
        fixSafeArea();
    }

    // on pause
    @Override
    public void onPause() {
        super.onPause();
        fixSafeArea();
    }
}
```

And the update styles.xml to add the following code:

```xml
        <item name="android:statusBarColor">
            @android:color/transparent
        </item>
```

## Documentation

The most complete doc is available here: https://capgo.app/docs/plugins/home-indicator/

## Compatibility

| Plugin version | Capacitor compatibility | Maintained |
| -------------- | ----------------------- | ---------- |
| v8.\*.\*       | v8.\*.\*                | ✅          |
| v7.\*.\*       | v7.\*.\*                | On demand   |
| v6.\*.\*       | v6.\*.\*                | ❌          |
| v5.\*.\*       | v5.\*.\*                | ❌          |

> **Note:** The major version of this plugin follows the major version of Capacitor. Use the version that matches your Capacitor installation (e.g., plugin v8 for Capacitor 8). Only the latest major version is actively maintained.

## Install

You can use our AI-Assisted Setup to install the plugin. Add the Capgo skills to your AI tool using the following command:

```bash
npx skills add https://github.com/cap-go/capacitor-skills --skill capacitor-plugins
```

Then use the following prompt:

```text
Use the `capacitor-plugins` skill from `cap-go/capacitor-skills` to install the `@capgo/capacitor-home-indicator` plugin in my project.
```

If you prefer Manual Setup, install the plugin by running the following commands and follow the platform-specific instructions below:

```bash
bun add @capgo/capacitor-home-indicator
bunx cap sync
```

## API

<docgen-index>

* [`hide()`](#hide)
* [`show()`](#show)
* [`isHidden()`](#ishidden)
* [`getPluginVersion()`](#getpluginversion)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

Capacitor Home Indicator Plugin for controlling the iOS home indicator visibility.
The home indicator is the horizontal bar at the bottom of iOS devices without a physical home button.

### hide()

```typescript
hide() => Promise<void>
```

Hide the home indicator at the bottom of the screen.

This visually hides the iOS home indicator bar, providing a more immersive
full-screen experience. Users can still swipe up to access home, but the
indicator will not be visible until they start the gesture.

iOS only. Has no effect on Android or web.

**Since:** 0.0.1

--------------------


### show()

```typescript
show() => Promise<void>
```

Show the home indicator at the bottom of the screen.

This restores the default iOS home indicator visibility, making it
always visible to the user. This is the default behavior.

iOS only. Has no effect on Android or web.

**Since:** 0.0.1

--------------------


### isHidden()

```typescript
isHidden() => Promise<{ hidden: boolean; }>
```

Check whether the home indicator is currently hidden.

Returns the current visibility state of the iOS home indicator.

**Returns:** <code>Promise&lt;{ hidden: boolean; }&gt;</code>

**Since:** 0.0.1

--------------------


### getPluginVersion()

```typescript
getPluginVersion() => Promise<{ version: string; }>
```

Get the native Capacitor plugin version.

**Returns:** <code>Promise&lt;{ version: string; }&gt;</code>

**Since:** 0.0.1

--------------------

</docgen-api>

### CSS Variables

You can use `--safe-area-inset-bottom` to make sure your content is not hidden by the home indicator
This variable is injected by the plugin for android.
It's useful if you set real fullscreen mode on android.
with :
```java
getWindow().setDecorFitsSystemWindows(false);
```


# Credits

This plugin was created originally for [Kick.com](https://kick.com) by [Capgo](https://capgo.app)
