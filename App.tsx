
import React, { useState, useEffect, useCallback } from 'react';
import { GameRules, Player, GameState, ScoreEntry, ScoreDirection } from './types';
import SetupView from './components/SetupView';
import Dashboard from './components/Dashboard';
import WinModal from './components/WinModal';

const App: React.FC = () => {
  const [view, setView] = useState<'SETUP' | 'GAME'>('SETUP');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);

  // Timer logic
  useEffect(() => {
    let interval: number;
    if (gameState?.timerActive && !gameState.isGameOver) {
      interval = window.setInterval(() => {
        setGameState(prev => {
          if (!prev) return null;
          return { ...prev, timerSeconds: prev.timerSeconds + 1 };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState?.timerActive, gameState?.isGameOver]);

  const startGame = (rules: GameRules, players: Player[]) => {
    setGameState({
      players,
      rules,
      history: [],
      currentTurnIndex: 0,
      currentRound: 1,
      isGameOver: false,
      timerSeconds: 0,
      timerActive: false,
    });
    setView('GAME');
    setWinner(null);
  };

  const addScore = (playerId: string, value: number) => {
    if (!gameState || gameState.isGameOver) return;

    const newHistory: ScoreEntry = {
      id: Math.random().toString(36).substr(2, 9),
      playerId,
      value,
      timestamp: Date.now(),
      round: gameState.currentRound,
    };

    const updatedPlayers = gameState.players.map(p => 
      p.id === playerId ? { ...p, score: p.score + value } : p
    );

    let nextTurn = gameState.currentTurnIndex + 1;
    let nextRound = gameState.currentRound;
    if (nextTurn >= updatedPlayers.length) {
      nextTurn = 0;
      nextRound += 1;
    }

    setGameState({
      ...gameState,
      players: updatedPlayers,
      history: [...gameState.history, newHistory],
      currentTurnIndex: nextTurn,
      currentRound: nextRound,
    });

    // Check win condition
    const currentPlayer = updatedPlayers.find(p => p.id === playerId);
    if (currentPlayer && gameState.rules.winThreshold !== null) {
      const threshold = gameState.rules.winThreshold;
      const hasWon = gameState.rules.scoreDirection === ScoreDirection.HIGH_WINS 
        ? currentPlayer.score >= threshold 
        : currentPlayer.score <= threshold;
      
      if (hasWon) {
        setWinner(currentPlayer);
        setGameState(prev => prev ? { ...prev, isGameOver: true, timerActive: false } : null);
      }
    }
  };

  const undoLast = () => {
    if (!gameState || gameState.history.length === 0) return;

    const lastEntry = gameState.history[gameState.history.length - 1];
    const updatedPlayers = gameState.players.map(p => 
      p.id === lastEntry.playerId ? { ...p, score: p.score - lastEntry.value } : p
    );

    let prevTurn = gameState.currentTurnIndex - 1;
    let prevRound = gameState.currentRound;
    if (prevTurn < 0) {
      prevTurn = updatedPlayers.length - 1;
      prevRound = Math.max(1, prevRound - 1);
    }

    setGameState({
      ...gameState,
      players: updatedPlayers,
      history: gameState.history.slice(0, -1),
      currentTurnIndex: prevTurn,
      currentRound: prevRound,
      isGameOver: false
    });
    setWinner(null);
  };

  const toggleTimer = () => {
    setGameState(prev => prev ? { ...prev, timerActive: !prev.timerActive } : null);
  };

  const resetGame = () => {
    setView('SETUP');
    setGameState(null);
    setWinner(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8">
      {view === 'SETUP' && (
        <SetupView onStart={startGame} />
      )}
      
      {view === 'GAME' && gameState && (
        <Dashboard 
          gameState={gameState} 
          onAddScore={addScore} 
          onUndo={undoLast}
          onReset={resetGame}
          onToggleTimer={toggleTimer}
        />
      )}

      {winner && (
        <WinModal 
          winner={winner} 
          onClose={() => setWinner(null)} 
          onNewGame={resetGame} 
        />
      )}
    </div>
  );
};

export default App;
