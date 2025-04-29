"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { clientsApi } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';

interface Client {
  id: string;
  name: string;
}

interface ClientTabSelectorProps {
  onClientChange: (clientId: string) => void;
  selectedClientId?: string;
}

const ClientTabSelector: React.FC<ClientTabSelectorProps> = ({ 
  onClientChange,
  selectedClientId
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await clientsApi.listClients();
        
        if (response.success && response.data) {
          setClients(response.data);
          
          // Se não houver cliente selecionado e houver clientes disponíveis,
          // selecione o primeiro automaticamente
          if (!selectedClientId && response.data.length > 0) {
            onClientChange(response.data[0].id);
          }
        } else {
          setError(response.error || 'Erro ao carregar clientes');
        }
      } catch (err) {
        setError('Erro ao carregar clientes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [onClientChange, selectedClientId]);

  if (loading) {
    return (
      <div className="w-full mb-6">
        <Skeleton className="h-10 w-full bg-gray-800/50" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full mb-6 p-3 bg-red-900/20 border border-red-700 rounded-md text-red-400">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-sm text-yellow-freaky hover:underline mt-1"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="w-full mb-6 p-3 bg-yellow-900/20 border border-yellow-700 rounded-md text-yellow-400">
        <p>Nenhum cliente encontrado. Adicione clientes na seção de administração.</p>
      </div>
    );
  }

  return (
    <div className="w-full mb-6">
      <Tabs 
        defaultValue={selectedClientId || clients[0]?.id} 
        onValueChange={onClientChange}
        className="w-full"
      >
        <TabsList className="bg-black-freaky/80 backdrop-blur-md border border-yellow-freaky/30 w-full h-auto flex flex-wrap">
          {clients.map(client => (
            <TabsTrigger 
              key={client.id} 
              value={client.id}
              className="data-[state=active]:bg-yellow-freaky data-[state=active]:text-black-freaky py-2 px-4"
            >
              {client.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default ClientTabSelector;
