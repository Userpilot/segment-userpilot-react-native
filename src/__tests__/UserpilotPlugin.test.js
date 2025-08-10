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
// Helper function to access protected properties for testing
const getProtectedProperty = (plugin, property) => {
  return plugin[property];
};
const setProtectedProperty = (plugin, property, value) => {
  plugin[property] = value;
};
describe('UserpilotPlugin', () => {
  let plugin;
  let mockSettings;
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
      expect(pluginDefault.logging).toBe(false);
      expect(pluginDefault.isInitialized).toBe(false);
    });
    it('should initialize with logging enabled when specified', () => {
      const pluginWithLogging = new UserpilotPlugin(true);
      expect(pluginWithLogging.logging).toBe(true);
    });
  });
  describe('update()', () => {
    it('should initialize Userpilot when settings are provided', () => {
      // Pass an empty object as UpdateType to satisfy type checking
      plugin.update(mockSettings, {});
      expect(Userpilot.setup).toHaveBeenCalledWith('test-token-123', {
        logging: false,
      });
      expect(getProtectedProperty(plugin, 'isInitialized')).toBe(true);
    });
    it('should not initialize if already initialized', () => {
      setProtectedProperty(plugin, 'isInitialized', true);
      plugin.update(mockSettings, {});
      expect(Userpilot.setup).not.toHaveBeenCalled();
    });
    it('should not initialize if Userpilot settings are undefined', () => {
      const settingsWithoutUserpilot = {
        integrations: {
          'Other Plugin': { token: 'other-token' },
        },
      };
      plugin.update(settingsWithoutUserpilot, {});
      expect(Userpilot.setup).not.toHaveBeenCalled();
      expect(getProtectedProperty(plugin, 'isInitialized')).toBe(false);
    });
    it('should handle setup errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      Userpilot.setup.mockImplementation(() => {
        throw new Error('Setup failed');
      });
      plugin.update(mockSettings, {});
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
      const event = {
        type: 'identify',
        userId: 'user123',
        traits: {
          name: 'John Doe',
          email: 'john@example.com',
          createdAt: '2023-01-01',
        },
      };
      const result = plugin.identify(event);
      expect(Userpilot.identify).toHaveBeenCalledWith('user123', {
        name: 'John Doe',
        email: 'john@example.com',
        created_at: '2023-01-01',
      });
      expect(result).toBe(event);
    });
    it('should use anonymousId when userId is not provided', () => {
      const event = {
        type: 'identify',
        anonymousId: 'anon123',
        traits: { name: 'Anonymous User' },
      };
      plugin.identify(event);
      expect(Userpilot.identify).toHaveBeenCalledWith('anon123', {
        name: 'Anonymous User',
      });
    });
    it('should trim whitespace from userId', () => {
      const event = {
        type: 'identify',
        userId: '  user123  ',
        traits: {},
      };
      plugin.identify(event);
      expect(Userpilot.identify).toHaveBeenCalledWith('user123', {});
    });
    it('should not identify if not initialized', () => {
      setProtectedProperty(plugin, 'isInitialized', false);
      const event = {
        type: 'identify',
        userId: 'user123',
      };
      const result = plugin.identify(event);
      expect(Userpilot.identify).not.toHaveBeenCalled();
      expect(result).toBe(event);
    });
    it('should not identify if no userId or anonymousId', () => {
      const event = {
        type: 'identify',
        traits: { name: 'Test' },
      };
      plugin.identify(event);
      expect(Userpilot.identify).not.toHaveBeenCalled();
    });
  });
  describe('group()', () => {
    beforeEach(() => {
      setProtectedProperty(plugin, 'isInitialized', true);
    });
    it('should identify user with company data', () => {
      const event = {
        type: 'group',
        userId: 'user123',
        groupId: 'company456',
        traits: {
          name: 'Acme Corp',
          industry: 'Technology',
          createdAt: '2023-01-01',
        },
      };
      const result = plugin.group(event);
      expect(Userpilot.identify).toHaveBeenCalledWith('user123', undefined, {
        id: 'company456',
        name: 'Acme Corp',
        industry: 'Technology',
        created_at: '2023-01-01',
      });
      expect(result).toBe(event);
    });
    it('should not group if no userId or anonymousId', () => {
      const event = {
        type: 'group',
        groupId: 'company456',
      };
      const result = plugin.group(event);
      expect(Userpilot.identify).not.toHaveBeenCalled();
      expect(result).toBe(event);
    });
    it('should not group if not initialized', () => {
      setProtectedProperty(plugin, 'isInitialized', false);
      const event = {
        type: 'group',
        userId: 'user123',
        groupId: 'company456',
      };
      const result = plugin.group(event);
      expect(Userpilot.identify).not.toHaveBeenCalled();
      expect(result).toBe(event);
    });
  });
  describe('track()', () => {
    it('should track events when initialized', () => {
      setProtectedProperty(plugin, 'isInitialized', true);
      const event = {
        type: 'track',
        event: 'Button Clicked',
        properties: { button: 'Sign Up', page: 'Home' },
      };
      const result = plugin.track(event);
      expect(Userpilot.track).toHaveBeenCalledWith('Button Clicked', {
        button: 'Sign Up',
        page: 'Home',
      });
      expect(result).toBe(event);
    });
    it('should not track if not initialized', () => {
      setProtectedProperty(plugin, 'isInitialized', false);
      const event = {
        type: 'track',
        event: 'Button Clicked',
      };
      const result = plugin.track(event);
      expect(Userpilot.track).not.toHaveBeenCalled();
      expect(result).toBe(event);
    });
  });
  describe('screen()', () => {
    it('should track screen events when initialized', () => {
      setProtectedProperty(plugin, 'isInitialized', true);
      const event = {
        type: 'screen',
        name: 'Home Screen',
        properties: {},
      };
      const result = plugin.screen(event);
      expect(Userpilot.screen).toHaveBeenCalledWith('Home Screen');
      expect(result).toBe(event);
    });
    it('should not track screen if not initialized', () => {
      setProtectedProperty(plugin, 'isInitialized', false);
      const event = {
        type: 'screen',
        name: 'Home Screen',
        properties: {},
      };
      const result = plugin.screen(event);
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
      const event = {
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
      plugin.identify(event);
      expect(Userpilot.identify).toHaveBeenCalledWith('user123', {
        name: 'John Doe',
        email: 'john@example.com',
        created_at: '2023-01-01',
      });
    });
    it('should sanitize group traits correctly through group', () => {
      setProtectedProperty(plugin, 'isInitialized', true);
      const event = {
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
      plugin.group(event);
      expect(Userpilot.identify).toHaveBeenCalledWith('user123', undefined, {
        id: 'company456',
        name: 'Acme Corp',
        industry: 'Technology',
        created_at: '2023-01-01',
      });
    });
  });
});
