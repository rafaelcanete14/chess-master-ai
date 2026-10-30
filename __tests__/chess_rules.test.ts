import { Chess } from 'chess.js';
import { ChessGameService } from '../src/chess/ChessGameService';

describe('Chess Rules & Special Moves Test Suite', () => {
  let game: ChessGameService;

  beforeEach(() => {
    game = new ChessGameService();
  });

  test('TEST 1: Board initialization and legal moves validation', () => {
    const fen = game.getFen();
    expect(fen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

    // 16 pawn moves + 4 knight moves = 20 legal opening moves
    const legalMoves = game.getLegalMoves();
    expect(legalMoves.length).toBe(20);

    // Illegal move: e2 to e5 should fail
    const illegal = game.makeMove('e2', 'e5');
    expect(illegal).toBeNull();

    // Legal move: e2 to e4
    const legal = game.makeMove('e2', 'e4');
    expect(legal).not.toBeNull();
    expect(legal?.san).toBe('e4');
  });

  test('TEST 2A: Castling Kingside and Queenside', () => {
    // White can castle kingside after clearing f1 and g1
    const castleFen = 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1';
    const castleGame = new ChessGameService(castleFen);

    // Kingside castling
    const moveKingside = castleGame.makeMove('e1', 'g1');
    expect(moveKingside).not.toBeNull();
    expect(moveKingside?.san).toBe('O-O');

    // Queenside castling test
    const qCastleGame = new ChessGameService(castleFen);
    const moveQueenside = qCastleGame.makeMove('e1', 'c1');
    expect(moveQueenside).not.toBeNull();
    expect(moveQueenside?.san).toBe('O-O-O');
  });

  test('TEST 2B: Prohibited Castling through Check', () => {
    // Enemy rook attacks f1, king cannot castle through check
    const throughCheckFen = 'r3k2r/8/8/8/8/5r2/8/R3K2R w KQkq - 0 1';
    const testGame = new ChessGameService(throughCheckFen);
    const illegalCastle = testGame.makeMove('e1', 'g1');
    expect(illegalCastle).toBeNull();
  });

  test('TEST 2C: En Passant capture', () => {
    // White pawn on e5, Black plays d7-d5
    const epFen = 'rnbqkbnr/pppppppp/8/4P3/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2';
    const epGame = new ChessGameService(epFen);
    // Black moves d7 to d5
    const d5Move = epGame.makeMove('d7', 'd5');
    expect(d5Move).not.toBeNull();

    // White captures en passant e5xd6
    const epMove = epGame.makeMove('e5', 'd6');
    expect(epMove).not.toBeNull();
    expect(epMove?.san).toBe('exd6');
    // Verify d5 pawn was captured (square d5 is now empty)
    expect(epGame.getPiece('d5')).toBeFalsy();
  });

  test('TEST 2D: Pawn Promotion choices (Queen, Rook, Bishop, Knight)', () => {
    const promoFen = '8/4P3/8/8/8/8/8/4K2k w - - 0 1';

    // Promote to Queen
    const qGame = new ChessGameService(promoFen);
    const qMove = qGame.makeMove('e7', 'e8', 'q');
    expect(qMove?.promotion).toBe('q');

    // Promote to Knight (underpromotion)
    const nGame = new ChessGameService(promoFen);
    const nMove = nGame.makeMove('e7', 'e8', 'n');
    expect(nMove?.promotion).toBe('n');

    // Promote to Rook
    const rGame = new ChessGameService(promoFen);
    const rMove = rGame.makeMove('e7', 'e8', 'r');
    expect(rMove?.promotion).toBe('r');

    // Promote to Bishop
    const bGame = new ChessGameService(promoFen);
    const bMove = bGame.makeMove('e7', 'e8', 'b');
    expect(bMove?.promotion).toBe('b');
  });

  test('TEST 5: Checkmate detection and winner attribution', () => {
    // Fool's Mate setup: 1. f3 e5 2. g4 Qh4#
    game.makeMove('f2', 'f3');
    game.makeMove('e7', 'e5');
    game.makeMove('g2', 'g4');
    const mateMove = game.makeMove('d8', 'h4');

    expect(mateMove?.san).toBe('Qh4#');
    const status = game.getStatus();
    expect(status.isOver).toBe(true);
    expect(status.isCheckmate).toBe(true);
    expect(status.winner).toBe('b'); // Black wins
    expect(status.statusMessage).toContain('Checkmate');
  });

  test('TEST: Stalemate detection', () => {
    // Classic stalemate position: Black king on a8, White queen on c7, White king on c8
    const stalemateFen = 'k7/2Q5/2K5/8/8/8/8/8 b - - 0 1';
    const staleGame = new ChessGameService(stalemateFen);

    const status = staleGame.getStatus();
    expect(status.isOver).toBe(true);
    expect(status.isStalemate).toBe(true);
    expect(status.winner).toBe('draw');
  });

  test('TEST: Insufficient Material draw', () => {
    // King vs King
    const kvkFen = '8/8/8/4k3/8/8/8/4K3 w - - 0 1';
    const kvkGame = new ChessGameService(kvkFen);
    expect(kvkGame.getStatus().isInsufficientMaterial).toBe(true);
    expect(kvkGame.getStatus().winner).toBe('draw');

    // King + Bishop vs King
    const kbvkFen = '8/8/8/4k3/8/8/4B3/4K3 w - - 0 1';
    const kbvkGame = new ChessGameService(kbvkFen);
    expect(kbvkGame.getStatus().isInsufficientMaterial).toBe(true);

    // King + Knight vs King
    const knvkFen = '8/8/8/4k3/8/8/4N3/4K3 w - - 0 1';
    const knvkGame = new ChessGameService(knvkFen);
    expect(knvkGame.getStatus().isInsufficientMaterial).toBe(true);
  });

  test('TEST: Threefold Repetition draw', () => {
    // Repeat knight moves 3 times: Nf3 Nf6, Ng1 Ng8
    const moves = [
      ['g1', 'f3'], ['g8', 'f6'],
      ['f3', 'g1'], ['f6', 'g8'],
      ['g1', 'f3'], ['g8', 'f6'],
      ['f3', 'g1'], ['f6', 'g8'],
    ];

    for (const [from, to] of moves) {
      game.makeMove(from as any, to as any);
    }

    const status = game.getStatus();
    expect(status.isThreefoldRepetition).toBe(true);
    expect(status.winner).toBe('draw');
  });

  test('TEST: Move undo and redo consistency', () => {
    game.makeMove('e2', 'e4');
    game.makeMove('e7', 'e5');
    expect(game.getMoveHistory().length).toBe(2);

    // Undo e5
    const undone1 = game.undoMove();
    expect(undone1?.san).toBe('e5');
    expect(game.getMoveHistory().length).toBe(1);
    expect(game.getTurn()).toBe('b');

    // Redo e5
    const redone = game.redoMove();
    expect(redone?.san).toBe('e5');
    expect(game.getMoveHistory().length).toBe(2);
    expect(game.getTurn()).toBe('w');
  });
});
