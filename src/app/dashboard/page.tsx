import React from 'react';
import ClientTabSelector from '@/components/dashboard/ClientTabSelector';
import AccountSelector from '@/components/dashboard/AccountSelector';
import MetricCard from '@/components/dashboard/MetricCard';
import TimelineChart from '@/components/dashboard/TimelineChart';
import DonutChart from '@/components/dashboard/DonutChart';
import PeriodBarChart from '@/components/dashboard/PeriodBarChart';
import DataTable from '@/components/dashboard/DataTable';
import BestContents from '@/components/dashboard/BestContents';
import { DashboardProvider, useDashboard } from '@/context/DashboardContext';

// Sample Data for Charts
const sampleTimelineData = [
  { date: '2024-01-01', value: 1200 },
  { date: '2024-01-02', value: 1500 },
  { date: '2024-01-03', value: 1100 },
  { date: '2024-01-04', value: 1800 },
  { date: '2024-01-05', value: 1600 },
  { date: '2024-01-06', value: 1900 },
  { date: '2024-01-07', value: 2100 },
  { date: '2024-01-08', value: 2000 },
  { date: '2024-01-09', value: 2300 },
  { date: '2024-01-10', value: 2200 },
  { date: '2024-01-11', value: 2500 },
  { date: '2024-01-12', value: 2400 },
  { date: '2024-01-13', value: 2700 },
  { date: '2024-01-14', value: 2600 },
  { date: '2024-01-15', value: 2900 },
  { date: '2024-01-16', value: 2800 },
  { date: '2024-01-17', value: 3100 },
  { date: '2024-01-18', value: 3000 },
  { date: '2024-01-19', value: 3300 },
  { date: '2024-01-20', value: 3200 },
  { date: '2024-01-21', value: 3500 },
  { date: '2024-01-22', value: 3400 },
  { date: '2024-01-23', value: 3700 },
  { date: '2024-01-24', value: 3600 },
  { date: '2024-01-25', value: 3900 },
  { date: '2024-01-26', value: 3800 },
  { date: '2024-01-27', value: 4100 },
  { date: '2024-01-28', value: 4000 },
  { date: '2024-01-29', value: 4300 },
  { date: '2024-01-30', value: 4200 },
];

const sampleDonutData = [
  { name: 'Desktop', value: 400, color: '#FFDD00' },
  { name: 'Mobile', value: 300, color: '#FF6384' },
  { name: 'Tablet', value: 300, color: '#36A2EB' },
  { name: 'Outros', value: 200, color: '#FFCE56' },
];

const sampleBarData = [
  { period: 'Semana 1', value: 4000 },
  { period: 'Semana 2', value: 3000 },
  { period: 'Semana 3', value: 2000 },
  { period: 'Semana 4', value: 2780 },
  { period: 'Semana 5', value: 1890 },
  { period: 'Semana 6', value: 2390 },
  { period: 'Semana 7', value: 3490 },
];

const sampleTableData = [
  { id: '1', campaignName: 'Campanha Black Friday', status: 'Ativa', invested: 1500.00, result: 30, costPerResult: 50.00, ctr: 2.5, frequency: 1.8 },
  { id: '2', campaignName: 'Promoção Verão', status: 'Pausada', invested: 800.50, result: 15, costPerResult: 53.37, ctr: 1.8, frequency: 1.5 },
  { id: '3', campaignName: 'Lançamento Produto X', status: 'Ativa', invested: 2500.75, result: 55, costPerResult: 45.47, ctr: 3.1, frequency: 2.1 },
  { id: '4', campaignName: 'Dia das Mães', status: 'Concluída', invested: 1200.00, result: 25, costPerResult: 48.00, ctr: 2.2, frequency: 1.9 },
  { id: '5', campaignName: 'Campanha Institucional', status: 'Ativa', invested: 3000.00, result: 40, costPerResult: 75.00, ctr: 1.5, frequency: 2.5 },
];

const sampleBestContents = [
  { id: 'c1', name: 'Vídeo Promocional Verão', type: 'Vídeo', metricValue: 5.5, metricName: 'CTR (%)' },
  { id: 'c2', name: 'Carrossel Black Friday', type: 'Carrossel', metricValue: 45.00, metricName: 'Custo por Resultado' },
  { id: 'c3', name: 'Imagem Dia das Mães', type: 'Imagem', metricValue: 2.8, metricName: 'Frequência' },
  { id: 'c4', name: 'Stories Lançamento', type: 'Stories', metricValue: 4.8, metricName: 'CTR (%)' },
  { id: 'c5', name: 'Reels Institucional', type: 'Vídeo', metricValue: 60.50, metricName: 'Custo por Resultado' },
];

const DashboardContent: React.FC = () => {
  const { isDemoMode } = useDashboard();

  // TODO: Replace sample data with fetched data when not in demo mode
  const timelineData = isDemoMode ? sampleTimelineData : []; // Replace with API data
  const donutData = isDemoMode ? sampleDonutData : []; // Replace with API data
  const barData = isDemoMode ? sampleBarData : []; // Replace with API data
  const tableData = isDemoMode ? sampleTableData : []; // Replace with API data
  const bestContentsData = isDemoMode ? sampleBestContents : []; // Replace with API data

  // Sample metric values for demo mode
  const invested = isDemoMode ? 5830.25 : 0;
  const result = isDemoMode ? 125 : 0;
  const costPerResult = isDemoMode ? 46.64 : 0;
  const roi = isDemoMode ? 3.5 : 0; // Assuming some ROI calculation

  return (
    <div className="flex-1 p-6 bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-y-auto">
      <div className="mb-6">
        <ClientTabSelector />
      </div>
      <div className="mb-6">
        <AccountSelector />
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard title="Investido" value={invested} formatAs="currency" />
        <MetricCard title="Resultado" value={result} />
        <MetricCard title="Custo por Resultado" value={costPerResult} formatAs="currency" />
        <MetricCard title="Retorno (ROI)" value={roi} formatAs="multiplier" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TimelineChart title="Desempenho Geral (Timeline)" data={timelineData} />
        <DonutChart title="Dispositivos/Demográficos" data={donutData} />
      </div>

      {/* Table and Bar Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <DataTable title="Campanhas Ativas" data={tableData} />
        </div>
        <PeriodBarChart title="Análise por Período" data={barData} layout="vertical" />
      </div>

      {/* Best Contents Section */}
      <div className="mb-6">
        <BestContents data={bestContentsData} />
      </div>

      {/* Placeholder for other sections/charts */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black/70 backdrop-blur-md border border-yellow-freaky/20 rounded-lg p-4 shadow-lg min-h-[200px]">
          <h3 className="text-white text-sm font-medium mb-4">Outro Gráfico/Seção</h3>
          <p className="text-gray-light text-center">Placeholder</p>
        </div>
        <div className="bg-black/70 backdrop-blur-md border border-yellow-freaky/20 rounded-lg p-4 shadow-lg min-h-[200px]">
          <h3 className="text-white text-sm font-medium mb-4">Mais Dados</h3>
          <p className="text-gray-light text-center">Placeholder</p>
        </div>
      </div> */}
    </div>
  );
};

const DashboardPage: React.FC = () => {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
};

export default DashboardPage;

