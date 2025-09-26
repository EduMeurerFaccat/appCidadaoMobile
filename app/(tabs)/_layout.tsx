import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';

export default function AppLayout() {
  const { user } = useAuth();
  if (!user) return <Redirect href="/login" />;
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#1E88E5' }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Início', tabBarIcon: ({ color, size }) => (<Ionicons name="home" color={color} size={size} />) }}
      />
      <Tabs.Screen
        name="problemas-proximos"
        options={{ title: 'Próximos', tabBarIcon: ({ color, size }) => (<Ionicons name="map" color={color} size={size} />) }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: 'Perfil', tabBarIcon: ({ color, size }) => (<Ionicons name="person" color={color} size={size} />) }}
      />
    </Tabs>
  );
}
