/**
 * Entity Chip Component
 *
 * A chip component for displaying extracted entities.
 * Shows entity type, value, and confidence indicator.
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';
import { Entity, EntityType } from '@/shared/models';

/**
 * Props for EntityChip component
 */
export interface EntityChipProps {
  /** Entity object to display */
  entity: Entity;
  /** Press handler */
  onPress?: () => void;
  /** onClose handler */
  onClose?: () => void;
  /** Custom style */
  style?: object;
  /** Whether to show compact version */
  compact?: boolean;
}

/**
 * Get entity icon based on type
 */
const getEntityIcon = (type: EntityType): string => {
  switch (type) {
    case 'date':
      return 'calendar';
    case 'time':
      return 'clock';
    case 'location':
      return 'map-marker';
    case 'amount':
      return 'currency';
    case 'person':
      return 'account';
    default:
      return 'help-circle';
  }
};

/**
 * Get entity display text
 */
const getEntityText = (entity: Entity, compact: boolean): string => {
  if (compact) {
    return entity.value.toString().substring(0, 15);
  }
  return `${entity.type}: ${entity.value}`;
};

/**
 * EntityChip component for displaying entity information
 *
 * @example
 * ```tsx
 * <EntityChip
 *   entity={entity}
 *   onPress={() => showEntityDetails(entity)}
 *   compact={true}
 * />
 * ```
 */
export const EntityChip: React.FC<EntityChipProps> = React.memo(
  ({ entity, onPress, onClose, style, compact = false }) => {
    const theme = useTheme();
    const icon = getEntityIcon(entity.type);
    const text = getEntityText(entity, compact);

    // Color based on confidence level
    const getChipColor = () => {
      if (entity.confidence >= 0.8) {
        return theme.colors.primaryContainer;
      } else if (entity.confidence >= 0.5) {
        return theme.colors.secondaryContainer;
      } else {
        return theme.colors.tertiaryContainer;
      }
    };

    return (
      <Chip
        icon={icon}
        textStyle={styles.text}
        style={[styles.chip, { backgroundColor: getChipColor() }, style]}
        onPress={onPress}
        onClose={onClose}
        closeIcon onCloseIconPress={onClose}
      >
        {text}
      </Chip>
    );
  }
);

EntityChip.displayName = 'EntityChip';

/**
 * Styles for EntityChip component
 */
const styles = StyleSheet.create({
  chip: {
    marginHorizontal: 4,
    marginVertical: 4,
  },
  text: {
    fontSize: 12,
  },
});
