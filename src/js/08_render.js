function renderBoard() {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';

  const sel = gameState.selectedPiece;
  const isPlayerTurn = gameState.currentTurn === 'player';
  const mustCaptureActive = isPlayerTurn &&
                            gameState.gameStatus === 'playing' &&
                            colorHasCaptures('player');

  const fogActive  = isFogActive();
  const visibleSet = fogActive ? computeVisibility() : null;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = row;
      cell.dataset.col = col;

      const isDark = (row + col) % 2 === 1;
      cell.classList.add(isDark ? 'dark' : 'light');

      const { piece, tileState } = gameState.board[row][col];
      if (isDark && tileState !== 'normal') cell.classList.add(tileState);

      const fogged = fogActive && !visibleSet.has(row * 8 + col);

      const isSelected = sel && sel.row === row && sel.col === col;
      if (isSelected) cell.classList.add('selected-source');

      if (piece && (!fogged || piece.color === 'player')) {
        const pieceEl = document.createElement('div');
        pieceEl.className = `piece ${piece.color}`;
        cell.appendChild(pieceEl);

        if (piece.color === 'player' && isPlayerTurn && gameState.gameStatus === 'playing') {
          cell.classList.add('clickable');

          if (!isSelected && !gameState.inMultiCapture && mustCaptureActive &&
              getCapturesForPiece(row, col).length > 0) {
            cell.classList.add('must-capture');
          }
        }
      }

      boardEl.appendChild(cell);
    }
  }

  if (fogActive) {
    renderFogLayer();
  } else {
    clearFogLayer();
  }

  updateTurnIndicator();
}

function updateTurnIndicator() {
  const el = document.getElementById('turn-indicator');

  if (gameState.gameStatus === 'idle') {
    el.textContent = '';
    el.className = '';
    return;
  }

  if (gameState.gameStatus === 'finished') {
    if (gameState.winner === 'player') {
      el.textContent = 'Победа игрока!';
      el.className = 'player-turn';
    } else if (gameState.winner === 'bot') {
      el.textContent = 'Победа бота!';
      el.className = 'bot-turn';
    } else {
      el.textContent = 'Ничья!';
      el.className = 'draw';
    }
    return;
  }

  if (gameState.currentTurn === 'player') {
    el.textContent = gameState.inMultiCapture ? 'Продолжайте бить!' : 'Ваш ход';
    el.className = 'player-turn';
  } else {
    el.textContent = 'Ход бота…';
    el.className = 'bot-turn';
  }
}

function showEndOverlay(winner) {
  document.getElementById('end-time').textContent = formatTime(gameState.timer);

  const resultEl = document.getElementById('end-result');
  if (winner === 'player') {
    resultEl.textContent = 'Победа игрока';
    resultEl.className = 'player-win';
  } else if (winner === 'bot') {
    resultEl.textContent = 'Победа бота';
    resultEl.className = 'bot-win';
  } else {
    resultEl.textContent = 'Ничья';
    resultEl.className = 'draw';
  }

  const counts = countPieces();
  document.getElementById('end-pieces').innerHTML =
    `<span class="pieces-player">Синих: ${counts.player}</span>` +
    `<span class="pieces-sep">·</span>` +
    `<span class="pieces-bot">Красных: ${counts.bot}</span>`;

  const mods = [];
  if (gameState.toggles.fragileTiles) mods.push('Хрупкие плитки');
  if (gameState.toggles.fogOfWar)     mods.push('Туман войны');
  const modsEl = document.getElementById('end-modifiers');
  modsEl.innerHTML = mods.map(m => `<span class="mod-chip">${m}</span>`).join('');
  modsEl.style.display = mods.length ? 'flex' : 'none';

  document.getElementById('end-overlay').classList.remove('hidden');
}
