import React, { useEffect, useState } from 'react';
import { Text, View, PermissionsAndroid } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { Buffer } from 'buffer'; // Make sure to import Buffer

const manager = new BleManager();

export default function HeartRate() {
  const [heartRate, setHeartRate] = useState<number | null>(null);

  const requestPermissions = async () => {
    const permissions = [
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE
    ];

        const granted = await PermissionsAndroid.requestMultiple(permissions);
        return permissions.every(permission => granted[permission] === PermissionsAndroid.RESULTS.GRANTED);
    };

    useEffect(() => {
        console.log('Starting scan...');
        console.log('Starting scan.........');
        startScan();
        
        return () => {
            manager.stopDeviceScan();
            manager.destroy();
        };
    }, []);

    const startScan = async () => {
    const hasPermission = await requestPermissions();
    console.log('Has permission:', hasPermission);
    if (!hasPermission) return;

    manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
        console.error(error);
        return;
        }

        if (device && device.name === 'HikeSenseBLE') {
        manager.stopDeviceScan();
        
        manager.connectToDevice(device.id)
            .then((device) => {
            console.log('Connected to', device.name);
            return device.discoverAllServicesAndCharacteristics();
            })
            .then((device) => {
            const heartRateCharacteristic = '87654321-4321-6789-4321-0fedcba98765';
            const heartRateService = '12345678-1234-5678-1234-56789abcdef0';
            
            device.monitorCharacteristicForService(
                heartRateService,
                heartRateCharacteristic,
                (error, characteristic) => {
                if (error) {
                    console.error('Monitoring error:', error);
                    return;
                }
                if (characteristic && characteristic.value) {
                    const data = characteristic.value;
                    console.log('Raw data:', data); // Log the raw data

                    // Decode base64 string and parse JSON
                    const jsonString = Buffer.from(data, 'base64').toString('utf-8');
                    console.log('JSON String:', jsonString); // Log the JSON string

                    try {
                    const parsedData = JSON.parse(jsonString);
                    setHeartRate(parsedData.pulse); // Update state with pulse value
                    } catch (error) {
                    console.error('Error parsing JSON:', error);
                    }
                }
                }
            );
            })
            .catch((error) => {
            console.error('Connection error:', error);
            });
        }
    });
    };

  return (
    <View>
      <Text>Heart Rate: {heartRate !== null ? heartRate : 'Loading...'}</Text>
    </View>
  );
}
