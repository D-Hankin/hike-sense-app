import { Tabs } from 'expo-router';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { UserProvider } from '../userContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <UserProvider>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="createAccount"
        options={{
          title: 'Create Account',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <TabBarIcon name={focused ? 'people' : 'people-outline'} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='login'
        options={{
          title: 'Login',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <TabBarIcon name={focused ? 'log-in' : 'log-in-outline'} color={color} />
          ),
        }}
      />
    </Tabs>
    </UserProvider>
  );
}
