# Documentação da API do FGDash

## Visão Geral

O FGDash (Freaky Guys Dashboard) é uma aplicação para visualização e análise de dados de tráfego pago do Meta Ads e Google Ads. Esta documentação descreve as APIs implementadas para o backend e como o frontend se comunica com elas.

## Estrutura da API

A API do FGDash segue uma arquitetura RESTful e está organizada nos seguintes módulos:

1. **Autenticação** (`/api/auth`)
2. **Usuários** (`/api/users`)
3. **Clientes** (`/api/clients`)
4. **Dashboards** (`/api/dashboards`)
5. **Indicadores** (`/api/indicators`)
6. **Meta Ads** (`/api/meta`)
7. **Google Ads** (`/api/google`)
8. **Campanhas Unificadas** (`/api/campaigns`)

Todas as respostas da API seguem um formato padrão:

```json
{
  "success": true|false,
  "data": {...},  // Presente apenas em caso de sucesso
  "error": "..."  // Presente apenas em caso de erro
}
```

## Autenticação

### Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Registrar um novo usuário |
| POST | `/api/auth/login` | Autenticar um usuário |
| GET | `/api/auth/verify` | Verificar token de autenticação |

### Registro de Usuário

**Requisição:**
```json
POST /api/auth/register
{
  "name": "Nome do Usuário",
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "role": "user"  // Valores possíveis: "admin", "manager", "user"
}
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "Nome do Usuário",
      "email": "usuario@exemplo.com",
      "role": "user"
    }
  }
}
```

### Login

**Requisição:**
```json
POST /api/auth/login
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "user_id",
      "name": "Nome do Usuário",
      "email": "usuario@exemplo.com",
      "role": "user"
    }
  }
}
```

### Verificação de Token

**Requisição:**
```
GET /api/auth/verify
Authorization: Bearer jwt_token_here
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "Nome do Usuário",
      "email": "usuario@exemplo.com",
      "role": "user"
    }
  }
}
```

## Usuários

### Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/users` | Listar usuários |
| GET | `/api/users/:id` | Obter detalhes de um usuário |
| PUT | `/api/users/:id` | Atualizar um usuário |
| DELETE | `/api/users/:id` | Excluir um usuário |

### Listar Usuários

**Requisição:**
```
GET /api/users?search=termo&role=admin
Authorization: Bearer jwt_token_here
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_id_1",
      "name": "Nome do Usuário 1",
      "email": "usuario1@exemplo.com",
      "role": "admin"
    },
    {
      "id": "user_id_2",
      "name": "Nome do Usuário 2",
      "email": "usuario2@exemplo.com",
      "role": "user"
    }
  ]
}
```

### Obter Detalhes de um Usuário

**Requisição:**
```
GET /api/users/user_id
Authorization: Bearer jwt_token_here
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "role": "user",
    "created_at": "2025-04-01T12:00:00Z",
    "updated_at": "2025-04-01T12:00:00Z",
    "clients": [
      {
        "client_id": "client_id_1",
        "client_name": "Cliente 1",
        "permission_type": "admin"
      }
    ]
  }
}
```

### Atualizar um Usuário

**Requisição:**
```json
PUT /api/users/user_id
Authorization: Bearer jwt_token_here
{
  "name": "Novo Nome do Usuário",
  "email": "novoemail@exemplo.com",
  "password": "novasenha123",  // Opcional
  "role": "manager"  // Apenas admin pode alterar
}
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "Novo Nome do Usuário",
    "email": "novoemail@exemplo.com",
    "role": "manager",
    "updated_at": "2025-04-01T13:00:00Z"
  }
}
```

### Excluir um Usuário

**Requisição:**
```
DELETE /api/users/user_id
Authorization: Bearer jwt_token_here
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "message": "Usuário excluído com sucesso"
}
```

## Clientes

### Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/clients` | Listar clientes |
| GET | `/api/clients/:id` | Obter detalhes de um cliente |
| POST | `/api/clients` | Criar um cliente |
| PUT | `/api/clients/:id` | Atualizar um cliente |
| DELETE | `/api/clients/:id` | Excluir um cliente |
| POST | `/api/clients/:id/users` | Adicionar usuário a um cliente |
| PUT | `/api/clients/:id/users/:userId` | Atualizar permissão de usuário |
| DELETE | `/api/clients/:id/users/:userId` | Remover usuário de um cliente |

### Listar Clientes

