import type { Player } from "../types";
import { Piece } from "./Piece";

export function Player({ stock, isPlaying, color }: Player) {
  const colorVariants = {
    orange: "from-orange-400 to-orange-500",
    blue: "from-blue-400 to-blue-500",
  };
  return (
    <div
      className={`${!isPlaying && "opacity-50"} bg-slate-800 p-5 rounded-lg`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`${colorVariants[color]} w-10 h-10 bg-gradient-to-t rounded-full`}
        ></div>
        <div className="font-medium uppercase">{color}</div>
      </div>

      <div className="flex items-center w-[900px]">
        {Object.entries(stock).map(([size, available]) => (
          <Piece
            key={size}
            size={+size}
            available={available}
            player={color}
            disabled={!isPlaying}
          />
        ))}
      </div>
    </div>
  );
}
