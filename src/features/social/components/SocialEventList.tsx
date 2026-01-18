/**
 * SocialEventList Component
 *
 * SPEC-SOC-001: 경조사 관리 기능
 * TAG-009: UI 컴포넌트 구현 (Card, List, Detail)
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SocialEvent } from '@/shared/models';
import { SocialEventCard } from './SocialEventCard';

interface Props {
  events: SocialEvent[];
  onEventPress?: (event: SocialEvent) => void;
}

export const SocialEventList: React.FC<Props> = ({ events, onEventPress }) => {
  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>등록된 경조사 이벤트가 없습니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {events.map((event) => (
        <SocialEventCard
          key={event.id}
          event={event}
          onPress={() => onEventPress?.(event)}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