**Requisição:**
```
GET /api/clients?search=termo&status=active
Authorization: Bearer jwt_token_here
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "data": [
    {
      "id": "client_id_1",
      "name": "Cliente 1",
      "logo_url": "https://exemplo.com/logo1.png",
      "status": "active",
      "created_at": "2025-04-01T12:00:00Z",
      "updated_at": "2025-04-01T12:00:00Z",
      "account_count": 3
    },
    {
      "id": "client_id_2",
      "name": "Cliente 2",
      "logo_url": null,
      "status": "active",
      "created_at": "2025-04-01T12:00:00Z",
      "updated_at": "2025-04-01T12:00:00Z",
      "account_count": 1
    }
  ]
}
```

### Obter Detalhes de um Cliente

**Requisição:**
```
GET /api/clients/client_id
Authorization: Bearer jwt_token_here
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "data": {
    "id": "client_id",
    "name": "Nome do Cliente",
    "logo_url": "https://exemplo.com/logo.png",
    "status": "active",
    "created_at": "2025-04-01T12:00:00Z",
    "updated_at": "2025-04-01T12:00:00Z",
    "accounts": [
      {
        "id": "account_id_1",
        "platform": "meta",
        "account_id": "123456789",
        "account_name": "Conta Meta",
        "status": "active"
      },
      {
        "id": "account_id_2",
        "platform": "google",
        "account_id": "987654321",
        "account_name": "Conta Google",
        "status": "active"
      }
    ],
    "dashboards": [
      {
        "id": "dashboard_id_1",
        "name": "Dashboard Principal",
        "description": "Dashboard principal do cliente",
        "is_default": true
      }
    ],
    "users": [
      {
        "id": "user_id_1",
        "name": "Nome do Usuário 1",
        "email": "usuario1@exemplo.com",
        "role": "admin",
        "permission_type": "admin"
      }
    ]
  }
}
```

### Criar um Cliente

**Requisição:**
```json
POST /api/clients
Authorization: Bearer jwt_token_here
{
  "name": "Novo Cliente",
  "logo_url": "https://exemplo.com/logo.png",
  "status": "active"
}
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "data": {
    "id": "client_id",
    "name": "Novo Cliente",
    "logo_url": "https://exemplo.com/logo.png",
    "status": "active",
    "created_at": "2025-04-01T12:00:00Z",
    "updated_at": "2025-04-01T12:00:00Z",
    "account_count": 0
  }
}
```

### Atualizar um Cliente

**Requisição:**
```json
PUT /api/clients/client_id
Authorization: Bearer jwt_token_here
{
  "name": "Nome Atualizado",
  "logo_url": "https://exemplo.com/novo-logo.png",
  "status": "inactive"
}
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "data": {
    "id": "client_id",
    "name": "Nome Atualizado",
    "logo_url": "https://exemplo.com/novo-logo.png",
    "status": "inactive",
    "created_at": "2025-04-01T12:00:00Z",
    "updated_at": "2025-04-01T13:00:00Z",
    "account_count": 2
  }
}
```

### Excluir um Cliente

**Requisição:**
```
DELETE /api/clients/client_id
Authorization: Bearer jwt_token_here
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "message": "Cliente excluído com sucesso"
}
```

### Adicionar Usuário a um Cliente

**Requisição:**
```json
POST /api/clients/client_id/users
Authorization: Bearer jwt_token_here
{
  "user_id": "user_id",
  "permission_type": "editor"  // Valores possíveis: "admin", "editor", "viewer"
}
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "role": "user",
    "permission_type": "editor",
    "created_at": "2025-04-01T12:00:00Z"
  }
}
```

## Dashboards

### Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/dashboards` | Listar dashboards |
| GET | `/api/dashboards/:id` | Obter detalhes de um dashboard |
| POST | `/api/dashboards` | Criar um dashboard |
| PUT | `/api/dashboards/:id` | Atualizar um dashboard |
| DELETE | `/api/dashboards/:id` | Excluir um dashboard |
| GET | `/api/dashboards/:id/clone` | Clonar um dashboard |

### Listar Dashboards

**Requisição:**
```
GET /api/dashboards?clientId=client_id&userId=user_id
Authorization: Bearer jwt_token_here
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "data": [
    {
      "id": "dashboard_id_1",
      "user_id": "user_id",
      "client_id": "client_id",
      "name": "Dashboard Principal",
      "description": "Dashboard principal do cliente",
      "layout": "grid",
      "is_default": true,
      "created_at": "2025-04-01T12:00:00Z",
      "updated_at": "2025-04-01T12:00:00Z",
      "client_name": "Nome do Cliente",
      "indicators": [
        {
          "id": "indicator_id_1",
          "title": "Investido",
          "metric_id": "spend",
          "position": 0,
          "size": "medium",
          "chart_type": "card",
          "color_scheme": "default",
          "is_visible": true,
          "config": "{}"
        }
      ]
    }
  ]
}
```

