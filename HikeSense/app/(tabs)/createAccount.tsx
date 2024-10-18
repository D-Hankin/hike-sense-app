import { useContext, useState } from "react";
import { Text, View, ActivityIndicator, StyleSheet, Button, TextInput, GestureResponderEvent } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useUserContext } from '../userContext';

export default function CreateAccount() {

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
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [repeatPassword, setRepeatPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const createAccount = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://goldfish-app-lmlas.ondigitalocean.app/create-account', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    username, 
                    password, 
                    firstName, 
                    lastName 
                })
            });

            const userData: LoginResponse = await response.json();
            const { token, user } = userData;

            if (user) {

                dispatch({ type: 'SET_USER', payload: userData.user }); 
                dispatch({
                    type: 'SET_TOKEN',
                    payload: {
                      token: userData.token,
                      timestamp: Date.now(),
                    },
                  });

                navigation.navigate('index' as never);
            }
        } catch (error) {
            console.error("Error creating account: ", error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleSubmit = (event: GestureResponderEvent) => {
        event.preventDefault();
        if (password.trim() === "" || username.trim() === "" || firstName.trim() === "" || lastName.trim() === "") {
            alert("Please fill out all fields");
            return;
        } else if (!emailCheck(username)) {
            alert("Not a valid email address");
            return;
        } else if (password !== repeatPassword || password.trim() === "") {
            alert("Passwords do not match");
            return;
        } else if (password.length < 8) {
            alert("Password must be at least 8 characters");
            return;
        } else {
            createAccount();
        }
    };
  
    const emailCheck = (username: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(username);
    };

    return (
        <View style={styles.container}>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            <Text style={styles.title}>HikeSense</Text>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.label}>Email</Text>
            <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername} 
                placeholder="Enter your email"
            />
        
            <Text style={styles.label}>Password</Text>
            <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword} 
                placeholder="Enter your password"
                secureTextEntry 
            />

            <Text style={styles.label}>Repeat Password</Text>
            <TextInput
                style={styles.input}
                value={repeatPassword}
                onChangeText={setRepeatPassword} 
                placeholder="Repeat your password"
                secureTextEntry 
            />

            <Text style={styles.label}>First Name</Text>
            <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName} 
                placeholder="Enter your first name"
            />

            <Text style={styles.label}>Last Name</Text>
            <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName} 
                placeholder="Enter your last name"
            />
            
            <Button title="Submit" onPress={handleSubmit} />
        </View>
    );
}
    
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
    },
    input: {
        width: '100%',
        padding: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        marginBottom: 16,
    },
});
