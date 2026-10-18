import { useState } from 'react';
import type { ShoeStats, AiStrategyRecommendation } from '../types/baccarat';
import { getAiRecommendation } from '../utils/dbEngine';

interface Props {
  shoeStats: ShoeStats[];
}

export const AiInsightsPanel: React.FC<Props> = ({ shoeStats }) => {
  const [selectedShoeId, setSelectedShoeId] = useState<number>(1);
  const [inspectHandCount, setInspectHandCount] = useState<number>(10);

  if (!shoeStats || shoeStats.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-400 text-center">
        Run simulation to enable local SQLite AI heuristic scoring.
      </div>
    );
  }

  const currentShoe = shoeStats.find(s => s.shoeId === selectedShoeId) || shoeStats[0];
  const slicedHands = currentShoe.hands.slice(0, inspectHandCount);
  const recommendation: AiStrategyRecommendation = getAiRecommendation(slicedHands);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>Local SQLite AI Heuristic Advisor</span>
            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
              Zero Neural Network (Pure SQLite Pattern Frequency)
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Queries trained SQLite pattern frequency tables in real-time based on rolling baccarat outcomes.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div>
            <label className="text-xs text-slate-400 mr-2">Shoe:</label>
            <select
              value={selectedShoeId}
              onChange={(e) => setSelectedShoeId(Number(e.target.value))}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded px-2 py-1 outline-none"
            >
              {shoeStats.map(s => (
                <option key={s.shoeId} value={s.shoeId}>Shoe #{s.shoeId}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mr-2">Hands Sample:</label>
            <input
              type="number"
              min={3}
              max={currentShoe.hands.length}
              value={inspectHandCount}
              onChange={(e) => setInspectHandCount(Math.max(3, Number(e.target.value)))}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded px-2 py-1 w-16 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Next Bet Recommendation</div>
            <div className="text-3xl font-black mt-2 text-amber-400">
              {recommendation.suggestedBet}
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Confidence Score: <strong className="text-white">{recommendation.confidence}%</strong>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-700 text-xs text-slate-300">
            Historical Match Hit Rate: <strong className="text-emerald-400">{recommendation.historicalHitRate.toFixed(2)}%</strong>
          </div>
        </div>

        <div className="md:col-span-2 bg-slate-800/60 border border-slate-700/50 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Heuristic Engine Reasoning</div>
            <p className="text-sm text-slate-200 mt-2 leading-relaxed">
              {recommendation.reasoning}
            </p>
          </div>
          <div className="mt-4 text-xs text-slate-400 flex items-center justify-between">
            <span>Sample subset: {inspectHandCount} hands evaluated</span>
            <span className="text-amber-400 font-mono">SQLite DB Indexed</span>
          </div>
        </div>
      </div>
    </div>
  );
};

