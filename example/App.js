/* eslint-disable react/react-in-jsx-scope */
import { useCallback, useEffect } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import MainScreen from './screens/main/MainScreen';
import IdentifyScreen from './screens/identify/IdentifyScreen';
import ScreenOne from './screens/screens/ScreenOne';
import ScreenTwo from './screens/screens/ScreenTwo';
import DeepLinkScreen from './screens/deeplink/DeepLinkScreen';
import TrackEventsScreen from './screens/events/TrackEventsScreen';
import { Platform, PermissionsAndroid } from 'react-native';
import { useAnalytics } from '@segment/analytics-react-native';
import {
  startListeningToUserpilotEvents,
  stopListeningToUserpilotEvents,
} from '@userpilot/segment-react-native';

const Stack = createStackNavigator();

const commonScreenOptions = {
  headerStyle: { backgroundColor: '#fff' },
  headerTintColor: '#000',
  headerBackTitle: '',
};

const App = () => {
  const { reset } = useAnalytics();
  const navigation = useNavigation();

  const requestNotificationPermission = useCallback(async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        const alreadyGranted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        if (alreadyGranted) {
          console.log('Notification permission already granted');
          return;
        }

        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'This app would like to send you notifications',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Notification permission granted');
        } else {
          console.log('Notification permission denied');
        }
      } catch (err) {
        console.warn('Permission request error:', err);
      }
    }
  }, []);

  const initialize = useCallback(async () => {
    await requestNotificationPermission();
  }, [requestNotificationPermission]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleDeepLink = useCallback(
    (url) => {
      const match = url.match(/^([^:]+):\/\/([^/]+)\/?.*$/);
      if (match && match[1] === 'userpilot-example') {
        if (match[2] === 'demo') {
          requestAnimationFrame(() => {
            navigation.navigate('DeepLink');
          });
        }
      } else {
        console.error('Invalid deep link format:', url);
      }
    },
    [navigation]
  );

  useEffect(() => {
    startListeningToUserpilotEvents({
      onAnalyticsEvent: (event) => {
        console.log('Analytics Event:', event);
      },
      onExperienceEvent: (event) => {
        console.log('Experience Event:', event);
      },
      onNavigationEvent: (event) => {
        console.log('Navigation Event', event);
        if (event?.url) {
          handleDeepLink(event.url);
        }
      },
    });

    return () => stopListeningToUserpilotEvents();
  }, [handleDeepLink]);

  return (
    <Stack.Navigator initialRouteName="MainScreen">
      <Stack.Screen
        name="MainScreen"
        component={MainScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="IdentifyScreen"
        component={IdentifyScreen}
        options={{
          title: 'Identify',
          ...commonScreenOptions,
          headerRight: () => (
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => reset()}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="ScreenOne"
        component={ScreenOne}
        options={{ title: 'Screen One', ...commonScreenOptions }}
      />
      <Stack.Screen
        name="ScreenTwo"
        component={ScreenTwo}
        options={{ title: 'Screen Two', ...commonScreenOptions }}
      />
      <Stack.Screen
        name="TrackEventsScreen"
        component={TrackEventsScreen}
        options={{ title: 'Track Events', ...commonScreenOptions }}
      />
      <Stack.Screen
        name="DeepLink"
        component={DeepLinkScreen}
        options={{ title: 'Deep Link', ...commonScreenOptions }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#ff0000',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  logoutButtonText: {
    color: '#ff0000',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default App;
