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





// let socket;
// let board = Array(3).fill().map(() => Array(3).fill(null));
// let turn = "O";
// let myTurn = false;
// let roomId;

// let clearButton;

// function setup() {
//   createCanvas(400, 400);
//   clearButton = createButton("クリア");
//   clearButton.position(10, 420);
//   clearButton.mousePressed(() => {
//     socket.emit("clear", roomId);
//   });

//   socket = io();

//   // URLからroomIdを取得
//   const pathParts = window.location.pathname.split("/");
//   roomId = pathParts[pathParts.length - 1];
//   socket.emit("joinRoom", roomId);

//   socket.on("startGame", () => {
//     myTurn = true;
//     console.log("Game started!");
//   });

//   socket.on("move", (data) => {
//     board[data.i][data.j] = data.player;
//     turn = data.player === "O" ? "X" : "O";
//   });

//   socket.on("clear", () => {
//     clearBoard();
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
//   if (!myTurn) return; // 順番じゃなければ無視

//   let i = floor(mouseY / 100);
//   let j = floor(mouseX / 100);
//   if (!board[i][j]) {
//     board[i][j] = turn;
//     socket.emit("move", { i, j, player: turn, roomId });
//     turn = turn === "O" ? "X" : "O";
//     myTurn = false; // ターン交代
//   }
// }

// function clearBoard() {
//   board = Array(3).fill().map(() => Array(3).fill(null));
//   turn = "O";
//   myTurn = true;
// }




let socket;
let roomId;
let myTurn = false;
let mySymbol = null;
let board = Array(9).fill(null);
let statusMessage = "Connecting...";

function setup() {
  createCanvas(400, 450);
  socket = io();

  const path = window.location.pathname;
  if (path === "/") setupHome();
  else if (path === "/create") setupCreate();
  else if (path === "/enter") setupEnter();
  else if (path.startsWith("/room/")) {
    roomId = path.split("/")[2];
    setupRoom();
  }
}

function setupHome() {
  createButton("Create").mousePressed(() => (window.location.href = "/create"));
  createButton("Enter").mousePressed(() => (window.location.href = "/enter"));
}

function setupCreate() {
  const code = nf(floor(random(0, 999999)), 6);
  createP(`Room Code: ${code}`);
  createButton("Create Room").mousePressed(() => {
    window.location.href = `/room/${code}`;
  });
}

function setupEnter() {
  const input = createInput("");
  input.attribute("placeholder", "Enter 6-digit code");
  createButton("Enter Room").mousePressed(() => {
    const code = input.value();
    if (code.match(/^\d{6}$/)) {
      window.location.href = `/room/${code}`;
    } else {
      alert("Please enter a 6-digit number");
    }
  });
}

function setupRoom() {
  socket.emit("joinRoom", roomId);

  // 自分のシンボルを受け取る
  socket.on("assignSymbol", (symbol) => {
    mySymbol = symbol;
    myTurn = symbol === "O"; // Oが先手
    statusMessage = `You are ${mySymbol}. Waiting for another player...`;
  });

  // 2人揃ったらゲーム開始
  socket.on("startGame", () => {
    statusMessage = `Game start! ${mySymbol === "O" ? "Your turn" : "Opponent's turn"}`;
  });

  // 相手が動いたら更新
  socket.on("move", (data) => {
    board[data.index] = data.symbol;
    myTurn = data.symbol !== mySymbol; // 相手のターンが終わったら自分のターン
  });

  socket.on("roomFull", () => {
    statusMessage = "This room is full.";
  });
}

function mousePressed() {
  if (!myTurn || !mySymbol) return;
  if (mouseY > 400) return; // ボード外

  const i = floor(mouseX / 133);
  const j = floor(mouseY / 133);
  const index = i + j * 3;

  if (index >= 0 && index < 9 && !board[index]) {
    board[index] = mySymbol;
    socket.emit("move", { roomId, index, symbol: mySymbol });
    myTurn = false;
    statusMessage = "Waiting for opponent...";
  }
}

function draw() {
  background(240);
  drawBoard();
  textSize(16);
  textAlign(CENTER);
  fill(0);
  text(statusMessage, width / 2, 430);
}

function drawBoard() {
  strokeWeight(2);
  for (let i = 1; i < 3; i++) {
    line(i * 133, 0, i * 133, 400);
    line(0, i * 133, 400, i * 133);
  }

  textSize(64);
  textAlign(CENTER, CENTER);
  for (let i = 0; i < 9; i++) {
    const x = (i % 3) * 133 + 66;
    const y = floor(i / 3) * 133 + 66;
    text(board[i] || "", x, y);
  }
}
