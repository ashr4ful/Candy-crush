const $ = s => document.querySelector(s)
const $all = s => document.querySelectorAll(s)

const game = $(".game")
const scoreDisplay = $("#score")
const moveDisplay = $("#move")

const ROW = 9
const COL = 9

let squares = []
const candyColors = ['Red', 'Yellow', 'Orange', 'Purple', 'Green', 'Blue']

let score = 0
let movesLeft = 20
let didFirstMove = false
let isProcessing = false
let gameOver = false

function randomCandy() {
  let randomIdx = Math.floor(Math.random() * candyColors.length)
  return candyColors[randomIdx]
}

function updateDisplay() {
  scoreDisplay.textContent = score
  moveDisplay.textContent = movesLeft
}

function showGameOver() {
  gameOver = true
  alert(`Game Over! Final Score: ${score}`)
  let playAgain = confirm("Play again?")
  if (playAgain) {
    restartGame()
  }
}

function restartGame() {
  score = 0
  movesLeft = 20
  gameOver = false
  game.innerHTML = ''
  squares = []
  createBoard()
  updateDisplay()
}

// create board
function createBoard() {
  for (let r = 0; r < ROW; r++) {
    let row = []
    for (let c = 0; c < COL; c++) {
      let square = document.createElement("div")
      square.setAttribute("id", `${r}-${c}`)
      let candy = randomCandy()
      square.style.backgroundImage = `url('${candy}.png')`
      square.style.backgroundSize = 'cover'
      square.style.backgroundPosition = 'center'
      square.setAttribute("data-candy", candy)
      square.draggable = true
      game.appendChild(square)
      row.push(square)
    }
    squares.push(row)
  }
  addEventListeners()
}

createBoard()

function getRowColumn(id) {
  let [r, c] = id.split("-").map(Number)
  return [r, c]
}

// Dragging attributes
let candyBeingDragged
let squareBeingDragged
let squareBeingReplaced

function addEventListeners() {
  for (let i = 0; i < ROW; i++) {
    squares[i].forEach(square => {
      square.addEventListener('dragstart', dragStart)
      square.addEventListener('dragend', dragEnd)
      square.addEventListener('dragover', dragOver)
      square.addEventListener('dragenter', dragEnter)
      square.addEventListener('dragleave', dragLeave)
      square.addEventListener('drop', dragDrop)
    })
  }
}

function dragStart() {
  if (gameOver || isProcessing) return
  squareBeingDragged = getRowColumn(this.id)
  candyBeingDragged = this.getAttribute("data-candy")
}

function dragOver(e) { e.preventDefault() }
function dragEnter(e) { e.preventDefault() }
function dragLeave(e) { e.preventDefault() }

function dragDrop() {
  if (gameOver || isProcessing) return
  squareBeingReplaced = getRowColumn(this.id)
  let candyBeingReplaced = this.getAttribute("data-candy")

  let [r, c] = squareBeingDragged
  
  // Swap the candies
  this.style.backgroundImage = `url('${candyBeingDragged}.png')`
  this.setAttribute("data-candy", candyBeingDragged)
  
  squares[r][c].style.backgroundImage = `url('${candyBeingReplaced}.png')`
  squares[r][c].setAttribute("data-candy", candyBeingReplaced)
}

function dragEnd() {
  if (gameOver || isProcessing) return
  
  let [row, col] = squareBeingDragged
  let [replacedRow, replacedCol] = squareBeingReplaced || []

  const validMoves = [
    [row, col + 1],
    [row, col - 1],
    [row + 1, col],
    [row - 1, col],
  ]

  let isValidMove = validMoves.some(
    v => v[0] === replacedRow && v[1] === replacedCol
  )

  if (isValidMove && squareBeingReplaced) {
    didFirstMove = true
    movesLeft--
    updateDisplay()
    
    setTimeout(() => {
      let hadMatch = checkAndRemoveMatches()
      
      if (!hadMatch) {
        // Swap back
        let candy1 = squares[row][col].getAttribute("data-candy")
        let candy2 = squares[replacedRow][replacedCol].getAttribute("data-candy")
        
        squares[row][col].style.backgroundImage = `url('${candy2}.png')`
        squares[row][col].setAttribute("data-candy", candy2)
        
        squares[replacedRow][replacedCol].style.backgroundImage = `url('${candy1}.png')`
        squares[replacedRow][replacedCol].setAttribute("data-candy", candy1)
        
        movesLeft++
        updateDisplay()
      }
      
      if (movesLeft <= 0) {
        showGameOver()
      }
    }, 100)
    
    squareBeingReplaced = null
  } else if (!isValidMove && squareBeingReplaced) {
    // Swap back immediately
    let candy1 = squares[row][col].getAttribute("data-candy")
    let candy2 = squares[replacedRow][replacedCol].getAttribute("data-candy")
    
    squares[row][col].style.backgroundImage = `url('${candy2}.png')`
    squares[row][col].setAttribute("data-candy", candy2)
    
    squares[replacedRow][replacedCol].style.backgroundImage = `url('${candy1}.png')`
    squares[replacedRow][replacedCol].setAttribute("data-candy", candy1)
  }

  candyBeingDragged = null
}


