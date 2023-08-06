"use strict";
var gLevel = {
  SIZE: 4,
  MINES: 2,
};
var gGame = {
  isOn: true,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
  lives: 3,
};
// localStorage.bestScore = 100;
var GsafeClicks = 3;
var gTimerIntervalId;
var isFirstClick = true;
var gBoard;
var gIsHint = false;
var gHints = 0;
var elBestScore = document.querySelector(".best-score");
elBestScore.innerText = localStorage.bestScore;

function onMediumClick() {
  gLevel.SIZE = 8;
  gLevel.MINES = 14;
  resetGame();
}

function onEasyClick() {
  gLevel.SIZE = 4;
  gLevel.MINES = 2;
  resetGame();
}
function onHardClick() {
  gLevel.SIZE = 12;
  gLevel.MINES = 32;
  resetGame();
}

function init() {
  gBoard = buildBoard(gLevel.SIZE);
  renderBoard(gBoard);
  setRandomMinesAndCountNegs(gLevel.MINES, gLevel.SIZE);
}

//build a Board

function buildBoard(size) {
  var board = [];
  for (var i = 0; i < size; i++) {
    board[i] = [];
    for (var j = 0; j < size; j++) {
      board[i][j] = {
        isMine: false,
        minesAroundCount: 0,
        isShown: false,
        isMarked: false,
      };
    }
  }
  return board;
}
// console.log(gBoard);

////render the board

function renderBoard(board) {
  var strHtml = "";
  for (var i = 0; i < board.length; i++) {
    strHtml += `<tr>\n`;
    for (var j = 0; j < board.length; j++) {
      strHtml += `\t<td oncontextmenu="onRightClick(this,event)" class="cell cell-${i}-${j}" onclick="onCellClick(this)"></td>\n`;
    }
    strHtml += "</tr>";
  }

  var elBoard = document.querySelector(".board");
  elBoard.innerHTML = strHtml;
}
/////////////// get random mines
// setRandomMines(gLevel.MINES, gLevel.SIZE);
function setRandomMinesAndCountNegs(minesCount, indexUpRange) {
  for (var i = 0; i < minesCount; i++) {
    var row = getRandomInt(0, indexUpRange);
    var col = getRandomInt(0, indexUpRange);

    while (gBoard[row][col].isMine) {
      row = getRandomInt(0, indexUpRange);
      col = getRandomInt(0, indexUpRange);
    }

    gBoard[row][col].isMine = true;
    console.log("mine id", row, col);
    countMinesAroundCell(row, col);
  }

  console.log(gBoard);
}

function countMinesAroundCell(mineRow, mineCol) {
  for (var i = mineRow - 1; i <= mineRow + 1; i++) {
    if (i < 0 || i > gBoard.length - 1) continue;
    for (var j = mineCol - 1; j <= mineCol + 1; j++) {
      if (j < 0 || j > gBoard.length - 1) continue;
      if (i === mineRow && j === mineCol) continue;
      gBoard[i][j].minesAroundCount++;
    }
  }
}

function onCellClick(elCell) {
  if (!gGame.isOn) return;
  if (isFirstClick) {
    getTime();
    isFirstClick = false;
  }

  const className = elCell.className;
  // returns array[0]=i [1]=j
  var idxArr = getCellIdxFromClass(className);
  var row = +idxArr[0];
  var col = +idxArr[1];
  //   console.log(row, col);
  var cell = gBoard[row][col];
  if (gIsHint) {
    revealedCellsWhenHint(row, col);
    gHints++;
    return;
  }

  if (cell.isMarked || cell.isShown) return;
  //   var elCell = document.querySelector(`.cell-${row}-${col}`)

  /////// clicked cell options :
  //is mine:
  if (cell.isMine) {
    cell.isShown = true;
    console.log("is mine");
    handleClickOnMine(elCell);
    return;
  }
  //is mine neighbour :

  if (cell.minesAroundCount > 0) {
    handleClickOnMineNeg(elCell);
    cell.isShown = true;
  }
  //is empty:
  if (!cell.isMine && cell.minesAroundCount === 0) {
    cell.isShown = true;
    gGame.shownCount++;
    elCell.style.backgroundColor = "rgb(196, 193, 193)";
    // handleClickOnEmptyCell(elCell, row, col);
    // cell.isShown = true;
    fullExpand(row, col);
    // console.log("dd");
  }
  console.log(gGame.shownCount);
  checkWin();
}

function getCellIdxFromClass(ClassStr) {
  var idxArr = ClassStr.slice(10).split("-");
  return idxArr;
}

