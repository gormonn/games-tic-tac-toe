import React, {
  useMemo,
  useRef,
  useCallback,
  useEffect,
  useState,
} from "react";
import styled from "styled-components";
import { useSpring, animated, to } from "@react-spring/web";

const Overlay = styled.div`
  background: ${(p) => (p.$winner ? "rgba(30, 30, 30, 0.5)" : "none")};
  z-index: ${(p) => (p.$winner ? "1" : "0")};
  transition: 200ms;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const Rows = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Box = styled.div`
  max-width: 100%;
  max-height: 100%;
  min-width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
`;
const Column = styled(animated.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 500ms;
  background: ${(p) => (p.$touched ? "darkgray" : "gray")};
  width: 100px;
  height: 100px;
  position: relative;
  pointer-events: ${(p) => (p.$touched ? "none" : "auto")};
  cursor: ${(p) => (p.$touched ? "none" : "pointer")};
  &:hover {
    background: ${(p) => (p.$touched ? "none" : "rgba(255,255,255,.5)")};
  }
  border: ${(p) => (p.$isWinLine ? "4px solid black " : "none ")};
  box-sizing: border-box;
  zoom: ${(p) => (p.$winner ? "1!important;" : "")};
`;
const ColumnName = styled.span`
  color: gray;
  position: absolute;
  bottom: 14px;
  right: 14px;
  font-size: 14px;
`;

const battleFieldRaw = (size) => new Array(size).fill(new Array(size).fill(0));
const iSymbols = ((i) =>
  [...Array(26)].map((_) => (++i).toString(36), (i = 9)).join``)(0);

const nameSeparator = ":";
const cellNameParser = (name) => {
  const [x, yStr] = name.split(nameSeparator);
  const y = iSymbols.indexOf(yStr);
  return [Number(x), Number(y)];
};

const winSchemasRaw = (size) => {
  const winSchemas = new Set();
  const lineDiag2 = [];
  const allCells = new Set();
  for (let x = 0; x < size; x++) {
    const lineVert = [];
    const lineHori = [];
    const lineDiag1 = [];

    lineDiag2.push(`${x}${nameSeparator}${iSymbols[x]}`);
    for (let y = 0; y < size; y++) {
      lineVert.push(`${x}${nameSeparator}${iSymbols[y]}`);
      lineHori.push(`${y}${nameSeparator}${iSymbols[x]}`);
      lineDiag1.push(`${y}${nameSeparator}${iSymbols[size - 1 - y]}`);
      allCells.add(`${x}${nameSeparator}${iSymbols[y]}`);
    }
    winSchemas.add(lineVert.join("."));
    winSchemas.add(lineHori.join("."));
    winSchemas.add(lineDiag1.join("."));
  }

  winSchemas.add(lineDiag2.join("."));
  return [arrayToObject([...winSchemas]), [...allCells]];

  function arrayToObject(arr) {
    const obj = {};
    arr.forEach((key) => {
      obj[key] = 0;
    });
    return obj;
  }
};

const GameOver = ({ winner, reset }) => {
  return (
    <Overlay $winner={winner}>
      {winner ? (
        <div>
          <p>GAME OVER</p>
          <p>{winner == 2 ? "X win!" : winner == -1 ? "Draw" : "O win!"}</p>
          <button onClick={reset}>Retry</button>
        </div>
      ) : null}
    </Overlay>
  );
};

