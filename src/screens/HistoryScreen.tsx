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
import { Chess } from 'chess.js';
import { ChessBoard } from '../components/ChessBoard';
import { StorageService } from '../storage/StorageService';
import { SavedGame } from '../types/chess';
import { UI_COLORS } from '../theme/colors';

interface HistoryScreenProps {
  onBack: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack }) => {
  const [games, setGames] = useState<SavedGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<SavedGame | null>(null);
  const [replayMoveIndex, setReplayMoveIndex] = useState<number>(0);
  const [filterMode, setFilterMode] = useState<'all' | 'ai' | 'pass_and_play'>('all');

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    const list = await StorageService.getGameHistory();
    setGames(list);
  };

  const filteredGames = games.filter(g => {
    if (filterMode === 'all') return true;
    return g.mode === filterMode;
  });

  // Calculate replay chess board position at current replay move index
  const getReplayChess = (): Chess => {
    const replayChess = new Chess();
    if (!selectedGame) return replayChess;

    for (let i = 0; i <= replayMoveIndex && i < selectedGame.moveHistory.length; i++) {
      const m = selectedGame.moveHistory[i];
      try {
        replayChess.move({ from: m.from, to: m.to, promotion: m.promotion || 'q' });
      } catch {
        break;
      }
    }
    return replayChess;
  };

  const handleSelectGame = (game: SavedGame) => {
    setSelectedGame(game);
    setReplayMoveIndex(game.moveHistory.length - 1);
  };

  const currentReplayChess = selectedGame ? getReplayChess() : new Chess();
  const currentMoveRecord = selectedGame?.moveHistory[replayMoveIndex];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* App Bar */}
        <View style={styles.appBar}>
          <TouchableOpacity
            style={styles.appBarButton}
            onPress={() => {
              if (selectedGame) {
                setSelectedGame(null);
              } else {
                onBack();
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color={UI_COLORS.text} />
          </TouchableOpacity>
          <View style={styles.titleColumn}>
            <Text style={styles.screenTitle}>
              {selectedGame ? 'Game Replay' : 'Match Archive'}
            </Text>
            <Text style={styles.screenSubtitle}>
              {selectedGame
                ? `Move ${replayMoveIndex + 1} of ${selectedGame.moveHistory.length}`
                : `${filteredGames.length} Saved Records`}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {!selectedGame ? (
          /* Games List View */
          <>
            {/* Filter Pills */}
            <View style={styles.filterRow}>
              {(['all', 'ai', 'pass_and_play'] as const).map(mode => (
                <TouchableOpacity
                  key={mode}
                  style={[
                    styles.filterChip,
                    filterMode === mode && styles.activeFilterChip,
                  ]}
                  onPress={() => setFilterMode(mode)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filterMode === mode && styles.activeFilterChipText,
                    ]}
                  >
                    {mode === 'all' ? 'All Matches' : mode === 'ai' ? 'vs AI' : 'Pass & Play'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
              {filteredGames.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="folder-open-outline" size={48} color={UI_COLORS.textDim} />
                  <Text style={styles.emptyTitle}>No Recorded Matches</Text>
                  <Text style={styles.emptySub}>
                    Completed matches will automatically be archived here.
                  </Text>
                </View>
              ) : (
                filteredGames.map(game => {
                  const dateStr = new Date(game.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  const isWin = game.result === (game.playerColor === 'w' ? '1-0' : '0-1');
                  const isDraw = game.result === '1/2-1/2';

                  return (
                    <TouchableOpacity
                      key={game.id}
                      style={styles.gameCard}
                      activeOpacity={0.7}
                      onPress={() => handleSelectGame(game)}
                    >
                      <View style={styles.cardHeader}>
                        <View style={styles.badgeRow}>
                          <View
                            style={[
                              styles.resultBadge,
                              isWin
                                ? styles.winBadge
                                : isDraw
                                ? styles.drawBadge
                                : styles.lossBadge,
                            ]}
                          >
                            <Text
                              style={[
                                styles.resultBadgeText,
                                isWin
                                  ? { color: UI_COLORS.accent }
                                  : isDraw
                                  ? { color: UI_COLORS.warning }
                                  : { color: UI_COLORS.danger },
                              ]}
                            >
                              {game.result || '*'}
                            </Text>
                          </View>
                          <Text style={styles.opponentName}>
                            {game.mode === 'ai' ? `AI (Level ${game.difficulty})` : 'Pass & Play'}
                          </Text>
                        </View>
                        <Text style={styles.dateText}>{dateStr}</Text>
                      </View>

                      <View style={styles.cardFooter}>
                        <Text style={styles.footerDetail}>
                          {game.moveHistory.length} moves • {game.resultReason || 'Match Finished'}
                        </Text>
                        <Ionicons name="play-circle-outline" size={20} color={UI_COLORS.primary} />
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </>
        ) : (
          /* Interactive Move-by-Move Replay View */
          <ScrollView contentContainerStyle={styles.replayContent} showsVerticalScrollIndicator={false}>
            {/* Header info */}
            <View style={styles.replayHeader}>
              <Text style={styles.replayTitle}>
                {selectedGame.mode === 'ai' ? `AI Level ${selectedGame.difficulty}` : 'Local Match'}
              </Text>
              <Text style={styles.replayResult}>
                Result: {selectedGame.result} ({selectedGame.resultReason})
              </Text>
            </View>

            {/* Board */}
            <View style={styles.boardContainer}>
              <ChessBoard
                chess={currentReplayChess}
                orientation={selectedGame.playerColor}
                lastMove={currentMoveRecord}
                interactive={false}
                onMove={() => {}}
              />
            </View>

            {/* Current Move Details */}
            <View style={styles.moveInfoBox}>
              <Text style={styles.moveInfoTitle}>
                Move {replayMoveIndex + 1}: {currentMoveRecord?.san || 'Initial Board'}
              </Text>
              <Text style={styles.moveInfoSub}>
                {currentMoveRecord ? `Played by ${currentMoveRecord.color === 'w' ? 'White' : 'Black'}` : 'Starting Position'}
              </Text>
            </View>

            {/* Step Controls */}
            <View style={styles.stepControls}>
              <TouchableOpacity
                style={[styles.stepBtn, replayMoveIndex <= -1 && styles.disabledBtn]}
                disabled={replayMoveIndex <= -1}
                onPress={() => setReplayMoveIndex(-1)}
              >
                <Ionicons name="play-skip-back" size={20} color={UI_COLORS.text} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.stepBtn, replayMoveIndex <= -1 && styles.disabledBtn]}
                disabled={replayMoveIndex <= -1}
                onPress={() => setReplayMoveIndex(prev => Math.max(-1, prev - 1))}
              >
                <Ionicons name="play-back" size={20} color={UI_COLORS.text} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.stepBtn,
                  replayMoveIndex >= selectedGame.moveHistory.length - 1 && styles.disabledBtn,
                ]}
                disabled={replayMoveIndex >= selectedGame.moveHistory.length - 1}
                onPress={() => setReplayMoveIndex(prev => Math.min(selectedGame.moveHistory.length - 1, prev + 1))}
              >
                <Ionicons name="play-forward" size={20} color={UI_COLORS.text} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.stepBtn,
                  replayMoveIndex >= selectedGame.moveHistory.length - 1 && styles.disabledBtn,
                ]}
                disabled={replayMoveIndex >= selectedGame.moveHistory.length - 1}
                onPress={() => setReplayMoveIndex(selectedGame.moveHistory.length - 1)}
              >
                <Ionicons name="play-skip-forward" size={20} color={UI_COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* PGN Summary Display */}
            <View style={styles.pgnCard}>
              <Text style={styles.pgnTitle}>PGN Record</Text>
              <Text style={styles.pgnBody}>{selectedGame.pgn || 'No PGN recorded.'}</Text>
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
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 10,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.surfaceBorder,
    alignItems: 'center',
  },
  activeFilterChip: {
    backgroundColor: UI_COLORS.primary,
    borderColor: UI_COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: UI_COLORS.textMuted,
  },
  activeFilterChipText: {
    color: '#FFF',
    fontWeight: '700',
  },
  listContent: {
    paddingVertical: 8,
    gap: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: UI_COLORS.text,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: UI_COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 240,
  },
  gameCard: {
    backgroundColor: UI_COLORS.surface,
    borderColor: UI_COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  resultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  winBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  lossBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  drawBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  resultBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  opponentName: {
    fontSize: 14,
    fontWeight: '700',
    color: UI_COLORS.text,
  },
  dateText: {
    fontSize: 11,
    color: UI_COLORS.textMuted,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerDetail: {
    fontSize: 12,
    color: UI_COLORS.textMuted,
  },
  replayContent: {
    paddingVertical: 10,
    paddingBottom: 40,
  },
  replayHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  replayTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: UI_COLORS.text,
  },
  replayResult: {
    fontSize: 12,
    color: UI_COLORS.textMuted,
    marginTop: 2,
  },
  boardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  moveInfoBox: {
    backgroundColor: UI_COLORS.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: UI_COLORS.surfaceBorder,
    alignItems: 'center',
    marginVertical: 10,
  },
  moveInfoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: UI_COLORS.text,
  },
  moveInfoSub: {
    fontSize: 12,
    color: UI_COLORS.textMuted,
    marginTop: 2,
  },
  stepControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  stepBtn: {
    width: 52,
    height: 44,
    borderRadius: 12,
    backgroundColor: UI_COLORS.surface,
    borderColor: UI_COLORS.surfaceBorder,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    opacity: 0.35,
  },
  pgnCard: {
    backgroundColor: UI_COLORS.surface,
    borderColor: UI_COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
  },
  pgnTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: UI_COLORS.text,
    marginBottom: 6,
  },
  pgnBody: {
    fontSize: 12,
    lineHeight: 18,
    color: UI_COLORS.textMuted,
    fontFamily: 'monospace',
  },
});