function handleClickOnMine(elCell) {
  console.log("a mine!");

  elCell.innerText = "💣";
  elCell.style.backgroundColor = "rgb(196, 193, 193)";
  gGame.lives--;
  var elLivesSpan = document.querySelector(".lives");
  elLivesSpan.innerText = gGame.lives;
  if (gGame.lives === 0) {
    gGame.isOn = false;
    makeSmileySad();
    console.log("game over");
    clearInterval(gTimerIntervalId);
  }
}

function handleClickOnMineNeg(elCell) {
  //   console.log(" mine negs!");
  var idxArr = getCellIdxFromClass(elCell.className);
  //   console.log(idxArr);
  var row = +idxArr[0];
  var col = +idxArr[1];
  elCell.innerText = gBoard[row][col].minesAroundCount;
  elCell.style.backgroundColor = "rgb(196, 193, 193)";
  gBoard[row][col].isShown = true;
  gGame.shownCount++;
}

function handleClickOnEmptyCell(elCell, row, col) {
  elCell.style.backgroundColor = "rgb(196, 193, 193)";
  gBoard[row][col].isShown = true;
  gGame.shownCount++;
  fullExpand(row, col, gBoard);
}

function fullExpand(row, col) {
  for (var i = row - 1; i <= row + 1; i++) {
    if (i < 0 || i > gBoard.length - 1) continue;
    for (var j = col - 1; j <= col + 1; j++) {
      if (j < 0 || j > gBoard.length - 1) continue;
      if (i === row && j === col) continue;
      var currCell = gBoard[i][j];
      if (currCell.isShown) continue;
      var elCell = document.querySelector(`.cell-${i}-${j}`);
      console.log(currCell, elCell);
      if (currCell.minesAroundCount > 0) {
        handleClickOnMineNeg(elCell);
      }
      if (currCell.minesAroundCount === 0 && !currCell.isShown) {
        currCell.isShown = true;
        gGame.shownCount++;
        elCell.style.backgroundColor = "rgb(196, 193, 193)";

        fullExpand(i, j);
      }
    }
  }
  checkWin();
  //   console.log(gBoard);
}

function onRightClick(elCell, ev) {
  ev.preventDefault();
  var idxarr = getCellIdxFromClass(elCell.className);
  var row = idxarr[0];
  var col = idxarr[1];

  if (gBoard[row][col].isMarked) {
    gBoard[row][col].isMarked = false;
    elCell.innerText = "";
  } else {
    gBoard[row][col].isMarked = true;
    elCell.innerText = "🚩";
  }
}
function makeSmileySad() {
  var elSmiley = document.querySelector(".smiley");
  elSmiley.innerText = "😖";
}
function addSmileyGlasses() {
  var elSmiley = document.querySelector(".smiley");
  elSmiley.innerText = "😎";
}
function resetGame() {
  gHints = 0;
  GsafeClicks = 3;
  gGame.secsPassed = 0;
  clearInterval(gTimerIntervalId);
  gGame.isOn = true;
  isFirstClick = true;
  gGame.lives = 3;
  gBoard = buildBoard(gLevel.SIZE);
  renderBoard(gBoard);
  setRandomMinesAndCountNegs(gLevel.MINES, gLevel.SIZE);
  gGame.shownCount = 0;
  var elLivesSpan = document.querySelector(".lives");
  elLivesSpan.innerText = gGame.lives;
  var elSmiley = document.querySelector(".smiley");
  elSmiley.innerText = "😀";
  var elTimer = document.querySelector(".timer");
  elTimer.innerText = 0;
}

function checkWin() {
  if (gGame.shownCount === gLevel.SIZE * gLevel.SIZE - gLevel.MINES) {
    console.log("win");
    addSmileyGlasses();
    gGame.isOn = false;
    clearInterval(gTimerIntervalId);
    if (gGame.secsPassed < localStorage.bestScore) {
      localStorage.bestScore = gGame.secsPassed;
    }
    return;
  } else {
    return;
  }
}

function revealedCellsWhenHint(i, j) {
  for (var a = i - 1; a <= i + 1; a++) {
    if (a < 0 || a > gBoard.length - 1) continue;
    for (var x = j - 1; x <= j + 1; x++) {
      if (x < 0 || x > gBoard.length - 1) continue;
      if (gBoard[a][x].isShown) continue;
      if (gBoard[a][x].isMarked) continue;
      var elCell = document.querySelector(`.cell-${a}-${x}`);

      if (gBoard[a][x].isMine) {
        elCell.innerText = "💣";
        elCell.style.backgroundColor = "rgb(196, 193, 193)";
        continue;
      }
      if (gBoard[a][x].minesAroundCount > 0) {
        elCell.innerText = gBoard[a][x].minesAroundCount;
        elCell.style.backgroundColor = "rgb(196, 193, 193)";
        continue;
      }
      if (gBoard[a][x].minesAroundCount === 0 && !gBoard[a][x].isMine) {
        elCell.innerText = "";
        elCell.style.backgroundColor = "rgb(196, 193, 193)";
      }
    }
  }
  setTimeout(hideCell, 1000, i, j);
}

