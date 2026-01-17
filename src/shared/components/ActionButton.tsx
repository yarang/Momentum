/**
 * Action Button Component
 *
 * A reusable button component with loading state support.
 * Built with React Native Paper for consistent Material Design styling.
 */

import React from 'react';
import { ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { Button, ButtonProps, useTheme } from 'react-native-paper';

/**
 * Props for ActionButton component
 */
export interface ActionButtonProps extends Omit<ButtonProps, 'children' | 'content'> {
  /** Button label text */
  label: string;
  /** Whether button is in loading state */
  loading?: boolean;
  /** Icon name to display (from Material Icons) */
  icon?: string;
  /** Custom style for the button */
  style?: ViewStyle;
  /** Disabled state */
  disabled?: boolean;
  /** onPress handler */
  onPress: () => void;
  /** Button mode (default: 'contained') */
  mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
}

/**
 * ActionButton component with loading state
 *
 * @example
 * ```tsx
 * <ActionButton
 *   label="Save Task"
 *   icon="content-save"
 *   loading={isSaving}
 *   onPress={handleSave}
 *   mode="contained"
 * />
 * ```
 */
export const ActionButton: React.FC<ActionButtonProps> = React.memo(
  ({
    label,
    loading = false,
    icon,
    style,
    disabled = false,
    onPress,
    mode = 'contained',
    ...buttonProps
  }) => {
    const theme = useTheme();

    return (
      <Button
        mode={mode}
        onPress={onPress}
        disabled={disabled || loading}
        icon={loading ? undefined : icon}
        style={[styles.button, style]}
        contentStyle={styles.content}
        {...buttonProps}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={theme.colors.onPrimary}
            style={styles.spinner}
          />
        ) : (
          label
        )}
      </Button>
    );
  }
);

ActionButton.displayName = 'ActionButton';

/**
 * Styles for ActionButton component
 */
const styles = StyleSheet.create({
  button: {
    marginVertical: 4,
  },
  content: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  spinner: {
    height: 24,
  },
});
