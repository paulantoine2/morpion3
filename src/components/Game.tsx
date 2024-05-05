import { DndContext } from "@dnd-kit/core";
import React, { useCallback, useEffect, useRef, useState } from "react";
import type { Board, PlayerColor, Stocks } from "../types";
import { Square } from "./Square";
import { Player } from "./Player";
import supabase from "../lib/supabase";
import {
  REALTIME_LISTEN_TYPES,
  REALTIME_PRESENCE_LISTEN_EVENTS,
  type RealtimeChannel,
} from "@supabase/supabase-js";

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

type Player = {
  color: PlayerColor;
  nickname: string;
  ready: boolean;
  user_id: string;
  play_first: boolean;
};

const user_id = window.crypto.randomUUID();

export default function Game({ id }: { id: string }) {
  const gameChannel = useRef<RealtimeChannel>();

  const [bluePlayer, setBluePlayer] = useState<Player>();
  const [orangePlayer, setOrangePlayer] = useState<Player>();
  const [isPlaying, setIsPlaying] = useState<PlayerColor | null>(null);
  const [stocks, setStocks] = useState<Stocks>({
    orange: { ...INITIAL_STOCK },
    blue: { ...INITIAL_STOCK },
  });
  const [board, setBoard] = useState<Board>(
    Array(9).fill({ player: null, size: 0 })
  );

  console.log(isPlaying);

  const selfPlayer =
    bluePlayer && bluePlayer.user_id === user_id
      ? bluePlayer
      : orangePlayer && orangePlayer.user_id === user_id
      ? orangePlayer
      : null;
  const opponentPlayer =
    selfPlayer && selfPlayer.color === "blue" && orangePlayer
      ? orangePlayer
      : bluePlayer;

  useEffect(() => {
    if (
      selfPlayer &&
      selfPlayer.ready &&
      opponentPlayer &&
      opponentPlayer.ready
    ) {
      setTimeout(
        () =>
          setIsPlaying(
            selfPlayer.play_first ? selfPlayer.color : opponentPlayer.color
          ),
        1000
      );
    }
  }, [selfPlayer, opponentPlayer]);

  useEffect(() => {
    const winner = getWinner(board);

    if (winner) alert("winner is " + winner);
  }, [board]);

  useEffect(() => {
    gameChannel.current = supabase.channel(`game:${id}`, {
      config: { presence: { key: "users" } },
    });
    gameChannel.current
      .on(
        REALTIME_LISTEN_TYPES.PRESENCE,
        { event: REALTIME_PRESENCE_LISTEN_EVENTS.SYNC },
        () => {
          const state = gameChannel.current?.presenceState<Player>();

          console.log({ ...state });

          if (!state) return;

          if (
            !("users" in state) ||
            ("users" in state &&
              state.users.length === 1 &&
              state.users[0].user_id !== user_id)
          ) {
            const isFirstPlayerJoining = !("users" in state);
            gameChannel.current?.track({
              user_id,
              nickname: localStorage.getItem("nickname") || "unknown",
              color: isFirstPlayerJoining ? "orange" : "blue",
              ready: false,
              play_first: isFirstPlayerJoining,
            });
          }

          if (state && "users" in state) {
            setOrangePlayer(
              state.users.find((player) => player.color === "orange")
            );
            setBluePlayer(
              state.users.find((player) => player.color === "blue")
            );
          }
        }
      )
      .on(
        REALTIME_LISTEN_TYPES.BROADCAST,
        { event: "game_state" },
        ({ payload }) => {
          setBoard(payload.board);
          setStocks(payload.stocks);
          setIsPlaying((prev) => (prev === "orange" ? "blue" : "orange"));
        }
      )
      .subscribe();

    return () => {
      if (gameChannel.current) supabase.removeChannel(gameChannel.current);
    };
  }, []);

  const handlePlay = useCallback(
    ({
      player,
      size,
      index,
    }: {
      player: PlayerColor;
      size: number;
      index: number;
    }) => {
      if (size <= board[index].size) return;
      const boardCopy = [...board];
      boardCopy[index] = { player, size, id: index };
      setBoard(boardCopy);

      const stocksCopy = { ...stocks };
      stocksCopy[player][size] = false;
      setStocks(stocksCopy);

      setIsPlaying((prev) => (prev === "orange" ? "blue" : "orange"));

      gameChannel.current?.send({
        type: "broadcast",
        event: "game_state",
        payload: { board: boardCopy, stocks: stocksCopy },
      });
    },
    [board, stocks, gameChannel]
  );

  const renderSquare = (i: number) => (
    <Square id={i} player={board[i].player} size={board[i].size} />
  );

  if (selfPlayer && !opponentPlayer)
    return (
      <div className="h-full flex items-center justify-center flex-col gap-1">
        <Spinner />
        <p className="text-xl">Looking for an opponent...</p>
      </div>
    );

  if (selfPlayer && opponentPlayer && !isPlaying)
    return (
      <div className="flex flex-col gap-10 items-center">
        <div className="flex gap-10 items-center">
          <div className="flex flex-col gap-2 items-center">
            <img src={`/${opponentPlayer?.color}.svg`} />
            <div className="text-lg">{opponentPlayer?.nickname}</div>
            <div>{opponentPlayer?.ready ? "✅" : <Spinner />}</div>
          </div>
          <div className="text-4xl">VS</div>
          <div className="flex flex-col gap-2 items-center">
            <img src={`/${selfPlayer?.color}.svg`} />
            <div className="text-lg">{selfPlayer?.nickname}</div>
            <div>{selfPlayer?.ready ? "✅" : <Spinner />}</div>
          </div>
        </div>

        {!selfPlayer?.ready && (
          <button
            className="bg-orange-500 p-4 uppercase font-medium tracking-widest rounded-lg"
            onClick={() => {
              gameChannel.current?.track({
                ...selfPlayer,
                ready: true,
              });
            }}
          >
            I'm ready
          </button>
        )}
      </div>
    );

  if (isPlaying)
    return (
      <DndContext
        onDragEnd={(event) => {
          if (event.over) {
            handlePlay({
              player: event.active.data.current?.player,
              size: event.active.data.current?.size,
              index: +event.over.id,
            });
          }
        }}
      >
        <div className="flex flex-col items-center justify-between h-full py-10">
          {opponentPlayer && (
            <Player
              stock={stocks[opponentPlayer.color]}
              isPlaying={isPlaying === opponentPlayer.color}
              color={opponentPlayer.color}
              isOtherPlayer={true}
              nickname={opponentPlayer.nickname}
              onCountdownEnd={() => {
                console.log("countdown end");
                setIsPlaying((prev) => (prev === "blue" ? "orange" : "blue"));
              }}
            />
          )}
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
          {selfPlayer && (
            <Player
              stock={stocks[selfPlayer.color]}
              isPlaying={isPlaying === selfPlayer.color}
              color={selfPlayer.color}
              isOtherPlayer={false}
              nickname={selfPlayer.nickname}
              onCountdownEnd={() => {
                console.log("countdown end");
                setIsPlaying((prev) => (prev === "blue" ? "orange" : "blue"));
              }}
            />
          )}
        </div>
      </DndContext>
    );

  return <div>Error, invalid state</div>;
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

function Spinner() {
  return (
    <div role="status">
      <svg
        aria-hidden="true"
        className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-orange-400"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
    </div>
  );
}