function hideCell(i, j) {
  for (var b = i - 1; b <= i + 1; b++) {
    if (b < 0 || b > gBoard.length - 1) continue;
    for (var x = j - 1; x <= j + 1; x++) {
      if (x < 0 || x > gBoard.length - 1) continue;
      if (gBoard[b][x].isShown) continue;
      if (gBoard[b][x].isMarked) continue;
      const elCell = document.querySelector(`.cell-${b}-${x}`);
      elCell.style.backgroundColor = "grey";
      elCell.innerText = "";
    }
  }
  gIsHint = false;
  var elBtn = document.querySelector(".hint");
  elBtn.style.backgroundColor = "aliceblue";
}

function onHintClick() {
  if (gHints === 3) return;
  gIsHint = true;
  var elHint = document.querySelector(`.hint`);
  elHint.style.backgroundColor = "yellow";
}

function getTime() {
  var start = Date.now();

  gTimerIntervalId = setInterval(function () {
    var delta = Date.now() - start;
    var elTimer = document.querySelector(".timer");
    elTimer.innerText = delta / 1000;
    gGame.secsPassed = delta / 1000;

    // console.log(delta / 1000);
  }, 100);
}

function onSafeClick() {
  if (GsafeClicks === 0) return;

  var row = getRandomInt(0, gLevel.SIZE);
  var col = getRandomInt(0, gLevel.SIZE);
  while (
    gBoard[row][col].isMine ||
    gBoard[row][col].isShown ||
    gBoard[row][col].isMarked
  ) {
    var row = getRandomInt(0, gLevel.SIZE);
    var col = getRandomInt(0, gLevel.SIZE);
  }
  var elCell = document.querySelector(`.cell-${row}-${col}`);

  if (gBoard[row][col].minesAroundCount > 0) {
    elCell.innerText = gBoard[row][col].minesAroundCount;
    elCell.style.backgroundColor = "rgb(196, 193, 193)";
  } else {
    elCell.innerText = "";
    elCell.style.backgroundColor = "rgb(196, 193, 193)";
  }

  setTimeout(hideCell1, 2000, row, col, elCell);
  GsafeClicks--;
}
function hideCell1(i, j, elCell) {
  elCell.style.backgroundColor = "grey";
  elCell.innerText = "";
}
// console.log(gBoard);

// var gLevel = {
//   SIZE: 4,
//   MINES: 2,
// };
// var gGame = {
//   isOn: false,
//   shownCount: 0,
//   markedCount: 0,
//   secsPassed: 0,
// };
// var gBoard = createBoard();
// renderBoard();

// function createBoard() {
//   var board = [];
//   for (var i = 0; i < gLevel.SIZE; i++) {
//     board[i] = [];
//     for (var j = 0; j < gLevel.SIZE; j++) {
//       board[i][j] = {
//         minesAroundCount: 0,
//         isShown: false,
//         isMine: false,
//         isMarked: false,
//       };
//     }
//   }
//   return board;
// }
// function renderBoard() {
//   var strHTML = "";
//   for (var i = 0; i < gBoard.length; i++) {
//     strHTML += "<tr>";
//     for (var j = 0; j < gBoard[i].length; j++) {
//       var cellClass = `cell cell-${i}-${j}`;
//       strHTML += `<td class="${cellClass}" data-row="${i}" data-col="${j}" onclick="cellClicked(this)"></td>`;
//     }
//     strHTML += "</tr>";
//   }
//   var elBoard = document.querySelector(".board");
//   elBoard.innerHTML = strHTML;
// }

// function setMinesNegsCount(board, rowIdx, colIdx) {
//   var counter = 0;
//   for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
//     if (i < 0 || i >= board.length) continue;
//     for (var j = colIdx - 1; j <= colIdx + 1; j++) {
//       if (j < 0 || j >= board[i].length) continue;
//       if (i === rowIdx && j === colIdx) continue;
//       if (board[i][j].isMine) counter++;
//     }
//   }
//   board[rowIdx][colIdx].minesAroundCount = counter;
// }
// function getRandomMines() {
//   for (var k = 0; k < gLevel.MINES; k++) {
//     var row = getRandomInt(0, gLevel.SIZE);
//     var col = getRandomInt(0, gLevel.SIZE);