### Obter Detalhes de um Dashboard

**Requisição:**
```
GET /api/dashboards/dashboard_id
Authorization: Bearer jwt_token_here
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "data": {
    "id": "dashboard_id",
    "user_id": "user_id",
    "client_id": "client_id",
    "name": "Dashboard Principal",
    "description": "Dashboard principal do cliente",
    "layout": "grid",
    "is_default": true,
    "created_at": "2025-04-01T12:00:00Z",
    "updated_at": "2025-04-01T12:00:00Z",
    "client_name": "Nome do Cliente",
    "indicators": [
      {
        "id": "indicator_id_1",
        "title": "Investido",
        "metric_id": "spend",
        "position": 0,
        "size": "medium",
        "chart_type": "card",
        "color_scheme": "default",
        "is_visible": true,
        "config": "{}"
      },
      {
        "id": "indicator_id_2",
        "title": "Resultado",
        "metric_id": "conversions",
        "position": 1,
        "size": "medium",
        "chart_type": "card",
        "color_scheme": "default",
        "is_visible": true,
        "config": "{}"
      }
    ]
  }
}
```

### Criar um Dashboard

**Requisição:**
```json
POST /api/dashboards
Authorization: Bearer jwt_token_here
{
  "client_id": "client_id",
  "name": "Novo Dashboard",
  "description": "Descrição do novo dashboard",
  "layout": "grid",
  "is_default": false
}
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "data": {
    "id": "dashboard_id",
    "user_id": "user_id",
    "client_id": "client_id",
    "name": "Novo Dashboard",
    "description": "Descrição do novo dashboard",
    "layout": "grid",
    "is_default": false,
    "created_at": "2025-04-01T12:00:00Z",
    "updated_at": "2025-04-01T12:00:00Z",
    "client_name": "Nome do Cliente",
    "indicators": [
      // Indicadores padrão criados automaticamente
    ]
  }
}
```

## Indicadores

### Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/indicators` | Listar indicadores |
| POST | `/api/indicators` | Criar um indicador |
| PUT | `/api/indicators/:id` | Atualizar um indicador |
| DELETE | `/api/indicators/:id` | Excluir um indicador |
| PUT | `/api/indicators/reorder` | Reordenar indicadores |

### Listar Indicadores

**Requisição:**
```
GET /api/indicators?dashboardId=dashboard_id
Authorization: Bearer jwt_token_here
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "data": [
    {
      "id": "indicator_id_1",
      "dashboard_id": "dashboard_id",
      "user_id": "user_id",
      "title": "Investido",
      "metric_id": "spend",
      "position": 0,
      "size": "medium",
      "chart_type": "card",
      "color_scheme": "default",
      "is_visible": true,
      "config": "{}",
      "created_at": "2025-04-01T12:00:00Z",
      "updated_at": "2025-04-01T12:00:00Z"
    },
    {
      "id": "indicator_id_2",
      "dashboard_id": "dashboard_id",
      "user_id": "user_id",
      "title": "Resultado",
      "metric_id": "conversions",
      "position": 1,
      "size": "medium",
      "chart_type": "card",
      "color_scheme": "default",
      "is_visible": true,
      "config": "{}",
      "created_at": "2025-04-01T12:00:00Z",
      "updated_at": "2025-04-01T12:00:00Z"
    }
  ]
}
```

### Criar um Indicador

**Requisição:**
```json
POST /api/indicators
Authorization: Bearer jwt_token_here
{
  "dashboard_id": "dashboard_id",
  "title": "Novo Indicador",
  "metric_id": "ctr",
  "size": "medium",
  "chart_type": "card",
  "color_scheme": "default",
  "is_visible": true,
  "config": "{}"
}
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "data": {
    "id": "indicator_id",
    "dashboard_id": "dashboard_id",
    "user_id": "user_id",
    "title": "Novo Indicador",
    "metric_id": "ctr",
    "position": 2,
    "size": "medium",
    "chart_type": "card",
    "color_scheme": "default",
    "is_visible": true,
    "config": "{}",
    "created_at": "2025-04-01T12:00:00Z",
    "updated_at": "2025-04-01T12:00:00Z"
  }
}
```

