"use client";

import React, { useState } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    isPositive: boolean;
  };
  progressPercentage?: number;
  icon?: React.ReactNode;
  color?: string;
  showControls?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  progressPercentage,
  icon,
  color = '#FFDD00',
  showControls = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [timeRange, setTimeRange] = useState('30d'); // '7d', '30d', '90d', 'all'
  
  // Dados simulados para o gráfico de tendência
  const trendData = {
    '7d': [65, 59, 80, 81, 56, 55, 40],
    '30d': [65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40],
    '90d': [65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40],
    'all': [65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81]
  };
  
  // Dados históricos simulados para comparação
  const historicalData = {
    'previous': typeof value === 'string' && value.includes('R$') 
      ? 'R$ ' + (parseFloat(value.replace('R$ ', '').replace('.', '').replace(',', '.')) * 0.85).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}).replace('.', ',')
      : typeof value === 'string' && value.includes('%')
        ? (parseFloat(value.replace('%', '').replace(',', '.')) * 0.9).toFixed(2).replace('.', ',') + '%'
        : typeof value === 'number'
          ? Math.round(value * 0.85)
          : value
  };

  // Calcular a cor do gradiente com base no valor de progresso
  const getProgressColor = () => {
    if (!progressPercentage) return color;
    
    if (progressPercentage < 30) return '#FF6384'; // Vermelho para valores baixos
    if (progressPercentage < 70) return '#FFCE56'; // Amarelo para valores médios
    return color; // Cor padrão (amarelo Freaky) para valores altos
  };

  // Renderizar o mini gráfico de tendência
  const renderTrendLine = () => {
    const data = trendData[timeRange as keyof typeof trendData];
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    return (
      <div className="h-12 mt-2">
        <svg width="100%" height="100%" viewBox={`0 0 ${data.length} 100`} preserveAspectRatio="none">
          <defs>
            <linearGradient id={`gradient-${title.replace(/\s+/g, '-')}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={color} stopOpacity="0.2" />
            </linearGradient>
          </defs>
          
          {/* Área preenchida sob a linha */}
          <path
            d={`
              M0,${100 - ((data[0] - min) / range) * 100}
              ${data.map((d, i) => `L${i},${100 - ((d - min) / range) * 100}`).join(' ')}
              L${data.length - 1},100 L0,100 Z
            `}
            fill={`url(#gradient-${title.replace(/\s+/g, '-')})`}
            opacity="0.5"
          />
          
          {/* Linha de tendência */}
          <path
            d={`
              M0,${100 - ((data[0] - min) / range) * 100}
              ${data.map((d, i) => `L${i},${100 - ((d - min) / range) * 100}`).join(' ')}
            `}
            fill="none"
            stroke={color}
            strokeWidth="2"
          />
          
          {/* Ponto final */}
          <circle
            cx={data.length - 1}
            cy={100 - ((data[data.length - 1] - min) / range) * 100}
            r="3"
            fill={color}
          />
        </svg>
      </div>
    );
  };

  return (
    <div 
      className={`bg-black/70 backdrop-blur-md border border-yellow-freaky/20 rounded-lg p-4 shadow-lg transition-all duration-300 ${
        isExpanded ? 'col-span-2 row-span-2' : ''
      }`}
      style={{
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)'
      }}
    >
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white text-sm font-medium">{title}</h3>
        {showControls && (
          <div className="flex space-x-2">
            <button 
              className="text-gray-light hover:text-yellow-freaky"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
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
      
      <div className="flex items-end">
        <div className="flex-1">
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-white">{value}</span>
            {change && (
              <span className={`ml-2 text-xs font-medium ${change.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {change.isPositive ? '↑' : '↓'} {change.value}
              </span>
            )}
          </div>
          
          {progressPercentage !== undefined && (
            <div className="mt-2">
              <div className="flex justify-between text-xs text-gray-light mb-1">
                <span>Progresso</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="h-2 rounded-full" 
                  style={{ 
                    width: `${progressPercentage}%`,
                    backgroundColor: getProgressColor()
                  }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        {icon && (
          <div className="ml-4 text-yellow-freaky">
            {icon}
          </div>
        )}
      </div>
      
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-800">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-white">Tendência</h4>
            <div className="flex bg-dark-blue rounded-md overflow-hidden text-xs">
              <button 
                className={`px-2 py-1 ${timeRange === '7d' ? 'bg-yellow-freaky text-black' : 'text-gray-light'}`}
                onClick={() => setTimeRange('7d')}
              >
                7D
              </button>
              <button 
                className={`px-2 py-1 ${timeRange === '30d' ? 'bg-yellow-freaky text-black' : 'text-gray-light'}`}
                onClick={() => setTimeRange('30d')}
              >
                30D
              </button>
              <button 
                className={`px-2 py-1 ${timeRange === '90d' ? 'bg-yellow-freaky text-black' : 'text-gray-light'}`}
                onClick={() => setTimeRange('90d')}
              >
                90D
              </button>
              <button 
                className={`px-2 py-1 ${timeRange === 'all' ? 'bg-yellow-freaky text-black' : 'text-gray-light'}`}
                onClick={() => setTimeRange('all')}
              >
                Todos
              </button>
            </div>
          </div>
          
          {renderTrendLine()}
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-gray-900/60 backdrop-blur-md p-3 rounded-lg border border-gray-800/20">
              <p className="text-xs text-gray-light mb-1">Período Anterior</p>
              <p className="text-lg font-medium text-white">{historicalData.previous}</p>
            </div>
            <div className="bg-gray-900/60 backdrop-blur-md p-3 rounded-lg border border-gray-800/20">
              <p className="text-xs text-gray-light mb-1">Variação</p>
              <p className={`text-lg font-medium ${change?.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {change?.isPositive ? '+' : '-'} {change?.value}
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium text-white mb-2">Detalhes</h4>
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="py-1 text-gray-light">Média diária</td>
                  <td className="py-1 text-white text-right">
                    {typeof value === 'string' && value.includes('R$') 
                      ? 'R$ ' + (parseFloat(value.replace('R$ ', '').replace('.', '').replace(',', '.')) / 30).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}).replace('.', ',')
                      : typeof value === 'string' && value.includes('%')
                        ? value
                        : typeof value === 'number'
                          ? Math.round(value / 30)
                          : value
                    }
                  </td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-light">Melhor dia</td>
                  <td className="py-1 text-white text-right">
                    {typeof value === 'string' && value.includes('R$') 
                      ? 'R$ ' + (parseFloat(value.replace('R$ ', '').replace('.', '').replace(',', '.')) / 15).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}).replace('.', ',')
                      : typeof value === 'string' && value.includes('%')
                        ? (parseFloat(value.replace('%', '').replace(',', '.')) * 1.2).toFixed(2).replace('.', ',') + '%'
                        : typeof value === 'number'
                          ? Math.round(value / 15)
                          : value
                    }
                  </td>
                </tr>
                <tr>
                  <td className="py-1 text-gray-light">Pior dia</td>
                  <td className="py-1 text-white text-right">
                    {typeof value === 'string' && value.includes('R$') 
                      ? 'R$ ' + (parseFloat(value.replace('R$ ', '').replace('.', '').replace(',', '.')) / 60).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2}).replace('.', ',')
                      : typeof value === 'string' && value.includes('%')
                        ? (parseFloat(value.replace('%', '').replace(',', '.')) * 0.7).toFixed(2).replace('.', ',') + '%'
                        : typeof value === 'number'
                          ? Math.round(value / 60)
                          : value
                    }
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
