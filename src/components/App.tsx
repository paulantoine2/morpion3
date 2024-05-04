import { useEffect, useRef, useState, type FormEventHandler } from "react";
import Game from "./Game";
import supabase from "../lib/supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";
import type { PlayerColor } from "../types";

export function App() {
  const channel = useRef<RealtimeChannel>();

  const [game, setGame] = useState<string>();

  useEffect(() => {
    channel.current = supabase.channel("queue").subscribe();
  }, []);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    const nickname = data.get("nickname")?.toString() || "";

    localStorage.setItem("nickname", nickname);

    const state = channel.current?.presenceState<{
      gameId: string;
    }>();

    if (state) {
      console.log(state);
      const user_waiting = Object.values(state)[0];

      if (user_waiting) {
        console.log("Join game");

        const id = user_waiting[0].gameId;
        setGame(id);
      } else {
        console.log("Join queue");

        const id = window.crypto.randomUUID();
        setGame(id);
        channel.current?.track({ gameId: id });
      }
    }
  };

  return (
    <div className="bg-main bg-no-repeat bg-cover bg-center h-screen w-screen flex flex-col text-white">
      <img src="./logo.svg" className="h-[70px] my-10" />
      {game ? (
        <div className="flex-1 flex items-center justify-center">
          <Game id={game} />
        </div>
      ) : (
        <form
          className="flex flex-col gap-4 my-10 max-w-sm mx-auto"
          onSubmit={handleSubmit}
        >
          <input
            name="nickname"
            className="bg-slate-800  rounded-lg p-4"
            type="text"
            placeholder="Nickname1234"
            required
            defaultValue={localStorage.getItem("nickname") || ""}
          />
          <button
            className="bg-orange-500 p-4 uppercase font-medium tracking-widest rounded-lg"
            type="submit"
          >
            Play now
          </button>
        </form>
      )}
    </div>
  );
}
