"use client";

import React, { useState } from 'react';
import { useDashboard, Indicator, DashboardSection } from '@/context/DashboardContext';

interface IndicatorConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  indicator?: Indicator;
  section?: DashboardSection;
  mode: 'edit' | 'add';
}

const IndicatorConfigPanel: React.FC<IndicatorConfigPanelProps> = ({
  isOpen,
  onClose,
  indicator,
  section,
  mode
}) => {
  const { updateIndicator, addIndicator, availableIndicators } = useDashboard();
  
  // Estado para os campos do formulário
  const [title, setTitle] = useState(indicator?.title || '');
  const [type, setType] = useState(indicator?.type || 'metric');
  const [size, setSize] = useState(indicator?.size || 'small');
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null);
  
  // Resetar o formulário quando o painel é aberto/fechado ou o indicador muda
  React.useEffect(() => {
    if (isOpen && indicator) {
      setTitle(indicator.title);
      setType(indicator.type);
      setSize(indicator.size);
    } else if (isOpen && mode === 'add') {
      setTitle('');
      setType('metric');
      setSize('small');
      setSelectedIndicator(null);
    }
  }, [isOpen, indicator, mode]);
  
  // Lidar com o envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'edit' && indicator && section) {
      // Atualizar indicador existente
      updateIndicator(section.id, {
        ...indicator,
        title,
        type: type as any,
        size: size as any
      });
    } else if (mode === 'add' && section) {
      // Adicionar novo indicador
      if (selectedIndicator) {
        // Adicionar indicador existente da lista de disponíveis
        const indicatorToAdd = availableIndicators.find(ind => ind.id === selectedIndicator);
        if (indicatorToAdd) {
          addIndicator(section.id, indicatorToAdd);
        }
      } else {
        // Criar novo indicador personalizado
        const newIndicator: Indicator = {
          id: '', // ID será gerado pelo contexto
          title,
          type: type as any,
          size: size as any,
          position: 0, // Posição será definida pelo contexto
          visible: true,
          config: {} // Configuração vazia por padrão
        };
        addIndicator(section.id, newIndicator);
      }
    }
    
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-dark-blue border border-yellow-freaky/30 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            {mode === 'edit' ? 'Editar Indicador' : 'Adicionar Indicador'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-light hover:text-yellow-freaky"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {mode === 'add' && (
            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2">
                Escolher Indicador Existente
              </label>
              <select
                className="bg-black border border-gray-800 text-white rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-yellow-freaky focus:border-transparent"
                value={selectedIndicator || ''}
                onChange={(e) => setSelectedIndicator(e.target.value || null)}
              >
                <option value="">Criar Novo Indicador</option>
                {availableIndicators.map(ind => (
                  <option key={ind.id} value={ind.id}>
                    {ind.title} ({ind.type})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {(!selectedIndicator || mode === 'edit') && (
            <>
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">
                  Título
                </label>
                <input
                  type="text"
                  className="bg-black border border-gray-800 text-white rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-yellow-freaky focus:border-transparent"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">
                  Tipo
                </label>
                <select
                  className="bg-black border border-gray-800 text-white rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-yellow-freaky focus:border-transparent"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                >
                  <option value="metric">Métrica</option>
                  <option value="timeline">Gráfico de Linha</option>
                  <option value="donut">Gráfico de Rosca</option>
                  <option value="bar">Gráfico de Barras</option>
                  <option value="table">Tabela</option>
                  <option value="adPreview">Visualização de Anúncios</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-white text-sm font-medium mb-2">
                  Tamanho
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="size"
                      value="small"
                      checked={size === 'small'}
                      onChange={() => setSize('small')}
                      className="mr-2 text-yellow-freaky focus:ring-yellow-freaky"
                    />
                    <span className="text-white">Pequeno</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="size"
                      value="medium"
                      checked={size === 'medium'}
                      onChange={() => setSize('medium')}
                      className="mr-2 text-yellow-freaky focus:ring-yellow-freaky"
                    />
                    <span className="text-white">Médio</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="size"
                      value="large"
                      checked={size === 'large'}
                      onChange={() => setSize('large')}
                      className="mr-2 text-yellow-freaky focus:ring-yellow-freaky"
                    />
                    <span className="text-white">Grande</span>
                  </label>
                </div>
              </div>
            </>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-transparent border border-yellow-freaky text-yellow-freaky font-medium py-2 px-4 rounded-md hover:bg-yellow-freaky/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-yellow-freaky text-black font-medium py-2 px-4 rounded-md hover:bg-yellow-300 transition-colors"
            >
              {mode === 'edit' ? 'Atualizar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IndicatorConfigPanel;
