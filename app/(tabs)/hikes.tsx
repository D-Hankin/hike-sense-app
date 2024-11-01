import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, ImageBackground, TouchableOpacity, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useUserContext } from '../userContext';
import { Ionicons } from '@expo/vector-icons';
import { useHeartRateContext } from '../heartRateContext';
import * as Location from 'expo-location';
import { User, Hike } from '@/constants/UserObject';

const Mountain = require("../../assets/images/mountain.jpg");

export default function Hikes() {
  const { state }: { state: {
    timestamp: any;
    token: any; 
    user: User | null 
  }} = useUserContext();
  const { dispatch } = useUserContext();
  const [selectedHike, setSelectedHike] = useState<Hike | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [hikeInProgress, setHikeInProgress] = useState(false);
  const [hikePaused, setHikePaused] = useState(false);
  const [heartRateList, setHeartRateList] = useState<number[]>([]);
  const { heartRateHistory, clearHeartRateHistory} = useHeartRateContext();
  const [startTime, setStartTime] = useState<number>(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [sosSent, setSosSent] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);

  const handleHikeSelect = async (hike: Hike) => {
    setSelectedHike(hike);
    await fetchDirections(hike.startLocation, hike.finishLocation);
  };

  const showModal = () => {
    console.log("Showing modal...");
    setIsModalVisible(true);
  };

  const hideModal = () => {
    console.log("Hiding modal...");
    setIsModalVisible(false);
  };

  const handleUserLocationChange = async () => {
    // Request permission to access location
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission to access location was denied');
      return null;
    }
  
    // Get the current location
    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    setCurrentLocation({ latitude, longitude });
    return { latitude, longitude };
  };
  
  const confirmAction = async () => {
    console.log("Confirming action...");
    hideModal();
    
    const location = await handleUserLocationChange();
    if (location) {
      setCurrentLocation(location);
      sendSos(location); // Pass the current location to sendSos
    } else {
      console.error("Error getting user location...");
    }
  };
  
  const sendSos = async (location: { latitude: number; longitude: number; }) => {
    console.log("Sending SOS...");
    console.log("Current location: ", location);
    
    const sosData = {
      location: location, // Use the current location instead of selectedHike.startLocation
      time: new Date().toISOString(),
    };
    
    const response = await fetch('https://stingray-app-ewlud.ondigitalocean.app/sos/send-sos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${state.token}`
      },
      body: JSON.stringify(sosData),
    });

    const data = await response.text();
    if (data === "SOS sent") {
      setSosSent(true);
    }

  };

  const fetchDirections = async (start: { latitude: number; longitude: number }, end: { latitude: number; longitude: number }) => {
    const API_KEY = process.env.MAPS_API_KEY; // Replace with your actual Google Directions API key
    const origin = `${start.latitude},${start.longitude}`;
    const destination = `${end.latitude},${end.longitude}`;
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=walking&key=${API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes.length > 0) {
        const points = decodePolyline(data.routes[0].overview_polyline.points);
        setRouteCoordinates(points);
      }
    } catch (error) {
      console.error("Error fetching directions: ", error);
    }
  };

  const decodePolyline = (t: string) => {
    const coordinates: { latitude: number; longitude: number }[] = [];
    let index = 0, len = t.length;
    let lat = 0, lng = 0;

    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result >> 1) ^ (-(result & 1)));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = t.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result >> 1) ^ (-(result & 1)));
      lng += dlng;

      coordinates.push({
        latitude: (lat / 1E5),
        longitude: (lng / 1E5),
      });
    }
    return coordinates;
  };
  const navigation = useNavigation();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigation.navigate('index' as never);
  };

  function goBack(): void {
    if (selectedHike) {
      setSelectedHike(null);
    } else {
      navigation.navigate('index' as never);
    }
  };

  const startHike = () => {
    console.log("Starting hike...");
    if (clearHeartRateHistory) {
      clearHeartRateHistory();
    }
    setHikeInProgress(true);
    setHikePaused(false);
    setStartTime(Date.now());
  };
  
  const pauseHike = () => {
    console.log("Pausing hike...");
    setHikePaused(true);
    setHeartRateList([...heartRateList, ...heartRateHistory]);
  };

  const finishHike = () => {
    setIsFavourite(true);
  };

  const sendHike = (value: boolean) => {
    console.log("Finishing hike...");
    setHikeInProgress(false);
    setHikePaused(false);
    setHeartRateList([...heartRateList, ...heartRateHistory]);
    sendHikeData(value);
    setIsFavourite(false);
  }

  const calculateAvgHeartRate = () => {
    if (heartRateList.length === 0) return 0;
    let sum = 0;
    heartRateList.forEach((rate) => {
      sum += rate;
    });
    return sum / heartRateList.length;
  }

  const calculateDuration = () => {
    return Date.now() - startTime;
  }

  const sendHikeData = async (value: boolean) => {
    const hikeAlerts = selectedHike?.alerts?.map((alert) => {
      return {
        ...alert,
        time: new Date(alert.time).toISOString(),
      };
    });
    const hikeData = {
      ...selectedHike,
      avgHeartRate: calculateAvgHeartRate(),
      duration: calculateDuration(),
      startTime: new Date(startTime).toISOString(),
      finishTime: new Date().toISOString(),
      alerts: hikeAlerts,
      completed: true,
      isFavourite: value,
    };

    console.log("Sending hike data: ", hikeData);

    try {
      const response = await fetch('https://stingray-app-ewlud.ondigitalocean.app/hike/finish-hike', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${state.token}`,
        },
        body: JSON.stringify(hikeData),
      });

      const data = await response.text();
      console.log("Hike data sent successfully: ", data);
      Alert.alert("Hike data sent successfully");
    } catch (error) {
      console.error("Error sending hike data: ", error);
    }
  }

  return (
    <ImageBackground 
      source={Mountain} 
      style={styles.container}
    >
      <View style={styles.backIcon}>
      <TouchableOpacity onPress={goBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      { !hikeInProgress && 
      <View style={styles.logoutButtonContainer}>
        <Button title="Logout" onPress={handleLogout} color="#ff0000" />
      </View> }
      { hikeInProgress &&
      <View style={styles.sosButtonContainer}>
        <TouchableOpacity style={styles.sosButton} onPress={showModal}>
          <Text style={styles.sosButtonText}>Send Location</Text>
        </TouchableOpacity>
      </View> }
      <View style={styles.container}>
        {selectedHike ? <Text style={styles.title}>Hike Details</Text>
        :
        <Text style={styles.title}>Select a Hike</Text>
        }

        {selectedHike && (
          <View style={styles.mapContainer}>
            <Text style={styles.selectedHikeTitle}>Selected Hike: {selectedHike.name}</Text>
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE} // Use Google Maps
              initialRegion={{
                latitude: selectedHike.startLocation.latitude,
                longitude: selectedHike.startLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              showsUserLocation={true}
              loadingEnabled={true}
            >
              <Marker coordinate={selectedHike.startLocation} title="Start" />
              <Marker coordinate={selectedHike.finishLocation} title="Finish" />
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="blue" // Use a color for the polyline
                strokeWidth={3} // Use a width for the polyline
              />
            </MapView>
          </View>
        )}

        {!selectedHike &&
        <FlatList
          data={state?.user?.hikes || []}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => (
            <View style={styles.hikeButtons}>
              <Button title={item.name} onPress={() => handleHikeSelect(item)} />
            </View>
          )}
        /> }

        {selectedHike && (
          <View style={styles.buttonContainer}>
            {!hikeInProgress && <Button title='Start Hike' onPress={startHike} color='green' />}
            {hikeInProgress && !hikePaused && <Button title='Pause Hike' onPress={pauseHike} color='blue' />}
            {hikeInProgress && hikePaused && <Button title='Resume Hike' onPress={startHike} color='green' />}
            {hikeInProgress && !hikePaused && <Button title='Finish Hike' onPress={finishHike} color='red' /> }
          </View>
        )}
      </View>
      <Modal
        transparent={true}
        animationType="slide"
        visible={isModalVisible}
        onRequestClose={hideModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Confirm Location marker</Text>
            <Button title="Confirm" onPress={confirmAction} color="red" />
            <Button title="Cancel" onPress={hideModal} color="blue" />
          </View>
        </View>
      </Modal>
      {sosSent && 
      <View style={styles.confirmationTextView}>
        <Text style={styles.confirmationText}>Location marker sent. Current Location: {currentLocation?.latitude + ", " + currentLocation?.longitude} </Text>
        <Button title="Close" onPress={() => setSosSent(false)} />
      </View>}
      {isFavourite &&
      <View style={styles.confirmationFavouriteView}>
        <Text style={styles.confirmationText}>Hike completed. Set hike as favourite?</Text>
        <Button title="Yes" onPress={() => sendHike(true)} color='green'/>
        <Button title="No" onPress={() => sendHike(false)} color='red'/>
      </View>}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  title: {
    padding: 20,
    borderRadius: 10,
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 60,
    textAlign: 'center',
  },
  mapContainer: {
    height: 400,
    marginBottom: 20,
  },
  selectedHikeTitle: {
    color: '#ffffff',
    fontSize: 22,
    marginBottom: 10,
    marginLeft: 10,
  },
  map: {
    flex: 1,
    width: '96%',
    marginHorizontal: '2%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  logoutButtonContainer: {
    position: 'absolute',
    top: 30,
    right: 20,
    width: '30%',
    zIndex: 1,
  },
  hikeButtons: {
    marginVertical: 5,
    marginHorizontal: 20,
  },
  backIcon: {
    position: 'absolute',
    top: 30,
    left: 30,
    zIndex: 1,
  },
  sosButtonContainer: {
    position: 'absolute',
    top: 25,
    right: 25,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  sosButton: {
    backgroundColor: '#ff0000',
    borderRadius: 50,
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  sosButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    gap: 20,
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmationText: {
    color: 'white',
    fontSize: 30,
    padding: 10,
    textAlign: 'center',
    marginTop: 10,
    backgroundColor: 'blue',
    borderRadius: 0,
  },
  confirmationTextView: {
    position: 'absolute',
    top: 250,
    left: 12,
    width: '95%',
    borderRadius: 0,
  },
  confirmationFavouriteView: {
    position: 'absolute',
    top: 175,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    left: 35,
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    gap: 30,
  }
});


