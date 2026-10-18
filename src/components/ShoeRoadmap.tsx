import { useState } from 'react';
import type { ShoeStats } from '../types/baccarat';

interface Props {
  shoeStats: ShoeStats[];
}

export const ShoeRoadmap: React.FC<Props> = ({ shoeStats }) => {
  const [selectedShoeIndex, setSelectedShoeIndex] = useState(0);

  if (!shoeStats || shoeStats.length === 0) return null;

  const currentShoe = shoeStats[selectedShoeIndex] || shoeStats[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-lg font-bold text-white">
          Shoe Inspector #{currentShoe.shoeId} ({currentShoe.totalHands} Hands)
        </h3>
        {shoeStats.length > 1 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Select Shoe:</span>
            <select
              value={selectedShoeIndex}
              onChange={(e) => setSelectedShoeIndex(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded px-2 py-1 outline-none"
            >
              {shoeStats.map((s, idx) => (
                <option key={s.shoeId} value={idx}>
                  Shoe #{s.shoeId} ({s.totalHands} hands)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-800/40 p-4 rounded-lg border border-slate-700/50 text-sm">
        <div>
          <span className="text-slate-400">Banker Wins:</span> <strong className="text-red-400">{currentShoe.bankerWins}</strong>
        </div>
        <div>
          <span className="text-slate-400">Player Wins:</span> <strong className="text-blue-400">{currentShoe.playerWins}</strong>
        </div>
        <div>
          <span className="text-slate-400">Ties:</span> <strong className="text-emerald-400">{currentShoe.ties}</strong>
        </div>
        <div>
          <span className="text-slate-400">B/P Switches:</span> <strong className="text-amber-400">{currentShoe.bankerPlayerSwitches}</strong>
        </div>
      </div>

      <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 overflow-x-auto">
        <div className="text-xs font-semibold text-slate-400 mb-2">Bead Plate Sequence (B: Red, P: Blue, T: Green)</div>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
          {currentShoe.hands.map((h) => {
            const bgCol = h.outcome === 'B' ? 'bg-red-600 text-white' : h.outcome === 'P' ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white';
            return (
              <div
                key={h.handNumber}
                title={`Hand #${h.handNumber}: P(${h.playerTotal}) vs B(${h.bankerTotal}) -> ${h.outcome}`}
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow ${bgCol}`}
              >
                {h.outcome}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

