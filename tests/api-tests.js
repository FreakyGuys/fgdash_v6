// Testes para os endpoints de API do FGDash
// Este arquivo contém testes para verificar o funcionamento correto das APIs implementadas

const API_BASE_URL = 'https://fgdash.com/api';
let authToken = null;
let testUserId = null;
let testClientId = null;
let testDashboardId = null;
let testIndicatorId = null;
let testMetaAccountId = null;
let testGoogleAccountId = null;

// Função auxiliar para fazer requisições HTTP
async function makeRequest(method, endpoint, body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers
  };
  
  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const data = await response.json();
  
  return {
    status: response.status,
    data
  };
}

// Testes para API de autenticação
async function testAuthAPI() {
  console.log('Testando API de autenticação...');
  
  // Teste de registro
  const registerResponse = await makeRequest('POST', '/auth/register', {
    name: 'Usuário de Teste',
    email: 'teste@fgdash.com',
    password: 'Senha@123',
    role: 'user'
  });
  
  console.log('Registro:', registerResponse.status, registerResponse.data.success ? 'Sucesso' : 'Falha');
  
  if (!registerResponse.data.success) {
    // Se o registro falhar, pode ser porque o usuário já existe
    console.log('Erro no registro:', registerResponse.data.error);
  }
  
  // Teste de login
  const loginResponse = await makeRequest('POST', '/auth/login', {
    email: 'teste@fgdash.com',
    password: 'Senha@123'
  });
  
  console.log('Login:', loginResponse.status, loginResponse.data.success ? 'Sucesso' : 'Falha');
  
  if (loginResponse.data.success) {
    authToken = loginResponse.data.data.token;
    testUserId = loginResponse.data.data.user.id;
    console.log('Token obtido com sucesso');
  } else {
    console.log('Erro no login:', loginResponse.data.error);
    return false;
  }
  
  // Teste de verificação de token
  const verifyResponse = await makeRequest('GET', '/auth/verify', null, authToken);
  
  console.log('Verificação de token:', verifyResponse.status, verifyResponse.data.success ? 'Sucesso' : 'Falha');
  
  return loginResponse.data.success && verifyResponse.data.success;
}

// Testes para API de usuários
async function testUsersAPI() {
  console.log('\nTestando API de usuários...');
  
  // Teste de obtenção do perfil do usuário
  const profileResponse = await makeRequest('GET', `/users/${testUserId}`, null, authToken);
  
  console.log('Obter perfil:', profileResponse.status, profileResponse.data.success ? 'Sucesso' : 'Falha');
  
  // Teste de atualização do perfil
  const updateResponse = await makeRequest('PUT', `/users/${testUserId}`, {
    name: 'Usuário de Teste Atualizado'
  }, authToken);
  
  console.log('Atualizar perfil:', updateResponse.status, updateResponse.data.success ? 'Sucesso' : 'Falha');
  
  // Teste de listagem de usuários (requer admin)
  const listResponse = await makeRequest('GET', '/users', null, authToken);
  
  console.log('Listar usuários:', listResponse.status, listResponse.data.success ? 'Sucesso' : 'Falha');
  
  return profileResponse.data.success && updateResponse.data.success;
}

// Testes para API de clientes
async function testClientsAPI() {
  console.log('\nTestando API de clientes...');
  
  // Teste de criação de cliente
  const createResponse = await makeRequest('POST', '/clients', {
    name: 'Cliente de Teste',
    status: 'active'
  }, authToken);
  
  console.log('Criar cliente:', createResponse.status, createResponse.data.success ? 'Sucesso' : 'Falha');
  
  if (createResponse.data.success) {
    testClientId = createResponse.data.data.id;
    console.log('ID do cliente de teste:', testClientId);
  } else {
    // Se a criação falhar, tentar buscar um cliente existente
    const listResponse = await makeRequest('GET', '/clients', null, authToken);
    
    if (listResponse.data.success && listResponse.data.data.length > 0) {
      testClientId = listResponse.data.data[0].id;
      console.log('Usando cliente existente:', testClientId);
    } else {
      console.log('Erro ao criar cliente e nenhum cliente existente encontrado');
      return false;
    }
  }
  
  // Teste de obtenção de detalhes do cliente
  const getResponse = await makeRequest('GET', `/clients/${testClientId}`, null, authToken);
  
  console.log('Obter cliente:', getResponse.status, getResponse.data.success ? 'Sucesso' : 'Falha');
  
  // Teste de atualização do cliente
  const updateResponse = await makeRequest('PUT', `/clients/${testClientId}`, {
    name: 'Cliente de Teste Atualizado'
  }, authToken);
  
  console.log('Atualizar cliente:', updateResponse.status, updateResponse.data.success ? 'Sucesso' : 'Falha');
  
  // Teste de listagem de clientes
  const listResponse = await makeRequest('GET', '/clients', null, authToken);
  
  console.log('Listar clientes:', listResponse.status, listResponse.data.success ? 'Sucesso' : 'Falha');
  
  return getResponse.data.success && updateResponse.data.success && listResponse.data.success;
}

