function startTimer() {
  if (gameState.timerInterval) return;
  gameState.stats.startTime = Date.now() - gameState.timer * 1000;
  gameState.timerInterval = setInterval(() => {
    gameState.timer = Math.floor((Date.now() - gameState.stats.startTime) / 1000);
    updateTimerDisplay();
  }, 500);
  document.getElementById('timer').classList.add('active');
}

function stopTimer() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;
  }
  document.getElementById('timer').classList.remove('active');
}

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateTimerDisplay() {
  document.getElementById('timer').textContent = formatTime(gameState.timer);
}

function onToggleChange(key, value) {
  gameState.toggles[key] = value;
}

function updateFooterState() {
  const footer = document.getElementById('footer');
  if (gameState.gameStatus === 'playing') {
    footer.classList.add('playing');
  } else {
    footer.classList.remove('playing');
  }
}
