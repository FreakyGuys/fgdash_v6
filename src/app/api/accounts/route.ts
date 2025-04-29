// Implementação da API de contas de anúncios

import { getRequestContext } from '@cloudflare/next-on-pages';
import { DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

// Definição do esquema de contas de anúncios
const adAccountsSchema = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  client_id: 'INTEGER NOT NULL',
  platform: 'TEXT NOT NULL', // 'meta' ou 'google'
  account_id: 'TEXT NOT NULL', // ID da conta na plataforma
  account_name: 'TEXT NOT NULL',
  status: 'TEXT DEFAULT "active"',
  created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  foreignKey: '(client_id) REFERENCES clients(id) ON DELETE CASCADE'
};

// Handler para GET /api/accounts
export async function GET(request: NextRequest) {
  try {
    const { env } = getRequestContext();
    const db: DrizzleD1Database = drizzle(env.DB);
    
    // Obter parâmetros de consulta
    const url = new URL(request.url);
    const clientId = url.searchParams.get('clientId');
    const platform = url.searchParams.get('platform');
    
    // Construir consulta SQL com base nos parâmetros
    let query = sql`SELECT * FROM ad_accounts`;
    const params = [];
    
    if (clientId) {
      query = sql`SELECT * FROM ad_accounts WHERE client_id = ${clientId}`;
    }
    
    if (platform) {
      if (clientId) {
        query = sql`SELECT * FROM ad_accounts WHERE client_id = ${clientId} AND platform = ${platform}`;
      } else {
        query = sql`SELECT * FROM ad_accounts WHERE platform = ${platform}`;
      }
    }
    
    // Executar consulta
    const accounts = await db.execute(query);
    
    return NextResponse.json({ 
      success: true, 
      data: accounts.results 
    });
  } catch (error) {
    console.error('Erro ao buscar contas de anúncios:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao buscar contas de anúncios' 
    }, { status: 500 });
  }
}

// Handler para POST /api/accounts
export async function POST(request: NextRequest) {
  try {
    const { env } = getRequestContext();
    const db: DrizzleD1Database = drizzle(env.DB);
    
    // Obter dados do corpo da requisição
    const body = await request.json();
    
    // Validar dados
    if (!body.client_id || !body.platform || !body.account_id || !body.account_name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dados incompletos. client_id, platform, account_id e account_name são obrigatórios' 
      }, { status: 400 });
    }
    
    // Validar plataforma
    if (body.platform !== 'meta' && body.platform !== 'google') {
      return NextResponse.json({ 
        success: false, 
        error: 'Plataforma inválida. Deve ser "meta" ou "google"' 
      }, { status: 400 });
    }
    
    // Verificar se o cliente existe
    const clientCheck = await db.execute(
      sql`SELECT id FROM clients WHERE id = ${body.client_id}`
    );
    
    if (clientCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cliente não encontrado' 
      }, { status: 404 });
    }
    
    // Inserir nova conta de anúncios
    const result = await db.execute(
      sql`INSERT INTO ad_accounts (client_id, platform, account_id, account_name) 
          VALUES (${body.client_id}, ${body.platform}, ${body.account_id}, ${body.account_name}) 
          RETURNING *`
    );
    
    return NextResponse.json({ 
      success: true, 
      data: result.results[0] 
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar conta de anúncios:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao criar conta de anúncios' 
    }, { status: 500 });
  }
}
