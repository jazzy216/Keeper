
import React, { useState, useEffect, useRef } from 'react';
import { GameState, ScoreDirection, Player } from '../types';
import ScoreProgressionChart from './ScoreProgressionChart';
import Avatar from './Avatar';
import { getComebackPrediction, PredictionResult } from '../geminiService';

interface DashboardProps {
  gameState: GameState;
  onAddScore: (playerId: string, value: number) => void;
  onUndo: () => void;
  onReset: () => void;
  onToggleTimer: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ gameState, onAddScore, onUndo, onReset, onToggleTimer }) => {
  const { players, rules, currentTurnIndex, currentRound, history, timerSeconds, timerActive } = gameState;
  const currentPlayer = players[currentTurnIndex];
  const [manualValue, setManualValue] = useState('');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  // Timer Formatting
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Comeback Predictor
  const handlePredict = async () => {
    setLoadingPrediction(true);
    try {
      const res = await getComebackPrediction(rules, players, history);
      setPrediction(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPrediction(false);
    }
  };

  // Voice Control
  useEffect(() => {
    let recognition: any = null;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition && isVoiceActive) {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        console.log("Voice Input:", transcript);
        
        // Simple logic: "[Name] plus [X]" or "[Name] add [X]"
        players.forEach(p => {
          const nameMatch = transcript.includes(p.name.toLowerCase());
          if (nameMatch) {
            const numbers = transcript.match(/\d+/);
            if (numbers) {
              onAddScore(p.id, parseInt(numbers[0]));
            }
          }
        });
      };

      recognition.start();
    }

    return () => {
      if (recognition) recognition.stop();
    };
  }, [isVoiceActive, players, onAddScore]);

  const handleManualAdd = () => {
    const val = parseInt(manualValue);
    if (!isNaN(val)) {
      onAddScore(currentPlayer.id, val);
      setManualValue('');
    }
  };

  const sortedPlayers = [...players].sort((a, b) => 
    rules.scoreDirection === ScoreDirection.HIGH_WINS ? b.score - a.score : a.score - b.score
  );

  return (
    <div className="w-full max-w-6xl flex flex-col gap-6 animate-in fade-in duration-700">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-slate-800 p-6 rounded-3xl border border-slate-700 gap-4 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="text-xs font-bold text-slate-500 uppercase block">Game</span>
            <span className="text-2xl font-black text-blue-400">{rules.name}</span>
          </div>
          <div className="h-10 w-px bg-slate-700" />
          <div className="text-center">
            <span className="text-xs font-bold text-slate-500 uppercase block">{rules.roundName}</span>
            <span className="text-2xl font-black text-slate-200">{currentRound}</span>
          </div>
          <div className="h-10 w-px bg-slate-700" />
          <button 
            onClick={onToggleTimer}
            className={`flex flex-col items-center justify-center px-4 rounded-xl transition-all ${timerActive ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <span className="text-[10px] font-black uppercase">Timer</span>
            <span className="text-2xl font-mono font-bold">{formatTime(timerSeconds)}</span>
          </button>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setIsVoiceActive(!isVoiceActive)}
            className={`px-4 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${isVoiceActive ? 'bg-red-500 animate-pulse' : 'bg-slate-700 hover:bg-slate-600'}`}
          >
            {isVoiceActive ? 'Listening...' : '🎤 Voice Mode'}
          </button>
          <button 
            onClick={onUndo} 
            disabled={history.length === 0}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded-full text-sm font-bold transition-all"
          >
            Undo
          </button>
          <button 
            onClick={onReset} 
            className="px-6 py-2 bg-red-900/40 text-red-400 hover:bg-red-800/40 rounded-full text-sm font-bold transition-all"
          >
            Exit Game
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Leaderboard */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Standings</h2>
            <button 
                onClick={handlePredict}
                disabled={loadingPrediction || history.length < 2}
                className="text-[10px] bg-blue-600/20 text-blue-400 border border-blue-500/30 px-2 py-1 rounded hover:bg-blue-600 hover:text-white transition-all font-bold"
            >
                {loadingPrediction ? 'Analyzing...' : 'Comeback Prediction'}
            </button>
          </div>

          {prediction && (
            <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-2xl animate-in slide-in-from-left duration-500">
               <p className="text-xs font-mono text-blue-300 italic mb-2">"{prediction.insight}"</p>
               <div className="flex gap-2 flex-wrap">
                  {Object.entries(prediction.probabilities).map(([name, prob]) => (
                    <div key={name} className="bg-slate-900 px-2 py-1 rounded text-[10px] font-bold">
                        {name}: {prob}%
                    </div>
                  ))}
               </div>
            </div>
          )}

          {sortedPlayers.map((p, idx) => (
            <div 
              key={p.id} 
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                p.id === currentPlayer.id ? 'bg-blue-600/10 border-blue-500 shadow-lg shadow-blue-500/10' : 'bg-slate-800/40 border-slate-700'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-slate-500 font-mono text-xl">#{idx + 1}</span>
                <Avatar name={p.name} color={p.color} seed={p.avatarSeed} />
                <div>
                  <p className="font-bold text-lg">{p.name}</p>
                  {p.id === currentPlayer.id && (
                    <span className="text-[10px] font-bold bg-blue-500 px-2 py-0.5 rounded text-white uppercase tracking-tighter">Current Turn</span>
                  )}
                </div>
              </div>
              <p className="text-3xl font-black text-slate-100">{p.score}</p>
            </div>
          ))}
        </div>

        {/* Right Column: Active Controls & History */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: currentPlayer.color }} />
            <div className="text-center mb-8">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Update Score For</span>
              <div className="flex flex-col items-center mt-2">
                <Avatar name={currentPlayer.name} color={currentPlayer.color} seed={currentPlayer.avatarSeed} size="lg" />
                <h2 className="text-4xl font-black mt-4" style={{ color: currentPlayer.color }}>{currentPlayer.name}</h2>
              </div>
              <div className="text-5xl font-mono text-slate-300 mt-2">{currentPlayer.score}</div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {rules.suggestedIncrements.map(inc => (
                <button 
                  key={inc}
                  onClick={() => onAddScore(currentPlayer.id, inc)}
                  className="py-6 rounded-2xl bg-slate-700 hover:bg-slate-600 active:scale-95 transition-all text-2xl font-black"
                >
                  +{inc}
                </button>
              ))}
            </div>

            <div className="flex gap-2 p-2 bg-slate-900 rounded-2xl">
              <input 
                type="number" 
                placeholder="Manual entry..."
                className="bg-transparent text-xl font-bold p-4 flex-1 outline-none"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()}
              />
              <button 
                onClick={handleManualAdd}
                className="bg-emerald-600 hover:bg-emerald-500 px-8 rounded-xl font-bold transition-all"
              >
                Add
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700">
               <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Progression</h3>
               <ScoreProgressionChart gameState={gameState} />
             </div>
             
             <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 flex flex-col">
               <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Recent Plays</h3>
               <div className="flex-1 overflow-y-auto max-h-[300px] space-y-2 pr-2">
                 {history.length === 0 ? (
                   <div className="text-slate-600 text-center py-10 italic">No history yet</div>
                 ) : (
                   history.slice().reverse().map(entry => {
                     const p = players.find(player => player.id === entry.playerId);
                     return (
                       <div key={entry.id} className="flex justify-between items-center bg-slate-900/40 p-3 rounded-xl border border-slate-700/50">
                         <div className="flex items-center gap-3">
                           <Avatar name={p?.name || '?'} color={p?.color || '#ccc'} seed={p?.avatarSeed || 0} size="sm" />
                           <span className="font-bold text-sm">{p?.name}</span>
                         </div>
                         <div className="flex items-center gap-3">
                           <span className="text-emerald-400 font-mono font-bold">+{entry.value}</span>
                           <span className="text-[10px] text-slate-600 font-mono">{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                         </div>
                       </div>
                     );
                   })
                 )}
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
