"use client";

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DonutChartProps {
  title: string;
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  height?: number;
  showControls?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  innerRadius?: number;
  outerRadius?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({
  title,
  data,
  height = 300,
  showControls = true,
  showTooltip = true,
  showLegend = true,
  innerRadius = 60,
  outerRadius = 80,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handlePieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const handlePieLeave = () => {
    setActiveIndex(null);
  };

  // Cores padrão se não forem fornecidas nos dados
  const defaultColors = ['#FFDD00', '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

  // Calcular o total para percentuais
  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <div className={`bg-black/70 backdrop-blur-md border border-yellow-freaky/20 rounded-lg p-4 shadow-lg ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-sm font-medium">{title}</h3>
        {showControls && (
          <div className="flex space-x-2">
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
      <div style={{ height: isFullscreen ? 'calc(100vh - 120px)' : height }} className="flex flex-col md:flex-row items-center">
        <div className="w-full md:w-2/3 h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                paddingAngle={2}
                dataKey="value"
                onMouseEnter={handlePieEnter}
                onMouseLeave={handlePieLeave}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || defaultColors[index % defaultColors.length]} 
                    stroke={activeIndex === index ? '#FFFFFF' : 'transparent'}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              {showTooltip && (
                <Tooltip
                  formatter={(value: number) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, '']}
                  contentStyle={{ 
                    backgroundColor: '#000000', 
                    borderColor: '#FFDD00',
                    color: '#FFFFFF'
                  }}
                  itemStyle={{ color: '#FFFFFF' }}
                />
              )}
              {showLegend && (
                <Legend 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                  wrapperStyle={{ paddingLeft: 20 }}
                  formatter={(value, entry, index) => (
                    <span style={{ color: activeIndex === index ? '#FFDD00' : '#FFFFFF' }}>{value}</span>
                  )}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Detalhes adicionais para telas maiores */}
        <div className="w-full md:w-1/3 mt-4 md:mt-0 md:pl-4">
          <div className="space-y-2">
            {data.map((entry, index) => (
              <div key={`detail-${index}`} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color || defaultColors[index % defaultColors.length] }}
                />
                <div className="flex-1 flex justify-between">
                  <span className="text-sm text-white">{entry.name}</span>
                  <span className="text-sm text-gray-light">
                    {((entry.value / total) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-800/30">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-white">Total</span>
              <span className="text-sm font-medium text-yellow-freaky">{total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
