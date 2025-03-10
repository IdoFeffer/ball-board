"use strict"

const WALL = "WALL"
const FLOOR = "FLOOR"
const BALL = "BALL"
const GAMER = "GAMER"
const GLUE = "GLUE"
var timer = 60
var gInterval
//////////////////////////////////////////////
const GAMER2_IMG = '<img src="img/gamer-purple.png">'
const GAMER_IMG = '<img src="img/gamer.png">'
const BALL_IMG = '<img src="img/ball.png">'
const GLUE_IMG = '<img src="img/candy.png">'
////////////////////////////////////////////////
// Model:
var gIsGamerStuck = false
var gBoard
var gGamerPos
var gBallCount = 0
var gBallCollected = 0
//////////////////////////////////////////////////

function onInitGame() {
  gGamerPos = { i: 2, j: 9 }
  gBoard = buildBoard()
  renderBoard(gBoard)
  gBallCount = countTotalBalls()

  setInterval(addBalls, 3000)
  setInterval(addGlue, 5000)
}

function buildBoard() {
  const board = createMat(10, 12)

  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      board[i][j] = { type: FLOOR, gameElement: null }
      if (
        i === 0 ||
        j === 0 ||
        i === board.length - 1 ||
        j === board[i].length - 1
      ) {
        board[i][j].type = WALL
      }
      if (j === 6 || i === 7) {
        board[i][j].type = FLOOR
      }
    }
  }

  board[gGamerPos.i][gGamerPos.j].gameElement = GAMER

  board[2][5].gameElement = BALL
  board[5][2].gameElement = BALL

  // console.log(board)
  return board
}

// Render the board to an HTML table
function renderBoard(board) {
  var strHTML = ""

  for (var i = 0; i < board.length; i++) {
    strHTML += "<tr>\n"
    for (var j = 0; j < board[0].length; j++) {
      const currCell = board[i][j]

      var cellClass = getClassName({ i: i, j: j })

      if (currCell.type === FLOOR) cellClass += " floor"
      else if (currCell.type === WALL) cellClass += " wall"

      strHTML +=
        '\t<td class="cell ' +
        cellClass +
        '"  onclick="moveTo(' +
        i +
        "," +
        j +
        ')" >\n'

      if (currCell.gameElement === GAMER) {
        strHTML += GAMER_IMG
      } else if (currCell.gameElement === BALL) {
        strHTML += BALL_IMG
      } else if (currCell.gameElement === GLUE) {
        strHTML += GLUE_IMG
      }

      strHTML += "\t</td>\n"
    }
    strHTML += "</tr>\n"
  }
  //   console.log("strHTML is:")
  //   console.log(strHTML)

  const elBoard = document.querySelector(".board")
  elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) { 
  if (gIsGamerStuck) return

  if (i < 0) i = gBoard.length - 1
  if (i > gBoard.length - 1) i = 0
  if (j < 0) j = gBoard[0].length - 1
  if (j > gBoard[0].length - 1) j = 0

  const targetCell = gBoard[i][j]
  if (targetCell.type === WALL) return
  // Calculate distance to make sure we are moving to a neighbor cell
  const iAbsDiff = Math.abs(i - gGamerPos.i)
  const jAbsDiff = Math.abs(j - gGamerPos.j)

  if (
    (iAbsDiff === 1 && jAbsDiff === 0) ||
    (jAbsDiff === 1 && iAbsDiff === 0) ||
    iAbsDiff === gBoard.length - 1 ||
    jAbsDiff === gBoard[0].length - 1
  ) {
    if (targetCell.gameElement === BALL) {
      gBallCollected++
      updateCollectedBalls()
      // playSound()
      console.log(`Balls collected: ${gBallCollected}/${gBallCount}`)
      if (gBallCollected === gBallCount) {
        console.log('All balls collected!');
        gameEnded()
      }
    }
    if (gBallCollected !== gGamerPos) {
      startTimer()
    }
    if (targetCell.gameElement === GLUE) {
      console.log("You stuck")
      gIsGamerStuck = true
      setTimeout(() => {
        gIsGamerStuck = false
        console.log("You can move again")
      }, 3000)
    }
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
    renderCell(gGamerPos, "")

    gGamerPos = { i: i, j: j }
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    renderCell(gGamerPos, GAMER_IMG)
  } else console.log("TOO FAR", iAbsDiff, jAbsDiff)
  updateBallsAround()
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
  const cellSelector = "." + getClassName(location)
  const elCell = document.querySelector(cellSelector)
  elCell.innerHTML = value
}

