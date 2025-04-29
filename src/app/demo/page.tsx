// Arquivo para gerar capturas de tela do dashboard
// Este arquivo simula a aparência dos componentes para demonstração visual

import React from 'react';
import { DashboardProvider } from '@/context/DashboardContext';
import DynamicDashboard from '@/components/dashboard/DynamicDashboard';

export default function DashboardDemo() {
  return (
    <DashboardProvider>
      <DynamicDashboard />
    </DashboardProvider>
  );
}
