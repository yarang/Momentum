/**
 * Task Item Component
 *
 * A list item component for displaying task information.
 * Shows task title, status, priority, and due date.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { List, Checkbox, useTheme, IconButton } from 'react-native-paper';
import { Task, TaskPriority, TaskStatus } from '@/shared/models';
import { formatDistanceToNow } from '@/shared/utils/dateUtils';

/**
 * Props for TaskItem component
 */
export interface TaskItemProps {
  /** Task object to display */
  task: Task;
  /** Press handler */
  onPress?: () => void;
  /** Long press handler */
  onLongPress?: () => void;
  /** Toggle complete handler */
  onToggleComplete?: () => void;
  /** Delete handler */
  onDelete?: () => void;
  /** Whether to show checkbox */
  showCheckbox?: boolean;
  /** Custom style */
  style?: object;
}

/**
 * Get priority color based on priority level
 */
const getPriorityColor = (priority: TaskPriority, theme: any): string => {
  switch (priority) {
    case 'urgent':
      return theme.colors.error;
    case 'high':
      return theme.colors.error;
    case 'medium':
      return theme.colors.tertiary;
    case 'low':
      return theme.colors.surfaceVariant;
    default:
      return theme.colors.surfaceVariant;
  }
};

/**
 * Get priority icon name
 */
const getPriorityIcon = (priority: TaskPriority): string => {
  switch (priority) {
    case 'urgent':
      return 'alert-circle';
    case 'high':
      return 'arrow-up-bold';
    case 'medium':
      return 'minus-circle';
    case 'low':
      return 'arrow-down';
    default:
      return 'help-circle';
  }
};

/**
 * Get status icon for task
 */
const getStatusIcon = (status: TaskStatus): string => {
  switch (status) {
    case 'completed':
      return 'check-circle';
    case 'active':
      return 'clock-outline';
    case 'pending':
      return 'pause-circle';
    case 'cancelled':
      return 'cancel';
    case 'draft':
      return 'file-document-edit';
    default:
      return 'help-circle';
  }
};

/**
 * TaskItem component for displaying task in a list
 *
 * @example
 * ```tsx
 * <TaskItem
 *   task={task}
 *   onPress={() => navigateToDetail(task.id)}
 *   onToggleComplete={() => toggleTaskStatus(task.id)}
 *   showCheckbox={true}
 * />
 * ```
 */
export const TaskItem: React.FC<TaskItemProps> = React.memo(
  ({
    task,
    onPress,
    onLongPress,
    onToggleComplete,
    onDelete,
    showCheckbox = false,
    style,
  }) => {
    const theme = useTheme();
    const isCompleted = task.status === 'completed';
    const priorityColor = getPriorityColor(task.priority, theme);
    const priorityIcon = getPriorityIcon(task.priority);

    const leftProp = showCheckbox
      ? (props: any) => (
          <Checkbox.Android
            {...props}
            status={isCompleted ? 'checked' : 'unchecked'}
            onPress={onToggleComplete}
          />
        )
      : (props: any) => (
          <List.Icon
            {...props}
            icon={getStatusIcon(task.status)}
            color={isCompleted ? theme.colors.primary : theme.colors.onSurfaceVariant}
          />
        );

    return (
      <View style={[styles.container, style]}>
        <List.Item
          title={task.title}
          description={
            task.deadline
              ? `Due ${formatDistanceToNow(task.deadline)}`
              : task.description || undefined
          }
          left={leftProp}
          right={(props) => (
            <View style={styles.rightContainer}>
              <IconButton
                {...props}
                icon={priorityIcon}
                size={20}
                iconColor={priorityColor}
              />
              {onDelete && (
                <IconButton
                  {...props}
                  icon="delete"
                  size={20}
                  onPress={onDelete}
                />
              )}
            </View>
          )}
          onPress={onPress}
          onLongPress={onLongPress}
          style={[
            styles.listItem,
            isCompleted && styles.completedItem,
          ]}
          titleStyle={[
            styles.title,
            isCompleted && styles.completedTitle,
          ]}
        />
      </View>
    );
  }
);

TaskItem.displayName = 'TaskItem';

/**
 * Styles for TaskItem component
 */
const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  listItem: {
    paddingVertical: 8,
  },
  completedItem: {
    opacity: 0.6,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
  },
});
