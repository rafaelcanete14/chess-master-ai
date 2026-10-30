import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G, Circle } from 'react-native-svg';
import { PieceSymbol, Color } from 'chess.js';

interface ChessPieceProps {
  type: PieceSymbol;
  color: Color;
  size: number;
}

export const ChessPiece: React.FC<ChessPieceProps> = ({ type, color, size }) => {
  const isWhite = color === 'w';
  const fillColor = isWhite ? '#FFFFFF' : '#222226';
  const strokeColor = isWhite ? '#27272A' : '#ECECEC';
  const strokeWidth = 1.6;

  const renderPieceSvg = () => {
    switch (type) {
      case 'p': // PAWN
        return (
          <G fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <Circle cx="22.5" cy="12" r="6" />
            <Path d="M 17,21 C 17,19 28,19 28,21 C 28,24 26,26 26,29 C 27,33 33,35 33,38 L 12,38 C 12,35 18,33 19,29 C 19,26 17,24 17,21 z" />
            <Path d="M 10,40 L 35,40" strokeWidth="2.2" />
          </G>
        );

      case 'n': // KNIGHT
        return (
          <G fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18" />
            <Path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.5,7 18.5,8 C 20.5,10 22,10 22,10 z" />
            <Circle cx="15.5" cy="15.5" r="1.5" fill={strokeColor} />
            <Path d="M 10,40 L 37,40" strokeWidth="2.2" />
          </G>
        );

      case 'b': // BISHOP
        return (
          <G fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <Circle cx="22.5" cy="7.5" r="2" />
            <Path d="M 12.5,37 C 12.5,33 17,31 17,27 C 14.5,23.5 14.5,17 19.5,12 C 20.5,11 24.5,11 25.5,12 C 30.5,17 30.5,23.5 28,27 C 28,31 32.5,33 32.5,37" />
            <Path d="M 17,20 L 28,20" />
            <Path d="M 22.5,15.5 L 22.5,24.5" />
            <Path d="M 10,40 L 35,40" strokeWidth="2.2" />
          </G>
        );

      case 'r': // ROOK
        return (
          <G fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M 12,38 L 33,38 L 31,17 L 14,17 z" />
            <Path d="M 11,17 L 11,9 L 16,9 L 16,13 L 20,13 L 20,9 L 25,9 L 25,13 L 29,13 L 29,9 L 34,9 L 34,17 z" />
            <Path d="M 9,40 L 36,40" strokeWidth="2.2" />
          </G>
        );

      case 'q': // QUEEN
        return (
          <G fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <Circle cx="7.5" cy="12" r="2" />
            <Circle cx="15" cy="8.5" r="2" />
            <Circle cx="22.5" cy="7" r="2" />
            <Circle cx="30" cy="8.5" r="2" />
            <Circle cx="37.5" cy="12" r="2" />
            <Path d="M 9,37 C 10.5,33 13,29 13.5,26 C 14.5,20 11.5,18 7.5,14 C 11.5,18 15,18 15,10.5 C 17,16 22.5,16 22.5,9 C 22.5,16 28,16 30,10.5 C 30,18 33.5,18 37.5,14 C 33.5,18 30.5,20 31.5,26 C 32,29 34.5,33 36,37 z" />
            <Path d="M 11.5,37 C 16,35 29,35 33.5,37" />
            <Path d="M 9,40 L 36,40" strokeWidth="2.2" />
          </G>
        );

      case 'k': // KING
        return (
          <G fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M 22.5,6 L 22.5,13" strokeWidth="2.4" />
            <Path d="M 19,9.5 L 26,9.5" strokeWidth="2.4" />
            <Path d="M 12.5,37 C 15,33.5 15.5,28 17.5,25 C 19.5,22 17,18 17,15 C 17,13.5 20,13 22.5,13 C 25,13 28,13.5 28,15 C 28,18 25.5,22 27.5,25 C 29.5,28 30,33.5 32.5,37 z" />
            <Path d="M 12,37 C 17,35 28,35 33,37" />
            <Circle cx="22.5" cy="18" r="3" fill={strokeColor} />
            <Path d="M 9,40 L 36,40" strokeWidth="2.2" />
          </G>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size * 0.88} height={size * 0.88} viewBox="0 0 45 45">
        {renderPieceSvg()}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
