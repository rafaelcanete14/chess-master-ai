import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MoveRecord } from '../types/chess';
import { UI_COLORS } from '../theme/colors';

interface MoveHistoryProps {
  history: MoveRecord[];
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({ history }) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [history.length]);

  // Group moves into pairs (White move, Black move)
  const movePairs: { num: number; white: string; black?: string }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      white: history[i].san,
      black: history[i + 1]?.san,
    });
  }

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {movePairs.length === 0 ? (
          <Text style={styles.emptyText}>No moves yet</Text>
        ) : (
          movePairs.map((pair, index) => {
            const isLatest = index === movePairs.length - 1;
            return (
              <View key={`move-pair-${pair.num}`} style={styles.pairContainer}>
                <Text style={styles.moveNumber}>{pair.num}.</Text>
                <View style={[styles.movePill, isLatest && !pair.black && styles.activePill]}>
                  <Text style={[styles.moveText, isLatest && !pair.black && styles.activeText]}>
                    {pair.white}
                  </Text>
                </View>
                {pair.black && (
                  <View style={[styles.movePill, isLatest && styles.activePill]}>
                    <Text style={[styles.moveText, isLatest && styles.activeText]}>
                      {pair.black}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: UI_COLORS.surface,
    borderColor: UI_COLORS.surfaceBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 4,
    height: 48,
    justifyContent: 'center',
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: UI_COLORS.textDim,
    fontStyle: 'italic',
  },
  pairContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  moveNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: UI_COLORS.textDim,
    marginRight: 4,
  },
  movePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'transparent',
    marginRight: 2,
  },
  activePill: {
    backgroundColor: UI_COLORS.primary,
  },
  moveText: {
    fontSize: 13,
    fontWeight: '600',
    color: UI_COLORS.text,
  },
  activeText: {
    color: '#FFF',
    fontWeight: '700',
  },
});

