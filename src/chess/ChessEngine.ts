import { Chess, Square, PieceSymbol, Move } from 'chess.js';
import { DifficultyConfig } from '../types/chess';
import { evaluateBoard, PIECE_VALUES } from './Evaluation';

export interface EngineAnalysis {
  depth: number;
  score: number; // centipawns (from AI's perspective)
  bestMoveSan: string;
  nodesSearched: number;
}

/**
 * Score a move for move ordering (MVV-LVA: Most Valuable Victim - Least Valuable Attacker).
 */
function scoreMoveForOrdering(move: Move): number {
  let score = 0;
  if (move.captured) {
    const victimVal = PIECE_VALUES[move.captured] || 100;
    const attackerVal = PIECE_VALUES[move.piece] || 100;
    score += 10000 + (victimVal * 10) - attackerVal;
  }
  if (move.promotion) {
    score += 9000;
  }
  if (move.san.includes('+')) {
    score += 1000;
  }
  return score;
}

function orderMoves(moves: Move[]): Move[] {
  return moves.slice().sort((a, b) => scoreMoveForOrdering(b) - scoreMoveForOrdering(a));
}

/**
 * Offline Chess Engine implementing Minimax with Alpha-Beta Pruning,
 * MVV-LVA Move Ordering, Quiescence Search, and Configurable Skill Levels.
 */
export class ChessEngine {
  private nodesSearched = 0;
  private isCancelled = false;

  public cancelSearch(): void {
    this.isCancelled = true;
  }

  /**
   * Quiescence search evaluates noisy positions (captures) beyond max depth
   * to mitigate the horizon effect.
   */
  private quiescence(
    chess: Chess,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    qDepth: number
  ): number {
    this.nodesSearched++;

    const standPat = evaluateBoard(chess);

    if (qDepth >= 3) {
      return standPat;
    }

    if (isMaximizing) {
      if (standPat >= beta) return beta;
      if (standPat > alpha) alpha = standPat;

      const legalMoves = chess.moves({ verbose: true });
      const captureMoves = orderMoves(legalMoves.filter(m => m.captured || m.promotion));

      for (const move of captureMoves) {
        chess.move(move);
        const score = this.quiescence(chess, alpha, beta, false, qDepth + 1);
        chess.undo();

        if (score >= beta) return beta;
        if (score > alpha) alpha = score;
      }
      return alpha;
    } else {
      if (standPat <= alpha) return alpha;
      if (standPat < beta) beta = standPat;

      const legalMoves = chess.moves({ verbose: true });
      const captureMoves = orderMoves(legalMoves.filter(m => m.captured || m.promotion));

      for (const move of captureMoves) {
        chess.move(move);
        const score = this.quiescence(chess, alpha, beta, true, qDepth + 1);
        chess.undo();

        if (score <= alpha) return alpha;
        if (score < beta) beta = score;
      }
      return beta;
    }
  }

  /**
   * Core Alpha-Beta search function.
   */
  private alphaBeta(
    chess: Chess,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean,
    useQuiescence: boolean
  ): number {
    this.nodesSearched++;

    if (this.isCancelled) return 0;

    if (depth <= 0) {
      return useQuiescence
        ? this.quiescence(chess, alpha, beta, isMaximizing, 0)
        : evaluateBoard(chess);
    }

    if (chess.isGameOver()) {
      return evaluateBoard(chess);
    }

    const legalMoves = orderMoves(chess.moves({ verbose: true }));

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of legalMoves) {
        chess.move(move);
        const score = this.alphaBeta(chess, depth - 1, alpha, beta, false, useQuiescence);
        chess.undo();

        maxEval = Math.max(maxEval, score);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break; // Beta cutoff
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of legalMoves) {
        chess.move(move);
        const score = this.alphaBeta(chess, depth - 1, alpha, beta, true, useQuiescence);
        chess.undo();

        minEval = Math.min(minEval, score);
        beta = Math.min(beta, score);
        if (beta <= alpha) break; // Alpha cutoff
      }
      return minEval;
    }
  }

  /**
   * Calculate best move for the AI turn.
   */
  public async findBestMove(
    chess: Chess,
    config: DifficultyConfig,
    onProgress?: (info: EngineAnalysis) => void
  ): Promise<{
    from: Square;
    to: Square;
    promotion?: PieceSymbol;
    san: string;
    evalScore: number;
    depth: number;
    nodes: number;
  }> {
    this.nodesSearched = 0;
    this.isCancelled = false;
    const startTime = Date.now();

    const legalMoves = chess.moves({ verbose: true });
    if (legalMoves.length === 0) {
      throw new Error('No legal moves available in current position');
    }

    // Check if beginner or easy bot deliberately blunders or makes a suboptimal move
    if (config.blunderRate > 0 && Math.random() < config.blunderRate) {
      // Pick a random legal move or second/third tier move
      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      const minThink = Math.max(250, config.thinkTimeMs * 0.7);
      const elapsed = Date.now() - startTime;
      if (elapsed < minThink) {
        await new Promise(r => setTimeout(r, minThink - elapsed));
      }

      return {
        from: randomMove.from,
        to: randomMove.to,
        promotion: randomMove.promotion,
        san: randomMove.san,
        evalScore: 0,
        depth: 1,
        nodes: 1,
      };
    }

    const isMaximizing = chess.turn() === 'w';
    let bestMove = legalMoves[0];
    let bestEval = isMaximizing ? -Infinity : Infinity;

    const orderedMoves = orderMoves(legalMoves);
    const useQuiescence = config.level >= 5;

    // Search root moves
    for (let i = 0; i < orderedMoves.length; i++) {
      if (this.isCancelled) break;

      const move = orderedMoves[i];
      chess.move(move);

      // Yield control briefly to avoid blocking JS event loop
      if (i > 0 && i % 3 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }

      const score = this.alphaBeta(
        chess,
        config.depth - 1,
        -Infinity,
        Infinity,
        !isMaximizing,
        useQuiescence
      );
      chess.undo();

      // Add controlled randomness for intermediate/casual bots
      const noise = config.randomness > 0
        ? (Math.random() * 2 - 1) * config.randomness
        : 0;
      const adjustedScore = score + noise;

      if (isMaximizing) {
        if (adjustedScore > bestEval) {
          bestEval = adjustedScore;
          bestMove = move;
        }
      } else {
        if (adjustedScore < bestEval) {
          bestEval = adjustedScore;
          bestMove = move;
        }
      }

      if (onProgress) {
        onProgress({
          depth: config.depth,
          score: Math.round(isMaximizing ? bestEval : -bestEval),
          bestMoveSan: bestMove.san,
          nodesSearched: this.nodesSearched,
        });
      }
    }

    // Guarantee minimum thinking time for smooth human-like rhythm
    const elapsed = Date.now() - startTime;
    if (elapsed < config.thinkTimeMs) {
      await new Promise(r => setTimeout(r, config.thinkTimeMs - elapsed));
    }

    return {
      from: bestMove.from,
      to: bestMove.to,
      promotion: bestMove.promotion,
      san: bestMove.san,
      evalScore: Math.round(isMaximizing ? bestEval : -bestEval),
      depth: config.depth,
      nodes: this.nodesSearched,
    };
  }
}

export const chessEngine = new ChessEngine();
