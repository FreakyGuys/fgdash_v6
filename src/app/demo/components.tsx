// Arquivo para criar imagens de demonstração dos componentes principais

import React from 'react';

// Componentes de demonstração visual
export const MetricCardDemo = () => (
  <div className="bg-black border border-yellow-freaky/30 rounded-lg p-4 shadow-lg">
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-white font-bold">Investido</h3>
      <div className="bg-yellow-freaky rounded-full p-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    </div>
    <div className="mb-2">
      <div className="text-2xl font-bold text-white">R$ 6.302,07</div>
      <div className="flex items-center text-sm">
        <span className="text-green-500 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          17,5%
        </span>
        <span className="text-gray-400 ml-2">vs período anterior</span>
      </div>
    </div>
    <div className="w-full bg-gray-800 rounded-full h-2">
      <div className="bg-gradient-to-r from-yellow-freaky to-yellow-300 h-2 rounded-full" style={{ width: '100%' }}></div>
    </div>
  </div>
);

export const TimelineChartDemo = () => (
  <div className="bg-black border border-yellow-freaky/30 rounded-lg p-4 shadow-lg">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-white font-bold">Visão Temporal</h3>
      <div className="flex space-x-2">
        <button className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-2 py-1 rounded">7D</button>
        <button className="bg-yellow-freaky text-black text-xs px-2 py-1 rounded">30D</button>
        <button className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-2 py-1 rounded">90D</button>
      </div>
    </div>
    <div className="h-48 relative">
      {/* Simulação do gráfico de linha */}
      <div className="absolute inset-0 flex items-end">
        <div className="w-full h-full flex items-end">
          {Array.from({ length: 30 }).map((_, i) => (
            <div 
              key={i} 
              className="flex-1 bg-gradient-to-t from-transparent to-yellow-freaky/30"
              style={{ 
                height: `${Math.sin(i * 0.2) * 30 + 50}%`,
                borderTop: '2px solid #FFDD00'
              }}
            ></div>
          ))}
        </div>
      </div>
      {/* Linha de tendência */}
      <div className="absolute inset-0 flex items-end pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path 
            d={`M0,${50} ${Array.from({ length: 30 }).map((_, i) => `L${i * 3.33},${50 - Math.sin(i * 0.2) * 30}`).join(' ')}`}
            stroke="#FFDD00"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      </div>
      {/* Eixos */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gray-700"></div>
      <div className="absolute top-0 left-0 h-full w-px bg-gray-700"></div>
    </div>
    <div className="flex justify-between mt-2 text-xs text-gray-400">
      <span>01/04</span>
      <span>15/04</span>
      <span>30/04</span>
    </div>
  </div>
);

export const DonutChartDemo = () => (
  <div className="bg-black border border-yellow-freaky/30 rounded-lg p-4 shadow-lg">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-white font-bold">Devices / Demográficos</h3>
      <div className="flex space-x-1">
        <button className="text-gray-400 hover:text-yellow-freaky">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
          </svg>
        </button>
      </div>
    </div>
    <div className="flex justify-center">
      <div className="relative w-40 h-40">
        {/* Simulação do gráfico de rosca */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#FF6384" strokeWidth="20" strokeDasharray="75 175" />
          <circle cx="50" cy="50" r="40" fill="transparent" stroke="#FFDD00" strokeWidth="20" strokeDasharray="175 75" strokeDashoffset="-75" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white text-sm">Total</div>
            <div className="text-white font-bold text-xl">7.980</div>
          </div>
        </div>
      </div>
    </div>
    <div className="flex justify-center mt-4 space-x-6">
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full bg-yellow-freaky mr-2"></div>
        <div>
          <div className="text-white text-sm">Mobile Web</div>
          <div className="text-white font-bold">6.918 (86,7%)</div>
        </div>
      </div>
      <div className="flex items-center">
        <div className="w-3 h-3 rounded-full bg-[#FF6384] mr-2"></div>
        <div>
          <div className="text-white text-sm">Desktop</div>
          <div className="text-white font-bold">1.062 (13,3%)</div>
        </div>
      </div>
    </div>
  </div>
);

export const PeriodBarChartDemo = () => (
  <div className="bg-black border border-yellow-freaky/30 rounded-lg p-4 shadow-lg">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-white font-bold">Período</h3>
      <div className="flex space-x-1">
        <button className="text-gray-400 hover:text-yellow-freaky">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
          </svg>
        </button>
      </div>
    </div>
    <div className="space-y-3">
      {/* Simulação do gráfico de barras horizontais */}
      <div className="flex items-center">
        <div className="w-10 text-right text-gray-400 text-sm mr-2">seg</div>
        <div className="flex-1 h-6 bg-gray-800 rounded-sm overflow-hidden">
          <div className="h-full bg-[#FF6384]" style={{ width: '100%' }}></div>
        </div>
        <div className="w-6 text-right text-white text-sm ml-2">8</div>
      </div>
      <div className="flex items-center">
        <div className="w-10 text-right text-gray-400 text-sm mr-2">ter</div>
        <div className="flex-1 h-6 bg-gray-800 rounded-sm overflow-hidden">
          <div className="h-full bg-[#FF6384]" style={{ width: '75%' }}></div>
        </div>
        <div className="w-6 text-right text-white text-sm ml-2">6</div>
      </div>
      <div className="flex items-center">
        <div className="w-10 text-right text-gray-400 text-sm mr-2">qua</div>
        <div className="flex-1 h-6 bg-gray-800 rounded-sm overflow-hidden">
          <div className="h-full bg-[#FF6384]" style={{ width: '87.5%' }}></div>
        </div>
        <div className="w-6 text-right text-white text-sm ml-2">7</div>
      </div>
      <div className="flex items-center">
        <div className="w-10 text-right text-gray-400 text-sm mr-2">qui</div>
        <div className="flex-1 h-6 bg-gray-800 rounded-sm overflow-hidden">
          <div className="h-full bg-[#FF6384]" style={{ width: '62.5%' }}></div>
        </div>
        <div className="w-6 text-right text-white text-sm ml-2">5</div>
      </div>
      <div className="flex items-center">
        <div className="w-10 text-right text-gray-400 text-sm mr-2">sex</div>
        <div className="flex-1 h-6 bg-gray-800 rounded-sm overflow-hidden">
          <div className="h-full bg-[#FF6384]" style={{ width: '50%' }}></div>
        </div>
        <div className="w-6 text-right text-white text-sm ml-2">4</div>
      </div>
    </div>
  </div>
);

export const DataTableDemo = () => (
  <div className="bg-black border border-yellow-freaky/30 rounded-lg p-4 shadow-lg">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-white font-bold">Campaign</h3>
      <div className="flex space-x-1">
        <button className="text-gray-400 hover:text-yellow-freaky">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-400 border-b border-gray-800">
            <th className="text-left py-2">Campaign</th>
            <th className="text-right py-2">Investido</th>
            <th className="text-right py-2">Mensag...</th>
            <th className="text-right py-2">C/Mensagem</th>
            <th className="text-right py-2">% Mensagem</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-800 hover:bg-gray-900">
            <td className="py-2 text-white">V - [STR] [GTR] - [Vendas] - [C-S] - [Adv+] - Público Frio Campanha</td>
            <td className="py-2 text-right text-white">R$ 2.835,59</td>
            <td className="py-2 text-right text-white">11</td>
            <td className="py-2 text-right text-white">R$ 257,78</td>
            <td className="py-2 text-right text-white">1,39%</td>
          </tr>
          <tr className="border-b border-gray-800 hover:bg-gray-900">
            <td className="py-2 text-white">V - [34] [GTR] - [Compras Advantage] [C-S] - Públicos Frios</td>
            <td className="py-2 text-right text-white">R$ 692,09</td>
            <td className="py-2 text-right text-white">4</td>
            <td className="py-2 text-right text-white">R$ 173,02</td>
            <td className="py-2 text-right text-white">1,86%</td>
          </tr>
          <tr className="border-b border-gray-800 hover:bg-gray-900">
            <td className="py-2 text-white">V - [45] [STR] - [Vendas] - [C-S] - [ABO] - Públicos Frios</td>
            <td className="py-2 text-right text-white">R$ 1.030,51</td>
            <td className="py-2 text-right text-white">3</td>
            <td className="py-2 text-right text-white">R$ 343,5</td>
            <td className="py-2 text-right text-white">1,17%</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="bg-gray-900">
            <td className="py-2 font-bold text-white">Total geral</td>
            <td className="py-2 text-right font-bold text-white">R$ 6.302,07</td>
            <td className="py-2 text-right font-bold text-white">28</td>
            <td className="py-2 text-right font-bold text-white">R$ 225,07</td>
            <td className="py-2 text-right font-bold text-white">1,42%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
);

export const AdPreviewDemo = () => (
  <div className="bg-black border border-yellow-freaky/30 rounded-lg p-4 shadow-lg">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-white font-bold">Melhores Anúncios</h3>
      <div className="flex space-x-1">
        <button className="text-gray-400 hover:text-yellow-freaky">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
      </div>
    </div>
    <div className="space-y-4">
      <div className="flex space-x-3">
        <div className="w-20 h-20 bg-gray-800 rounded flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-white font-medium mb-1">Anúncio 1 - Venda Direta</div>
          <div className="flex space-x-4 text-sm">
            <div>
              <div className="text-gray-400">Impressões</div>
              <div className="text-white font-medium">53.939</div>
            </div>
            <div>
              <div className="text-gray-400">Cliques</div>
              <div className="text-white font-medium">1.973</div>
            </div>
            <div>
              <div className="text-gray-400">Conversões</div>
              <div className="text-white font-medium">4</div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex space-x-3">
        <div className="w-20 h-20 bg-gray-800 rounded flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-white font-medium mb-1">Anúncio 2 - Promoção Especial</div>
          <div className="flex space-x-4 text-sm">
            <div>
              <div className="text-gray-400">Impressões</div>
              <div className="text-white font-medium">37.567</div>
            </div>
            <div>
              <div className="text-gray-400">Cliques</div>
              <div className="text-white font-medium">1.173</div>
            </div>
            <div>
              <div className="text-gray-400">Conversões</div>
              <div className="text-white font-medium">4</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const IndicatorConfigPanelDemo = () => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-dark-blue border border-yellow-freaky/30 rounded-lg p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Adicionar Indicador</h2>
        <button className="text-gray-light hover:text-yellow-freaky">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="mb-4">
        <label className="block text-white text-sm font-medium mb-2">
          Escolher Indicador Existente
        </label>
        <select className="bg-black border border-gray-800 text-white rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-yellow-freaky focus:border-transparent">
          <option value="">Criar Novo Indicador</option>
          <option value="ctr">CTR (metric)</option>
          <option value="frequency">Frequência (metric)</option>
          <option value="hook_rate">Hook Rate (metric)</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-white text-sm font-medium mb-2">
          Título
        </label>
        <input
          type="text"
          className="bg-black border border-gray-800 text-white rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-yellow-freaky focus:border-transparent"
          placeholder="Ex: Taxa de Conversão"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-white text-sm font-medium mb-2">
          Tipo
        </label>
        <select className="bg-black border border-gray-800 text-white rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-yellow-freaky focus:border-transparent">
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
              checked
              className="mr-2 text-yellow-freaky focus:ring-yellow-freaky"
            />
            <span className="text-white">Pequeno</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="size"
              value="medium"
              className="mr-2 text-yellow-freaky focus:ring-yellow-freaky"
            />
            <span className="text-white">Médio</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="size"
              value="large"
              className="mr-2 text-yellow-freaky focus:ring-yellow-freaky"
            />
            <span className="text-white">Grande</span>
          </label>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button className="bg-transparent border border-yellow-freaky text-yellow-freaky font-medium py-2 px-4 rounded-md hover:bg-yellow-freaky/10 transition-colors">
          Cancelar
        </button>
        <button className="bg-yellow-freaky text-black font-medium py-2 px-4 rounded-md hover:bg-yellow-300 transition-colors">
          Adicionar
        </button>
      </div>
    </div>
  </div>
);

export const DynamicDashboardDemo = () => (
  <div className="min-h-screen bg-dark-blue">
    {/* Barra de ferramentas de edição */}
    <div className="bg-black border-b border-yellow-freaky/30 p-4 sticky top-0 z-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-white mr-4">Dashboard</h1>
          <button className="bg-yellow-freaky text-black px-3 py-1 rounded-md text-sm">
            Concluir Edição
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="bg-transparent border border-yellow-freaky text-yellow-freaky font-medium py-1 px-3 rounded-md hover:bg-yellow-freaky/10 transition-colors text-sm">
            Nova Seção
          </button>
          <button className="bg-transparent border border-yellow-freaky text-yellow-freaky font-medium py-1 px-3 rounded-md hover:bg-yellow-freaky/10 transition-colors text-sm">
            Salvar Layout
          </button>
          <select className="bg-black border border-gray-800 text-white rounded-md py-1 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-freaky focus:border-transparent">
            <option value="" disabled selected>Carregar Layout</option>
            <option value="padrao">Padrão</option>
            <option value="conversao">Foco em Conversão</option>
            <option value="midia">Análise de Mídia</option>
          </select>
        </div>
      </div>
    </div>
    
    {/* Conteúdo principal */}
    <main className="p-4">
      <div className="mb-8">
        <div className="bg-black/50 border border-yellow-freaky/30 rounded-lg p-2 mb-2">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center">
              <span className="mr-2">≡</span> Métricas Principais
            </h2>
            <div className="flex space-x-2">
              <button className="text-gray-light hover:text-yellow-freaky" title="Adicionar Indicador">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button className="text-gray-light hover:text-yellow-freaky" title="Editar Seção">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button className="text-gray-light hover:text-red-500" title="Remover Seção">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="col-span-1">
            <div className="relative">
              <div className="absolute top-0 right-0 z-10 bg-black/70 rounded-bl-lg p-1 flex space-x-1">
                <button className="text-gray-light hover:text-yellow-freaky" title="Editar Indicador">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button className="text-gray-light hover:text-red-500" title="Remover Indicador">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="opacity-80 pointer-events-none">
                <MetricCardDemo />
              </div>
            </div>
          </div>
          
          <div className="col-span-1">
            <div className="relative">
              <div className="absolute top-0 right-0 z-10 bg-black/70 rounded-bl-lg p-1 flex space-x-1">
                <button className="text-gray-light hover:text-yellow-freaky" title="Editar Indicador">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button className="text-gray-light hover:text-red-500" title="Remover Indicador">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="opacity-80 pointer-events-none">
                <div className="bg-black border border-yellow-freaky/30 rounded-lg p-4 shadow-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-bold">Resultado</h3>
                    <div className="bg-yellow-freaky rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="text-2xl font-bold text-white">28</div>
                    <div className="flex items-center text-sm">
                      <span className="text-green-500 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        22,2%
                      </span>
                      <span className="text-gray-400 ml-2">vs período anterior</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-gradient-to-r from-yellow-freaky to-yellow-300 h-2 rounded-full" style={{ width: '127%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <div className="bg-black/50 border border-yellow-freaky/30 rounded-lg p-2 mb-2">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-white flex items-center">
              <span className="mr-2">≡</span> Visão Geral
            </h2>
            <div className="flex space-x-2">
              <button className="text-gray-light hover:text-yellow-freaky" title="Adicionar Indicador">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button className="text-gray-light hover:text-yellow-freaky" title="Editar Seção">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button className="text-gray-light hover:text-red-500" title="Remover Seção">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2">
            <div className="relative">
              <div className="absolute top-0 right-0 z-10 bg-black/70 rounded-bl-lg p-1 flex space-x-1">
                <button className="text-gray-light hover:text-yellow-freaky" title="Editar Indicador">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button className="text-gray-light hover:text-red-500" title="Remover Indicador">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="opacity-80 pointer-events-none">
                <TimelineChartDemo />
              </div>
            </div>
          </div>
          
          <div className="col-span-1">
            <div className="relative">
              <div className="absolute top-0 right-0 z-10 bg-black/70 rounded-bl-lg p-1 flex space-x-1">
                <button className="text-gray-light hover:text-yellow-freaky" title="Editar Indicador">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button className="text-gray-light hover:text-red-500" title="Remover Indicador">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="opacity-80 pointer-events-none">
                <DonutChartDemo />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
);

export default function DemoComponents() {
  return (
    <div className="p-4 bg-dark-blue min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">Componentes do Dashboard Freaky Guys</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">MetricCard</h2>
          <MetricCardDemo />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-4">TimelineChart</h2>
          <TimelineChartDemo />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">DonutChart</h2>
          <DonutChartDemo />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white mb-4">PeriodBarChart</h2>
          <PeriodBarChartDemo />
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">DataTable</h2>
        <DataTableDemo />
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">AdPreview</h2>
        <AdPreviewDemo />
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Painel de Configuração de Indicadores</h2>
        <div className="border border-yellow-freaky/30 rounded-lg p-4">
          <p className="text-white mb-4">O painel de configuração permite adicionar ou editar indicadores no dashboard.</p>
          <img src="/indicator-config-panel.png" alt="Painel de Configuração de Indicadores" className="w-full max-w-md mx-auto rounded-lg border border-gray-700" />
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Dashboard Dinâmico</h2>
        <div className="border border-yellow-freaky/30 rounded-lg p-4">
          <p className="text-white mb-4">O dashboard dinâmico permite arrastar e soltar indicadores, adicionar/remover seções e salvar layouts personalizados.</p>
          <img src="/dynamic-dashboard.png" alt="Dashboard Dinâmico" className="w-full rounded-lg border border-gray-700" />
        </div>
      </div>
    </div>
  );
}
