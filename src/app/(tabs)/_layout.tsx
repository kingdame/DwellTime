/**
 * Tabs Layout
 * Bottom tab navigation for main app screens
 */

import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

import { useUIStore } from '@/shared/stores/uiStore';
import { colors, typography } from '@/constants';

// Simple icon component (will be replaced with proper icons later)
function TabIcon({
  name,
  focused,
  color,
}: {
  name: string;
  focused: boolean;
  color: string;
}) {
  const iconMap: Record<string, string> = {
    home: focused ? '●' : '○',
    facilities: focused ? '■' : '□',
    history: focused ? '◆' : '◇',
    profile: focused ? '▲' : '△',
  };

  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.icon, { color }]}>{iconMap[name] || '○'}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const theme = useUIStore((state) => state.theme);
  const isDark = theme === 'dark';

  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: themeColors.card,
          borderTopColor: themeColors.divider,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: colors.timer,
        tabBarInactiveTintColor: themeColors.textSecondary,
        tabBarLabelStyle: {
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.medium as '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="home" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="facilities"
        options={{
          title: 'Facilities',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="facilities" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="history" focused={focused} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name="profile" focused={focused} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
});
