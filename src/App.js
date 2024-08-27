import React, { useState } from 'react';
import './App.css';

function Square({ value, onClick }) {
  return (
    <button className="square" onClick={onClick}>
      {value}
    </button>
  );
}

function Board({ squares, onClick }) {
  return (
    <div>
      {[0, 3, 6].map((startIndex) => (
        <div className="board-row" key={startIndex}>
          {squares.slice(startIndex, startIndex + 3).map((square, index) => (
            <Square key={index + startIndex} value={square} onClick={() => onClick(index + startIndex)} />
          ))}
        </div>
      ))}
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function App() {
  const [history, setHistory] = useState([{ squares: Array(9).fill(null) }]);
  const [stepNumber, setStepNumber] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);
  const [score, setScore] = useState({ X: 0, O: 0 });

  const current = history[stepNumber];
  const winner = calculateWinner(current.squares);

  const handleClick = (index) => {
    const newHistory = history.slice(0, stepNumber + 1);
    const current = newHistory[newHistory.length - 1];
    const squares = current.squares.slice();

    if (squares[index] || winner) return;

    squares[index] = xIsNext ? 'X' : 'O';
    setHistory([...newHistory, { squares }]);
    setStepNumber(newHistory.length);
    setXIsNext(!xIsNext);

    const winnerAfterMove = calculateWinner(squares);
    if (winnerAfterMove) {
      setScore((prevScore) => ({
        ...prevScore,
        [winnerAfterMove]: prevScore[winnerAfterMove] + 1,
      }));
    }
  };

  const undoLastMove = () => {
    if (stepNumber > 0) {
      setStepNumber(stepNumber - 1);
      setXIsNext(stepNumber % 2 === 0);
    }
  };

  const resetGame = () => {
    setHistory([{ squares: Array(9).fill(null) }]);
    setStepNumber(0);
    setXIsNext(true);
  };

  return (
    <div className="game">
      <div className="game-board">
        <Board squares={current.squares} onClick={handleClick} />
      </div>
      <div className="game-info">
        <div>{winner ? `Gagnant : ${winner}` : `Prochain joueur : ${xIsNext ? 'X' : 'O'}`}</div>
        <button onClick={undoLastMove}>Annuler le dernier coup</button>
        <button onClick={resetGame}>Réinitialiser la partie</button>
      </div>
      <div className="scoreboard">
        <h3>Score</h3>
        <p>Joueur X: {score.X}</p>
        <p>Joueur O: {score.O}</p>
      </div>
    </div>
  );
}

export default App;
