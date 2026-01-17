/**
 * Context Detail Screen
 *
 * Displays full context information including entities and suggested actions.
 */

import React, { useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Appbar,
  Card,
  Chip,
  Divider,
  Button,
  useTheme,
  List,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useContextStore } from '@/store/contextStore';
import { Context } from '@/shared/models';
import { EntityChip, EmptyState, LoadingSpinner } from '@/shared/components';
import { formatDateTime } from '@/shared/utils/dateUtils';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ContextDetail'>;

/**
 * Get context source display info
 */
const getSourceInfo = (source: string) => {
  switch (source) {
    case 'screenshot':
      return { icon: 'image', label: 'Screenshot' };
    case 'chat':
      return { icon: 'message-text', label: 'Chat Message' };
    case 'location':
      return { icon: 'map-marker', label: 'Location' };
    case 'voice':
      return { icon: 'microphone', label: 'Voice Recording' };
    case 'manual':
      return { icon: 'pencil', label: 'Manual Entry' };
    default:
      return { icon: 'help-circle', label: 'Unknown' };
  }
};

/**
 * Get status color
 */
const getStatusColor = (status: string, theme: any): string => {
  switch (status) {
    case 'completed':
      return theme.colors.primary;
    case 'processing':
      return theme.colors.tertiary;
    case 'failed':
      return theme.colors.error;
    default:
      return theme.colors.surfaceVariant;
  }
};

/**
 * ContextDetailScreen component
 *
 * @example
 * ```tsx
 * <ContextDetailScreen navigation={navigation} route={route} />
 * ```
 */
