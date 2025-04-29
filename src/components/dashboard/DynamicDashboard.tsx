"use client";

import React, { useState } from 'react';
import { useDashboard, DashboardSection, Indicator, DraggableItem, DroppableArea } from '@/context/DashboardContext';
import MetricCard from './MetricCard';
import TimelineChart from './TimelineChart';
import DonutChart from './DonutChart';
import PeriodBarChart from './PeriodBarChart';
import DataTable from './DataTable';
import AdPreview from './AdPreview';
import IndicatorConfigPanel from './IndicatorConfigPanel';
import SectionConfigPanel from './SectionConfigPanel';

// Dados simulados para demonstração
const mockTimelineData = Array.from({ length: 30 }, (_, i) => ({
  date: `${i + 1}/04`,
  value: Math.floor(Math.random() * 300) + 100
}));

const mockDeviceData = [
  { name: 'Desktop', value: 1062, color: '#FF6384' },
  { name: 'Mobile Web', value: 6918, color: '#FFDD00' }
];

const mockPeriodData = [
  { period: 'seg', value: 8 },
  { period: 'ter', value: 6 },
  { period: 'qua', value: 7 },
  { period: 'qui', value: 5 },
  { period: 'sex', value: 4 },
  { period: 'sáb', value: 3 },
  { period: 'dom', value: 2 }
];

const mockCampaignData = [
  {
    campaign: 'V - [STR] [GTR] - [Vendas] - [C-S] - [Adv+] - Público Frio Campanha',
    invested: 'R$ 2.835,59',
    results: 11,
    costPerResult: 'R$ 257,78',
    returnRate: '1,39%'
  },
  {
    campaign: 'V - [34] [GTR] - [Compras Advantage] [C-S] - Públicos Frios',
    invested: 'R$ 692,09',
    results: 4,
    costPerResult: 'R$ 173,02',
    returnRate: '1,86%'
  },
  {
    campaign: 'V - [45] [STR] - [Vendas] - [C-S] - [ABO] - Públicos Frios',
    invested: 'R$ 1.030,51',
    results: 3,
    costPerResult: 'R$ 343,5',
    returnRate: '1,17%'
  }
];

const mockAdsData = [
  {
    id: '1',
    name: 'Anúncio 1 - Venda Direta',
    imageUrl: '',
    metrics: {
      impressions: 53939,
      clicks: 1973,
      conversions: 4
    }
  },
  {
    id: '2',
    name: 'Anúncio 2 - Promoção Especial',
    imageUrl: '',
    metrics: {
      impressions: 37567,
      clicks: 1173,
      conversions: 4
    }
  }
];

