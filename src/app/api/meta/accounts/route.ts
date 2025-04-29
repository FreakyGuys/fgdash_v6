// Implementação da API para gerenciar contas do Meta Ads

import { getRequestContext } from '@cloudflare/next-on-pages';
import { DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '../../auth/route';
import { decrypt } from '@/lib/encryption';

// Handler para GET /api/meta/accounts
export async function GET(request: NextRequest) {
  try {
    const { env } = getRequestContext();
    const db: DrizzleD1Database = drizzle(env.DB);
    
    // Verificar autenticação
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ 
        success: false, 
        error: authResult.error 
      }, { status: authResult.status });
    }
    
    // Obter parâmetros de consulta
    const url = new URL(request.url);
    const clientId = url.searchParams.get('clientId');
    
    // Construir consulta SQL com base nos parâmetros
    let query = sql`
      SELECT a.id, a.client_id, c.name as client_name, a.account_id, a.account_name, a.status, a.created_at, a.updated_at
      FROM ad_accounts a
      LEFT JOIN clients c ON a.client_id = c.id
      WHERE a.platform = 'meta'
    `;
    
    // Se o usuário não for admin, filtrar por permissões
    if (authResult.role !== 'admin') {
      if (clientId) {
        // Verificar se o usuário tem permissão para o cliente específico
        const permissionCheck = await db.execute(
          sql`SELECT permission_type FROM user_permissions 
              WHERE user_id = ${authResult.userId} AND client_id = ${clientId}`
        );
        
        if (permissionCheck.results.length === 0) {
          return NextResponse.json({ 
            success: false, 
            error: 'Sem permissão para este cliente' 
          }, { status: 403 });
        }
        
        query = sql`${query} AND a.client_id = ${clientId}`;
      } else {
        // Filtrar por clientes aos quais o usuário tem acesso
        query = sql`${query} AND a.client_id IN (
          SELECT client_id FROM user_permissions WHERE user_id = ${authResult.userId}
        )`;
      }
    } else if (clientId) {
      // Admin com filtro de cliente
      query = sql`${query} AND a.client_id = ${clientId}`;
    }
    
    // Ordenar resultados
    query = sql`${query} ORDER BY a.account_name ASC`;
    
    // Executar consulta
    const accounts = await db.execute(query);
    
    return NextResponse.json({ 
      success: true, 
      data: accounts.results 
    });
  } catch (error) {
    console.error('Erro ao buscar contas do Meta Ads:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao buscar contas do Meta Ads' 
    }, { status: 500 });
  }
}

// Handler para POST /api/meta/accounts
export async function POST(request: NextRequest) {
  try {
    const { env } = getRequestContext();
    const db: DrizzleD1Database = drizzle(env.DB);
    
    // Verificar autenticação e permissões
    const authResult = await verifyAuth(request, 'admin');
    if (!authResult.authenticated || !authResult.authorized) {
      return NextResponse.json({ 
        success: false, 
        error: authResult.error 
      }, { status: authResult.status });
    }
    
    // Obter dados do corpo da requisição
    const body = await request.json();
    
    // Validar dados
    if (!body.client_id || !body.account_id || !body.account_name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dados incompletos. client_id, account_id e account_name são obrigatórios' 
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
    
    // Verificar se a conta já existe
    const accountCheck = await db.execute(
      sql`SELECT id FROM ad_accounts 
          WHERE platform = 'meta' AND account_id = ${body.account_id}`
    );
    
    if (accountCheck.results.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Conta do Meta Ads já cadastrada' 
      }, { status: 409 });
    }
    
    // Inserir nova conta
    const result = await db.execute(
      sql`INSERT INTO ad_accounts (client_id, platform, account_id, account_name, status) 
          VALUES (${body.client_id}, 'meta', ${body.account_id}, ${body.account_name}, ${body.status || 'active'}) 
          RETURNING *`
    );
    
    return NextResponse.json({ 
      success: true, 
      data: result.results[0] 
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar conta do Meta Ads:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao criar conta do Meta Ads' 
    }, { status: 500 });
  }
}

// Handler para PUT /api/meta/accounts/:id
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { env } = getRequestContext();
    const db: DrizzleD1Database = drizzle(env.DB);
    
    // Verificar autenticação e permissões
    const authResult = await verifyAuth(request, 'admin');
    if (!authResult.authenticated || !authResult.authorized) {
      return NextResponse.json({ 
        success: false, 
        error: authResult.error 
      }, { status: authResult.status });
    }
    
    const id = params.id;
    
    // Verificar se a conta existe
    const accountCheck = await db.execute(
      sql`SELECT id FROM ad_accounts WHERE id = ${id} AND platform = 'meta'`
    );
    
    if (accountCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Conta do Meta Ads não encontrada' 
      }, { status: 404 });
    }
    
    // Obter dados do corpo da requisição
    const body = await request.json();
    
    // Validar dados
    if (!body.client_id && !body.account_name && !body.status) {
      return NextResponse.json({ 
        success: false, 
        error: 'Nenhum dado para atualizar' 
      }, { status: 400 });
    }
    
    // Verificar se o cliente existe (se estiver sendo alterado)
    if (body.client_id) {
      const clientCheck = await db.execute(
        sql`SELECT id FROM clients WHERE id = ${body.client_id}`
      );
      
      if (clientCheck.results.length === 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Cliente não encontrado' 
        }, { status: 404 });
      }
    }
    
    // Construir consulta de atualização
    let updateQuery = 'UPDATE ad_accounts SET ';
    const updateValues = [];
    const params = [];
    
    if (body.client_id) {
      updateValues.push('client_id = ?');
      params.push(body.client_id);
    }
    
    if (body.account_name) {
      updateValues.push('account_name = ?');
      params.push(body.account_name);
    }
    
    if (body.status) {
      updateValues.push('status = ?');
      params.push(body.status);
    }
    
    updateValues.push('updated_at = CURRENT_TIMESTAMP');
    
    updateQuery += updateValues.join(', ');
    updateQuery += ' WHERE id = ? AND platform = \'meta\'';
    params.push(id);
    
    // Executar atualização
    await db.execute(updateQuery, params);
    
    // Buscar conta atualizada
    const updatedAccount = await db.execute(
      sql`SELECT * FROM ad_accounts WHERE id = ${id}`
    );
    
    return NextResponse.json({ 
      success: true, 
      data: updatedAccount.results[0] 
    });
  } catch (error) {
    console.error('Erro ao atualizar conta do Meta Ads:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao atualizar conta do Meta Ads' 
    }, { status: 500 });
  }
}

// Handler para DELETE /api/meta/accounts/:id
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { env } = getRequestContext();
    const db: DrizzleD1Database = drizzle(env.DB);
    
    // Verificar autenticação e permissões
    const authResult = await verifyAuth(request, 'admin');
    if (!authResult.authenticated || !authResult.authorized) {
      return NextResponse.json({ 
        success: false, 
        error: authResult.error 
      }, { status: authResult.status });
    }
    
    const id = params.id;
    
    // Verificar se a conta existe
    const accountCheck = await db.execute(
      sql`SELECT id FROM ad_accounts WHERE id = ${id} AND platform = 'meta'`
    );
    
    if (accountCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Conta do Meta Ads não encontrada' 
      }, { status: 404 });
    }
    
    // Excluir conta
    await db.execute(sql`DELETE FROM ad_accounts WHERE id = ${id}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Conta do Meta Ads excluída com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao excluir conta do Meta Ads:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao excluir conta do Meta Ads' 
    }, { status: 500 });
  }
}
