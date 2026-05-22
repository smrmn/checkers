function afterPlayerCapture(toRow, toCol) {
  const further = getCapturesForPiece(toRow, toCol);

  if (further.length > 0) {
    gameState.inMultiCapture = true;
    gameState.multiCapturePiece = { row: toRow, col: toCol };
    gameState.selectedPiece = { row: toRow, col: toCol };
    gameState.availableMoves = further;
    renderBoard();
  } else {
    gameState.inMultiCapture = false;
    gameState.multiCapturePiece = null;
    endPlayerTurn();
  }
}

function endPlayerTurn() {
  if (!gameState.timerInterval) startTimer();

  gameState.selectedPiece = null;
  gameState.availableMoves = [];
  gameState.currentTurn = 'bot';

  const end = checkGameEnd();
  if (end.ended) {
    handleGameEnd(end.winner);
    renderBoard();
    return;
  }

  renderBoard();
  setTimeout(doBotTurn, 600);
}

function handleCellClick(e) {
  if (gameState.gameStatus !== 'playing') return;
  if (gameState.currentTurn !== 'player') return;

  const cell = e.target.closest('.cell');
  if (!cell) return;

  const row = parseInt(cell.dataset.row);
  const col = parseInt(cell.dataset.col);
  const { piece } = gameState.board[row][col];

  if (gameState.inMultiCapture) {
    const hit = gameState.availableMoves.find(m => m.row === row && m.col === col);
    if (hit) {
      executeCapture(
        gameState.multiCapturePiece.row, gameState.multiCapturePiece.col,
        row, col,
        hit.captured.row, hit.captured.col
      );
      afterPlayerCapture(row, col);
    }
    return;
  }

  if (piece && piece.color === 'player') {
    selectPiece(row, col);
    return;
  }

  if (gameState.selectedPiece) {
    const hit = gameState.availableMoves.find(m => m.row === row && m.col === col);
    if (!hit) return;

    if (hit.captured) {
      executeCapture(
        gameState.selectedPiece.row, gameState.selectedPiece.col,
        row, col,
        hit.captured.row, hit.captured.col
      );
      afterPlayerCapture(row, col);
    } else {
      executeMove(gameState.selectedPiece.row, gameState.selectedPiece.col, row, col);
      endPlayerTurn();
    }
  }
}
