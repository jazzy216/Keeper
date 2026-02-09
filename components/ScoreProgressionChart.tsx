
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GameState } from '../types';

interface ChartProps {
  gameState: GameState;
}

const ScoreProgressionChart: React.FC<ChartProps> = ({ gameState }) => {
  const chartData = useMemo(() => {
    // Process history to get snapshot of scores after each entry
    const data: any[] = [{ name: 'Start' }];
    gameState.players.forEach(p => { data[0][p.name] = 0; });

    let currentScores: { [key: string]: number } = {};
    gameState.players.forEach(p => { currentScores[p.id] = 0; });

    gameState.history.forEach((entry, idx) => {
      currentScores[entry.playerId] += entry.value;
      const point: any = { name: `P${idx + 1}` };
      gameState.players.forEach(p => {
        point[p.name] = currentScores[p.id];
      });
      data.push(point);
    });

    return data;
  }, [gameState.history, gameState.players]);

  if (gameState.history.length === 0) {
    return <div className="h-48 flex items-center justify-center text-slate-600 italic">Play some rounds to see the chart</div>;
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" hide />
          <YAxis stroke="#94a3b8" fontSize={10} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
          />
          {gameState.players.map(p => (
            <Line 
              key={p.id} 
              type="monotone" 
              dataKey={p.name} 
              stroke={p.color} 
              strokeWidth={3} 
              dot={false}
              animationDuration={500}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreProgressionChart;
