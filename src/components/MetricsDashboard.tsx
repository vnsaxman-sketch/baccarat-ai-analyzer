import type { SimulationSummary } from '../types/baccarat';

interface Props {
  summary: SimulationSummary | null;
  sqlStats: { totalPatternsStored: number; totalLogs: number };
}

export const MetricsDashboard: React.FC<Props> = ({ summary, sqlStats }) => {
  if (!summary) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        Click <span className="text-amber-400 font-semibold">"Run Simulation & Train AI"</span> above to generate statistical metrics.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Shoes / Hands"
          value={`${summary.totalShoes} Shoes`}
          subtitle={`${summary.totalHands.toLocaleString()} Hands (~${summary.avgHandsPerShoe.toFixed(1)} / shoe)`}
          accent="amber"
        />
        <MetricCard
          title="Banker / Player Wins"
          value={`${summary.bankerWins.toLocaleString()} / ${summary.playerWins.toLocaleString()}`}
          subtitle={`B: ${summary.bankerWinRate.toFixed(2)}% | P: ${summary.playerWinRate.toFixed(2)}%`}
          accent="red"
        />
        <MetricCard
          title="Tie Frequency"
          value={`${summary.ties.toLocaleString()}`}
          subtitle={`Tie Hit Rate: ${summary.tieRate.toFixed(2)}% (Exclusive of Streaks)`}
          accent="emerald"
        />
        <MetricCard
          title="B/P Switches / Shoe"
          value={`${summary.avgSwitchesPerShoe.toFixed(1)}`}
          subtitle={`SQLite Patterns: ${sqlStats.totalPatternsStored.toLocaleString()}`}
          accent="blue"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
          <span>Detailed Streak Analysis (Exclusive of Ties)</span>
          <span className="text-xs font-normal text-slate-400">Ties do not break B/P streaks</span>
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4 text-center">
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Streak 1 & 2</div>
            <div className="text-2xl font-black text-amber-400">{summary.streaks.streak1.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">
              {(summary.streaks.streak1 / Math.max(summary.totalHands, 1) * 100).toFixed(1)}% of total hands
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4 text-center">
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Streak 3 & 4</div>
            <div className="text-2xl font-black text-amber-400">{summary.streaks.streak34.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">
              {(summary.streaks.streak34 / Math.max(summary.totalHands, 1) * 100).toFixed(1)}% of total hands
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4 text-center">
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Streak 5 & 6</div>
            <div className="text-2xl font-black text-amber-400">{summary.streaks.streak56.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">
              {(summary.streaks.streak56 / Math.max(summary.totalHands, 1) * 100).toFixed(1)}% of total hands
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4 text-center">
            <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Streak 7+ (Long)</div>
            <div className="text-2xl font-black text-red-400">{summary.streaks.streak7Plus.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-1">
              {(summary.streaks.streak7Plus / Math.max(summary.totalHands, 1) * 100).toFixed(1)}% of total hands
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function MetricCard({ title, value, subtitle, accent }: { title: string; value: string; subtitle: string; accent: 'amber' | 'red' | 'emerald' | 'blue' }) {
  const accentColors = {
    amber: 'border-l-amber-500',
    red: 'border-l-red-500',
    emerald: 'border-l-emerald-500',
    blue: 'border-l-blue-500',
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg border-l-4 ${accentColors[accent]}`}>
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</div>
      <div className="text-2xl font-black text-white mt-1">{value}</div>
      <div className="text-xs text-slate-400 mt-1">{subtitle}</div>
    </div>
  );
}

