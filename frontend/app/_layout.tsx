import React, { useState } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../src/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from '../src/SplashScreen';

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.bgSecondary,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          },
          headerTitleStyle: {
            color: theme.colors.text,
            fontWeight: '800',
            fontSize: 18,
            letterSpacing: 0.5,
          },
          headerTintColor: theme.colors.text,
          tabBarStyle: {
            backgroundColor: theme.colors.bgSecondary,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            height: 64,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.textFaint,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
          sceneStyle: { backgroundColor: theme.colors.bg },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Resumen',
            headerTitle: 'COMPENSADOR HORARIO',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="stats-chart" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="clases"
          options={{
            title: 'Clases',
            headerTitle: 'REGISTRO DE CLASES',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="school" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="guardias"
          options={{
            title: 'Guardias',
            headerTitle: 'GUARDIAS / SERVICIOS',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="shield-checkmark" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="exportar"
          options={{
            title: 'Exportar',
            headerTitle: 'EXPORTAR TABLA',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-text" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="mas"
          options={{
            title: 'Más',
            headerTitle: 'AJUSTES Y BACKUP',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="ellipsis-horizontal-circle" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
    </SafeAreaProvider>
  );
}
