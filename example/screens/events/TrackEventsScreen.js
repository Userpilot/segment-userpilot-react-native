import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useScreenTracking } from '../../utils/ScreenTracker';
import { useAnalytics } from '@segment/analytics-react-native';

const TrackEventsScreen = () => {
  const { track } = useAnalytics();

  const [eventName, setEventName] = useState('');
  const [eventProperties, setEventProperties] = useState([
    { key: '', value: '' },
    { key: '', value: '' },
  ]);

  const handleSubmit = () => {
    if (eventName.trim() === '') {
      Alert.alert('Error', 'Event name cannot be empty', [
        { text: 'OK', onPress: () => console.log('Alert closed') },
      ]);
      return;
    }

    const eventPropertiesDict = eventProperties.reduce((acc, curr) => {
      if (curr.key && curr.value) acc[curr.key] = curr.value;
      return acc;
    }, {});

    console.log('Event name:', eventName);
    console.log('Event Properties:', eventPropertiesDict);
    track(eventName, eventPropertiesDict);
  };

  const handleUserPropertiesChange = (index, field, value) => {
    const updatedProperties = [...eventProperties];
    if (updatedProperties[index]) {
      updatedProperties[index][field] = value ?? '';
      setEventProperties(updatedProperties);
    }
  };

  useScreenTracking('track events');

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Event name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter event name"
          value={eventName}
          onChangeText={setEventName}
        />

        <Text style={styles.title}>Event properties</Text>
        {eventProperties.map((property, index) => (
          <View style={styles.row} key={index}>
            <TextInput
              style={styles.halfInput}
              placeholder="Key"
              value={property.key}
              onChangeText={(value) =>
                handleUserPropertiesChange(index, 'key', value)
              }
            />
            <TextInput
              style={styles.halfInput}
              placeholder="Value"
              value={property.value}
              onChangeText={(value) =>
                handleUserPropertiesChange(index, 'value', value)
              }
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.filledButton} onPress={handleSubmit}>
          <Text style={styles.filledButtonText}>Track event</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  halfInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 5,
  },
  spacer: {
    height: 40,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  filledButton: {
    backgroundColor: '#6765E8',
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  filledButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TrackEventsScreen;
