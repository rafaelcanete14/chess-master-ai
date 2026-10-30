import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Color } from 'chess.js';
import { UI_COLORS } from '../theme/colors';

interface ChessClockProps {
  whiteSeconds: number;
  blackSeconds: number;
  activeColor: Color | null;
  isRunning: boolean;
  onTick: (whiteRemaining: number, blackRemaining: number) => void;
  onTimeout: (loser: Color) => void;
}

export const ChessClock: React.FC<ChessClockProps> = ({
  whiteSeconds,
  blackSeconds,
  activeColor,
  isRunning,
  onTick,
  onTimeout,
}) => {
  const lastTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isRunning || !activeColor) return;

    lastTimeRef.current = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSec = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      if (activeColor === 'w') {
        const next = Math.max(0, whiteSeconds - deltaSec);
        if (next <= 0) {
          clearInterval(interval);
          onTimeout('w');
        } else {
          onTick(next, blackSeconds);
        }
      } else {
        const next = Math.max(0, blackSeconds - deltaSec);
        if (next <= 0) {
          clearInterval(interval);
          onTimeout('b');
        } else {
          onTick(whiteSeconds, next);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, activeColor, whiteSeconds, blackSeconds, onTick, onTimeout]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    const tenths = Math.floor((totalSeconds % 1) * 10);
    if (totalSeconds < 10) {
      return `${mins}:${secs.toString().padStart(2, '0')}.${tenths}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isWhiteActive = activeColor === 'w' && isRunning;
  const isBlackActive = activeColor === 'b' && isRunning;

  const isWhiteLow = whiteSeconds < 30;
  const isBlackLow = blackSeconds < 30;

  return (
    <View style={styles.container}>
      {/* Black Clock */}
      <View
        style={[
          styles.clockBadge,
          isBlackActive && styles.clockBadgeActive,
          isBlackLow && styles.clockBadgeDanger,
        ]}
      >
        <View style={[styles.colorDot, { backgroundColor: '#333' }]} />
        <Text
          style={[
            styles.timeText,
            isBlackActive && styles.timeTextActive,
            isBlackLow && styles.timeTextDanger,
          ]}
        >
          {formatTime(blackSeconds)}
        </Text>
      </View>

      {/* White Clock */}
      <View
        style={[
          styles.clockBadge,
          isWhiteActive && styles.clockBadgeActive,
          isWhiteLow && styles.clockBadgeDanger,
        ]}
      >
        <View style={[styles.colorDot, { backgroundColor: '#FFF' }]} />
        <Text
          style={[
            styles.timeText,
            isWhiteActive && styles.timeTextActive,
            isWhiteLow && styles.timeTextDanger,
          ]}
        >
          {formatTime(whiteSeconds)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginVertical: 4,
  },
  clockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: UI_COLORS.surfaceHighlight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: UI_COLORS.surfaceBorder,
    minWidth: 90,
    justifyContent: 'center',
  },
  clockBadgeActive: {
    borderColor: UI_COLORS.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  clockBadgeDanger: {
    borderColor: UI_COLORS.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
    borderWidth: 0.5,
    borderColor: '#666',
  },
  timeText: {
    fontSize: 15,
    fontWeight: '700',
    color: UI_COLORS.textMuted,
    fontVariant: ['tabular-nums'],
  },
  timeTextActive: {
    color: UI_COLORS.text,
  },
  timeTextDanger: {
    color: UI_COLORS.danger,
  },
});
