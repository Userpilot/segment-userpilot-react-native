import {
  DestinationPlugin,
  PluginType,
  TrackEventType,
  ScreenEventType,
  SegmentAPISettings,
  UpdateType,
  IdentifyEventType,
  GroupEventType,
  UserTraits,
  GroupTraits,
} from '@segment/analytics-react-native';
import type { SegmentUserpilotSettings } from './types';
import * as Userpilot from '@userpilot/react-native';
import { NativeModules, NativeEventEmitter } from 'react-native';

/**
 * Importing the Userpilot module and NativeEventEmitter from react-native
 * This will allow us to interact with the Userpilot SDK and listen for events.
 */
const { UserpilotReactNative } = NativeModules;
const eventEmitter = new NativeEventEmitter(UserpilotReactNative);
let subscriptions: any[] = [];

/**
 * UserpilotPlugin is a Segment destination plugin that integrates Userpilot with Segment for mobile applications.
 * It allows tracking user events, identifying users, and managing user sessions with Userpilot.
 */
export class UserpilotPlugin extends DestinationPlugin {
  type = PluginType.destination;
  key = 'Userpilot Mobile';
  private isInitialized: boolean = false;
  private logging: boolean;

  /**
   * Constructor for UserpilotPlugin.
   * @param {boolean} logging - Optional parameter to enable logging. Default is false.
   */
  constructor(logging = false) {
    super();
    this.logging = logging;
  }

  // This plugin is used to integrate Userpilot with Segment for mobile applications.
  update(settings: SegmentAPISettings, _: UpdateType) {
    if (this.isInitialized) return;

    const userpilotSettings = settings.integrations[
      this.key
    ] as SegmentUserpilotSettings;

    if (userpilotSettings === undefined) {
      return;
    }

    try {
      Userpilot.setup(userpilotSettings.token, { logging: this.logging });
      this.isInitialized = true;
    } catch (error) {
      console.error('Userpilot setup failed:', error);
    }
  }

  // This method is called when the plugin is initialized.
  identify(event: IdentifyEventType) {
    if (!this.isInitialized) return event;

    const userId = event.userId?.trim() || event.anonymousId?.trim();
    if (userId) {
      const sanitizedTraits = this.sanitizeUserTraits(event.traits);
      Userpilot.identify(userId, sanitizedTraits);
    }

    return event;
  }

  // This method is called when a group event is received.
  group(event: GroupEventType) {
    if (!this.isInitialized) return event;

    const userId = event.userId?.trim() || event.anonymousId?.trim();
    if (!userId) return event;

    const sanitizedTraits = this.sanitizeGroupTraits(event.traits);

    const company = {
      id: event.groupId,
      ...(sanitizedTraits || {}),
    };

    Userpilot.identify(userId, undefined, company);

    return event;
  }

  // This method is called when a track event is received.
  track(event: TrackEventType) {
    if (this.isInitialized) {
      Userpilot.track(event.event, event.properties);
    }
    return event;
  }

  // This method is called when a screen event is received.
  screen(event: ScreenEventType) {
    if (this.isInitialized) {
      Userpilot.screen(event.name);
    }
    return event;
  }

  // This method is called when the plugin is reset.
  reset(): void {
    if (this.isInitialized) {
      Userpilot.logout();
    }
  }

  private sanitizeUserTraits(
    traits?: UserTraits
  ): Record<string, any> | undefined {
    if (!traits || typeof traits !== 'object') return;

    const mapped: Record<string, any> = {};

    for (const [key, value] of Object.entries(traits)) {
      if (value == null) continue;

      const targetKey = key === 'createdAt' ? 'created_at' : key;
      mapped[targetKey] = value;
    }

    return mapped;
  }

  private sanitizeGroupTraits(
    traits?: GroupTraits
  ): Record<string, any> | undefined {
    if (!traits || typeof traits !== 'object') return;

    const mapped: Record<string, any> = {};

    for (const [key, value] of Object.entries(traits)) {
      if (value == null) continue;

      const targetKey = key === 'createdAt' ? 'created_at' : key;
      mapped[targetKey] = value;
    }

    return mapped;
  }
}

/**
 * Function to start listening to Userpilot events.
 */
export function startListeningToUserpilotEvents({
  onAnalyticsEvent,
  onExperienceEvent,
  onNavigationEvent,
}: any) {
  // Clear existing listeners first
  stopListeningToUserpilotEvents();

  if (onAnalyticsEvent) {
    subscriptions.push(
      eventEmitter.addListener('UserpilotAnalyticsEvent', onAnalyticsEvent)
    );
  }

  if (onExperienceEvent) {
    subscriptions.push(
      eventEmitter.addListener('UserpilotExperienceEvent', onExperienceEvent)
    );
  }

  if (onNavigationEvent) {
    subscriptions.push(
      eventEmitter.addListener('UserpilotNavigationEvent', (event: any) => {
        onNavigationEvent(event);
      })
    );
  }
}

export function stopListeningToUserpilotEvents() {
  subscriptions.forEach((sub) => sub.remove());
  subscriptions = [];
}