//     while (gBoard[row][col].isMine) {
//       row = getRandomInt(0, gLevel.SIZE);
//       col = getRandomInt(0, gLevel.SIZE);
//     }

//     gBoard[row][col].isMine = true;
//   }
// }

///////////////////////////////////////////////////

// var gLevel = {
//   SIZE: 4,
//   MINES: 2,
// };
// var gGame = {
//   isOn: false,
//   shownCount: 0,
//   markedCount: 0,
//   secsPassed: 0,
//   lives: 3,
// };
// var gFirstClick = true;

// var gBoard = createBoard();
// console.log(gBoard);
// renderBoard();

// function createBoard() {
//   var board = [];
//   for (var i = 0; i < gLevel.SIZE; i++) {
//     board[i] = [];
//     for (var j = 0; j < gLevel.SIZE; j++) {
//       board[i][j] = {
//         minesAroundCount: 0,
//         isShown: false,
//         isMine: false,
//         isMarked: false,
//       };
//     }
//   }

//   // add random mines
//   // for (var k = 0; k < gLevel.MINES; k++) {
//   //   var row = getRandomInt(0, gLevel.SIZE);
//   //   var col = getRandomInt(0, gLevel.SIZE);

//   //   while (board[row][col].isMine) {
//   //     row = getRandomInt(0, gLevel.SIZE);
//   //     col = getRandomInt(0, gLevel.SIZE);
//   //   }

//   //   board[row][col].isMine = true;
//   // }

//   // //count mines neighbors for each cell
//   // for (var i = 0; i < gLevel.SIZE; i++) {
//   //   for (var j = 0; j < gLevel.SIZE; j++) {
//   //     setMinesNegsCount(board, i, j);
//   //   }
//   // }

//   return board;
// }
// function renderBoard() {
//   var strHTML = "";
//   for (var i = 0; i < gBoard.length; i++) {
//     strHTML += "<tr>";
//     for (var j = 0; j < gBoard[i].length; j++) {
//       var cellClass = `cell cell-${i}-${j}`;
//       strHTML += `<td class="${cellClass}" data-row="${i}" data-col="${j}" onclick="cellClicked(this)"></td>`;
//     }
//     strHTML += "</tr>";
//   }
//   var elBoard = document.querySelector(".board");
//   elBoard.innerHTML = strHTML;
// }
// function cellClicked(elCell) {
//   var row = +elCell.dataset.row;
//   var col = +elCell.dataset.col;
//   var cell = gBoard[row][col];
//   if (gFirstClick) {
//     for (var k = 0; k < gLevel.MINES; k++) {
//       var row = getRandomInt(0, gLevel.SIZE);
//       var col = getRandomInt(0, gLevel.SIZE);

//       while (gBoard[row][col].isMine) {
//         row = getRandomInt(0, gLevel.SIZE);
//         col = getRandomInt(0, gLevel.SIZE);
//       }

//       gBoard[row][col].isMine = true;
//     }

//     //count mines neighbors for each cell
//     for (var i = 0; i < gLevel.SIZE; i++) {
//       for (var j = 0; j < gLevel.SIZE; j++) {
//         setMinesNegsCount(gBoard, i, j);
//       }
//     }
//     fullExpand(row, col);
//     gFirstClick = false;
//   }

//   if (cell.isShown || cell.isMarked) return;
//   if (cell.isMine) {
//     onMineClick(row, col);
//     return;
//   }

//   // if clicked cell is empty
//   if (cell.minesAroundCount === 0) {
//     fullExpand(row, col);
//   } else {
//     cell.isShown = true;
//     gGame.shownCount++;
//     renderCell(row, col);
//   }

//   checkWin();
// }
// function setMinesNegsCount(board, rowIdx, colIdx) {
//   var counter = 0;
//   for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
//     if (i < 0 || i >= board.length) continue;
//     for (var j = colIdx - 1; j <= colIdx + 1; j++) {
//       if (j < 0 || j >= board[i].length) continue;
//       if (i === rowIdx && j === colIdx) continue;
//       if (board[i][j].isMine) counter++;
//     }
//   }
//   board[rowIdx][colIdx].minesAroundCount = counter;
// }
// function renderCell(i, j) {
//   const elCell = document.querySelector(`.cell-${i}-${j}`);
//   const cell = gBoard[i][j];

//   if (cell.isMarked) {
//     elCell.innerText = "🚩";
//     return;
//   }