function removeCandysFromRow(r, columns) {
  if (columns.length < 3) return false
  
  columns.forEach((col) => {
    let candy = squares[r][col].getAttribute("data-candy")
    if (candy !== "blank") {
      // Add removing animation
      squares[r][col].classList.add('candy-removing')
      
      // Remove after animation
      setTimeout(() => {
        squares[r][col].style.backgroundImage = `url('blank.png')`
        squares[r][col].setAttribute("data-candy", "blank")
        squares[r][col].classList.remove('candy-removing')
      }, 500)
    }
  })
  
  // Combo effect for matches of 4 or more
  if (columns.length >= 4) {
    columns.forEach(col => {
      squares[r][col].classList.add('combo-effect')
      setTimeout(() => {
        squares[r][col].classList.remove('combo-effect')
      }, 300)
    })
  }
  score += columns.length * 5
  return true
}

function removeCandysFromColumn(rows, c) {
  if (rows.length < 3) return false
  
  rows.forEach((row) => {
    let candy = squares[row][c].getAttribute("data-candy")
    if (candy !== "blank") {
      // Add removing animation
      squares[row][c].classList.add('candy-removing')
      
      // Remove after animation
      setTimeout(() => {
        squares[row][c].style.backgroundImage = `url('blank.png')`
        squares[row][c].setAttribute("data-candy", "blank")
        squares[row][c].classList.remove('candy-removing')
      }, 500)
    }
  })
  
  // Combo effect for matches of 4 or more
  if (rows.length >= 4) {
    rows.forEach(row => {
      squares[row][c].classList.add('combo-effect')
      setTimeout(() => {
        squares[row][c].classList.remove('combo-effect')
      }, 300)
    })
  }
  score += rows.length * 5
  return true
}

function moveCandyDown() {
  for (let c = 0; c < COL; c++) {
    let writePos = ROW - 1
    
    for (let r = ROW - 1; r >= 0; r--) {
      let candy = squares[r][c].getAttribute("data-candy")
      if (candy !== "blank") {
        if (r !== writePos) {
          let movingCandy = squares[r][c].getAttribute("data-candy")
          
          // Add falling animation
          squares[writePos][c].classList.add('candy-falling')
          setTimeout(() => {
            squares[writePos][c].classList.remove('candy-falling')
          }, 400)
          
          squares[writePos][c].style.backgroundImage = `url('${movingCandy}.png')`
          squares[writePos][c].setAttribute("data-candy", movingCandy)
          
          squares[r][c].style.backgroundImage = `url('blank.png')`
          squares[r][c].setAttribute("data-candy", "blank")
        }
        writePos--
      }
    }
    
    for (let r = writePos; r >= 0; r--) {
      let newCandy = randomCandy()
      
      // Add falling animation for new candies
      squares[r][c].classList.add('candy-falling')
      setTimeout(() => {
        squares[r][c].classList.remove('candy-falling')
      }, 400)
      
      squares[r][c].style.backgroundImage = `url('${newCandy}.png')`
      squares[r][c].setAttribute("data-candy", newCandy)
    }
  }
}

function checkForRow() {
  let foundMatch = false
  for (let r = 0; r < ROW; r++) {
    for (let c = 0; c < COL - 2; c++) {
      let c1 = squares[r][c].getAttribute("data-candy")
      let c2 = squares[r][c + 1].getAttribute("data-candy")
      let c3 = squares[r][c + 2].getAttribute("data-candy")
      let matchedCols = []
      
      if (
        c1 === c2 &&
        c1 === c3 &&
        c1 !== "blank"
      ) {
        matchedCols = [c, c + 1, c + 2]
        
        for (let i = c + 3; i < COL; i++) {
          let nextCandy = squares[r][i].getAttribute("data-candy")
          if (nextCandy === c1) {
            matchedCols.push(i)
          } else break
        }
        
        // Add shake animation before removal
        matchedCols.forEach(col => {
          squares[r][col].classList.add('candy-match')
          setTimeout(() => {
            squares[r][col].classList.remove('candy-match')
          }, 300)
        })
        
        if (removeCandysFromRow(r, matchedCols)) {
          foundMatch = true
        }
      }
    }
  }
  return foundMatch
}

function checkForColumn() {
  let foundMatch = false
  for (let r = 0; r < ROW - 2; r++) {
    for (let c = 0; c < COL; c++) {
      let r1 = squares[r][c].getAttribute("data-candy")
      let r2 = squares[r + 1][c].getAttribute("data-candy")
      let r3 = squares[r + 2][c].getAttribute("data-candy")
      let matchedRows = []
      
      if (
        r1 === r2 &&
        r1 === r3 &&
        r1 !== "blank"
      ) {
        matchedRows = [r, r + 1, r + 2]
        
        for (let i = r + 3; i < ROW; i++) {
          let nextCandy = squares[i][c].getAttribute("data-candy")
          if (nextCandy === r1) {
            matchedRows.push(i)
          } else break
        }
        
        // Add shake animation before removal
        matchedRows.forEach(row => {
          squares[row][c].classList.add('candy-match')
          setTimeout(() => {
            squares[row][c].classList.remove('candy-match')
          }, 300)
        })
        
        if (removeCandysFromColumn(matchedRows, c)) {
          foundMatch = true
        }
      }
    }
  }
  return foundMatch
}

function checkAndRemoveMatches() {
  let rowMatch = checkForRow()
  let colMatch = checkForColumn()
  updateDisplay()
  return rowMatch || colMatch
}

setInterval(() => {
  if(!didFirstMove) return
  if (!gameOver && !isProcessing) {
    checkAndRemoveMatches()
    moveCandyDown()
  }
}, 100)
