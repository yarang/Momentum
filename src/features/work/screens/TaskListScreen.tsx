/**
 * Task List Screen
 *
 * Displays tasks with filtering, sorting, and swipe actions.
 * Supports task completion, deletion, and navigation to task details.
 */

import React, { useEffect, useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Appbar,
  Searchbar,
  SegmentedButtons,
  FAB,
  Menu,
  useTheme,
  Divider,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Swipeable } from 'react-native-gesture-handler';
import { useTaskStore, TaskFilterOptions, TaskStatus } from '@/store';
import { TaskItem, EmptyState, LoadingSpinner } from '@/shared/components';
import { Task } from '@/shared/models';
import type { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Main'>;

/**
 * Filter options for task list
 */
type TaskFilter = 'all' | 'pending' | 'completed';

/**
 * TaskListScreen component
 *
 * @example
 * ```tsx
 * <TaskListScreen navigation={navigation} route={route} />
 * ```
 */
export const TaskListScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const {
    tasks,
    isLoading,
    error,
    loadTasks,
    deleteTask,
    updateTask,
    setSelectedTask,
    clearError,
    filterTasks,
  } = useTaskStore();

  const [filter, setFilter] = useState<TaskFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [selectedSort, setSelectedSort] = useState<'createdAt' | 'deadline' | 'priority'>('createdAt');

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Show error alert
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: clearError },
      ]);
    }
  }, [error, clearError]);

  // Get filtered tasks
  const getFilteredTasks = useCallback(() => {
    let filterOptions: TaskFilterOptions = {
      sortBy: selectedSort,
      sortOrder: 'desc',
    };

    // Apply status filter
    if (filter === 'pending') {
      filterOptions.status = 'active';
    } else if (filter === 'completed') {
      filterOptions.status = 'completed';
    }

    let filtered = filterTasks(filterOptions);

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [filter, searchQuery, selectedSort, filterTasks]);

  const filteredTasks = getFilteredTasks();

  // Handle task press
  const handleTaskPress = useCallback(
    (task: Task) => {
      setSelectedTask(task);
      navigation.navigate('TaskDetail', { taskId: task.id });
    },
    [navigation, setSelectedTask]
  );

  // Handle task completion toggle
  const handleToggleComplete = useCallback(
    async (task: Task) => {
      try {
        const newStatus: TaskStatus =
          task.status === 'completed' ? 'active' : 'completed';
        await updateTask(task.id, { status: newStatus });
      } catch (err) {
        Alert.alert('Error', 'Failed to update task');
      }
    },
    [updateTask]
  );

  // Handle task delete
  const handleDelete = useCallback(
    (task: Task) => {
      Alert.alert(
        'Delete Task',
        `Are you sure you want to delete "${task.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteTask(task.id);
              } catch (err) {
                Alert.alert('Error', 'Failed to delete task');
              }
            },
          },
        ]
      );
    },
    [deleteTask]
  );

  // Handle refresh
  const handleRefresh = useCallback(() => {
    loadTasks();
  }, [loadTasks]);

  // Render swipeable task item
  const renderTaskItem = useCallback(
    ({ item }: { item: Task }) => {
      const renderRightActions = () => (
        <View style={styles.swipeActions}>
          <View style={[styles.swipeAction, styles.completeAction]}>
            <Text style={styles.swipeActionText}>
              {item.status === 'completed' ? 'Active' : 'Done'}
            </Text>
          </View>
          <View style={[styles.swipeAction, styles.deleteAction]}>
            <Text style={styles.swipeActionText}>Delete</Text>
          </View>
        </View>
      );

      return (
        <Swipeable
          renderRightActions={renderRightActions}
          onSwipeableOpen will close
          onSwipeableOpen={(direction) => {
            if (direction === 'right') {
              handleDelete(item);
            }
          }}
        >
          <TaskItem
            task={item}
            onPress={() => handleTaskPress(item)}
            onToggleComplete={() => handleToggleComplete(item)}
            showCheckbox={true}
          />
        </Swipeable>
      );
    },
    [handleTaskPress, handleToggleComplete, handleDelete, theme]
  );

  // List header with filters
  const ListHeader = useCallback(
    () => (
      <View style={styles.header}>
        <SegmentedButtons
          value={filter}
          onValueChange={(value) => setFilter(value as TaskFilter)}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'pending', label: 'Pending' },
            { value: 'completed', label: 'Done' },
          ]}
          style={styles.filterButtons}
        />

        <View style={styles.row}>
          <Searchbar
            placeholder="Search tasks..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />
          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={
              <Appbar.Action
                icon="sort"
                onPress={() => setSortMenuVisible(true)}
              />
            }
          >
            <Menu.Item
              leadingIcon="calendar"
              title="Date Created"
              onPress={() => {
                setSelectedSort('createdAt');
                setSortMenuVisible(false);
              }}
            />
            <Menu.Item
              leadingIcon="clock-outline"
              title="Deadline"
              onPress={() => {
                setSelectedSort('deadline');
                setSortMenuVisible(false);
              }}
            />
            <Menu.Item
              leadingIcon="flag"
              title="Priority"
              onPress={() => {
                setSelectedSort('priority');
                setSortMenuVisible(false);
              }}
            />
          </Menu>
        </View>

        <Divider style={styles.divider} />

        <Text variant="titleMedium" style={styles.count}>
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
        </Text>
      </View>
    ),
    [
      filter,
      searchQuery,
      sortMenuVisible,
      filteredTasks.length,
      theme,
    ]
  );

  // Empty state
  const ListEmptyComponent = useCallback(
    () => (
      <EmptyState
        icon="checkbox-marked-circle-outline"
        title={
          searchQuery
            ? 'No tasks found'
            : filter === 'completed'
            ? 'No completed tasks'
            : filter === 'pending'
            ? 'No pending tasks'
            : 'No tasks yet'
        }
        description={
          searchQuery
            ? 'Try a different search term'
            : 'Create your first task to get started'
        }
        actionLabel={!searchQuery ? 'Create Task' : undefined}
        onAction={() => {
          /* TODO: Navigate to create task */
        }}
      />
    ),
    [searchQuery, filter]
  );

  return (
    <GestureHandlerRootView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header>
        <Appbar.Content title="Tasks" />
        <Appbar.Action icon="filter-variant" onPress={() => {}} />
      </Appbar.Header>

      <FlatList
        data={filteredTasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={!isLoading ? ListEmptyComponent : null}
        contentContainerStyle={[
          styles.listContent,
          filteredTasks.length === 0 && styles.listContentCenter,
        ]}
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
        onPress={() => {
          /* TODO: Navigate to create task */
        }}
        label="Add Task"
      />
    </GestureHandlerRootView>
  );
};

TaskListScreen.displayName = 'TaskListScreen';

/**
 * Styles for TaskListScreen component
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  filterButtons: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchbar: {
    flex: 1,
    marginRight: 8,
    elevation: 0,
  },
  divider: {
    marginTop: 16,
  },
  count: {
    marginTop: 12,
    opacity: 0.6,
  },
  listContent: {
    paddingBottom: 80,
  },
  listContentCenter: {
    flexGrow: 1,
  },
  swipeActions: {
    flexDirection: 'row',
    width: 160,
  },
  swipeAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeAction: {
    backgroundColor: '#4CAF50',
  },
  deleteAction: {
    backgroundColor: '#F44336',
  },
  swipeActionText: {
    color: 'white',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
