import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useScreenTracking } from '../../utils/ScreenTracker';

const MainScreen = () => {
  const navigation = useNavigation();

  // Call the tracking hook here in the functional component
  useScreenTracking('main');

  const options = [
    { id: '1', label: 'Identify & anonymous' },
    { id: '2', label: 'Track screens' },
    { id: '3', label: 'Track events' },
  ];

  const handleOptionPress = (id) => {
    if (id === '1') {
      navigation.navigate('IdentifyScreen');
    } else if (id === '2') {
      navigation.navigate('ScreenOne');
    } else if (id === '3') {
      navigation.navigate('TrackEventsScreen');
    }
  };

  const renderOption = ({ item }) => (
    <TouchableOpacity
      style={styles.optionContainer}
      onPress={() => handleOptionPress(item.id)}
    >
      <Text style={styles.optionText}>{item.label}</Text>
      <Image source={require('./arrow-forward.png')} style={styles.arrowIcon} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <View style={styles.imageContainer}>
        <Image
          source={require('./logo.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Options List */}
      <FlatList
        data={options}
        keyExtractor={(item) => item.id}
        renderItem={renderOption}
        contentContainerStyle={styles.listContainer}
      />

      {/* Footer */}
      <View style={styles.footerContainer}>
        <Text style={styles.footerText}>
          © 2024 Userpilot. All rights reserved.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  imageContainer: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 30 : 50,
  },
  image: {
    width: 200,
    height: 100,
  },
  listContainer: {
    paddingVertical: 8,
  },
  optionContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  footerContainer: {
    marginTop: 24,
    paddingVertical: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#aaa',
  },
  arrowIcon: {
    width: 24,
    height: 24,
    tintColor: 'black',
  },
});

export default MainScreen;
