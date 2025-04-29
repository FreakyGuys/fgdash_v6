"use client";

import React, { useState, useEffect } from 'react';
import DateRangeSelector from './DateRangeSelector';

// Componente para visualização comparativa de métricas entre períodos
const PeriodComparisonChart = ({ metricName, metricData, chartType = 'line' }) => {
  const [dateRange, setDateRange] = useState({
    currentPeriod: { 
      start: new Date(new Date().setDate(new Date().getDate() - 30)), 
      end: new Date() 
    },
    comparePeriod: { 
      start: new Date(new Date().setDate(new Date().getDate() - 60)), 
      end: new Date(new Date().setDate(new Date().getDate() - 31)) 
    },
    compareMode: 'previous_period'
  });
  
  const [filteredCurrentData, setFilteredCurrentData] = useState([]);
  const [filteredCompareData, setFilteredCompareData] = useState([]);
  const [metrics, setMetrics] = useState({
    current: { total: 0, average: 0, max: 0, min: 0 },
    compare: { total: 0, average: 0, max: 0, min: 0 },
    change: { absolute: 0, percentage: 0 }
  });

  // Função para filtrar dados com base no intervalo de datas
  const filterDataByDateRange = (data, startDate, endDate) => {
    // Em uma implementação real, isso filtraria dados reais da API
    // Aqui estamos gerando dados simulados para demonstração
    
    const filteredData = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Gerar valor simulado baseado na data
      // Usando uma função senoidal para criar um padrão realista
      const dayOfYear = Math.floor((currentDate - new Date(currentDate.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
      const baseValue = 1000 + Math.sin(dayOfYear / 20) * 300;
      const randomFactor = 0.8 + Math.random() * 0.4; // Variação de 80% a 120%
      const value = Math.round(baseValue * randomFactor);
      
      filteredData.push({
        date: dateStr,
        value: value
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return filteredData;
  };

  // Calcular métricas a partir dos dados filtrados
  const calculateMetrics = (currentData, compareData) => {
    const calculateDataMetrics = (data) => {
      if (data.length === 0) return { total: 0, average: 0, max: 0, min: 0 };
      
      const total = data.reduce((sum, item) => sum + item.value, 0);
      const average = Math.round(total / data.length);
      const max = Math.max(...data.map(item => item.value));
      const min = Math.min(...data.map(item => item.value));
      
      return { total, average, max, min };
    };
    
    const current = calculateDataMetrics(currentData);
    const compare = calculateDataMetrics(compareData);
    
    const absoluteChange = current.total - compare.total;
    const percentageChange = compare.total !== 0 
      ? Math.round((absoluteChange / compare.total) * 100) 
      : 0;
    
    return {
      current,
      compare,
      change: { absolute: absoluteChange, percentage: percentageChange }
    };
  };

  // Efeito para atualizar dados quando o intervalo de datas muda
  useEffect(() => {
    const currentData = filterDataByDateRange(
      metricData || [], 
      dateRange.currentPeriod.start, 
      dateRange.currentPeriod.end
    );
    
    const compareData = filterDataByDateRange(
      metricData || [], 
      dateRange.comparePeriod.start, 
      dateRange.comparePeriod.end
    );
    
    setFilteredCurrentData(currentData);
    setFilteredCompareData(compareData);
    setMetrics(calculateMetrics(currentData, compareData));
  }, [dateRange, metricData]);

  // Função para formatar valores numéricos
  const formatValue = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  // Função para determinar a cor com base na variação percentual
  const getChangeColor = (percentage) => {
    if (percentage > 0) return 'text-green-500';
    if (percentage < 0) return 'text-red-500';
    return 'text-gray-400';
  };

  // Função para renderizar o gráfico apropriado
  const renderChart = () => {
    // Em uma implementação real, isso usaria uma biblioteca como Recharts
    // Aqui estamos renderizando uma visualização simplificada para demonstração
    
    if (chartType === 'line') {
      return (
        <div className="h-64 relative mt-4">
          <div className="absolute inset-0 flex items-end">
            {filteredCurrentData.map((item, index) => {
              const height = `${(item.value / 2000) * 100}%`;
              return (
                <div 
                  key={`current-${index}`}
                  className="flex-1 flex flex-col justify-end group"
                >
                  <div 
                    className="bg-blue-500 rounded-t-sm mx-0.5 group-hover:bg-blue-400 relative"
                    style={{ height }}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.date}: {item.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="absolute inset-0 flex items-end opacity-50">
            {filteredCompareData.map((item, index) => {
              const height = `${(item.value / 2000) * 100}%`;
              return (
                <div 
                  key={`compare-${index}`}
                  className="flex-1 flex flex-col justify-end group"
                >
                  <div 
                    className="bg-purple-500 rounded-t-sm mx-0.5 group-hover:bg-purple-400 relative"
                    style={{ height }}
                  >
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.date}: {item.value}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    
    if (chartType === 'bar') {
      return (
        <div className="h-64 flex items-end justify-center space-x-12 mt-4">
          <div className="flex flex-col items-center">
            <div 
              className="bg-blue-500 w-24 rounded-t-sm"
              style={{ height: `${(metrics.current.total / 30000) * 100}%` }}
            ></div>
            <div className="mt-2 text-center">
              <div className="font-bold">{formatValue(metrics.current.total)}</div>
              <div className="text-sm text-gray-400">Atual</div>
            </div>
          </div>
          
          <div className="flex flex-col items-center">
            <div 
              className="bg-purple-500 w-24 rounded-t-sm"
              style={{ height: `${(metrics.compare.total / 30000) * 100}%` }}
            ></div>
            <div className="mt-2 text-center">
              <div className="font-bold">{formatValue(metrics.compare.total)}</div>
              <div className="text-sm text-gray-400">Comparação</div>
            </div>
          </div>
        </div>
      );
    }
    
    return <div className="text-center py-8 text-gray-400">Tipo de gráfico não suportado</div>;
  };

  return (
    <div className="bg-gray-900 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-yellow-400">{metricName}</h3>
        <DateRangeSelector onDateRangeChange={setDateRange} />
      </div>
      
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Total Atual</div>
          <div className="text-2xl font-bold">{formatValue(metrics.current.total)}</div>
        </div>
        
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Total Anterior</div>
          <div className="text-2xl font-bold">{formatValue(metrics.compare.total)}</div>
        </div>
        
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Variação</div>
          <div className={`text-2xl font-bold ${getChangeColor(metrics.change.percentage)}`}>
            {metrics.change.percentage > 0 ? '+' : ''}{metrics.change.percentage}%
          </div>
        </div>
        
        <div className="bg-gray-800 p-3 rounded-lg">
          <div className="text-sm text-gray-400 mb-1">Média Diária</div>
          <div className="text-2xl font-bold">{formatValue(metrics.current.average)}</div>
        </div>
      </div>
      
      {renderChart()}
      
      <div className="flex justify-between mt-4 text-sm text-gray-400">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-sm mr-2"></div>
          <span>Período Atual: {dateRange.currentPeriod.start.toLocaleDateString()} - {dateRange.currentPeriod.end.toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center">
          <div className="w-3 h-3 bg-purple-500 rounded-sm mr-2"></div>
          <span>Período Comparativo: {dateRange.comparePeriod.start.toLocaleDateString()} - {dateRange.comparePeriod.end.toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default PeriodComparisonChart;
