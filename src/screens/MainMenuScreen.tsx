import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StorageService } from '../storage/StorageService';
import { GameSettings, PlayerStats, GameMode, DifficultyLevel } from '../types/chess';
import { DIFFICULTY_CONFIGS } from '../chess/DifficultyManager';
import { UI_COLORS } from '../theme/colors';

interface MainMenuScreenProps {
  onNavigate: (screen: string, params?: { mode?: GameMode; difficulty?: DifficultyLevel }) => void;
}

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ onNavigate }) => {
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [stats, setStats] = useState<PlayerStats | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const s = await StorageService.getSettings();
    const st = await StorageService.getStats();
    setSettings(s);
    setStats(st);
  };

  const selectedDiff = settings ? DIFFICULTY_CONFIGS[settings.difficulty] : DIFFICULTY_CONFIGS[4];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={UI_COLORS.background} />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header / Logo */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Ionicons name="shield-checkmark" size={32} color={UI_COLORS.gold} />
          </View>
          <Text style={styles.appTitle}>Chess Master AI</Text>
          <Text style={styles.appSubtitle}>Offline Chess Engine • iPhone 16 Pro Max Edition</Text>
        </View>

        {/* Quick Profile / Stats Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{stats?.gamesPlayed || 0}</Text>
            <Text style={styles.summaryLabel}>Games</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: UI_COLORS.accent }]}>{stats?.wins || 0}</Text>
            <Text style={styles.summaryLabel}>Wins</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: UI_COLORS.warning }]}>
              {stats?.gamesPlayed ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0}%
            </Text>
            <Text style={styles.summaryLabel}>Win Rate</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: UI_COLORS.primary }]}>{stats?.puzzlesSolved || 0}</Text>
            <Text style={styles.summaryLabel}>Puzzles</Text>
          </View>
        </View>

        {/* Quick Start vs AI Button */}
        <TouchableOpacity
          style={styles.quickStartButton}
          activeOpacity={0.85}
          onPress={() => onNavigate('game', { mode: 'ai', difficulty: settings?.difficulty || 4 })}
        >
          <View style={styles.quickStartContent}>
            <Ionicons name="play" size={28} color="#FFF" style={styles.playIcon} />
            <View>
              <Text style={styles.quickStartTitle}>Play vs AI</Text>
              <Text style={styles.quickStartSubtitle}>
                {selectedDiff.title} • Level {selectedDiff.level}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#FFF" />
        </TouchableOpacity>

        {/* Primary Navigation Menu */}
        <View style={styles.menuContainer}>
          {/* Local 2-Player */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => onNavigate('game', { mode: 'pass_and_play' })}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
              <Ionicons name="people" size={22} color={UI_COLORS.accent} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Pass & Play</Text>
              <Text style={styles.menuDescription}>Local two-player on the same device</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={UI_COLORS.textDim} />
          </TouchableOpacity>

          {/* Puzzle Mode */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => onNavigate('puzzles')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
              <Ionicons name="extension-puzzle" size={22} color={UI_COLORS.warning} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Tactical Puzzles</Text>
              <Text style={styles.menuDescription}>Mate-in-1, Mate-in-2, Forks, Pins, & Skewers</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={UI_COLORS.textDim} />
          </TouchableOpacity>

          {/* Training Mode */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => onNavigate('training')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
              <Ionicons name="school" size={22} color="#A78BFA" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Training & Lessons</Text>
              <Text style={styles.menuDescription}>Learn movements, opening rules & endgames</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={UI_COLORS.textDim} />
          </TouchableOpacity>

          {/* Game History */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => onNavigate('history')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
              <Ionicons name="time" size={22} color={UI_COLORS.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Game History & Replay</Text>
              <Text style={styles.menuDescription}>Review past matches, PGN exports, and moves</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={UI_COLORS.textDim} />
          </TouchableOpacity>

          {/* Statistics */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => onNavigate('statistics')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
              <Ionicons name="stats-chart" size={22} color="#F472B6" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Statistics & Analytics</Text>
              <Text style={styles.menuDescription}>Detailed breakdown by difficulty level</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={UI_COLORS.textDim} />
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => onNavigate('settings')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: 'rgba(156, 163, 175, 0.15)' }]}>
              <Ionicons name="settings-sharp" size={22} color={UI_COLORS.textMuted} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuTitle}>Settings</Text>
              <Text style={styles.menuDescription}>Board themes, audio, haptics & AI strength</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={UI_COLORS.textDim} />
          </TouchableOpacity>
        </View>

        {/* Offline Badge */}
        <View style={styles.offlineFooter}>
          <Ionicons name="cloud-offline" size={16} color={UI_COLORS.accent} />
          <Text style={styles.offlineText}>100% Offline Engine • No Internet Required</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: UI_COLORS.background,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: UI_COLORS.surface,
    borderColor: UI_COLORS.surfaceBorder,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: UI_COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  appTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: UI_COLORS.text,
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 12,
    color: UI_COLORS.textMuted,
    marginTop: 4,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: UI_COLORS.surface,
    borderColor: UI_COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color: UI_COLORS.text,
  },
  summaryLabel: {
    fontSize: 11,
    color: UI_COLORS.textMuted,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 24,
    backgroundColor: UI_COLORS.surfaceBorder,
  },
  quickStartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: UI_COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 20,
    shadowColor: UI_COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  quickStartContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playIcon: {
    marginRight: 14,
  },
  quickStartTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  quickStartSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  menuContainer: {
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI_COLORS.surface,
    borderColor: UI_COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: UI_COLORS.text,
  },
  menuDescription: {
    fontSize: 12,
    color: UI_COLORS.textMuted,
    marginTop: 2,
  },
  offlineFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    gap: 6,
  },
  offlineText: {
    fontSize: 12,
    color: UI_COLORS.accent,
    fontWeight: '600',
  },
});