## Meta Ads

### Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/meta/auth` | Obter URL de autenticação |
| GET | `/api/meta/auth/callback` | Callback de autenticação |
| GET | `/api/meta/accounts` | Listar contas Meta |
| GET | `/api/meta/accounts/:id` | Obter detalhes de uma conta Meta |
| POST | `/api/meta/accounts` | Criar uma conta Meta |
| PUT | `/api/meta/accounts/:id` | Atualizar uma conta Meta |
| DELETE | `/api/meta/accounts/:id` | Excluir uma conta Meta |
| GET | `/api/meta/campaigns` | Listar campanhas Meta |

### Obter URL de Autenticação

**Requisição:**
```
GET /api/meta/auth
Authorization: Bearer jwt_token_here
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "data": {
    "url": "https://www.facebook.com/v18.0/dialog/oauth?client_id=..."
  }
}
```

### Listar Contas Meta

**Requisição:**
```
GET /api/meta/accounts?clientId=client_id
Authorization: Bearer jwt_token_here
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "data": [
    {
      "id": "account_id_1",
      "client_id": "client_id",
      "platform": "meta",
      "account_id": "123456789",
      "account_name": "Conta Meta 1",
      "status": "active",
      "created_at": "2025-04-01T12:00:00Z",
      "updated_at": "2025-04-01T12:00:00Z"
    }
  ]
}
```

### Listar Campanhas Meta

**Requisição:**
```
GET /api/meta/campaigns?accountId=account_id&startDate=2025-04-01&endDate=2025-04-30
Authorization: Bearer jwt_token_here
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "data": [
    {
      "id": "campaign_id_1",
      "name": "Campanha 1",
      "status": "ACTIVE",
      "objective": "CONVERSIONS",
      "spend": 1000.50,
      "impressions": 50000,
      "clicks": 2500,
      "ctr": 0.05,
      "cpc": 0.40,
      "conversions": 100,
      "cost_per_conversion": 10.01,
      "start_date": "2025-04-01",
      "end_date": null
    }
  ]
}
```

## Google Ads

### Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/google/auth` | Obter URL de autenticação |
| GET | `/api/google/auth/callback` | Callback de autenticação |
| GET | `/api/google/accounts` | Listar contas Google |
| GET | `/api/google/accounts/:id` | Obter detalhes de uma conta Google |
| POST | `/api/google/accounts` | Criar uma conta Google |
| PUT | `/api/google/accounts/:id` | Atualizar uma conta Google |
| DELETE | `/api/google/accounts/:id` | Excluir uma conta Google |
| GET | `/api/google/campaigns` | Listar campanhas Google |

### Obter URL de Autenticação

**Requisição:**
```
GET /api/google/auth
Authorization: Bearer jwt_token_here
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "data": {
    "url": "https://accounts.google.com/o/oauth2/auth?client_id=..."
  }
}
```

### Listar Contas Google

**Requisição:**
```
GET /api/google/accounts?clientId=client_id
Authorization: Bearer jwt_token_here
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "data": [
    {
      "id": "account_id_1",
      "client_id": "client_id",
      "platform": "google",
      "account_id": "123456789",
      "account_name": "Conta Google 1",
      "status": "active",
      "created_at": "2025-04-01T12:00:00Z",
      "updated_at": "2025-04-01T12:00:00Z"
    }
  ]
}
```

### Listar Campanhas Google

**Requisição:**
```
GET /api/google/campaigns?accountId=account_id&startDate=2025-04-01&endDate=2025-04-30
Authorization: Bearer jwt_token_here
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "data": [
    {
      "id": "campaign_id_1",
      "name": "Campanha 1",
      "status": "ENABLED",
      "type": "SEARCH",
      "spend": 1000.50,
      "impressions": 50000,
      "clicks": 2500,
      "ctr": 0.05,
      "cpc": 0.40,
      "conversions": 100,
      "cost_per_conversion": 10.01,
      "start_date": "2025-04-01",
      "end_date": null
    }
  ]
}
```

## Campanhas Unificadas

### Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/campaigns` | Listar campanhas unificadas |
| GET | `/api/campaigns/insights` | Obter insights de campanhas |
| GET | `/api/campaigns/metrics` | Listar métricas disponíveis |

### Listar Campanhas Unificadas

