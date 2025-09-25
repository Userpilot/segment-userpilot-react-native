/* eslint-disable react/react-in-jsx-scope */
import App from './App';
import { name as appName } from './app.json';
import { AppRegistry, StatusBar } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import {
  createClient,
  AnalyticsProvider,
} from '@segment/analytics-react-native';
import { UserpilotPlugin } from '@userpilot/segment-react-native';

const segmentClient = createClient({
  writeKey: 'PLACEHOLDER_KEY',
  debug: false,
});
segmentClient.add({ plugin: new UserpilotPlugin(true) });

const Index = () => (
  <>
    <StatusBar barStyle="dark-content" backgroundColor="#fff" />
    <AnalyticsProvider client={segmentClient}>
      <NavigationContainer theme={DefaultTheme}>
        <App />
      </NavigationContainer>
    </AnalyticsProvider>
  </>
);

AppRegistry.registerComponent(appName, () => Index);
