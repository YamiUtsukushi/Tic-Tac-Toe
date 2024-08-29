import React, { useState, useEffect } from 'react';
import './App.css';
import Confetti from 'react-confetti'; 

function Square({ value, onClick, isWinningSquare }) {
  return (
    <button
      className={`square ${isWinningSquare ? 'winning-square' : ''}`}
      onClick={onClick}
    >
      {value}
    </button>
  );
}

function Board({ squares, onClick, winningSquares }) {
  return (
    <div className="board-container">
      {[0, 3, 6].map((startIndex) => (
        <div className="board-row" key={startIndex}>
          {squares.slice(startIndex, startIndex + 3).map((square, index) => (
            <Square
              key={index + startIndex}
              value={square}
              onClick={() => onClick(index + startIndex)}
              isWinningSquare={winningSquares.includes(index + startIndex)}
            />
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
      return { winner: squares[a], winningSquares: lines[i] };
    }
  }
  return { winner: null, winningSquares: [] };
}

function App() {
  const [history, setHistory] = useState([{ squares: Array(9).fill(null) }]);
  const [stepNumber, setStepNumber] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);
  const [score, setScore] = useState({ X: 0, O: 0 });
  const [playerNames, setPlayerNames] = useState({ player1: '', player2: '' });
  const [namesSet, setNamesSet] = useState(false);
  const [buttonText, setButtonText] = useState('Réinitialiser la partie');
  const [showOverlay, setShowOverlay] = useState(false);
  const [winnerName, setWinnerName] = useState('');
  const [confettiActive, setConfettiActive] = useState(false);
  const [recycleConfetti, setRecycleConfetti] = useState(true);
  const [isDraw, setIsDraw] = useState(false);

  const current = history[stepNumber];
  const { winner, winningSquares } = calculateWinner(current.squares);

  useEffect(() => {
    if (winner) {
      setButtonText('Relancer une nouvelle partie');
      setShowOverlay(true);
      setWinnerName(winner === 'X' ? playerNames.player1 : playerNames.player2);
      setConfettiActive(true);
      setRecycleConfetti(true);

      const stopConfettiTimer = setTimeout(() => {
        setRecycleConfetti(false);
      }, 4000);

      return () => {
        clearTimeout(stopConfettiTimer);
      };
    } else if (!current.squares.includes(null)) {
      setIsDraw(true);
      setShowOverlay(true);
      setButtonText('Relancer une nouvelle partie');
    }
  }, [winner, playerNames, current.squares]);

  const handleClick = (index) => {
    const newHistory = history.slice(0, stepNumber + 1);
    const current = newHistory[newHistory.length - 1];
    const squares = current.squares.slice();

    if (squares[index] || winner || isDraw) return;

    squares[index] = xIsNext ? 'X' : 'O';
    setHistory([...newHistory, { squares }]);
    setStepNumber(newHistory.length);
    setXIsNext(!xIsNext);

    const { winner: newWinner } = calculateWinner(squares);
    if (newWinner) {
      setScore((prevScore) => ({
        ...prevScore,
        [newWinner]: prevScore[newWinner] + 1,
      }));
    }
  };

  const undoLastMove = () => {
    if (stepNumber > 0 && !winner && !isDraw) {
      setStepNumber(stepNumber - 1);
      setXIsNext(stepNumber % 2 === 0);
    }
  };

  const resetGame = () => {
    setHistory([{ squares: Array(9).fill(null) }]);
    setStepNumber(0);
    setXIsNext(true);
    setButtonText('Réinitialiser la partie');
    setShowOverlay(false);
    setWinnerName('');
    setConfettiActive(false);
    setRecycleConfetti(true);
    setIsDraw(false);
  };

  const handleNameSubmit = (event) => {
    event.preventDefault();
    if (playerNames.player1 && playerNames.player2) {
      setNamesSet(true);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setPlayerNames((prevNames) => ({
      ...prevNames,
      [name]: value,
    }));
  };

  return (
    <div className="game">
      {!namesSet ? (
        <form onSubmit={handleNameSubmit} className="name-form">
          <div>
            <label>
              Nom du Joueur 1:
              <input type="text" name="player1" value={playerNames.player1} onChange={handleInputChange} />
            </label>
          </div>
          <div>
            <label>
              Nom du Joueur 2:
              <input type="text" name="player2" value={playerNames.player2} onChange={handleInputChange} />
            </label>
          </div>
          <button type="submit">Commencer le jeu</button>
        </form>
      ) : (
        <>
          <div className="game-board">
            <Board squares={current.squares} onClick={handleClick} winningSquares={winningSquares} />
            {showOverlay && (
              <div className="reset-overlay">
                {isDraw ? 'Match nul' : `Gagnant : ${winnerName}`}
              </div>
            )}
          </div>
          {confettiActive && !isDraw && (
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              recycle={recycleConfetti}
            />
          )}
          <div className="game-info">
            {showOverlay ? (
              <button onClick={resetGame} className="reset-button-overlay">
                {buttonText}
              </button>
            ) : (
              <>
                <div className="next-player">
                  {winner
                    ? `Gagnant : ${winner === 'X' ? playerNames.player1 : playerNames.player2}`
                    : `Prochain joueur : ${xIsNext ? playerNames.player1 : playerNames.player2}`}
                </div>
                <button onClick={undoLastMove}>Annuler le dernier coup</button>
                <button onClick={resetGame}>{buttonText}</button>
              </>
            )}
          </div>
          <div className="scoreboard">
            <h3>Score</h3>
            <p>{playerNames.player1} (X): {score.X}</p>
            <p>{playerNames.player2} (O): {score.O}</p>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
