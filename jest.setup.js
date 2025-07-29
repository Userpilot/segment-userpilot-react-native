/* eslint-disable no-undef */
import { NativeModules } from 'react-native';

// Mock NativeModules
NativeModules.UserpilotReactNative =
  NativeModules.UserpilotReactNative ||
  {
    // mock any methods your plugin calls if needed
  };

NativeModules.SovranReactNative = NativeModules.SovranReactNative || {};

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
  return jest.fn().mockImplementation(() => ({
    addListener: jest.fn(),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    emit: jest.fn(),
  }));
});

// Mock @segment/sovran-react-native
jest.mock('@segment/sovran-react-native', () => ({
  createStore: jest.fn(() => ({
    select: jest.fn(),
    dispatch: jest.fn(),
    subscribe: jest.fn(),
  })),
}));

// Mock @segment/analytics-react-native
jest.mock('@segment/analytics-react-native', () => ({
  DestinationPlugin: class MockDestinationPlugin {
    constructor() {
      this.type = 'destination';
    }
  },
  PluginType: {
    destination: 'destination',
  },
  EventType: {
    IdentifyEvent: 'identify',
    GroupEvent: 'group',
    TrackEvent: 'track',
    ScreenEvent: 'screen',
  },
  IdentifyEventType: jest.fn(),
  GroupEventType: jest.fn(),
  TrackEventType: jest.fn(),
  ScreenEventType: jest.fn(),
  UpdateType: jest.fn(),
  UserTraits: jest.fn(),
  GroupTraits: jest.fn(),
  SegmentAPISettings: jest.fn(),
}));
