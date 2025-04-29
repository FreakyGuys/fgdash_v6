"use client";

import React, { useState, useEffect } from 'react';
import { format, addDays, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componente de seleção de período com calendário
const DateRangeSelector = ({ onDateRangeChange }) => {
  // Estados para controle de datas
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  const [compareStartDate, setCompareStartDate] = useState(subDays(new Date(), 60));
  const [compareEndDate, setCompareEndDate] = useState(subDays(new Date(), 31));
  const [showCalendar, setShowCalendar] = useState(false);
  const [compareMode, setCompareMode] = useState('previous_period');
  const [customCompare, setCustomCompare] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Opções de comparação
  const compareOptions = [
    { id: 'previous_period', label: 'Período Anterior' },
    { id: 'previous_year', label: 'Mesmo Período Ano Anterior' },
    { id: 'custom', label: 'Período Personalizado' }
  ];

  // Opções de períodos predefinidos
  const presetRanges = [
    // Períodos relativos
    { id: 'last_7_days', label: 'Últimos 7 dias', getRange: () => [subDays(new Date(), 6), new Date()] },
    { id: 'last_30_days', label: 'Últimos 30 dias', getRange: () => [subDays(new Date(), 29), new Date()] },
    { id: 'this_month', label: 'Este mês', getRange: () => [startOfMonth(new Date()), new Date()] },
    { id: 'last_month', label: 'Mês passado', getRange: () => {
      const lastMonth = subDays(startOfMonth(new Date()), 1);
      return [startOfMonth(lastMonth), endOfMonth(lastMonth)];
    }},
    { id: 'last_3_months', label: 'Últimos 3 meses', getRange: () => [subDays(new Date(), 89), new Date()] },
    { id: 'year_to_date', label: 'Ano até hoje', getRange: () => [startOfYear(new Date()), new Date()] },
    
    // Meses do calendário
    { id: 'january', label: 'Janeiro', getRange: () => {
      const year = new Date().getFullYear();
      return [new Date(year, 0, 1), new Date(year, 0, 31)];
    }},
    { id: 'february', label: 'Fevereiro', getRange: () => {
      const year = new Date().getFullYear();
      const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
      return [new Date(year, 1, 1), new Date(year, 1, isLeapYear ? 29 : 28)];
    }},
    { id: 'march', label: 'Março', getRange: () => {
      const year = new Date().getFullYear();
      return [new Date(year, 2, 1), new Date(year, 2, 31)];
    }},
    { id: 'april', label: 'Abril', getRange: () => {
      const year = new Date().getFullYear();
      return [new Date(year, 3, 1), new Date(year, 3, 30)];
    }},
    { id: 'may', label: 'Maio', getRange: () => {
      const year = new Date().getFullYear();
      return [new Date(year, 4, 1), new Date(year, 4, 31)];
    }},
    { id: 'june', label: 'Junho', getRange: () => {
      const year = new Date().getFullYear();
      return [new Date(year, 5, 1), new Date(year, 5, 30)];
    }},
    { id: 'july', label: 'Julho', getRange: () => {
      const year = new Date().getFullYear();
      return [new Date(year, 6, 1), new Date(year, 6, 31)];
    }},
    { id: 'august', label: 'Agosto', getRange: () => {
      const year = new Date().getFullYear();
      return [new Date(year, 7, 1), new Date(year, 7, 31)];
    }},
    { id: 'september', label: 'Setembro', getRange: () => {
      const year = new Date().getFullYear();
      return [new Date(year, 8, 1), new Date(year, 8, 30)];
    }},
    { id: 'october', label: 'Outubro', getRange: () => {
      const year = new Date().getFullYear();
      return [new Date(year, 9, 1), new Date(year, 9, 31)];
    }},
    { id: 'november', label: 'Novembro', getRange: () => {
      const year = new Date().getFullYear();
      return [new Date(year, 10, 1), new Date(year, 10, 30)];
    }},
    { id: 'december', label: 'Dezembro', getRange: () => {
      const year = new Date().getFullYear();
      return [new Date(year, 11, 1), new Date(year, 11, 31)];
    }}
  ];

  // Efeito para atualizar as datas de comparação quando as datas principais mudam
  useEffect(() => {
    if (compareMode === 'previous_period') {
      const daysDiff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      setCompareStartDate(subDays(startDate, daysDiff + 1));
      setCompareEndDate(subDays(startDate, 1));
    } else if (compareMode === 'previous_year') {
      const oneYearAgoStart = new Date(startDate);
      const oneYearAgoEnd = new Date(endDate);
      oneYearAgoStart.setFullYear(oneYearAgoStart.getFullYear() - 1);
      oneYearAgoEnd.setFullYear(oneYearAgoEnd.getFullYear() - 1);
      setCompareStartDate(oneYearAgoStart);
      setCompareEndDate(oneYearAgoEnd);
    }
  }, [startDate, endDate, compareMode]);

  // Efeito para notificar mudanças nas datas
  useEffect(() => {
    onDateRangeChange({
      currentPeriod: { start: startDate, end: endDate },
      comparePeriod: { start: compareStartDate, end: compareEndDate },
      compareMode
    });
  }, [startDate, endDate, compareStartDate, compareEndDate, compareMode, onDateRangeChange]);

  // Função para aplicar um período predefinido
  const applyPresetRange = (presetId) => {
    const preset = presetRanges.find(p => p.id === presetId);
    if (preset) {
      const [newStart, newEnd] = preset.getRange();
      setStartDate(newStart);
      setEndDate(newEnd);
      setShowCalendar(false);
    }
  };

  // Função para mudar o mês no calendário
  const changeMonth = (increment) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + increment);
    setCurrentMonth(newMonth);
  };

  // Função para gerar os dias do calendário
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDay = monthStart.getDay();
    const daysInMonth = monthEnd.getDate();
    
    const days = [];
    
    // Dias do mês anterior para preencher o início do calendário
    for (let i = 0; i < startDay; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }
    
    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      
      const isInCurrentRange = isWithinInterval(date, { start: startDate, end: endDate });
      const isInCompareRange = isWithinInterval(date, { start: compareStartDate, end: compareEndDate });
      
      days.push({
        day,
        date,
        isCurrentMonth: true,
        isInCurrentRange,
        isInCompareRange,
        isStartDate: date.getTime() === startDate.getTime(),
        isEndDate: date.getTime() === endDate.getTime(),
        isCompareStartDate: date.getTime() === compareStartDate.getTime(),
        isCompareEndDate: date.getTime() === compareEndDate.getTime()
      });
    }
    
    return days;
  };

  // Função para selecionar uma data no calendário
  const selectDate = (date) => {
    if (!date) return;
    
    if (customCompare) {
      // Seleção de datas para o período de comparação
      if (!compareStartDate || (compareStartDate && compareEndDate)) {
        setCompareStartDate(date);
        setCompareEndDate(null);
      } else {
        if (date < compareStartDate) {
          setCompareEndDate(compareStartDate);
          setCompareStartDate(date);
        } else {
          setCompareEndDate(date);
        }
      }
    } else {
      // Seleção de datas para o período principal
      if (!startDate || (startDate && endDate)) {
        setStartDate(date);
        setEndDate(null);
      } else {
        if (date < startDate) {
          setEndDate(startDate);
          setStartDate(date);
        } else {
          setEndDate(date);
        }
      }
    }
  };

  // Função para alternar entre seleção de período principal e de comparação
  const toggleCustomCompare = () => {
    setCustomCompare(!customCompare);
    if (!customCompare) {
      setCompareMode('custom');
    }
  };

  // Função para formatar a exibição do período
  const formatDateRange = (start, end) => {
    return `${format(start, 'dd/MM/yyyy', { locale: ptBR })} - ${format(end, 'dd/MM/yyyy', { locale: ptBR })}`;
  };

  return (
    <div className="relative">
      {/* Botão para abrir o seletor de datas */}
      <button 
        className="flex items-center bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white hover:bg-gray-700"
        onClick={() => setShowCalendar(!showCalendar)}
      >
        <span className="mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </span>
        <span>{formatDateRange(startDate, endDate)}</span>
        {compareMode !== 'none' && (
          <span className="ml-2 text-gray-400">vs {formatDateRange(compareStartDate, compareEndDate)}</span>
        )}
      </button>
      
      {/* Calendário e opções */}
      {showCalendar && (
        <div className="absolute z-10 mt-2 p-4 bg-black-freaky/80 backdrop-blur-md border border-yellow-freaky/30 rounded-md shadow-lg w-[600px] font-poppins">
          <div className="flex mb-4">
            <div className="w-1/2 pr-2">
              <h3 className="text-yellow-freaky font-bold mb-2">Período</h3>
              <div className="mb-2">
                <h4 className="text-sm font-medium mb-1">Períodos Relativos</h4>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {presetRanges.slice(0, 6).map(preset => (
                    <button
                      key={preset.id}
                      className="bg-gray-800/70 hover:bg-gray-700/90 px-3 py-2 rounded-md text-sm transition-all duration-200"
                      onClick={() => applyPresetRange(preset.id)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-2">
                <h4 className="text-sm font-medium mb-1">Meses do Calendário</h4>
                <div className="grid grid-cols-3 gap-2 mb-4 max-h-40 overflow-y-auto pr-2">
                  {presetRanges.slice(6).map(preset => (
                    <button
                      key={preset.id}
                      className="bg-gray-800/70 hover:bg-gray-700/90 px-3 py-2 rounded-md text-sm transition-all duration-200"
                      onClick={() => applyPresetRange(preset.id)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-1">Período Selecionado</h4>
                <div className="flex items-center space-x-2">
                  <div className="bg-gray-800/70 px-3 py-2 rounded-md text-sm flex-grow border border-gray-700/50">
                    {formatDateRange(startDate, endDate)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="w-1/2 pl-2 border-l border-gray-700/50">
              <h3 className="text-yellow-freaky font-bold mb-2">Comparar Com</h3>
              <div className="space-y-2 mb-4">
                {compareOptions.map(option => (
                  <div key={option.id} className="flex items-center">
                    <input
                      type="radio"
                      id={`compare-${option.id}`}
                      name="compareMode"
                      value={option.id}
                      checked={compareMode === option.id}
                      onChange={() => setCompareMode(option.id)}
                      className="mr-2 accent-yellow-freaky"
                    />
                    <label htmlFor={`compare-${option.id}`} className="text-white/90">{option.label}</label>
                  </div>
                ))}
              </div>
              
              {compareMode !== 'none' && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-1">Período de Comparação</h4>
                  <div className="flex items-center space-x-2">
                    <div className="bg-gray-800/70 px-3 py-2 rounded-md text-sm flex-grow border border-gray-700/50">
                      {formatDateRange(compareStartDate, compareEndDate)}
                    </div>
                    {compareMode === 'custom' && (
                      <button
                        className={`px-3 py-2 rounded-md text-sm transition-all duration-200 ${customCompare ? 'bg-yellow-freaky text-black font-medium' : 'bg-gray-700/70 hover:bg-gray-600/80'}`}
                        onClick={toggleCustomCompare}
                      >
                        Selecionar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Calendário */}
          <div className="border-t border-gray-700/50 pt-4">
            <div className="flex justify-between items-center mb-4">
              <button 
                className="bg-gray-800/70 hover:bg-gray-700/90 p-2 rounded-md transition-all duration-200"
                onClick={() => changeMonth(-1)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="text-lg font-bold text-yellow-freaky">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </h3>
              <button 
                className="bg-gray-800/70 hover:bg-gray-700/90 p-2 rounded-md transition-all duration-200"
                onClick={() => changeMonth(1)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-400">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays().map((dayObj, index) => (
                <div 
                  key={index}
                  className={`
                    h-10 flex items-center justify-center rounded-md text-sm transition-all duration-200
                    ${!dayObj.isCurrentMonth ? 'text-gray-600' : 'text-white/90'}
                    ${dayObj.isCurrentMonth && !dayObj.isInCurrentRange && !dayObj.isInCompareRange ? 'hover:bg-gray-700/70 cursor-pointer' : ''}
                    ${dayObj.isInCurrentRange && !dayObj.isStartDate && !dayObj.isEndDate ? 'bg-blue-900/40 backdrop-blur-sm' : ''}
                    ${dayObj.isInCompareRange && !dayObj.isCompareStartDate && !dayObj.isCompareEndDate ? 'bg-purple-900/40 backdrop-blur-sm' : ''}
                    ${dayObj.isStartDate || dayObj.isEndDate ? 'bg-blue-600/90 text-white font-medium' : ''}
                    ${dayObj.isCompareStartDate || dayObj.isCompareEndDate ? 'bg-purple-600/90 text-white font-medium' : ''}
                  `}
                  onClick={() => dayObj.isCurrentMonth && selectDate(dayObj.date)}
                >
                  {dayObj.day}
                </div>
              ))}
            </div>
            
            <div className="flex mt-4 justify-between">
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-600/90 rounded-sm mr-2"></div>
                  <span className="text-sm text-white/90">Período Atual</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-purple-600/90 rounded-sm mr-2"></div>
                  <span className="text-sm text-white/90">Período de Comparação</span>
                </div>
              </div>
              
              <button 
                className="bg-yellow-freaky text-black px-4 py-2 rounded-md font-bold hover:bg-yellow-freaky/90 transition-all duration-200"
                onClick={() => setShowCalendar(false)}
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeSelector;
