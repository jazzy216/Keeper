
import { GoogleGenAI, Type } from "@google/genai";
import { GameRules, ScoreDirection, Player, ScoreEntry } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const fetchGameRules = async (gameName: string): Promise<GameRules> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the scoring rules for the game: "${gameName}". 
    Provide technical scoring details including if high or low scores win, typical win thresholds, suggested increment buttons for a UI, and round terminology.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          description: { type: Type.STRING },
          winThreshold: { type: Type.NUMBER, nullable: true },
          scoreDirection: { type: Type.STRING, enum: ['HIGH_WINS', 'LOW_WINS'] },
          suggestedIncrements: { 
            type: Type.ARRAY, 
            items: { type: Type.NUMBER } 
          },
          isTurnBased: { type: Type.BOOLEAN },
          isTimed: { type: Type.BOOLEAN },
          defaultTimeSeconds: { type: Type.NUMBER, nullable: true },
          roundName: { type: Type.STRING }
        },
        required: ["name", "description", "scoreDirection", "suggestedIncrements", "isTurnBased", "isTimed", "roundName"]
      }
    }
  });

  try {
    const rules = JSON.parse(response.text || '{}');
    return {
      ...rules,
      scoreDirection: rules.scoreDirection === 'LOW_WINS' ? ScoreDirection.LOW_WINS : ScoreDirection.HIGH_WINS
    };
  } catch (e) {
    console.error("Failed to parse game rules", e);
    return {
      name: gameName,
      description: "Generic game tracking.",
      winThreshold: null,
      scoreDirection: ScoreDirection.HIGH_WINS,
      suggestedIncrements: [1, 5, 10],
      isTurnBased: true,
      isTimed: false,
      defaultTimeSeconds: null,
      roundName: "Round"
    };
  }
};

export interface PredictionResult {
  probabilities: { [playerName: string]: number };
  insight: string;
}

export const getComebackPrediction = async (
  rules: GameRules, 
  players: Player[], 
  history: ScoreEntry[]
): Promise<PredictionResult> => {
  const prompt = `Game: ${rules.name}. Win Condition: ${rules.winThreshold || 'N/A'}. 
  Score Direction: ${rules.scoreDirection}.
  Current Scores: ${players.map(p => `${p.name}: ${p.score}`).join(', ')}.
  Last 5 score events: ${history.slice(-5).map(h => `${h.value} pts`).join(', ')}.
  Act as a legendary sports commentator. Predict the probability of each player winning and provide a witty, strategic insight.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          probabilities: { 
            type: Type.OBJECT,
            description: "Map of player names to winning percentage (0-100)"
          },
          insight: { type: Type.STRING }
        },
        required: ["probabilities", "insight"]
      }
    }
  });

  return JSON.parse(response.text || '{"probabilities": {}, "insight": "The Arbiter is silent."}');
};
