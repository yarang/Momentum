/**
 * Loading Spinner Component
 *
 * A loading indicator component with optional text.
 * Provides visual feedback during async operations.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, useTheme } from 'react-native';
import { MD3ColorsType } from 'react-native-paper';

/**
 * Props for LoadingSpinner component
 */
export interface LoadingSpinnerProps {
  /** Loading message text */
  message?: string;
  /** Size of the spinner */
  size?: 'small' | 'large' | number;
  /** Whether to show in overlay mode */
  overlay?: boolean;
  /** Custom style */
  style?: object;
}

/**
 * LoadingSpinner component for displaying loading state
 *
 * @example
 * ```tsx
 * <LoadingSpinner
 *   message="Loading tasks..."
 *   size="large"
 * />
 * ```
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = React.memo(
  ({ message, size = 'large', overlay = false, style }) => {
    const theme = useTheme();

    const Container = overlay ? View : React.Fragment;
    const containerProps = overlay
      ? {
          style: [styles.overlay, style],
        }
      : {};

    return (
      <Container {...containerProps}>
        <View style={styles.container}>
          <ActivityIndicator
            size={size}
            animating={true}
            color={theme.colors.primary}
          />
          {message && (
            <Text
              variant="bodyMedium"
              style={styles.message}
              color={theme.colors.onSurface}
            >
              {message}
            </Text>
          )}
        </View>
      </Container>
    );
  }
);

LoadingSpinner.displayName = 'LoadingSpinner';

/**
 * Styles for LoadingSpinner component
 */
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 1000,
  },
  message: {
    marginTop: 16,
    textAlign: 'center',
  },
});
