import { useMemo, useEffect, useCallback, useState, useRef } from "react";
import "./styles.css";
export default function App() {
  const size = useRef(5);
  const player1 = "0";
  const player2 = "X";
  const [won, setWon] = useState("");
  const [draw, setDraw] = useState(false);
  const playablePoints = useRef([]);
  const [playing, setPlaying] = useState(false);
  const [blocks, setBlocks] = useState([]);
  const computePlaybelPoints = useCallback(() => {
    for (let i = 0; i < size.current; i++) {
      for (let j = 0; j < size.current; j++) {
        playablePoints.current.push({ y: i, x: j });
      }
    }
    playablePoints.current = shuffleArray(playablePoints.current);
  }, []);
  const computeInitialBlocks = () => {
    const array = [];
    for (let i = 0; i < size.current; i++) {
      const subArray = [];
      for (let j = 0; j < size.current; j++) {
        subArray.push("");
      }
      array.push(subArray);
    }
    setBlocks(array);
  };
  useEffect(() => {
    computePlaybelPoints();
  }, [computePlaybelPoints]);

  useEffect(() => {
    computeInitialBlocks();
  }, []);
  const shuffleArray = (array) => array.sort(() => 0.5 - Math.random());
  const hasWin = (array = [], value) =>
    array.length > 0 && array.every((ele) => ele === value);
  const determinWin = useCallback((blocks, value, points) => {
    const winX = (value, points) => {
      const vals = [];
      for (let i = 0; i < size.current; i++) {
        vals.push(blocks[i][points.x]);
      }
      return hasWin(vals, value);
    };

    const winY = (value, points) => {
      const vals = [];
      for (let i = 0; i < size.current; i++) {
        vals.push(blocks[points.y][i]);
      }
      return hasWin(vals, value);
    };

    const canWinDiagonally = (points) =>
      (points.x > 0 &&
        points.x < size - 1 &&
        points.y > 0 &&
        points.y < size - 1) ||
      (points.y === 0 && points.x === 0) ||
      (points.y === 0 && points.x === size - 1) ||
      (points.y === size - 1 && points.x === 0) ||
      (points.y === size - 1 && points.x === size - 1);

    const leadingDiagonalWin = (value) => {
      let vals = [];
      for (let i = 0; i < size.current; i++) {
        vals.push(blocks[i][i]);
      }

      return hasWin(vals, value);
    };

    const noneLeadingDiagonalWin = (value) => {
      let vals = [];
      for (let i = size.current - 1; i <= 0; i--) {
        vals.push(blocks[i][i]);
      }

      return hasWin(vals, value);
    };
    const windDiagonal = (value) => {
      return leadingDiagonalWin(value) || noneLeadingDiagonalWin(value);
    };
    return (
      winX(value, points) ||
      winY(value, points) ||
      (canWinDiagonally(points) && windDiagonal(value))
    );
  }, []);

  const isDraw = () => {
    return !playablePoints.current.length;
  };

  const play = useCallback(
    (value, points, blocks) => {
      setPlaying(true);
      const newBlocks = blocks.map((ele) => ele.slice()).slice();

      // catch draw check when size is odd
      if (points) {
        newBlocks[points.y][points.x] = value;
        const hasWin = determinWin(newBlocks, value, points);
        setBlocks(newBlocks);
        playablePoints.current = playablePoints.current.filter(
          (ele) => !(ele.x === points.x && ele.y === points.y)
        );
        if (!hasWin) {
          if (value === player2) {
            const newPoints = playablePoints.current.pop();
            setTimeout(() => {
              play(player1, newPoints, newBlocks);
            }, 1000);
          } else {
            setPlaying(false);
          }
        } else {
          setWon(value);
        }
        // catching draw case for even number size matix
        if (isDraw()) setDraw(true);
      } else {
        setDraw(true);
      }
    },
    [determinWin]
  );
  const resetGame = () => {
    computePlaybelPoints();
    computeInitialBlocks();
    setWon("");
    setPlaying(false);
    setDraw(false);
  };

  const elements = useMemo(
    () => (
      <div className={"gameContainer"}>
        {blocks.map((ele, index) => {
          return (
            <div key={index.toString()} className={"row"}>
              {ele.map((e, indexer) => {
                const makePlay = () => {
                  play(player2, { y: index, x: indexer }, blocks);
                };
                return (
                  <button
                    onClick={makePlay}
                    disabled={e || won || playing}
                    className={"item"}
                    key={index.toString() + " _ " + indexer.toString()}
                  >
                    {e}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    ),
    [blocks, play, won, playing]
  );

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Tit tac toe game</h2>
      <h3>{"Instructions: "}</h3>
      <div>
        there are two players (O and X) - You are player <b>X</b>
      </div>
      <br />
      {won && <div className={"win"}>Player {won} won</div>}
      {draw && <div className={"draw"}>DRAW</div>}
      <div>{elements}</div>
      <button
        disabled={!won && !draw}
        onClick={resetGame}
        className={"reset-button"}
      >
        Reset
      </button>
    </div>
  );
}
