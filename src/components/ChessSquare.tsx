import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Square, Color, PieceSymbol } from 'chess.js';
import { ChessPiece } from './ChessPiece';
import { BoardTheme } from '../types/chess';

interface ChessSquareProps {
  square: Square;
  file: string;
  rank: number;
  isLight: boolean;
  size: number;
  theme: BoardTheme;
  piece?: { type: PieceSymbol; color: Color } | null;
  isSelected: boolean;
  isLegalTarget: boolean;
  isLegalCapture: boolean;
  isLastMove: boolean;
  isInCheck: boolean;
  showCoordinates: boolean;
  showFileLabel: boolean;
  showRankLabel: boolean;
  onPress: (square: Square) => void;
}

export const ChessSquare: React.FC<ChessSquareProps> = React.memo(({
  square,
  file,
  rank,
  isLight,
  size,
  theme,
  piece,
  isSelected,
  isLegalTarget,
  isLegalCapture,
  isLastMove,
  isInCheck,
  showFileLabel,
  showRankLabel,
  onPress,
}) => {
  // Background base color
  let bgColor = isLight ? theme.lightSquare : theme.darkSquare;
  if (isSelected) {
    bgColor = theme.selectedSquare;
  } else if (isInCheck) {
    bgColor = theme.checkHighlight;
  } else if (isLastMove) {
    bgColor = isLight ? '#E4E89B' : '#B8BE58';
  }

  const labelColor = isLight ? theme.darkSquare : theme.lightSquare;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.square, { width: size, height: size, backgroundColor: bgColor }]}
      onPress={() => onPress(square)}
    >
      {/* Rank Label (top-left) */}
      {showRankLabel && (
        <Text style={[styles.rankLabel, { color: labelColor }]}>{rank}</Text>
      )}

      {/* File Label (bottom-right) */}
      {showFileLabel && (
        <Text style={[styles.fileLabel, { color: labelColor }]}>{file}</Text>
      )}

      {/* Piece */}
      {piece && (
        <ChessPiece type={piece.type} color={piece.color} size={size} />
      )}

      {/* Move Hint Dot (for non-capture legal moves) */}
      {isLegalTarget && !piece && (
        <View style={styles.dotContainer}>
          <View
            style={[
              styles.moveDot,
              { width: size * 0.32, height: size * 0.32, backgroundColor: theme.legalMoveDot },
            ]}
          />
        </View>
      )}

      {/* Capture Ring / Border Hint (for legal captures) */}
      {isLegalCapture && (
        <View
          style={[
            styles.captureRing,
            {
              width: size * 0.88,
              height: size * 0.88,
              borderColor: theme.legalCaptureRing,
            },
          ]}
        />
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  square: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  rankLabel: {
    position: 'absolute',
    top: 2,
    left: 3,
    fontSize: 10,
    fontWeight: '700',
    opacity: 0.8,
  },
  fileLabel: {
    position: 'absolute',
    bottom: 2,
    right: 3,
    fontSize: 10,
    fontWeight: '700',
    opacity: 0.8,
  },
  dotContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moveDot: {
    borderRadius: 999,
  },
  captureRing: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 4,
  },
});
