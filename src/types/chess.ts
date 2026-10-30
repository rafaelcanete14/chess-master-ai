import { Square, PieceSymbol, Color } from 'chess.js';

export type PlayerColor = 'w' | 'b' | 'random';

export type GameMode = 'ai' | 'pass_and_play' | 'puzzle' | 'training';

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface DifficultyConfig {
  level: DifficultyLevel;
  name: string;
  title: string;
  depth: number;
  blunderRate: number; // 0 to 1 (probability of playing suboptimal move)
  randomness: number;  // evaluation noise in centipawns
  skillLevel: number;  // 0 to 20
  thinkTimeMs: number; // target thinking delay for realism
  description: string;
}

export type BoardThemeId = 'classic_wood' | 'emerald_modern' | 'midnight_slate' | 'coral_sunset' | 'ice_glacier';

export interface BoardTheme {
  id: BoardThemeId;
  name: string;
  lightSquare: string;
  darkSquare: string;
  selectedSquare: string;
  legalMoveDot: string;
  legalCaptureRing: string;
  lastMoveHighlight: string;
  checkHighlight: string;
  boardBorder: string;
}

export type PieceThemeId = 'standard_vector' | 'alpha' | 'neo';

export interface ClockSettings {
  initialSeconds: number; // e.g. 180 for 3 min
  incrementSeconds: number; // e.g. 2 for +2s
  enabled: boolean;
}

export interface GameSettings {
  playerColor: PlayerColor;
  difficulty: DifficultyLevel;
  boardTheme: BoardThemeId;
  pieceTheme: PieceThemeId;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  showLegalMoves: boolean;
  autoQueen: boolean;
  flipBoardOnPassAndPlay: boolean;
  clockSettings: ClockSettings;
  allowUndoInAI: boolean;
}

export interface MoveRecord {
  from: Square;
  to: Square;
  piece: PieceSymbol;
  color: Color;
  san: string;
  captured?: PieceSymbol;
  promotion?: PieceSymbol;
  fenBefore: string;
  fenAfter: string;
  timestamp: number;
}

export interface SavedGame {
  id: string;
  date: string;
  mode: GameMode;
  playerColor: Color;
  difficulty?: DifficultyLevel;
  fen: string;
  pgn: string;
  moveHistory: MoveRecord[];
  isCompleted: boolean;
  result?: string; // '1-0' | '0-1' | '1/2-1/2' | '*'
  resultReason?: string;
  whiteTimeRemaining: number;
  blackTimeRemaining: number;
}

export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winsByDifficulty: Record<DifficultyLevel, number>;
  lossesByDifficulty: Record<DifficultyLevel, number>;
  drawsByDifficulty: Record<DifficultyLevel, number>;
  totalPlayTimeSeconds: number;
  puzzlesSolved: number;
  lessonsCompleted: number;
}

export interface Puzzle {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Mate-in-1' | 'Mate-in-2' | 'Fork' | 'Pin' | 'Skewer' | 'Endgame';
  fen: string;
  playerColor: 'w' | 'b';
  solutionUci: string[]; // e.g. ['e2e4', 'e7e5']
  hint: string;
  description: string;
}

export interface Lesson {
  id: string;
  title: string;
  category: 'Basics' | 'Special Rules' | 'Tactics' | 'Strategy' | 'Endgame';
  explanation: string;
  fen: string;
  interactiveMoves?: { from: Square; to: Square; comment: string }[];
  keyTakeaway: string;
}

