function isFogActive() {
  return gameState.toggles.fogOfWar &&
         gameState.gameStatus === 'playing' &&
         gameState.timerInterval !== null;
}

function computeVisibility() {
  const visible = new Set();
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++) {
      const { piece } = gameState.board[r][c];
      if (piece && piece.color === 'player') {
        for (let dr = -2; dr <= 2; dr++)
          for (let dc = -2; dc <= 2; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8)
              visible.add(nr * 8 + nc);
          }
      }
    }
  return visible;
}

function renderFogLayer() {
  const fogLayer = document.getElementById('fog-layer');
  const CELL = 72, BOARD = 576;
  const holeRects = [];

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const { piece } = gameState.board[r][c];
      if (piece && piece.color === 'player') {
        const x  = Math.max(0, (c - 2) * CELL);
        const y  = Math.max(0, (r - 2) * CELL);
        const x2 = Math.min(BOARD, (c + 3) * CELL);
        const y2 = Math.min(BOARD, (r + 3) * CELL);
        holeRects.push(
          `<rect x="${x}" y="${y}" width="${x2 - x}" height="${y2 - y}" rx="48" fill="black"/>`
        );
      }
    }
  }

  fogLayer.innerHTML =
    `<svg width="${BOARD}" height="${BOARD}" xmlns="http://www.w3.org/2000/svg" style="pointer-events:none">` +
    `<defs><mask id="fog-mask">` +
    `<rect width="${BOARD}" height="${BOARD}" fill="white"/>` +
    holeRects.join('') +
    `</mask></defs>` +
    `<rect width="${BOARD}" height="${BOARD}" fill="rgba(90,90,100,0.92)" mask="url(#fog-mask)"/>` +
    `</svg>`;
}

function clearFogLayer() {
  document.getElementById('fog-layer').innerHTML = '';
}
