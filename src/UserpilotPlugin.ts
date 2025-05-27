import {
  DestinationPlugin,
  PluginType,
  TrackEventType,
  ScreenEventType,
  SegmentAPISettings,
  UpdateType,
  IdentifyEventType,
  GroupEventType,
} from '@segment/analytics-react-native';
import type { SegmentUserpilotSettings } from './types';
import * as Userpilot from '@userpilot/react-native';

export class UserpilotPlugin extends DestinationPlugin {
  type = PluginType.destination;
  key = 'Userpilot Mobile';
  private isInitialized: boolean = false;

  async update(settings: SegmentAPISettings, _: UpdateType) {
    if (this.isInitialized) return;

    const userpilotSettings = settings.integrations[
      this.key
    ] as SegmentUserpilotSettings;

    if (!userpilotSettings) return;

    await Userpilot.setup(userpilotSettings.token, {});
    this.isInitialized = true;
  }

  identify(event: IdentifyEventType) {
    if (this.isInitialized && event.userId != null) {
      Userpilot.identify(event.userId, event.traits);
    }
    return event;
  }

  async group(event: GroupEventType) {
    if (this.isInitialized) {
      const userID = await this.getUserIDFromSettings();
      if (userID) {
        Userpilot.identify(userID, undefined, event.traits);
      } else {
        console.warn('User ID not found. Skipping identify.');
      }
    }
    return event;
  }

  track(event: TrackEventType) {
    if (this.isInitialized) {
      Userpilot.track(event.event, event.properties);
    }
    return event;
  }

  screen(event: ScreenEventType) {
    if (this.isInitialized) {
      Userpilot.screen(event.name);
    }
    return event;
  }

  reset(): void {
    if (this.isInitialized) {
      Userpilot.reset();
    }
  }

  private safeParseJSON(str: any): any {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  }

  private async getUserIDFromSettings(): Promise<string | null> {
    try {
      const settingsData = await Userpilot.settings();

      const userField = settingsData?.User;
      let userObject = null;

      if (typeof userField === 'string') {
        const trimmed = userField.trim();
        userObject = this.safeParseJSON(trimmed);
      } else if (typeof userField === 'object' && userField !== null) {
        userObject = userField;
      }

      if (userObject?.userID) {
        return userObject.userID;
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }
}
