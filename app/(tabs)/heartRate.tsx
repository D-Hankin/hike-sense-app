import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Text, View, PermissionsAndroid, Platform, Dimensions, ScrollView, ImageBackground, Button } from 'react-native';
import { BleManager, Device, Characteristic, BleError } from 'react-native-ble-plx';
import * as ExpoDevice from 'expo-device';
import { LineChart } from 'react-native-chart-kit';
import base64 from 'react-native-base64';
import { StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUserContext } from '../userContext';
import { useHeartRateContext } from '../heartRateContext'; // Import your HeartRateContext
import * as Location from 'expo-location';

const Hikers = require("../../assets/images/hikers.jpg");
const HEART_RATE_UUID = "abcdefab-1234-5678-1234-56789abcdef0";
const HEART_RATE_CHARACTERISTIC = "abcdefab-4321-5678-1234-56789abcdef0";

export default function HeartRate() {
    const [heartRate, setHeartRate] = useState<number>(0);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [device, setDevice] = useState<Device | null>(null);
    const bleManager = useMemo(() => new BleManager(), []);
    const navigation = useNavigation();
    const { dispatch, state: { user, token } } = useUserContext();
    const { heartRateHistory, addHeartRate } = useHeartRateContext(); // Access heartRateHistory and addHeartRate from context
    const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const lastAlertSent = useRef<number>(0);

    const requestPermissions = async () => {
        if (Platform.OS === "android") {
            if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
                const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } else {
                const bluetoothScanPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);
                const bluetoothConnectPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);
                const fineLocationPermission = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
                return bluetoothScanPermission === 'granted' && bluetoothConnectPermission === 'granted' && fineLocationPermission === 'granted';
            }
        } else {
            return true; 
        }
    };

    const scanForPeripherals = () => {
        bleManager.startDeviceScan(null, null, (error, foundDevice) => {
            if (error) {
                console.error("Scan error:", error);
                return;
            }
            if (foundDevice && foundDevice.name === 'HikeSenseBLE') {
                bleManager.stopDeviceScan();
                setDevice(foundDevice);
                connectToDevice(foundDevice);
            }
        });
    };

    const connectToDevice = async (device: Device) => {
        try {
            console.log("Connecting to device...");
            const connectedDevice = await bleManager.connectToDevice(device.id);
            console.log("Successfully connected to:", connectedDevice.id);
            setIsConnected(true);

            await connectedDevice.discoverAllServicesAndCharacteristics();
            console.log("Services and Characteristics discovered for device:", connectedDevice.id);

            startStreamingData(connectedDevice);
        } catch (error) {
            console.error("Connection error:", error);
            setIsConnected(false);
        }
    };

    const startStreamingData = (device: Device) => {
        device.monitorCharacteristicForService(
            HEART_RATE_UUID,
            HEART_RATE_CHARACTERISTIC,
            onHeartRateUpdate
        );
        console.log("Monitoring started for heart rate characteristic.");
    };

    const onHeartRateUpdate = (error: BleError | null, characteristic: Characteristic | null) => {
        if (error) {
            console.error("Monitoring error:", error);
            return;
        }
        if (!characteristic?.value) {
            console.log("No data received");
            return;
        }

        const rawData = base64.decode(characteristic.value);
        const byteArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; i++) {
            byteArray[i] = rawData.charCodeAt(i);
        }
        const heartRateValue = (byteArray[1] << 8) | byteArray[0];
        console.log("Heart Rate Value:", heartRateValue);

        setHeartRate(heartRateValue);
        addHeartRate(heartRateValue); // Add heart rate to context

    };

    useEffect(() => {
        const initializeBLE = async () => {
            const hasPermission = await requestPermissions();
            if (hasPermission) {
                scanForPeripherals();
            } else {
                console.error("Bluetooth permissions not granted.");
            }
        };

        initializeBLE();

        return () => {
            if (isConnected && device) {
                bleManager.cancelDeviceConnection(device.id).catch(error => {
                    console.error("Error disconnecting device during cleanup:", error);
                });
            }
            bleManager.stopDeviceScan();
        };
    }, [device, isConnected]);

    useEffect(() => {
        setLocation()
        if (heartRateHistory.length >= 5) {
            const lastFiveValues = heartRateHistory.slice(-5);
            
            const allAbove200 = lastFiveValues.every(value => value > 200);
            const allBelow40 = lastFiveValues.every(value => value < 40);
    
            if (allAbove200) {
                sendHeartRateAlert("Heart rate above 200 bpm");
            } else if (allBelow40) {
                sendHeartRateAlert("Heart rate below 40 bpm");
            }
        }
    }, [heartRateHistory]);

    const setLocation = async () => {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setCurrentLocation({ latitude, longitude });
    }

    const sendHeartRateAlert = async (message: string) => {
        const now = Date.now(); // Current timestamp in milliseconds
        console.log("lastAlertSent: ", lastAlertSent);
        console.log("difference: ", now - lastAlertSent.current);
        // Check if 10 minutes (600,000 ms) have passed since the last alert
        if (now - lastAlertSent.current < 600000) {
            console.log("Alert already sent recently. Waiting 10 minutes before next alert.");
            return;
        }
    
        console.log("Sending alert for abnormal heart rate...");
        
        try {
            const response = await fetch('https://stingray-app-ewlud.ondigitalocean.app/alert/send-alert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    "message": message,
                    "location": currentLocation,
                    "time": new Date().toISOString()
                }),
            });
    
            if (!response.ok) {
                console.error("Error sending alert:", response.statusText);
                return;
            }
    
            const data = await response.text();
            console.log("Alert sent:", data);
            
            // Update the last alert sent time to now
            lastAlertSent.current = now;
        } catch (error) {
            console.error("Error sending alert:", error);
        }
    };
    
    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        navigation.navigate('index' as never);
    };

    return (
        <ImageBackground 
            source={Hikers} 
            style={styles.container}
        >
            <View style={styles.logoutButtonContainer}>
                <Button title="Logout" onPress={handleLogout} color="#ff0000" />
            </View>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.dataText}>Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</Text>
                <View style={styles.header}>
                    <Text style={styles.title}>Heart Rate Monitor</Text>
                    <Text style={styles.subtitle}>Stay in Tune with Your Heart</Text>
                </View>
                <Text style={styles.dataText}>Heart Rate: {heartRate ? `${heartRate} bpm` : 'Loading...'}</Text>
                {heartRateHistory.length > 0 && (
                   <LineChart
                        data={{
                            labels: Array.from(
                                { length: heartRateHistory.slice(-15).length }, 
                                (_, i) => `${i + 1}`
                            ),
                            datasets: [{ data: heartRateHistory.slice(-15) }], // Only the last 30 data points
                        }}
                        width={Dimensions.get("window").width - 40}
                        height={300}
                        chartConfig={{
                            backgroundColor: "#022173",
                            backgroundGradientFrom: "#1e3c72",
                            backgroundGradientTo: "#2a5298",
                            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            style: {
                                borderRadius: 16,
                            },
                            propsForDots: {
                                r: "6",
                                strokeWidth: "2",
                                stroke: "#ffa726",
                            },
                            formatYLabel: (value) => {
                                return value.split('.')[0]; // Keep everything before the decimal
                            },
                            formatXLabel: (value) => {
                                value = ""
                                return "";
                            }
                        }}
                        style={{
                            marginVertical: 8,
                            marginTop: 5,
                            borderRadius: 16,
                        }}
                        yAxisInterval={1} // Set interval to 1 to reduce ticks on y-axis
                    />
                )}
            </ScrollView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        padding: 20,
        flexGrow: 1, // Allow ScrollView to take full height
        justifyContent: 'center', // Center content vertically
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark grey with transparency
        borderRadius: 20, // Rounded corners for the form
        width: '100%', // Take up 90% of the screen width
    },
    header: {
        alignItems: 'center', // Center header content
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 18,
        color: '#ffffff',
        textAlign: 'center',
    },
    dataText: {
        fontSize: 18,
        marginBottom: 10,
        color: '#ffffff', // White text for data
    },
    logoutButtonContainer: {
        position: 'absolute',
        top: 40,
        right: 30,
        width: '30%', // Adjust width as needed
        zIndex: 1, // Ensure button is above other content
    },
});
