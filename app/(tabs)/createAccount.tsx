import { useContext, useState } from "react";
import { Text, View, ActivityIndicator, StyleSheet, Button, TextInput, GestureResponderEvent, ImageBackground } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useUserContext } from '../userContext';
const Hikers = require("../../assets/images/hikers.jpg");
import { User } from "@/constants/UserObject";

export default function CreateAccount() {

    interface LoginResponse {
        token: string;
        user: User;
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
        <ImageBackground 
            source={Hikers} 
            style={styles.container}
        >
            <View style={styles.overlay}>
                {loading && <ActivityIndicator size="large" color="#0000ff" />}
                <Text style={styles.title}>HikeSense</Text>
                <Text style={styles.subtitle}>Create Account</Text>
                
                <TextInput
                    style={styles.input}
                    value={username}
                    onChangeText={setUsername} 
                    placeholder="Enter your email"
                    placeholderTextColor="#cccccc" 
                />
                
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword} 
                    placeholder="Enter your password"
                    secureTextEntry 
                    placeholderTextColor="#cccccc" 
                />

                <TextInput
                    style={styles.input}
                    value={repeatPassword}
                    onChangeText={setRepeatPassword} 
                    placeholder="Repeat your password"
                    secureTextEntry 
                    placeholderTextColor="#cccccc" 
                />

                <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName} 
                    placeholder="Enter your first name"
                    placeholderTextColor="#cccccc" 
                />

                <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName} 
                    placeholder="Enter your last name"
                    placeholderTextColor="#cccccc" 
                />
                
                <Button title="Submit" onPress={handleSubmit} color="green" />
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
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.7)', 
        width: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: "#ffffff", 
    },
    subtitle: {
        fontSize: 20,
        color: "#ffffff", 
        marginBottom: 20,
    },
    input: {
        width: '100%',
        padding: 8,
        borderWidth: 1,
        borderColor: '#ffffff', 
        borderRadius: 4,
        marginBottom: 16,
        color: "#ffffff", 
    },
});
