/**
 * Empty State Component
 *
 * A placeholder component for empty list or content states.
 * Provides visual feedback and optional action buttons.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme, IconButton } from 'react-native-paper';
import { Button } from 'react-native-paper';

/**
 * Props for EmptyState component
 */
export interface EmptyStateProps {
  /** Icon name to display */
  icon?: string;
  /** Title text */
  title: string;
  /** Description text */
  description?: string;
  /** Action button label */
  actionLabel?: string;
  /** Action button handler */
  onAction?: () => void;
  /** Custom style */
  style?: object;
  /** Whether to show animation (placeholder for future lottie support) */
  animated?: boolean;
}

/**
 * EmptyState component for displaying empty states
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon="inbox-outline"
 *   title="No tasks yet"
 *   description="Create your first task to get started"
 *   actionLabel="Create Task"
 *   onAction={() => navigateToCreateTask()}
 * />
 * ```
 */
export const EmptyState: React.FC<EmptyStateProps> = React.memo(
  ({
    icon = 'inbox-outline',
    title,
    description,
    actionLabel,
    onAction,
    style,
    animated = false,
  }) => {
    const theme = useTheme();

    return (
      <View style={[styles.container, style]}>
        <View style={styles.iconContainer}>
          <IconButton
            icon={icon}
            size={80}
            iconColor={theme.colors.onSurfaceVariant}
          />
        </View>
        <Text variant="titleLarge" style={styles.title}>
          {title}
        </Text>
        {description && (
          <Text
            variant="bodyMedium"
            style={styles.description}
            color={theme.colors.onSurfaceVariant}
          >
            {description}
          </Text>
        )}
        {actionLabel && onAction && (
          <Button
            mode="contained"
            onPress={onAction}
            style={styles.button}
          >
            {actionLabel}
          </Button>
        )}
      </View>
    );
  }
);

EmptyState.displayName = 'EmptyState';

/**
 * Styles for EmptyState component
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    minHeight: 300,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  button: {
    marginTop: 8,
  },
});
