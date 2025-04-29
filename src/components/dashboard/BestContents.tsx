"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

// Interface para os dados de conteúdo
interface ContentItem {
  id: string;
  title: string;
  platform: 'meta' | 'google';
  imageUrl?: string;
  metrics: {
    impressions: number;
    clicks: number;
    ctr: number;
    costPerResult: number;
    frequency: number;
    conversions: number;
  };
}

interface BestContentsProps {
  data?: ContentItem[];
  loading?: boolean;
  error?: string | null;
}

const BestContents: React.FC<BestContentsProps> = ({ 
  data = [],
  loading = false,
  error = null
}) => {
  const [sortBy, setSortBy] = useState<'ctr' | 'costPerResult' | 'frequency'>('ctr');
  
  // Ordenar conteúdos com base no parâmetro selecionado
  const sortedContents = [...data].sort((a, b) => {
    if (sortBy === 'ctr') {
      return b.metrics.ctr - a.metrics.ctr;
    } else if (sortBy === 'costPerResult') {
      return a.metrics.costPerResult - b.metrics.costPerResult; // Menor é melhor
    } else {
      return a.metrics.frequency - b.metrics.frequency; // Menor é melhor
    }
  });

  // Formatar valores para exibição
  const formatValue = (value: number, type: string): string => {
    switch (type) {
      case 'ctr':
        return `${(value * 100).toFixed(2)}%`;
      case 'costPerResult':
        return `R$ ${value.toFixed(2)}`;
      case 'frequency':
        return value.toFixed(2);
      default:
        return value.toString();
    }
  };

  // Determinar a classe de cor com base no desempenho
  const getPerformanceClass = (value: number, type: string): string => {
    if (type === 'ctr') {
      return value > 0.02 ? 'text-green-500' : value > 0.01 ? 'text-yellow-400' : 'text-red-400';
    } else if (type === 'costPerResult') {
      return value < 100 ? 'text-green-500' : value < 200 ? 'text-yellow-400' : 'text-red-400';
    } else { // frequency
      return value < 2 ? 'text-green-500' : value < 3 ? 'text-yellow-400' : 'text-red-400';
    }
  };

  return (
    <Card className="bg-black-freaky/80 backdrop-blur-md border-yellow-freaky/30 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white text-lg">Melhores Conteúdos</CardTitle>
          <Tabs 
            defaultValue="ctr" 
            value={sortBy}
            onValueChange={(value) => setSortBy(value as 'ctr' | 'costPerResult' | 'frequency')}
            className="w-auto"
          >
            <TabsList className="bg-black-freaky/80 backdrop-blur-md border border-yellow-freaky/30 h-8">
              <TabsTrigger 
                value="ctr"
                className="text-xs px-2 py-1 h-6 data-[state=active]:bg-yellow-freaky data-[state=active]:text-black-freaky"
              >
                CTR
              </TabsTrigger>
              <TabsTrigger 
                value="costPerResult"
                className="text-xs px-2 py-1 h-6 data-[state=active]:bg-yellow-freaky data-[state=active]:text-black-freaky"
              >
                Custo/Resultado
              </TabsTrigger>
              <TabsTrigger 
                value="frequency"
                className="text-xs px-2 py-1 h-6 data-[state=active]:bg-yellow-freaky data-[state=active]:text-black-freaky"
              >
                Frequência
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 bg-gray-800/50" />
            ))}
          </div>
        ) : error ? (
          <div className="p-3 bg-red-900/20 border border-red-700 rounded-md text-red-400">
            <p>{error}</p>
          </div>
        ) : sortedContents.length === 0 ? (
          <div className="p-3 bg-yellow-900/20 border border-yellow-700 rounded-md text-yellow-400">
            <p>Nenhum conteúdo encontrado para o período selecionado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedContents.slice(0, 5).map((content) => (
              <div 
                key={content.id}
                className="flex items-center p-3 bg-gray-900/50 border border-gray-800/50 rounded-md hover:border-yellow-freaky/30 transition-colors"
              >
                {content.imageUrl ? (
                  <div className="w-16 h-16 mr-3 bg-gray-800 rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src={content.imageUrl} 
                      alt={content.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 mr-3 bg-gray-800 rounded-md flex items-center justify-center flex-shrink-0">
                    <span className="text-gray-500 text-xs">Sem imagem</span>
                  </div>
                )}
                
                <div className="flex-grow">
                  <h4 className="text-white text-sm font-medium truncate">{content.title}</h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    <div className="flex items-center">
                      <span className="text-gray-400 text-xs mr-1">Impressões:</span>
                      <span className="text-white text-xs">{content.metrics.impressions.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-400 text-xs mr-1">Cliques:</span>
                      <span className="text-white text-xs">{content.metrics.clicks.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-400 text-xs mr-1">Conversões:</span>
                      <span className="text-white text-xs">{content.metrics.conversions}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-400 text-xs mr-1">{sortBy === 'ctr' ? 'CTR:' : sortBy === 'costPerResult' ? 'Custo/Resultado:' : 'Frequência:'}</span>
                      <span className={`text-xs font-medium ${getPerformanceClass(content.metrics[sortBy], sortBy)}`}>
                        {formatValue(content.metrics[sortBy], sortBy)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full ${content.platform === 'meta' ? 'bg-blue-900/30 text-blue-400' : 'bg-red-900/30 text-red-400'}`}>
                    {content.platform === 'meta' ? 'Meta' : 'Google'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BestContents;
