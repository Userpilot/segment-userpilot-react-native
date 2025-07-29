import { UserpilotPlugin } from '../UserpilotPlugin';
import * as Userpilot from '@userpilot/react-native';

// Mock dependencies
jest.mock('@userpilot/react-native', () => ({
  setup: jest.fn(),
  identify: jest.fn(),
  track: jest.fn(),
  screen: jest.fn(),
  logout: jest.fn(),
}));

jest.mock('react-native', () => ({
  NativeModules: {
    UserpilotReactNative: {},
  },
  NativeEventEmitter: jest.fn().mockImplementation(() => ({
    addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  })),
}));

// Define mock types for testing
type MockIdentifyEventType = {
  type: string;
  userId?: string;
  anonymousId?: string;
  traits?: Record<string, any>;
};

type MockGroupEventType = {
  type: string;
  userId?: string;
  anonymousId?: string;
  groupId?: string;
  traits?: Record<string, any>;
};

type MockTrackEventType = {
  type: string;
  event: string;
  properties?: Record<string, any>;
};

type MockScreenEventType = {
  type: string;
  name: string;
  properties?: Record<string, any>;
};

type MockUpdateType = Record<string, any>;

// Helper function to access protected properties for testing
const getProtectedProperty = (plugin: UserpilotPlugin, property: string) => {
  return (plugin as any)[property];
};

const setProtectedProperty = (
  plugin: UserpilotPlugin,
  property: string,
  value: any
) => {
  (plugin as any)[property] = value;
};

