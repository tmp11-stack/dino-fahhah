// --- Web Audio API Sound Synthesizer ---
class SoundManager {
  constructor() {
    this.audioCtx = null;
    this.muted = false;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playJump() {
    if (this.muted) return;
    this.init();
    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  playScore() {
    if (this.muted) return;
    this.init();
    const now = this.audioCtx.currentTime;
    
    // Play two-tone celebratory beep
    [ { freq: 587.33, start: 0, dur: 0.08 }, { freq: 880, start: 0.09, dur: 0.12 } ].forEach(tone => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(tone.freq, now + tone.start);
      gain.gain.setValueAtTime(0.1, now + tone.start);
      gain.gain.exponentialRampToValueAtTime(0.001, now + tone.start + tone.dur);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now + tone.start);
      osc.stop(now + tone.start + tone.dur);
    });
  }

  playGameOver() {
    if (this.muted) return;
    this.init();
    const now = this.audioCtx.currentTime;

    // Downward crunch tone
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}

const sounds = new SoundManager();

// --- Game Configuration & Constants ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreText = document.getElementById('scoreText');
const hiScoreText = document.getElementById('hiScoreText');
const soundToggle = document.getElementById('soundToggle');

const GROUND_Y = 210;
const GRAVITY = 0.58;

// Sound toggle button click
soundToggle.addEventListener('click', () => {
  const isMuted = sounds.toggleMute();
  soundToggle.textContent = isMuted ? '🔇' : '🔊';
});

// --- Pixel Art Sprite Definitions ---
const SPRITES = {
  dinoRun1: [
    "                   ███████ ",
    "                  ███▒████ ",
    "                  ████████ ",
    "                  ████     ",
    "                  ███████  ",
    "   ██             █████    ",
    "   ███           █████████ ",
    "   ███          ███████    ",
    "   ████       ████████     ",
    "    ████    ███████████    ",
    "     ██████████████  █     ",
    "      █████████████        ",
    "       ██████████          ",
    "        ████████           ",
    "         ██   ██           ",
    "         ██    ██          ",
    "         ██                "
  ],
  dinoRun2: [
    "                   ███████ ",
    "                  ███▒████ ",
    "                  ████████ ",
    "                  ████     ",
    "                  ███████  ",
    "   ██             █████    ",
    "   ███           █████████ ",
    "   ███          ███████    ",
    "   ████       ████████     ",
    "    ████    ███████████    ",
    "     ██████████████  █     ",
    "      █████████████        ",
    "       ██████████          ",
    "        ████████           ",
    "         ██   ██           ",
    "          ██   ██          ",
    "               ██          "
  ],
  dinoDuck1: [
    "                           ",
    "                           ",
    "                           ",
    "                           ",
    "                           ",
    "   ██             ████████ ",
    "   ███     ██████████▒████ ",
    "   ███    ████████████████ ",
    "   ████  ████████████      ",
    "    ███████████████████    ",
    "     █████████████████     ",
    "      ████████████         ",
    "       ██████████          ",
    "        ████████           ",
    "         ██   ██           ",
    "         ██    ██          ",
    "         ██                "
  ],
  dinoDuck2: [
    "                           ",
    "                           ",
    "                           ",
    "                           ",
    "                           ",
    "   ██             ████████ ",
    "   ███     ██████████▒████ ",
    "   ███    ████████████████ ",
    "   ████  ████████████      ",
    "    ███████████████████    ",
    "     █████████████████     ",
    "      ████████████         ",
    "       ██████████          ",
    "        ████████           ",
    "         ██   ██           ",
    "          ██   ██          ",
    "               ██          "
  ],
  dinoDead: [
    "                   ███████ ",
    "                  ██ █ █   ",
    "                  ████████ ",
    "                  ████     ",
    "                  ███████  ",
    "   ██             █████    ",
    "   ███           █████████ ",
    "   ███          ███████    ",
    "   ████       ████████     ",
    "    ████    ███████████    ",
    "     ██████████████  █     ",
    "      █████████████        ",
    "       ██████████          ",
    "        ████████           ",
    "         ██   ██           ",
    "         ██    ██          ",
    "         ██    ██          "
  ],
  cactusSmall: [
    "    ██    ",
    "    ██    ",
    " ██ ██    ",
    " ██ ██ ██ ",
    " ██ ██ ██ ",
    " ████████ ",
    "    ██    ",
    "    ██    ",
    "    ██    ",
    "    ██    ",
    "    ██    "
  ],
  cactusDouble: [
    "   ██     ██   ",
    "   ██     ██   ",
    "██ ██  ██ ██   ",
    "█████  █████ ██",
    "   ██     ██ ██",
    "   ██     █████",
    "   ██     ██   ",
    "   ██     ██   ",
    "   ██     ██   ",
    "   ██     ██   "
  ],
  birdWingUp: [
    "        ███    ",
    "       █████   ",
    "      ██████   ",
    " ██████████    ",
    "██████████████ ",
    " ███████████   ",
    "    ███        ",
    "    ██         "
  ],
  birdWingDown: [
    "    ███        ",
    " ███████████   ",
    "██████████████ ",
    " ██████████    ",
    "      ██████   ",
    "       █████   ",
    "        ███    ",
    "               "
  ],
  cloud: [
    "      ██████      ",
    "    ██████████    ",
    "  ██████████████  ",
    "██████████████████"
  ]
};

// Helper: render pixel-art sprite matrix onto canvas
function drawSprite(matrix, startX, startY, pixelSize, color = '#535353') {
  ctx.fillStyle = color;
  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r];
    for (let c = 0; c < row.length; c++) {
      if (row[c] === '█') {
        ctx.fillRect(startX + c * pixelSize, startY + r * pixelSize, pixelSize, pixelSize);
      }
    }
  }
}

