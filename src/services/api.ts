// API service para comunicação com o backend

// URL base da API
const API_BASE_URL = '/api';

// Interface para resposta padrão da API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Função auxiliar para fazer requisições HTTP
async function fetchApi<T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', 
  body?: any,
  headers?: Record<string, string>
): Promise<ApiResponse<T>> {
  try {
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Adicionar token de autenticação se disponível
    const token = localStorage.getItem('auth_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Mesclar headers padrão com headers personalizados
    const requestHeaders = {
      ...defaultHeaders,
      ...headers
    };

    const options: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    return {
      success: response.ok,
      data: response.ok ? data.data : undefined,
      error: !response.ok ? data.error || 'Erro desconhecido' : undefined
    };
  } catch (error) {
    console.error('Erro na requisição API:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// API de autenticação
export const authApi = {
  login: (email: string, password: string) => 
    fetchApi<{token: string, user: any}>('/auth/login', 'POST', { email, password }),
  
  register: (name: string, email: string, password: string, role: string = 'user') => 
    fetchApi<{token: string, user: any}>('/auth/register', 'POST', { name, email, password, role }),
  
  verify: () => 
    fetchApi<{user: any}>('/auth/verify'),
  
  logout: () => {
    localStorage.removeItem('auth_token');
    return Promise.resolve({ success: true });
  }
};

// API de usuários
export const usersApi = {
  getProfile: (userId: string) => 
    fetchApi<any>(`/users/${userId}`),
  
  updateProfile: (userId: string, data: any) => 
    fetchApi<any>(`/users/${userId}`, 'PUT', data),
  
  listUsers: (search?: string, role?: string) => {
    let queryParams = '';
    if (search) queryParams += `search=${encodeURIComponent(search)}&`;
    if (role) queryParams += `role=${encodeURIComponent(role)}&`;
    
    return fetchApi<any[]>(`/users${queryParams ? `?${queryParams.slice(0, -1)}` : ''}`);
  },
  
  updatePermissions: (userId: string, clientId: string, permissionType: string) => 
    fetchApi<any>(`/clients/${clientId}/users/${userId}`, 'PUT', { permission_type: permissionType })
};

// API de clientes
export const clientsApi = {
  listClients: (search?: string, status?: string) => {
    let queryParams = '';
    if (search) queryParams += `search=${encodeURIComponent(search)}&`;
    if (status) queryParams += `status=${encodeURIComponent(status)}&`;
    
    return fetchApi<any[]>(`/clients${queryParams ? `?${queryParams.slice(0, -1)}` : ''}`);
  },
  
  getClient: (clientId: string) => 
    fetchApi<any>(`/clients/${clientId}`),
  
  createClient: (data: any) => 
    fetchApi<any>('/clients', 'POST', data),
  
  updateClient: (clientId: string, data: any) => 
    fetchApi<any>(`/clients/${clientId}`, 'PUT', data),
  
  deleteClient: (clientId: string) => 
    fetchApi<any>(`/clients/${clientId}`, 'DELETE'),
  
  addUser: (clientId: string, userId: string, permissionType: string) => 
    fetchApi<any>(`/clients/${clientId}/users`, 'POST', { user_id: userId, permission_type: permissionType }),
  
  removeUser: (clientId: string, userId: string) => 
    fetchApi<any>(`/clients/${clientId}/users/${userId}`, 'DELETE')
};

// API de dashboards
export const dashboardsApi = {
  listDashboards: (clientId?: string, userId?: string) => {
    let queryParams = '';
    if (clientId) queryParams += `clientId=${encodeURIComponent(clientId)}&`;
    if (userId) queryParams += `userId=${encodeURIComponent(userId)}&`;
    
    return fetchApi<any[]>(`/dashboards${queryParams ? `?${queryParams.slice(0, -1)}` : ''}`);
  },
  
  getDashboard: (dashboardId: string) => 
    fetchApi<any>(`/dashboards/${dashboardId}`),
  
  createDashboard: (data: any) => 
    fetchApi<any>('/dashboards', 'POST', data),
  
  updateDashboard: (dashboardId: string, data: any) => 
    fetchApi<any>(`/dashboards/${dashboardId}`, 'PUT', data),
  
  deleteDashboard: (dashboardId: string) => 
    fetchApi<any>(`/dashboards/${dashboardId}`, 'DELETE'),
  
  cloneDashboard: (dashboardId: string) => 
    fetchApi<any>(`/dashboards/${dashboardId}/clone`)
};

// API de indicadores
export const indicatorsApi = {
  listIndicators: (dashboardId?: string) => {
    let queryParams = '';
    if (dashboardId) queryParams += `dashboardId=${encodeURIComponent(dashboardId)}&`;
    
    return fetchApi<any[]>(`/indicators${queryParams ? `?${queryParams.slice(0, -1)}` : ''}`);
  },
  
  createIndicator: (data: any) => 
    fetchApi<any>('/indicators', 'POST', data),
  
  updateIndicator: (indicatorId: string, data: any) => 
    fetchApi<any>(`/indicators/${indicatorId}`, 'PUT', data),
  
  deleteIndicator: (indicatorId: string) => 
    fetchApi<any>(`/indicators/${indicatorId}`, 'DELETE'),
  
  reorderIndicators: (dashboardId: string, indicators: {id: string, position: number}[]) => 
    fetchApi<any>('/indicators/reorder', 'PUT', { dashboard_id: dashboardId, indicators })
};

// API de contas Meta
export const metaApi = {
  listAccounts: (clientId?: string) => {
    let queryParams = '';
    if (clientId) queryParams += `clientId=${encodeURIComponent(clientId)}&`;
    
    return fetchApi<any[]>(`/meta/accounts${queryParams ? `?${queryParams.slice(0, -1)}` : ''}`);
  },
  
  getAccount: (accountId: string) => 
    fetchApi<any>(`/meta/accounts/${accountId}`),
  
  createAccount: (data: any) => 
    fetchApi<any>('/meta/accounts', 'POST', data),
  
  updateAccount: (accountId: string, data: any) => 
    fetchApi<any>(`/meta/accounts/${accountId}`, 'PUT', data),
  
  deleteAccount: (accountId: string) => 
    fetchApi<any>(`/meta/accounts/${accountId}`, 'DELETE'),
  
  getAuthUrl: () => 
    fetchApi<{url: string}>('/meta/auth'),
  
  listCampaigns: (accountId: string, dateRange?: {start: string, end: string}) => {
    let queryParams = `accountId=${encodeURIComponent(accountId)}&`;
    if (dateRange) {
      queryParams += `startDate=${encodeURIComponent(dateRange.start)}&`;
      queryParams += `endDate=${encodeURIComponent(dateRange.end)}&`;
    }
    
    return fetchApi<any[]>(`/meta/campaigns?${queryParams.slice(0, -1)}`);
  }
};

// API de contas Google
export const googleApi = {
  listAccounts: (clientId?: string) => {
    let queryParams = '';
    if (clientId) queryParams += `clientId=${encodeURIComponent(clientId)}&`;
    
    return fetchApi<any[]>(`/google/accounts${queryParams ? `?${queryParams.slice(0, -1)}` : ''}`);
  },
  
  getAccount: (accountId: string) => 
    fetchApi<any>(`/google/accounts/${accountId}`),
  
  createAccount: (data: any) => 
    fetchApi<any>('/google/accounts', 'POST', data),
  
  updateAccount: (accountId: string, data: any) => 
    fetchApi<any>(`/google/accounts/${accountId}`, 'PUT', data),
  
  deleteAccount: (accountId: string) => 
    fetchApi<any>(`/google/accounts/${accountId}`, 'DELETE'),
  
  getAuthUrl: () => 
    fetchApi<{url: string}>('/google/auth'),
  
  listCampaigns: (accountId: string, dateRange?: {start: string, end: string}) => {
    let queryParams = `accountId=${encodeURIComponent(accountId)}&`;
    if (dateRange) {
      queryParams += `startDate=${encodeURIComponent(dateRange.start)}&`;
      queryParams += `endDate=${encodeURIComponent(dateRange.end)}&`;
    }
    
    return fetchApi<any[]>(`/google/campaigns?${queryParams.slice(0, -1)}`);
  }
};

// API unificada de campanhas
export const campaignsApi = {
  listCampaigns: (clientId: string, dateRange?: {start: string, end: string}, platform?: string) => {
    let queryParams = `clientId=${encodeURIComponent(clientId)}&`;
    if (dateRange) {
      queryParams += `startDate=${encodeURIComponent(dateRange.start)}&`;
      queryParams += `endDate=${encodeURIComponent(dateRange.end)}&`;
    }
    if (platform) queryParams += `platform=${encodeURIComponent(platform)}&`;
    
    return fetchApi<any[]>(`/campaigns?${queryParams.slice(0, -1)}`);
  },
  
  getInsights: (clientId: string, dateRange?: {start: string, end: string}, compareWith?: {start: string, end: string}, breakdown?: string) => {
    let queryParams = `clientId=${encodeURIComponent(clientId)}&`;
    if (dateRange) {
      queryParams += `startDate=${encodeURIComponent(dateRange.start)}&`;
      queryParams += `endDate=${encodeURIComponent(dateRange.end)}&`;
    }
    if (compareWith) {
      queryParams += `compareStartDate=${encodeURIComponent(compareWith.start)}&`;
      queryParams += `compareEndDate=${encodeURIComponent(compareWith.end)}&`;
    }
    if (breakdown) queryParams += `breakdown=${encodeURIComponent(breakdown)}&`;
    
    return fetchApi<any>(`/campaigns/insights?${queryParams.slice(0, -1)}`);
  },
  
  getMetrics: () => 
    fetchApi<any[]>('/campaigns/metrics')
};

// Exportar todas as APIs
export default {
  auth: authApi,
  users: usersApi,
  clients: clientsApi,
  dashboards: dashboardsApi,
  indicators: indicatorsApi,
  meta: metaApi,
  google: googleApi,
  campaigns: campaignsApi
};
