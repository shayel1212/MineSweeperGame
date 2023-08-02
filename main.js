"use strict";
const MINE_IMG = "💣";

var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
};

var gLevel = {
  SIZE: 4,
  MINES: 2,
};
var gBoard = buildBoard(gLevel.SIZE);
// getIdxesForNegsCount();

console.table(gBoard);
renderBoard();
// setMinesNegsCount();

function buildBoard(level) {
  var board = [];
  for (var i = 0; i < level; i++) {
    board[i] = [];
    for (var j = 0; j < level; j++) {
      board[i][j] = {
        minesAroundCount: "",
        isShown: false,
        isMine: false,
        isMarked: true,
      };
    }
  }
  board[0][1].isMine = true;
  board[3][1].isMine = true;

  return board;
}

function renderBoard() {
  //   getRandomMines();
  //   getRandomMines();
  var strHTML = "";
  for (var i = 0; i < gBoard.length; i++) {
    strHTML += `<tr class="board-row">\n`;

    for (var j = 0; j < gBoard[i].length; j++) {
      var currCell = gBoard[i][j];
      var className = `cell cell-${i}-${j}`;
      className += currCell.isMine ? " mine" : "";
      strHTML += `\t <td onclick="onCellClick(this)" class="${className}" >`;
      if (currCell.isMine) {
        strHTML += MINE_IMG;
      } else if (currCell.minesAroundCount) {
        strHTML += currCell.minesAroundCount;
      }
      strHTML += `</td>\n`;
    }
    strHTML += `</tr>\n`;
  }
  const elTable = document.querySelector(".board");
  elTable.innerHTML = strHTML;

  //   console.log(elTable);
}

function getIdxesForNegsCount() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[i].length; j++) {
      setMinesNegsCount(i, j);
    }
  }
}

function setMinesNegsCount(rowIdx, colIdx) {
  var negsMinesCounter = 0;
  for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
    if (i < 0 || i > gBoard.length - 1) continue;
    for (var j = colIdx - 1; j <= colIdx + 1; j++) {
      if (j < 0 || j > gBoard.length - 1) continue;
      if (j === colIdx && i === rowIdx) continue;
      if (gBoard[i][j].isMine) negsMinesCounter++;
    }
  }
  if (!negsMinesCounter) negsMinesCounter = "";
  return negsMinesCounter;
  gBoard[rowIdx][colIdx].minesAroundCount = negsMinesCounter;

  //   console.log(gBoard[rowIdx][colIdx]);
}
function renderCell(i, j, value) {
  // Select the elCell and set the value
  const elCell = document.querySelector(`.cell-${i}-${j}`);
  elCell.innerHTML = value;
}

function onCellClick(elCell) {
  var ClassStr = elCell.className.slice(10);
  var idx = ClassStr.split("-");
  var i = +idx[0];
  var j = +idx[1];
  //   setMinesNegsCount(i, j);
  renderCell(i, j, setMinesNegsCount(i, j));

  //   renderBoard();
}

// getRandomMines();

function getRandomMines() {
  //   console.log("sfa");
  for (var x = 0; x < gLevel.MINES; x++) {
    var i = getRandomInt(0, gLevel.SIZE);
    var j = getRandomInt(0, gLevel.SIZE);
    // console.log(i, j);
    // console.log(gBoard[i]s[j]);
    gBoard[i][j].isMine = true;
  }
}
