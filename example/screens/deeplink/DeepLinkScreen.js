import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DeepLinkScreen = () => {
  return (
    <View style={styles.container}>
      {/* Centered Text */}
      <View style={styles.centerContainer}>
        <Text style={styles.centerText}>Deeplink screen</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ADD8E6',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#0000FF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    fontSize: 22,
    textAlign: 'center',
    color: '#333',
  },
});

export default DeepLinkScreen;
