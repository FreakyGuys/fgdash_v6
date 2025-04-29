"use client";

import React, { useState } from 'react';

interface DataTableProps {
  data: Array<{
    campaign: string;
    invested: string;
    results: number;
    costPerResult: string;
    returnRate: string;
  }>;
  title: string;
  showControls?: boolean;
  showPagination?: boolean;
  pageSize?: number;
}

const DataTable: React.FC<DataTableProps> = ({ 
  data, 
  title, 
  showControls = true,
  showPagination = true,
  pageSize = 5
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtrar dados com base no termo de pesquisa
  const filteredData = data.filter(row => 
    row.campaign.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ordenar dados com base no campo e direção selecionados
  const sortedData = sortField 
    ? [...filteredData].sort((a, b) => {
        let aValue: any = a[sortField as keyof typeof a];
        let bValue: any = b[sortField as keyof typeof b];
        
        // Converter valores monetários para números
        if (typeof aValue === 'string' && aValue.includes('R$')) {
          aValue = parseFloat(aValue.replace('R$ ', '').replace('.', '').replace(',', '.'));
          bValue = parseFloat(bValue.replace('R$ ', '').replace('.', '').replace(',', '.'));
        }
        
        // Converter percentuais para números
        if (typeof aValue === 'string' && aValue.includes('%')) {
          aValue = parseFloat(aValue.replace('%', '').replace(',', '.'));
          bValue = parseFloat(bValue.replace('%', '').replace(',', '.'));
        }
        
        if (sortDirection === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      })
    : filteredData;

  // Calcular paginação
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = showPagination 
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;

  // Calcular totais
  const totals = {
    invested: sortedData.reduce((sum, row) => sum + parseFloat(row.invested.replace('R$ ', '').replace('.', '').replace(',', '.')), 0),
    results: sortedData.reduce((sum, row) => sum + row.results, 0),
    returnRate: sortedData.reduce((sum, row) => sum + parseFloat(row.returnRate.replace('%', '').replace(',', '.')), 0) / (sortedData.length || 1)
  };

  const costPerResult = totals.results > 0 
    ? totals.invested / totals.results 
    : 0;

  return (
    <div className={`bg-black/70 backdrop-blur-md border border-yellow-freaky/20 rounded-lg p-4 shadow-lg ${isFullscreen ? 'fixed inset-0 z-50 overflow-auto' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-sm font-medium">{title}</h3>
        {showControls && (
          <div className="flex space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar campanha..."
                className="bg-black/50 backdrop-blur-sm border border-gray-800/30 text-white rounded-md py-1 px-3 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-yellow-freaky focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-light" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
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
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-800">
          <thead>
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-yellow-freaky uppercase tracking-wider cursor-pointer hover:bg-gray-900/50 bg-black/30 backdrop-blur-sm"
                onClick={() => handleSort("campaign")}
              >
                <div className="flex items-center">
                  <span>Campanha</span>
                  {sortField === "campaign" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-yellow-freaky uppercase tracking-wider cursor-pointer hover:bg-gray-900/50 bg-black/30 backdrop-blur-sm"
                onClick={() => handleSort("invested")}
              >
                <div className="flex items-center">
                  <span>Investido</span>
                  {sortField === "invested" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-yellow-freaky uppercase tracking-wider cursor-pointer hover:bg-gray-900/50 bg-black/30 backdrop-blur-sm"
                onClick={() => handleSort("results")}
              >
                <div className="flex items-center">
                  <span>Resultados</span>
                  {sortField === "results" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-yellow-freaky uppercase tracking-wider cursor-pointer hover:bg-gray-900/50 bg-black/30 backdrop-blur-sm"
                onClick={() => handleSort("costPerResult")}
              >
                <div className="flex items-center">
                  <span>C/Resultado</span>
                  {sortField === "costPerResult" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-yellow-freaky uppercase tracking-wider cursor-pointer hover:bg-gray-900/50 bg-black/30 backdrop-blur-sm"
                onClick={() => handleSort("returnRate")}
              >
                <div className="flex items-center">
                  <span>% Retorno</span>
                  {sortField === "returnRate" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {paginatedData.map((row, index) => (
              <tr 
                key={index} 
                className="hover:bg-gray-800 transition-colors"
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                  {row.campaign}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                  {row.invested}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                  {row.results}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                  {row.costPerResult}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                  {row.returnRate}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-gray-900/60 backdrop-blur-sm">
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-yellow-freaky">
                Total geral
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-yellow-freaky">
                {totals.invested.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-yellow-freaky">
                {totals.results}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-yellow-freaky">
                {costPerResult.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-yellow-freaky">
                {totals.returnRate.toFixed(2).replace('.', ',')}%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      {showPagination && totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-800/30">
          <div className="text-sm text-gray-light">
            Mostrando {(currentPage - 1) * pageSize + 1} a {Math.min(currentPage * pageSize, sortedData.length)} de {sortedData.length} resultados
          </div>
          <div className="flex space-x-1 bg-black/50 backdrop-blur-sm rounded-md border border-gray-800/30 p-1">
            <button
              className={`px-3 py-1 rounded-md text-sm ${currentPage === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-800/30 hover:text-white'}`}
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Lógica para mostrar páginas ao redor da página atual
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={i}
                  className={`px-3 py-1 rounded-md text-sm ${currentPage === pageNum ? 'bg-yellow-freaky text-black-freaky' : 'text-gray-400 hover:bg-gray-800/30 hover:text-white'}`}
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              className={`px-3 py-1 rounded-md text-sm ${currentPage === totalPages ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:bg-gray-800/30 hover:text-white'}`}
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
