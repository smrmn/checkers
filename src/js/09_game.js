function handleGameEnd(winner) {
  gameState.gameStatus = 'finished';
  gameState.winner = winner;
  stopTimer();
  updateFooterState();
  showEndOverlay(winner);
}

function startMatch() {
  stopTimer();
  // Always capture toggle state from DOM to avoid any desync
  gameState.toggles.fragileTiles = document.getElementById('toggle-fragile').checked;
  gameState.toggles.fogOfWar     = document.getElementById('toggle-fog').checked;
  gameState.board = initBoard();
  gameState.currentTurn = 'player';
  gameState.selectedPiece = null;
  gameState.availableMoves = [];
  gameState.inMultiCapture = false;
  gameState.multiCapturePiece = null;
  gameState.gameStatus = 'playing';
  gameState.winner = null;
  gameState.timer = 0;
  gameState.stats = { playerCaptured: 0, botCaptured: 0, startTime: null };

  updateTimerDisplay();
  updateFooterState();
  document.getElementById('start-btn').textContent = 'Reset';
  document.getElementById('end-overlay').classList.add('hidden');
  renderBoard();
}

function resetMatch() {
  stopTimer();
  gameState.board = initBoard();
  gameState.currentTurn = 'player';
  gameState.selectedPiece = null;
  gameState.availableMoves = [];
  gameState.inMultiCapture = false;
  gameState.multiCapturePiece = null;
  gameState.gameStatus = 'idle';
  gameState.winner = null;
  gameState.timer = 0;
  gameState.stats = { playerCaptured: 0, botCaptured: 0, startTime: null };

  updateTimerDisplay();
  updateFooterState();
  document.getElementById('start-btn').textContent = 'Start Match';
  document.getElementById('end-overlay').classList.add('hidden');
  renderBoard();
}

function onStartResetClick() {
  if (gameState.gameStatus === 'playing') {
    resetMatch();
  } else {
    startMatch();
  }
}

document.getElementById('board').addEventListener('click', handleCellClick);

(function init() {
  gameState.board = initBoard();
  renderBoard();
})();
