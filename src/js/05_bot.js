function getBoardColors() {
  return gameState.board.map(row =>
    row.map(cell => cell.piece?.color ?? null)
  );
}

function calcMaxChain(row, col, sim) {
  const color = sim[row][col];
  if (!color) return 0;
  const opponent = color === 'bot' ? 'player' : 'bot';
  let best = 0;

  for (const dr of [-1, 1]) {
    for (const dc of [-1, 1]) {
      const mr = row + dr, mc = col + dc;
      const lr = row + 2 * dr, lc = col + 2 * dc;
      if (lr < 0 || lr > 7 || lc < 0 || lc > 7) continue;
      if (sim[mr][mc] !== opponent) continue;
      if (sim[lr][lc] !== null) continue;

      const next = sim.map(r => [...r]);
      next[lr][lc] = next[row][col];
      next[row][col] = null;
      next[mr][mc] = null;

      const chain = 1 + calcMaxChain(lr, lc, next);
      if (chain > best) best = chain;
    }
  }
  return best;
}

function isCellDangerous(row, col, color) {
  const attacker = color === 'bot' ? 'player' : 'bot';
  for (const dr of [-1, 1]) {
    for (const dc of [-1, 1]) {
      const ar = row + dr, ac = col + dc;
      const lr = row - dr, lc = col - dc;
      if (ar < 0 || ar > 7 || ac < 0 || ac > 7) continue;
      if (lr < 0 || lr > 7 || lc < 0 || lc > 7) continue;
      const aCell = gameState.board[ar][ac];
      if (!aCell.piece || aCell.piece.color !== attacker) continue;
      const lCell = gameState.board[lr][lc];
      if (lCell.piece) continue;
      if (lCell.tileState === 'destroyed') continue;
      return true;
    }
  }
  return false;
}

function pickBestCapture(forcedPiece) {
  const sim = getBoardColors();
  const candidates = [];

  const sources = forcedPiece
    ? [forcedPiece]
    : (() => {
        const list = [];
        for (let r = 0; r < 8; r++)
          for (let c = 0; c < 8; c++) {
            const { piece } = gameState.board[r][c];
            if (piece && piece.color === 'bot') list.push({ row: r, col: c });
          }
        return list;
      })();

  for (const src of sources) {
    for (const cap of getCapturesForPiece(src.row, src.col)) {
      const next = sim.map(r => [...r]);
      next[cap.row][cap.col] = next[src.row][src.col];
      next[src.row][src.col] = null;
      next[cap.captured.row][cap.captured.col] = null;

      const chainLen = 1 + calcMaxChain(cap.row, cap.col, next);
      candidates.push({ from: src, cap, chainLen });
    }
  }

  if (!candidates.length) return null;

  const maxLen = Math.max(...candidates.map(x => x.chainLen));
  const best = candidates.filter(x => x.chainLen === maxLen);
  return best[Math.floor(Math.random() * best.length)];
}

function pickBestMove(moves) {
  const safe = moves.filter(m => !isCellDangerous(m.to.row, m.to.col, 'bot'));
  let pool = safe.length > 0 ? safe : moves;

  const nonCracked = pool.filter(
    m => gameState.board[m.to.row][m.to.col].tileState !== 'cracked'
  );
  pool = nonCracked.length > 0 ? nonCracked : pool;

  return pool[Math.floor(Math.random() * pool.length)];
}

function doBotTurn() {
  doBotStep(null);
}

function doBotStep(forcedPiece) {
  const hasCaptures = forcedPiece
    ? getCapturesForPiece(forcedPiece.row, forcedPiece.col).length > 0
    : colorHasCaptures('bot');

  if (hasCaptures) {
    const chosen = pickBestCapture(forcedPiece);
    if (chosen) {
      const { from, cap } = chosen;
      executeCapture(from.row, from.col, cap.row, cap.col, cap.captured.row, cap.captured.col);

      if (getCapturesForPiece(cap.row, cap.col).length > 0) {
        renderBoard();
        setTimeout(() => doBotStep({ row: cap.row, col: cap.col }), 600);
        return;
      }
    }
  } else if (!forcedPiece) {
    const moves = [];
    for (let r = 0; r < 8; r++)
      for (let c = 0; c < 8; c++) {
        const { piece } = gameState.board[r][c];
        if (piece && piece.color === 'bot')
          getMovesForPiece(r, c).forEach(m =>
            moves.push({ from: { row: r, col: c }, to: m })
          );
      }
    if (moves.length > 0) {
      const chosen = pickBestMove(moves);
      executeMove(chosen.from.row, chosen.from.col, chosen.to.row, chosen.to.col);
    }
  }

  gameState.currentTurn = 'player';

  const end = checkGameEnd();
  if (end.ended) {
    handleGameEnd(end.winner);
    renderBoard();
    return;
  }

  renderBoard();
}