// --- Game State Variables ---
let gameState = 'START'; // 'START', 'RUNNING', 'GAMEOVER'
let score = 0;
let hiScore = localStorage.getItem('dino_hi_score') ? parseInt(localStorage.getItem('dino_hi_score'), 10) : 0;
let gameSpeed = 6;
let frameCount = 0;
let lastScoreBeep = 0;

// Dino Entity
const dino = {
  x: 45,
  y: GROUND_Y - 44,
  baseY: GROUND_Y - 44,
  width: 44,
  height: 44,
  vy: 0,
  jumpStrength: -11.5,
  isGrounded: true,
  isDucking: false,

  jump() {
    if (this.isGrounded) {
      this.vy = this.jumpStrength;
      this.isGrounded = false;
      sounds.playJump();
    }
  },

  update() {
    if (!this.isGrounded) {
      this.vy += GRAVITY;
      this.y += this.vy;

      if (this.y >= this.baseY) {
        this.y = this.baseY;
        this.vy = 0;
        this.isGrounded = true;
      }
    }

    if (this.isDucking && this.isGrounded) {
      this.height = 30;
      this.y = this.baseY + 14;
    } else if (this.isGrounded) {
      this.height = 44;
      this.y = this.baseY;
    }
  },

  draw() {
    const pixelSize = 2.6;
    let sprite;

    if (gameState === 'GAMEOVER') {
      sprite = SPRITES.dinoDead;
    } else if (this.isDucking && this.isGrounded) {
      sprite = Math.floor(frameCount / 6) % 2 === 0 ? SPRITES.dinoDuck1 : SPRITES.dinoDuck2;
    } else if (!this.isGrounded) {
      sprite = SPRITES.dinoRun1;
    } else {
      sprite = Math.floor(frameCount / 6) % 2 === 0 ? SPRITES.dinoRun1 : SPRITES.dinoRun2;
    }

    drawSprite(sprite, this.x, this.y, pixelSize);
  },

  getBounds() {
    // Tighter hitbox for fair collision feel
    const pad = 4;
    return {
      x: this.x + pad,
      y: this.y + pad,
      w: (this.isDucking ? 52 : this.width) - pad * 2,
      h: this.height - pad * 2
    };
  }
};

// Ground, Clouds, Obstacles
let obstacles = [];
let clouds = [];
let groundOffset = 0;

function spawnCloud() {
  if (Math.random() < 0.008 && clouds.length < 3) {
    clouds.push({
      x: canvas.width + 20,
      y: 30 + Math.random() * 50,
      speed: 1 + Math.random() * 0.8
    });
  }
}

function spawnObstacle() {
  const minGap = 70;
  const lastObs = obstacles[obstacles.length - 1];
  if (lastObs && (canvas.width - lastObs.x) < 220 + Math.random() * 200) {
    return;
  }

  // Bird unlocks after 180 score
  const canSpawnBird = score > 180;
  const isBird = canSpawnBird && Math.random() < 0.28;

  if (isBird) {
    // High or low flight
    const flightHeight = Math.random() > 0.5 ? GROUND_Y - 55 : GROUND_Y - 28;
    obstacles.push({
      type: 'bird',
      x: canvas.width + 10,
      y: flightHeight,
      w: 36,
      h: 24
    });
  } else {
    const isDouble = Math.random() > 0.5;
    obstacles.push({
      type: isDouble ? 'cactusDouble' : 'cactusSmall',
      x: canvas.width + 10,
      y: GROUND_Y - (isDouble ? 34 : 36),
      w: isDouble ? 34 : 26,
      h: 36
    });
  }
}

function checkCollision(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.w &&
    rect1.x + rect1.w > rect2.x &&
    rect1.y < rect2.y + rect2.h &&
    rect1.y + rect1.h > rect2.y
  );
}

