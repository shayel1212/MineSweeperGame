"use strict";
var gLevel = {
  SIZE: 4,
  MINES: 2,
};

var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
};
const MINE_IMG = "💣";
var gBoard;
var gClickCount = 0;
var gLives = 3;
var gShowenCells = 0;
var gShowenForWin = gLevel.SIZE * gLevel.SIZE - gLevel.MINES;
var gIsHint = false;
var gHints = 0;
onInit();

function onInit() {
  gHints = 0;
  gClickCount = 0;
  gLives = 3;
  gShowenCells = 0;
  var elLivesSpan = document.querySelector(".num-lives");
  elLivesSpan.innerText = gLives;
  makeSmileyHappy();
  gBoard = createBoard();
  // addRandomMines();
  renderBoard();
}

function createBoard() {
  var board = [];
  for (var i = 0; i < gLevel.SIZE; i++) {
    board[i] = [];
    for (var j = 0; j < gLevel.SIZE; j++) {
      board[i][j] = {
        minesAroundCount: "",
        isShown: false,
        isMine: false,
        isMarked: false,
      };
    }
  }

  // board[1][1].isMine = true;
  // board[2][3].isMine = true;

  // console.log(board);
  return board;
}

function renderBoard() {
  var strHTML = "";
  for (var i = 0; i < gBoard.length; i++) {
    strHTML += `<tr>\n`;
    for (var j = 0; j < gBoard.length; j++) {
      var className = `cell cell-${i}-${j}`;
      strHTML += `\t<td oncontextmenu="onRightClick(this,event)" onclick="onCellClicked(this)" class="${className}"></td>\n`;
      // if (gBoard[i][j].isMine) {
      //   strHTML += `${MINE_IMG}`;
      // } else {
      //   setMinesNegsCount(i, j);
      //   strHTML += `${gBoard[i][j].minesAroundCount}`;
      // }
    }
    strHTML += `</tr>\n`;
  }
  const elTable = document.querySelector(".board");
  elTable.innerHTML = strHTML;
}

function setMinesNegsCount(rowIdx, colIdx) {
  var counter = 0;
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i > gBoard.length - 1) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j > gBoard.length - 1) continue;
      if (j === colIdx && i === rowIdx) continue;
      if (gBoard[i][j].isMine) counter++;
    }
  }
  if (!counter) return;
  gBoard[rowIdx][colIdx].minesAroundCount = counter;
}
function onRightClick(elCell, ev) {
  ev.preventDefault();
  var location = getLocationFromClass(elCell.className);
  if (gBoard[location.i][location.j].isShown) return;
  if (gBoard[location.i][location.j].isMarked) {
    gBoard[location.i][location.j].isMarked = false;
    elCell.innerText = "";
    gGame.markedCount--;

    return;
  }
  gBoard[location.i][location.j].isMarked = true;
  renderCell(location.i, location.j);
  gGame.markedCount++;
}

function onCellClicked(elCell) {
  var location = getLocationFromClass(elCell.className);
  if (gBoard[location.i][location.j].isShown) return;
  if (gIsHint && gHints < 3) {
    revealedCellsWhenHint(location.i, location.j);
    gHints++;
    return;
  }

  gBoard[location.i][location.j].isShown = true;
  gClickCount++;
  if (gClickCount === 1) {
    addRandomMines();
    setMinesNegsCount(location.i, location.j);
    gShowenCells++;
    elCell.innerText = gBoard[location.i][location.j].minesAroundCount;
    elCell.style.backgroundColor = "rgb(196,193,193)";
    return;
  }

  if (gBoard[location.i][location.j].isMine) {
    gLives--;
    var elLivesSpan = document.querySelector(".num-lives");
    elLivesSpan.innerText = gLives;
    renderCell(location.i, location.j);
    if (gLives === 0) {
      makeSmileySad();
    }
    return;
  }
  gShowenCells++;
  if (gShowenCells === gShowenForWin) {
    addSmileyGlasses();
  }
  renderCell(location.i, location.j);
}

function renderCell(i, j) {
  const elCell = document.querySelector(`.cell-${i}-${j}`);
  if (gBoard[i][j].isMarked) {
    elCell.innerText = "🚩";
    return;
  }
  if (gBoard[i][j].isMine) {
    elCell.innerText = MINE_IMG;
    elCell.style.backgroundColor = "rgb(196, 193, 193)";
    return;
  } else if (!gBoard[i][j].isMine) {
    setMinesNegsCount(i, j);
    elCell.innerText = gBoard[i][j].minesAroundCount;
    elCell.style.backgroundColor = "rgb(196, 193, 193)";
    return;
  }
}

function addRandomMines() {
  var randomMinesIdx = [];
  for (var x = 0; x < gLevel.MINES; x++) {
    var idx = {};
    idx.i = getRandomInt(0, gLevel.SIZE);
    idx.j = getRandomInt(0, gLevel.SIZE);
    for (var a = 0; a < randomMinesIdx.length; a++) {
      if (randomMinesIdx[a].i === idx.i && randomMinesIdx[a].j === idx.j) break;
    }
    randomMinesIdx.push(idx);
  }
  console.log(randomMinesIdx);
  for (var z = 0; z < randomMinesIdx.length; z++) {
    var idxI = randomMinesIdx[z].i;
    var idxJ = randomMinesIdx[z].j;
    gBoard[idxI][idxJ].isMine = true;
  }
}

function getLocationFromClass(ClassStr) {
  var str = ClassStr.slice(10);
  var idx = str.split("-");
  var i = +idx[0];
  var j = +idx[1];
  var location = {
    i: i,
    j: j,
  };
  return location;
}
function onSmileyClick() {
  onInit();
}
function makeSmileySad() {
  var elSmiley = document.querySelector(".smiley");
  elSmiley.innerText = "😖";
}
function makeSmileyHappy() {
  var elSmiley = document.querySelector(".smiley");
  elSmiley.innerText = "😃";
}
function addSmileyGlasses() {
  var elSmiley = document.querySelector(".smiley");
  elSmiley.innerText = "😎";
}
function onHintClick(elBtn) {
  elBtn.style.backgroundColor = "yellow";
  gIsHint = true;
  if (gHints > 2) {
    elBtn.style.backgroundColor = "aliceblue";
  }
}

// revealedCellsWhenHint(1, 3);
function revealedCellsWhenHint(i, j) {
  for (var a = i - 1; a <= i + 1; a++) {
    if (a < 0 || a > gBoard.length - 1) continue;
    for (var x = j - 1; x <= j + 1; x++) {
      if (x < 0 || x > gBoard.length - 1) continue;
      if (gBoard[a][x].isShown) continue;
      if (gBoard[a][x].isMarked) continue;

      renderCell(a, x);
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

////////////////////////////////////////////////////////

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
