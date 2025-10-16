import { Tabs } from 'expo-router';
import React from 'react';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primaryBackgroundColor,
        tabBarInactiveTintColor: Colors.text.tertiary,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) =>
            <IconSymbol size={28} name={focused ? "house.fill" : "house"} color={color} weight={focused ? 'bold' : 'regular'} />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, focused }) =>
            <IconSymbol size={28} name={focused ? "message.fill" : "message"} color={color} weight={focused ? 'bold' : 'regular'} />,
        }}
      />
      <Tabs.Screen
        name="(setting)"
        options={{
          title: 'Setting',
          tabBarIcon: ({ color, focused }) =>
            <IconSymbol size={28} name={focused ? "gearshape.fill" : "gearshape"} color={color} weight={focused ? 'bold' : 'regular'} />,
        }}
      />

    </Tabs>


  );
}
