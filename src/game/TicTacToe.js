import React, {
  useMemo,
  useRef,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  battleFieldRaw,
  nameParse,
  iSymbols,
  nameSeparator,
  winSchemasRaw,
} from "./utils";
import { Box, Column, ColumnName, Rows } from "./gui";
import { useSpring, to } from "@react-spring/web";
import { GameOver } from "./GameOver";

const initialSize = 3;
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
  const [withBot, setWithBot] = useState(1);
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

  const clickHandler = useCallback(
    (iHor, iVert, name, otherPlayer = false) =>
      (e) => {
        // if (otherPlayer) console.log({ iHor, iVert, name, otherPlayer });
        const newBattleField = Object.assign([], battleField, {
          [iHor]: Object.assign([], battleField[iHor], {
            [iVert]: otherPlayer ? "o" : "x",
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
      },
    [battleField, touchedCells, unTouchedCells, winSchemas]
  );

  useEffect(() => {
    function checkWinner() {
      for (let key in winSchemas) {
        if (winSchemas[key] === X_MAX) return [X_VAL, key];
        if (winSchemas[key] === O_MAX) return [O_VAL, key];
      }
    }
    const winner = checkWinner();
    if (winner) {
      const [player, winLine] = winner;
      setWinner(player);
      setWinLine(winLine);
    } else if (touchedCells.length === size ** 2) {
      setWinner(-1);
    }
  }, [winSchemas, size]);

  useEffect(() => {
    if (unTouchedCells.length && withBot && !playerTurn) {
      const randomCell =
        unTouchedCells[Math.floor(Math.random() * unTouchedCells.length)];
      const otherPlayer = true;
      const [iHor, iVert] = nameParse(randomCell);
      clickHandler(iHor, iVert, randomCell, otherPlayer)();
    }
  }, [unTouchedCells]);

  const preSet =
    (cb) =>
    ({ target }) => {
      const decision = window.confirm(
        "Are you really want to change battlefield? The game will be reset."
      );
      if (decision) {
        cb(Number(target.value));
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
        HardMode:
        <input
          type="checkbox"
          onChange={() => setHardMode((mode) => !mode)}
          value={hardMode}
        />
      </label>
      <label>
        Opponent:
        <select onChange={preSet(setWithBot)} value={withBot}>
          <option value="0">Other player</option>
          <option value="1">Random bot</option>
          <option value="2" disabled>
            Minimax bot
          </option>
        </select>
      </label>
      <button onClick={reset}>Retry</button>
      <Box>
        <GameOver winner={winner} reset={reset} />
        {battleField.map((rows, iHor) => (
          <Rows key={iHor}>
            {rows.map((cell, iVert) => (
              <Col
                key={`${iHor}-${iVert}-${gameId}`}
                {...{
                  iHor,
                  iVert,
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
  iHor,
  iVert,
  winner,
  cell,
  clickHandler,
  winLine,
  hardMode,
  withBot,
  playerTurn,
  touchedCells,
}) => {
  const name = `${iHor}${nameSeparator}${iSymbols[iVert]}`;
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
          clickHandler(iHor, iVert, name)();
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        if (!withBot && !playerTurn) {
          clickHandler(iHor, iVert, name, true)();
        }
        return false;
      }}
    >
      <ColumnName>{name}</ColumnName>
      {cell ? cell : null}
    </Column>
  );
};
