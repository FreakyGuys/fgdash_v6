// Implementação da API de credenciais para plataformas de anúncios

import { getRequestContext } from '@cloudflare/next-on-pages';
import { DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { encrypt, decrypt } from '@/lib/encryption';

// Definição do esquema de credenciais
const credentialsSchema = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  account_id: 'INTEGER NOT NULL',
  platform: 'TEXT NOT NULL', // 'meta' ou 'google'
  token_type: 'TEXT NOT NULL', // 'access_token', 'refresh_token', 'api_key', etc.
  token_value: 'TEXT NOT NULL', // valor criptografado
  expires_at: 'TIMESTAMP',
  created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  foreignKey: '(account_id) REFERENCES ad_accounts(id) ON DELETE CASCADE'
};

// Handler para GET /api/credentials
export async function GET(request: NextRequest) {
  try {
    const { env } = getRequestContext();
    const db: DrizzleD1Database = drizzle(env.DB);
    
    // Verificar autenticação e permissões (implementação completa em auth middleware)
    // Esta é uma verificação simplificada para demonstração
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Não autorizado' 
      }, { status: 401 });
    }
    
    // Obter parâmetros de consulta
    const url = new URL(request.url);
    const accountId = url.searchParams.get('accountId');
    
    if (!accountId) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID da conta é obrigatório' 
      }, { status: 400 });
    }
    
    // Buscar credenciais (sem expor os valores dos tokens)
    const credentials = await db.execute(
      sql`SELECT id, account_id, platform, token_type, expires_at, created_at, updated_at 
          FROM credentials 
          WHERE account_id = ${accountId}`
    );
    
    return NextResponse.json({ 
      success: true, 
      data: credentials.results 
    });
  } catch (error) {
    console.error('Erro ao buscar credenciais:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao buscar credenciais' 
    }, { status: 500 });
  }
}

// Handler para POST /api/credentials
export async function POST(request: NextRequest) {
  try {
    const { env } = getRequestContext();
    const db: DrizzleD1Database = drizzle(env.DB);
    
    // Verificar autenticação e permissões (implementação completa em auth middleware)
    // Esta é uma verificação simplificada para demonstração
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Não autorizado' 
      }, { status: 401 });
    }
    
    // Obter dados do corpo da requisição
    const body = await request.json();
    
    // Validar dados
    if (!body.account_id || !body.platform || !body.token_type || !body.token_value) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dados incompletos. account_id, platform, token_type e token_value são obrigatórios' 
      }, { status: 400 });
    }
    
    // Validar plataforma
    if (body.platform !== 'meta' && body.platform !== 'google') {
      return NextResponse.json({ 
        success: false, 
        error: 'Plataforma inválida. Deve ser "meta" ou "google"' 
      }, { status: 400 });
    }
    
    // Verificar se a conta existe
    const accountCheck = await db.execute(
      sql`SELECT id FROM ad_accounts WHERE id = ${body.account_id}`
    );
    
    if (!accountCheck.results || accountCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Conta de anúncios não encontrada' 
      }, { status: 404 });
    }
    
    // Criptografar o valor do token
    const encryptedToken = encrypt(body.token_value);
    
    // Calcular data de expiração (se fornecida)
    let expiresAt = null;
    if (body.expires_in) {
      expiresAt = new Date(Date.now() + body.expires_in * 1000).toISOString();
    }
    
    // Inserir nova credencial
    const result = await db.execute(
      sql`INSERT INTO credentials (account_id, platform, token_type, token_value, expires_at) 
          VALUES (${body.account_id}, ${body.platform}, ${body.token_type}, ${encryptedToken}, ${expiresAt}) 
          RETURNING id, account_id, platform, token_type, expires_at, created_at, updated_at`
    );
    
    return NextResponse.json({ 
      success: true, 
      data: result.results && result.results.length > 0 ? result.results[0] : null 
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar credencial:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao criar credencial' 
    }, { status: 500 });
  }
}

// Handler para PUT /api/credentials/:id
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { env } = getRequestContext();
    const db: DrizzleD1Database = drizzle(env.DB);
    
    // Verificar autenticação e permissões (implementação completa em auth middleware)
    // Esta é uma verificação simplificada para demonstração
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Não autorizado' 
      }, { status: 401 });
    }
    
    const id = params.id;
    
    // Verificar se a credencial existe
    const credentialCheck = await db.execute(
      sql`SELECT id FROM credentials WHERE id = ${id}`
    );
    
    if (!credentialCheck.results || credentialCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Credencial não encontrada' 
      }, { status: 404 });
    }
    
    // Obter dados do corpo da requisição
    const body = await request.json();
    
    // Validar dados
    if (!body.token_value) {
      return NextResponse.json({ 
        success: false, 
        error: 'Valor do token é obrigatório' 
      }, { status: 400 });
    }
    
    // Criptografar o novo valor do token
    const encryptedToken = encrypt(body.token_value);
    
    // Calcular nova data de expiração (se fornecida)
    let expiresAt = null;
    if (body.expires_in) {
      expiresAt = new Date(Date.now() + body.expires_in * 1000).toISOString();
    }
    
    // Atualizar credencial
    const result = await db.execute(
      sql`UPDATE credentials 
          SET token_value = ${encryptedToken}, 
              expires_at = COALESCE(${expiresAt}, expires_at),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING id, account_id, platform, token_type, expires_at, created_at, updated_at`
    );
    
    return NextResponse.json({ 
      success: true, 
      data: result.results && result.results.length > 0 ? result.results[0] : null 
    });
  } catch (error) {
    console.error('Erro ao atualizar credencial:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao atualizar credencial' 
    }, { status: 500 });
  }
}
