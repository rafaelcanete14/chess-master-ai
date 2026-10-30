import { StorageService, DEFAULT_SETTINGS, INITIAL_STATS } from '../src/storage/StorageService';
import { ChessGameService } from '../src/chess/ChessGameService';
import { SavedGame } from '../src/types/chess';

describe('Local Persistence, Clocks & PGN Suite', () => {
  test('TEST 6: Save and resume game state accurately with FEN and PGN', async () => {
    const game = new ChessGameService();
    game.makeMove('e2', 'e4');
    game.makeMove('e7', 'e5');
    game.makeMove('g1', 'f3');

    const savedGame: SavedGame = {
      id: 'test-game-1',
      date: new Date().toISOString(),
      mode: 'ai',
      playerColor: 'w',
      difficulty: 4,
      fen: game.getFen(),
      pgn: game.getPgn(),
      moveHistory: game.getMoveHistory(),
      isCompleted: false,
      whiteTimeRemaining: 540,
      blackTimeRemaining: 580,
    };

    // Save game
    await StorageService.saveActiveGame(savedGame);

    // Resume game in new service
    const resumed = await StorageService.getActiveGame();
    expect(resumed).not.toBeNull();
    expect(resumed?.fen).toBe(game.getFen());
    expect(resumed?.moveHistory.length).toBe(3);

    const resumedGameService = new ChessGameService(resumed?.fen);
    expect(resumedGameService.getTurn()).toBe('b');
    expect(resumedGameService.getLegalMoves().length).toBeGreaterThan(0);
  });

  test('TEST: Player statistics recording & win rate calculations', async () => {
    const statsBefore = await StorageService.getStats();
    expect(statsBefore.gamesPlayed).toBe(0);

    // Record a win at Level 4
    await StorageService.updateGameStats('win', 4, 180);
    const statsAfterWin = await StorageService.getStats();

    expect(statsAfterWin.gamesPlayed).toBe(1);
    expect(statsAfterWin.wins).toBe(1);
    expect(statsAfterWin.winsByDifficulty[4]).toBe(1);
    expect(statsAfterWin.totalPlayTimeSeconds).toBe(180);

    // Record a loss at Level 6
    await StorageService.updateGameStats('loss', 6, 220);
    const statsAfterLoss = await StorageService.getStats();

    expect(statsAfterLoss.gamesPlayed).toBe(2);
    expect(statsAfterLoss.losses).toBe(1);
    expect(statsAfterLoss.lossesByDifficulty[6]).toBe(1);
    expect(statsAfterLoss.totalPlayTimeSeconds).toBe(400);
  });

  test('TEST: PGN generation matches algebraic chess notation standards', () => {
    const game = new ChessGameService();
    game.makeMove('e2', 'e4');
    game.makeMove('c7', 'c5'); // Sicilian Defense
    game.makeMove('g1', 'f3');
    game.makeMove('d7', 'd6');

    const pgn = game.getPgn();
    expect(pgn).toContain('1. e4 c5');
    expect(pgn).toContain('2. Nf3 d6');
  });
});