**Requisição:**
```
GET /api/campaigns?clientId=client_id&startDate=2025-04-01&endDate=2025-04-30&platform=meta
Authorization: Bearer jwt_token_here
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "data": [
    {
      "id": "campaign_id_1",
      "platform": "meta",
      "name": "Campanha Meta 1",
      "status": "ACTIVE",
      "spend": 1000.50,
      "impressions": 50000,
      "clicks": 2500,
      "ctr": 0.05,
      "cpc": 0.40,
      "conversions": 100,
      "cost_per_result": 10.01,
      "return_percentage": 1.42,
      "start_date": "2025-04-01",
      "end_date": null
    },
    {
      "id": "campaign_id_2",
      "platform": "google",
      "name": "Campanha Google 1",
      "status": "ENABLED",
      "spend": 800.25,
      "impressions": 40000,
      "clicks": 2000,
      "ctr": 0.05,
      "cpc": 0.40,
      "conversions": 80,
      "cost_per_result": 10.00,
      "return_percentage": 1.35,
      "start_date": "2025-04-01",
      "end_date": null
    }
  ]
}
```

### Obter Insights de Campanhas

**Requisição:**
```
GET /api/campaigns/insights?clientId=client_id&startDate=2025-04-01&endDate=2025-04-30&compareStartDate=2025-03-01&compareEndDate=2025-03-31&breakdown=day
Authorization: Bearer jwt_token_here
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "current": {
        "spend": 1800.75,
        "impressions": 90000,
        "clicks": 4500,
        "ctr": 0.05,
        "cpc": 0.40,
        "conversions": 180,
        "cost_per_result": 10.00,
        "return_percentage": 1.39
      },
      "previous": {
        "spend": 1500.50,
        "impressions": 75000,
        "clicks": 3750,
        "ctr": 0.05,
        "cpc": 0.40,
        "conversions": 150,
        "cost_per_result": 10.00,
        "return_percentage": 1.30
      },
      "change": {
        "spend": 20.01,
        "impressions": 20.00,
        "clicks": 20.00,
        "ctr": 0.00,
        "cpc": 0.00,
        "conversions": 20.00,
        "cost_per_result": 0.00,
        "return_percentage": 6.92
      }
    },
    "breakdown": [
      {
        "dimension": "2025-04-01",
        "current": {
          "spend": 60.00,
          "impressions": 3000,
          "clicks": 150,
          "conversions": 6
        },
        "previous": {
          "spend": 50.00,
          "impressions": 2500,
          "clicks": 125,
          "conversions": 5
        }
      },
      // ... outros dias
    ],
    "platforms": {
      "meta": {
        "current": {
          "spend": 1000.50,
          "impressions": 50000,
          "clicks": 2500,
          "conversions": 100
        },
        "previous": {
          "spend": 800.25,
          "impressions": 40000,
          "clicks": 2000,
          "conversions": 80
        }
      },
      "google": {
        "current": {
          "spend": 800.25,
          "impressions": 40000,
          "clicks": 2000,
          "conversions": 80
        },
        "previous": {
          "spend": 700.25,
          "impressions": 35000,
          "clicks": 1750,
          "conversions": 70
        }
      }
    }
  }
}
```

### Listar Métricas Disponíveis

**Requisição:**
```
GET /api/campaigns/metrics
Authorization: Bearer jwt_token_here
```

