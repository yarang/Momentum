/**
 * SocialEventCard Component
 *
 * SPEC-SOC-001: 경조사 관리 기능
 * TAG-009: UI 컴포넌트 구현 (Card, List, Detail)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SocialEvent } from '@/shared/models';

interface Props {
  event: SocialEvent;
  onPress?: () => void;
}

export const SocialEventCard: React.FC<Props> = ({ event, onPress }) => {
  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      wedding: '#FF6B9D',
      funeral: '#6B7280',
      first_birthday: '#F59E0B',
      sixtieth_birthday: '#EC4899',
      birthday: '#8B5CF6',
      graduation: '#3B82F6',
      etc: '#9CA3AF',
    };
    return colors[type] || colors.etc;
  };

  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      wedding: '결혼식',
      funeral: '장례식',
      first_birthday: '돌잔치',
      sixtieth_birthday: '환갑',
      birthday: '생일',
      graduation: '졸업식',
      etc: '기타',
    };
    return labels[type] || '기타';
  };

  return (
    <View style={styles.container} onTouchEnd={onPress}>
      <View style={[styles.typeIndicator, { backgroundColor: getTypeColor(event.type) }]} />
      <View style={styles.content}>
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.type}>{getTypeLabel(event.type)}</Text>
        <Text style={styles.date}>
          {new Date(event.eventDate).toLocaleDateString('ko-KR')}
        </Text>
        {event.location && (
          <Text style={styles.location}>📍 {event.location.name}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  typeIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  type: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
  },
});
