/**
 * Context Card Component
 *
 * A card component for displaying captured context information.
 * Shows context source, preview content, and metadata.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme, IconButton } from 'react-native-paper';
import { Context } from '@/shared/models';
import { formatDistanceToNow } from '@/shared/utils/dateUtils';
import { EntityChip } from './EntityChip';

/**
 * Props for ContextCard component
 */
export interface ContextCardProps {
  /** Context object to display */
  context: Context;
  /** Press handler */
  onPress?: () => void;
  /** Long press handler */
  onLongPress?: () => void;
  /** Delete handler */
  onDelete?: () => void;
  /** Whether to show entities */
  showEntities?: boolean;
  /** Custom style */
  style?: object;
}

/**
 * Get context icon based on source type
 */
const getContextIcon = (source: string): string => {
  switch (source) {
    case 'screenshot':
      return 'image';
    case 'chat':
      return 'message-text';
    case 'location':
      return 'map-marker';
    case 'voice':
      return 'microphone';
    case 'manual':
      return 'pencil';
    default:
      return 'help-circle';
  }
};

/**
 * Get context preview text based on source type
 */
const getContextPreview = (context: Context): string => {
  const { data } = context;

  switch (data.source) {
    case 'screenshot':
      return data.extractedText || 'No text extracted';
    case 'chat':
      return data.message;
    case 'location':
      return data.locationName;
    case 'voice':
      return data.transcript;
    case 'manual':
      return data.content;
    default:
      return 'Unknown context type';
  }
};

/**
 * ContextCard component for displaying context information
 *
 * @example
 * ```tsx
 * <ContextCard
 *   context={context}
 *   onPress={() => navigateToDetail(context.id)}
 *   onDelete={() => deleteContext(context.id)}
 *   showEntities={true}
 * />
 * ```
 */
export const ContextCard: React.FC<ContextCardProps> = React.memo(
  ({ context, onPress, onLongPress, onDelete, showEntities = false, style }) => {
    const theme = useTheme();
    const preview = getContextPreview(context);
    const icon = getContextIcon(context.data.source);

    return (
      <Card
        style={[styles.card, style]}
        onPress={onPress}
        onLongPress={onLongPress}
      >
        <Card.Title
          title={preview.length > 50 ? preview.substring(0, 50) + '...' : preview}
          subtitle={formatDistanceToNow(context.createdAt)}
          left={(props) => (
            <IconButton
              {...props}
              icon={icon}
              size={24}
              style={styles.icon}
            />
          )}
          right={(props) =>
            onDelete ? (
              <IconButton
                {...props}
                icon="delete"
                size={20}
                onPress={onDelete}
              />
            ) : null
          }
        />
        {showEntities && context.entities.length > 0 && (
          <Card.Content style={styles.content}>
            <View style={styles.entityContainer}>
              {context.entities.slice(0, 3).map((entity) => (
                <EntityChip
                  key={entity.id}
                  entity={entity}
                  style={styles.entityChip}
                />
              ))}
              {context.entities.length > 3 && (
                <Text style={styles.moreText}>
                  +{context.entities.length - 3} more
                </Text>
              )}
            </View>
          </Card.Content>
        )}
      </Card>
    );
  }
);

ContextCard.displayName = 'ContextCard';

/**
 * Styles for ContextCard component
 */
const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    marginHorizontal: 8,
  },
  icon: {
    marginRight: 8,
  },
  content: {
    paddingTop: 0,
  },
  entityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 8,
  },
  entityChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  moreText: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.6)',
    marginLeft: 4,
  },
});