**Resposta (sucesso):**
```json
{
  "success": true,
  "data": [
    {
      "id": "spend",
      "name": "Investido",
      "category": "principal",
      "format": "currency",
      "description": "Valor total investido na campanha"
    },
    {
      "id": "conversions",
      "name": "Resultado",
      "category": "principal",
      "format": "number",
      "description": "Número total de conversões"
    },
    {
      "id": "cost_per_result",
      "name": "Custo por Resultado",
      "category": "principal",
      "format": "currency",
      "description": "Custo médio por conversão"
    },
    {
      "id": "return_percentage",
      "name": "Retorno",
      "category": "principal",
      "format": "percentage",
      "description": "Percentual de retorno sobre o investimento"
    },
    {
      "id": "impressions",
      "name": "Impressões",
      "category": "alcance",
      "format": "number",
      "description": "Número total de impressões"
    },
    {
      "id": "clicks",
      "name": "Cliques",
      "category": "alcance",
      "format": "number",
      "description": "Número total de cliques"
    },
    {
      "id": "ctr",
      "name": "CTR",
      "category": "alcance",
      "format": "percentage",
      "description": "Taxa de cliques (Cliques / Impressões)"
    },
    {
      "id": "cpc",
      "name": "CPC",
      "category": "custo",
      "format": "currency",
      "description": "Custo por clique"
    },
    {
      "id": "cpm",
      "name": "CPM",
      "category": "custo",
      "format": "currency",
      "description": "Custo por mil impressões"
    },
    {
      "id": "frequency",
      "name": "Frequência",
      "category": "alcance",
      "format": "number",
      "description": "Frequência média de exibição por usuário"
    },
    {
      "id": "reach",
      "name": "Alcance",
      "category": "alcance",
      "format": "number",
      "description": "Número de usuários únicos alcançados"
    },
    {
      "id": "video_p25_watched",
      "name": "Visualizações 25%",
      "category": "video",
      "format": "number",
      "description": "Número de visualizações que atingiram 25% do vídeo"
    },
    {
      "id": "video_p50_watched",
      "name": "Visualizações 50%",
      "category": "video",
      "format": "number",
      "description": "Número de visualizações que atingiram 50% do vídeo"
    },
    {
      "id": "video_p75_watched",
      "name": "Visualizações 75%",
      "category": "video",
      "format": "number",
      "description": "Número de visualizações que atingiram 75% do vídeo"
    },
    {
      "id": "video_p95_watched",
      "name": "Visualizações 95%",
      "category": "video",
      "format": "number",
      "description": "Número de visualizações que atingiram 95% do vídeo"
    },
    {
      "id": "hook_rate",
      "name": "Hook Rate",
      "category": "video",
      "format": "percentage",
      "description": "Taxa de retenção do vídeo (Visualizações 25% / Impressões)"
    },
    {
      "id": "page_engagement",
      "name": "Eng. Página",
      "category": "engajamento",
      "format": "number",
      "description": "Número total de engajamentos na página"
    }
  ]
}
```

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Requisição inválida (dados incompletos ou inválidos) |
| 401 | Não autenticado (token ausente ou inválido) |
| 403 | Não autorizado (sem permissão para o recurso) |
| 404 | Recurso não encontrado |
| 409 | Conflito (ex: email já cadastrado) |
| 500 | Erro interno do servidor |

## Integração com o Frontend

O frontend se comunica com as APIs através do serviço `api.ts`, que fornece funções para cada endpoint da API. Este serviço gerencia automaticamente a autenticação, tratamento de erros e formatação de dados.

Exemplo de uso no frontend:

```typescript
import api from '@/services/api';

// Autenticação
const login = async (email: string, password: string) => {
  const response = await api.auth.login(email, password);
  if (response.success) {
    // Armazenar token e redirecionar
    localStorage.setItem('auth_token', response.data.token);
    return response.data.user;
  } else {
    // Tratar erro
    throw new Error(response.error);
  }
};

// Buscar dados de campanhas
const fetchCampaignData = async (clientId: string, dateRange: {start: string, end: string}) => {
  const response = await api.campaigns.listCampaigns(clientId, dateRange);
  if (response.success) {
    return response.data;
  } else {
    throw new Error(response.error);
  }
};

// Buscar insights com comparação de períodos
const fetchInsights = async (
  clientId: string, 
  currentPeriod: {start: string, end: string},
  previousPeriod: {start: string, end: string},
  breakdown: string
) => {
  const response = await api.campaigns.getInsights(clientId, currentPeriod, previousPeriod, breakdown);
  if (response.success) {
    return response.data;
  } else {
    throw new Error(response.error);
  }
};
```

## Considerações de Segurança

1. **Autenticação**: Todas as requisições (exceto login e registro) exigem um token JWT válido no cabeçalho `Authorization`.

2. **Autorização**: As APIs verificam se o usuário tem permissão para acessar os recursos solicitados.

3. **Validação de Dados**: Todas as entradas são validadas antes do processamento.

4. **Armazenamento Seguro**: Senhas são armazenadas com hash e tokens de acesso às plataformas de anúncios são criptografados.

5. **HTTPS**: Todas as comunicações devem ser feitas através de HTTPS para garantir a segurança dos dados em trânsito.

## Limitações e Considerações

1. **Rate Limiting**: As APIs do Meta e Google têm limites de taxa que devem ser respeitados.

2. **Atualizações de API**: As APIs do Meta e Google podem mudar, exigindo atualizações no código.

3. **Dados Históricos**: A disponibilidade de dados históricos depende das políticas de retenção das plataformas.

4. **Métricas Calculadas**: Algumas métricas são calculadas com base em outras métricas e podem ter pequenas diferenças em relação às métricas exibidas nas plataformas originais.

5. **Permissões**: O acesso às contas de anúncios depende das permissões concedidas durante o processo de autenticação OAuth.
