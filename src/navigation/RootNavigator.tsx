/**
 * Root Navigator
 *
 * Main navigation structure for the Momentum application.
 * Uses React Navigation with stack and tab navigators.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from 'react-native-vector-icons';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type {
  BottomTabNavigationProp,
  BottomTabScreenProps,
} from '@react-navigation/bottom-tabs';
import type { RootStackParamList, MainTabParamList } from './types';
import { HomeScreen } from '@/features/home/screens/HomeScreen';
import { ContextDetailScreen } from '@/features/home/screens/ContextDetailScreen';
import { TaskListScreen } from '@/features/work/screens/TaskListScreen';
import { EmptyState } from '@/shared/components';

/**
 * Create stack navigator
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Create tab navigator
 */
const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * Placeholder ContextsScreen
 * TODO: Implement contexts list screen
 */
const ContextsScreen: React.FC = () => {
  return <EmptyState title="Coming Soon" description="Context list screen" />;
};

/**
 * Placeholder ProfileScreen
 * TODO: Implement profile screen
 */
const ProfileScreen: React.FC = () => {
  return <EmptyState title="Coming Soon" description="Profile screen" />;
};

/**
 * Get tab icon for route
 */
const getTabIcon = (
  routeName: keyof MainTabParamList,
  focused: boolean
): React.ComponentProps<typeof MaterialCommunityIcons>['name'] => {
  switch (routeName) {
    case 'Home':
      return focused ? 'home' : 'home-outline';
    case 'Tasks':
      return focused ? 'checkbox-marked-circle' : 'checkbox-marked-circle-outline';
    case 'Contexts':
      return focused ? 'view-list' : 'view-list-outline';
    case 'Profile':
      return focused ? 'account' : 'account-outline';
    default:
      return 'help-circle';
  }
};

/**
 * Main tabs component
 * Shows bottom tab navigation for primary app sections
 */
const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const iconName = getTabIcon(route.name, focused);
          return (
            <MaterialCommunityIcons
              name={iconName}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: '#6200EE',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: {
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TaskListScreen}
        options={{
          tabBarLabel: 'Tasks',
        }}
      />
      <Tab.Screen
        name="Contexts"
        component={ContextsScreen}
        options={{
          tabBarLabel: 'Contexts',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

/**
 * Root Navigator component
 * Main navigation structure with stack navigation
 */
const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#6200EE',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ContextDetail"
          component={ContextDetailScreen}
          options={{
            title: 'Context Detail',
          }}
        />
        <Stack.Screen
          name="TaskDetail"
          component={EmptyState as React.ComponentType<any>}
          options={{
            title: 'Task Detail',
          }}
        />
        <Stack.Screen
          name="ActionDetail"
          component={EmptyState as React.ComponentType<any>}
          options={{
            title: 'Action Detail',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;

/**
 * Navigation prop types for screens
 */
export type MainTabNavigationProp<T extends keyof MainTabParamList> =
  BottomTabNavigationProp<MainTabParamList, T>;

export type MainTabRouteProp<T extends keyof MainTabParamList> = RouteProp<
  MainTabParamList,
  T
>;

export type RootStackNavigationProp<T extends keyof RootStackParamList> =
  NativeStackNavigationProp<RootStackParamList, T>;

export type RootStackRouteProp<T extends keyof RootStackParamList> = RouteProp<
  RootStackParamList,
  T
>;
