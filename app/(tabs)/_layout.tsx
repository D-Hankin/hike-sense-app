import React from 'react';
import { Tabs } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserContext, UserProvider } from '../userContext';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { HeartRateProvider } from '../heartRateContext';
import { User } from '@/constants/UserObject';

export default function TabLayout() {
  return (
    <UserProvider>
      <HeartRateProvider>
        <InnerTabLayout />
      </HeartRateProvider>
    </UserProvider>
  );
}

function InnerTabLayout() {
  const colorScheme = useColorScheme();
  const { state } = useUserContext();
  const user: User | null = state.user !== null ? (state.user as User) : null;

  // Render tabs for unauthenticated users
  if (user === null) {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="createAccount"
          options={{
            title: "Create Account",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'people' : 'people-outline'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="login"
          options={{
            title: "Login",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'log-in' : 'log-in-outline'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="heartRate"
          options={{
            title: "Heart Rate",
            tabBarIcon: ({ color }) => (
              <FontAwesome name="heartbeat" size={24} color={color} />
            ),
            href:null // Unwanted for unauthenticated users
          }}
        />
        <Tabs.Screen
          name="hikes"
          options={{
            title: "Hikes",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'map' : 'map-outline'} color={color} />
            ),
            href:null // Unwanted for unauthenticated users
          }}
        />
        <Tabs.Screen
          name="hikeBuddy"
          options={{
            title: "Hike Buddy",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'people' : 'people-outline'} color={color} />
            ),
            href: null // Unwanted for unauthenticated users
          }}
        />
      </Tabs>
    );
  }

  if (user !== null && user.subscriptionStatus.includes('premium')) {

    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="createAccount"
          options={{
            title: "Create Account",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'people' : 'people-outline'} color={color} />
            ),
            href: null
          }}
        />
        <Tabs.Screen
          name="login"
          options={{
            title: "Login",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'log-in' : 'log-in-outline'} color={color} />
            ),
            href: null
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="hikes"
          options={{
            title: "Hikes",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'map' : 'map-outline'} color={color} />
            ),
            href:"/hikes" // Show for authenticated users
          }}
        />
        <Tabs.Screen
          name="heartRate"
          options={{
            title: "Heart Rate",
            tabBarIcon: ({ color }) => (
              <FontAwesome name="heartbeat" size={24} color={color} />
            ),
            href:"/heartRate" // Show for authenticated users
          }}
        />
        <Tabs.Screen
          name="hikeBuddy"
          options={{
            title: "Hike Buddy",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'people' : 'people-outline'} color={color} />
            ),
            href:"/hikeBuddy" // Show for authenticated users
            }}
        />
      </Tabs>
    );
  } else {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="createAccount"
          options={{
            title: "Create Account",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'people' : 'people-outline'} color={color} />
            ),
            href: null
          }}
        />
        <Tabs.Screen
          name="login"
          options={{
            title: "Login",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'log-in' : 'log-in-outline'} color={color} />
            ),
            href: null
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="hikes"
          options={{
            title: "Hikes",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'map' : 'map-outline'} color={color} />
            ),
            href:"/hikes" // Show for authenticated users
          }}
        />
        <Tabs.Screen
          name="heartRate"
          options={{
            title: "Heart Rate",
            tabBarIcon: ({ color }) => (
              <FontAwesome name="heartbeat" size={24} color={color} />
            ),
            href:"/heartRate" // Show for authenticated users
          }}
        />
        <Tabs.Screen
          name="hikeBuddy"
          options={{
            title: "Hike Buddy",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name={focused ? 'people' : 'people-outline'} color={color} />
            ),
            href:null // Show for authenticated users
            }}
        />
      </Tabs>
    );
  }

}
