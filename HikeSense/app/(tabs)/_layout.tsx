// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserContext, UserProvider } from '../userContext'; // Adjust path if necessary
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function TabLayout() {
  return (
    <UserProvider>
      <InnerTabLayout />
    </UserProvider>
  );
}

function InnerTabLayout() {
  const colorScheme = useColorScheme();
  const { state } = useUserContext(); // Access user state

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index" // Home Screen
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      
      {/* Only render Create Account and Login if user is not logged in */}
      {state.user === null && (
        <>
          <Tabs.Screen
            name="createAccount" // Create Account Screen
            options={{
              title: 'Create Account',
              tabBarIcon: ({ color, focused }) => (
                <TabBarIcon name={focused ? 'people' : 'people-outline'} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="login" // Login Screen
            options={{
              title: 'Login',
              tabBarIcon: ({ color, focused }) => (
                <TabBarIcon name={focused ? 'log-in' : 'log-in-outline'} color={color} />
              ),
            }}
          />
        </>
      )}

      {/* Only render Heart Rate if user is logged in */}
      {state.user && (
        <Tabs.Screen
          name="heartRate" // Heart Rate Screen
          options={{
            title: 'Heart Rate',
            tabBarIcon: ({ color }) => (
              <FontAwesome name="heartbeat" size={24} color={color} />
            ),
          }}
        />
      )}
    </Tabs>
  );
}
