
import React, { useState } from 'react';
import { GameRules, Player, ScoreDirection } from '../types';
import { fetchGameRules } from '../geminiService';
import Avatar from './Avatar';

interface SetupViewProps {
  onStart: (rules: GameRules, players: Player[]) => void;
}

const PLAYER_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const SetupView: React.FC<SetupViewProps> = ({ onStart }) => {
  const [gameInput, setGameInput] = useState('');
  const [loadingRules, setLoadingRules] = useState(false);
  const [playerNames, setPlayerNames] = useState<string[]>(['Player 1', 'Player 2']);
  const [customRules, setCustomRules] = useState<GameRules | null>(null);

  const handleFetchRules = async () => {
    if (!gameInput) return;
    setLoadingRules(true);
    const rules = await fetchGameRules(gameInput);
    setCustomRules(rules);
    setLoadingRules(false);
  };

  const handleStart = () => {
    const rulesToUse: GameRules = customRules || {
      name: gameInput || "Custom Game",
      description: "Quick tracking game",
      winThreshold: null,
      scoreDirection: ScoreDirection.HIGH_WINS,
      suggestedIncrements: [1, 5, 10],
      isTurnBased: true,
      isTimed: false,
      defaultTimeSeconds: null,
      roundName: "Round"
    };

    const players: Player[] = playerNames
      .filter(n => n.trim() !== '')
      .map((name, i) => ({
        id: Math.random().toString(36).substr(2, 9),
        name,
        color: PLAYER_COLORS[i % PLAYER_COLORS.length],
        score: rulesToUse.scoreDirection === ScoreDirection.LOW_WINS && rulesToUse.winThreshold ? rulesToUse.winThreshold : 0,
        avatarSeed: Math.floor(Math.random() * 1000)
      }));

    onStart(rulesToUse, players);
  };

  const addPlayerField = () => setPlayerNames([...playerNames, `Player ${playerNames.length + 1}`]);
  const removePlayerField = (idx: number) => setPlayerNames(playerNames.filter((_, i) => i !== idx));

  return (
    <div className="w-full max-w-2xl bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2">
          GAME ARBITER
        </h1>
        <p className="text-slate-400">Define your arena. The arbiter will handle the rest.</p>
      </div>

      <div className="space-y-8">
        {/* Game Selection */}
        <section>
          <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Which game are we playing?</label>
          <div className="flex gap-2">
            <input 
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="e.g. Darts 501, Rummy, Catan..."
              value={gameInput}
              onChange={(e) => setGameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFetchRules()}
            />
            <button 
              onClick={handleFetchRules}
              disabled={loadingRules || !gameInput}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-6 rounded-xl font-bold transition-all flex items-center gap-2"
            >
              {loadingRules ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : "Fetch Rules"}
            </button>
          </div>
        </section>

        {/* AI Rule Summary */}
        {customRules && (
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-blue-500/30 animate-in fade-in slide-in-from-top-4 duration-500">
            <h3 className="text-xl font-bold text-blue-400 mb-2">{customRules.name}</h3>
            <p className="text-slate-400 text-sm mb-4">{customRules.description}</p>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-slate-800 p-2 rounded">WIN: {customRules.winThreshold || 'No limit'}</div>
              <div className="bg-slate-800 p-2 rounded">ORDER: {customRules.scoreDirection.replace('_', ' ')}</div>
              <div className="bg-slate-800 p-2 rounded">TURNS: {customRules.isTurnBased ? 'YES' : 'NO'}</div>
              <div className="bg-slate-800 p-2 rounded">ROUNDS: {customRules.roundName}</div>
            </div>
          </div>
        )}

        {/* Player Management */}
        <section>
          <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Who is entering the fray?</label>
          <div className="space-y-3">
            {playerNames.map((name, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <Avatar name={name} color={PLAYER_COLORS[idx % PLAYER_COLORS.length]} seed={idx * 123} size="md" />
                <input 
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={name}
                  onChange={(e) => {
                    const newNames = [...playerNames];
                    newNames[idx] = e.target.value;
                    setPlayerNames(newNames);
                  }}
                />
                {playerNames.length > 1 && (
                  <button onClick={() => removePlayerField(idx)} className="text-slate-500 hover:text-red-400 px-2 transition-colors">
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button 
              onClick={addPlayerField}
              className="w-full py-2 border-2 border-dashed border-slate-700 rounded-xl text-slate-500 hover:border-slate-500 hover:text-slate-400 transition-all font-bold"
            >
              + Add Player
            </button>
          </div>
        </section>

        <button 
          onClick={handleStart}
          disabled={playerNames.every(n => n.trim() === '')}
          className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl text-xl font-black shadow-lg shadow-emerald-900/20 transform hover:scale-[1.02] active:scale-95 transition-all"
        >
          BEGIN MATCH
        </button>
      </div>
    </div>
  );
};

export default SetupView;