// Reset Game
function resetGame() {
  score = 0;
  gameSpeed = 6;
  obstacles = [];
  clouds = [];
  dino.y = dino.baseY;
  dino.vy = 0;
  dino.isGrounded = true;
  dino.isDucking = false;
  gameState = 'RUNNING';
}

// Handle Controls
const keys = {};

window.addEventListener('keydown', (e) => {
  sounds.init();
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault();
    if (gameState === 'START' || gameState === 'GAMEOVER') {
      resetGame();
    } else if (gameState === 'RUNNING') {
      dino.jump();
    }
  } else if (e.code === 'ArrowDown') {
    e.preventDefault();
    if (gameState === 'RUNNING') {
      dino.isDucking = true;
    }
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowDown') {
    dino.isDucking = false;
  }
});

// Canvas click / mobile tap support
canvas.addEventListener('pointerdown', () => {
  sounds.init();
  if (gameState === 'START' || gameState === 'GAMEOVER') {
    resetGame();
  } else if (gameState === 'RUNNING') {
    dino.jump();
  }
});

// Format score with leading zeros
function formatScore(n) {
  return String(Math.floor(n)).padStart(5, '0');
}

// Main Game Loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Update Game Loop logic if running
  if (gameState === 'RUNNING') {
    frameCount++;
    score += 0.15;
    gameSpeed = 6 + Math.floor(score / 100) * 0.45;

    // Milestone sound every 100 points
    const currentHundred = Math.floor(score / 100);
    if (currentHundred > 0 && currentHundred > lastScoreBeep) {
      lastScoreBeep = currentHundred;
      sounds.playScore();
    }

    groundOffset = (groundOffset + gameSpeed) % 24;

    // Clouds
    spawnCloud();
    for (let i = clouds.length - 1; i >= 0; i--) {
      clouds[i].x -= clouds[i].speed;
      if (clouds[i].x < -50) clouds.splice(i, 1);
    }

    // Dino
    dino.update();

    // Obstacles
    spawnObstacle();
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      obs.x -= gameSpeed;

      // Collision detection
      const dinoBox = dino.getBounds();
      const obsBox = { x: obs.x + 3, y: obs.y + 3, w: obs.w - 6, h: obs.h - 6 };

      if (checkCollision(dinoBox, obsBox)) {
        gameState = 'GAMEOVER';
        sounds.playGameOver();
        if (score > hiScore) {
          hiScore = Math.floor(score);
          localStorage.setItem('dino_hi_score', hiScore);
        }
      }

      if (obs.x < -60) {
        obstacles.splice(i, 1);
      }
    }
  }

  // 2. Render Elements
  // Clouds
  clouds.forEach(c => {
    drawSprite(SPRITES.cloud, c.x, c.y, 2, '#c0c0c0');
  });

  // Horizon / Ground line & bump dashes
  ctx.strokeStyle = '#535353';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(canvas.width, GROUND_Y);
  ctx.stroke();

  // Subtle ground details
  ctx.fillStyle = '#9e9e9e';
  for (let x = -groundOffset; x < canvas.width; x += 40) {
    ctx.fillRect(x, GROUND_Y + 4, 14, 2);
    ctx.fillRect(x + 22, GROUND_Y + 10, 6, 2);
  }

  // Draw obstacles
  obstacles.forEach(obs => {
    if (obs.type === 'cactusSmall') {
      drawSprite(SPRITES.cactusSmall, obs.x, obs.y, 3.2);
    } else if (obs.type === 'cactusDouble') {
      drawSprite(SPRITES.cactusDouble, obs.x, obs.y, 3.2);
    } else if (obs.type === 'bird') {
      const birdSprite = Math.floor(frameCount / 8) % 2 === 0 ? SPRITES.birdWingUp : SPRITES.birdWingDown;
      drawSprite(birdSprite, obs.x, obs.y, 2.5);
    }
  });

  // Draw Dino
  dino.draw();

  // Update HTML score counter
  scoreText.textContent = formatScore(score);
  hiScoreText.textContent = `HI ${formatScore(hiScore)}`;

  // UI Overlays for Start and Game Over
  if (gameState === 'START') {
    ctx.fillStyle = '#535353';
    ctx.font = '14px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PRESS SPACE OR CLICK TO START', canvas.width / 2, 110);
  } else if (gameState === 'GAMEOVER') {
    ctx.fillStyle = '#535353';
    ctx.font = '16px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('G A M E   O V E R', canvas.width / 2, 95);

    // Restart Icon / message
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.fillText('PRESS SPACE TO RESTART', canvas.width / 2, 130);
  }

  requestAnimationFrame(gameLoop);
}

// Start loop
requestAnimationFrame(gameLoop);

