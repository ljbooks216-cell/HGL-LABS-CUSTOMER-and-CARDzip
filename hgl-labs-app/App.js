import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import CustomerEntryScreen from './screens/CustomerEntryScreen';
import CardGeneratorScreen from './screens/CardGeneratorScreen';
import RecordsScreen from './screens/RecordsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Customers') {
              iconName = focused ? 'people' : 'people-outline';
            } else if (route.name === 'Card') {
              iconName = focused ? 'card' : 'card-outline';
            } else if (route.name === 'Records') {
              iconName = focused ? 'list' : 'list-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#b8860b',
          tabBarInactiveTintColor: 'gray',
          headerStyle: { backgroundColor: '#b8860b' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        })}
      >
        <Tab.Screen 
          name="Customers" 
          component={CustomerEntryScreen}
          options={{ title: 'Customer Entry' }}
        />
        <Tab.Screen 
          name="Card" 
          component={CardGeneratorScreen}
          options={{ title: 'Generate Card' }}
        />
        <Tab.Screen 
          name="Records" 
          component={RecordsScreen}
          options={{ title: 'View Records' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
