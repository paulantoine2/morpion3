import type { Player } from "../types";
import { Piece } from "./Piece";

export function Player({
  stock,
  isPlaying,
  color,
  isOtherPlayer,
}: Player & { isOtherPlayer: boolean }) {
  const colorVariants = {
    orange: "from-orange-400 to-orange-500",
    blue: "from-blue-400 to-blue-500",
  };
  return (
    <div
      className={`${!isPlaying && "opacity-50"} ${
        !isOtherPlayer && "bg-slate-800"
      } p-5 rounded-lg`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`${colorVariants[color]} w-10 h-10 bg-gradient-to-t rounded-full`}
        ></div>
        <div className="font-medium uppercase">{color}</div>
      </div>

      <div className={`w-[469px] flex items-center gap-2`}>
        {Object.entries(stock).map(([size, available]) => (
          <Piece
            key={size}
            size={+size}
            available={available}
            player={color}
            disabled={!isPlaying || isOtherPlayer}
          />
        ))}
      </div>
    </div>
  );
}
