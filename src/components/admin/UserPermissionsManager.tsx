"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Componente para gerenciamento de permissões de usuários
const UserPermissionsManager = ({ userId, userName, userRole }) => {
  const [clients, setClients] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulação de dados para demonstração
  useEffect(() => {
    // Em produção, isso seria substituído por chamadas reais à API
    setClients([
      { id: 1, name: 'Cliente A' },
      { id: 2, name: 'Cliente B' },
      { id: 3, name: 'Cliente C' }
    ]);
    
    setPermissions([
      { id: 1, client_id: 1, permission_type: 'admin' },
      { id: 2, client_id: 2, permission_type: 'edit' }
    ]);
    
    setLoading(false);
  }, [userId]);

  // Função para adicionar permissão
  const handleAddPermission = (clientId, permissionType) => {
    // Em produção, isso seria uma chamada real à API
    console.log('Adicionando permissão:', { userId, clientId, permissionType });
    
    // Simulação de adição de permissão
    const newPermission = {
      id: permissions.length + 1,
      client_id: clientId,
      permission_type: permissionType
    };
    
    setPermissions([...permissions, newPermission]);
  };

  // Função para atualizar permissão
  const handleUpdatePermission = (permissionId, permissionType) => {
    // Em produção, isso seria uma chamada real à API
    console.log('Atualizando permissão:', { permissionId, permissionType });
    
    // Simulação de atualização de permissão
    setPermissions(permissions.map(perm => 
      perm.id === permissionId ? { ...perm, permission_type: permissionType } : perm
    ));
  };

  // Função para remover permissão
  const handleRemovePermission = (permissionId) => {
    // Em produção, isso seria uma chamada real à API
    console.log('Removendo permissão:', permissionId);
    
    // Simulação de remoção de permissão
    setPermissions(permissions.filter(perm => perm.id !== permissionId));
  };

  if (loading) {
    return <div className="p-4 bg-gray-800 rounded">Carregando permissões...</div>;
  }

  if (error) {
    return <div className="p-4 bg-red-900 text-white rounded">Erro: {error}</div>;
  }

  // Se o usuário for admin, não precisa de permissões específicas
  if (userRole === 'admin') {
    return (
      <div className="p-4 bg-gray-800 rounded">
        <p className="text-yellow-400 font-bold">Usuário Administrador</p>
        <p className="text-gray-400">Administradores têm acesso completo a todos os clientes e funcionalidades.</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-800 rounded">
      <h3 className="text-lg font-bold text-yellow-400 mb-4">Permissões para {userName}</h3>
      
      {/* Lista de permissões existentes */}
      <div className="mb-4">
        <h4 className="font-bold mb-2">Permissões Atuais</h4>
        {permissions.length > 0 ? (
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Cliente</th>
                <th className="px-4 py-2 text-left">Tipo de Permissão</th>
                <th className="px-4 py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map(permission => {
                const client = clients.find(c => c.id === permission.client_id);
                return (
                  <tr key={permission.id} className="border-t border-gray-700">
                    <td className="px-4 py-2">{client ? client.name : 'Cliente Desconhecido'}</td>
                    <td className="px-4 py-2">
                      <select 
                        className="bg-gray-600 border border-gray-500 rounded px-2 py-1"
                        value={permission.permission_type}
                        onChange={(e) => handleUpdatePermission(permission.id, e.target.value)}
                      >
                        <option value="view">Visualizar</option>
                        <option value="edit">Editar</option>
                        <option value="admin">Administrar</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <button 
                        className="bg-red-500 text-white px-2 py-1 rounded text-sm"
                        onClick={() => handleRemovePermission(permission.id)}
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400">Nenhuma permissão configurada.</p>
        )}
      </div>
      
      {/* Formulário para adicionar nova permissão */}
      <div>
        <h4 className="font-bold mb-2">Adicionar Nova Permissão</h4>
        <div className="flex flex-wrap gap-2">
          <select 
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
            id="new-permission-client"
            defaultValue=""
          >
            <option value="" disabled>Selecione um cliente</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
          
          <select 
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2"
            id="new-permission-type"
            defaultValue="view"
          >
            <option value="view">Visualizar</option>
            <option value="edit">Editar</option>
            <option value="admin">Administrar</option>
          </select>
          
          <button 
            className="bg-yellow-400 text-black px-3 py-2 rounded font-bold"
            onClick={() => {
              const clientId = document.getElementById('new-permission-client').value;
              const permissionType = document.getElementById('new-permission-type').value;
              if (clientId) {
                handleAddPermission(parseInt(clientId), permissionType);
              }
            }}
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserPermissionsManager;
