import { useState } from 'react';
import { Text, View, ActivityIndicator, StyleSheet, Button, TextInput, GestureResponderEvent } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useUserContext } from '../userContext';

export default function Login() {
    interface LoginResponse {
        token: string;
        user: User;
    }

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

    const navigation = useNavigation();
    const { dispatch } = useUserContext();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: GestureResponderEvent): Promise<void> {
        event.preventDefault();
        setLoading(true); // Show loading indicator while processing

        try {
            const response = await fetch('https://goldfish-app-lmlas.ondigitalocean.app/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    username: username,
                    password: password,
                }),
            });

            const userData: LoginResponse = await response.json();

            if (userData.user) {

                dispatch({ type: 'SET_USER', payload: userData.user }); 
                dispatch({
                    type: 'SET_TOKEN',
                    payload: {
                      token: userData.token,
                      timestamp: Date.now(), // Get the current time
                    },
                  });
                
                navigation.navigate('index' as never);
            } else {
                console.error("Login failed: No user data returned.");
            }
        } catch (error) {
            console.error("Error logging in: ", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={styles.container}>
            {loading ? <ActivityIndicator size="large" color="#0000ff" /> : null} 
            <Text style={styles.title}>HikeSense</Text>
            <Text style={styles.title}>Log in</Text>
            <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername} 
                placeholder="@Email"
            />

            <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword} 
                placeholder="Password"
                secureTextEntry 
            />

            <Button title="Submit" onPress={handleSubmit} />
        </View>
    );
}

const styles = StyleSheet.create({
    label: {
        fontSize: 18,
        marginBottom: 5,
    },
    input: {
        width: '60%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
    },
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
});
