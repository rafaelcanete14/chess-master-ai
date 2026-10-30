import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StorageService } from '../storage/StorageService';
import { DIFFICULTY_CONFIGS } from '../chess/DifficultyManager';
import { PlayerStats, DifficultyLevel } from '../types/chess';
import { UI_COLORS } from '../theme/colors';

interface StatisticsScreenProps {
  onBack: () => void;
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({ onBack }) => {
  const [stats, setStats] = useState<PlayerStats | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const s = await StorageService.getStats();
    setStats(s);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Reset Statistics',
      'Are you sure you want to delete all local history and statistics? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearAllHistory();
            await loadStats();
          },
        },
      ]
    );
  };

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${Math.floor(totalSeconds % 60)}s`;
  };

  const winRate = stats?.gamesPlayed ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;
  const avgDuration = stats?.gamesPlayed ? Math.round(stats.totalPlayTimeSeconds / stats.gamesPlayed) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* App Bar */}
        <View style={styles.appBar}>
          <TouchableOpacity style={styles.appBarButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color={UI_COLORS.text} />
          </TouchableOpacity>
          <View style={styles.titleColumn}>
            <Text style={styles.screenTitle}>Player Analytics</Text>
            <Text style={styles.screenSubtitle}>Performance & Insights</Text>
          </View>
          <TouchableOpacity style={styles.appBarButton} onPress={handleClearHistory}>
            <Ionicons name="trash-outline" size={20} color={UI_COLORS.danger} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Performance Overview Grid */}
          <View style={styles.overviewCard}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricBox}>
                <Text style={styles.metricVal}>{stats?.gamesPlayed || 0}</Text>
                <Text style={styles.metricLabel}>Total Games</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={[styles.metricVal, { color: UI_COLORS.accent }]}>{stats?.wins || 0}</Text>
                <Text style={styles.metricLabel}>Victories</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={[styles.metricVal, { color: UI_COLORS.danger }]}>{stats?.losses || 0}</Text>
                <Text style={styles.metricLabel}>Defeats</Text>
              </View>
              <View style={styles.metricBox}>
                <Text style={[styles.metricVal, { color: UI_COLORS.warning }]}>{stats?.draws || 0}</Text>
                <Text style={styles.metricLabel}>Draws</Text>
              </View>
            </View>

            <View style={styles.ratesRow}>
              <View style={styles.rateItem}>
                <Text style={styles.rateNumber}>{winRate}%</Text>
                <Text style={styles.rateLabel}>Win Rate</Text>
              </View>
              <View style={styles.rateDivider} />
              <View style={styles.rateItem}>
                <Text style={styles.rateNumber}>{formatDuration(stats?.totalPlayTimeSeconds || 0)}</Text>
                <Text style={styles.rateLabel}>Total Play Time</Text>
              </View>
              <View style={styles.rateDivider} />
              <View style={styles.rateItem}>
                <Text style={styles.rateNumber}>{formatDuration(avgDuration)}</Text>
                <Text style={styles.rateLabel}>Avg Match</Text>
              </View>
            </View>
          </View>

          {/* Academic & Tactical Progress */}
          <View style={styles.academyCard}>
            <Text style={styles.sectionTitle}>Training & Tactics</Text>
            <View style={styles.academyRow}>
              <View style={styles.academyItem}>
                <Ionicons name="extension-puzzle" size={24} color={UI_COLORS.warning} />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.academyVal}>{stats?.puzzlesSolved || 0}</Text>
                  <Text style={styles.academyLabel}>Puzzles Mastered</Text>
                </View>
              </View>
              <View style={styles.academyItem}>
                <Ionicons name="school" size={24} color="#A78BFA" />
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.academyVal}>{stats?.lessonsCompleted || 0}</Text>
                  <Text style={styles.academyLabel}>Lessons Finished</Text>
                </View>
              </View>
            </View>
          </View>

          {/* AI Difficulty Performance Breakdown */}
          <View style={styles.diffCard}>
            <Text style={styles.sectionTitle}>Results vs AI Opponents</Text>
            <Text style={styles.sectionSubtitle}>Track record against each engine skill level</Text>

            {([1, 2, 3, 4, 5, 6, 7, 8] as DifficultyLevel[]).map(lvl => {
              const cfg = DIFFICULTY_CONFIGS[lvl];
              const wins = stats?.winsByDifficulty?.[lvl] || 0;
              const losses = stats?.lossesByDifficulty?.[lvl] || 0;
              const draws = stats?.drawsByDifficulty?.[lvl] || 0;
              const totalLvl = wins + losses + draws;

              return (
                <View key={`diff-row-${lvl}`} style={styles.diffRow}>
                  <View style={styles.diffInfo}>
                    <Text style={styles.diffTitle}>
                      Lvl {lvl} • {cfg.name}
                    </Text>
                    <Text style={styles.diffSub}>{cfg.title}</Text>
                  </View>
                  <View style={styles.diffScoreRow}>
                    <Text style={[styles.scorePill, { color: UI_COLORS.accent }]}>{wins}W</Text>
                    <Text style={[styles.scorePill, { color: UI_COLORS.danger }]}>{losses}L</Text>
                    <Text style={[styles.scorePill, { color: UI_COLORS.warning }]}>{draws}D</Text>
                    <Text style={styles.totalPlayedPill}>({totalLvl})</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
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
  scrollContent: {
    paddingVertical: 10,
    paddingBottom: 40,
    gap: 14,
  },
  overviewCard: {
    backgroundColor: UI_COLORS.surface,
    borderColor: UI_COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: UI_COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: UI_COLORS.textMuted,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  metricBox: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    fontSize: 22,
    fontWeight: '800',
    color: UI_COLORS.text,
  },
  metricLabel: {
    fontSize: 11,
    color: UI_COLORS.textMuted,
    marginTop: 2,
  },
  ratesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: UI_COLORS.surfaceBorder,
    marginTop: 16,
    paddingTop: 14,
  },
  rateItem: {
    alignItems: 'center',
    flex: 1,
  },
  rateNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: UI_COLORS.primary,
  },
  rateLabel: {
    fontSize: 11,
    color: UI_COLORS.textMuted,
    marginTop: 2,
  },
  rateDivider: {
    width: 1,
    height: 24,
    backgroundColor: UI_COLORS.surfaceBorder,
  },
  academyCard: {
    backgroundColor: UI_COLORS.surface,
    borderColor: UI_COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
  },
  academyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  academyItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  academyVal: {
    fontSize: 18,
    fontWeight: '800',
    color: UI_COLORS.text,
  },
  academyLabel: {
    fontSize: 11,
    color: UI_COLORS.textMuted,
  },
  diffCard: {
    backgroundColor: UI_COLORS.surface,
    borderColor: UI_COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
  },
  diffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: UI_COLORS.surfaceHighlight,
  },
  diffInfo: {
    flex: 1,
  },
  diffTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: UI_COLORS.text,
  },
  diffSub: {
    fontSize: 11,
    color: UI_COLORS.textMuted,
  },
  diffScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scorePill: {
    fontSize: 12,
    fontWeight: '700',
  },
  totalPlayedPill: {
    fontSize: 11,
    color: UI_COLORS.textDim,
  },
});

