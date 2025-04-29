"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { metaApi, googleApi } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, AlertCircle } from 'lucide-react';

interface Account {
  id: string;
  name: string;
  platform: 'meta' | 'google';
  status: 'active' | 'inactive' | 'error';
}

interface AccountSelectorProps {
  clientId: string;
  onAccountsChange: (accounts: {meta: string[], google: string[]}) => void;
  selectedAccounts?: {meta: string[], google: string[]};
}

const AccountSelector: React.FC<AccountSelectorProps> = ({ 
  clientId,
  onAccountsChange,
  selectedAccounts = {meta: [], google: []}
}) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | 'meta' | 'google'>('all');

  // Estado para controlar quais contas estão selecionadas
  const [selectedMetaAccounts, setSelectedMetaAccounts] = useState<string[]>(selectedAccounts.meta || []);
  const [selectedGoogleAccounts, setSelectedGoogleAccounts] = useState<string[]>(selectedAccounts.google || []);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!clientId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Buscar contas do Meta
        const metaResponse = await metaApi.listAccounts(clientId);
        
        // Buscar contas do Google
        const googleResponse = await googleApi.listAccounts(clientId);
        
        const allAccounts: Account[] = [];
        
        // Processar contas do Meta
        if (metaResponse.success && metaResponse.data) {
          const metaAccounts = metaResponse.data.map(account => ({
            id: account.id,
            name: account.name,
            platform: 'meta' as const,
            status: account.status || 'active'
          }));
          allAccounts.push(...metaAccounts);
        }
        
        // Processar contas do Google
        if (googleResponse.success && googleResponse.data) {
          const googleAccounts = googleResponse.data.map(account => ({
            id: account.id,
            name: account.name,
            platform: 'google' as const,
            status: account.status || 'active'
          }));
          allAccounts.push(...googleAccounts);
        }
        
        setAccounts(allAccounts);
        
        // Se não houver contas selecionadas e houver contas disponíveis,
        // selecione todas automaticamente
        if (selectedMetaAccounts.length === 0 && selectedGoogleAccounts.length === 0) {
          const metaIds = allAccounts
            .filter(acc => acc.platform === 'meta')
            .map(acc => acc.id);
            
          const googleIds = allAccounts
            .filter(acc => acc.platform === 'google')
            .map(acc => acc.id);
            
          setSelectedMetaAccounts(metaIds);
          setSelectedGoogleAccounts(googleIds);
          
          onAccountsChange({
            meta: metaIds,
            google: googleIds
          });
        }
      } catch (err) {
        setError('Erro ao carregar contas');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, [clientId, onAccountsChange]);

  // Atualizar seleção quando mudar de cliente
  useEffect(() => {
    setSelectedMetaAccounts(selectedAccounts.meta || []);
    setSelectedGoogleAccounts(selectedAccounts.google || []);
  }, [selectedAccounts]);

  const handleToggleAccount = (accountId: string, platform: 'meta' | 'google') => {
    if (platform === 'meta') {
      const newSelection = selectedMetaAccounts.includes(accountId)
        ? selectedMetaAccounts.filter(id => id !== accountId)
        : [...selectedMetaAccounts, accountId];
        
      setSelectedMetaAccounts(newSelection);
      onAccountsChange({
        meta: newSelection,
        google: selectedGoogleAccounts
      });
    } else {
      const newSelection = selectedGoogleAccounts.includes(accountId)
        ? selectedGoogleAccounts.filter(id => id !== accountId)
        : [...selectedGoogleAccounts, accountId];
        
      setSelectedGoogleAccounts(newSelection);
      onAccountsChange({
        meta: selectedMetaAccounts,
        google: newSelection
      });
    }
  };

  const handleSelectAll = (platform: 'meta' | 'google') => {
    const platformAccounts = accounts.filter(acc => acc.platform === platform);
    const platformIds = platformAccounts.map(acc => acc.id);
    
    if (platform === 'meta') {
      // Se todas já estão selecionadas, desmarcar todas
      if (selectedMetaAccounts.length === platformIds.length) {
        setSelectedMetaAccounts([]);
        onAccountsChange({
          meta: [],
          google: selectedGoogleAccounts
        });
      } else {
        // Caso contrário, selecionar todas
        setSelectedMetaAccounts(platformIds);
        onAccountsChange({
          meta: platformIds,
          google: selectedGoogleAccounts
        });
      }
    } else {
      // Se todas já estão selecionadas, desmarcar todas
      if (selectedGoogleAccounts.length === platformIds.length) {
        setSelectedGoogleAccounts([]);
        onAccountsChange({
          meta: selectedMetaAccounts,
          google: []
        });
      } else {
        // Caso contrário, selecionar todas
        setSelectedGoogleAccounts(platformIds);
        onAccountsChange({
          meta: selectedMetaAccounts,
          google: platformIds
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full mb-6">
        <Skeleton className="h-16 w-full bg-gray-800/50" />
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

  if (accounts.length === 0) {
    return (
      <div className="w-full mb-6 p-3 bg-yellow-900/20 border border-yellow-700 rounded-md text-yellow-400">
        <p>Nenhuma conta de anúncio encontrada. Conecte contas na seção de configurações.</p>
      </div>
    );
  }

  const metaAccounts = accounts.filter(acc => acc.platform === 'meta');
  const googleAccounts = accounts.filter(acc => acc.platform === 'google');

  const filteredAccounts = selectedPlatform === 'all' 
    ? accounts 
    : accounts.filter(acc => acc.platform === selectedPlatform);

  return (
    <div className="w-full mb-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-medium">Contas de Anúncios</h3>
          <Tabs 
            defaultValue="all" 
            onValueChange={(value) => setSelectedPlatform(value as 'all' | 'meta' | 'google')}
            className="w-auto"
          >
            <TabsList className="bg-black-freaky/80 backdrop-blur-md border border-yellow-freaky/30">
              <TabsTrigger 
                value="all"
                className="data-[state=active]:bg-yellow-freaky data-[state=active]:text-black-freaky"
              >
                Todas
              </TabsTrigger>
              <TabsTrigger 
                value="meta"
                className="data-[state=active]:bg-yellow-freaky data-[state=active]:text-black-freaky"
              >
                Meta Ads
              </TabsTrigger>
              <TabsTrigger 
                value="google"
                className="data-[state=active]:bg-yellow-freaky data-[state=active]:text-black-freaky"
              >
                Google Ads
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Meta Accounts */}
        {(selectedPlatform === 'all' || selectedPlatform === 'meta') && metaAccounts.length > 0 && (
          <div className="bg-black-freaky/60 backdrop-blur-md border border-yellow-freaky/20 rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-medium">Meta Ads</h4>
              <button 
                onClick={() => handleSelectAll('meta')}
                className="text-sm text-yellow-freaky hover:underline"
              >
                {selectedMetaAccounts.length === metaAccounts.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {metaAccounts.map(account => (
                <div 
                  key={account.id}
                  onClick={() => handleToggleAccount(account.id, 'meta')}
                  className={`
                    flex items-center p-2 rounded-md cursor-pointer transition-colors
                    ${selectedMetaAccounts.includes(account.id) 
                      ? 'bg-yellow-freaky/20 border border-yellow-freaky/40' 
                      : 'bg-gray-800/40 border border-gray-700/40 hover:bg-gray-700/30'}
                  `}
                >
                  <div className="flex-shrink-0 mr-2">
                    {selectedMetaAccounts.includes(account.id) ? (
                      <Check className="h-4 w-4 text-yellow-freaky" />
                    ) : (
                      <div className="h-4 w-4 rounded-sm border border-gray-600" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm text-white truncate">{account.name}</p>
                  </div>
                  {account.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-red-500 ml-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Google Accounts */}
        {(selectedPlatform === 'all' || selectedPlatform === 'google') && googleAccounts.length > 0 && (
          <div className="bg-black-freaky/60 backdrop-blur-md border border-yellow-freaky/20 rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-white font-medium">Google Ads</h4>
              <button 
                onClick={() => handleSelectAll('google')}
                className="text-sm text-yellow-freaky hover:underline"
              >
                {selectedGoogleAccounts.length === googleAccounts.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {googleAccounts.map(account => (
                <div 
                  key={account.id}
                  onClick={() => handleToggleAccount(account.id, 'google')}
                  className={`
                    flex items-center p-2 rounded-md cursor-pointer transition-colors
                    ${selectedGoogleAccounts.includes(account.id) 
                      ? 'bg-yellow-freaky/20 border border-yellow-freaky/40' 
                      : 'bg-gray-800/40 border border-gray-700/40 hover:bg-gray-700/30'}
                  `}
                >
                  <div className="flex-shrink-0 mr-2">
                    {selectedGoogleAccounts.includes(account.id) ? (
                      <Check className="h-4 w-4 text-yellow-freaky" />
                    ) : (
                      <div className="h-4 w-4 rounded-sm border border-gray-600" />
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm text-white truncate">{account.name}</p>
                  </div>
                  {account.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-red-500 ml-2" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountSelector;