describe('UserpilotPlugin', () => {
  let plugin: UserpilotPlugin;
  let mockSettings: any;

  beforeEach(() => {
    plugin = new UserpilotPlugin();
    mockSettings = {
      integrations: {
        'Userpilot Mobile': {
          token: 'test-token-123',
        },
      },
    };
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with default logging disabled', () => {
      const pluginDefault = new UserpilotPlugin();
      expect((pluginDefault as any).logging).toBe(false);
      expect((pluginDefault as any).isInitialized).toBe(false);
    });

    it('should initialize with logging enabled when specified', () => {
      const pluginWithLogging = new UserpilotPlugin(true);
      expect((pluginWithLogging as any).logging).toBe(true);
    });
  });

  describe('update()', () => {
    it('should initialize Userpilot when settings are provided', () => {
      // Pass an empty object as UpdateType to satisfy type checking
      (plugin as any).update(mockSettings, {} as MockUpdateType);

      expect(Userpilot.setup).toHaveBeenCalledWith('test-token-123', {
        logging: false,
      });
      expect(getProtectedProperty(plugin, 'isInitialized')).toBe(true);
    });

    it('should not initialize if already initialized', () => {
      setProtectedProperty(plugin, 'isInitialized', true);
      (plugin as any).update(mockSettings, {} as MockUpdateType);

      expect(Userpilot.setup).not.toHaveBeenCalled();
    });

    it('should not initialize if Userpilot settings are undefined', () => {
      const settingsWithoutUserpilot = {
        integrations: {
          'Other Plugin': { token: 'other-token' },
        },
      };

      (plugin as any).update(settingsWithoutUserpilot, {} as MockUpdateType);

      expect(Userpilot.setup).not.toHaveBeenCalled();
      expect(getProtectedProperty(plugin, 'isInitialized')).toBe(false);
    });

    it('should handle setup errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (Userpilot.setup as jest.Mock).mockImplementation(() => {
        throw new Error('Setup failed');
      });

      (plugin as any).update(mockSettings, {} as MockUpdateType);

      expect(consoleSpy).toHaveBeenCalledWith(
        'Userpilot setup failed:',
        expect.any(Error)
      );
      expect(getProtectedProperty(plugin, 'isInitialized')).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('identify()', () => {
    beforeEach(() => {
      setProtectedProperty(plugin, 'isInitialized', true);
    });

    it('should identify user with userId and sanitized traits', () => {
      const event: MockIdentifyEventType = {
        type: 'identify',
        userId: 'user123',
        traits: {
          name: 'John Doe',
          email: 'john@example.com',
          createdAt: '2023-01-01',
        },
      };

      const result = plugin.identify(event as any);

      expect(Userpilot.identify).toHaveBeenCalledWith('user123', {
        name: 'John Doe',
        email: 'john@example.com',
        created_at: '2023-01-01',
      });
      expect(result).toBe(event);
    });

    it('should use anonymousId when userId is not provided', () => {
      const event: MockIdentifyEventType = {
        type: 'identify',
        anonymousId: 'anon123',
        traits: { name: 'Anonymous User' },
      };

      plugin.identify(event as any);

      expect(Userpilot.identify).toHaveBeenCalledWith('anon123', {
        name: 'Anonymous User',
      });
    });

    it('should trim whitespace from userId', () => {
      const event: MockIdentifyEventType = {
        type: 'identify',
        userId: '  user123  ',
        traits: {},
      };

      plugin.identify(event as any);

      expect(Userpilot.identify).toHaveBeenCalledWith('user123', {});
    });

    it('should not identify if not initialized', () => {
      setProtectedProperty(plugin, 'isInitialized', false);
      const event: MockIdentifyEventType = {
        type: 'identify',
        userId: 'user123',
      };

      const result = plugin.identify(event as any);

      expect(Userpilot.identify).not.toHaveBeenCalled();
      expect(result).toBe(event);
    });

    it('should not identify if no userId or anonymousId', () => {
      const event: MockIdentifyEventType = {
        type: 'identify',
        traits: { name: 'Test' },
      };

      plugin.identify(event as any);

      expect(Userpilot.identify).not.toHaveBeenCalled();
    });
  });

  describe('group()', () => {
    beforeEach(() => {
      setProtectedProperty(plugin, 'isInitialized', true);
    });

    it('should identify user with company data', () => {
      const event: MockGroupEventType = {
        type: 'group',
        userId: 'user123',
        groupId: 'company456',
        traits: {
          name: 'Acme Corp',
          industry: 'Technology',
          createdAt: '2023-01-01',
        },
      };

      const result = plugin.group(event as any);

      expect(Userpilot.identify).toHaveBeenCalledWith('user123', undefined, {
        id: 'company456',
        name: 'Acme Corp',
        industry: 'Technology',
        created_at: '2023-01-01',
      });
      expect(result).toBe(event);
    });

    it('should not group if no userId or anonymousId', () => {
      const event: MockGroupEventType = {
        type: 'group',
        groupId: 'company456',
      };

      const result = plugin.group(event as any);

      expect(Userpilot.identify).not.toHaveBeenCalled();
      expect(result).toBe(event);
    });

    it('should not group if not initialized', () => {
      setProtectedProperty(plugin, 'isInitialized', false);
      const event: MockGroupEventType = {
        type: 'group',
        userId: 'user123',
        groupId: 'company456',
      };

      const result = plugin.group(event as any);

      expect(Userpilot.identify).not.toHaveBeenCalled();
      expect(result).toBe(event);
    });
  });

  describe('track()', () => {
    it('should track events when initialized', () => {
      setProtectedProperty(plugin, 'isInitialized', true);
      const event: MockTrackEventType = {
        type: 'track',
        event: 'Button Clicked',
        properties: { button: 'Sign Up', page: 'Home' },
      };

      const result = plugin.track(event as any);

      expect(Userpilot.track).toHaveBeenCalledWith('Button Clicked', {
        button: 'Sign Up',
        page: 'Home',
      });
      expect(result).toBe(event);
    });

    it('should not track if not initialized', () => {
      setProtectedProperty(plugin, 'isInitialized', false);
      const event: MockTrackEventType = {
        type: 'track',
        event: 'Button Clicked',
      };

      const result = plugin.track(event as any);

      expect(Userpilot.track).not.toHaveBeenCalled();
      expect(result).toBe(event);
    });
  });

  describe('screen()', () => {
    it('should track screen events when initialized', () => {
      setProtectedProperty(plugin, 'isInitialized', true);
      const event: MockScreenEventType = {
        type: 'screen',
        name: 'Home Screen',
        properties: {},
      };

      const result = plugin.screen(event as any);

      expect(Userpilot.screen).toHaveBeenCalledWith('Home Screen');
      expect(result).toBe(event);
    });

    it('should not track screen if not initialized', () => {
      setProtectedProperty(plugin, 'isInitialized', false);
      const event: MockScreenEventType = {
        type: 'screen',
        name: 'Home Screen',
        properties: {},
      };

      const result = plugin.screen(event as any);

      expect(Userpilot.screen).not.toHaveBeenCalled();
      expect(result).toBe(event);
    });
  });

  describe('reset()', () => {
    it('should logout when initialized', () => {
      setProtectedProperty(plugin, 'isInitialized', true);

      plugin.reset();

      expect(Userpilot.logout).toHaveBeenCalled();
    });

    it('should not logout if not initialized', () => {
      setProtectedProperty(plugin, 'isInitialized', false);

      plugin.reset();

      expect(Userpilot.logout).not.toHaveBeenCalled();
    });
  });

  // Test sanitization through public methods since they're private
  describe('Trait Sanitization', () => {
    it('should sanitize user traits correctly through identify', () => {
      setProtectedProperty(plugin, 'isInitialized', true);
      const event: MockIdentifyEventType = {
        type: 'identify',
        userId: 'user123',
        traits: {
          name: 'John Doe',
          email: 'john@example.com',
          createdAt: '2023-01-01',
          nullValue: null,
          undefinedValue: undefined,
        },
      };

      plugin.identify(event as any);

      expect(Userpilot.identify).toHaveBeenCalledWith('user123', {
        name: 'John Doe',
        email: 'john@example.com',
        created_at: '2023-01-01',
      });
    });

    it('should sanitize group traits correctly through group', () => {
      setProtectedProperty(plugin, 'isInitialized', true);
      const event: MockGroupEventType = {
        type: 'group',
        userId: 'user123',
        groupId: 'company456',
        traits: {
          name: 'Acme Corp',
          industry: 'Technology',
          createdAt: '2023-01-01',
          nullValue: null,
        },
      };

      plugin.group(event as any);

      expect(Userpilot.identify).toHaveBeenCalledWith('user123', undefined, {
        id: 'company456',
        name: 'Acme Corp',
        industry: 'Technology',
        created_at: '2023-01-01',
      });
    });
  });
});