//   if (cell.isMine) {
//     elCell.innerText = "💣";
//   } else if (cell.minesAroundCount > 0) {
//     elCell.innerText = cell.minesAroundCount;
//   } else {
//     elCell.innerText = "";
//   }
//   elCell.style.backgroundColor = "rgb(196, 193, 193)";
// }
// function fullExpand(i, j) {
//   if (i < 0 || i >= gBoard.length || j < 0 || j >= gBoard[i].length) {
//     return;
//   }

//   var cell = gBoard[i][j];
//   if (!cell.isMine && !cell.isShown) {
//     cell.isShown = true;
//     gGame.shownCount++;
//     renderCell(i, j);

//     if (cell.minesAroundCount === 0) {
//       for (var x = i - 1; x <= i + 1; x++) {
//         for (var y = j - 1; y <= j + 1; y++) {
//           fullExpand(x, y);
//         }
//       }
//     }
//   }
// }

// function onMineClick(row, col) {
//   var cell = gBoard[row][col];
//   cell.isShown = true;
//   renderCell(row, col);
//   //decrease live and check if game over
//   gGame.lives--;
//   var elLivesSpan = document.querySelector(".lives");
//   elLivesSpan.innerText = gGame.lives;
//   if (gGame.lives === 0) handleGameOver();
// }
// function handleGameOver() {
//   alert("Game Over!");
// }
// function checkWin() {
//   var nonMineCellsCount = gLevel.SIZE * gLevel.SIZE - gLevel.MINES;
//   var revealedNonMineCellsCount = 0;

//   for (var i = 0; i < gLevel.SIZE; i++) {
//     for (var j = 0; j < gLevel.SIZE; j++) {
//       if (!gBoard[i][j].isMine && gBoard[i][j].isShown) {
//         revealedNonMineCellsCount++;
//       }
//     }
//   }

//   if (revealedNonMineCellsCount === nonMineCellsCount) {
//     console.log("Congratulations! You win!");
//   }
// }

/////////////////////////////////////////////////////
// var gLevel = {
//   SIZE: 4,
//   MINES: 2,
// };

// var gGame = {
//   isOn: false,
//   shownCount: 0,
//   markedCount: 0,
//   secsPassed: Infinity,
// };
// const MINE_IMG = "💣";
// var gBoard;
// var gClickCount = 0;
// var gLives = 3;
// var gShowenCells = 0;
// var gShowenForWin = gLevel.SIZE * gLevel.SIZE - gLevel.MINES;
// var gIsHint = false;
// var gHints = 0;
// var gTimerIntervalId;
// var gCorrectlyMarkedMines = 0;

// onInit();

// function onInit() {
//   var elBestScore = document.querySelector(".best-score");
//   elBestScore.innerHTML = localStorage.bestScore;
//   clearInterval(gTimerIntervalId);
//   var elTimer = document.querySelector(".timer");
//   elTimer.innerText = 0.0;
//   gHints = 0;
//   gClickCount = 0;
//   gLives = 3;
//   gShowenCells = 0;
//   var elLivesSpan = document.querySelector(".num-lives");
//   elLivesSpan.innerText = gLives;
//   makeSmileyHappy();
//   gBoard = createBoard();
//   // addRandomMines();
//   renderBoard();
// }

// function createBoard() {
//   var board = [];
//   for (var i = 0; i < gLevel.SIZE; i++) {
//     board[i] = [];
//     for (var j = 0; j < gLevel.SIZE; j++) {
//       board[i][j] = {
//         minesAroundCount: "",
//         isShown: false,
//         isMine: false,
//         isMarked: false,
//       };
//     }
//   }

//   // board[1][1].isMine = true;
//   // board[2][3].isMine = true;

//   // console.log(board);
//   return board;
// }

// function renderBoard() {
//   var strHTML = "";
//   for (var i = 0; i < gBoard.length; i++) {
//     strHTML += `<tr>\n`;
//     for (var j = 0; j < gBoard.length; j++) {
//       var className = `cell cell-${i}-${j}`;
//       strHTML += `\t<td oncontextmenu="onRightClick(this,event)" onclick="onCellClicked(this)" class="${className}"></td>\n`;
//       // if (gBoard[i][j].isMine) {
//       //   strHTML += `${MINE_IMG}`;
//       // } else {
//       //   setMinesNegsCount(i, j);
//       //   strHTML += `${gBoard[i][j].minesAroundCount}`;
//       // }
//     }
//     strHTML += `</tr>\n`;
//   }
//   const elTable = document.querySelector(".board");
//   elTable.innerHTML = strHTML;
// }