const initialSize = 3;
// todo: fix touched cells by bot
export default function TicTacToe() {
  const [gameId, setGameId] = useState(new Date().getMilliseconds());
  const [size, setSize] = useState(initialSize);
  const [player, setPlayer] = useState(1); //2 - x, 7 - o
  const [playerTurn, setPlayerTurn] = useState(true);
  const [winner, setWinner] = useState(false);
  const [winLine, setWinLine] = useState("");
  const [battleField, setBattleField] = useState(() => battleFieldRaw(size));
  // спорный момент.как это будет работать при reset.... поэтому добавил useEffect[winSchemasList]
  const [winSchemasList, allCells] = useMemo(
    () => winSchemasRaw(size),
    [gameId]
  );
  const [winSchemas, setWinSchemas] = useState(winSchemasList);
  const [touchedCells, setTouchedCells] = useState([]);
  const [unTouchedCells, setUnTouchedCells] = useState(allCells);
  const [hardMode, setHardMode] = useState(false);
  const [withBot, setWithBot] = useState(false);
  const X_VAL = 2;
  const X_MAX = size * X_VAL;
  const O_VAL = X_MAX + 1;
  const O_MAX = size * O_VAL;

  const sizes = useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => i + 2);
  }, []);

  const reset = () => {
    setPlayer(1);
    setWinner(false);
    setWinLine("");
    setBattleField(battleFieldRaw(size));
    setTouchedCells([]);
    setPlayerTurn(true);
    setGameId(new Date().getMilliseconds());
  };

  useEffect(() => {
    setWinSchemas(winSchemasList);
    setUnTouchedCells(allCells);
  }, [winSchemasList, allCells]);

  useEffect(() => reset(), [size]);

  const clickHandler =
    (x, y, name, otherPlayer = false) =>
    (e) => {
      //   console.log({ x, y, name, otherPlayer });
      const newBattleField = Object.assign([], battleField, {
        [x]: Object.assign([], battleField[x], {
          [y]: otherPlayer ? "o" : "x",
        }),
      });
      setBattleField(newBattleField);

      const touchedSet = new Set([...touchedCells, name]);
      setTouchedCells([...touchedSet]);

      const unTouchedSet = new Set([...unTouchedCells]);
      unTouchedSet.delete(name);
      setUnTouchedCells([...unTouchedSet]);

      setPlayerTurn((turn) => !turn);

      const newWinSchemas = { ...winSchemas };
      for (let key in winSchemas) {
        if (key.includes(name))
          newWinSchemas[key] += otherPlayer ? O_VAL : X_VAL;
      }
      setWinSchemas(newWinSchemas);
    };

  useEffect(() => {
    function checkWinner() {
      for (let key in winSchemas) {
        if (winSchemas[key] === X_MAX) return [X_VAL, key];
        if (winSchemas[key] === O_MAX) return [O_VAL, key];
      }
    }
    const winner = checkWinner();
    if (winner) {
      console.log("has winner!");
      const [player, winLine] = winner;
      setWinner(player);
      setWinLine(winLine);
    } else if (touchedCells.length === size ** 2) {
      console.log({ winner });
      setWinner(-1);
    }
  }, [winSchemas, size]);

  useEffect(() => {
    if (withBot && !playerTurn) {
      const randomCell =
        unTouchedCells[Math.floor(Math.random() * unTouchedCells.length)];
      const otherPlayer = true;
      const [x, y] = cellNameParser(randomCell);
      clickHandler(x, y, randomCell, otherPlayer)();
    }
  }, [unTouchedCells]);

  const preSet =
    (cb, value) =>
    ({ target }) => {
      const decision = window.confirm(
        "Are you really want to change battlefield? The game will be reset."
      );
      if (decision) {
        cb(value === undefined ? Number(target.value) : value);
        reset();
      }
    };
  return (
    <>
      Left Mouse - X
      <br />
      Right Mouse - O
      <label>
        Size:
        <select onChange={preSet(setSize)} value={size}>
          {sizes.map((size) => (
            <option key={size}>{size}</option>
          ))}
        </select>
        {/* <input type="number" onChange={preSetSize} value={size} /> */}
      </label>
      <label>
        HardMode
        <input
          type="checkbox"
          onChange={() => setHardMode((mode) => !mode)}
          value={hardMode}
        />
      </label>
      <label>
        With Bot
        <input
          type="checkbox"
          onChange={preSet(setWithBot, !withBot)}
          value={withBot}
        />
      </label>
      <button onClick={reset}>Retry</button>
      <Box>
        <GameOver winner={winner} reset={reset} />
        {battleField.map((rows, i) => (
          <Rows key={i}>
            {rows.map((cell, ci) => (
              <Col
                key={`${i}-${ci}-${gameId}`}
                {...{
                  i,
                  ci,
                  winner,
                  cell,
                  clickHandler,
                  winLine,
                  hardMode,
                  withBot,
                  playerTurn,
                  touchedCells,
                }}
              />
            ))}
          </Rows>
        ))}
      </Box>
    </>
  );
}

const Col = ({
  i,
  ci,
  winner,
  cell,
  clickHandler,
  winLine,
  hardMode,
  withBot,
  playerTurn,
  touchedCells,
}) => {
  //   const [touched, setTouched] = useState(false);
  const name = `${ci}${nameSeparator}${iSymbols[i]}`;
  const touched = touchedCells.includes(name);
  const isWinLine = winLine.includes(name);
  const isWinnerCell =
    (winner === 2 && cell === "x") || (winner === 3 && cell === "o");

  const { scale, zoom } = useSpring({
    scale: hardMode ? (touched ? 0.00000001 : 1) : 1,
    zoom: 0,
    config: { mass: 5, tension: 500, friction: 80 },
  });
  return (
    <Column
      style={{
        zoom: to([scale, zoom], (s, z) => s + z),
      }}
      $winner={winner}
      $touched={touched}
      $isWinLine={isWinLine}
      $isWinnerCell={isWinnerCell}
      onClick={() => {
        if (playerTurn) {
          //   setTouched(true);
          clickHandler(i, ci, name)();
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        if (!withBot && !playerTurn) {
          //   setTouched(true);
          clickHandler(i, ci, name, true)();
        }
        return false;
      }}
    >
      <ColumnName>{name}</ColumnName>
      {cell ? cell : null}
    </Column>
  );
};
