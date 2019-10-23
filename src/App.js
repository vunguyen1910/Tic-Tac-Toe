import React, { useState, useEffect } from "react";
import "./App.css";
import "./index.css";
import Background from "./bgImg.jpg";
import "bootstrap/dist/css/bootstrap.min.css";
import ReactModal from "react-modal";
import FacebookLogin from "react-facebook-login";

const bg = {
  backgroundImage: `url("${Background}")`
};
function App() {
  const [board, setBoard] = useState(new Array(9).fill(null)); //create 9 square null
  const [isOver, setIsOver] = useState(null);
  const [winner, setWinner] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [topscore, setTopScore] = useState([]);
  const resetGame = () => {
    setBoard(new Array(9).fill(null));
    setIsOver(false);
    setWinner(null);
    setIsOpen(false);
  };
  useEffect(() => {
    getUserData();
  }, []);

  const responseFromFB = resp => {
    setCurrentUser({
      name: resp.name,
      email: resp.email
    });
  };
  const getUserData = async () => {
    const url = `https://ftw-highscores.herokuapp.com/tictactoe-dev`;
    const response = await fetch(url);
    const data = await response.json();
    setTopScore(data.items);
  };
  const postUserData = async () => {
    let data = new URLSearchParams();
    data.append("player", currentUser.name);
    data.append("score", -111111111111111111111111111111111111111111111);
    const url = `https://ftw-highscores.herokuapp.com/tictactoe-dev`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: data.toString(),
      json: true
    });
    const resp = await response.json()
  };

  return (
    <div className="App">
      {!currentUser ? (
        <FacebookLogin
          autoLoad={true}
          appId="709499266236545"
          fields="name,email,picture"
          callback={resp => {
            responseFromFB(resp);
          }}
        />
      ) : (
        <Board
          board={board}
          setBoard={setBoard}
          isOver={isOver}
          setIsOver={setIsOver}
          winner={winner}
          setWinner={setWinner}
          resetGame={resetGame}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
        />
      )}
      <div>
        <h3>Top Score</h3>
        {topscore.map(el => (
          <li>
            {el.player} with the score: {el.score}
          </li>
        ))}
      </div>
      <button
        onClick={() => {
          postUserData();
        }}
      >
        Post Score
      </button>
    </div>
  );
}
function Board(props) {
  const handleClick = id => {
    if (props.isOver) return;
    let board = props.board.slice();
    let check = board.filter(el => el === null);

    if (!board[id]) board[id] = check.length % 2 ? "X" : "O";
    else return;

    if (board.filter(el => !el).length === 0) {
      props.setIsOver(true);
      props.setIsOpen(true);
    }
    props.setBoard(board);
    if (decideOutCome(board)) {
      props.setWinner(decideOutCome(board));
      props.setIsOver(true);
      props.setIsOpen(true);
    }
  };
  return (
    <div className="container">
      <div className="board" style={bg}>
        {props.board.map((el, idx) => {
          return (
            <Square key={idx} value={el} id={idx} handleClick={handleClick} />
          );
        })}
      </div>
      <div>
        <div className="nextPlayer">
          Next Player is{" "}
          <span className="textResult">
            {props.board.filter(el => !el).length % 2 ? "X" : "O"}
          </span>
        </div>
        <ReactModal
          className="popResult"
          isOpen={props.isOpen}
          onRequestClose={() => props.setIsOpen(false)}
          onClick={() => props.setIsOpen(false)}
        >
          {props.isOpen === true ? (
            <div className="result">
              <div>
                {props.winner ? (
                  <span className="textResult">Winner is {props.winner}</span>
                ) : (
                  <span className="textResult">Game is Raw</span>
                )}
              </div>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => {
                  props.resetGame();
                }}
              >
                Play Again
              </button>
            </div>
          ) : (
            ""
          )}
        </ReactModal>
        {props.isOpen === false ? (
          <button
            className="btn btn-danger"
            onClick={() => {
              props.resetGame();
            }}
          >
            Play Again
          </button>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}

const decideOutCome = arr => {
  const PossibleWinningCases = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [2, 4, 6],
    [0, 4, 8]
  ];
  let winner = null;
  PossibleWinningCases.map(el => {
    let [a, b, c] = el;
    if (arr[a] && arr[a] === arr[b] && arr[a] === arr[c]) winner = arr[a];
  });
  return winner;
};

function Square(props) {
  return (
    <div className="square" onClick={() => props.handleClick(props.id)}>
      <span className={props.value === "X" ? "X" : "O"}>{props.value}</span>
    </div>
  );
}
export default App;
