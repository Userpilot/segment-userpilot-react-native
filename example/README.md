# Segment Userpilot React Native Example App

This is a simple Android and iOS app built with React Native that integrates with the Userpilot destination plugin for Segment.

## 🚀 Setup

Refer to https://reactnative.dev/docs/environment-setup for general React Native setup. This example project uses the React Native CLI.

```sh
# Install dependencies for the plugin. Only necessary because this is referenced locally by the example app.
yarn

# Install dependencies for the example app.
cd ./example
yarn

# Install CocoaPods
cd ./iOS
pod install
```

This example app requires you to have configured an Userpilot Mobile destination for your app source in the [Segment dashboard](https://app.segment.com/). The Segment React Native SDK is then initialized with the write key that is tied to this source. Once the configuration is completed, analytics sent to Segment will automatically be forwarded through to Userpilot.

```sh
# Start bundler
npx react-native start

# Run the app for Android
npx react-native run-android

# Run the app for iOS
npx react-native run-ios
```

## ✨ Functionality

The example app demonstrates the core functionality of the React Native Segment destination plugin for Userpilot across 4 screens.

### Main Screen

This screen is identified as `Main` for screen targeting.

Navigate to App screens, features.


### Identify Screen

This screen is identified as `Sign In` for screen targeting.

Provide a User ID for use with `identify()`.
Provide a User Company for use with `group()`.

The navigation bar also includes a button to sign out using `logout()`.

### TrackEvents Screen

This screen is identified as `Trigger Events` for screen targeting.

Track event with properties using `track()`.

### ScreenOne and ScreenTwo Screen

This screen is identified as `screenOne, ScreenTwo` for screen targeting.

Two screens to track screen using `screen()`.