export const ContextDetailScreen: React.FC<Props> = ({
  navigation,
  route,
}) => {
  const theme = useTheme();
  const { contextId } = route.params;
  const {
    selectedContext,
    isLoading,
    error,
    loadContext,
    deleteContext,
    updateContextStatus,
    clearError,
  } = useContextStore();

  // Load context on mount
  useEffect(() => {
    if (contextId) {
      loadContext(contextId);
    }
  }, [contextId, loadContext]);

  // Show error alert
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: clearError },
      ]);
    }
  }, [error, clearError]);

  // Handle delete
  const handleDelete = useCallback(() => {
    Alert.alert(
      'Delete Context',
      'Are you sure you want to delete this context?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteContext(contextId);
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', 'Failed to delete context');
            }
          },
        },
      ]
    );
  }, [contextId, deleteContext, navigation]);

  // Handle action execution
  const handleExecuteAction = useCallback(
    (actionType: string) => {
      // TODO: Implement action execution
      Alert.alert('Action', `Execute ${actionType} action`);
    },
    []
  );

  // Render content based on source
  const renderContent = useCallback(
    (context: Context) => {
      const { data } = context;

      switch (data.source) {
        case 'screenshot':
          return (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium">Extracted Text</Text>
                <Text variant="bodyMedium" style={styles.contentText}>
                  {data.extractedText || 'No text extracted'}
                </Text>
              </Card.Content>
            </Card>
          );

        case 'chat':
          return (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.chatHeader}>
                  <Text variant="titleMedium">{data.sender}</Text>
                  <Text variant="bodySmall" style={styles.platform}>
                    {data.platform}
                  </Text>
                </View>
                <Divider style={styles.divider} />
                <Text variant="bodyMedium" style={styles.contentText}>
                  {data.message}
                </Text>
              </Card.Content>
            </Card>
          );

        case 'location':
          return (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium">{data.locationName}</Text>
                <Text variant="bodyMedium">
                  {data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}
                </Text>
                {data.address && (
                  <>
                    <Divider style={styles.divider} />
                    <Text variant="bodySmall">
                      {data.address.street && `${data.address.street}, `}
                      {data.address.city && `${data.address.city}, `}
                      {data.address.country}
                    </Text>
                  </>
                )}
              </Card.Content>
            </Card>
          );

        case 'voice':
          return (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium">Transcript</Text>
                <Divider style={styles.divider} />
                <Text variant="bodyMedium" style={styles.contentText}>
                  {data.transcript}
                </Text>
                <Text variant="bodySmall" style={styles.duration}>
                  Duration: {Math.floor(data.duration / 60)}:
                  {Math.floor(data.duration % 60)
                    .toString()
                    .padStart(2, '0')}
                </Text>
              </Card.Content>
            </Card>
          );

        case 'manual':
          return (
            <Card style={styles.card}>
              <Card.Content>
                <Text variant="titleMedium">Content</Text>
                <Text variant="bodyMedium" style={styles.contentText}>
                  {data.content}
                </Text>
              </Card.Content>
            </Card>
          );

        default:
          return null;
      }
    },
    [theme]
  );

  // Render entities section
  const renderEntities = useCallback(
    (context: Context) => {
      if (!context.entities || context.entities.length === 0) {
        return (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium">Entities</Text>
              <Text variant="bodySmall" style={styles.noData}>
                No entities found
              </Text>
            </Card.Content>
          </Card>
        );
      }

      return (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Extracted Entities</Text>
            <View style={styles.entityContainer}>
              {context.entities.map((entity) => (
                <EntityChip key={entity.id} entity={entity} />
              ))}
            </View>
          </Card.Content>
        </Card>
      );
    },
    [theme]
  );

  // Render suggested actions
  const renderActions = useCallback(
    (context: Context) => {
      const actions = [
        {
          icon: 'calendar-plus',
          label: 'Add to Calendar',
          type: 'calendar',
        },
        {
          icon: 'checkbox-marked-circle-plus',
          label: 'Create Task',
          type: 'task',
        },
        {
          icon: 'tag-plus',
          label: 'Add to Wishlist',
          type: 'shopping',
        },
      ];

      return (
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Suggested Actions</Text>
            {actions.map((action) => (
              <Button
                key={action.type}
                mode="outlined"
                icon={action.icon}
                onPress={() => handleExecuteAction(action.type)}
                style={styles.actionButton}
              >
                {action.label}
              </Button>
            ))}
          </Card.Content>
        </Card>
      );
    },
    [handleExecuteAction, theme]
  );

  // Loading state
  if (isLoading && !selectedContext) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Context Detail" />
        </Appbar.Header>
        <LoadingSpinner message="Loading context..." size="large" />
      </View>
    );
  }

  // Empty state
  if (!selectedContext) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Context Detail" />
        </Appbar.Header>
        <EmptyState
          icon="file-question"
          title="Context not found"
          description="The requested context could not be found"
        />
      </View>
    );
  }

  const sourceInfo = getSourceInfo(selectedContext.data.source);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Context Detail" />
        <Appbar.Action icon="delete" onPress={handleDelete} />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        {/* Header card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <Text variant="headlineSmall">Context</Text>
                <View style={styles.metaRow}>
                  <List.Icon icon={sourceInfo.icon} size={20} />
                  <Text variant="bodyMedium">{sourceInfo.label}</Text>
                </View>
              </View>
              <Chip
                textStyle={styles.chipText}
                style={[
                  styles.statusChip,
                  { backgroundColor: getStatusColor(selectedContext.status, theme) },
                ]}
              >
                {selectedContext.status}
              </Chip>
            </View>
            <Text variant="bodySmall" style={styles.timestamp}>
              {formatDateTime(selectedContext.createdAt)}
            </Text>
          </Card.Content>
        </Card>

        {/* Content based on source */}
        {renderContent(selectedContext)}

        {/* Entities */}
        {renderEntities(selectedContext)}

        {/* Suggested actions */}
        {selectedContext.status === 'completed' && renderActions(selectedContext)}

        {/* Metadata */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium">Metadata</Text>
            <List.Item
              title="Created"
              description={formatDateTime(selectedContext.createdAt)}
              left={(props) => <List.Icon {...props} icon="clock-outline" />}
            />
            <List.Item
              title="Last Updated"
              description={formatDateTime(selectedContext.updatedAt)}
              left={(props) => <List.Icon {...props} icon="update" />}
            />
            <List.Item
              title="ID"
              description={selectedContext.id}
              left={(props) => <List.Icon {...props} icon="identifier" />}
            />
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

ContextDetailScreen.displayName = 'ContextDetailScreen';

/**
 * Styles for ContextDetailScreen component
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusChip: {
    height: 28,
  },
  chipText: {
    fontSize: 12,
  },
  timestamp: {
    marginTop: 12,
    opacity: 0.6,
  },
  contentText: {
    marginTop: 12,
    lineHeight: 22,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  platform: {
    opacity: 0.6,
  },
  divider: {
    marginVertical: 12,
  },
  duration: {
    marginTop: 8,
    opacity: 0.6,
  },
  noData: {
    marginTop: 8,
    opacity: 0.6,
  },
  entityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  actionButton: {
    marginTop: 8,
  },
});