const DynamicDashboard: React.FC = () => {
  const { 
    sections, 
    moveIndicator, 
    moveSection, 
    removeIndicator, 
    removeSection,
    saveLayout,
    loadLayout,
    savedLayouts
  } = useDashboard();
  
  // Estados para os painéis de configuração
  const [indicatorConfigOpen, setIndicatorConfigOpen] = useState(false);
  const [sectionConfigOpen, setSectionConfigOpen] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState<{indicator: Indicator, section: DashboardSection} | null>(null);
  const [selectedSection, setSelectedSection] = useState<DashboardSection | null>(null);
  const [configMode, setConfigMode] = useState<'edit' | 'add'>('edit');
  const [isEditMode, setIsEditMode] = useState(false);
  const [layoutName, setLayoutName] = useState('');
  const [showLayoutPanel, setShowLayoutPanel] = useState(false);
  
  // Renderizar o componente correto com base no tipo de indicador
  const renderIndicator = (indicator: Indicator) => {
    switch (indicator.type) {
      case 'metric':
        return (
          <MetricCard 
            title={indicator.title}
            value={indicator.config.value || '0'}
            change={indicator.config.change}
            progressPercentage={indicator.config.progressPercentage}
            icon={indicator.config.icon && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            showControls={!isEditMode}
          />
        );
      case 'timeline':
        return (
          <TimelineChart 
            title={indicator.title}
            data={mockTimelineData}
            showControls={!isEditMode}
          />
        );
      case 'donut':
        return (
          <DonutChart 
            title={indicator.title}
            data={mockDeviceData}
            showControls={!isEditMode}
          />
        );
      case 'bar':
        return (
          <PeriodBarChart 
            title={indicator.title}
            data={mockPeriodData}
            showControls={!isEditMode}
          />
        );
      case 'table':
        return (
          <DataTable 
            title={indicator.title}
            data={mockCampaignData}
            showControls={!isEditMode}
          />
        );
      case 'adPreview':
        return (
          <AdPreview 
            title={indicator.title}
            ads={mockAdsData}
            showControls={!isEditMode}
          />
        );
      default:
        return <div>Tipo de indicador não suportado</div>;
    }
  };
  
  // Lidar com o movimento de indicadores dentro de uma seção
  const handleMoveIndicator = (sectionId: string, dragIndex: number, hoverIndex: number) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const dragIndicator = section.indicators[dragIndex];
    if (!dragIndicator) return;
    
    moveIndicator(sectionId, sectionId, dragIndicator.id, hoverIndex);
  };
  
  // Lidar com o movimento de seções
  const handleMoveSection = (dragIndex: number, hoverIndex: number) => {
    const dragSection = sections[dragIndex];
    if (!dragSection) return;
    
    moveSection(dragSection.id, hoverIndex);
  };
  
  // Abrir painel para editar indicador
  const handleEditIndicator = (indicator: Indicator, section: DashboardSection) => {
    setSelectedIndicator({ indicator, section });
    setConfigMode('edit');
    setIndicatorConfigOpen(true);
  };
  
  // Abrir painel para adicionar indicador
  const handleAddIndicator = (section: DashboardSection) => {
    setSelectedSection(section);
    setConfigMode('add');
    setIndicatorConfigOpen(true);
  };
  
  // Abrir painel para editar seção
  const handleEditSection = (section: DashboardSection) => {
    setSelectedSection(section);
    setConfigMode('edit');
    setSectionConfigOpen(true);
  };
  
  // Abrir painel para adicionar seção
  const handleAddSection = () => {
    setSelectedSection(null);
    setConfigMode('add');
    setSectionConfigOpen(true);
  };
  
  // Salvar layout atual
  const handleSaveLayout = () => {
    if (layoutName.trim()) {
      saveLayout(layoutName);
      setLayoutName('');
      setShowLayoutPanel(false);
    }
  };
  
  // Determinar a classe de tamanho para o indicador
  const getIndicatorSizeClass = (size: string) => {
    switch (size) {
      case 'small':
        return 'col-span-1';
      case 'medium':
        return 'col-span-1 md:col-span-2';
      case 'large':
        return 'col-span-1 md:col-span-3';
      default:
        return 'col-span-1';
    }
  };
  
  return (
    <div className="min-h-screen bg-dark-blue">
      {/* Barra de ferramentas de edição */}
      <div className="bg-black border-b border-yellow-freaky/30 p-4 sticky top-0 z-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-white mr-4">Dashboard</h1>
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`mr-2 px-3 py-1 rounded-md text-sm ${isEditMode ? 'bg-yellow-freaky text-black' : 'bg-transparent border border-yellow-freaky text-yellow-freaky'}`}
            >
              {isEditMode ? 'Concluir Edição' : 'Personalizar Dashboard'}
            </button>
          </div>
          
          {isEditMode && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleAddSection}
                className="bg-transparent border border-yellow-freaky text-yellow-freaky font-medium py-1 px-3 rounded-md hover:bg-yellow-freaky/10 transition-colors text-sm"
              >
                Nova Seção
              </button>
              <button
                onClick={() => setShowLayoutPanel(true)}
                className="bg-transparent border border-yellow-freaky text-yellow-freaky font-medium py-1 px-3 rounded-md hover:bg-yellow-freaky/10 transition-colors text-sm"
              >
                Salvar Layout
              </button>
              <select
                className="bg-black border border-gray-800 text-white rounded-md py-1 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-freaky focus:border-transparent"
                onChange={(e) => loadLayout(e.target.value)}
                value=""
              >
                <option value="" disabled>Carregar Layout</option>
                {savedLayouts.map(layout => (
                  <option key={layout} value={layout}>{layout}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
      
      {/* Conteúdo principal */}
      <main className="p-4">
        {sections
          .sort((a, b) => a.position - b.position)
          .map((section, sectionIndex) => (
            <div key={section.id} className="mb-8">
              {isEditMode ? (
                <DraggableItem
                  id={section.id}
                  type="section"
                  index={sectionIndex}
                  onMove={handleMoveSection}
                >
                  <div className="bg-black/50 border border-yellow-freaky/30 rounded-lg p-2 mb-2">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-bold text-white flex items-center">
                        <span className="mr-2">≡</span> {section.title}
                      </h2>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAddIndicator(section)}
                          className="text-gray-light hover:text-yellow-freaky"
                          title="Adicionar Indicador"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEditSection(section)}
                          className="text-gray-light hover:text-yellow-freaky"
                          title="Editar Seção"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => removeSection(section.id)}
                          className="text-gray-light hover:text-red-500"
                          title="Remover Seção"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </DraggableItem>
              ) : (
                <h2 className="text-lg font-bold text-white mb-2">{section.title}</h2>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {section.indicators
                  .sort((a, b) => a.position - b.position)
                  .map((indicator, indicatorIndex) => (
                    <div 
                      key={indicator.id} 
                      className={getIndicatorSizeClass(indicator.size)}
                    >
                      {isEditMode ? (
                        <DraggableItem
                          id={indicator.id}
                          type={`indicator-${section.id}`}
                          index={indicatorIndex}
                          onMove={(dragIndex, hoverIndex) => handleMoveIndicator(section.id, dragIndex, hoverIndex)}
                        >
                          <div className="relative">
                            <div className="absolute top-0 right-0 z-10 bg-black/70 rounded-bl-lg p-1 flex space-x-1">
                              <button
                                onClick={() => handleEditIndicator(indicator, section)}
                                className="text-gray-light hover:text-yellow-freaky"
                                title="Editar Indicador"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => removeIndicator(section.id, indicator.id)}
                                className="text-gray-light hover:text-red-500"
                                title="Remover Indicador"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                            <div className="opacity-80 pointer-events-none">
                              {renderIndicator(indicator)}
                            </div>
                          </div>
                        </DraggableItem>
                      ) : (
                        renderIndicator(indicator)
                      )}
                    </div>
                  ))}
                
                {isEditMode && section.indicators.length === 0 && (
                  <div 
                    className="col-span-1 md:col-span-4 h-32 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-yellow-freaky/50 transition-colors"
                    onClick={() => handleAddIndicator(section)}
                  >
                    <div className="text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <p className="mt-2 text-gray-500">Adicionar Indicador</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        
        {isEditMode && sections.length === 0 && (
          <div 
            className="h-64 border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-yellow-freaky/50 transition-colors"
            onClick={handleAddSection}
          >
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <p className="mt-2 text-gray-500">Adicionar Seção</p>
            </div>
          </div>
        )}
      </main>
      
      {/* Painéis de configuração */}
      <IndicatorConfigPanel 
        isOpen={indicatorConfigOpen}
        onClose={() => setIndicatorConfigOpen(false)}
        indicator={selectedIndicator?.indicator}
        section={selectedIndicator?.section || selectedSection}
        mode={configMode}
      />
      
      <SectionConfigPanel 
        isOpen={sectionConfigOpen}
        onClose={() => setSectionConfigOpen(false)}
        section={selectedSection}
        mode={configMode}
      />
      
      {/* Painel para salvar layout */}
      {showLayoutPanel && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-dark-blue border border-yellow-freaky/30 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Salvar Layout</h2>
              <button 
                onClick={() => setShowLayoutPanel(false)}
                className="text-gray-light hover:text-yellow-freaky"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2">
                Nome do Layout
              </label>
              <input
                type="text"
                className="bg-black border border-gray-800 text-white rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-yellow-freaky focus:border-transparent"
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
                placeholder="Ex: Meu Layout Personalizado"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLayoutPanel(false)}
                className="bg-transparent border border-yellow-freaky text-yellow-freaky font-medium py-2 px-4 rounded-md hover:bg-yellow-freaky/10 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveLayout}
                className="bg-yellow-freaky text-black font-medium py-2 px-4 rounded-md hover:bg-yellow-300 transition-colors"
                disabled={!layoutName.trim()}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicDashboard;
