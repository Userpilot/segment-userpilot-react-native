import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useScreenTracking } from '../../utils/ScreenTracker';
import * as Userpilot from '@userpilot/react-native';
import { useAnalytics } from '@segment/analytics-react-native';

const IdentifyScreen = () => {
  const { identify, group } = useAnalytics();

  const [userID, setUserID] = useState('');
  const [userProperties, setUserProperties] = useState([
    { key: '', value: '' },
    { key: '', value: '' },
  ]);
  const [company, setCompany] = useState([
    { key: '', value: '' },
    { key: '', value: '' },
  ]);

  const handleSubmit = () => {
    if (userID.trim() === '') {
      Alert.alert('Error', 'Username cannot be empty', [
        { text: 'OK', onPress: () => console.log('Alert closed') },
      ]);
      return;
    }

    const userPropertiesDict = userProperties.reduce((acc, curr) => {
      if (curr.key && curr.value) acc[curr.key] = curr.value;
      return acc;
    }, {});

    const companyDict = company.reduce((acc, curr) => {
      if (curr.key && curr.value) acc[curr.key] = curr.value;
      return acc;
    }, {});

    console.log('Username:', userID);
    console.log('User Properties:', userPropertiesDict);
    console.log('Company:', companyDict);
    identify(userID, userPropertiesDict);
    group(userID, companyDict);
  };

  const handleAnonymous = () => {
    Userpilot.anonymous();
  };

  const handleUserPropertiesChange = (index, field, value) => {
    const updatedProperties = [...userProperties];
    if (updatedProperties[index]) {
      updatedProperties[index][field] = value ?? '';
      setUserProperties(updatedProperties);
    }
  };

  const handleCompanyChange = (index, field, value) => {
    const updatedCompany = [...company];
    if (updatedCompany[index]) {
      updatedCompany[index][field] = value ?? '';
      setCompany(updatedCompany);
    }
  };

  useScreenTracking('identify');

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>User ID</Text>
          <TextInput
            style={styles.input}
            placeholder="User ID"
            value={userID}
            onChangeText={setUserID}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.title}>User properties</Text>
          {userProperties.map((property, index) => (
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

          <View style={styles.spacer} />

          <Text style={styles.title}>User company properties</Text>
          {company.map((comp, index) => (
            <View style={styles.row} key={index}>
              <TextInput
                style={styles.halfInput}
                placeholder="Key"
                value={comp.key}
                onChangeText={(value) =>
                  handleCompanyChange(index, 'key', value)
                }
              />
              <TextInput
                style={styles.halfInput}
                placeholder="Value"
                value={comp.value}
                onChangeText={(value) =>
                  handleCompanyChange(index, 'value', value)
                }
              />
            </View>
          ))}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.filledButton} onPress={handleSubmit}>
            <Text style={styles.filledButtonText}>Identify</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.outlineButton}
            onPress={handleAnonymous}
          >
            <Text style={styles.outlineButtonText}>Anonymous</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  outlineButton: {
    borderWidth: 1,
    borderColor: '#6765E8',
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
  },
  outlineButtonText: {
    color: '#6765E8',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default IdentifyScreen;
