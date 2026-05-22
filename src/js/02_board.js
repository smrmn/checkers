function initBoard() {
  const board = [];
  for (let row = 0; row < 8; row++) {
    board[row] = [];
    for (let col = 0; col < 8; col++) {
      const isDark = (row + col) % 2 === 1;
      let piece = null;
      if (isDark) {
        if (row <= 2) piece = { color: 'bot' };
        else if (row >= 5) piece = { color: 'player' };
      }
      board[row][col] = { piece, tileState: 'normal', hasReceivedPiece: false };
    }
  }
  return board;
}

function getMovesForPiece(row, col) {
  const { piece } = gameState.board[row][col];
  if (!piece) return [];

  const dir = piece.color === 'player' ? -1 : 1;
  const moves = [];

  for (const dc of [-1, 1]) {
    const nr = row + dir;
    const nc = col + dc;
    if (nr < 0 || nr > 7 || nc < 0 || nc > 7) continue;
    const target = gameState.board[nr][nc];
    if (target.tileState === 'destroyed') continue;
    if (target.piece) continue;
    moves.push({ row: nr, col: nc });
  }

  return moves;
}

function getCapturesForPiece(row, col) {
  const { piece } = gameState.board[row][col];
  if (!piece) return [];

  const opponent = piece.color === 'player' ? 'bot' : 'player';
  const captures = [];

  for (const dr of [-1, 1]) {
    for (const dc of [-1, 1]) {
      const midRow = row + dr;
      const midCol = col + dc;
      const landRow = row + 2 * dr;
      const landCol = col + 2 * dc;

      if (landRow < 0 || landRow > 7 || landCol < 0 || landCol > 7) continue;

      const mid  = gameState.board[midRow][midCol];
      const land = gameState.board[landRow][landCol];

      if (!mid.piece || mid.piece.color !== opponent) continue;
      if (land.piece) continue;
      if (land.tileState === 'destroyed') continue;

      captures.push({
        row: landRow,
        col: landCol,
        captured: { row: midRow, col: midCol }
      });
    }
  }

  return captures;
}

function colorHasCaptures(color) {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const { piece } = gameState.board[r][c];
      if (piece && piece.color === color && getCapturesForPiece(r, c).length > 0)
        return true;
    }
  return false;
}

function colorCanMove(color) {
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const { piece } = gameState.board[r][c];
      if (piece && piece.color === color) {
        if (getCapturesForPiece(r, c).length > 0) return true;
        if (getMovesForPiece(r, c).length > 0) return true;
      }
    }
  return false;
}

function countPieces() {
  let player = 0, bot = 0;
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const p = gameState.board[r][c].piece;
      if (p?.color === 'player') player++;
      if (p?.color === 'bot')    bot++;
    }
  return { player, bot };
}

function checkGameEnd() {
  const counts = countPieces();

  if (counts.bot === 0)    return { ended: true, winner: 'player' };
  if (counts.player === 0) return { ended: true, winner: 'bot' };

  if (!colorCanMove(gameState.currentTurn)) {
    if (counts.player > counts.bot) return { ended: true, winner: 'player' };
    if (counts.bot > counts.player) return { ended: true, winner: 'bot' };
    return { ended: true, winner: 'draw' };
  }

  return { ended: false };
}
