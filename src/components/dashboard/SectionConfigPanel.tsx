"use client";

import React, { useState } from 'react';
import { useDashboard, DashboardSection } from '@/context/DashboardContext';

interface SectionConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  section?: DashboardSection;
  mode: 'edit' | 'add';
}

const SectionConfigPanel: React.FC<SectionConfigPanelProps> = ({
  isOpen,
  onClose,
  section,
  mode
}) => {
  const { updateSection, addSection } = useDashboard();
  
  // Estado para os campos do formulário
  const [title, setTitle] = useState(section?.title || '');
  
  // Resetar o formulário quando o painel é aberto/fechado ou a seção muda
  React.useEffect(() => {
    if (isOpen && section) {
      setTitle(section.title);
    } else if (isOpen && mode === 'add') {
      setTitle('');
    }
  }, [isOpen, section, mode]);
  
  // Lidar com o envio do formulário
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'edit' && section) {
      // Atualizar seção existente
      updateSection({
        ...section,
        title
      });
    } else if (mode === 'add') {
      // Criar nova seção
      const newSection: DashboardSection = {
        id: '', // ID será gerado pelo contexto
        title,
        position: 0, // Posição será definida pelo contexto
        indicators: [],
        visible: true
      };
      addSection(newSection);
    }
    
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-dark-blue border border-yellow-freaky/30 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            {mode === 'edit' ? 'Editar Seção' : 'Adicionar Seção'}
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
          <div className="mb-6">
            <label className="block text-white text-sm font-medium mb-2">
              Título da Seção
            </label>
            <input
              type="text"
              className="bg-black border border-gray-800 text-white rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-yellow-freaky focus:border-transparent"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
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

export default SectionConfigPanel;
