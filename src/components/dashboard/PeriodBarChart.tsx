"use client";

import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

interface PeriodBarChartProps {
  title: string;
  data: Array<{
    period: string;
    value: number;
  }>;
  color?: string;
  height?: number;
  showControls?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  layout?: 'vertical' | 'horizontal';
}

const PeriodBarChart: React.FC<PeriodBarChartProps> = ({
  title,
  data,
  color = '#FFDD00',
  height = 300,
  showControls = true,
  showGrid = true,
  showTooltip = true,
  layout = 'vertical'
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sortBy, setSortBy] = useState<'period' | 'value'>('period');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleSort = () => {
    if (sortBy === 'period') {
      setSortBy('value');
      setSortDirection('desc');
    } else {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortBy('period');
        setSortDirection('asc');
      }
    }
  };

  // Ordenar dados com base nas preferências do usuário
  const sortedData = [...data].sort((a, b) => {
    if (sortBy === 'period') {
      return sortDirection === 'asc' 
        ? a.period.localeCompare(b.period) 
        : b.period.localeCompare(a.period);
    } else {
      return sortDirection === 'asc' 
        ? a.value - b.value 
        : b.value - a.value;
    }
  });

  // Encontrar o valor máximo para dimensionar o gráfico
  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div className={`bg-black/70 backdrop-blur-md border border-yellow-freaky/20 rounded-lg p-4 shadow-lg ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-sm font-medium">{title}</h3>
        {showControls && (
          <div className="flex space-x-2">
            <button 
              className="text-gray-light hover:text-yellow-freaky"
              onClick={toggleSort}
              title={`Ordenar por ${sortBy === 'period' ? 'período' : 'valor'} (${sortDirection === 'asc' ? 'crescente' : 'decrescente'})`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            </button>
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
          {layout === 'vertical' ? (
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{
                top: 5,
                right: 30,
                left: 40,
                bottom: 5,
              }}
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#333333" horizontal={false} />}
              <XAxis 
                type="number" 
                stroke="#333333" 
                tick={{ fill: '#CCCCCC', fontSize: 12 }}
                tickLine={{ stroke: '#333333' }}
                domain={[0, maxValue * 1.1]} // Adicionar 10% de espaço para melhor visualização
              />
              <YAxis 
                type="category" 
                dataKey="period" 
                stroke="#333333" 
                tick={{ fill: '#CCCCCC', fontSize: 12 }}
                tickLine={{ stroke: '#333333' }}
                width={60}
              />
              {showTooltip && (
                <Tooltip
                  formatter={(value: number) => [`${value}`, 'Valor']}
                  contentStyle={{ 
                    backgroundColor: '#000000', 
                    borderColor: '#FFDD00',
                    color: '#FFFFFF'
                  }}
                  labelStyle={{ color: '#FFDD00' }}
                  itemStyle={{ color: '#FFFFFF' }}
                />
              )}
              <Bar 
                dataKey="value" 
                fill={color} 
                radius={[0, 4, 4, 0]}
                barSize={20}
                animationDuration={1000}
              >
                <LabelList 
                  dataKey="value" 
                  position="right" 
                  fill="#FFFFFF" 
                  fontSize={12}
                  formatter={(value: number) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                />
              </Bar>
            </BarChart>
          ) : (
            <BarChart
              data={sortedData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 30,
              }}
            >
              {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#333333" vertical={false} />}
              <XAxis 
                dataKey="period" 
                stroke="#333333" 
                tick={{ fill: '#CCCCCC', fontSize: 12 }}
                tickLine={{ stroke: '#333333' }}
                height={60}
              />
              <YAxis 
                stroke="#333333" 
                tick={{ fill: '#CCCCCC', fontSize: 12 }}
                tickLine={{ stroke: '#333333' }}
                domain={[0, maxValue * 1.1]} // Adicionar 10% de espaço para melhor visualização
              />
              {showTooltip && (
                <Tooltip
                  formatter={(value: number) => [`${value}`, 'Valor']}
                  contentStyle={{ 
                    backgroundColor: '#000000', 
                    borderColor: '#FFDD00',
                    color: '#FFFFFF'
                  }}
                  labelStyle={{ color: '#FFDD00' }}
                  itemStyle={{ color: '#FFFFFF' }}
                />
              )}
              <Bar 
                dataKey="value" 
                fill={color} 
                radius={[4, 4, 0, 0]}
                barSize={30}
                animationDuration={1000}
              >
                <LabelList 
                  dataKey="value" 
                  position="top" 
                  fill="#FFFFFF" 
                  fontSize={12}
                  formatter={(value: number) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
                />
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PeriodBarChart;
