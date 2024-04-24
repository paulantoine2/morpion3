import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";
import Game from "./components/Game.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div className="bg-slate-900 h-screen w-screen flex flex-col text-white">
      <nav className="bg-slate-800">
        <div className="font-bold text-4xl">Morpion³</div>
        <div>Jouer</div>
      </nav>

      <div className="flex-1 flex items-center justify-center">
        <Game />
      </div>
    </div>
  </React.StrictMode>
);
