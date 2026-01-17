/**
 * Navigation Types
 *
 * Type definitions for React Navigation in the Momentum application.
 * Defines all screens, navigators, and navigation params.
 */

/**
 * Root stack navigator param list
 */
export type RootStackParamList = {
  // Main tabs
  Main: undefined;
  // Onboarding
  Onboarding: undefined;
  // Detail screens
  TaskDetail: { taskId: string };
  ContextDetail: { contextId: string };
  ActionDetail: { actionId: string };
};

/**
 * Main tab navigator param list
 */
export type MainTabParamList = {
  Home: undefined;
  Tasks: undefined;
  Contexts: undefined;
  Profile: undefined;
};

/**
 * Task stack navigator param list
 */
export type TaskStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: string };
  TaskCreate: { contextId?: string };
  TaskEdit: { taskId: string };
};

/**
 * Context stack navigator param list
 */
export type ContextStackParamList = {
  ContextList: undefined;
  ContextDetail: { contextId: string };
  ContextCapture: { source?: 'screenshot' | 'chat' | 'voice' | 'location' };
};

/**
 * Navigation utility types
 */
export type NavigationProp<
  NavigatorName extends keyof RootStackParamList
> = {
  navigate: (
    screen: NavigatorName,
    params?: RootStackParamList[NavigatorName]
  ) => void;
  goBack: () => void;
  reset: (state: {
    index: number;
    routes: { name: NavigatorName; params?: RootStackParamList[NavigatorName] }[];
  }) => void;
};

/**
 * Route prop type for typed navigation
 */
export type RouteProp<
  NavigatorName extends keyof RootStackParamList
> = {
  name: NavigatorName;
  params?: RootStackParamList[NavigatorName];
};