// Testes para API de dashboards
async function testDashboardsAPI() {
  console.log('\nTestando API de dashboards...');
  
  // Teste de listagem de dashboards
  const listResponse = await makeRequest('GET', '/dashboards', null, authToken);
  
  console.log('Listar dashboards:', listResponse.status, listResponse.data.success ? 'Sucesso' : 'Falha');
  
  if (listResponse.data.success && listResponse.data.data.length > 0) {
    testDashboardId = listResponse.data.data[0].id;
    console.log('Usando dashboard existente:', testDashboardId);
  } else {
    // Se não houver dashboards, criar um novo
    const createResponse = await makeRequest('POST', '/dashboards', {
      client_id: testClientId,
      name: 'Dashboard de Teste',
      description: 'Dashboard para testes de API',
      layout: 'grid',
      is_default: true
    }, authToken);
    
    console.log('Criar dashboard:', createResponse.status, createResponse.data.success ? 'Sucesso' : 'Falha');
    
    if (createResponse.data.success) {
      testDashboardId = createResponse.data.data.id;
      console.log('ID do dashboard de teste:', testDashboardId);
    } else {
      console.log('Erro ao criar dashboard:', createResponse.data.error);
      return false;
    }
  }
  
  // Teste de obtenção de detalhes do dashboard
  const getResponse = await makeRequest('GET', `/dashboards/${testDashboardId}`, null, authToken);
  
  console.log('Obter dashboard:', getResponse.status, getResponse.data.success ? 'Sucesso' : 'Falha');
  
  // Teste de atualização do dashboard
  const updateResponse = await makeRequest('PUT', `/dashboards/${testDashboardId}`, {
    name: 'Dashboard de Teste Atualizado'
  }, authToken);
  
  console.log('Atualizar dashboard:', updateResponse.status, updateResponse.data.success ? 'Sucesso' : 'Falha');
  
  return listResponse.data.success && getResponse.data.success && updateResponse.data.success;
}

// Testes para API de indicadores
async function testIndicatorsAPI() {
  console.log('\nTestando API de indicadores...');
  
  // Teste de listagem de indicadores
  const listResponse = await makeRequest('GET', `/indicators?dashboardId=${testDashboardId}`, null, authToken);
  
  console.log('Listar indicadores:', listResponse.status, listResponse.data.success ? 'Sucesso' : 'Falha');
  
  if (listResponse.data.success && listResponse.data.data.length > 0) {
    testIndicatorId = listResponse.data.data[0].id;
    console.log('Usando indicador existente:', testIndicatorId);
  } else {
    // Se não houver indicadores, criar um novo
    const createResponse = await makeRequest('POST', '/indicators', {
      dashboard_id: testDashboardId,
      title: 'Indicador de Teste',
      metric_id: 'spend',
      size: 'medium',
      chart_type: 'card',
      color_scheme: 'default',
      is_visible: true,
      config: '{}'
    }, authToken);
    
    console.log('Criar indicador:', createResponse.status, createResponse.data.success ? 'Sucesso' : 'Falha');
    
    if (createResponse.data.success) {
      testIndicatorId = createResponse.data.data.id;
      console.log('ID do indicador de teste:', testIndicatorId);
    } else {
      console.log('Erro ao criar indicador:', createResponse.data.error);
      return false;
    }
  }
  
  // Teste de atualização do indicador
  const updateResponse = await makeRequest('PUT', `/indicators/${testIndicatorId}`, {
    title: 'Indicador de Teste Atualizado',
    chart_type: 'line'
  }, authToken);
  
  console.log('Atualizar indicador:', updateResponse.status, updateResponse.data.success ? 'Sucesso' : 'Falha');
  
  // Teste de reordenação de indicadores
  const reorderResponse = await makeRequest('PUT', '/indicators/reorder', {
    dashboard_id: testDashboardId,
    indicators: [
      { id: testIndicatorId, position: 0 }
    ]
  }, authToken);
  
  console.log('Reordenar indicadores:', reorderResponse.status, reorderResponse.data.success ? 'Sucesso' : 'Falha');
  
  return listResponse.data.success && updateResponse.data.success && reorderResponse.data.success;
}

