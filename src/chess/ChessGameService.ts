import { Chess, Square, PieceSymbol, Color, Move } from 'chess.js';
import { MoveRecord } from '../types/chess';

export interface GameStatus {
  isOver: boolean;
  inCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  isThreefoldRepetition: boolean;
  isInsufficientMaterial: boolean;
  isFiftyMoves: boolean;
  winner: Color | 'draw' | null;
  statusMessage: string;
}

export class ChessGameService {
  private chess: Chess;
  private moveHistory: MoveRecord[] = [];
  private redoStack: MoveRecord[] = [];

  constructor(fen?: string) {
    this.chess = new Chess(fen);
  }

  public reset(fen?: string): void {
    if (fen) {
      this.chess = new Chess(fen);
    } else {
      this.chess.reset();
    }
    this.moveHistory = [];
    this.redoStack = [];
  }

  public getChess(): Chess {
    return this.chess;
  }

  public getFen(): string {
    return this.chess.fen();
  }

  public getPgn(): string {
    return this.chess.pgn();
  }

  public loadPgn(pgn: string): boolean {
    try {
      this.chess.loadPgn(pgn);
      return true;
    } catch {
      return false;
    }
  }

  public getTurn(): Color {
    return this.chess.turn();
  }

  public getBoard() {
    return this.chess.board();
  }

  public getPiece(square: Square) {
    return this.chess.get(square);
  }

  public getLegalMoves(square?: Square): Move[] {
    if (square) {
      return this.chess.moves({ square, verbose: true });
    }
    return this.chess.moves({ verbose: true });
  }

  public isLegalMove(from: Square, to: Square): boolean {
    const moves = this.chess.moves({ square: from, verbose: true });
    return moves.some(m => m.to === to);
  }

  public makeMove(from: Square, to: Square, promotion: PieceSymbol = 'q'): Move | null {
    const fenBefore = this.chess.fen();
    try {
      const move = this.chess.move({
        from,
        to,
        promotion,
      });

      if (move) {
        const fenAfter = this.chess.fen();
        const record: MoveRecord = {
          from: move.from,
          to: move.to,
          piece: move.piece,
          color: move.color,
          san: move.san,
          captured: move.captured,
          promotion: move.promotion,
          fenBefore,
          fenAfter,
          timestamp: Date.now(),
        };
        this.moveHistory.push(record);
        this.redoStack = []; // clear redo on new move
        return move;
      }
      return null;
    } catch {
      return null;
    }
  }

  public undoMove(): MoveRecord | null {
    if (this.moveHistory.length === 0) return null;
    const undoneMove = this.chess.undo();
    if (undoneMove) {
      const lastRecord = this.moveHistory.pop() || null;
      if (lastRecord) {
        this.redoStack.push(lastRecord);
      }
      return lastRecord;
    }
    return null;
  }

  public redoMove(): MoveRecord | null {
    if (this.redoStack.length === 0) return null;
    const nextMove = this.redoStack.pop();
    if (!nextMove) return null;

    const applied = this.makeMove(nextMove.from, nextMove.to, nextMove.promotion || 'q');
    return applied ? nextMove : null;
  }

  public getMoveHistory(): MoveRecord[] {
    return [...this.moveHistory];
  }

  public getLastMove(): MoveRecord | null {
    return this.moveHistory.length > 0 ? this.moveHistory[this.moveHistory.length - 1] : null;
  }

  public getKingSquare(color: Color): Square | null {
    const board = this.chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === color) {
          return `${String.fromCharCode(97 + c)}${8 - r}` as Square;
        }
      }
    }
    return null;
  }

  public getStatus(): GameStatus {
    const inCheck = this.chess.isCheck();
    const isCheckmate = this.chess.isCheckmate();
    const isStalemate = this.chess.isStalemate();
    const isThreefoldRepetition = this.chess.isThreefoldRepetition();
    const isInsufficientMaterial = this.chess.isInsufficientMaterial();
    const isDraw = this.chess.isDraw();
    const isFiftyMoves = isDraw && !isStalemate && !isThreefoldRepetition && !isInsufficientMaterial;

    let isOver = false;
    let winner: Color | 'draw' | null = null;
    let statusMessage = '';

    if (isCheckmate) {
      isOver = true;
      winner = this.chess.turn() === 'w' ? 'b' : 'w';
      statusMessage = `Checkmate! ${winner === 'w' ? 'White' : 'Black'} wins!`;
    } else if (isStalemate) {
      isOver = true;
      winner = 'draw';
      statusMessage = 'Draw by Stalemate — No legal moves available.';
    } else if (isThreefoldRepetition) {
      isOver = true;
      winner = 'draw';
      statusMessage = 'Draw by Threefold Repetition.';
    } else if (isInsufficientMaterial) {
      isOver = true;
      winner = 'draw';
      statusMessage = 'Draw by Insufficient Material.';
    } else if (isFiftyMoves) {
      isOver = true;
      winner = 'draw';
      statusMessage = 'Draw by Fifty-Move Rule.';
    } else if (isDraw) {
      isOver = true;
      winner = 'draw';
      statusMessage = 'Game ended in a Draw.';
    } else if (inCheck) {
      statusMessage = `${this.chess.turn() === 'w' ? 'White' : 'Black'} is in Check!`;
    } else {
      statusMessage = `${this.chess.turn() === 'w' ? 'White' : 'Black'}'s turn`;
    }

    return {
      isOver,
      inCheck,
      isCheckmate,
      isStalemate,
      isDraw,
      isThreefoldRepetition,
      isInsufficientMaterial,
      isFiftyMoves,
      winner,
      statusMessage,
    };
  }
}
