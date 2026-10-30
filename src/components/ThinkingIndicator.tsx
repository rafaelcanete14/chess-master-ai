import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { DifficultyConfig } from '../types/chess';
import { EngineAnalysis } from '../chess/ChessEngine';
import { UI_COLORS } from '../theme/colors';

interface ThinkingIndicatorProps {
  config: DifficultyConfig;
  analysis?: EngineAnalysis | null;
  onCancel?: () => void;
}

export const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({
  config,
  analysis,
  onCancel,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.contentRow}>
        <ActivityIndicator size="small" color={UI_COLORS.primary} style={styles.spinner} />
        <View style={styles.textColumn}>
          <Text style={styles.botTitle}>
            {config.title} (Level {config.level})
          </Text>
          <Text style={styles.statusText}>
            Thinking... {analysis ? `Depth ${analysis.depth} • Eval ${analysis.score > 0 ? `+${analysis.score}` : analysis.score}` : `Calculating`}
          </Text>
        </View>
      </View>

      {onCancel && (
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Stop</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginVertical: 4,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  spinner: {
    marginRight: 10,
  },
  textColumn: {
    flex: 1,
  },
  botTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: UI_COLORS.primary,
  },
  statusText: {
    fontSize: 11,
    color: UI_COLORS.textMuted,
    marginTop: 1,
  },
  cancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  cancelText: {
    fontSize: 12,
    fontWeight: '600',
    color: UI_COLORS.danger,
  },
});

