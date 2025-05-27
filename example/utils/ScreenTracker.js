import { useFocusEffect } from '@react-navigation/native';
import React from 'react';
import { useAnalytics } from '@segment/analytics-react-native';

export const useScreenTracking = (screenName) => {
  const analytics = useAnalytics();

  useFocusEffect(
    React.useCallback(() => {
      analytics.screen(screenName);
      console.log(`${screenName} resumed`);
    }, [analytics, screenName])
  );
};
