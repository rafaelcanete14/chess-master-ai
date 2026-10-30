import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Chess, Square, Color, PieceSymbol } from 'chess.js';
import { ChessSquare } from './ChessSquare';
import { PromotionModal } from './PromotionModal';
import { BoardTheme, MoveRecord } from '../types/chess';
import { BOARD_THEMES } from '../theme/colors';

interface ChessBoardProps {
  chess: Chess;
  orientation: Color;
  themeId?: string;
  lastMove?: MoveRecord | null;
  isInCheck?: boolean;
  interactive?: boolean;
  onMove: (from: Square, to: Square, promotion?: PieceSymbol) => void;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  chess,
  orientation,
  themeId = 'emerald_modern',
  lastMove,
  isInCheck,
  interactive = true,
  onMove,
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  const theme: BoardTheme = BOARD_THEMES[themeId as keyof typeof BOARD_THEMES] || BOARD_THEMES.emerald_modern;

  // Screen-responsive board size
  const screenWidth = Dimensions.get('window').width;
  // Maximum width constrained for comfortable margins on iPhone 16 Pro Max (430pt) and iPads
  const boardSize = Math.min(screenWidth - 24, 410);
  const squareSize = Math.floor(boardSize / 8);

  const files = useMemo(() => {
    return orientation === 'w' ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];
  }, [orientation]);

  const ranks = useMemo(() => {
    return orientation === 'w' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];
  }, [orientation]);

  // Current legal destination squares from selected square
  const legalTargets = useMemo(() => {
    if (!selectedSquare) return new Map<Square, boolean>(); // Map<square, isCapture>
    const moves = chess.moves({ square: selectedSquare, verbose: true });
    const map = new Map<Square, boolean>();
    moves.forEach(m => {
      map.set(m.to, !!m.captured);
    });
    return map;
  }, [selectedSquare, chess]);

  // Find King in check square
  const checkedKingSquare = useMemo(() => {
    if (!isInCheck) return null;
    const currentTurn = chess.turn();
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === currentTurn) {
          return `${String.fromCharCode(97 + c)}${8 - r}` as Square;
        }
      }
    }
    return null;
  }, [isInCheck, chess]);

  const handleSquarePress = (square: Square) => {
    if (!interactive) return;

    // If already selected and tapping legal target -> attempt move
    if (selectedSquare) {
      if (legalTargets.has(square)) {
        const piece = chess.get(selectedSquare);
        // Check for pawn promotion (pawn moving to 8th or 1st rank)
        if (piece && piece.type === 'p' && (square.endsWith('8') || square.endsWith('1'))) {
          setPendingPromotion({ from: selectedSquare, to: square });
          return;
        }

        onMove(selectedSquare, square);
        setSelectedSquare(null);
        return;
      }

      // If tapping own piece -> switch selection
      const clickedPiece = chess.get(square);
      if (clickedPiece && clickedPiece.color === chess.turn()) {
        setSelectedSquare(square);
        return;
      }

      // Deselect if tapping elsewhere
      setSelectedSquare(null);
      return;
    }

    // First tap: select own piece
    const piece = chess.get(square);
    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
    }
  };

  const handlePromotionSelect = (promoPiece: PieceSymbol) => {
    if (pendingPromotion) {
      onMove(pendingPromotion.from, pendingPromotion.to, promoPiece);
      setPendingPromotion(null);
      setSelectedSquare(null);
    }
  };

  return (
    <View style={[styles.container, { width: squareSize * 8, height: squareSize * 8 }]}>
      <View style={[styles.boardGrid, { borderColor: theme.boardBorder }]}>
        {ranks.map((rank, rankIdx) => (
          <View key={`rank-${rank}`} style={styles.rankRow}>
            {files.map((file, fileIdx) => {
              const square = `${file}${rank}` as Square;
              const isLight = (file.charCodeAt(0) - 97 + rank) % 2 !== 0;
              const piece = chess.get(square);

              const isSelected = selectedSquare === square;
              const isLegal = legalTargets.has(square);
              const isCapture = legalTargets.get(square) === true;
              const isLastMoveSquare = !!lastMove && (lastMove.from === square || lastMove.to === square);
              const isCheckKing = checkedKingSquare === square;

              const showFileLabel = rankIdx === 7;
              const showRankLabel = fileIdx === 0;

              return (
                <ChessSquare
                  key={square}
                  square={square}
                  file={file}
                  rank={rank}
                  isLight={isLight}
                  size={squareSize}
                  theme={theme}
                  piece={piece}
                  isSelected={isSelected}
                  isLegalTarget={isLegal}
                  isLegalCapture={isCapture}
                  isLastMove={isLastMoveSquare}
                  isInCheck={isCheckKing}
                  showCoordinates={true}
                  showFileLabel={showFileLabel}
                  showRankLabel={showRankLabel}
                  onPress={handleSquarePress}
                />
              );
            })}
          </View>
        ))}
      </View>

      {/* Promotion Choice Modal */}
      {pendingPromotion && (
        <PromotionModal
          visible={true}
          color={chess.turn()}
          onSelectPiece={handlePromotionSelect}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    borderRadius: 8,
  },
  boardGrid: {
    borderRadius: 8,
    borderWidth: 3,
    overflow: 'hidden',
  },
  rankRow: {
    flexDirection: 'row',
  },
});

