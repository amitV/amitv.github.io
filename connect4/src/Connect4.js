import React, { useState } from 'react';

const Connect4 = () => {
  // Game constants
  const ROWS = 6;
  const COLS = 7;
  const EMPTY = null;
  const PLAYER_1 = 'red';
  const PLAYER_2 = 'yellow';

  // Game state
  const [board, setBoard] = useState(Array(ROWS).fill().map(() => Array(COLS).fill(EMPTY)));
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER_1);
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [winningCells, setWinningCells] = useState([]);
  const [gameHistory, setGameHistory] = useState({ [PLAYER_1]: 0, [PLAYER_2]: 0 });
  const [isDropping, setIsDropping] = useState({ col: null, row: null });

  // Get the next available row in a column
  const getAvailableRow = (col) => {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (board[row][col] === EMPTY) {
        return row;
      }
    }
    return -1; // Column is full
  };

  // Check if the board is full
  const isBoardFull = () => {
    return board[0].every(cell => cell !== EMPTY);
  };

  // Check for a winner
  const checkForWinner = (row, col, player) => {
    // Check directions: horizontal, vertical, diagonal up, diagonal down
    const directions = [
      [[0, 1], [0, -1]], // horizontal
      [[1, 0], [-1, 0]], // vertical
      [[1, 1], [-1, -1]], // diagonal /
      [[1, -1], [-1, 1]], // diagonal \
    ];

    for (const [dir1, dir2] of directions) {
      let count = 1; // Start with 1 for the current piece
      let winningPositions = [[row, col]];

      // Check in first direction
      for (let i = 1; i < 4; i++) {
        const newRow = row + i * dir1[0];
        const newCol = col + i * dir1[1];
        if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS && board[newRow][newCol] === player) {
          count++;
          winningPositions.push([newRow, newCol]);
        } else {
          break;
        }
      }

      // Check in second direction
      for (let i = 1; i < 4; i++) {
        const newRow = row + i * dir2[0];
        const newCol = col + i * dir2[1];
        if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS && board[newRow][newCol] === player) {
          count++;
          winningPositions.push([newRow, newCol]);
        } else {
          break;
        }
      }

      if (count >= 4) {
        return winningPositions;
      }
    }
    return null;
  };

  // Handle column click for dropping a piece
  const handleColumnClick = (col) => {
    if (winner || isDraw) return; // Game is over

    const row = getAvailableRow(col);
    if (row === -1) return; // Column is full

    // Animate the piece dropping
    const newBoard = [...board];
    setIsDropping({ col, row });

    // After a brief delay, place the piece and check for game end conditions
    setTimeout(() => {
      newBoard[row][col] = currentPlayer;
      setBoard(newBoard);
      setIsDropping({ col: null, row: null });

      // Check for a winner
      const winPositions = checkForWinner(row, col, currentPlayer);
      if (winPositions) {
        setWinner(currentPlayer);
        setWinningCells(winPositions);
        setGameHistory(prev => ({ ...prev, [currentPlayer]: prev[currentPlayer] + 1 }));
        return;
      }

      // Check for a draw
      if (isBoardFull()) {
        setIsDraw(true);
        return;
      }

      // Switch players
      setCurrentPlayer(currentPlayer === PLAYER_1 ? PLAYER_2 : PLAYER_1);
    }, 300); // 300ms for animation
  };

  // Reset the game
  const resetGame = () => {
    setBoard(Array(ROWS).fill().map(() => Array(COLS).fill(EMPTY)));
    setCurrentPlayer(winner || PLAYER_1); // Winner goes first in next game, or PLAYER_1 if draw
    setWinner(null);
    setIsDraw(false);
    setWinningCells([]);
    setIsDropping({ col: null, row: null });
  };

  // Determine if a cell is part of the winning combination
  const isWinningCell = (row, col) => {
    return winningCells.some(pos => pos[0] === row && pos[1] === col);
  };

  // Render a single cell
  const renderCell = (row, col) => {
    const cellContent = board[row][col];
    const isWinning = winner && isWinningCell(row, col);
    const isCurrentlyDropping = isDropping.col === col && isDropping.row === row;

    return (
      <div 
        key={`${row}-${col}`} 
        className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full m-1 relative ${
          isWinning ? 'animate-pulse' : ''
        }`}
      >
        <div className="absolute inset-0 rounded-full bg-blue-700 border-2 border-blue-900"></div>
        <div 
          className={`absolute inset-1 rounded-full ${
            cellContent === PLAYER_1 ? 'bg-red-500 border-2 border-red-700' : 
            cellContent === PLAYER_2 ? 'bg-yellow-400 border-2 border-yellow-600' : 
            isCurrentlyDropping ? (currentPlayer === PLAYER_1 ? 'bg-red-500 border-2 border-red-700' : 'bg-yellow-400 border-2 border-yellow-600') : 
            'bg-white border-2 border-gray-300'
          } ${isCurrentlyDropping ? 'animate-bounce' : ''}`}
        ></div>
      </div>
    );
  };

  // Render column hover indicators
  const renderColumnIndicator = (col) => {
    if (winner || isDraw || isDropping.col !== null) return null;
    const isColumnFull = getAvailableRow(col) === -1;
    
    return (
      <div 
        className={`w-14 h-8 flex justify-center items-center ${isColumnFull ? 'opacity-0' : 'opacity-100'}`}
      >
        <div 
          className={`w-8 h-8 rounded-full ${
            currentPlayer === PLAYER_1 ? 'bg-red-500' : 'bg-yellow-400'
          }`}
        ></div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-100 p-4">
      <h1 className="text-3xl font-bold mb-6 text-blue-800">Connect 4</h1>
      
      {/* Game status */}
      <div className="mb-4 text-center">
        {winner ? (
          <div className="text-xl font-bold">
            <span 
              className={`px-3 py-1 rounded ${winner === PLAYER_1 ? 'bg-red-500 text-white' : 'bg-yellow-400 text-black'}`}
            >
              {winner === PLAYER_1 ? 'Red' : 'Yellow'} Wins!
            </span>
          </div>
        ) : isDraw ? (
          <div className="text-xl font-bold px-3 py-1 rounded bg-gray-500 text-white">Draw Game!</div>
        ) : (
          <div className="text-xl">
            <span className="font-bold">Current Player: </span>
            <span 
              className={`px-3 py-1 rounded ${currentPlayer === PLAYER_1 ? 'bg-red-500 text-white' : 'bg-yellow-400 text-black'}`}
            >
              {currentPlayer === PLAYER_1 ? 'Red' : 'Yellow'}
            </span>
          </div>
        )}
      </div>
      
      {/* Score display */}
      <div className="flex justify-center gap-6 mb-4">
        <div className="px-3 py-1 rounded bg-red-500 text-white">
          Red: {gameHistory[PLAYER_1]}
        </div>
        <div className="px-3 py-1 rounded bg-yellow-400 text-black">
          Yellow: {gameHistory[PLAYER_2]}
        </div>
      </div>

      {/* Column indicators */}
      <div className="flex justify-center mb-2">
        {Array(COLS).fill().map((_, col) => (
          <div key={`indicator-${col}`} className="flex justify-center">
            {renderColumnIndicator(col)}
          </div>
        ))}
      </div>
      
      {/* Game board */}
      <div className="bg-blue-600 p-2 rounded-lg shadow-lg">
        {Array(ROWS).fill().map((_, row) => (
          <div key={`row-${row}`} className="flex">
            {Array(COLS).fill().map((_, col) => (
              <div 
                key={`col-${col}`} 
                className="cursor-pointer" 
                onClick={() => handleColumnClick(col)}
              >
                {renderCell(row, col)}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Reset button */}
      <button
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        onClick={resetGame}
      >
        {winner || isDraw ? 'New Game' : 'Reset Game'}
      </button>
      
      {/* Game instructions */}
      <div className="mt-6 text-center text-gray-700 max-w-md">
        <p className="mb-2">Click on any column to drop your piece.</p>
        <p>Connect 4 pieces of your color horizontally, vertically, or diagonally to win!</p>
      </div>
    </div>
  );
};

export default Connect4;
