export type Outcome = 'B' | 'P' | 'T';

export interface HandResult {
  handNumber: number;
  playerTotal: number;
  bankerTotal: number;
  playerThirdCard: number | null;
  bankerThirdCard: number | null;
  outcome: Outcome;
}

export interface ShoeStats {
  shoeId: number;
  totalHands: number;
  bankerWins: number;
  playerWins: number;
  ties: number;
  bankerPlayerSwitches: number;
  streaks: {
    streak1: number; // 1-2
    streak34: number; // 3-4
    streak56: number; // 5-6
    streak7Plus: number; // 7+
  };
  hands: HandResult[];
}

export interface SimulationSummary {
  totalShoes: number;
  totalHands: number;
  bankerWins: number;
  playerWins: number;
  ties: number;
  bankerWinRate: number;
  playerWinRate: number;
  tieRate: number;
  avgHandsPerShoe: number;
  avgSwitchesPerShoe: number;
  streaks: {
    streak1: number;
    streak34: number;
    streak56: number;
    streak7Plus: number;
  };
  shoeStats: ShoeStats[];
}

export type AiStrategyRecommendation = {
  suggestedBet: 'Banker' | 'Player' | 'Pass';
  confidence: number; // 0 to 100
  reasoning: string;
  historicalHitRate: number;
};

