"use client";

import React from 'react';
import Sidebar from '@/components/ui/Sidebar';
import Navbar from '@/components/ui/Navbar';
import FilterBar from '@/components/ui/FilterBar';

interface SettingsProps {}

const Settings: React.FC<SettingsProps> = () => {
  const [activeTab, setActiveTab] = React.useState('accounts');
  const [accounts, setAccounts] = React.useState([
    { id: 1, name: 'Conta Principal Meta', platform: 'meta', status: 'connected', lastSync: '28/04/2025 10:30' },
    { id: 2, name: 'Conta Principal Google', platform: 'google', status: 'connected', lastSync: '28/04/2025 09:45' },
    { id: 3, name: 'Conta Secundária Meta', platform: 'meta', status: 'disconnected', lastSync: '-' },
  ]);

  const [newAccount, setNewAccount] = React.useState({
    name: '',
    platform: 'meta',
  });

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de adição de conta
    setAccounts([
      ...accounts,
      {
        id: accounts.length + 1,
        name: newAccount.name,
        platform: newAccount.platform,
        status: 'pending',
        lastSync: '-',
      },
    ]);
    setNewAccount({ name: '', platform: 'meta' });
  };

  const handleConnectAccount = (id: number) => {
    // Simulação de conexão de conta
    setAccounts(
      accounts.map((account) =>
        account.id === id
          ? { ...account, status: 'connected', lastSync: new Date().toLocaleString('pt-BR') }
          : account
      )
    );
  };

  const handleDisconnectAccount = (id: number) => {
    // Simulação de desconexão de conta
    setAccounts(
      accounts.map((account) =>
        account.id === id ? { ...account, status: 'disconnected', lastSync: '-' } : account
      )
    );
  };

  return (
    <div className="flex h-screen bg-dark-blue">
      <Sidebar activeItem="settings" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-black border border-yellow-freaky/30 rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-800">
              <nav className="flex -mb-px">
                <button
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === 'accounts'
                      ? 'border-b-2 border-yellow-freaky text-yellow-freaky'
                      : 'text-gray-light hover:text-white'
                  }`}
                  onClick={() => setActiveTab('accounts')}
                >
                  Contas de Anúncios
                </button>
                <button
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === 'indicators'
                      ? 'border-b-2 border-yellow-freaky text-yellow-freaky'
                      : 'text-gray-light hover:text-white'
                  }`}
                  onClick={() => setActiveTab('indicators')}
                >
                  Indicadores
                </button>
                <button
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === 'users'
                      ? 'border-b-2 border-yellow-freaky text-yellow-freaky'
                      : 'text-gray-light hover:text-white'
                  }`}
                  onClick={() => setActiveTab('users')}
                >
                  Usuários
                </button>
                <button
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === 'preferences'
                      ? 'border-b-2 border-yellow-freaky text-yellow-freaky'
                      : 'text-gray-light hover:text-white'
                  }`}
                  onClick={() => setActiveTab('preferences')}
                >
                  Preferências
                </button>
              </nav>
            </div>
            
            <div className="p-6">
              {activeTab === 'accounts' && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-6">Gerenciar Contas de Anúncios</h2>
                  
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-white mb-4">Adicionar Nova Conta</h3>
                    <form onSubmit={handleAddAccount} className="bg-dark-blue border border-gray-800 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="accountName" className="block text-sm font-medium text-gray-light mb-1">
                            Nome da Conta
                          </label>
                          <input
                            type="text"
                            id="accountName"
                            className="bg-black border border-gray-800 text-white rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-yellow-freaky focus:border-transparent"
                            value={newAccount.name}
                            onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="platform" className="block text-sm font-medium text-gray-light mb-1">
                            Plataforma
                          </label>
                          <select
                            id="platform"
                            className="bg-black border border-gray-800 text-white rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-yellow-freaky focus:border-transparent"
                            value={newAccount.platform}
                            onChange={(e) => setNewAccount({ ...newAccount, platform: e.target.value })}
                          >
                            <option value="meta">Meta Ads</option>
                            <option value="google">Google Ads</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="bg-yellow-freaky text-black font-medium py-2 px-4 rounded-md hover:bg-yellow-300 transition-colors"
                        >
                          Adicionar Conta
                        </button>
                      </div>
                    </form>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-white mb-4">Contas Existentes</h3>
                    <div className="bg-dark-blue border border-gray-800 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-800">
                        <thead className="bg-black">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-yellow-freaky uppercase tracking-wider">
                              Nome da Conta
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-yellow-freaky uppercase tracking-wider">
                              Plataforma
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-yellow-freaky uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-yellow-freaky uppercase tracking-wider">
                              Última Sincronização
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-yellow-freaky uppercase tracking-wider">
                              Ações
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {accounts.map((account) => (
                            <tr key={account.id} className="hover:bg-black/50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                {account.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                {account.platform === 'meta' ? 'Meta Ads' : 'Google Ads'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    account.status === 'connected'
                                      ? 'bg-green-900/30 text-green-400'
                                      : account.status === 'pending'
                                      ? 'bg-yellow-900/30 text-yellow-400'
                                      : 'bg-red-900/30 text-red-400'
                                  }`}
                                >
                                  {account.status === 'connected'
                                    ? 'Conectado'
                                    : account.status === 'pending'
                                    ? 'Pendente'
                                    : 'Desconectado'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                                {account.lastSync}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                {account.status === 'connected' ? (
                                  <button
                                    onClick={() => handleDisconnectAccount(account.id)}
                                    className="text-red-400 hover:text-red-300 transition-colors"
                                  >
                                    Desconectar
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleConnectAccount(account.id)}
                                    className="text-green-400 hover:text-green-300 transition-colors"
                                  >
                                    Conectar
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'indicators' && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-6">Personalizar Indicadores</h2>
                  <p className="text-gray-light mb-4">
                    Configure quais indicadores serão exibidos no dashboard e como eles serão organizados.
                  </p>
                  
                  <div className="bg-dark-blue border border-gray-800 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-medium text-white mb-4">Indicadores Disponíveis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {['Impressões', 'Cliques', 'CTR', 'CPC', 'CPM', 'Conversões', 'Custo por Conversão', 'ROAS', 'Alcance', 'Frequência', 'Engajamento'].map((indicator) => (
                        <div key={indicator} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`indicator-${indicator}`}
                            className="h-4 w-4 text-yellow-freaky focus:ring-yellow-freaky border-gray-800 rounded"
                            defaultChecked
                          />
                          <label htmlFor={`indicator-${indicator}`} className="ml-2 text-white">
                            {indicator}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-dark-blue border border-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-4">Layout do Dashboard</h3>
                    <p className="text-gray-light mb-4">
                      Arraste e solte as seções para reorganizar o dashboard conforme sua preferência.
                    </p>
                    <div className="border border-dashed border-gray-600 rounded-lg p-4 mb-4">
                      <div className="bg-black p-3 rounded-lg mb-2 cursor-move">
                        <div className="flex justify-between items-center">
                          <span className="text-white">Métricas Principais</span>
                          <span className="text-gray-light">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                          </span>
                        </div>
                      </div>
                      <div className="bg-black p-3 rounded-lg mb-2 cursor-move">
                        <div className="flex justify-between items-center">
                          <span className="text-white">Visão Temporal</span>
                          <span className="text-gray-light">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                          </span>
                        </div>
                      </div>
                      <div className="bg-black p-3 rounded-lg mb-2 cursor-move">
                        <div className="flex justify-between items-center">
                          <span className="text-white">Campanhas</span>
                          <span className="text-gray-light">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                          </span>
                        </div>
                      </div>
                      <div className="bg-black p-3 rounded-lg cursor-move">
                        <div className="flex justify-between items-center">
                          <span className="text-white">Melhores Anúncios</span>
                          <span className="text-gray-light">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button className="bg-yellow-freaky text-black font-medium py-2 px-4 rounded-md hover:bg-yellow-300 transition-colors">
                        Salvar Layout
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'users' && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-6">Gerenciar Usuários</h2>
                  <p className="text-gray-light mb-4">
                    Adicione, edite ou remova usuários que têm acesso ao dashboard.
                  </p>
                  
                  <div className="bg-dark-blue border border-gray-800 rounded-lg overflow-hidden mb-6">
                    <table className="min-w-full divide-y divide-gray-800">
                      <thead className="bg-black">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-yellow-freaky uppercase tracking-wider">
                            Nome
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-yellow-freaky uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-yellow-freaky uppercase tracking-wider">
                            Função
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-yellow-freaky uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-yellow-freaky uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        <tr className="hover:bg-black/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            Administrador
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            admin@freakyguys.com
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            Administrador
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                              Ativo
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <button className="text-blue-400 hover:text-blue-300 transition-colors mr-2">
                              Editar
                            </button>
                            <button className="text-red-400 hover:text-red-300 transition-colors">
                              Remover
                            </button>
                          </td>
                        </tr>
                        <tr className="hover:bg-black/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            Analista
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            analista@freakyguys.com
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            Analista
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-400">
                              Ativo
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                            <button className="text-blue-400 hover:text-blue-300 transition-colors mr-2">
                              Editar
                            </button>
                            <button className="text-red-400 hover:text-red-300 transition-colors">
                              Remover
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex justify-end">
                    <button className="bg-yellow-freaky text-black font-medium py-2 px-4 rounded-md hover:bg-yellow-300 transition-colors">
                      Adicionar Usuário
                    </button>
                  </div>
                </div>
              )}
              
              {activeTab === 'preferences' && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-6">Preferências</h2>
                  <p className="text-gray-light mb-4">
                    Configure as preferências gerais do dashboard.
                  </p>
                  
                  <div className="bg-dark-blue border border-gray-800 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-medium text-white mb-4">Configurações Gerais</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="timezone" className="block text-sm font-medium text-gray-light mb-1">
                          Fuso Horário
                        </label>
                        <select
                          id="timezone"
                          className="bg-black border border-gray-800 text-white rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-yellow-freaky focus:border-transparent"
                          defaultValue="America/Sao_Paulo"
                        >
                          <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                          <option value="America/New_York">Nova York (GMT-4)</option>
                          <option value="Europe/London">Londres (GMT+1)</option>
                          <option value="Asia/Tokyo">Tóquio (GMT+9)</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="currency" className="block text-sm font-medium text-gray-light mb-1">
                          Moeda
                        </label>
                        <select
                          id="currency"
                          className="bg-black border border-gray-800 text-white rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-yellow-freaky focus:border-transparent"
                          defaultValue="BRL"
                        >
                          <option value="BRL">Real Brasileiro (R$)</option>
                          <option value="USD">Dólar Americano ($)</option>
                          <option value="EUR">Euro (€)</option>
                          <option value="GBP">Libra Esterlina (£)</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-light mb-1">
                          Formato de Data
                        </label>
                        <select
                          id="dateFormat"
                          className="bg-black border border-gray-800 text-white rounded-md w-full p-2 focus:outline-none focus:ring-2 focus:ring-yellow-freaky focus:border-transparent"
                          defaultValue="DD/MM/YYYY"
                        >
                          <option value="DD/MM/YYYY">DD/MM/AAAA</option>
                          <option value="MM/DD/YYYY">MM/DD/AAAA</option>
                          <option value="YYYY-MM-DD">AAAA-MM-DD</option>
                        </select>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="autoRefresh"
                          className="h-4 w-4 text-yellow-freaky focus:ring-yellow-freaky border-gray-800 rounded"
                          defaultChecked
                        />
                        <label htmlFor="autoRefresh" className="ml-2 text-white">
                          Atualizar dados automaticamente
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-dark-blue border border-gray-800 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-medium text-white mb-4">Notificações</h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="emailNotifications"
                          className="h-4 w-4 text-yellow-freaky focus:ring-yellow-freaky border-gray-800 rounded"
                          defaultChecked
                        />
                        <label htmlFor="emailNotifications" className="ml-2 text-white">
                          Receber notificações por email
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="performanceAlerts"
                          className="h-4 w-4 text-yellow-freaky focus:ring-yellow-freaky border-gray-800 rounded"
                          defaultChecked
                        />
                        <label htmlFor="performanceAlerts" className="ml-2 text-white">
                          Alertas de performance
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="weeklyReports"
                          className="h-4 w-4 text-yellow-freaky focus:ring-yellow-freaky border-gray-800 rounded"
                          defaultChecked
                        />
                        <label htmlFor="weeklyReports" className="ml-2 text-white">
                          Relatórios semanais
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button className="bg-yellow-freaky text-black font-medium py-2 px-4 rounded-md hover:bg-yellow-300 transition-colors">
                      Salvar Preferências
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