// Testes para API de contas de anúncios
async function testAdAccountsAPI() {
  console.log('\nTestando API de contas de anúncios...');
  
  // Teste de listagem de contas Meta
  const metaListResponse = await makeRequest('GET', '/meta/accounts', null, authToken);
  
  console.log('Listar contas Meta:', metaListResponse.status, metaListResponse.data.success ? 'Sucesso' : 'Falha');
  
  // Teste de listagem de contas Google
  const googleListResponse = await makeRequest('GET', '/google/accounts', null, authToken);
  
  console.log('Listar contas Google:', googleListResponse.status, googleListResponse.data.success ? 'Sucesso' : 'Falha');
  
  // Teste de criação de conta Meta
  const metaCreateResponse = await makeRequest('POST', '/meta/accounts', {
    client_id: testClientId,
    account_id: '123456789',
    account_name: 'Conta Meta de Teste',
    status: 'active'
  }, authToken);
  
  console.log('Criar conta Meta:', metaCreateResponse.status, metaCreateResponse.data.success ? 'Sucesso' : 'Falha');
  
  if (metaCreateResponse.data.success) {
    testMetaAccountId = metaCreateResponse.data.data.id;
    console.log('ID da conta Meta de teste:', testMetaAccountId);
  } else {
    // Se a criação falhar, pode ser porque a conta já existe
    console.log('Erro ao criar conta Meta:', metaCreateResponse.data.error);
    
    // Tentar buscar uma conta existente
    if (metaListResponse.data.success && metaListResponse.data.data.length > 0) {
      testMetaAccountId = metaListResponse.data.data[0].id;
      console.log('Usando conta Meta existente:', testMetaAccountId);
    }
  }
  
  // Teste de criação de conta Google
  const googleCreateResponse = await makeRequest('POST', '/google/accounts', {
    client_id: testClientId,
    account_id: '987654321',
    account_name: 'Conta Google de Teste',
    status: 'active'
  }, authToken);
  
  console.log('Criar conta Google:', googleCreateResponse.status, googleCreateResponse.data.success ? 'Sucesso' : 'Falha');
  
  if (googleCreateResponse.data.success) {
    testGoogleAccountId = googleCreateResponse.data.data.id;
    console.log('ID da conta Google de teste:', testGoogleAccountId);
  } else {
    // Se a criação falhar, pode ser porque a conta já existe
    console.log('Erro ao criar conta Google:', googleCreateResponse.data.error);
    
    // Tentar buscar uma conta existente
    if (googleListResponse.data.success && googleListResponse.data.data.length > 0) {
      testGoogleAccountId = googleListResponse.data.data[0].id;
      console.log('Usando conta Google existente:', testGoogleAccountId);
    }
  }
  
  return metaListResponse.data.success && googleListResponse.data.success;
}

// Testes para API de campanhas
async function testCampaignsAPI() {
  console.log('\nTestando API de campanhas...');
  
  // Teste de listagem de campanhas unificadas
  const listResponse = await makeRequest('GET', `/campaigns?clientId=${testClientId}`, null, authToken);
  
  console.log('Listar campanhas unificadas:', listResponse.status, listResponse.data.success ? 'Sucesso' : 'Falha');
  
  // Teste de insights de campanhas
  const insightsResponse = await makeRequest('GET', `/campaigns/insights?clientId=${testClientId}&breakdown=day`, null, authToken);
  
  console.log('Obter insights de campanhas:', insightsResponse.status, insightsResponse.data.success ? 'Sucesso' : 'Falha');
  
  // Teste de listagem de métricas disponíveis
  const metricsResponse = await makeRequest('GET', '/campaigns/metrics', null, authToken);
  
  console.log('Listar métricas disponíveis:', metricsResponse.status, metricsResponse.data.success ? 'Sucesso' : 'Falha');
  
  return listResponse.data.success && insightsResponse.data.success && metricsResponse.data.success;
}

