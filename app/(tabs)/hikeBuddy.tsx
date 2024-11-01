import React, { useEffect, useRef, useState } from 'react';
import { ImageBackground, Text, TextInput, Button, View, ScrollView, StyleSheet } from 'react-native';
import { useUserContext } from '../userContext';
import { User } from '@/constants/UserObject';
import { useNavigation } from 'expo-router';

const Hikers = require("../../assets/images/hikers.jpg");

interface Message {
  name: string;
  prompt: string;
}

export default function HikeBuddy() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const { state }: { state: {
    token: any; 
    user: User | null 
  }} = useUserContext();
  const navigation = useNavigation();
  const { dispatch } = useUserContext();
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (state.token) {
    const introduceMessage = async () => {
        const initialMessage = { name: state.user?.firstName || 'Guest', prompt: 'Introduce yourself.' };
        await sendMessageToAI(initialMessage);
    };
    introduceMessage();
  }
  }, [state.token]);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const sendMessageToAI = async (userMessage: Message) => {

    try {
        const response = await fetch('https://stingray-app-ewlud.ondigitalocean.app/hike-buddy/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${state.token}`,
            },
            body: JSON.stringify(userMessage),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data.choices[0].message) {
            const newMessage: Message = { name: 'Hike Buddy', prompt: data.choices[0].message.content};
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
    } catch (error) {
        console.error('Error fetching AI message:', error);
    } finally {
        setInputValue(''); 
    }
};

const handleSend = async () => {

    if (inputValue.trim() === '') return; 

    if (!state.user) {
        console.error('User is not logged in');
        return;
    }
    const newUserMessage: Message = { name: state.user.firstName, prompt: inputValue };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setInputValue(''); 
    await sendMessageToAI(newUserMessage); 
};

const handleLogout = () => {
  dispatch({ type: 'LOGOUT' });
  navigation.navigate('index' as never);
  setMessages([]);
};

  return (
    <ImageBackground source={Hikers} style={styles.image}>
      <View style={styles.logoutButtonContainer}>
        <Button title="Logout" onPress={handleLogout} color="#ff0000" />
      </View>
      <View style={styles.container}>
        <Text style={styles.header}>Hike Buddy Chat</Text>
        <ScrollView style={styles.chatContainer} contentContainerStyle={styles.chatContent} ref={scrollViewRef}>
          {messages.map((msg, index) => (
            <Text key={index} style={msg.name === state.user?.firstName ? styles.userMessage : styles.aiMessage}>
              {msg.prompt}
            </Text>
          ))}
        </ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputValue}
            onChangeText={setInputValue}
          />
          <Button title="Send" onPress={handleSend} />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "flex-start",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    top: 50,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#ffffff',
  },
  chatContainer: {
    flex: 1,
    marginBottom: 10,
  },
  chatContent: {
    padding: 10,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#d1e7dd',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  aiMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f8d7da',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
    maxWidth: '80%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    backgroundColor: 'gray',
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    color: '#ffffff',
  },
  logoutButtonContainer: {
    position: 'absolute',
    top: 30,
    right: 20,
    width: '30%',
    zIndex: 1,
  },
});

