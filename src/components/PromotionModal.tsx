import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Color, PieceSymbol } from 'chess.js';
import { ChessPiece } from './ChessPiece';
import { UI_COLORS } from '../theme/colors';

interface PromotionModalProps {
  visible: boolean;
  color: Color;
  onSelectPiece: (piece: PieceSymbol) => void;
  onCancel?: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  visible,
  color,
  onSelectPiece,
}) => {
  const pieces: PieceSymbol[] = ['q', 'r', 'b', 'n'];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.title}>Promote Pawn</Text>
          <Text style={styles.subtitle}>Choose your promotion piece</Text>
          <View style={styles.piecesRow}>
            {pieces.map(piece => (
              <TouchableOpacity
                key={piece}
                style={styles.pieceButton}
                activeOpacity={0.7}
                onPress={() => onSelectPiece(piece)}
              >
                <ChessPiece type={piece} color={color} size={54} />
                <Text style={styles.pieceLabel}>
                  {piece === 'q' ? 'Queen' : piece === 'r' ? 'Rook' : piece === 'b' ? 'Bishop' : 'Knight'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: UI_COLORS.surface,
    borderColor: UI_COLORS.surfaceBorder,
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: UI_COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: UI_COLORS.textMuted,
    marginBottom: 20,
  },
  piecesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  pieceButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: UI_COLORS.surfaceHighlight,
    borderWidth: 1,
    borderColor: UI_COLORS.surfaceBorder,
    minWidth: 72,
  },
  pieceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: UI_COLORS.textMuted,
    marginTop: 6,
  },
});