// function setMinesNegsCount(rowIdx, colIdx) {
//   var counter = 0;
//   for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
//     if (i < 0 || i > gBoard.length - 1) continue;
//     for (var j = colIdx - 1; j <= colIdx + 1; j++) {
//       if (j < 0 || j > gBoard.length - 1) continue;
//       if (j === colIdx && i === rowIdx) continue;
//       if (gBoard[i][j].isMine) counter++;
//     }
//   }
//   if (!counter) return;
//   gBoard[rowIdx][colIdx].minesAroundCount = counter;
// }
// function onRightClick(elCell, ev) {
//   ev.preventDefault();
//   var location = getLocationFromClass(elCell.className);
//   if (gBoard[location.i][location.j].isShown) return;
//   if (gBoard[location.i][location.j].isMarked) {
//     gBoard[location.i][location.j].isMarked = false;
//     elCell.innerText = "";
//     if (gBoard[location.i][location.j].isMine) {
//       gCorrectlyMarkedMines--;
//     }
//     return;
//   }
//   gBoard[location.i][location.j].isMarked = true;
//   renderCell(location.i, location.j);
//   if (gBoard[location.i][location.j].isMine) {
//     gCorrectlyMarkedMines++;
//   }
// }

// function onCellClicked(elCell) {
//   var location = getLocationFromClass(elCell.className);
//   if (gBoard[location.i][location.j].isShown) return;
//   if (gBoard[location.i][location.j].isMarked) return;
//   if (gIsHint && gHints < 3) {
//     revealedCellsWhenHint(location.i, location.j);
//     gHints++;
//     return;
//   }

//   gBoard[location.i][location.j].isShown = true;
//   gClickCount++;
//   if (gClickCount === 1) {
//     renderCell(location.i, location.j);
//     getTime();
//     addRandomMines();
//     setMinesNegsCount(location.i, location.j);
//     // gShowenCells++;
//     elCell.innerText = gBoard[location.i][location.j].minesAroundCount;
//     elCell.style.backgroundColor = "rgb(196,193,193)";
//     return;
//   }

//   if (gBoard[location.i][location.j].isMine) {
//     gLives--;
//     var elLivesSpan = document.querySelector(".num-lives");
//     elLivesSpan.innerText = gLives;
//     renderCell(location.i, location.j);
//     if (gLives === 0) {
//       makeSmileySad();
//     }
//     return;
//   }
//   // gShowenCells++;
//   if (gShowenCells === gShowenForWin) {
//     addSmileyGlasses();
//   }
//   fullExpand(location.i, location.j);
//   checkWin();
//   // renderCell(location.i, location.j);
//   console.log(gShowenCells);
// }

// function renderCell(i, j) {
//   // if (gBoard[i][j].isShown) return;
//   const elCell = document.querySelector(`.cell-${i}-${j}`);
//   if (gBoard[i][j].isMarked) {
//     elCell.innerText = "🚩";
//     return;
//   }
//   if (gBoard[i][j].isMine) {
//     elCell.innerText = MINE_IMG;
//     elCell.style.backgroundColor = "rgb(196, 193, 193)";
//     return;
//   } else if (!gBoard[i][j].isMine) {
//     gBoard[i][j].isShown = true;
//     gShowenCells++;
//     if (gShowenCells === gShowenForWin) {
//       addSmileyGlasses();
//     }
//     setMinesNegsCount(i, j);
//     elCell.innerText = gBoard[i][j].minesAroundCount;
//     elCell.style.backgroundColor = "rgb(196, 193, 193)";
//     return;
//   }
// }

// function addRandomMines() {
//   var randomMinesIdx = [];
//   while (randomMinesIdx.length < gLevel.MINES) {
//     var idx = {};
//     idx.i = getRandomInt(0, gLevel.SIZE);
//     idx.j = getRandomInt(0, gLevel.SIZE);

//     // Check if the position already exists in randomMinesIdx
//     var isDuplicate = randomMinesIdx.some(
//       (pos) => pos.i === idx.i && pos.j === idx.j
//     );

//     // If it's not a duplicate, add it to the array
//     if (!isDuplicate) {
//       randomMinesIdx.push(idx);
//     }
//   }

//   console.log(randomMinesIdx);

//   for (var z = 0; z < randomMinesIdx.length; z++) {
//     var idxI = randomMinesIdx[z].i;
//     var idxJ = randomMinesIdx[z].j;
//     gBoard[idxI][idxJ].isMine = true;
//   }
// }

