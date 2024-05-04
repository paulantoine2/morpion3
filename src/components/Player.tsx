import type { Player } from "../types";
import { Piece } from "./Piece";

export function Player({
  stock,
  isPlaying,
  color,
  isOtherPlayer,
  nickname,
}: Player & { isOtherPlayer: boolean; nickname: string }) {
  return (
    <div
      className={`${!isPlaying && "opacity-50"} items-center flex ${
        isOtherPlayer ? "flex-col-reverse" : "flex-col"
      }`}
    >
      <div className="font-medium uppercase">{nickname}</div>

      <div className={`flex items-center gap-2`}>
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
