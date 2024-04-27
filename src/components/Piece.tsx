import { useDraggable } from "@dnd-kit/core";
import type { PlayerColor } from "../types";

export function Piece({
  size,
  available,
  player,
  disabled,
}: {
  size: number;
  available: boolean;
  player: PlayerColor;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: player + size,
    data: {
      player,
      size,
    },
    disabled,
  });
  if (!available) return null;
  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;
  return (
    <div
      className={`aspect-square flex items-center justify-center ${
        disabled ? "cursor-default" : "cursor-grab"
      }`}
      ref={setNodeRef}
      style={{ ...style, width: 30 + size * 3 }}
      {...listeners}
      {...attributes}
    >
      <img
        key={size}
        src={`/${player}.svg`}

        // style={{
        //   transform: `scale(${(+size + 5) / 15})`,
        // }}
      />
    </div>
  );
}
