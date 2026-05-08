const cells = document.querySelectorAll('.cell');
const statusDisplay = document.getElementById('status');
const resetBtn = document.getElementById('reset-btn');
const pvpBtn = document.getElementById('pvp-btn');
const pvaBtn = document.getElementById('pva-btn');
const modal = document.getElementById('modal');
const modalText = document.getElementById('modal-text');
const modalResetBtn = document.getElementById('modal-reset-btn');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let isAI = false; // False = PvP, True = PvAI

const humanPlayer = 'X';
const aiPlayer = 'O';

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// Event Listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', resetGame);
modalResetBtn.addEventListener('click', resetGame);

pvpBtn.addEventListener('click', () => {
    isAI = false;
    pvpBtn.classList.add('active');
    pvaBtn.classList.remove('active');
    resetGame();
});

pvaBtn.addEventListener('click', () => {
    isAI = true;
    pvaBtn.classList.add('active');
    pvpBtn.classList.remove('active');
    resetGame();
});

function handleCellClick(e) {
    const clickedCell = e.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (board[clickedCellIndex] !== '' || !gameActive) return;

    // Trong chế độ AI, nếu chưa đến lượt của người (mặc dù người luôn là X ở lượt đầu)
    if (isAI && currentPlayer !== humanPlayer) return;

    handleMove(clickedCell, clickedCellIndex);

    if (isAI && gameActive && currentPlayer === aiPlayer) {
        // AI suy nghĩ một chút (delay) để tạo cảm giác tự nhiên
        statusDisplay.textContent = 'AI đang tính toán...';
        statusDisplay.style.color = 'var(--text-color)';
        setTimeout(makeAIMove, 400);
    }
}

function handleMove(cell, index) {
    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());
    
    checkResult();
}

function checkResult() {
    let roundWon = false;

    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        statusDisplay.textContent = `Chiến thắng cho ${currentPlayer}!`;
        statusDisplay.style.color = currentPlayer === 'X' ? 'var(--accent-color)' : 'var(--accent-color-o)';
        gameActive = false;
        showModal(`${currentPlayer} Chiến Thắng!`, currentPlayer);
        return;
    }

    let roundDraw = !board.includes('');
    if (roundDraw) {
        statusDisplay.textContent = 'Hòa!';
        statusDisplay.style.color = 'var(--text-color)';
        gameActive = false;
        showModal('Hòa!', null);
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    if (!(!gameActive && isAI)) {
        statusDisplay.textContent = `Lượt của ${currentPlayer}`;
        statusDisplay.style.color = currentPlayer === 'X' ? 'var(--accent-color)' : 'var(--accent-color-o)';
    }
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    statusDisplay.textContent = `Lượt của ${currentPlayer}`;
    statusDisplay.style.color = 'var(--accent-color)';
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o');
    });
    
    modal.classList.add('hidden');
}

function showModal(text, winner) {
    modalText.textContent = text;
    if (winner === 'X') {
        modalText.style.color = 'var(--accent-color)';
    } else if (winner === 'O') {
        modalText.style.color = 'var(--accent-color-o)';
    } else {
        modalText.style.color = 'var(--text-color)';
    }
    setTimeout(() => {
        modal.classList.remove('hidden');
    }, 400); // Wait for the popIn animation
}

// --- AI MINIMAX ALGORITHM ---

function makeAIMove() {
    let bestScore = -Infinity;
    let move;
    
    // Thuật toán duyệt qua tất cả các ô trống để tính toán nước đi tốt nhất
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = aiPlayer;
            let score = minimax(board, 0, false);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    
    const cell = document.querySelector(`[data-index='${move}']`);
    handleMove(cell, move);
}

const scores = {
    'O': 10,  // AI win
    'X': -10, // Human win
    'tie': 0  // Draw
};

function checkWinnerForMinimax() {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    
    let openSpots = 0;
    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            openSpots++;
        }
    }
    
    if (openSpots === 0) {
        return 'tie';
    }
    return null;
}

function minimax(boardState, depth, isMaximizing) {
    let result = checkWinnerForMinimax();
    if (result !== null) {
        // Phạt dựa trên số bước (depth) để AI thích chiến thắng nhanh và kéo dài thất bại lâu nhất có thể
        if(result === aiPlayer) return scores[result] - depth;
        if(result === humanPlayer) return scores[result] + depth;
        return scores[result];
    }
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < boardState.length; i++) {
            if (boardState[i] === '') {
                boardState[i] = aiPlayer;
                let score = minimax(boardState, depth + 1, false);
                boardState[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < boardState.length; i++) {
            if (boardState[i] === '') {
                boardState[i] = humanPlayer;
                let score = minimax(boardState, depth + 1, true);
                boardState[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}
