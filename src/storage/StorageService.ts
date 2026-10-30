import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameSettings, PlayerStats, SavedGame, DifficultyLevel } from '../types/chess';

const SETTINGS_KEY = '@chess_master_settings';
const STATS_KEY = '@chess_master_stats';
const ACTIVE_GAME_KEY = '@chess_master_active_game';
const GAME_HISTORY_KEY = '@chess_master_game_history';
const SOLVED_PUZZLES_KEY = '@chess_master_solved_puzzles';
const COMPLETED_LESSONS_KEY = '@chess_master_completed_lessons';

export const DEFAULT_SETTINGS: GameSettings = {
  playerColor: 'w',
  difficulty: 4,
  boardTheme: 'emerald_modern',
  pieceTheme: 'standard_vector',
  soundEnabled: true,
  hapticsEnabled: true,
  showLegalMoves: true,
  autoQueen: false,
  flipBoardOnPassAndPlay: true,
  allowUndoInAI: true,
  clockSettings: {
    enabled: false,
    initialSeconds: 600, // 10 minutes
    incrementSeconds: 0,
  },
};

export const INITIAL_STATS: PlayerStats = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  winsByDifficulty: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 },
  lossesByDifficulty: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 },
  drawsByDifficulty: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0 },
  totalPlayTimeSeconds: 0,
  puzzlesSolved: 0,
  lessonsCompleted: 0,
};

export class StorageService {
  public static async getSettings(): Promise<GameSettings> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public static async saveSettings(settings: GameSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  }

  public static async getStats(): Promise<PlayerStats> {
    try {
      const data = await AsyncStorage.getItem(STATS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          ...INITIAL_STATS,
          ...parsed,
          winsByDifficulty: { ...INITIAL_STATS.winsByDifficulty, ...(parsed.winsByDifficulty || {}) },
          lossesByDifficulty: { ...INITIAL_STATS.lossesByDifficulty, ...(parsed.lossesByDifficulty || {}) },
          drawsByDifficulty: { ...INITIAL_STATS.drawsByDifficulty, ...(parsed.drawsByDifficulty || {}) },
        };
      }
      return INITIAL_STATS;
    } catch {
      return INITIAL_STATS;
    }
  }

  public static async updateGameStats(
    result: 'win' | 'loss' | 'draw',
    difficulty?: DifficultyLevel,
    durationSeconds: number = 0
  ): Promise<PlayerStats> {
    const current = await this.getStats();
    current.gamesPlayed += 1;
    current.totalPlayTimeSeconds += durationSeconds;

    if (result === 'win') {
      current.wins += 1;
      if (difficulty) current.winsByDifficulty[difficulty] = (current.winsByDifficulty[difficulty] || 0) + 1;
    } else if (result === 'loss') {
      current.losses += 1;
      if (difficulty) current.lossesByDifficulty[difficulty] = (current.lossesByDifficulty[difficulty] || 0) + 1;
    } else {
      current.draws += 1;
      if (difficulty) current.drawsByDifficulty[difficulty] = (current.drawsByDifficulty[difficulty] || 0) + 1;
    }

    try {
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(current));
    } catch (e) {
      console.warn('Failed to update stats:', e);
    }
    return current;
  }

  public static async saveActiveGame(game: SavedGame): Promise<void> {
    try {
      await AsyncStorage.setItem(ACTIVE_GAME_KEY, JSON.stringify(game));
    } catch (e) {
      console.warn('Failed to save active game:', e);
    }
  }

  public static async getActiveGame(): Promise<SavedGame | null> {
    try {
      const data = await AsyncStorage.getItem(ACTIVE_GAME_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  public static async clearActiveGame(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ACTIVE_GAME_KEY);
    } catch (e) {
      console.warn('Failed to clear active game:', e);
    }
  }

  public static async getGameHistory(): Promise<SavedGame[]> {
    try {
      const data = await AsyncStorage.getItem(GAME_HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static async archiveCompletedGame(game: SavedGame): Promise<void> {
    try {
      const history = await this.getGameHistory();
      const updated = [game, ...history.filter(g => g.id !== game.id)].slice(0, 50); // keep last 50 games
      await AsyncStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to archive game:', e);
    }
  }

  public static async clearAllHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(GAME_HISTORY_KEY);
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(INITIAL_STATS));
    } catch (e) {
      console.warn('Failed to clear history:', e);
    }
  }

  public static async getSolvedPuzzles(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(SOLVED_PUZZLES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static async markPuzzleSolved(puzzleId: string): Promise<void> {
    try {
      const solved = await this.getSolvedPuzzles();
      if (!solved.includes(puzzleId)) {
        solved.push(puzzleId);
        await AsyncStorage.setItem(SOLVED_PUZZLES_KEY, JSON.stringify(solved));
        const stats = await this.getStats();
        stats.puzzlesSolved = solved.length;
        await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
      }
    } catch (e) {
      console.warn('Failed to mark puzzle solved:', e);
    }
  }

  public static async getCompletedLessons(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(COMPLETED_LESSONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static async markLessonCompleted(lessonId: string): Promise<void> {
    try {
      const completed = await this.getCompletedLessons();
      if (!completed.includes(lessonId)) {
        completed.push(lessonId);
        await AsyncStorage.setItem(COMPLETED_LESSONS_KEY, JSON.stringify(completed));
        const stats = await this.getStats();
        stats.lessonsCompleted = completed.length;
        await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
      }
    } catch (e) {
      console.warn('Failed to mark lesson completed:', e);
    }
  }
}
