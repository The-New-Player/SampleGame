let socket;
let board = Array(3).fill().map(() => Array(3).fill(null));
let turn = "O";

function setup() {
  createCanvas(300, 300);
  socket = io();

  socket.on("move", (data) => {
    board[data.i][data.j] = data.player;
  });
}

function draw() {
  background(255);
  stroke(0);
  for (let i = 1; i < 3; i++) {
    line(i * 100, 0, i * 100, 300);
    line(0, i * 100, 300, i * 100);
  }

  textSize(64);
  textAlign(CENTER, CENTER);
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i][j]) text(board[i][j], j * 100 + 50, i * 100 + 50);
    }
  }
}

function mousePressed() {
  let i = floor(mouseY / 100);
  let j = floor(mouseX / 100);
  if (!board[i][j]) {
    board[i][j] = turn;
    socket.emit("move", { i, j, player: turn });
    turn = turn === "O" ? "X" : "O";
  }
}
