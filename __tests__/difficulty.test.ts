import { Chess } from 'chess.js';
import { DIFFICULTY_CONFIGS, getDifficultyConfig } from '../src/chess/DifficultyManager';
import { chessEngine } from '../src/chess/ChessEngine';
import { DifficultyLevel } from '../src/types/chess';

describe('AI Opponents & Engine Difficulty Suite', () => {
  test('TEST 3A: All 8 Difficulty Levels are genuinely distinct and properly configured', () => {
    const levels = [1, 2, 3, 4, 5, 6, 7, 8] as DifficultyLevel[];

    levels.forEach(lvl => {
      const config = getDifficultyConfig(lvl);
      expect(config.level).toBe(lvl);
      expect(config.name).toBeDefined();
      expect(config.title).toBeDefined();
      expect(config.depth).toBeGreaterThanOrEqual(1);
      expect(config.depth).toBeLessThanOrEqual(8);
      expect(config.thinkTimeMs).toBeGreaterThan(0);
    });

    // Level 1 (Beginner) must have high blunder rate and low depth
    const beginner = DIFFICULTY_CONFIGS[1];
    expect(beginner.depth).toBe(1);
    expect(beginner.blunderRate).toBeGreaterThan(0.4);

    // Level 4 (Intermediate) must have higher depth and minimal blunders
    const intermediate = DIFFICULTY_CONFIGS[4];
    expect(intermediate.depth).toBe(4);
    expect(intermediate.blunderRate).toBeLessThan(0.1);

    // Level 8 (Grandmaster) must have deep search, 0 blunder rate, 0 random noise
    const gm = DIFFICULTY_CONFIGS[8];
    expect(gm.depth).toBeGreaterThanOrEqual(5);
    expect(gm.blunderRate).toBe(0);
    expect(gm.randomness).toBe(0);

    // Ensure depths increase progressively
    expect(DIFFICULTY_CONFIGS[1].depth).toBeLessThan(DIFFICULTY_CONFIGS[4].depth);
    expect(DIFFICULTY_CONFIGS[4].depth).toBeLessThanOrEqual(DIFFICULTY_CONFIGS[8].depth);
  });

  test('TEST 3B: AI Engine returns legal moves from standard start position', async () => {
    const chess = new Chess();
    const config = { ...DIFFICULTY_CONFIGS[2], thinkTimeMs: 10 };

    const move = await chessEngine.findBestMove(chess, config);
    expect(move).toBeDefined();
    expect(move.from).toBeDefined();
    expect(move.to).toBeDefined();

    // Verify move is strictly legal in chess.js
    const legalMoves = chess.moves({ verbose: true });
    const isFound = legalMoves.some(m => m.from === move.from && m.to === move.to);
    expect(isFound).toBe(true);
  });

  test('TEST 3C: AI Engine detects immediate checkmate-in-one tactic', async () => {
    // White to move, Qxf7# is mate in 1
    const mateInOneFen = 'r1bqkb1r/pppp1ppp/2n5/4p2Q/2B1n3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1';
    const chess = new Chess(mateInOneFen);

    const config = { ...DIFFICULTY_CONFIGS[3], depth: 2, thinkTimeMs: 10, blunderRate: 0, randomness: 0 };
    const move = await chessEngine.findBestMove(chess, config);

    // Engine finds Qxf7#
    expect(move.to).toBe('f7');
  }, 10000);
});
