"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Componentes de UI para o painel de administração
const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    permissions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Simulação de dados para demonstração
  useEffect(() => {
    // Em produção, isso seria substituído por chamadas reais à API
    setUsers([
      { id: 1, name: 'Admin Principal', email: 'admin@freakyguys.com', role: 'admin', created_at: '2025-04-01' },
      { id: 2, name: 'Gerente de Contas', email: 'gerente@freakyguys.com', role: 'manager', created_at: '2025-04-05' },
      { id: 3, name: 'Analista de Mídia', email: 'analista@freakyguys.com', role: 'user', created_at: '2025-04-10' }
    ]);
    
    setClients([
      { id: 1, name: 'Cliente A', created_at: '2025-03-15' },
      { id: 2, name: 'Cliente B', created_at: '2025-03-20' },
      { id: 3, name: 'Cliente C', created_at: '2025-04-01' }
    ]);
    
    setLoading(false);
  }, []);

  // Função para criar novo usuário
  const handleCreateUser = (e) => {
    e.preventDefault();
    // Em produção, isso seria uma chamada real à API
    console.log('Criando novo usuário:', newUser);
    
    // Simulação de adição do usuário à lista
    const newId = users.length + 1;
    setUsers([...users, {
      id: newId,
      ...newUser,
      created_at: new Date().toISOString().split('T')[0]
    }]);
    
    // Limpar formulário
    setNewUser({
      name: '',
      email: '',
      password: '',
      role: 'user',
      permissions: []
    });
  };

  // Função para excluir usuário
  const handleDeleteUser = (userId) => {
    // Em produção, isso seria uma chamada real à API
    console.log('Excluindo usuário:', userId);
    
    // Simulação de remoção do usuário da lista
    setUsers(users.filter(user => user.id !== userId));
  };

  // Função para adicionar permissão
  const handleAddPermission = () => {
    setNewUser({
      ...newUser,
      permissions: [
        ...newUser.permissions,
        { client_id: '', permission_type: 'view' }
      ]
    });
  };

  // Função para atualizar permissão
  const handleUpdatePermission = (index, field, value) => {
    const updatedPermissions = [...newUser.permissions];
    updatedPermissions[index] = {
      ...updatedPermissions[index],
      [field]: value
    };
    
    setNewUser({
      ...newUser,
      permissions: updatedPermissions
    });
  };

  // Função para remover permissão
  const handleRemovePermission = (index) => {
    const updatedPermissions = [...newUser.permissions];
    updatedPermissions.splice(index, 1);
    
    setNewUser({
      ...newUser,
      permissions: updatedPermissions
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando...</div>;
  }

  if (error) {
    return <div className="bg-red-100 text-red-700 p-4 rounded">Erro: {error}</div>;
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-yellow-400 mb-8">Painel de Administração</h1>
        
        {/* Tabs de navegação */}
        <div className="flex border-b border-gray-700 mb-8">
          <button 
            className={`px-4 py-2 mr-2 ${activeTab === 'users' ? 'bg-yellow-400 text-black font-bold' : 'bg-gray-800'}`}
            onClick={() => setActiveTab('users')}
          >
            Usuários
          </button>
          <button 
            className={`px-4 py-2 mr-2 ${activeTab === 'clients' ? 'bg-yellow-400 text-black font-bold' : 'bg-gray-800'}`}
            onClick={() => setActiveTab('clients')}
          >
            Clientes
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'settings' ? 'bg-yellow-400 text-black font-bold' : 'bg-gray-800'}`}
            onClick={() => setActiveTab('settings')}
          >
            Configurações
          </button>
        </div>
        
        {/* Conteúdo da tab Usuários */}
        {activeTab === 'users' && (
          <div>
            <div className="bg-gray-900 p-6 rounded-lg mb-8">
              <h2 className="text-xl font-bold mb-4 text-yellow-400">Criar Novo Usuário</h2>
              <form onSubmit={handleCreateUser}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block mb-1">Nome</label>
                    <input 
                      type="text" 
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      value={newUser.name}
                      onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Email</label>
                    <input 
                      type="email" 
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Senha</label>
                    <input 
                      type="password" 
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Função</label>
                    <select 
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      value={newUser.role}
                      onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                      required
                    >
                      <option value="admin">Administrador</option>
                      <option value="manager">Gerente</option>
                      <option value="user">Usuário</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold">Permissões</h3>
                    <button 
                      type="button"
                      className="bg-yellow-400 text-black px-3 py-1 rounded text-sm"
                      onClick={handleAddPermission}
                    >
                      + Adicionar Permissão
                    </button>
                  </div>
                  
                  {newUser.permissions.length > 0 ? (
                    <div className="bg-gray-800 p-4 rounded">
                      {newUser.permissions.map((permission, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                          <select 
                            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
                            value={permission.client_id}
                            onChange={(e) => handleUpdatePermission(index, 'client_id', e.target.value)}
                            required
                          >
                            <option value="">Selecione um cliente</option>
                            {clients.map(client => (
                              <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                          </select>
                          <select 
                            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white"
                            value={permission.permission_type}
                            onChange={(e) => handleUpdatePermission(index, 'permission_type', e.target.value)}
                            required
                          >
                            <option value="view">Visualizar</option>
                            <option value="edit">Editar</option>
                            <option value="admin">Administrar</option>
                          </select>
                          <button 
                            type="button"
                            className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                            onClick={() => handleRemovePermission(index)}
                          >
                            Remover
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">Nenhuma permissão adicionada. Usuários administradores têm acesso a tudo.</p>
                  )}
                </div>
                
                <button 
                  type="submit"
                  className="bg-yellow-400 text-black px-4 py-2 rounded font-bold"
                >
                  Criar Usuário
                </button>
              </form>
            </div>
            
            <h2 className="text-xl font-bold mb-4 text-yellow-400">Usuários Existentes</h2>
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Nome</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Função</th>
                    <th className="px-4 py-2 text-left">Data de Criação</th>
                    <th className="px-4 py-2 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-t border-gray-700">
                      <td className="px-4 py-3">{user.id}</td>
                      <td className="px-4 py-3">{user.name}</td>
                      <td className="px-4 py-3">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.role === 'admin' ? 'bg-red-500' : 
                          user.role === 'manager' ? 'bg-blue-500' : 'bg-green-500'
                        }`}>
                          {user.role === 'admin' ? 'Administrador' : 
                           user.role === 'manager' ? 'Gerente' : 'Usuário'}
                        </span>
                      </td>
                      <td className="px-4 py-3">{user.created_at}</td>
                      <td className="px-4 py-3">
                        <button 
                          className="bg-blue-500 text-white px-2 py-1 rounded text-sm mr-2"
                          onClick={() => console.log('Editar usuário:', user.id)}
                        >
                          Editar
                        </button>
                        <button 
                          className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Conteúdo da tab Clientes */}
        {activeTab === 'clients' && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-yellow-400">Clientes</h2>
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-2 text-left">ID</th>
                    <th className="px-4 py-2 text-left">Nome</th>
                    <th className="px-4 py-2 text-left">Data de Criação</th>
                    <th className="px-4 py-2 text-left">Contas de Anúncios</th>
                    <th className="px-4 py-2 text-left">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(client => (
                    <tr key={client.id} className="border-t border-gray-700">
                      <td className="px-4 py-3">{client.id}</td>
                      <td className="px-4 py-3">{client.name}</td>
                      <td className="px-4 py-3">{client.created_at}</td>
                      <td className="px-4 py-3">
                        <div className="flex">
                          <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs mr-1">Meta</span>
                          <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">Google</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          className="bg-blue-500 text-white px-2 py-1 rounded text-sm mr-2"
                          onClick={() => console.log('Editar cliente:', client.id)}
                        >
                          Editar
                        </button>
                        <button 
                          className="bg-yellow-400 text-black px-2 py-1 rounded text-sm mr-2"
                          onClick={() => console.log('Gerenciar contas:', client.id)}
                        >
                          Contas
                        </button>
                        <button 
                          className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                          onClick={() => console.log('Excluir cliente:', client.id)}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Conteúdo da tab Configurações */}
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-xl font-bold mb-4 text-yellow-400">Configurações do Sistema</h2>
            <div className="bg-gray-900 p-6 rounded-lg">
              <div className="mb-6">
                <h3 className="font-bold mb-2">Configurações de API</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Meta Business SDK App ID</label>
                    <input 
                      type="text" 
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      placeholder="ID da aplicação Meta"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Meta Business SDK App Secret</label>
                    <input 
                      type="password" 
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      placeholder="Secret da aplicação Meta"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Google Ads Developer Token</label>
                    <input 
                      type="text" 
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      placeholder="Token de desenvolvedor Google Ads"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Google OAuth Client ID</label>
                    <input 
                      type="text" 
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      placeholder="Client ID do Google OAuth"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-bold mb-2">Configurações de Atualização de Dados</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Frequência de Atualização</label>
                    <select className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white">
                      <option value="daily">Diária</option>
                      <option value="weekly" selected>Semanal</option>
                      <option value="monthly">Mensal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1">Dia da Semana para Atualização</label>
                    <select className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white">
                      <option value="1">Segunda-feira</option>
                      <option value="2">Terça-feira</option>
                      <option value="3">Quarta-feira</option>
                      <option value="4">Quinta-feira</option>
                      <option value="5">Sexta-feira</option>
                      <option value="6">Sábado</option>
                      <option value="0">Domingo</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-bold mb-2">Configurações de Email</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Servidor SMTP</label>
                    <input 
                      type="text" 
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      placeholder="smtp.example.com"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Porta SMTP</label>
                    <input 
                      type="number" 
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      placeholder="587"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Email de Envio</label>
                    <input 
                      type="email" 
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      placeholder="noreply@freakyguys.com"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Senha</label>
                    <input 
                      type="password" 
                      className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                      placeholder="Senha do email"
                    />
                  </div>
                </div>
              </div>
              
              <button className="bg-yellow-400 text-black px-4 py-2 rounded font-bold">
                Salvar Configurações
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
