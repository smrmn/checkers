const gameState = {
  board: [],
  currentTurn: 'player',
  selectedPiece: null,
  availableMoves: [],
  inMultiCapture: false,
  multiCapturePiece: null,
  gameStatus: 'idle',
  winner: null,
  timer: 0,
  timerInterval: null,
  stats: {
    playerCaptured: 0,
    botCaptured: 0,
    startTime: null
  },
  toggles: {
    fragileTiles: false,
    fogOfWar: false
  }
};
