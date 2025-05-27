import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useScreenTracking } from '../../utils/ScreenTracker';
import * as Userpilot from '@userpilot/react-native';

const ScreenTwo = () => {
  const goToNextScreen = () => {
    Userpilot.triggerExperience('');
  };

  useScreenTracking('screen two');

  return (
    <View style={styles.container}>
      {/* Box layout */}
      <View style={styles.box} />
      <View style={styles.box} />
      <View style={styles.row}>
        <View style={styles.smallBox} />
        <View style={styles.smallBox} />
      </View>
      <View style={[styles.tallBox, styles.lastBox]} />

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={goToNextScreen}>
        <Text style={styles.nextText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  centerText: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  box: {
    height: 100,
    width: '100%',
    backgroundColor: '#d3d3d3',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  smallBox: {
    height: 100,
    width: '48%',
    backgroundColor: '#d3d3d3',
  },
  tallBox: {
    height: 150,
    width: '100%',
    backgroundColor: '#d3d3d3',
  },
  lastBox: {
    flexGrow: 1,
    marginBottom: 150,
  },
  nextButton: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#6765E8',
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
  },
  nextText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ScreenTwo;