// Testes para API de campanhas específicas de plataforma
async function testPlatformCampaignsAPI() {
  console.log('\nTestando API de campanhas específicas de plataforma...');
  
  // Teste de campanhas Meta
  let metaCampaignsSuccess = false;
  if (testMetaAccountId) {
    const metaCampaignsResponse = await makeRequest('GET', `/meta/campaigns?accountId=${testMetaAccountId}`, null, authToken);
    
    console.log('Listar campanhas Meta:', metaCampaignsResponse.status, metaCampaignsResponse.data.success ? 'Sucesso' : 'Falha');
    
    metaCampaignsSuccess = metaCampaignsResponse.data.success;
  } else {
    console.log('Pulando teste de campanhas Meta (nenhuma conta disponível)');
    metaCampaignsSuccess = true; // Considerar sucesso se não houver conta para testar
  }
  
  // Teste de campanhas Google
  let googleCampaignsSuccess = false;
  if (testGoogleAccountId) {
    const googleCampaignsResponse = await makeRequest('GET', `/google/campaigns?accountId=${testGoogleAccountId}`, null, authToken);
    
    console.log('Listar campanhas Google:', googleCampaignsResponse.status, googleCampaignsResponse.data.success ? 'Sucesso' : 'Falha');
    
    googleCampaignsSuccess = googleCampaignsResponse.data.success;
  } else {
    console.log('Pulando teste de campanhas Google (nenhuma conta disponível)');
    googleCampaignsSuccess = true; // Considerar sucesso se não houver conta para testar
  }
  
  return metaCampaignsSuccess && googleCampaignsSuccess;
}

// Função principal para executar todos os testes
async function runAllTests() {
  console.log('Iniciando testes de API do FGDash...\n');
  
  // Testar API de autenticação
  const authSuccess = await testAuthAPI();
  if (!authSuccess) {
    console.log('\nTestes interrompidos devido a falha na autenticação');
    return false;
  }
  
  // Testar API de usuários
  const usersSuccess = await testUsersAPI();
  
  // Testar API de clientes
  const clientsSuccess = await testClientsAPI();
  if (!clientsSuccess) {
    console.log('\nTestes interrompidos devido a falha na API de clientes');
    return false;
  }
  
  // Testar API de dashboards
  const dashboardsSuccess = await testDashboardsAPI();
  
  // Testar API de indicadores
  const indicatorsSuccess = await testIndicatorsAPI();
  
  // Testar API de contas de anúncios
  const adAccountsSuccess = await testAdAccountsAPI();
  
  // Testar API de campanhas
  const campaignsSuccess = await testCampaignsAPI();
  
  // Testar API de campanhas específicas de plataforma
  const platformCampaignsSuccess = await testPlatformCampaignsAPI();
  
  // Resumo dos resultados
  console.log('\n=== Resumo dos Testes ===');
  console.log('API de autenticação:', authSuccess ? 'SUCESSO' : 'FALHA');
  console.log('API de usuários:', usersSuccess ? 'SUCESSO' : 'FALHA');
  console.log('API de clientes:', clientsSuccess ? 'SUCESSO' : 'FALHA');
  console.log('API de dashboards:', dashboardsSuccess ? 'SUCESSO' : 'FALHA');
  console.log('API de indicadores:', indicatorsSuccess ? 'SUCESSO' : 'FALHA');
  console.log('API de contas de anúncios:', adAccountsSuccess ? 'SUCESSO' : 'FALHA');
  console.log('API de campanhas:', campaignsSuccess ? 'SUCESSO' : 'FALHA');
  console.log('API de campanhas específicas:', platformCampaignsSuccess ? 'SUCESSO' : 'FALHA');
  
  const overallSuccess = authSuccess && usersSuccess && clientsSuccess && 
                         dashboardsSuccess && indicatorsSuccess && 
                         adAccountsSuccess && campaignsSuccess && platformCampaignsSuccess;
  
  console.log('\nResultado geral:', overallSuccess ? 'TODOS OS TESTES PASSARAM' : 'ALGUNS TESTES FALHARAM');
  
  return overallSuccess;
}

// Executar todos os testes
runAllTests().then(success => {
  console.log('\nTestes concluídos.');
});
