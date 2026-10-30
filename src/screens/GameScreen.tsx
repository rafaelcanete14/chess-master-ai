import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Square, PieceSymbol, Color } from 'chess.js';
import { ChessGameService, GameStatus } from '../chess/ChessGameService';
import { chessEngine, EngineAnalysis } from '../chess/ChessEngine';
import { getDifficultyConfig } from '../chess/DifficultyManager';
import { getCapturedPieces } from '../chess/Evaluation';
import { StorageService } from '../storage/StorageService';
import { AudioService } from '../services/AudioService';
import { HapticsService } from '../services/HapticsService';
import { ChessBoard } from '../components/ChessBoard';
import { ChessClock } from '../components/ChessClock';
import { MoveHistory } from '../components/MoveHistory';
import { ThinkingIndicator } from '../components/ThinkingIndicator';
import { ChessPiece } from '../components/ChessPiece';
import { GameMode, DifficultyLevel, GameSettings, SavedGame } from '../types/chess';
import { UI_COLORS } from '../theme/colors';

interface GameScreenProps {
  mode: GameMode;
  difficulty?: DifficultyLevel;
  onBack: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  mode = 'ai',
  difficulty = 4,
  onBack,
}) => {
  const [gameService] = useState<ChessGameService>(() => new ChessGameService());
  const [boardFen, setBoardFen] = useState<string>(gameService.getFen());
  const [status, setStatus] = useState<GameStatus>(gameService.getStatus());
  const [settings, setSettings] = useState<GameSettings | null>(null);

  // Player orientation: White bottom or Black bottom
  const [orientation, setOrientation] = useState<Color>('w');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [engineAnalysis, setEngineAnalysis] = useState<EngineAnalysis | null>(null);

  // Clocks
  const [whiteClock, setWhiteClock] = useState<number>(600);
  const [blackClock, setBlackClock] = useState<number>(600);
  const [clockRunning, setClockRunning] = useState<boolean>(false);

  // Modals
  const [gameOverModalVisible, setGameOverModalVisible] = useState<boolean>(false);
  const [gameResultTitle, setGameResultTitle] = useState<string>('');
  const [gameResultSubtitle, setGameResultSubtitle] = useState<string>('');

  const startTimeRef = useRef<number>(Date.now());
  const isAiTurnRef = useRef<boolean>(false);

  const diffConfig = getDifficultyConfig(difficulty);

  // Initial setup
  useEffect(() => {
    loadSettings();
    AudioService.init();
  }, []);

  const loadSettings = async () => {
    const s = await StorageService.getSettings();
    setSettings(s);

    // Set orientation based on settings for AI mode
    let userColor: Color = 'w';
    if (mode === 'ai') {
      if (s.playerColor === 'random') {
        userColor = Math.random() < 0.5 ? 'w' : 'b';
      } else {
        userColor = s.playerColor as Color;
      }
    }
    setOrientation(userColor);

    if (s.clockSettings.enabled) {
      setWhiteClock(s.clockSettings.initialSeconds);
      setBlackClock(s.clockSettings.initialSeconds);
      setClockRunning(true);
    } else {
      setClockRunning(false);
    }
  };

  const handleGameOver = useCallback(async (winner: Color | 'draw', reason: string) => {
    setClockRunning(false);
    setIsAiThinking(false);

    let title = '';
    let subtitle = reason;
    let statResult: 'win' | 'loss' | 'draw' = 'draw';

    if (winner === 'draw') {
      title = 'Game Drawn';
      statResult = 'draw';
      AudioService.playSound('game_over');
      HapticsService.warning();
    } else {
      const isWinnerWhite = winner === 'w';
      if (mode === 'ai') {
        const userWon = winner === orientation;
        title = userWon ? 'Victory!' : 'Defeat!';
        subtitle = `${userWon ? 'You won' : 'AI won'} by ${reason}`;
        statResult = userWon ? 'win' : 'loss';
        if (userWon) {
          AudioService.playSound('victory');
          HapticsService.success();
        } else {
          AudioService.playSound('game_over');
          HapticsService.error();
        }
      } else {
        title = `${isWinnerWhite ? 'White' : 'Black'} Wins!`;
        AudioService.playSound('victory');
        HapticsService.success();
      }
    }

    setGameResultTitle(title);
    setGameResultSubtitle(subtitle);
    setGameOverModalVisible(true);

    // Save statistics & history
    const playDuration = Math.round((Date.now() - startTimeRef.current) / 1000);
    await StorageService.updateGameStats(statResult, mode === 'ai' ? difficulty : undefined, playDuration);

    const savedGame: SavedGame = {
      id: `game-${Date.now()}`,
      date: new Date().toISOString(),
      mode,
      playerColor: orientation,
      difficulty: mode === 'ai' ? difficulty : undefined,
      fen: gameService.getFen(),
      pgn: gameService.getPgn(),
      moveHistory: gameService.getMoveHistory(),
      isCompleted: true,
      result: winner === 'w' ? '1-0' : winner === 'b' ? '0-1' : '1/2-1/2',
      resultReason: reason,
      whiteTimeRemaining: whiteClock,
      blackTimeRemaining: blackClock,
    };
    await StorageService.archiveCompletedGame(savedGame);
  }, [mode, difficulty, orientation, gameService, whiteClock, blackClock]);

  // AI Turn triggering
  const triggerAiMove = useCallback(async () => {
    if (isAiThinking || isAiTurnRef.current) return;
    const currentTurn = gameService.getTurn();

    // Check if it's AI's turn
    if (mode === 'ai' && currentTurn !== orientation && !gameService.getChess().isGameOver()) {
      isAiTurnRef.current = true;
      setIsAiThinking(true);
      setEngineAnalysis(null);

      try {
        const bestMove = await chessEngine.findBestMove(
          gameService.getChess(),
          diffConfig,
          (analysis) => setEngineAnalysis(analysis)
        );

        if (bestMove) {
          const executed = gameService.makeMove(bestMove.from, bestMove.to, bestMove.promotion);
          if (executed) {
            setBoardFen(gameService.getFen());
            const newStatus = gameService.getStatus();
            setStatus(newStatus);

            // Audio & Haptics
            if (executed.captured) {
              AudioService.playSound('capture');
              HapticsService.medium();
            } else if (newStatus.inCheck) {
              AudioService.playSound('check');
              HapticsService.heavy();
            } else {
              AudioService.playSound('move');
              HapticsService.light();
            }

            if (newStatus.isOver) {
              handleGameOver(newStatus.winner || 'draw', newStatus.statusMessage);
            }
          }
        }
      } catch (err) {
        console.warn('AI Move generation error:', err);
      } finally {
        setIsAiThinking(false);
        isAiTurnRef.current = false;
      }
    }
  }, [isAiThinking, gameService, mode, orientation, diffConfig, handleGameOver]);

  // Trigger AI whenever board updates and it's AI turn
  useEffect(() => {
    if (mode === 'ai' && gameService.getTurn() !== orientation && !status.isOver) {
      triggerAiMove();
    }
  }, [boardFen, mode, orientation, status.isOver, triggerAiMove, gameService]);

  // User Move Handler
  const handleUserMove = (from: Square, to: Square, promotion: PieceSymbol = 'q') => {
    if (isAiThinking || status.isOver) return;

    // In AI mode, prevent moving during AI turn
    if (mode === 'ai' && gameService.getTurn() !== orientation) return;

    const move = gameService.makeMove(from, to, promotion);
    if (!move) {
      HapticsService.error();
      return;
    }

    setBoardFen(gameService.getFen());
    const newStatus = gameService.getStatus();
    setStatus(newStatus);

    // Audio & Haptics
    if (move.captured) {
      AudioService.playSound('capture');
      HapticsService.medium();
    } else if (newStatus.inCheck) {
      AudioService.playSound('check');
      HapticsService.heavy();
    } else if (move.san.includes('O-O')) {
      AudioService.playSound('castle');
      HapticsService.light();
    } else {
      AudioService.playSound('move');
      HapticsService.light();
    }

    // Auto-flip in Pass & Play if configured
    if (mode === 'pass_and_play' && settings?.flipBoardOnPassAndPlay) {
      setOrientation(prev => prev === 'w' ? 'b' : 'w');
    }

    if (newStatus.isOver) {
      handleGameOver(newStatus.winner || 'draw', newStatus.statusMessage);
    }
  };

  const handleUndo = () => {
    if (isAiThinking) return;

    if (mode === 'ai') {
      // In AI mode, undo both the AI move and the player's last move
      gameService.undoMove();
      gameService.undoMove();
    } else {
      // In 2P mode, undo one move
      gameService.undoMove();
    }

    setBoardFen(gameService.getFen());
    setStatus(gameService.getStatus());
    HapticsService.light();
  };

  const handleFlipBoard = () => {
    setOrientation(prev => prev === 'w' ? 'b' : 'w');
    HapticsService.light();
  };

  const handleRestart = () => {
    Alert.alert('Restart Game', 'Are you sure you want to start a new match?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Restart',
        style: 'destructive',
        onPress: () => {
          gameService.reset();
          setBoardFen(gameService.getFen());
          setStatus(gameService.getStatus());
          setGameOverModalVisible(false);
          setIsAiThinking(false);
          startTimeRef.current = Date.now();
          if (settings?.clockSettings.enabled) {
            setWhiteClock(settings.clockSettings.initialSeconds);
            setBlackClock(settings.clockSettings.initialSeconds);
            setClockRunning(true);
          }
        },
      },
    ]);
  };

  const handleResign = () => {
    Alert.alert('Resign Game', 'Are you sure you want to resign this match?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Resign',
        style: 'destructive',
        onPress: () => {
          const resignWinner = gameService.getTurn() === 'w' ? 'b' : 'w';
          handleGameOver(resignWinner, 'Resignation');
        },
      },
    ]);
  };

  const handleTimeout = (loser: Color) => {
    const winner = loser === 'w' ? 'b' : 'w';
    handleGameOver(winner, 'Timeout (Clock expired)');
  };

  const captures = getCapturedPieces(gameService.getChess());
  const lastMove = gameService.getLastMove();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top App Bar */}
        <View style={styles.appBar}>
          <TouchableOpacity style={styles.appBarButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color={UI_COLORS.text} />
          </TouchableOpacity>
          <View style={styles.titleColumn}>
            <Text style={styles.gameModeTitle}>
              {mode === 'ai' ? `vs ${diffConfig.title}` : 'Pass & Play'}
            </Text>
            <Text style={styles.gameModeSubtitle}>
              {mode === 'ai' ? `Level ${diffConfig.level} • ${diffConfig.name}` : 'Local 2-Player'}
            </Text>
          </View>
          <TouchableOpacity style={styles.appBarButton} onPress={handleRestart}>
            <Ionicons name="refresh" size={22} color={UI_COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Clocks (if enabled) */}
        {settings?.clockSettings.enabled && (
          <ChessClock
            whiteSeconds={whiteClock}
            blackSeconds={blackClock}
            activeColor={gameService.getTurn()}
            isRunning={clockRunning && !status.isOver}
            onTick={(w, b) => {
              setWhiteClock(w);
              setBlackClock(b);
            }}
            onTimeout={handleTimeout}
          />
        )}

        {/* Opponent Card / Captured Pieces Header */}
        <View style={styles.playerBar}>
          <View style={styles.playerInfo}>
            <View style={[styles.playerAvatar, { backgroundColor: '#2E3547' }]}>
              <Ionicons
                name={mode === 'ai' ? 'hardware-chip' : 'person'}
                size={18}
                color={UI_COLORS.primary}
              />
            </View>
            <Text style={styles.playerName}>
              {mode === 'ai' ? diffConfig.title : orientation === 'w' ? 'Black' : 'White'}
            </Text>
          </View>
          <View style={styles.capturedRow}>
            {captures.whiteCaptures.map((p, idx) => (
              <ChessPiece key={`wc-${idx}`} type={p} color="b" size={18} />
            ))}
            {captures.scoreAdvantage > 0 && (
              <Text style={styles.advantageText}>+{captures.scoreAdvantage}</Text>
            )}
          </View>
        </View>

        {/* AI Thinking Indicator */}
        {isAiThinking && (
          <ThinkingIndicator
            config={diffConfig}
            analysis={engineAnalysis}
            onCancel={() => chessEngine.cancelSearch()}
          />
        )}

        {/* Primary Interactive Chessboard */}
        <View style={styles.boardWrapper}>
          <ChessBoard
            chess={gameService.getChess()}
            orientation={orientation}
            themeId={settings?.boardTheme}
            lastMove={lastMove}
            isInCheck={status.inCheck}
            interactive={!isAiThinking && !status.isOver}
            onMove={handleUserMove}
          />
        </View>

        {/* Player Card / User Captured Pieces */}
        <View style={styles.playerBar}>
          <View style={styles.playerInfo}>
            <View style={[styles.playerAvatar, { backgroundColor: '#3A445C' }]}>
              <Ionicons name="person" size={18} color={UI_COLORS.accent} />
            </View>
            <Text style={styles.playerName}>
              {mode === 'ai' ? 'You' : orientation === 'w' ? 'White' : 'Black'}
            </Text>
          </View>
          <View style={styles.capturedRow}>
            {captures.blackCaptures.map((p, idx) => (
              <ChessPiece key={`bc-${idx}`} type={p} color="w" size={18} />
            ))}
            {captures.scoreAdvantage < 0 && (
              <Text style={styles.advantageText}>+{Math.abs(captures.scoreAdvantage)}</Text>
            )}
          </View>
        </View>

        {/* Move History */}
        <MoveHistory history={gameService.getMoveHistory()} />

        {/* Bottom Game Controls */}
        <View style={styles.controlsBar}>
          <TouchableOpacity
            style={[styles.controlBtn, isAiThinking && styles.disabledBtn]}
            onPress={handleUndo}
            disabled={isAiThinking}
          >
            <Ionicons name="arrow-undo" size={20} color={UI_COLORS.text} />
            <Text style={styles.controlBtnText}>Undo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.controlBtn} onPress={handleFlipBoard}>
            <Ionicons name="swap-vertical" size={20} color={UI_COLORS.text} />
            <Text style={styles.controlBtnText}>Flip</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, styles.resignBtn]}
            onPress={handleResign}
          >
            <Ionicons name="flag" size={20} color={UI_COLORS.danger} />
            <Text style={[styles.controlBtnText, { color: UI_COLORS.danger }]}>Resign</Text>
          </TouchableOpacity>
        </View>

        {/* Game Over Modal */}
        <Modal visible={gameOverModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.resultCard}>
              <Ionicons
                name={gameResultTitle.includes('Victory') ? 'trophy' : 'ribbon'}
                size={54}
                color={gameResultTitle.includes('Victory') ? UI_COLORS.gold : UI_COLORS.primary}
                style={styles.modalIcon}
              />
              <Text style={styles.resultTitle}>{gameResultTitle}</Text>
              <Text style={styles.resultSubtitle}>{gameResultSubtitle}</Text>

              <View style={styles.modalButtonRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalSecondaryBtn]}
                  onPress={() => {
                    setGameOverModalVisible(false);
                    onBack();
                  }}
                >
                  <Text style={styles.modalSecondaryText}>Main Menu</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalPrimaryBtn]}
                  onPress={() => {
                    gameService.reset();
                    setBoardFen(gameService.getFen());
                    setStatus(gameService.getStatus());
                    setGameOverModalVisible(false);
                    startTimeRef.current = Date.now();
                  }}
                >
                  <Text style={styles.modalPrimaryText}>Play Again</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    paddingHorizontal: 14,
    justifyContent: 'space-between',
    paddingBottom: 12,
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
  gameModeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: UI_COLORS.text,
  },
  gameModeSubtitle: {
    fontSize: 11,
    color: UI_COLORS.textMuted,
  },
  playerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginVertical: 4,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '700',
    color: UI_COLORS.text,
  },
  capturedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  advantageText: {
    fontSize: 12,
    fontWeight: '700',
    color: UI_COLORS.gold,
    marginLeft: 4,
  },
  boardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  controlsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 6,
    gap: 10,
  },
  controlBtn: {
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
  resignBtn: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  controlBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: UI_COLORS.text,
  },
  disabledBtn: {
    opacity: 0.4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  resultCard: {
    backgroundColor: UI_COLORS.surface,
    borderColor: UI_COLORS.surfaceBorder,
    borderWidth: 1.5,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  modalIcon: {
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: UI_COLORS.text,
    marginBottom: 6,
  },
  resultSubtitle: {
    fontSize: 14,
    color: UI_COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalPrimaryBtn: {
    backgroundColor: UI_COLORS.primary,
  },
  modalSecondaryBtn: {
    backgroundColor: UI_COLORS.surfaceHighlight,
    borderWidth: 1,
    borderColor: UI_COLORS.surfaceBorder,
  },
  modalPrimaryText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 15,
  },
  modalSecondaryText: {
    color: UI_COLORS.text,
    fontWeight: '600',
    fontSize: 15,
  },
});

