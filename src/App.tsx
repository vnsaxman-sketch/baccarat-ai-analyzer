import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SimulationControls } from './components/SimulationControls';
import { MetricsDashboard } from './components/MetricsDashboard';
import { ShoeRoadmap } from './components/ShoeRoadmap';
import { AiInsightsPanel } from './components/AiInsightsPanel';
import { runMultipleSimulations } from './utils/baccaratEngine';
import { initLocalSqlDb, logHandsToSql, getSqlMetricsSummary } from './utils/dbEngine';
import type { SimulationSummary } from './types/baccarat';

export function App() {
  const [numShoes, setNumShoes] = useState<number>(10);
  const [summary, setSummary] = useState<SimulationSummary | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sqlStats, setSqlStats] = useState({ totalPatternsStored: 0, totalLogs: 0 });
  const [dbReady, setDbReady] = useState<boolean>(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    initLocalSqlDb()
      .then(() => {
        setDbReady(true);
        handleRunSimulation(10);
      })
      .catch((err) => {
        setInitError(err?.message || 'Unknown database initialization error');
      });
  }, []);

  const handleRunSimulation = (shoesCount?: number) => {
    const count = shoesCount !== undefined ? shoesCount : numShoes;
    setIsRunning(true);
    setTimeout(() => {
      const res = runMultipleSimulations(count);
      
      res.shoeStats.forEach(shoe => {
        logHandsToSql(shoe.shoeId, shoe.hands);
      });

      setSummary(res);
      setSqlStats(getSqlMetricsSummary());
      setIsRunning(false);
    }, 50);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {initError ? (
          <div className="bg-red-950/50 border border-red-800 rounded-xl p-6 text-center text-red-300">
            <h2 className="text-lg font-bold">Initialization Error</h2>
            <p className="text-sm mt-2">{initError}</p>
          </div>
        ) : !dbReady ? (
          <div className="flex items-center justify-center h-64 text-amber-400 font-medium">
            Initializing local SQLite WASM database...
          </div>
        ) : (
          <>
            <SimulationControls
              numShoes={numShoes}
              setNumShoes={setNumShoes}
              onRunSimulation={() => handleRunSimulation()}
              isRunning={isRunning}
            />

            <MetricsDashboard summary={summary} sqlStats={sqlStats} />

            {summary && summary.shoeStats.length > 0 && (
              <>
                <ShoeRoadmap shoeStats={summary.shoeStats} />
                <AiInsightsPanel shoeStats={summary.shoeStats} />
              </>
            )}
          </>
        )}
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 text-center py-4 text-xs text-slate-500">
        Baccarat Pro Simulation Engine • Powered by React, TypeScript, Vite & Local SQLite WASM
      </footer>
    </div>
  );
}

export default App;

