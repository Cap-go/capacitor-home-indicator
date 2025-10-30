# @capgo/home-indicator
 <a href="https://capgo.app/"><img src='https://raw.githubusercontent.com/Cap-go/capgo/main/assets/capgo_banner.png' alt='Capgo - Instant updates for capacitor'/></a>

<div align="center">
  <h2><a href="https://capgo.app/?ref=plugin_home_indicator"> ➡️ Get Instant updates for your App with Capgo</a></h2>
  <h2><a href="https://capgo.app/consulting/?ref=plugin_home_indicator"> Missing a feature? We’ll build the plugin for you 💪</a></h2>
</div>

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

## Install

```bash
npm install @capgo/home-indicator
npx cap sync
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
