import type { HandResult, AiStrategyRecommendation } from '../types/baccarat';

interface PatternRecord {
  patternKey: string;
  bankerNext: number;
  playerNext: number;
  totalCount: number;
  hitRate: number;
}

interface SimulationLogRecord {
  shoeId: number;
  handNumber: number;
  outcome: string;
  switchOccurred: number;
}

// Local In-Memory Relational Database Mock (Replacing SQLite WASM to prevent Vite crash)
class LocalMemoryDb {
  private patterns: Map<string, PatternRecord> = new Map();
  private logs: SimulationLogRecord[] = [];

  public run(sqlQuery: string, params?: any[]) {
    // Handle table creation gracefully
    if (sqlQuery.includes('CREATE TABLE')) return;

    // Handle Pattern upsert
    if (sqlQuery.includes('INSERT INTO pattern_frequencies')) {
      const pKey = params?.[0];
      if (!pKey) return;

      let existing = this.patterns.get(pKey);
      if (!existing) {
        existing = { patternKey: pKey, bankerNext: 0, playerNext: 0, totalCount: 0, hitRate: 0 };
        this.patterns.set(pKey, existing);
      }
      // Check query string for increments
      const isBankerNext = sqlQuery.includes('banker_next + 1');
      const isPlayerNext = sqlQuery.includes('player_next + 1');

      if (isBankerNext) existing.bankerNext++;
      if (isPlayerNext) existing.playerNext++;
      existing.totalCount++;
      existing.hitRate = existing.bankerNext >= existing.playerNext
        ? (existing.bankerNext / existing.totalCount) * 100
        : (existing.playerNext / existing.totalCount) * 100;
    }
  }

  public prepare(sqlQuery: string) {
    const self = this;
    return {
      run(values: any[]) {
        if (sqlQuery.includes('simulation_logs')) {
          self.logs.push({
            shoeId: values[0],
            handNumber: values[1],
            outcome: values[2],
            switchOccurred: values[3],
          });
        }
      },
      free() {}
    };
  }

  public exec(sqlQuery: string): { values: any[][] }[] {
    if (sqlQuery.includes('pattern_frequencies WHERE pattern_key')) {
      // Extract pattern key from query string quote
      const match = sqlQuery.match(/'([^']+)'/);
      if (match && match[1]) {
        const key = match[1];
        const record = this.patterns.get(key);
        if (record) {
          return [{ values: [[record.bankerNext, record.playerNext, record.totalCount, record.hitRate]] }];
        }
      }
      return [];
    }

    if (sqlQuery.includes('COUNT(*) FROM pattern_frequencies')) {
      return [{ values: [[this.patterns.size]] }];
    }

    if (sqlQuery.includes('COUNT(*) FROM simulation_logs')) {
      return [{ values: [[this.logs.length]] }];
    }

    return [];
  }
}

const db = new LocalMemoryDb();
let isInitialized = false;

export async function initLocalSqlDb(): Promise<void> {
  if (isInitialized) return;
  // Simulate instant local async DB connection handshake
  await new Promise(resolve => setTimeout(resolve, 20));
  isInitialized = true;
}

export function logHandsToSql(shoeId: number, hands: HandResult[]) {
  if (!isInitialized) return;
  try {
    let lastOutcome: string | null = null;
    const stmt = db.prepare("INSERT INTO simulation_logs (shoe_id, hand_number, outcome, switch_occurred) VALUES (?, ?, ?, ?)");
    
    hands.forEach((h) => {
      let switchOccurred = 0;
      if (h.outcome !== 'T') {
        if (lastOutcome && lastOutcome !== h.outcome) {
          switchOccurred = 1;
        }
        lastOutcome = h.outcome;
      }
      stmt.run([shoeId, h.handNumber, h.outcome, switchOccurred]);
    });
    stmt.free();

    const outcomes = hands.filter(h => h.outcome !== 'T').map(h => h.outcome);
    for (let i = 0; i < outcomes.length - 3; i++) {
      const pKey = `${outcomes[i]}${outcomes[i+1]}${outcomes[i+2]}`;
      const nextOutcome = outcomes[i+3];
      
      db.run(`
        INSERT INTO pattern_frequencies (pattern_key, banker_next, player_next, total_count)
        VALUES (?, ?, ?, 1)
        ON CONFLICT(pattern_key) DO UPDATE SET
          banker_next = banker_next + ${nextOutcome === 'B' ? 1 : 0},
          player_next = player_next + ${nextOutcome === 'P' ? 1 : 0},
          total_count = total_count + 1,
          hit_rate = CASE WHEN banker_next >= player_next THEN (CAST(banker_next + ${nextOutcome === 'B' ? 1 : 0} AS REAL) / (total_count + 1)) * 100 
                          ELSE (CAST(player_next + ${nextOutcome === 'P' ? 1 : 0} AS REAL) / (total_count + 1)) * 100 END
      `, [pKey]);
    }
  } catch (e) {
    console.error("Error logging hands to local DB:", e);
  }
}

export function getAiRecommendation(currentHands: HandResult[]): AiStrategyRecommendation {
  if (!isInitialized || currentHands.length < 3) {
    return {
      suggestedBet: 'Banker',
      confidence: 50,
      reasoning: 'Insufficient hand history for pattern matching (Needs at least 3 non-tie hands).',
      historicalHitRate: 50.0
    };
  }

  const validHands = currentHands.filter(h => h.outcome !== 'T');
  if (validHands.length < 3) {
    return {
      suggestedBet: 'Banker',
      confidence: 50,
      reasoning: 'Accumulating non-tie outcomes for frequency lookup...',
      historicalHitRate: 50.0
    };
  }

  const last3 = validHands.slice(-3).map(h => h.outcome).join('');
  
  try {
    const res = db.exec(`SELECT banker_next, player_next, total_count, hit_rate FROM pattern_frequencies WHERE pattern_key = '${last3}'`);
    if (res.length > 0 && res[0].values.length > 0) {
      const [bankerNext, playerNext, totalCount, hitRate] = res[0].values[0] as [number, number, number, number];
      
      if (totalCount < 5) {
        return {
          suggestedBet: 'Banker',
          confidence: 52,
          reasoning: `Pattern [${last3}] found in local memory DB with low sample size (${totalCount}). Defaulting to standard Banker bias.`,
          historicalHitRate: 50.68
        };
      }

      const suggested = bankerNext >= playerNext ? 'Banker' : 'Player';
      const conf = Math.min(Math.round(hitRate), 95);

      return {
        suggestedBet: suggested,
        confidence: conf,
        reasoning: `Local DB Pattern Match [${last3}]: Banker Next (${bankerNext}) vs Player Next (${playerNext}) over ${totalCount} historical occurrences.`,
        historicalHitRate: hitRate
      };
    }
  } catch (e) {
    console.error('Database query error:', e);
  }

  return {
    suggestedBet: 'Banker',
    confidence: 50,
    reasoning: `Pattern [${last3}] not present in local training index. Using baseline probability.`,
    historicalHitRate: 50.68
  };
}

export function getSqlMetricsSummary() {
  if (!isInitialized) return { totalPatternsStored: 0, totalLogs: 0 };
  try {
    const pRes = db.exec("SELECT COUNT(*) FROM pattern_frequencies");
    const lRes = db.exec("SELECT COUNT(*) FROM simulation_logs");
    return {
      totalPatternsStored: (pRes[0]?.values[0]?.[0] as number) || 0,
      totalLogs: (lRes[0]?.values[0]?.[0] as number) || 0
    };
  } catch {
    return { totalPatternsStored: 0, totalLogs: 0 };
  }
}