// function getLocationFromClass(ClassStr) {
//   var str = ClassStr.slice(10);
//   var idx = str.split("-");
//   var i = +idx[0];
//   var j = +idx[1];
//   var location = {
//     i: i,
//     j: j,
//   };
//   return location;
// }
// function onSmileyClick() {
//   onInit();
// }
// function makeSmileySad() {
//   var elSmiley = document.querySelector(".smiley");
//   elSmiley.innerText = "😖";
// }
// function makeSmileyHappy() {
//   var elSmiley = document.querySelector(".smiley");
//   elSmiley.innerText = "😃";
// }
// function addSmileyGlasses() {
//   var elSmiley = document.querySelector(".smiley");
//   elSmiley.innerText = "😎";
//   setTimer();
// }
// function onHintClick(elBtn) {
//   elBtn.style.backgroundColor = "yellow";
//   gIsHint = true;
//   if (gHints > 2) {
//     elBtn.style.backgroundColor = "aliceblue";
//   }
// }

// // revealedCellsWhenHint(1, 3);
// function revealedCellsWhenHint(i, j) {
//   for (var a = i - 1; a <= i + 1; a++) {
//     if (a < 0 || a > gBoard.length - 1) continue;
//     for (var x = j - 1; x <= j + 1; x++) {
//       if (x < 0 || x > gBoard.length - 1) continue;
//       if (gBoard[a][x].isShown) continue;
//       if (gBoard[a][x].isMarked) continue;

//       renderCell(a, x);
//     }
//   }
//   setTimeout(hideCell, 1000, i, j);
// }

// function hideCell(i, j) {
//   for (var b = i - 1; b <= i + 1; b++) {
//     if (b < 0 || b > gBoard.length - 1) continue;
//     for (var x = j - 1; x <= j + 1; x++) {
//       if (x < 0 || x > gBoard.length - 1) continue;
//       if (gBoard[b][x].isShown) continue;
//       if (gBoard[b][x].isMarked) continue;
//       const elCell = document.querySelector(`.cell-${b}-${x}`);
//       elCell.style.backgroundColor = "grey";
//       elCell.innerText = "";
//     }
//   }
//   gIsHint = false;
//   var elBtn = document.querySelector(".hint");
//   elBtn.style.backgroundColor = "aliceblue";
// }

// function getTime() {
//   var start = Date.now();

//   gTimerIntervalId = setInterval(function () {
//     var delta = Date.now() - start;
//     var elTimer = document.querySelector(".timer");
//     elTimer.innerText = delta / 1000;
//     // console.log(delta / 1000);
//   }, 100);
// }
// function setTimer() {
//   clearInterval(gTimerIntervalId);
//   var elTimer = document.querySelector(".timer");
//   gGame.secsPassed = +elTimer.innerText;
//   console.log(gGame.secsPassed);
//   if (gGame.secsPassed < localStorage.bestScore) {
//     localStorage.bestScore = gGame.secsPassed;
//   }
//   var elBestScore = document.querySelector(".best-score");
//   elBestScore.innerHTML = localStorage.bestScore;
// }
// function fullExpand(i, j) {
//   for (var x = i - 1; x <= i + 1; x++) {
//     if (x < 0 || x >= gBoard.length) continue;
//     for (var y = j - 1; y <= j + 1; y++) {
//       if (y < 0 || y >= gBoard[x].length) continue;
//       if (!gBoard[x][y].isMine && !gBoard[x][y].isShown) {
//         gBoard[x][y].isShown = true;
//         gShowenCells++;
//         if (gBoard[x][y].minesAroundCount === 0) {
//           fullExpand(x, y);
//         }
//       }
//     }
//   }
// }
// function checkWin() {
//   if (
//     gCorrectlyMarkedMines === gLevel.MINES &&
//     gShowenCells === gShowenForWin
//   ) {
//     console.log("victory!");
//     addSmileyGlasses();
//   }
// }
//////////////////////////////////////////////////////

// const MINE_IMG = "💣";
// var gCellClickCounter = 0;
// var gLives = 3;
// var isHint = false;

// var gGame = {
//   isOn: false,
//   shownCount: 0,
//   markedCount: 0,
//   secsPassed: 0,
// };

// var gLevel = {
//   SIZE: 4,
//   MINES: 2,
// };
// var gBoard = buildBoard(gLevel.SIZE);
// console.log(gBoard);
// // getIdxesForNegsCount();

// // console.table(gBoard);
// renderBoard();
// // setMinesNegsCount();

// function init() {
//   gCellClickCounter = 0;
//   gLives = 3;
//   returnToStart();
//   buildBoard();
//   renderBoard();
//   var elSmiley = document.querySelector(".smiley");
//   elSmiley.innerText = "😃";
// }

