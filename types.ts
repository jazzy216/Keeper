
export enum ScoreDirection {
  HIGH_WINS = 'HIGH_WINS',
  LOW_WINS = 'LOW_WINS'
}

export interface GameRules {
  name: string;
  description: string;
  winThreshold: number | null;
  scoreDirection: ScoreDirection;
  suggestedIncrements: number[];
  isTurnBased: boolean;
  isTimed: boolean;
  defaultTimeSeconds: number | null;
  roundName: string; 
}

export interface Player {
  id: string;
  name: string;
  color: string;
  score: number;
  avatarSeed: number;
}

export interface ScoreEntry {
  id: string;
  playerId: string;
  value: number;
  timestamp: number;
  round: number;
}

export interface GameState {
  players: Player[];
  rules: GameRules;
  history: ScoreEntry[];
  currentTurnIndex: number;
  currentRound: number;
  isGameOver: boolean;
  timerSeconds: number;
  timerActive: boolean;
}
