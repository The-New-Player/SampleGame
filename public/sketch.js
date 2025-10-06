// let socket;
// let board = Array(3).fill().map(() => Array(3).fill(null));
// let turn = "O";

// let clearButton;

// function setup() {
//   createCanvas(400, 400);
//   clearButton = createButton('クリア');
//   clearButton.position(10, 420);
//   clearButton.mousePressed(clearBoard);
//   socket = io();

//   socket.on("move", (data) => {
//     board[data.i][data.j] = data.player;
//   });
// }

// function draw() {
//   background(255);
//   stroke(0);
//   for (let i = 1; i < 3; i++) {
//     line(i * 100, 0, i * 100, 300);
//     line(0, i * 100, 300, i * 100);
//   }

//   textSize(64);
//   textAlign(CENTER, CENTER);
//   for (let i = 0; i < 3; i++) {
//     for (let j = 0; j < 3; j++) {
//       if (board[i][j]) text(board[i][j], j * 100 + 50, i * 100 + 50);
//     }
//   }
// }

// function mousePressed() {
//   let i = floor(mouseY / 100);
//   let j = floor(mouseX / 100);
//   if (!board[i][j]) {
//     board[i][j] = turn;
//     socket.emit("move", { i, j, player: turn });
//     turn = turn === "O" ? "X" : "O";
//   }
// }

// function clearBoard() {
//   // 盤面初期化
//   board = [
//     ['', '', ''],
//     ['', '', ''],
//     ['', '', '']
//   ];
//   currentPlayer = 'O'; // 先手に戻すなど
//   redraw()
// }



let socket;
let board = Array(3).fill().map(() => Array(3).fill(null));
let turn = "O";
let myTurn = false;
let roomId;

let clearButton;

function setup() {
  createCanvas(400, 400);
  clearButton = createButton("クリア");
  clearButton.position(10, 420);
  clearButton.mousePressed(() => {
    socket.emit("clear", roomId);
  });

  socket = io();

  // URLからroomIdを取得
  const pathParts = window.location.pathname.split("/");
  roomId = pathParts[pathParts.length - 1];
  socket.emit("joinRoom", roomId);

  socket.on("startGame", () => {
    myTurn = true;
    console.log("Game started!");
  });

  socket.on("move", (data) => {
    board[data.i][data.j] = data.player;
    turn = data.player === "O" ? "X" : "O";
  });

  socket.on("clear", () => {
    clearBoard();
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
  if (!myTurn) return; // 順番じゃなければ無視

  let i = floor(mouseY / 100);
  let j = floor(mouseX / 100);
  if (!board[i][j]) {
    board[i][j] = turn;
    socket.emit("move", { i, j, player: turn, roomId });
    turn = turn === "O" ? "X" : "O";
    myTurn = false; // ターン交代
  }
}

function clearBoard() {
  board = Array(3).fill().map(() => Array(3).fill(null));
  turn = "O";
  myTurn = true;
}
