import React from 'react';

interface Props {
  numShoes: number;
  setNumShoes: (n: number) => void;
  onRunSimulation: () => void;
  isRunning: boolean;
}

export const SimulationControls: React.FC<Props> = ({ numShoes, setNumShoes, onRunSimulation, isRunning }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center space-x-4 w-full md:w-auto">
        <label className="text-sm font-semibold text-slate-300 whitespace-nowrap">
          Simulation Shoes:
        </label>
        <select
          value={numShoes}
          onChange={(e) => setNumShoes(Number(e.target.value))}
          disabled={isRunning}
          className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 outline-none"
        >
          <option value={1}>1 Shoe (Live View)</option>
          <option value={10}>10 Shoes Batch</option>
          <option value={50}>50 Shoes Batch</option>
          <option value={100}>100 Shoes Batch</option>
          <option value={500}>500 Shoes Batch</option>
        </select>
      </div>

      <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
        <button
          onClick={onRunSimulation}
          disabled={isRunning}
          className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold px-6 py-2.5 rounded-lg shadow-lg transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isRunning ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0-165 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Simulating...</span>
            </>
          ) : (
            <span>Run Simulation & Train AI</span>
          )}
        </button>
      </div>
    </div>
  );
};

