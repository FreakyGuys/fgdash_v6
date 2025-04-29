"use client";

import React, { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { v4 as uuidv4 } from 'uuid';

// Tipos de indicadores disponíveis
export type IndicatorType = 
  | 'metric' 
  | 'timeline' 
  | 'donut' 
  | 'bar' 
  | 'table' 
  | 'adPreview';

// Interface para um indicador
export interface Indicator {
  id: string;
  type: IndicatorType;
  title: string;
  size: 'small' | 'medium' | 'large';
  position: number;
  config: any; // Configurações específicas do indicador
  visible: boolean;
}

// Interface para uma seção do dashboard
export interface DashboardSection {
  id: string;
  title: string;
  position: number;
  indicators: Indicator[];
  visible: boolean;
}

// Interface para o contexto do dashboard
interface DashboardContextType {
  sections: DashboardSection[];
  availableIndicators: Indicator[];
  addIndicator: (sectionId: string, indicator: Indicator) => void;
  removeIndicator: (sectionId: string, indicatorId: string) => void;
  updateIndicator: (sectionId: string, indicator: Indicator) => void;
  moveIndicator: (fromSectionId: string, toSectionId: string, indicatorId: string, newPosition: number) => void;
  addSection: (section: DashboardSection) => void;
  removeSection: (sectionId: string) => void;
  updateSection: (section: DashboardSection) => void;
  moveSection: (sectionId: string, newPosition: number) => void;
  saveLayout: (name: string) => void;
  loadLayout: (name: string) => void;
  savedLayouts: string[];
}

// Criação do contexto
export const DashboardContext = React.createContext<DashboardContextType | undefined>(undefined);

// Hook personalizado para usar o contexto
export const useDashboard = () => {
  const context = React.useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

// Componente de provider para o contexto
export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado para seções do dashboard
  const [sections, setSections] = useState<DashboardSection[]>([]);
  
  // Estado para indicadores disponíveis
  const [availableIndicators, setAvailableIndicators] = useState<Indicator[]>([]);
  
  // Estado para layouts salvos
  const [savedLayouts, setSavedLayouts] = useState<string[]>([]);

  // Carregar configuração inicial
  useEffect(() => {
    // Em uma implementação real, isso viria de uma API ou localStorage
    const initialSections: DashboardSection[] = [
      {
        id: uuidv4(),
        title: 'Métricas Principais',
        position: 0,
        visible: true,
        indicators: [
          {
            id: uuidv4(),
            type: 'metric',
            title: 'Investido',
            size: 'small',
            position: 0,
            visible: true,
            config: {
              value: 'R$ 6.302,07',
              change: { value: '17,5%', isPositive: true },
              progressPercentage: 100,
              icon: 'money'
            }
          },
          {
            id: uuidv4(),
            type: 'metric',
            title: 'Resultado',
            size: 'small',
            position: 1,
            visible: true,
            config: {
              value: '28',
              change: { value: '22,2%', isPositive: true },
              progressPercentage: 127,
              icon: 'check'
            }
          },
          {
            id: uuidv4(),
            type: 'metric',
            title: 'Custo por Resultado',
            size: 'small',
            position: 2,
            visible: true,
            config: {
              value: 'R$ 225,07',
              change: { value: '5,3%', isPositive: false },
              progressPercentage: 78,
              icon: 'calculator'
            }
          },
          {
            id: uuidv4(),
            type: 'metric',
            title: 'Retorno',
            size: 'small',
            position: 3,
            visible: true,
            config: {
              value: '1,42%',
              change: { value: '11,9%', isPositive: true },
              progressPercentage: 131,
              icon: 'chart'
            }
          }
        ]
      },
      {
        id: uuidv4(),
        title: 'Visão Geral',
        position: 1,
        visible: true,
        indicators: [
          {
            id: uuidv4(),
            type: 'timeline',
            title: 'Visão Temporal',
            size: 'large',
            position: 0,
            visible: true,
            config: {
              // Configuração específica para o gráfico de linha
            }
          },
          {
            id: uuidv4(),
            type: 'donut',
            title: 'Devices / Demográficos',
            size: 'medium',
            position: 1,
            visible: true,
            config: {
              // Configuração específica para o gráfico de rosca
            }
          }
        ]
      },
      {
        id: uuidv4(),
        title: 'Detalhes',
        position: 2,
        visible: true,
        indicators: [
          {
            id: uuidv4(),
            type: 'table',
            title: 'Campaign',
            size: 'large',
            position: 0,
            visible: true,
            config: {
              // Configuração específica para a tabela
            }
          },
          {
            id: uuidv4(),
            type: 'adPreview',
            title: 'Melhores Anúncios',
            size: 'medium',
            position: 1,
            visible: true,
            config: {
              // Configuração específica para a visualização de anúncios
            }
          },
          {
            id: uuidv4(),
            type: 'bar',
            title: 'Período',
            size: 'medium',
            position: 2,
            visible: true,
            config: {
              // Configuração específica para o gráfico de barras
            }
          }
        ]
      },
      {
        id: uuidv4(),
        title: 'Métricas Complementares',
        position: 3,
        visible: true,
        indicators: [
          {
            id: uuidv4(),
            type: 'metric',
            title: 'Impressões',
            size: 'small',
            position: 0,
            visible: true,
            config: {
              value: '137.567',
              change: { value: '10,5%', isPositive: true }
            }
          },
          {
            id: uuidv4(),
            type: 'metric',
            title: 'Cliques',
            size: 'small',
            position: 1,
            visible: true,
            config: {
              value: '1.973',
              change: { value: '8,8%', isPositive: true }
            }
          },
          {
            id: uuidv4(),
            type: 'metric',
            title: 'CPC',
            size: 'small',
            position: 2,
            visible: true,
            config: {
              value: 'R$ 3,19',
              change: { value: '4,9%', isPositive: false }
            }
          },
          {
            id: uuidv4(),
            type: 'metric',
            title: 'CPM',
            size: 'small',
            position: 3,
            visible: true,
            config: {
              value: 'R$ 45,81',
              change: { value: '1,2%', isPositive: false }
            }
          }
        ]
      }
    ];

    // Indicadores disponíveis para adicionar
    const initialAvailableIndicators: Indicator[] = [
      {
        id: uuidv4(),
        type: 'metric',
        title: 'CTR',
        size: 'small',
        position: 0,
        visible: true,
        config: {
          value: '0,01%',
          change: { value: '1,5%', isPositive: true }
        }
      },
      {
        id: uuidv4(),
        type: 'metric',
        title: 'Frequência',
        size: 'small',
        position: 1,
        visible: true,
        config: {
          value: '2,55',
          change: { value: '0,8%', isPositive: false }
        }
      },
      {
        id: uuidv4(),
        type: 'metric',
        title: 'Hook Rate',
        size: 'small',
        position: 2,
        visible: true,
        config: {
          value: '16,32%',
          change: { value: '2,1%', isPositive: true }
        }
      },
      {
        id: uuidv4(),
        type: 'metric',
        title: 'Eng. Página',
        size: 'small',
        position: 3,
        visible: true,
        config: {
          value: '25.030',
          change: { value: '5,7%', isPositive: true }
        }
      },
      {
        id: uuidv4(),
        type: 'timeline',
        title: 'Tendência de Cliques',
        size: 'large',
        position: 4,
        visible: true,
        config: {
          // Configuração específica para o gráfico de linha
        }
      },
      {
        id: uuidv4(),
        type: 'donut',
        title: 'Distribuição de Idade',
        size: 'medium',
        position: 5,
        visible: true,
        config: {
          // Configuração específica para o gráfico de rosca
        }
      },
      {
        id: uuidv4(),
        type: 'bar',
        title: 'Desempenho por Hora',
        size: 'medium',
        position: 6,
        visible: true,
        config: {
          // Configuração específica para o gráfico de barras
        }
      }
    ];

    // Layouts salvos
    const initialSavedLayouts = ['Padrão', 'Foco em Conversão', 'Análise de Mídia'];

    setSections(initialSections);
    setAvailableIndicators(initialAvailableIndicators);
    setSavedLayouts(initialSavedLayouts);
  }, []);

  // Adicionar um indicador a uma seção
  const addIndicator = (sectionId: string, indicator: Indicator) => {
    setSections(prevSections => {
      return prevSections.map(section => {
        if (section.id === sectionId) {
          // Encontrar a posição mais alta atual
          const highestPosition = section.indicators.length > 0
            ? Math.max(...section.indicators.map(ind => ind.position))
            : -1;
          
          // Adicionar o indicador com a próxima posição
          return {
            ...section,
            indicators: [
              ...section.indicators,
              {
                ...indicator,
                id: uuidv4(), // Gerar novo ID
                position: highestPosition + 1
              }
            ]
          };
        }
        return section;
      });
    });
  };

  // Remover um indicador de uma seção
  const removeIndicator = (sectionId: string, indicatorId: string) => {
    setSections(prevSections => {
      return prevSections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            indicators: section.indicators.filter(ind => ind.id !== indicatorId)
          };
        }
        return section;
      });
    });
  };

  // Atualizar um indicador
  const updateIndicator = (sectionId: string, updatedIndicator: Indicator) => {
    setSections(prevSections => {
      return prevSections.map(section => {
        if (section.id === sectionId) {
          return {
            ...section,
            indicators: section.indicators.map(ind => 
              ind.id === updatedIndicator.id ? updatedIndicator : ind
            )
          };
        }
        return section;
      });
    });
  };

  // Mover um indicador entre seções ou dentro da mesma seção
  const moveIndicator = (fromSectionId: string, toSectionId: string, indicatorId: string, newPosition: number) => {
    setSections(prevSections => {
      // Encontrar o indicador a ser movido
      let indicatorToMove: Indicator | undefined;
      
      // Criar uma cópia das seções para manipulação
      const updatedSections = prevSections.map(section => {
        if (section.id === fromSectionId) {
          const indicator = section.indicators.find(ind => ind.id === indicatorId);
          if (indicator) {
            indicatorToMove = { ...indicator };
            // Remover o indicador da seção de origem
            return {
              ...section,
              indicators: section.indicators.filter(ind => ind.id !== indicatorId)
            };
          }
        }
        return { ...section };
      });
      
      // Se o indicador não foi encontrado, retornar as seções sem alterações
      if (!indicatorToMove) return prevSections;
      
      // Adicionar o indicador à seção de destino na nova posição
      return updatedSections.map(section => {
        if (section.id === toSectionId) {
          // Ajustar as posições dos indicadores na seção de destino
          const reorderedIndicators = [...section.indicators];
          
          // Inserir o indicador na nova posição
          reorderedIndicators.splice(newPosition, 0, {
            ...indicatorToMove!,
            position: newPosition
          });
          
          // Atualizar as posições de todos os indicadores
          const finalIndicators = reorderedIndicators.map((ind, index) => ({
            ...ind,
            position: index
          }));
          
          return {
            ...section,
            indicators: finalIndicators
          };
        }
        return section;
      });
    });
  };

  // Adicionar uma nova seção
  const addSection = (section: DashboardSection) => {
    setSections(prevSections => {
      // Encontrar a posição mais alta atual
      const highestPosition = prevSections.length > 0
        ? Math.max(...prevSections.map(s => s.position))
        : -1;
      
      // Adicionar a seção com a próxima posição
      return [
        ...prevSections,
        {
          ...section,
          id: uuidv4(), // Gerar novo ID
          position: highestPosition + 1
        }
      ];
    });
  };

  // Remover uma seção
  const removeSection = (sectionId: string) => {
    setSections(prevSections => {
      return prevSections.filter(section => section.id !== sectionId);
    });
  };

  // Atualizar uma seção
  const updateSection = (updatedSection: DashboardSection) => {
    setSections(prevSections => {
      return prevSections.map(section => 
        section.id === updatedSection.id ? updatedSection : section
      );
    });
  };

  // Mover uma seção
  const moveSection = (sectionId: string, newPosition: number) => {
    setSections(prevSections => {
      // Encontrar a seção a ser movida
      const sectionToMove = prevSections.find(s => s.id === sectionId);
      if (!sectionToMove) return prevSections;
      
      // Remover a seção da lista
      const sectionsWithoutMoved = prevSections.filter(s => s.id !== sectionId);
      
      // Inserir a seção na nova posição
      const reorderedSections = [...sectionsWithoutMoved];
      reorderedSections.splice(newPosition, 0, sectionToMove);
      
      // Atualizar as posições de todas as seções
      return reorderedSections.map((section, index) => ({
        ...section,
        position: index
      }));
    });
  };

  // Salvar o layout atual
  const saveLayout = (name: string) => {
    // Em uma implementação real, isso salvaria no backend ou localStorage
    setSavedLayouts(prevLayouts => {
      if (prevLayouts.includes(name)) {
        return prevLayouts; // Evitar duplicatas
      }
      return [...prevLayouts, name];
    });
    
    // Aqui salvaria a configuração atual das seções e indicadores
    console.log(`Layout "${name}" salvo com configuração:`, sections);
  };

  // Carregar um layout salvo
  const loadLayout = (name: string) => {
    // Em uma implementação real, isso carregaria do backend ou localStorage
    console.log(`Carregando layout "${name}"`);
    
    // Aqui carregaria a configuração salva
    // Por enquanto, apenas um exemplo de como seria
    if (name === 'Foco em Conversão') {
      // Exemplo de configuração específica para este layout
      // Na implementação real, isso viria do armazenamento
    } else if (name === 'Análise de Mídia') {
      // Outra configuração específica
    }
    
    // Por enquanto, não fazemos nada real
  };

  // Valor do contexto
  const value = {
    sections,
    availableIndicators,
    addIndicator,
    removeIndicator,
    updateIndicator,
    moveIndicator,
    addSection,
    removeSection,
    updateSection,
    moveSection,
    saveLayout,
    loadLayout,
    savedLayouts
  };

  return (
    <DashboardContext.Provider value={value}>
      <DndProvider backend={HTML5Backend}>
        {children}
      </DndProvider>
    </DashboardContext.Provider>
  );
};

