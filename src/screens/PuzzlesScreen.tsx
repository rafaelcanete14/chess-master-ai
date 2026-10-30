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
import { Square, PieceSymbol } from 'chess.js';
import { ChessGameService } from '../chess/ChessGameService';
import { ChessBoard } from '../components/ChessBoard';
import { CHESS_PUZZLES } from '../data/puzzles';
import { StorageService } from '../storage/StorageService';
import { AudioService } from '../services/AudioService';
import { HapticsService } from '../services/HapticsService';
import { Puzzle } from '../types/chess';
import { UI_COLORS } from '../theme/colors';

interface PuzzlesScreenProps {
  onBack: () => void;
}

export const PuzzlesScreen: React.FC<PuzzlesScreenProps> = ({ onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState<number>(0);
  const [solvedPuzzles, setSolvedPuzzles] = useState<string[]>([]);
  const [gameService, setGameService] = useState<ChessGameService | null>(null);
  const [boardFen, setBoardFen] = useState<string>('');
  const [solutionStep, setSolutionStep] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ message: string; isError: boolean } | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  useEffect(() => {
    loadSolved();
  }, []);

  const loadSolved = async () => {
    const list = await StorageService.getSolvedPuzzles();
    setSolvedPuzzles(list);
  };

  const categories = ['All', 'Mate-in-1', 'Mate-in-2', 'Fork', 'Pin', 'Skewer', 'Endgame'];

  const filteredPuzzles = CHESS_PUZZLES.filter(p =>
    selectedCategory === 'All' ? true : p.category === selectedCategory
  );

  const currentPuzzle: Puzzle = filteredPuzzles[currentPuzzleIndex] || CHESS_PUZZLES[0];

  // Initialize board whenever current puzzle changes
  useEffect(() => {
    if (currentPuzzle) {
      const gs = new ChessGameService(currentPuzzle.fen);
      setGameService(gs);
      setBoardFen(gs.getFen());
      setSolutionStep(0);
      setFeedback(null);
      setShowHint(false);
    }
  }, [currentPuzzle]);

  const handleUserMove = (from: Square, to: Square, promotion: PieceSymbol = 'q') => {
    if (!gameService || !currentPuzzle) return;

    const expectedMoveUci = currentPuzzle.solutionUci[solutionStep];
    const userMoveUci = `${from}${to}${promotion !== 'q' ? promotion : ''}`.toLowerCase();

    // Check if user's move matches expected solution move
    const isCorrect = userMoveUci.startsWith(expectedMoveUci.substring(0, 4));

    if (!isCorrect) {
      setFeedback({ message: 'Incorrect move. Try looking for a more forceful move!', isError: true });
      AudioService.playSound('check');
      HapticsService.error();
      return;
    }

    // Apply the correct move
    const move = gameService.makeMove(from, to, promotion);
    if (!move) return;

    setBoardFen(gameService.getFen());
    HapticsService.success();

    const nextStep = solutionStep + 1;

    // Check if puzzle completed
    if (nextStep >= currentPuzzle.solutionUci.length) {
      setFeedback({ message: 'Brilliant! Tactical puzzle solved perfectly!', isError: false });
      AudioService.playSound('victory');
      StorageService.markPuzzleSolved(currentPuzzle.id);
      setSolvedPuzzles(prev => [...new Set([...prev, currentPuzzle.id])]);
      setSolutionStep(nextStep);
    } else {
      // Puzzle has engine response move
      setSolutionStep(nextStep);
      const opponentUci = currentPuzzle.solutionUci[nextStep];
      const oppFrom = opponentUci.substring(0, 2) as Square;
      const oppTo = opponentUci.substring(2, 4) as Square;
      const oppPromo = (opponentUci.length > 4 ? opponentUci[4] : 'q') as PieceSymbol;

      setTimeout(() => {
        gameService.makeMove(oppFrom, oppTo, oppPromo);
        setBoardFen(gameService.getFen());
        setSolutionStep(nextStep + 1);
        AudioService.playSound('move');
      }, 500);
    }
  };

  const isCurrentSolved = solvedPuzzles.includes(currentPuzzle.id);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top App Bar */}
        <View style={styles.appBar}>
          <TouchableOpacity style={styles.appBarButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color={UI_COLORS.text} />
          </TouchableOpacity>
          <View style={styles.titleColumn}>
            <Text style={styles.screenTitle}>Tactical Puzzles</Text>
            <Text style={styles.screenSubtitle}>
              Solved {solvedPuzzles.length} of {CHESS_PUZZLES.length}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.appBarButton}
            onPress={() => setShowHint(prev => !prev)}
          >
            <Ionicons name="bulb-outline" size={22} color={UI_COLORS.warning} />
          </TouchableOpacity>
        </View>

        {/* Categories Bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                selectedCategory === cat && styles.activeCategoryChip,
              ]}
              onPress={() => {
                setSelectedCategory(cat);
                setCurrentPuzzleIndex(0);
              }}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat && styles.activeCategoryChipText,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Puzzle Header Info */}
        <View style={styles.puzzleHeader}>
          <View style={styles.puzzleBadgeRow}>
            <Text style={styles.puzzleTitle}>{currentPuzzle.title}</Text>
            {isCurrentSolved && (
              <View style={styles.solvedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={UI_COLORS.accent} />
                <Text style={styles.solvedText}>Solved</Text>
              </View>
            )}
          </View>
          <Text style={styles.puzzleSub}>
            {currentPuzzle.playerColor === 'w' ? 'White' : 'Black'} to move • {currentPuzzle.difficulty}
          </Text>
        </View>

        {/* Hint Box (if toggled) */}
        {showHint && (
          <View style={styles.hintCard}>
            <Ionicons name="bulb" size={18} color={UI_COLORS.warning} />
            <Text style={styles.hintText}>{currentPuzzle.hint}</Text>
          </View>
        )}

        {/* Feedback Alert */}
        {feedback && (
          <View
            style={[
              styles.feedbackCard,
              feedback.isError ? styles.feedbackError : styles.feedbackSuccess,
            ]}
          >
            <Ionicons
              name={feedback.isError ? 'close-circle' : 'checkmark-circle'}
              size={18}
              color={feedback.isError ? UI_COLORS.danger : UI_COLORS.accent}
            />
            <Text
              style={[
                styles.feedbackText,
                { color: feedback.isError ? UI_COLORS.danger : UI_COLORS.accent },
              ]}
            >
              {feedback.message}
            </Text>
          </View>
        )}

        {/* Chessboard */}
        {gameService && (
          <View style={styles.boardWrapper}>
            <ChessBoard
              chess={gameService.getChess()}
              orientation={currentPuzzle.playerColor}
              interactive={solutionStep < currentPuzzle.solutionUci.length}
              onMove={handleUserMove}
            />
          </View>
        )}

        {/* Bottom Paging Controls */}
        <View style={styles.paginationBar}>
          <TouchableOpacity
            style={[styles.pageButton, currentPuzzleIndex === 0 && styles.disabledButton]}
            disabled={currentPuzzleIndex === 0}
            onPress={() => setCurrentPuzzleIndex(prev => Math.max(0, prev - 1))}
          >
            <Ionicons name="chevron-back" size={20} color={UI_COLORS.text} />
            <Text style={styles.pageButtonText}>Previous</Text>
          </TouchableOpacity>

          <Text style={styles.pageCounter}>
            {currentPuzzleIndex + 1} / {filteredPuzzles.length}
          </Text>

          <TouchableOpacity
            style={[
              styles.pageButton,
              currentPuzzleIndex >= filteredPuzzles.length - 1 && styles.disabledButton,
            ]}
            disabled={currentPuzzleIndex >= filteredPuzzles.length - 1}
            onPress={() => setCurrentPuzzleIndex(prev => Math.min(filteredPuzzles.length - 1, prev + 1))}
          >
            <Text style={styles.pageButtonText}>Next</Text>
            <Ionicons name="chevron-forward" size={20} color={UI_COLORS.text} />
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    paddingBottom: 16,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
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
  categoriesScroll: {
    maxHeight: 38,
    marginVertical: 4,
  },
  categoriesContent: {
    gap: 8,
    paddingHorizontal: 2,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: UI_COLORS.surface,
    borderWidth: 1,
    borderColor: UI_COLORS.surfaceBorder,
  },
  activeCategoryChip: {
    backgroundColor: UI_COLORS.primary,
    borderColor: UI_COLORS.primary,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: UI_COLORS.textMuted,
  },
  activeCategoryChipText: {
    color: '#FFF',
    fontWeight: '700',
  },
  puzzleHeader: {
    backgroundColor: UI_COLORS.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: UI_COLORS.surfaceBorder,
    marginVertical: 4,
  },
  puzzleBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  puzzleTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: UI_COLORS.text,
  },
  solvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  solvedText: {
    fontSize: 12,
    fontWeight: '700',
    color: UI_COLORS.accent,
  },
  puzzleSub: {
    fontSize: 12,
    color: UI_COLORS.textMuted,
    marginTop: 2,
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    gap: 8,
    marginVertical: 2,
  },
  hintText: {
    fontSize: 12,
    color: UI_COLORS.warning,
    flex: 1,
  },
  feedbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    gap: 8,
    marginVertical: 2,
    borderWidth: 1,
  },
  feedbackError: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  feedbackSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  feedbackText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  boardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  pageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI_COLORS.surface,
    borderColor: UI_COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 4,
  },
  disabledButton: {
    opacity: 0.35,
  },
  pageButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: UI_COLORS.text,
  },
  pageCounter: {
    fontSize: 13,
    fontWeight: '700',
    color: UI_COLORS.textMuted,
  },
});

