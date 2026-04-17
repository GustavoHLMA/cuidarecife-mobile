import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

const PilulaIcon = require('@/assets/images/pilula.svg');
const PlusIcon = require('@/assets/images/plus.svg');
const CuidadoIcon = require('@/assets/images/cuidado.svg');

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[(colorScheme as 'light' | 'dark') ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        name="medicamentos"
        options={{
          title: 'MEDICAÇÃO',
          tabBarAccessibilityLabel: 'Aba de Medicação',
          tabBarIcon: ({ color }: { color: string }) => <Image source={PilulaIcon} style={{ width: 28, height: 28, tintColor: color }} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'SAÚDE',
          tabBarAccessibilityLabel: 'Aba de Saúde e Informações',
          tabBarIcon: ({ color }: { color: string }) => <Image source={PlusIcon} style={{ width: 28, height: 28, tintColor: color }} />,
        }}
      />
      <Tabs.Screen
        name="cuidados"
        options={{
          title: 'CUIDADOS',
          tabBarAccessibilityLabel: 'Aba de Cuidados Pessoais',
          tabBarIcon: ({ color }: { color: string }) => <Image source={CuidadoIcon} style={{ width: 28, height: 28, tintColor: color }} />,
        }}
      />
    
    </Tabs>
  );
}
