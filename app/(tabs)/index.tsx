import { Text, View, ActivityIndicator, StyleSheet, Button, ImageBackground } from "react-native";
import { useEffect, useState } from "react";
import { useUserContext } from '../userContext';
import { PermissionsAndroid, Platform } from "react-native";
import { useNavigation } from "expo-router";
const Mountain = require("../../assets/images/mountain.jpg");
import { User } from "@/constants/UserObject";

export default function Index() {
  
  const { state, dispatch } = useUserContext();
  const [loading, setLoading] = useState(false); 
  const navigation = useNavigation();

  useEffect(() => {
    loadTokenAndUser();
  }, [state]);

  const loadTokenAndUser = async () => {
    setLoading(true);
    const currentToken = state.token;
    const timestamp = state.timestamp;
    const currentUser = state.user;

    const currentTime = new Date().getTime();

    if (timestamp) {
      const timeLimit = 60 * 60 * 1000; 

      if (currentTime - timestamp > timeLimit) {
        dispatch({ type: 'LOGOUT' });
      }
    }

    setLoading(false);
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'Bluetooth Low Energy requires access to your location',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const navigateToHikes = () => {
    navigation.navigate('hikes' as never);
  }

  const navigateToHikeBuddy = () => {
    navigation.navigate('hikeBuddy' as never);
  }
  
  return (
    <ImageBackground 
      source={Mountain} 
      style={styles.container}
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Welcome to HikeSense!</Text>
        {loading && <ActivityIndicator size="large" color="#ffffff" />}
        
        {state.user ? (
          <>
            <Text style={styles.body}>
              {`Hello, ${(state.user as User).firstName}!`}
            </Text>
            <Text style={styles.body}>
              Explore new trails and enjoy the great outdoors.
            </Text>
            <Text style={styles.body}>
              Ready to start your hiking adventure? 
            </Text>
            <View style={styles.buttonContainer}>
              <Button title="Choose Hike" onPress={navigateToHikes} color="#4CAF50" />
            </View>
            { (state.user as User).subscriptionStatus.includes('premium') && (
            <View style={styles.buttonAlerts}>
              <Button title="Hike Buddy" onPress={navigateToHikeBuddy} color="blue" />
            </View>)}
          </>
        ) : (
          <Text style={styles.body}>Create an account or log in to get started!</Text>
        )}
        
        {state.user && (
          <View style={styles.logoutButtonContainer}>
            <Button title="Logout" onPress={handleLogout} color="#ff0000" />
          </View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay for better text contrast
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff", // Light text color
    marginBottom: 20,
    textAlign: "center",
  },
  body: {
    fontSize: 18,
    textAlign: "center",
    color: "#ffffff", // Light text color
    marginVertical: 10,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    marginVertical: 10, // Add space between buttons
    width: '80%', // Make buttons occupy 80% of the container width
    borderRadius: 5,
    overflow: 'hidden', // For rounded corners
  },
  logoutButtonContainer: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: '30%', // Adjust width as needed
    zIndex: 1, // Ensure it's above other elements
  },
  buttonAlerts: {
    marginVertical: 10, // Add space between buttons
    width: '80%', // Make buttons occupy 80% of the container width
    borderRadius: 5,
    overflow: 'hidden', // For rounded corners
  },
});
