import { Chess, Square, PieceSymbol, Color } from 'chess.js';

// Piece base values in centipawns
export const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-Square Tables (oriented for White, from a8 to h1 index 0..63)
// Transformed so index 0 = a8, 7 = h8, 56 = a1, 63 = h1
const PAWN_TABLE: number[] = [
   0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
   5,  5, 10, 27, 27, 10,  5,  5,
   0,  0,  0, 25, 25,  0,  0,  0,
   5, -5,-10,  0,  0,-10, -5,  5,
   5, 10, 10,-25,-25, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const KNIGHT_TABLE: number[] = [
 -50,-40,-30,-30,-30,-30,-40,-50,
 -40,-20,  0,  5,  5,  0,-20,-40,
 -30,  5, 15, 20, 20, 15,  5,-30,
 -30,  0, 20, 25, 25, 20,  0,-30,
 -30,  5, 20, 25, 25, 20,  5,-30,
 -30,  0, 15, 20, 20, 15,  0,-30,
 -40,-20,  0,  0,  0,  0,-20,-40,
 -50,-40,-30,-30,-30,-30,-40,-50
];

const BISHOP_TABLE: number[] = [
 -20,-10,-10,-10,-10,-10,-10,-20,
 -10,  5,  0,  0,  0,  0,  5,-10,
 -10, 10, 10, 15, 15, 10, 10,-10,
 -10,  0, 15, 18, 18, 15,  0,-10,
 -10,  5, 10, 18, 18, 10,  5,-10,
 -10,  0, 10, 15, 15, 10,  0,-10,
 -10,  5,  0,  0,  0,  0,  5,-10,
 -20,-10,-10,-10,-10,-10,-10,-20
];

const ROOK_TABLE: number[] = [
   0,  0,  0,  5,  5,  0,  0,  0,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
  -5,  0,  0,  0,  0,  0,  0, -5,
   5, 10, 10, 10, 10, 10, 10,  5,
   0,  0,  0,  0,  0,  0,  0,  0
];

const QUEEN_TABLE: number[] = [
 -20,-10,-10, -5, -5,-10,-10,-20,
 -10,  0,  5,  0,  0,  0,  0,-10,
 -10,  5,  5,  5,  5,  5,  0,-10,
   0,  0,  5,  5,  5,  5,  0, -5,
  -5,  0,  5,  5,  5,  5,  0, -5,
 -10,  0,  5,  5,  5,  5,  0,-10,
 -10,  0,  0,  0,  0,  0,  0,-10,
 -20,-10,-10, -5, -5,-10,-10,-20
];

const KING_MIDDLE_TABLE: number[] = [
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -30,-40,-40,-50,-50,-40,-40,-30,
 -20,-30,-30,-40,-40,-30,-30,-20,
 -10,-20,-20,-20,-20,-20,-20,-10,
  20, 20,  0,  0,  0,  0, 20, 20,
  20, 30, 10,  0,  0, 10, 30, 20
];

const KING_END_TABLE: number[] = [
 -50,-40,-30,-20,-20,-30,-40,-50,
 -30,-20,-10,  0,  0,-10,-20,-30,
 -30,-10, 20, 30, 30, 20,-10,-30,
 -30,-10, 30, 40, 40, 30,-10,-30,
 -30,-10, 30, 40, 40, 30,-10,-30,
 -30,-10, 20, 30, 30, 20,-10,-30,
 -30,-30,  0,  0,  0,  0,-30,-30,
 -50,-30,-30,-30,-30,-30,-30,-50
];

function squareToIndex(square: Square): number {
  const file = square.charCodeAt(0) - 97; // 'a' -> 0, 'h' -> 7
  const rank = 8 - parseInt(square[1], 10); // '8' -> 0, '1' -> 7
  return rank * 8 + file;
}

function getPSTValue(piece: PieceSymbol, square: Square, color: Color, isEndgame: boolean): number {
  let idx = squareToIndex(square);
  // If black, flip board index vertically
  if (color === 'b') {
    const file = idx % 8;
    const rank = Math.floor(idx / 8);
    idx = (7 - rank) * 8 + file;
  }

  switch (piece) {
    case 'p': return PAWN_TABLE[idx];
    case 'n': return KNIGHT_TABLE[idx];
    case 'b': return BISHOP_TABLE[idx];
    case 'r': return ROOK_TABLE[idx];
    case 'q': return QUEEN_TABLE[idx];
    case 'k': return isEndgame ? KING_END_TABLE[idx] : KING_MIDDLE_TABLE[idx];
    default: return 0;
  }
}

/**
 * Static evaluation of a chess position in centipawns from White's perspective.
 * Positive = White advantage, Negative = Black advantage.
 */
export function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -30000 : 30000;
  }
  if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition() || chess.isInsufficientMaterial()) {
    return 0;
  }

  let whiteMaterial = 0;
  let blackMaterial = 0;
  let whitePST = 0;
  let blackPST = 0;
  let whiteMinorMajors = 0;
  let blackMinorMajors = 0;

  const board = chess.board();

  // First pass to determine game phase (endgame transition)
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      if (piece.type !== 'p' && piece.type !== 'k') {
        if (piece.color === 'w') whiteMinorMajors++;
        else blackMinorMajors++;
      }
    }
  }

  const isEndgame = (whiteMinorMajors + blackMinorMajors) <= 4;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const square = `${String.fromCharCode(97 + c)}${8 - r}` as Square;
      const baseVal = PIECE_VALUES[piece.type];
      const pstVal = getPSTValue(piece.type, square, piece.color, isEndgame);

      if (piece.color === 'w') {
        whiteMaterial += baseVal;
        whitePST += pstVal;
      } else {
        blackMaterial += baseVal;
        blackPST += pstVal;
      }
    }
  }

  const materialScore = whiteMaterial - blackMaterial;
  const pstScore = whitePST - blackPST;

  // Mobility bonus (number of legal moves)
  const mobility = chess.moves().length * 4;
  const mobilityScore = chess.turn() === 'w' ? mobility : -mobility;

  return materialScore + pstScore + mobilityScore;
}

