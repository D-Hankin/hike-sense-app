import { Text, View, ActivityIndicator, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { useUserContext } from '../userContext';
import { BleManager } from "react-native-ble-plx";
import { PermissionsAndroid, Platform } from "react-native";

export default function Index() {
  interface User {
    id: string; 
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    hikes: Hike[];
    friends: string[]; 
  }
  
  interface Hike {
    name: string;
    startLocation: {
      latitude: number;
      longitude: number;
    };
    finishLocation: {
      latitude: number;
      longitude: number;
    };
    startTime: string; 
    finishTime: string; 
    distance: number; 
    duration: number; 
    route: string; 
    isFavorite: boolean;
    avgHeartRate: number; 
    avgTemp: number; 
    alerts: Alert[];
  }
  
  interface Alert {
    alertType: string;
    information: string;
    time: string; 
    location: {
      latitude: number;
      longitude: number;
    };
  }

  interface State {
    token: string | null;
    timestamp: number | null;
    user: User | null; // Ensure user can be null
  }
  
  const { state, dispatch } = useUserContext();
  const [loading, setLoading] = useState(false); 

  useEffect(() => {
    loadTokenAndUser();
  }, [state]); // Re-run the effect when the state changes

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
    return true; // iOS doesn't need explicit permission
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HikeSense</Text>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      
      {state.user ? (
        <>
          <Text style={styles.body}>
            {`First Name: ${(state.user as User).firstName}`}
          </Text>
          <Text style={styles.body}>
            {`Last Name: ${(state.user as User).lastName}`}
          </Text>
          <Text style={styles.body}>
            {`Username: ${(state.user as User).username}`}
          </Text>
          <Text style={styles.body}>
            {`Hikes: ${(state.user as User).hikes.length}`}
          </Text>
          <Text style={styles.body}>
            {`Friends: ${(state.user as User).friends.length}`}
          </Text>
          <Text style={styles.body}>{state.token}</Text>
        </>
      ) : (
        <Text style={styles.body}>Create an account or log in to continue.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  body: {
    fontSize: 16,
    textAlign: "center",
  },
});
