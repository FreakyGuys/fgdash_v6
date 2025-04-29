# Guia de Implantação do FGDash

Este guia simplificado vai ajudar você a colocar o FGDash em produção usando a Vercel, sem necessidade de conhecimentos técnicos avançados.

## Método 1: Implantação via Vercel (Recomendado)

A Vercel oferece um plano gratuito que é suficiente para a maioria dos usuários e é a maneira mais fácil de colocar o FGDash em produção.

### Passo 1: Criar uma conta na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Sign Up" e crie uma conta usando sua conta do GitHub, GitLab, Bitbucket ou e-mail

### Passo 2: Importar o projeto

1. Após fazer login, clique no botão "Add New..." e selecione "Project"
2. Conecte sua conta do GitHub, GitLab ou Bitbucket se ainda não estiver conectada
3. Selecione o repositório onde você fez upload do código do FGDash
   - Se você não tem o código em um repositório, você pode criar um novo repositório no GitHub e fazer upload do arquivo zip que fornecemos

### Passo 3: Configurar o projeto

1. Na tela de configuração do projeto, mantenha as configurações padrão:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

2. Expanda a seção "Environment Variables" e adicione as seguintes variáveis:
   - `NEXT_PUBLIC_META_API_KEY`: Sua chave de API do Meta Ads
   - `NEXT_PUBLIC_GOOGLE_API_KEY`: Sua chave de API do Google Ads
   - `NEXT_PUBLIC_API_BASE_URL`: Deixe em branco para usar a API interna

3. Clique em "Deploy"

### Passo 4: Aguardar a implantação

1. A Vercel vai construir e implantar automaticamente seu projeto
2. Após a conclusão, você receberá um URL para acessar sua aplicação (exemplo: fgdash.vercel.app)

### Passo 5: Configurar domínio personalizado (opcional)

1. Na página do seu projeto na Vercel, clique na aba "Domains"
2. Clique em "Add" e digite seu domínio personalizado
3. Siga as instruções para configurar os registros DNS do seu domínio

## Método 2: Implantação via Cloudflare Pages

Se você preferir usar o Cloudflare Pages, que também oferece um plano gratuito:

### Passo 1: Criar uma conta no Cloudflare

1. Acesse [cloudflare.com](https://cloudflare.com)
2. Clique em "Sign Up" e crie uma conta

### Passo 2: Configurar o Cloudflare Pages

1. No painel do Cloudflare, clique em "Pages"
2. Clique em "Create a project"
3. Conecte sua conta do GitHub ou GitLab
4. Selecione o repositório com o código do FGDash

### Passo 3: Configurar o build

1. Na tela de configuração do build:
   - Framework preset: Next.js
   - Build command: `npm run build`
   - Build output directory: .next
   - Root directory: /

2. Adicione as mesmas variáveis de ambiente mencionadas no Método 1
3. Clique em "Save and Deploy"

## Solução de Problemas Comuns

### A aplicação não está carregando corretamente

- Verifique se todas as variáveis de ambiente foram configuradas corretamente
- Certifique-se de que as chaves de API do Meta e Google Ads são válidas
- Verifique os logs de build na plataforma de hospedagem para identificar erros

### Erro de conexão com as APIs

- Verifique se suas chaves de API têm as permissões corretas
- Confirme se as contas do Meta e Google Ads estão ativas
- Verifique se as variáveis de ambiente estão configuradas corretamente

### Problemas de desempenho

- A Vercel e o Cloudflare oferecem CDNs globais que melhoram o desempenho automaticamente
- Para melhorar ainda mais o desempenho, considere ativar a opção de ISR (Incremental Static Regeneration) nas configurações do projeto

## Suporte

Se você encontrar problemas durante a implantação, entre em contato com nossa equipe de suporte em suporte@freakyguys.com.br ou abra um issue no repositório do GitHub.
