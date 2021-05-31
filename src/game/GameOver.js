import React from "react";
import { Overlay } from "./gui";

export const GameOver = ({ winner, reset }) => {
  return (
    <Overlay $winner={winner}>
      {winner ? (
        <div>
          <p>GAME OVER</p>
          <p>{winner == 2 ? "X win!" : winner == -1 ? "Tie" : "O win!"}</p>
          <button onClick={reset}>Retry</button>
        </div>
      ) : null}
    </Overlay>
  );
};