// Componente de item arrastável
interface DraggableItemProps {
  id: string;
  type: string;
  index: number;
  children: React.ReactNode;
  onMove: (dragIndex: number, hoverIndex: number) => void;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({ 
  id, 
  type, 
  index, 
  children, 
  onMove 
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag({
    type,
    item: { id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  
  const [, drop] = useDrop({
    accept: type,
    hover: (item: { id: string; index: number }, monitor) => {
      if (!ref.current) {
        return;
      }
      
      const dragIndex = item.index;
      const hoverIndex = index;
      
      // Não substituir itens consigo mesmos
      if (dragIndex === hoverIndex) {
        return;
      }
      
      // Determinar retângulo na tela
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      
      // Obter ponto médio vertical
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Determinar posição do mouse
      const clientOffset = monitor.getClientOffset();
      
      // Obter pixels para o topo
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;
      
      // Apenas realizar a movimentação quando o mouse cruzar metade da altura do item
      // Quando arrastar para baixo, apenas mover quando o cursor estiver abaixo de 50%
      // Quando arrastar para cima, apenas mover quando o cursor estiver acima de 50%
      
      // Arrastando para baixo
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      
      // Arrastando para cima
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      
      // Hora de realmente realizar a ação
      onMove(dragIndex, hoverIndex);
      
      // Nota: estamos mutando o item do monitor aqui!
      // Geralmente não é recomendado, mas é a maneira mais fácil de
      // coordenar com o React DnD (para evitar saltos estranhos)
      item.index = hoverIndex;
    },
  });
  
  // Aplicar os refs de arrastar e soltar
  drag(drop(ref));
  
  return (
    <div 
      ref={ref} 
      className={`cursor-move ${isDragging ? 'opacity-50' : ''}`}
    >
      {children}
    </div>
  );
};

// Componente de área de soltar
interface DroppableAreaProps {
  id: string;
  type: string;
  children: React.ReactNode;
  onDrop: (itemId: string, itemType: string) => void;
}

export const DroppableArea: React.FC<DroppableAreaProps> = ({ 
  id, 
  type, 
  children, 
  onDrop 
}) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: type,
    drop: (item: { id: string; type: string }) => {
      onDrop(item.id, item.type);
      return { id };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  
  return (
    <div 
      ref={drop} 
      className={`${isOver && canDrop ? 'bg-yellow-freaky/20' : ''} transition-colors duration-200`}
    >
      {children}
    </div>
  );
};

export default DashboardProvider;
