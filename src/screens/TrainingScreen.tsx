import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Chess } from 'chess.js';
import { ChessBoard } from '../components/ChessBoard';
import { CHESS_LESSONS } from '../data/lessons';
import { StorageService } from '../storage/StorageService';
import { Lesson } from '../types/chess';
import { UI_COLORS } from '../theme/colors';

interface TrainingScreenProps {
  onBack: () => void;
}

export const TrainingScreen: React.FC<TrainingScreenProps> = ({ onBack }) => {
  const [selectedLessonIndex, setSelectedLessonIndex] = useState<number>(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'viewer'>('list');

  useEffect(() => {
    loadCompleted();
  }, []);

  const loadCompleted = async () => {
    const list = await StorageService.getCompletedLessons();
    setCompletedLessons(list);
  };

  const currentLesson: Lesson = CHESS_LESSONS[selectedLessonIndex] || CHESS_LESSONS[0];
  const lessonChess = new Chess(currentLesson.fen);

  const handleCompleteCurrent = async () => {
    await StorageService.markLessonCompleted(currentLesson.id);
    setCompletedLessons(prev => [...new Set([...prev, currentLesson.id])]);
  };

  const isCurrentCompleted = completedLessons.includes(currentLesson.id);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top App Bar */}
        <View style={styles.appBar}>
          <TouchableOpacity
            style={styles.appBarButton}
            onPress={() => {
              if (activeTab === 'viewer') {
                setActiveTab('list');
              } else {
                onBack();
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color={UI_COLORS.text} />
          </TouchableOpacity>
          <View style={styles.titleColumn}>
            <Text style={styles.screenTitle}>Chess Academy</Text>
            <Text style={styles.screenSubtitle}>
              {completedLessons.length} of {CHESS_LESSONS.length} Lessons Completed
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {activeTab === 'list' ? (
          /* Lesson List View */
          <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {CHESS_LESSONS.map((lesson, idx) => {
              const isDone = completedLessons.includes(lesson.id);
              return (
                <TouchableOpacity
                  key={lesson.id}
                  style={styles.lessonCard}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedLessonIndex(idx);
                    setActiveTab('viewer');
                  }}
                >
                  <View style={styles.lessonIndexBadge}>
                    <Text style={styles.lessonIndexText}>{idx + 1}</Text>
                  </View>
                  <View style={styles.lessonDetails}>
                    <View style={styles.categoryRow}>
                      <Text style={styles.lessonCategory}>{lesson.category}</Text>
                      {isDone && (
                        <Ionicons name="checkmark-circle" size={16} color={UI_COLORS.accent} />
                      )}
                    </View>
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    <Text style={styles.lessonPreview} numberOfLines={2}>
                      {lesson.explanation}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={UI_COLORS.textDim} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          /* Individual Lesson Interactive Viewer */
          <ScrollView contentContainerStyle={styles.viewerContent} showsVerticalScrollIndicator={false}>
            <View style={styles.lessonHeaderCard}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{currentLesson.category}</Text>
              </View>
              <Text style={styles.viewTitle}>{currentLesson.title}</Text>
            </View>

            {/* Board Demonstration */}
            <View style={styles.boardContainer}>
              <ChessBoard
                chess={lessonChess}
                orientation="w"
                interactive={false}
                onMove={() => {}}
              />
            </View>

            {/* Detailed Explanation */}
            <View style={styles.explanationCard}>
              <Text style={styles.explanationTitle}>Lesson Guide</Text>
              <Text style={styles.explanationBody}>{currentLesson.explanation}</Text>

              {/* Key Takeaway */}
              <View style={styles.takeawayBox}>
                <Ionicons name="star" size={18} color={UI_COLORS.gold} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.takeawayTitle}>Grandmaster Rule</Text>
                  <Text style={styles.takeawayBody}>{currentLesson.keyTakeaway}</Text>
                </View>
              </View>
            </View>

            {/* Completion Button */}
            <TouchableOpacity
              style={[
                styles.completeBtn,
                isCurrentCompleted && styles.completedBtnActive,
              ]}
              onPress={handleCompleteCurrent}
            >
              <Ionicons
                name={isCurrentCompleted ? 'checkmark-circle' : 'checkmark'}
                size={20}
                color="#FFF"
              />
              <Text style={styles.completeBtnText}>
                {isCurrentCompleted ? 'Lesson Completed' : 'Mark as Understood'}
              </Text>
            </TouchableOpacity>

            {/* Navigation Buttons */}
            <View style={styles.navRow}>
              <TouchableOpacity
                style={[styles.navBtn, selectedLessonIndex === 0 && styles.disabledBtn]}
                disabled={selectedLessonIndex === 0}
                onPress={() => setSelectedLessonIndex(prev => Math.max(0, prev - 1))}
              >
                <Ionicons name="arrow-back" size={18} color={UI_COLORS.text} />
                <Text style={styles.navBtnText}>Previous Lesson</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.navBtn,
                  selectedLessonIndex >= CHESS_LESSONS.length - 1 && styles.disabledBtn,
                ]}
                disabled={selectedLessonIndex >= CHESS_LESSONS.length - 1}
                onPress={() => setSelectedLessonIndex(prev => Math.min(CHESS_LESSONS.length - 1, prev + 1))}
              >
                <Text style={styles.navBtnText}>Next Lesson</Text>
                <Ionicons name="arrow-forward" size={18} color={UI_COLORS.text} />
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: UI_COLORS.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  appBarButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: UI_COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: UI_COLORS.surfaceBorder,
  },
  titleColumn: {
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: UI_COLORS.text,
  },
  screenSubtitle: {
    fontSize: 11,
    color: UI_COLORS.textMuted,
  },
  listContent: {
    paddingVertical: 12,
    gap: 10,
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI_COLORS.surface,
    borderColor: UI_COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  lessonIndexBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: UI_COLORS.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  lessonIndexText: {
    fontSize: 14,
    fontWeight: '700',
    color: UI_COLORS.primary,
  },
  lessonDetails: {
    flex: 1,
    marginRight: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  lessonCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: UI_COLORS.gold,
    textTransform: 'uppercase',
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: UI_COLORS.text,
  },
  lessonPreview: {
    fontSize: 12,
    color: UI_COLORS.textMuted,
    marginTop: 2,
  },
  viewerContent: {
    paddingVertical: 12,
    paddingBottom: 40,
  },
  lessonHeaderCard: {
    marginBottom: 12,
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    marginBottom: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: UI_COLORS.gold,
    textTransform: 'uppercase',
  },
  viewTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: UI_COLORS.text,
    textAlign: 'center',
  },
  boardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  explanationCard: {
    backgroundColor: UI_COLORS.surface,
    borderColor: UI_COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: UI_COLORS.text,
    marginBottom: 8,
  },
  explanationBody: {
    fontSize: 14,
    lineHeight: 22,
    color: UI_COLORS.textMuted,
  },
  takeawayBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderColor: 'rgba(251, 191, 36, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginTop: 14,
  },
  takeawayTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: UI_COLORS.gold,
    marginBottom: 2,
  },
  takeawayBody: {
    fontSize: 13,
    color: UI_COLORS.text,
    lineHeight: 18,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: UI_COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    marginBottom: 16,
  },
  completedBtnActive: {
    backgroundColor: UI_COLORS.accent,
  },
  completeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: UI_COLORS.surface,
    borderColor: UI_COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  disabledBtn: {
    opacity: 0.35,
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: UI_COLORS.text,
  },
});
