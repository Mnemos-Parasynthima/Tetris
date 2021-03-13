const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

const audioTetrisLand = new Audio("./audio/tetrisLand.wav");
const audioTetrisMove = new Audio("./audio/tetrisMove.wav");
const audioTetrisTurn = new Audio("./audio/tetrisTurn.wav");
const audioTetrisMusic = new Audio("./audio/tetrisMusic.wav");

ctx.scale(20, 20);

class Player {
  constructor(x, y, matrix, score, hiScore) {
    this.pos = {
      x: this.x,
      y: this.y
    };
    this.matrix = matrix;
    this.score = score;
    this.hiScore = hiScore;
  }
}

const player = new Player(0, 0, null, 0, 1380);

function arenaSweep() {
  let rowCount = 1;
  outer: for (let y = arena.length - 1; y > 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }

    let row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;

    player.score += rowCount * 50; //Og * 50
    rowCount *= 2;
  }
}

function collide(arena, player) {
  let m = player.matrix;
  let o = player.pos;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece(type) {
  switch (type) {
    case "T":
      return [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
      ];
    case "O":
      return [
        [2, 2],
        [2, 2],
      ];
    case "L":
      return [
        [0, 3, 0],
        [0, 3, 0],
        [0, 3, 3],
      ];
    case "J":
      return [
        [0, 4, 0],
        [0, 4, 0],
        [4, 4, 0],
      ];
    case "I":
      return [
        [0, 5, 0, 0],
        [0, 5, 0, 0],
        [0, 5, 0, 0],
        [0, 5, 0, 0],
      ];
    case "S":
      return [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
      ];
    case "P":
      return [
        [1],
      ];
    case "Z":
      return [
        [6, 6, 0],
        [0, 6, 6],
        [0, 0, 0],
      ];
  }
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = colors[value];
        ctx.fillRect(x + offset.x,
          y + offset.y,
          1, 1);
      }
    });
  });
}

function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [
        matrix[x][y],
        matrix[y][x],
      ] = [
          matrix[y][x],
          matrix[x][y],
        ];
    }
  }

  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function playerDrop() {
  player.pos.y++;
  //audioTetrisLand.play();
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
  }
  dropCounter = 0;
}

function playerMove(offset) {
  player.pos.x += offset;
  //audioTetrisMove.play();
  if (collide(arena, player)) {
    player.pos.x -= offset;
  }
}

function playerReset() {
  const pieces = "ILJOTSZP";
  player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
  player.pos.y = 0;
  player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
  }
}

function playerRotate(dir) {
  let pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  //audioTetrisTurn.play();
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

let dropCounter = 0;
let dropInterval = 1000; //in ms, 1 sec.

let lastTime = 0;
function update(time = 0) {
  let deltaTime = time - lastTime;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }

  lastTime = time;

  draw();
  window.requestAnimationFrame(update);
  //audioTetrisMusic.play();
}

function updateScore() {
  document.getElementById("score").innerText = player.score;
  if (player.score > player.hiScore) {
    document.getElementById("hiScore").innnerText = player.score;
  }
}

document.addEventListener("keydown", event => {
  switch (event.key) {
    case 'a': playerMove(-1); break; //<--
    case 'd': playerMove(1); break; //->
    case 's': playerDrop(); break; //|
    case 'q': playerRotate(-1); break; //Q
    case 'e': playerRotate(1); break; //W
  }
});

const colors = [
  null,
  '#FF0D72',
  '#0DC2FF',
  '#0DFF72',
  '#F538FF',
  '#FF8E0D',
  '#FFE138',
  '#3877FF',
];

const arena = createMatrix(12, 20);

playerReset();
updateScore();
update();

