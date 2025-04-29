# FGDash - Dashboard de Tráfego Pago da Freaky Guys

## Visão Geral

FGDash é uma aplicação web completa para visualização e análise de dados de tráfego pago do Meta Ads e Google Ads, desenvolvida especificamente para a Freaky Guys. A aplicação permite que os usuários visualizem métricas importantes, comparem períodos, personalizem dashboards e gerenciem múltiplos clientes e contas de anúncios.

## Características Principais

- **Design Visual da Freaky Guys**: Interface com tema escuro premium utilizando as cores institucionais (amarelo #FFDD00 e preto #000000)
- **Autenticação e Controle de Acesso**: Sistema de login com diferentes níveis de permissão
- **Integração com APIs**: Conexão direta com Meta Ads e Google Ads
- **Métricas Completas**: Visualização de todas as métricas importantes (Investido, Resultado, Custo por Resultado, Retorno, etc.)
- **Comparação de Períodos**: Análise comparativa entre diferentes períodos (semana vs semana, mês atual vs mês passado)
- **Dashboards Personalizáveis**: Sistema de indicadores dinâmicos que permite total personalização
- **Gerenciamento de Clientes**: Administração de múltiplos clientes e suas contas de anúncios
- **Visualizações Avançadas**: Gráficos interativos, tabelas detalhadas e cards de métricas

## Tecnologias Utilizadas

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Cloudflare D1 (SQLite)
- **Autenticação**: JWT (JSON Web Tokens)
- **APIs Externas**: Meta Marketing API, Google Ads API
- **Visualização de Dados**: Chart.js, React Table

## Estrutura do Projeto

```
fgdash/
├── docs/                    # Documentação
├── public/                  # Arquivos estáticos
├── src/
│   ├── app/                 # Páginas e rotas da aplicação
│   │   ├── admin/           # Área de administração
│   │   ├── api/             # Endpoints da API
│   │   │   ├── auth/        # Autenticação
│   │   │   ├── clients/     # Gerenciamento de clientes
│   │   │   ├── users/       # Gerenciamento de usuários
│   │   │   ├── dashboards/  # Gerenciamento de dashboards
│   │   │   ├── indicators/  # Gerenciamento de indicadores
│   │   │   ├── meta/        # Integração com Meta Ads
│   │   │   ├── google/      # Integração com Google Ads
│   │   │   └── campaigns/   # API unificada de campanhas
│   │   ├── dashboard/       # Dashboard principal
│   │   └── settings/        # Configurações
│   ├── components/          # Componentes reutilizáveis
│   │   ├── admin/           # Componentes da área de administração
│   │   ├── dashboard/       # Componentes do dashboard
│   │   ├── settings/        # Componentes de configurações
│   │   └── ui/              # Componentes de UI genéricos
│   ├── context/             # Contextos React
│   ├── services/            # Serviços e utilitários
│   └── styles/              # Estilos globais
├── tests/                   # Testes
├── migrations/              # Migrações de banco de dados
└── wrangler.toml            # Configuração do Cloudflare Workers
```

## Instalação e Configuração

### Pré-requisitos

- Node.js 18.x ou superior
- npm 9.x ou superior
- Conta no Cloudflare (para o banco de dados D1)
- Acesso às APIs do Meta e Google Ads

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/freaky-guys/fgdash.git
   cd fgdash
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente:
   ```bash
   cp .env.example .env.local
   ```
   Edite o arquivo `.env.local` com suas credenciais.

4. Configure o banco de dados:
   ```bash
   npx wrangler d1 create fgdash-db
   ```
   Atualize o arquivo `wrangler.toml` com o ID do banco de dados.

5. Execute as migrações:
   ```bash
   npx wrangler d1 execute fgdash-db --file=./migrations/0001_initial.sql
   ```

### Desenvolvimento

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

### Produção

Para construir a aplicação para produção:

```bash
npm run build
```

Para iniciar o servidor de produção:

```bash
npm start
```

Para implantar na Cloudflare:

```bash
npm run deploy
```

## Uso da API

A API do FGDash segue uma arquitetura RESTful e está documentada detalhadamente em `/docs/api-documentation.md`. Todos os endpoints retornam respostas no formato JSON com a seguinte estrutura:

```json
{
  "success": true|false,
  "data": {...},  // Presente apenas em caso de sucesso
  "error": "..."  // Presente apenas em caso de erro
}
```

### Autenticação

A API utiliza autenticação baseada em JWT (JSON Web Tokens). Para acessar endpoints protegidos, inclua o token no cabeçalho `Authorization`:

```
Authorization: Bearer <token>
```

### Exemplos de Uso

#### Login

```javascript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'usuario@exemplo.com',
    password: 'senha123'
  })
});

const data = await response.json();
if (data.success) {
  localStorage.setItem('auth_token', data.data.token);
}
```

#### Buscar Dados de Campanhas

```javascript
const response = await fetch('/api/campaigns?clientId=client_id&startDate=2025-04-01&endDate=2025-04-30', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
  }
});

const data = await response.json();
if (data.success) {
  // Processar dados de campanhas
  console.log(data.data);
}
```

## Personalização do Dashboard

O FGDash permite personalização completa dos dashboards através do sistema de indicadores dinâmicos. Os usuários podem:

1. **Adicionar/Remover Indicadores**: Escolher quais métricas desejam visualizar
2. **Reorganizar Indicadores**: Arrastar e soltar para reorganizar a posição dos indicadores
3. **Configurar Visualizações**: Escolher entre diferentes tipos de visualização (cards, gráficos de linha, gráficos de rosca, etc.)
4. **Salvar Layouts**: Salvar configurações personalizadas para uso futuro

## Integração com Meta Ads e Google Ads

### Meta Ads

A integração com o Meta Ads é feita através da Meta Marketing API. Para configurar:

1. Acesse a página de Configurações
2. Clique em "Conectar Conta Meta"
3. Siga o fluxo de autenticação OAuth
4. Selecione as contas de anúncios que deseja conectar

### Google Ads

A integração com o Google Ads é feita através da Google Ads API. Para configurar:

1. Acesse a página de Configurações
2. Clique em "Conectar Conta Google"
3. Siga o fluxo de autenticação OAuth
4. Selecione as contas de anúncios que deseja conectar

## Métricas Disponíveis

O FGDash suporta todas as métricas importantes para análise de tráfego pago:

### Métricas Principais
- **Investido**: Valor total gasto nas campanhas
- **Resultado**: Número total de conversões
- **Custo por Resultado**: Custo médio por conversão
- **Retorno**: Percentual de retorno sobre o investimento

### Métricas de Alcance
- **Impressões**: Número total de impressões
- **Cliques**: Número total de cliques
- **CTR**: Taxa de cliques (Cliques / Impressões)
- **Alcance**: Número de usuários únicos alcançados
- **Frequência**: Frequência média de exibição por usuário

### Métricas de Custo
- **CPC**: Custo por clique
- **CPM**: Custo por mil impressões

### Métricas de Vídeo
- **Visualizações (25%, 50%, 75%, 95%)**: Número de visualizações que atingiram cada percentual do vídeo
- **Hook Rate**: Taxa de retenção do vídeo

### Métricas de Engajamento
- **Engajamento de Página**: Número total de engajamentos na página

## Comparação de Períodos

O FGDash permite comparar dados entre diferentes períodos:

- **Período Atual vs Período Anterior**: Comparação entre o período selecionado e o período imediatamente anterior de mesma duração
- **Semana vs Semana**: Comparação entre a semana atual e a semana anterior
- **Mês Atual vs Mês Passado**: Comparação entre o mês atual e o mês anterior
- **Mesmo Período do Ano Anterior**: Comparação com o mesmo período do ano anterior
- **Períodos Personalizados**: Seleção de datas específicas para comparação

## Gerenciamento de Usuários e Permissões

O FGDash suporta diferentes níveis de acesso:

- **Admin**: Acesso completo a todas as funcionalidades e clientes
- **Manager**: Acesso a clientes específicos com permissão para editar
- **User**: Acesso a clientes específicos apenas para visualização

Para gerenciar usuários e permissões:

1. Acesse a página de Administração
2. Selecione "Gerenciar Usuários"
3. Adicione novos usuários ou edite permissões de usuários existentes

## Suporte e Contato

Para suporte técnico ou dúvidas sobre o FGDash, entre em contato com:

- **Email**: suporte@freakyguys.com.br
- **Telefone**: (XX) XXXX-XXXX

## Licença

Este software é propriedade da Freaky Guys e seu uso é restrito aos termos do contrato de licença.
