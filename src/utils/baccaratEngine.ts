import type { HandResult, Outcome, ShoeStats, SimulationSummary } from '../types/baccarat';

interface Card {
  suit: 'S' | 'H' | 'D' | 'C';
  value: number; 
}

export function createDeck(numDecks: number = 8): Card[] {
  const suits: ('S' | 'H' | 'D' | 'C')[] = ['S', 'H', 'D', 'C'];
  const deck: Card[] = [];
  for (let d = 0; d < numDecks; d++) {
    for (const suit of suits) {
      for (let v = 1; v <= 13; v++) {
        deck.push({ suit, value: v });
      }
    }
  }
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function getBaccaratValue(cardValue: number): number {
  if (cardValue >= 10) return 0;
  return cardValue;
}

export function calculateHandTotal(cards: Card[]): number {
  const sum = cards.reduce((acc, c) => acc + getBaccaratValue(c.value), 0);
  return sum % 10;
}

export function simulateShoe(shoeId: number): ShoeStats {
  const shoe = createDeck(8);
  
  const firstCard = shoe.pop()!;
  const burnCount = firstCard.value >= 10 ? 10 : firstCard.value;
  for (let b = 0; b < burnCount; b++) {
    if (shoe.length === 0) break;
    shoe.pop();
  }

  const cutCardIndex = Math.floor(Math.random() * 3) + 14; 
  const hands: HandResult[] = [];
  let handNumber = 1;

  while (shoe.length > cutCardIndex) {
    if (shoe.length < 6) break;

    const pCard1 = shoe.pop()!;
    const bCard1 = shoe.pop()!;
    const pCard2 = shoe.pop()!;
    const bCard2 = shoe.pop()!;

    const pInitialCards = [pCard1, pCard2];
    const bInitialCards = [bCard1, bCard2];

    let pTotal = calculateHandTotal(pInitialCards);
    let bTotal = calculateHandTotal(bInitialCards);

    let pThirdCard: Card | null = null;
    let bThirdCard: Card | null = null;

    const isNatural = pTotal >= 8 || bTotal >= 8;

    if (!isNatural) {
      let playerDrawnValue = -1;
      if (pTotal <= 5) {
        pThirdCard = shoe.pop()!;
        playerDrawnValue = getBaccaratValue(pThirdCard.value);
        pInitialCards.push(pThirdCard);
        pTotal = calculateHandTotal(pInitialCards);
      }

      if (pThirdCard === null) {
        if (bTotal <= 5) {
          bThirdCard = shoe.pop()!;
          bInitialCards.push(bThirdCard);
          bTotal = calculateHandTotal(bInitialCards);
        }
      } else {
        let bankerShouldDraw = false;
        switch (bTotal) {
          case 0:
          case 1:
          case 2:
            bankerShouldDraw = true;
            break;
          case 3:
            bankerShouldDraw = playerDrawnValue !== 8;
            break;
          case 4:
            bankerShouldDraw = playerDrawnValue >= 2 && playerDrawnValue <= 7;
            break;
          case 5:
            bankerShouldDraw = playerDrawnValue >= 4 && playerDrawnValue <= 7;
            break;
          case 6:
            bankerShouldDraw = playerDrawnValue === 6 || playerDrawnValue === 7;
            break;
          case 7:
            bankerShouldDraw = false;
            break;
        }

        if (bankerShouldDraw) {
          bThirdCard = shoe.pop()!;
          bInitialCards.push(bThirdCard);
          bTotal = calculateHandTotal(bInitialCards);
        }
      }
    }

    let outcome: Outcome = 'T';
    if (pTotal > bTotal) outcome = 'P';
    else if (bTotal > pTotal) outcome = 'B';

    hands.push({
      handNumber: handNumber++,
      playerTotal: pTotal,
      bankerTotal: bTotal,
      playerThirdCard: pThirdCard ? getBaccaratValue(pThirdCard.value) : null,
      bankerThirdCard: bThirdCard ? getBaccaratValue(bThirdCard.value) : null,
      outcome,
    });
  }

  let bankerWins = 0;
  let playerWins = 0;
  let ties = 0;
  let bankerPlayerSwitches = 0;

  const streakCounts = {
    streak1: 0,
    streak34: 0,
    streak56: 0,
    streak7Plus: 0,
  };

  let currentStreakOutcome: 'B' | 'P' | null = null;
  let currentStreakLength = 0;
  let lastNonTieOutcome: 'B' | 'P' | null = null;

  for (const h of hands) {
    if (h.outcome === 'B') bankerWins++;
    else if (h.outcome === 'P') playerWins++;
    else ties++;

    if (h.outcome !== 'T') {
      if (lastNonTieOutcome !== null && lastNonTieOutcome !== h.outcome) {
        bankerPlayerSwitches++;
      }
      lastNonTieOutcome = h.outcome;

      if (currentStreakOutcome === h.outcome) {
        currentStreakLength++;
      } else {
        if (currentStreakLength > 0) {
          recordStreak(currentStreakLength, streakCounts);
        }
        currentStreakOutcome = h.outcome;
        currentStreakLength = 1;
      }
    }
  }

  if (currentStreakLength > 0) {
    recordStreak(currentStreakLength, streakCounts);
  }

  return {
    shoeId,
    totalHands: hands.length,
    bankerWins,
    playerWins,
    ties,
    bankerPlayerSwitches,
    streaks: streakCounts,
    hands,
  };
}

function recordStreak(len: number, counts: { streak1: number; streak34: number; streak56: number; streak7Plus: number }) {
  if (len === 1 || len === 2) {
    counts.streak1++;
  } else if (len === 3 || len === 4) {
    counts.streak34++;
  } else if (len === 5 || len === 6) {
    counts.streak56++;
  } else if (len >= 7) {
    counts.streak7Plus++;
  }
}

export function runMultipleSimulations(numShoes: number): SimulationSummary {
  const shoeStats: ShoeStats[] = [];
  let totalHands = 0;
  let bankerWins = 0;
  let playerWins = 0;
  let ties = 0;
  let avgSwitchesPerShoeSum = 0;

  const streaks = {
    streak1: 0,
    streak34: 0,
    streak56: 0,
    streak7Plus: 0,
  };

  for (let i = 1; i <= numShoes; i++) {
    const s = simulateShoe(i);
    shoeStats.push(s);
    totalHands += s.totalHands;
    bankerWins += s.bankerWins;
    playerWins += s.playerWins;
    ties += s.ties;
    avgSwitchesPerShoeSum += s.bankerPlayerSwitches;

    streaks.streak1 += s.streaks.streak1;
    streaks.streak34 += s.streaks.streak34;
    streaks.streak56 += s.streaks.streak56;
    streaks.streak7Plus += s.streaks.streak7Plus;
  }

  return {
    totalShoes: numShoes,
    totalHands,
    bankerWins,
    playerWins,
    ties,
    bankerWinRate: totalHands > 0 ? (bankerWins / (bankerWins + playerWins)) * 100 : 0,
    playerWinRate: totalHands > 0 ? (playerWins / (bankerWins + playerWins)) * 100 : 0,
    tieRate: totalHands > 0 ? (ties / totalHands) * 100 : 0,
    avgHandsPerShoe: numShoes > 0 ? totalHands / numShoes : 0,
    avgSwitchesPerShoe: numShoes > 0 ? avgSwitchesPerShoeSum / numShoes : 0,
    streaks,
    shoeStats,
  };
}

