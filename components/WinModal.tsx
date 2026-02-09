
import React from 'react';
import { Player } from '../types';

interface WinModalProps {
  winner: Player;
  onClose: () => void;
  onNewGame: () => void;
}

const WinModal: React.FC<WinModalProps> = ({ winner, onClose, onNewGame }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-slate-800 w-full max-w-lg rounded-[3rem] border-4 border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.3)] p-12 text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 right-10 w-20 h-20 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="relative z-10">
          <div className="text-8xl mb-6">🏆</div>
          <h2 className="text-xs font-black tracking-[0.4em] uppercase text-emerald-400 mb-2">We Have A Victor</h2>
          <h1 className="text-5xl font-black mb-4" style={{ color: winner.color }}>{winner.name}</h1>
          <p className="text-3xl font-mono text-slate-300 mb-10">Score: {winner.score}</p>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={onNewGame}
              className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl text-xl font-black shadow-lg shadow-emerald-900/40 transition-all"
            >
              NEW MATCH
            </button>
            <button 
              onClick={onClose}
              className="w-full bg-slate-700 hover:bg-slate-600 py-3 rounded-2xl font-bold text-slate-300 transition-all"
            >
              KEEP PLAYING
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinModal;
