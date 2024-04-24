export type PlayerColor = "orange" | "blue";

export type Square = { id: number; player: PlayerColor | null; size: number };

export type Board = Square[];

export type Piece = {
  size: number;
  player: PlayerColor;
  disabled: boolean;
};

export type Stock = Record<number, boolean>;

export type Stocks = Record<PlayerColor, Stock>;

export type Player = {
  stock: Stock;
  isPlaying: boolean;
  color: PlayerColor;
};
