/**
 * Home Screen
 *
 * Main screen of the Momentum application.
 * Displays context capture options and recent contexts.
 */

import React, { useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  RefreshControl,
  FlatList,
} from 'react-native';
import {
  Text,
  Appbar,
  FAB,
  Card,
  IconButton,
  useTheme,
  Divider,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useContextStore } from '@/store/contextStore';
import { ContextCard } from '@/shared/components';
import { Context, ContextSource } from '@/shared/models';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

/**
 * Context capture button configuration
 */
interface CaptureOption {
  key: ContextSource;
  label: string;
  icon: string;
  description: string;
}

const CAPTURE_OPTIONS: CaptureOption[] = [
  {
    key: 'screenshot',
    label: 'Screenshot',
    icon: 'screenshot',
    description: 'Capture and analyze from screenshots',
  },
  {
    key: 'chat',
    label: 'Chat',
    icon: 'message-text',
    description: 'Extract context from messages',
  },
  {
    key: 'voice',
    label: 'Voice',
    icon: 'microphone',
    description: 'Record and transcribe voice notes',
  },
  {
    key: 'manual',
    label: 'Manual',
    icon: 'pencil',
    description: 'Create context manually',
  },
];

/**
 * HomeScreen component
 *
 * @example
 * ```tsx
 * <HomeScreen navigation={navigation} route={route} />
 * ```
 */
export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const {
    contexts,
    isLoading,
    error,
    loadContexts,
    addContext,
    deleteContext,
    setSelectedContext,
    clearError,
  } = useContextStore();

  // Load contexts on mount
  useEffect(() => {
    loadContexts();
  }, [loadContexts]);

  // Handle context card press
  const handleContextPress = useCallback(
    (context: Context) => {
      setSelectedContext(context);
      navigation.navigate('ContextDetail', { contextId: context.id });
    },
    [navigation, setSelectedContext]
  );

  // Handle context delete
  const handleContextDelete = useCallback(
    async (contextId: string) => {
      try {
        await deleteContext(contextId);
      } catch (err) {
        console.error('Failed to delete context:', err);
      }
    },
    [deleteContext]
  );

  // Handle capture option press
  const handleCapturePress = useCallback(
    (source: ContextSource) => {
      // TODO: Implement context capture for each source
      console.log('Capture from:', source);
      // For now, just add a mock context
      addContext({
        source: 'manual',
        content: `Test context from ${source}`,
        timestamp: Date.now(),
      });
    },
    [addContext]
  );

  // Handle refresh
  const handleRefresh = useCallback(() => {
    loadContexts();
  }, [loadContexts]);

  // Render context item
  const renderContextItem = useCallback(
    ({ item }: { item: Context }) => (
      <ContextCard
        context={item}
        onPress={() => handleContextPress(item)}
        onDelete={() => handleContextDelete(item.id)}
        showEntities={true}
      />
    ),
    [handleContextPress, handleContextDelete]
  );

  // List header with capture options
  const ListHeader = useCallback(
    () => (
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.headerTitle}>
          Capture Context
        </Text>
        <View style={styles.captureOptions}>
          {CAPTURE_OPTIONS.map((option) => (
            <Card
              key={option.key}
              style={styles.captureCard}
              onPress={() => handleCapturePress(option.key)}
              mode="elevated"
            >
              <Card.Content style={styles.captureCardContent}>
                <IconButton
                  icon={option.icon}
                  size={32}
                  style={styles.captureIcon}
                />
                <Text variant="titleMedium" style={styles.captureLabel}>
                  {option.label}
                </Text>
                <Text
                  variant="bodySmall"
                  style={styles.captureDescription}
                  numberOfLines={2}
                >
                  {option.description}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </View>

        <Divider style={styles.divider} />

        <Text variant="headlineSmall" style={styles.headerTitle}>
          Recent Contexts
        </Text>
      </View>
    ),
    [theme, handleCapturePress]
  );

  // Empty state
  const ListEmptyComponent = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <Text variant="bodyLarge" style={styles.emptyText}>
          No contexts yet. Start by capturing one!
        </Text>
      </View>
    ),
    []
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Appbar.Header>
        <Appbar.Content title="Momentum" />
        <Appbar.Action icon="cog" onPress={() => {}} />
      </Appbar.Header>

      <FlatList
        data={contexts}
        renderItem={renderContextItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={!isLoading ? ListEmptyComponent : null}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
      />

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => handleCapturePress('manual')}
        label="Add"
      />
    </View>
  );
};

HomeScreen.displayName = 'HomeScreen';

/**
 * Styles for HomeScreen component
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  headerTitle: {
    marginBottom: 16,
  },
  captureOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  captureCard: {
    width: '50%',
    margin: 8,
  },
  captureCardContent: {
    alignItems: 'center',
    padding: 16,
  },
  captureIcon: {
    margin: 0,
  },
  captureLabel: {
    marginTop: 8,
    textAlign: 'center',
  },
  captureDescription: {
    textAlign: 'center',
    marginTop: 4,
  },
  divider: {
    marginTop: 24,
    marginBottom: 16,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