/**
 * Calculates captured pieces and material differential.
 */
export function getCapturedPieces(chess: Chess): {
  whiteCaptures: PieceSymbol[];
  blackCaptures: PieceSymbol[];
  scoreAdvantage: number; // positive = White leads, negative = Black leads
} {
  const initialCounts: Record<PieceSymbol, number> = {
    p: 8, n: 2, b: 2, r: 2, q: 1, k: 1
  };

  const currentWhite: Record<PieceSymbol, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };
  const currentBlack: Record<PieceSymbol, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };

  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      if (piece.color === 'w') {
        currentWhite[piece.type]++;
      } else {
        currentBlack[piece.type]++;
      }
    }
  }

  const whiteCaptures: PieceSymbol[] = []; // Black pieces captured by White
  const blackCaptures: PieceSymbol[] = []; // White pieces captured by Black

  (['q', 'r', 'b', 'n', 'p'] as PieceSymbol[]).forEach(type => {
    const missingBlack = Math.max(0, initialCounts[type] - currentBlack[type]);
    for (let i = 0; i < missingBlack; i++) whiteCaptures.push(type);

    const missingWhite = Math.max(0, initialCounts[type] - currentWhite[type]);
    for (let i = 0; i < missingWhite; i++) blackCaptures.push(type);
  });

  let whitePoints = 0;
  let blackPoints = 0;
  whiteCaptures.forEach(p => whitePoints += PIECE_VALUES[p]);
  blackCaptures.forEach(p => blackPoints += PIECE_VALUES[p]);

  const scoreAdvantage = Math.round((whitePoints - blackPoints) / 100);

  return { whiteCaptures, blackCaptures, scoreAdvantage };
}

