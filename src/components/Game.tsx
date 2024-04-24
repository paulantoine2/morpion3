import { DndContext } from "@dnd-kit/core";
import React, { useEffect, useState } from "react";
import type { Board, PlayerColor, Stocks } from "../types";
import { Square } from "./Square";
import { Player } from "./Player";

const INITIAL_STOCK = {
  1: true,
  2: true,
  3: true,
  4: true,
  5: true,
  6: true,
  7: true,
  8: true,
  9: true,
};

export default function Game() {
  const [board, setBoard] = useState<Board>(
    Array(9).fill({ player: null, size: 0 })
  );
  const [isPlaying, setIsPlaying] = useState<PlayerColor>("orange");

  const [stocks, setStocks] = useState<Stocks>({
    orange: { ...INITIAL_STOCK },
    blue: { ...INITIAL_STOCK },
  });

  const renderSquare = (i: number) => (
    <Square id={i} player={board[i].player} size={board[i].size} />
  );

  useEffect(() => {
    const winner = getWinner(board);

    if (winner) alert("winner is " + winner);
  }, [board]);

  return (
    <DndContext
      onDragEnd={(event) => {
        if (event.over) {
          const player: PlayerColor = event.active.data.current?.player;
          const size: number = event.active.data.current?.size;
          if (size <= board[+event.over.id].size) return;
          const boardCopy = [...board];
          boardCopy[+event.over.id] = { player, size, id: +event.over.id };
          setBoard(boardCopy);

          const stocksCopy = { ...stocks };
          stocksCopy[player][size] = false;
          setStocks(stocksCopy);

          setIsPlaying((prev) => (prev === "orange" ? "blue" : "orange"));
        }
      }}
    >
      <div className="flex flex-col items-center justify-between h-full py-10">
        <Player
          stock={stocks.orange}
          isPlaying={isPlaying === "orange"}
          color="orange"
        />

        <div className="grid grid-cols-3 grid-rows-3 gap-2 w-[316px]">
          {renderSquare(0)}
          {renderSquare(1)}
          {renderSquare(2)}

          {renderSquare(3)}
          {renderSquare(4)}
          {renderSquare(5)}

          {renderSquare(6)}
          {renderSquare(7)}
          {renderSquare(8)}
        </div>
        <Player
          stock={stocks.blue}
          isPlaying={isPlaying === "blue"}
          color="blue"
        />
      </div>
    </DndContext>
  );
}

function getWinner(board: Board): PlayerColor | null {
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
    if (
      board[a].player &&
      board[a].player === board[b].player &&
      board[a].player === board[c].player
    ) {
      return board[a].player;
    }
  }
  return null;
}
