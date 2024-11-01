import React, { useState } from 'react';
import { Text, View, ActivityIndicator, StyleSheet, Button, TextInput, GestureResponderEvent, ImageBackground, Alert } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useUserContext } from '../userContext';
const Mountain = require("../../assets/images/mountain.jpg");
import { User } from "@/constants/UserObject";

export default function Login() {
    interface LoginResponse {
        token: string;
        user: User;
    }

    const navigation = useNavigation();
    const { dispatch } = useUserContext();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: GestureResponderEvent): Promise<void> {
        event.preventDefault();
        setLoading(true); 

        try {
            const response = await fetch('https://stingray-app-ewlud.ondigitalocean.app/user/login', {
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
                      timestamp: Date.now(),
                    },
                  });
                
                navigation.navigate('index' as never);
            } else {
                Alert.alert("Login failed: Invalid username or password.");
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert("Login failed: " + error.message);
            } else {
                Alert.alert("Login failed: An unknown error occurred.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <ImageBackground 
            source={Mountain} 
            style={styles.container}
        >
            <View style={styles.overlay}>
                {loading ? <ActivityIndicator size="large" color="#ffffff" /> : null} 
                <Text style={styles.title}>HikeSense</Text>
                <Text style={styles.subtitle}>Log in</Text>
                <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername} 
                    placeholder="@Email"
                    placeholderTextColor="#cccccc" 
                />

                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword} 
                    placeholder="Password"
                    secureTextEntry 
                    placeholderTextColor="#cccccc" 
                />

                <View style={styles.loginbutton}>
                    <Button title="Submit" onPress={handleSubmit} color="green" />
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        width: '100%', 
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#ffffff", 
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 20,
        color: "#ffffff", 
        marginBottom: 20,
    },
    input: {
        width: '80%', 
        borderWidth: 1,
        borderColor: '#ffffff', 
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        color: "#ffffff", 
    },
    container: {
        flex: 1,
    },
    loginbutton: {
        backgroundColor: 'green', 
        color: '#ffffff', 
        padding: 10,
        borderRadius: 5,
        width: '50%', 
        textAlign: 'center', 
    },
});
