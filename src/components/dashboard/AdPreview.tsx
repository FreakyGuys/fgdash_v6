"use client";

import React, { useState } from 'react';

interface AdPreviewProps {
  ads: Array<{
    id: string;
    name: string;
    imageUrl: string;
    metrics: {
      impressions: number;
      clicks: number;
      conversions: number;
    };
  }>;
  title: string;
  showControls?: boolean;
}

const AdPreview: React.FC<AdPreviewProps> = ({ 
  ads, 
  title,
  showControls = true
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'impressions' | 'clicks' | 'conversions'>('conversions');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleSort = (field: 'name' | 'impressions' | 'clicks' | 'conversions') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  // Ordenar anúncios com base no campo e direção selecionados
  const sortedAds = [...ads].sort((a, b) => {
    if (sortBy === 'name') {
      return sortDirection === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else {
      const aValue = a.metrics[sortBy];
      const bValue = b.metrics[sortBy];
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
  });

  // Calcular CTR e taxa de conversão
  const calculateCTR = (impressions: number, clicks: number) => {
    if (impressions === 0) return 0;
    return (clicks / impressions) * 100;
  };

  const calculateConversionRate = (clicks: number, conversions: number) => {
    if (clicks === 0) return 0;
    return (conversions / clicks) * 100;
  };

  return (
    <div className={`bg-black border border-yellow-freaky/30 rounded-lg p-4 shadow-md ${isFullscreen ? 'fixed inset-0 z-50 overflow-auto' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-white text-sm font-medium">{title}</h3>
        {showControls && (
          <div className="flex space-x-2">
            <div className="flex bg-dark-blue rounded-md overflow-hidden text-xs">
              <button 
                className={`px-2 py-1 ${sortBy === 'conversions' ? 'bg-yellow-freaky text-black' : 'text-gray-light'}`}
                onClick={() => handleSort('conversions')}
              >
                Conversões
              </button>
              <button 
                className={`px-2 py-1 ${sortBy === 'clicks' ? 'bg-yellow-freaky text-black' : 'text-gray-light'}`}
                onClick={() => handleSort('clicks')}
              >
                Cliques
              </button>
              <button 
                className={`px-2 py-1 ${sortBy === 'impressions' ? 'bg-yellow-freaky text-black' : 'text-gray-light'}`}
                onClick={() => handleSort('impressions')}
              >
                Impressões
              </button>
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
      
      <div className="grid grid-cols-1 gap-4">
        {sortedAds.map((ad) => (
          <div 
            key={ad.id} 
            className={`flex border rounded-lg overflow-hidden transition-colors ${
              selectedAd === ad.id 
                ? 'border-yellow-freaky bg-gray-900/50' 
                : 'border-gray-800 hover:border-yellow-freaky/50 hover:bg-gray-900/30'
            }`}
            onClick={() => setSelectedAd(selectedAd === ad.id ? null : ad.id)}
          >
            <div className="w-24 h-24 bg-gray-800 flex-shrink-0">
              {ad.imageUrl ? (
                <img 
                  src={ad.imageUrl} 
                  alt={ad.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            
            <div className="flex-1 p-3">
              <h4 className="text-white text-sm font-medium truncate">{ad.name}</h4>
              
              <div className="mt-2 grid grid-cols-3 gap-2">
                <div>
                  <p className="text-xs text-gray-light">Impressões</p>
                  <p className="text-sm text-white">{ad.metrics.impressions.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-light">Cliques</p>
                  <p className="text-sm text-white">{ad.metrics.clicks.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-light">Conversões</p>
                  <p className="text-sm text-white">{ad.metrics.conversions.toLocaleString()}</p>
                </div>
              </div>
              
              {selectedAd === ad.id && (
                <div className="mt-3 pt-3 border-t border-gray-800 grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-gray-light">CTR</p>
                    <p className="text-sm text-white">
                      {calculateCTR(ad.metrics.impressions, ad.metrics.clicks).toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-light">Taxa de Conversão</p>
                    <p className="text-sm text-white">
                      {calculateConversionRate(ad.metrics.clicks, ad.metrics.conversions).toFixed(2)}%
                    </p>
                  </div>
                  <div className="col-span-2 mt-2">
                    <div className="flex justify-between text-xs text-gray-light mb-1">
                      <span>Desempenho</span>
                      <span>Excelente</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-freaky to-yellow-300 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, calculateConversionRate(ad.metrics.clicks, ad.metrics.conversions) * 5)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col justify-center px-3 text-gray-light">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 transition-transform ${selectedAd === ad.id ? 'rotate-180' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        ))}
      </div>
      
      {ads.length === 0 && (
        <div className="py-8 text-center text-gray-light">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p>Nenhum anúncio encontrado</p>
        </div>
      )}
    </div>
  );
};

export default AdPreview;
