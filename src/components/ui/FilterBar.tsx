"use client";

import React from 'react';

interface FilterBarProps {
  onFilterChange?: (filters: any) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange }) => {
  const [selectedAccount, setSelectedAccount] = React.useState('all');
  const [selectedCampaign, setSelectedCampaign] = React.useState('all');
  const [selectedAdSet, setSelectedAdSet] = React.useState('all');
  const [selectedObjective, setSelectedObjective] = React.useState('all');

  const handleAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAccount(e.target.value);
    if (onFilterChange) {
      onFilterChange({
        account: e.target.value,
        campaign: selectedCampaign,
        adSet: selectedAdSet,
        objective: selectedObjective
      });
    }
  };

  const handleCampaignChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCampaign(e.target.value);
    if (onFilterChange) {
      onFilterChange({
        account: selectedAccount,
        campaign: e.target.value,
        adSet: selectedAdSet,
        objective: selectedObjective
      });
    }
  };

  const handleAdSetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAdSet(e.target.value);
    if (onFilterChange) {
      onFilterChange({
        account: selectedAccount,
        campaign: selectedCampaign,
        adSet: e.target.value,
        objective: selectedObjective
      });
    }
  };

  const handleObjectiveChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedObjective(e.target.value);
    if (onFilterChange) {
      onFilterChange({
        account: selectedAccount,
        campaign: selectedCampaign,
        adSet: selectedAdSet,
        objective: e.target.value
      });
    }
  };

  return (
    <div className="bg-black-freaky border border-yellow-freaky/30 rounded-lg p-4 shadow-md mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label htmlFor="account" className="block text-sm font-medium text-gray-light mb-1">
            Conta
          </label>
          <select
            id="account"
            className="bg-dark-blue border border-gray-800 text-white rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-yellow-freaky focus:border-transparent"
            value={selectedAccount}
            onChange={handleAccountChange}
          >
            <option value="all">Todas as contas</option>
            <option value="1">Conta Principal</option>
            <option value="2">Conta Secundária</option>
            <option value="3">Conta de Teste</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="campaign" className="block text-sm font-medium text-gray-light mb-1">
            Campanha
          </label>
          <select
            id="campaign"
            className="bg-dark-blue border border-gray-800 text-white rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-yellow-freaky focus:border-transparent"
            value={selectedCampaign}
            onChange={handleCampaignChange}
          >
            <option value="all">Todas as campanhas</option>
            <option value="1">Campanha de Conversão</option>
            <option value="2">Campanha de Tráfego</option>
            <option value="3">Campanha de Reconhecimento</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="adSet" className="block text-sm font-medium text-gray-light mb-1">
            Conjunto de Anúncios
          </label>
          <select
            id="adSet"
            className="bg-dark-blue border border-gray-800 text-white rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-yellow-freaky focus:border-transparent"
            value={selectedAdSet}
            onChange={handleAdSetChange}
          >
            <option value="all">Todos os conjuntos</option>
            <option value="1">Público Frio</option>
            <option value="2">Público Morno</option>
            <option value="3">Público Quente</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="objective" className="block text-sm font-medium text-gray-light mb-1">
            Objetivo
          </label>
          <select
            id="objective"
            className="bg-dark-blue border border-gray-800 text-white rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-yellow-freaky focus:border-transparent"
            value={selectedObjective}
            onChange={handleObjectiveChange}
          >
            <option value="all">Todos os objetivos</option>
            <option value="1">Conversão</option>
            <option value="2">Tráfego</option>
            <option value="3">Reconhecimento</option>
          </select>
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <button className="bg-yellow-freaky text-black font-medium py-2 px-4 rounded-md hover:bg-yellow-300 transition-colors">
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
