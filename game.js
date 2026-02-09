const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const restartBtn = document.getElementById("restart");

const state = {
  player: { x: canvas.width / 2 - 20, y: canvas.height - 70, w: 40, h: 45, speed: 5 },
  meteors: [],
  keys: { left: false, right: false },
  score: 0,
  best: Number(localStorage.getItem("best-score") || 0),
  spawnEvery: 650,
  speedBoost: 0,
  running: true,
  lastTime: 0,
  lastSpawn: 0,
};

bestEl.textContent = String(state.best);

function spawnMeteor() {
  const size = Math.random() * 28 + 20;
  state.meteors.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    size,
    speed: 2 + Math.random() * 2 + state.speedBoost,
  });
}

function drawBackgroundStars(t) {
  ctx.fillStyle = "#fff";
  for (let i = 0; i < 45; i += 1) {
    const x = (i * 97) % canvas.width;
    const y = (i * 43 + t * 0.03) % canvas.height;
    const alpha = 0.2 + ((i * 7) % 10) / 18;
    ctx.globalAlpha = alpha;
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.globalAlpha = 1;
}

function drawPlayer() {
  const { x, y, w, h } = state.player;
  ctx.fillStyle = "#79a8ff";
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffca6b";
  ctx.fillRect(x + w / 2 - 4, y + h, 8, 12);
}

function drawMeteors() {
  ctx.fillStyle = "#9f6a4a";
  state.meteors.forEach((m) => {
    ctx.beginPath();
    ctx.arc(m.x + m.size / 2, m.y + m.size / 2, m.size / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#6f442e";
    ctx.beginPath();
    ctx.arc(m.x + m.size * 0.37, m.y + m.size * 0.35, m.size * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#9f6a4a";
  });
}

function hitTest(a, b) {
  return a.x < b.x + b.size && a.x + a.w > b.x && a.y < b.y + b.size && a.y + a.h > b.y;
}

function update(dt, now) {
  if (state.keys.left) state.player.x -= state.player.speed;
  if (state.keys.right) state.player.x += state.player.speed;

  state.player.x = Math.max(0, Math.min(canvas.width - state.player.w, state.player.x));

  if (now - state.lastSpawn >= state.spawnEvery) {
    spawnMeteor();
    state.lastSpawn = now;
  }

  state.meteors.forEach((m) => {
    m.y += m.speed;
  });

  state.meteors = state.meteors.filter((m) => m.y < canvas.height + m.size);

  if (state.meteors.some((m) => hitTest(state.player, m))) {
    gameOver();
    return;
  }

  state.score += dt * 0.015;
  state.speedBoost = Math.min(3.5, state.score / 650);
  scoreEl.textContent = Math.floor(state.score).toString();
}

function render(now) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackgroundStars(now);
  drawMeteors();
  drawPlayer();
}

function gameOver() {
  state.running = false;
  restartBtn.hidden = false;
  const finalScore = Math.floor(state.score);

  if (finalScore > state.best) {
    state.best = finalScore;
    localStorage.setItem("best-score", String(state.best));
    bestEl.textContent = String(state.best);
  }

  ctx.fillStyle = "rgba(2, 4, 10, 0.66)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.font = "bold 34px sans-serif";
  ctx.fillText("Fim de jogo", canvas.width / 2, canvas.height / 2 - 8);
  ctx.font = "20px sans-serif";
  ctx.fillText(`Pontuação: ${finalScore}`, canvas.width / 2, canvas.height / 2 + 28);
}

function loop(now) {
  if (!state.running) return;

  const dt = now - state.lastTime;
  state.lastTime = now;

  update(dt, now);
  render(now);
  requestAnimationFrame(loop);
}

function resetGame() {
  state.player.x = canvas.width / 2 - 20;
  state.meteors = [];
  state.score = 0;
  state.speedBoost = 0;
  state.running = true;
  state.lastTime = performance.now();
  state.lastSpawn = state.lastTime;
  scoreEl.textContent = "0";
  restartBtn.hidden = true;
  requestAnimationFrame(loop);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") state.keys.left = true;
  if (e.key === "ArrowRight") state.keys.right = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") state.keys.left = false;
  if (e.key === "ArrowRight") state.keys.right = false;
});

restartBtn.addEventListener("click", resetGame);

state.lastTime = performance.now();
state.lastSpawn = state.lastTime;
requestAnimationFrame(loop);
