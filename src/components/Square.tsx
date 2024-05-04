import { useDroppable } from "@dnd-kit/core";
import type { CSSProperties } from "react";
import type { Square } from "../types";

export function Square({ player, size, id }: Square) {
  const { isOver, setNodeRef, active } = useDroppable({ id });

  const style: CSSProperties = {
    outline:
      isOver && active?.data.current?.size > size
        ? "solid 4px white"
        : undefined,
    outlineOffset: -4,
  };

  return (
    <div
      className="bg-slate-800 aspect-square rounded-lg flex items-center justify-center"
      ref={setNodeRef}
      style={style}
    >
      {player && (
        <img
          src={`/${player}.svg`}
          style={{ transform: `scale(${(size + 5) / 15})` }}
        />
      )}
    </div>
  );
}