// Move the player by keyboard arrows
function onHandleKey(event) {
  const i = gGamerPos.i
  const j = gGamerPos.j

  switch (event.key) {
    case "ArrowLeft":
      moveTo(i, j - 1)
      break
    case "ArrowRight":
      moveTo(i, j + 1)
      break
    case "ArrowUp":
      moveTo(i - 1, j)
      break
    case "ArrowDown":
      moveTo(i + 1, j)
      break
  }
}

// Returns the class name for a specific cell
function getClassName(location) {
  const cellClass = "cell-" + location.i + "-" + location.j
  return cellClass
}

function addBalls() {
  if (timer <= 0 || gBallCollected === gBallCount) return
    var emptyCell = getEmptyCell()
    gBoard[emptyCell.i][emptyCell.j].gameElement = BALL
    renderCell(emptyCell, BALL_IMG)

    gBallCount++
    updateCollectedBalls()
}

function updateCollectedBalls() {
  var elCount = document.querySelector(".ballsCollected")
  elCount.innerText = gBallCollected
}

function getEmptyCell() {
  var i = Math.floor(Math.random() * (gBoard.length - 2)) + 1
  var j = Math.floor(Math.random() * (gBoard[0].length - 2)) + 1

  while (gBoard[i][j].type !== FLOOR || gBoard[i][j].gameElement !== null) {
    i = Math.floor(Math.random() * (gBoard.length - 2)) + 1
    j = Math.floor(Math.random() * (gBoard[0].length - 2)) + 1
  }
  return { i, j }
}

function startTimer() {
  if (gInterval) return

  gInterval = setInterval(() => {
    timer -= 0.01
    document.querySelector(".timer").innerText = timer.toFixed(2)

    if (timer <= 0.0) {
      clearInterval(gInterval)
      document.querySelector(".timer").innerText = "0.000"
    }
  }, 10)
}

function onRestart() {
  timer = 60
  gBallCollected = 0
  clearInterval(gInterval)
  gInterval = null
  document.querySelector(".timer").innerText = "60.000"
  gGamerPos
}

function countBallsNegs() {
  var count = 0
  var gamerI = gGamerPos.i
  var gamerJ = gGamerPos.j

  for (var i = gamerI - 1; i <= gamerI + 1; i++) {
    if (i < 0 || i >= gBoard.length) continue

    for (var j = gamerJ - 1; j <= gamerJ + 1; j++) {
      if (j < 0 || j >= gBoard[0].length) continue
      if (i === gamerI && j === gamerJ) continue
      if (gBoard[i][j].gameElement === BALL) {
        count++
      }
    }
  }
  return count
}

function updateBallsAround() {
  var elAround = document.querySelector(".ballsAround")
  elAround.innerText = countBallsNegs()
}

function addGlue() {
  if (timer < 60.0) {
    var emptyCell = getEmptyCell()
    gBoard[emptyCell.i][emptyCell.j].gameElement = GLUE
    renderCell(emptyCell, GLUE_IMG)
    setTimeout(() => {
      if (gBoard[emptyCell.i][emptyCell.j].gameElement === GLUE) {
        gBoard[emptyCell.i][emptyCell.j] = null
        renderCell(emptyCell, "")
      }
    }, 3000)
  }
}

function onRestart() {
  var elGameContainer = document.querySelector(".restart")
  elGameContainer.style.display = "none"

  gBallCollected = 0
  onInitGame()
}

function gameEnded() {
  clearInterval(gInterval)
  console.log(`Game ended! You've collected all the balls on board!`)
  document.removeEventListener("keyup", onHandleKey)

  var elGameEnd = document.querySelector(".restart")

  elGameEnd.innerHTML += `
        <h2 class="victory-message" style="color: green">Game Over! You collected all the balls 🎉</h2>
        <button class="victory-button" onclick="restartGame()">Start Over</button>
        `
  elGameEnd.style.display = "block"
}

function countTotalBalls() {
  var count = 0
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard[0].length; j++) {
      if (gBoard[i][j].gameElement === BALL) count++
    }
  }
  return count
}

