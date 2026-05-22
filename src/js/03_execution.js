function onPieceDeparted(row, col) {
  if (!gameState.toggles.fragileTiles) return;
  if ((row + col) % 2 === 0) return;
  const cell = gameState.board[row][col];
  if (!cell.hasReceivedPiece) return; // starting cells don't crack on first departure
  if (cell.tileState === 'normal')       cell.tileState = 'cracked';
  else if (cell.tileState === 'cracked') cell.tileState = 'destroyed';
}

function executeMove(fromRow, fromCol, toRow, toCol) {
  const piece = gameState.board[fromRow][fromCol].piece;
  gameState.board[toRow][toCol].piece = piece;
  gameState.board[toRow][toCol].hasReceivedPiece = true;
  gameState.board[fromRow][fromCol].piece = null;
  onPieceDeparted(fromRow, fromCol);
  gameState.selectedPiece = null;
  gameState.availableMoves = [];
}

function executeCapture(fromRow, fromCol, toRow, toCol, capRow, capCol) {
  const piece = gameState.board[fromRow][fromCol].piece;
  gameState.board[toRow][toCol].piece = piece;
  gameState.board[toRow][toCol].hasReceivedPiece = true;
  gameState.board[fromRow][fromCol].piece = null;
  gameState.board[capRow][capCol].piece = null;
  onPieceDeparted(fromRow, fromCol);

  if (piece.color === 'player') gameState.stats.playerCaptured++;
  else                          gameState.stats.botCaptured++;

  gameState.selectedPiece = null;
  gameState.availableMoves = [];
}

function selectPiece(row, col) {
  gameState.selectedPiece = { row, col };

  if (colorHasCaptures('player')) {
    gameState.availableMoves = getCapturesForPiece(row, col);
  } else {
    gameState.availableMoves = getMovesForPiece(row, col);
  }

  renderBoard();
}
