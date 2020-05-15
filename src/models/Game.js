const { Chess: Base } = require('chess.js')
const log = require('../utilities/log')('model/Game')

const aliases = new Map([
  ['ascii', 'ascii'],
  ['fen', 'fen'],
  ['gameOver', 'game_over'],
  ['inCheck', 'in_check'],
  ['inCheckmate', 'in_checkmate'],
  ['inDraw', 'in_draw'],
  ['inStalemate', 'in_stalemate'],
  ['insufficientMaterial', 'insufficient_material'],
  ['inThreefoldRepetition', 'in_threefold_repetition'],
  ['move', 'move'],
  ['turn', 'turn'],
])

const extensions = new Map([
  ['moves', (chess) => chess.moves({ verbose: true })],
  ['constants', (chess) => {
    return {
      BISHOP: chess.BISHOP,
      BLACK: chess.BLACK,
      FLAGS: chess.FLAGS,
      KING: chess.KING,
      KNIGHT: chess.KNIGHT,
      PAWN: chess.PAWN,
      QUEEN: chess.QUEEN,
      ROOK: chess.ROOK,
      SQUARES: chess.SQUARES,
      WHITE: chess.WHITE
    }
  }]
])

function getHandler(fen) {
  const chess = new Base(fen)

  return {
    get(instance, property, _receiver) {
      if (aliases.has(property)) {
        return Reflect.get(chess, aliases.get(property))()
      }

      if (extensions.has(property)) {
        return extensions.get(property)(chess, ...arguments)
      }

      return Reflect.get(instance, property)
    }
  }
}

class Game {
  constructor(fen, engine) {
    this.engine = engine
    return new Proxy(this, getHandler(fen))
  }

  async bestMove() {
    const fen = this.fen
    const depth = 1

    log(`calculating best move for FEN ${fen} at depth ${depth}`)

    const result = await this.engine.chain()
      .position(fen)
      .go({ depth })

    const {
      bestmove: bestMove
    } = result

    log(`calcuated best move as ${bestMove}`)

    const [
      fromColumn,
      fromRow,
      toColumn,
      toRow,
      ...flags
    ] = bestMove

    return {
      from: `${fromColumn}${fromRow}`,
      to: `${toColumn}${toRow}`,
      flags: flags.join('')
    }
  }
}

module.exports = Game
