"use client";

import React from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Navbar from '@/components/ui/Navbar';
import FilterBar from '@/components/ui/FilterBar';
import MetricCard from '@/components/dashboard/MetricCard';
import TimelineChart from '@/components/dashboard/TimelineChart';
import DonutChart from '@/components/dashboard/DonutChart';
import PeriodBarChart from '@/components/dashboard/PeriodBarChart';
import DataTable from '@/components/dashboard/DataTable';
import AdPreview from '@/components/dashboard/AdPreview';

// Dados simulados para o dashboard
const mockTimelineData = [
  { date: '1', value: 200 },
  { date: '3', value: 300 },
  { date: '5', value: 250 },
  { date: '7', value: 320 },
  { date: '9', value: 280 },
  { date: '11', value: 350 },
  { date: '13', value: 300 },
  { date: '15', value: 280 },
  { date: '17', value: 240 },
  { date: '19', value: 300 },
  { date: '21', value: 320 },
  { date: '23', value: 270 },
  { date: '25', value: 290 },
  { date: '27', value: 310 },
  { date: '29', value: 270 },
];

const mockDeviceData = [
  { name: 'Desktop', value: 35, color: '#FF6384' },
  { name: 'Mobile', value: 65, color: '#FFDD00' },
];

const mockPeriodData = [
  { period: 'seg', value: 120 },
  { period: 'ter', value: 150 },
  { period: 'qua', value: 180 },
  { period: 'qui', value: 140 },
  { period: 'sex', value: 160 },
  { period: 'sáb', value: 90 },
  { period: 'dom', value: 70 },
];

const mockTableData = [
  {
    campaign: 'V - [34] - [GTB] - [Vendas] - [C-S] - [Ads+] - Público Frio Campanha',
    invested: 'R$ 2.835,59',
    results: 11,
    costPerResult: 'R$ 257,78',
    returnRate: '1,39%',
  },
  {
    campaign: 'V - [34] - [GTB] - [Compras Advantage] [C-S] - Públicos Frios',
    invested: 'R$ 692,09',
    results: 4,
    costPerResult: 'R$ 173,02',
    returnRate: '1,86%',
  },
  {
    campaign: 'V - [45] - [GTB] - [Vendas] - [C-S] - [ABO] - Públicos Frios',
    invested: 'R$ 1.030,51',
    results: 3,
    costPerResult: 'R$ 343,5',
    returnRate: '1,17%',
  },
  {
    campaign: '[43] - [GTB] - [Vendas] - [C-S] - [ABO] - Público Frio',
    invested: 'R$ 979,01',
    results: 3,
    costPerResult: 'R$ 326,34',
    returnRate: '1,06%',
  },
  {
    campaign: '[33] - [GTB] - [Vendas] - [C-S] - [ABO] - RMKT',
    invested: 'R$ 139,53',
    results: 2,
    costPerResult: 'R$ 69,77',
    returnRate: '5%',
  },
];

const mockAdsData = [
  {
    id: '1',
    name: '[AD] - Oferta Especial - Público Frio',
    imageUrl: '',
    metrics: {
      impressions: 53939,
      clicks: 1973,
      conversions: 4,
    },
  },
  {
    id: '2',
    name: '[AD] - 20% OFF - Público Morno',
    imageUrl: '',
    metrics: {
      impressions: 42567,
      clicks: 1532,
      conversions: 7,
    },
  },
];

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-dark-blue">
      <Sidebar activeItem="dashboard" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
        <div className="flex-1 overflow-y-auto p-6">
          <FilterBar />
          
          {/* Métricas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <MetricCard 
              title="Investido" 
              value="R$ 6.302,07" 
              change={{ value: "12.5%", isPositive: true }} 
              progressPercentage={100}
            />
            <MetricCard 
              title="Resultado" 
              value="28" 
              change={{ value: "27.3%", isPositive: true }} 
              progressPercentage={75}
            />
            <MetricCard 
              title="Custo por Resultado" 
              value="R$ 225,07" 
              change={{ value: "8.3%", isPositive: false }} 
              progressPercentage={70}
            />
            <MetricCard 
              title="Retorno" 
              value="1,42%" 
              change={{ value: "11.5%", isPositive: true }} 
              progressPercentage={85}
            />
          </div>
          
          {/* Métricas Complementares */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <MetricCard 
              title="VV 25%" 
              value="6.918" 
              change={{ value: "10.5%", isPositive: true }} 
              progressPercentage={65}
            />
            <MetricCard 
              title="VV 50%" 
              value="3.614" 
              change={{ value: "8.3%", isPositive: true }} 
              progressPercentage={55}
            />
            <MetricCard 
              title="VV 75%" 
              value="1.933" 
              change={{ value: "5.2%", isPositive: true }} 
              progressPercentage={45}
            />
            <MetricCard 
              title="VV 95%" 
              value="1.062" 
              change={{ value: "3.1%", isPositive: true }} 
              progressPercentage={35}
            />
          </div>
          
          {/* Gráficos e Tabelas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <TimelineChart 
              title="Visão Temporal" 
              data={mockTimelineData} 
            />
            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard 
                  title="Impressões" 
                  value="137.567" 
                  change={{ value: "10.5%", isPositive: true }} 
                  progressPercentage={75}
                />
                <MetricCard 
                  title="Cliques" 
                  value="1.973" 
                  change={{ value: "8.3%", isPositive: true }} 
                  progressPercentage={65}
                />
                <MetricCard 
                  title="Alcance" 
                  value="53.939" 
                  change={{ value: "12.4%", isPositive: true }} 
                  progressPercentage={70}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard 
                  title="CPC" 
                  value="R$ 3,19" 
                  change={{ value: "5.6%", isPositive: false }} 
                  progressPercentage={60}
                />
                <MetricCard 
                  title="CPM" 
                  value="R$ 45,81" 
                  change={{ value: "7.2%", isPositive: false }} 
                  progressPercentage={55}
                />
                <MetricCard 
                  title="CTR" 
                  value="R$ 0,01" 
                  change={{ value: "1.5%", isPositive: true }} 
                  progressPercentage={50}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard 
                  title="Frequência" 
                  value="2,55" 
                  change={{ value: "0.5%", isPositive: true }} 
                  progressPercentage={45}
                />
                <MetricCard 
                  title="Hook Rate" 
                  value="16,32%" 
                  change={{ value: "2.3%", isPositive: true }} 
                  progressPercentage={65}
                />
                <MetricCard 
                  title="Eng. Página" 
                  value="25.030" 
                  change={{ value: "8.7%", isPositive: true }} 
                  progressPercentage={70}
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <DataTable 
              title="Campanhas" 
              data={mockTableData} 
            />
            <div className="grid grid-cols-1 gap-6">
              <DonutChart 
                title="Devices / Demográficos" 
                data={mockDeviceData} 
              />
              <PeriodBarChart 
                title="Período" 
                data={mockPeriodData} 
              />
            </div>
          </div>
          
          <div className="mb-6">
            <AdPreview 
              title="Melhores Anúncios" 
              ads={mockAdsData} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
