# @capgo/home-indicator
 <a href="https://capgo.app/"><img src='https://raw.githubusercontent.com/Cap-go/capgo/main/assets/capgo_banner.png' alt='Capgo - Instant updates for capacitor'/></a>

<div align="center">
  <h2><a href="https://capgo.app/?ref=plugin"> ➡️ Get Instant updates for your App with Capgo</a></h2>
  <h2><a href="https://capgo.app/consulting/?ref=plugin"> Missing a feature? We’ll build the plugin for you 💪</a></h2>
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

### hide()

```typescript
hide() => Promise<void>
```

Hide the home indicator.

**Since:** 0.0.1

--------------------


### show()

```typescript
show() => Promise<void>
```

Show the home indicator.

**Since:** 0.0.1

--------------------


### isHidden()

```typescript
isHidden() => Promise<{ hidden: boolean; }>
```

Get the home indicator status.

**Returns:** <code>Promise&lt;{ hidden: boolean; }&gt;</code>

**Since:** 0.0.1

--------------------


### getPluginVersion()

```typescript
getPluginVersion() => Promise<{ version: string; }>
```

Get the native Capacitor plugin version

**Returns:** <code>Promise&lt;{ version: string; }&gt;</code>

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