// function buildBoard(level) {
//   var board = [];
//   for (var i = 0; i < level; i++) {
//     board[i] = [];
//     for (var j = 0; j < level; j++) {
//       board[i][j] = {
//         minesAroundCount: "",
//         isShown: false,
//         isMine: false,
//         isMarked: true,
//       };
//     }
//   }
//   //   board[0][1].isMine = true;
//   //   board[3][1].isMine = true;

//   return board;
// }

// function renderBoard() {
//   //   getRandomMines();
//   //   getRandomMines();
//   var strHTML = "";
//   for (var i = 0; i < gBoard.length; i++) {
//     strHTML += `<tr class="board-row">\n`;

//     for (var j = 0; j < gBoard[i].length; j++) {
//       var currCell = gBoard[i][j];
//       var className = `cell cell-${i}-${j}`;
//       className += currCell.isMine ? " mine" : "";
//       strHTML += `\t <td onclick="onCellClick(this)" class="${className}" >`;
//       if (currCell.isMine) {
//         strHTML += MINE_IMG;
//       } else if (currCell.minesAroundCount) {
//         strHTML += currCell.minesAroundCount;
//       }
//       strHTML += `</td>\n`;
//     }
//     strHTML += `</tr>\n`;
//   }
//   const elTable = document.querySelector(".board");
//   elTable.innerHTML = strHTML;

//   //   console.log(elTable);
// }

// function getIdxesForNegsCount() {
//   for (var i = 0; i < gBoard.length; i++) {
//     for (var j = 0; j < gBoard[i].length; j++) {
//       setMinesNegsCount(i, j);
//     }
//   }
// }

// function setMinesNegsCount(rowIdx, colIdx) {
//   var negsMinesCounter = 0;
//   for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
//     if (i < 0 || i > gBoard.length - 1) continue;
//     for (var j = colIdx - 1; j <= colIdx + 1; j++) {
//       if (j < 0 || j > gBoard.length - 1) continue;
//       if (j === colIdx && i === rowIdx) continue;
//       if (gBoard[i][j].isMine) negsMinesCounter++;
//     }
//   }
//   if (!negsMinesCounter) negsMinesCounter = "";
//   return negsMinesCounter;
//   gBoard[rowIdx][colIdx].minesAroundCount = negsMinesCounter;

//   //   console.log(gBoard[rowIdx][colIdx]);
// }
// function renderCell(i, j) {
//   // Select the elCell and set the value
//   var value;
//   const elCell = document.querySelector(`.cell-${i}-${j}`);
//   if (elCell.isMine) {
//     value = MINE_IMG;
//   }
//   if (elCell.minesAroundCount) {
//     value = elCell.minesAroundCount;
//   }
//   elCell.innerHTML = value;
// }

// function onCellClick(elCell) {
//   if (gCellClickCounter === 1) {
//     getRandomMines();
//   }
//   gCellClickCounter++;

//   var ClassStr = elCell.className.slice(10);
//   var idx = ClassStr.split("-");
//   var i = +idx[0];
//   var j = +idx[1];
//   //   setMinesNegsCount(i, j);
//   if (isHint) {
//     renderCell(i, j);
//   }
//   if (!gBoard[i][j].isMine) {
//     renderCell(i, j);
//   }
//   if (gBoard[i][j].isMine) {
//     // console.log("sa");
//     var elLivesSpan = document.querySelector(".num-lives");
//     gLives--;
//     elLivesSpan.innerText = gLives;
//   }
//   if (!gLives) {
//     makeSmileySad();
//   }

//   //   renderBoard();
// }

// // getRandomMines();

// function getRandomMines() {
//   //   console.log("sfa");
//   for (var x = 0; x < gLevel.MINES; x++) {
//     var i = getRandomInt(0, gLevel.SIZE);
//     var j = getRandomInt(0, gLevel.SIZE);
//     // console.log(i, j);
//     // console.log(gBoard[i]s[j]);
//     gBoard[i][j].isMine = true;
//     renderCell(i, j);
//   }
// }
// function makeSmileySad() {
//   var elSmiley = document.querySelector(".smiley");
//   elSmiley.innerText = "😖";
// }

// function onSmileyClick() {
//   init();
// }
// function returnToStart() {
//   for (var i = 0; i < gBoard.length; i++) {
//     for (var j = 0; j < gBoard[0].length; j++) {
//       if (gBoard[i][j].isMine) {
//         gBoard[i][j].isMine = false;
//       }
//     }
//   }
//   var elLivesSpan = document.querySelector(".num-lives");
//   elLivesSpan.innerText = gLives;
// }
// function onHintClick(elBtn) {
//   elBtn.style.backgroundColor = "yellow";
//   isHint = true;
// }
