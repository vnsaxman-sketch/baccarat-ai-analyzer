import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white py-4 px-6 flex flex-col md:flex-row justify-between items-center shadow-md">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center font-bold text-xl shadow-lg">
          🂡
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-amber-400 to-red-500 bg-clip-text text-transparent">
            BACCARAT PRO SIMULATOR & LOCAL AI
          </h1>
	  <p className="text-xs font-extrabold text-slate-400">
            Developed by Long Nguyen
          </p>
          <p className="text-xs text-slate-400">
            Official Rules • Cut Card 8-Deck Shoes • Exclusive Tie Streaks • SQLite Indexed Heuristics
          </p>
        </div>
      </div>
      <div className="mt-3 md:mt-0 flex items-center space-x-2 text-xs">
        <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-amber-400 font-medium">
          SQLite WASM Active
        </span>
        <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 font-medium">
          68-80 Hands / Shoe
        </span>
      </div>
    </header>
  );
};

