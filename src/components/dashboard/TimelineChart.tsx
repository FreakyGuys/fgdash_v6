"use client";

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TimelineChartProps {
  title: string;
  data: Array<{
    date: string;
    value: number;
  }>;
  color?: string;
  height?: number;
  showControls?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  legendName?: string;
}

const TimelineChart: React.FC<TimelineChartProps> = ({
  title,
  data,
  color = '#FFDD00',
  height = 300,
  showControls = true,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  legendName = 'Valor'
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeRange, setTimeRange] = useState('30d'); // '7d', '30d', '90d', 'all'

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Filtrar dados com base no intervalo de tempo selecionado
  const getFilteredData = () => {
    if (timeRange === 'all') return data;
    
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const cutoffDate = new Date(now.setDate(now.getDate() - days));
    
    return data.filter(item => {
      // Assumindo que 'date' é uma string que pode ser convertida em data
      // Na implementação real, isso dependeria do formato exato da data
      return new Date(item.date) >= cutoffDate;
    });
  };

  const filteredData = getFilteredData();

  return (
    <div className={`bg-black/70 backdrop-blur-md border border-yellow-freaky/20 rounded-lg p-4 shadow-lg ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-sm font-medium">{title}</h3>
        {showControls && (
          <div className="flex space-x-2 items-center">
            <div className="flex bg-black/50 backdrop-blur-sm rounded-md overflow-hidden border border-gray-800/30">
              <button 
                className={`px-2 py-1 text-xs ${timeRange === '7d' ? 'bg-yellow-freaky text-black-freaky' : 'text-gray-400 hover:bg-gray-800/30 hover:text-white'}`}
                onClick={() => setTimeRange('7d')}
              >
                7D
              </button>
              <button 
                className={`px-2 py-1 text-xs ${timeRange === '30d' ? 'bg-yellow-freaky text-black-freaky' : 'text-gray-400 hover:bg-gray-800/30 hover:text-white'}`}
                onClick={() => setTimeRange('30d')}
              >
                30D
              </button>
              <button 
                className={`px-2 py-1 text-xs ${timeRange === '90d' ? 'bg-yellow-freaky text-black-freaky' : 'text-gray-400 hover:bg-gray-800/30 hover:text-white'}`}
                onClick={() => setTimeRange('90d')}
              >
                90D
              </button>
              <button 
                className={`px-2 py-1 text-xs ${timeRange === 'all' ? 'bg-yellow-freaky text-black-freaky' : 'text-gray-400 hover:bg-gray-800/30 hover:text-white'}`}
                onClick={() => setTimeRange('all')}
              >
                Todos
              </button>
            </div>
            <button 
              className="text-gray-light hover:text-yellow-freaky"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
            </button>
            <button className="text-gray-light hover:text-yellow-freaky">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        )}
      </div>
      <div style={{ height: isFullscreen ? 'calc(100vh - 120px)' : height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={filteredData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#333333" />}
            <XAxis 
              dataKey="date" 
              stroke="#333333" 
              tick={{ fill: '#CCCCCC', fontSize: 12 }}
              tickLine={{ stroke: '#333333' }}
            />
            <YAxis 
              stroke="#333333" 
              tick={{ fill: '#CCCCCC', fontSize: 12 }}
              tickLine={{ stroke: '#333333' }}
            />
            {showTooltip && (
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#000000', 
                  borderColor: '#FFDD00',
                  color: '#FFFFFF'
                }}
                labelStyle={{ color: '#FFDD00' }}
                itemStyle={{ color: '#FFFFFF' }}
              />
            )}
            {showLegend && (
              <Legend 
                verticalAlign="top" 
                height={36}
                wrapperStyle={{ color: '#FFFFFF' }}
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              name={legendName}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3, fill: color, stroke: color }}
              activeDot={{ r: 5, fill: color, stroke: '#FFFFFF' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TimelineChart;
