// Implementação da API para gerenciar clientes

import { getRequestContext } from '@cloudflare/next-on-pages';
import { DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '../auth/route';

// Handler para GET /api/clients
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
    const search = url.searchParams.get('search');
    const status = url.searchParams.get('status');
    
    // Construir consulta SQL com base nos parâmetros
    let query;
    
    // Se o usuário for admin, pode ver todos os clientes
    if (authResult.role === 'admin') {
      query = sql`
        SELECT c.id, c.name, c.logo_url, c.status, c.created_at, c.updated_at,
               COUNT(DISTINCT a.id) as account_count
        FROM clients c
        LEFT JOIN ad_accounts a ON c.id = a.client_id
      `;
      
      // Adicionar filtros se fornecidos
      if (search) {
        query = sql`${query} WHERE c.name LIKE ${'%' + search + '%'}`;
        
        if (status) {
          query = sql`${query} AND c.status = ${status}`;
        }
      } else if (status) {
        query = sql`${query} WHERE c.status = ${status}`;
      }
      
      // Agrupar e ordenar
      query = sql`${query} GROUP BY c.id ORDER BY c.name ASC`;
    } else {
      // Usuários não-admin só podem ver clientes aos quais têm permissão
      query = sql`
        SELECT c.id, c.name, c.logo_url, c.status, c.created_at, c.updated_at,
               COUNT(DISTINCT a.id) as account_count,
               up.permission_type
        FROM clients c
        JOIN user_permissions up ON c.id = up.client_id
        LEFT JOIN ad_accounts a ON c.id = a.client_id
        WHERE up.user_id = ${authResult.userId}
      `;
      
      // Adicionar filtros se fornecidos
      if (search) {
        query = sql`${query} AND c.name LIKE ${'%' + search + '%'}`;
        
        if (status) {
          query = sql`${query} AND c.status = ${status}`;
        }
      } else if (status) {
        query = sql`${query} AND c.status = ${status}`;
      }
      
      // Agrupar e ordenar
      query = sql`${query} GROUP BY c.id ORDER BY c.name ASC`;
    }
    
    // Executar consulta
    const clients = await db.execute(query);
    
    return NextResponse.json({ 
      success: true, 
      data: clients.results 
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao buscar clientes' 
    }, { status: 500 });
  }
}

// Handler para POST /api/clients
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
    if (!body.name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Nome do cliente é obrigatório' 
      }, { status: 400 });
    }
    
    // Verificar se já existe um cliente com o mesmo nome
    const clientCheck = await db.execute(
      sql`SELECT id FROM clients WHERE name = ${body.name}`
    );
    
    if (clientCheck.results.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Já existe um cliente com este nome' 
      }, { status: 409 });
    }
    
    // Valores padrão para campos opcionais
    const logoUrl = body.logo_url || null;
    const status = body.status || 'active';
    
    // Inserir novo cliente
    const result = await db.execute(
      sql`INSERT INTO clients (name, logo_url, status) 
          VALUES (${body.name}, ${logoUrl}, ${status}) 
          RETURNING *`
    );
    
    const clientId = result.results[0].id;
    
    // Adicionar permissão para o usuário que criou o cliente
    await db.execute(
      sql`INSERT INTO user_permissions (user_id, client_id, permission_type) 
          VALUES (${authResult.userId}, ${clientId}, 'admin')`
    );
    
    // Criar dashboard padrão para o cliente
    const dashboardResult = await db.execute(
      sql`INSERT INTO dashboards (user_id, client_id, name, description, layout, is_default) 
          VALUES (${authResult.userId}, ${clientId}, 'Dashboard Padrão', 'Dashboard padrão do cliente', 'grid', true) 
          RETURNING *`
    );
    
    const dashboardId = dashboardResult.results[0].id;
    
    // Criar indicadores padrão para o dashboard
    const defaultIndicators = [
      {
        title: 'Investido',
        metric_id: 'spend',
        position: 0,
        size: 'medium',
        chart_type: 'card',
        color_scheme: 'default',
        is_visible: true,
        config: '{}'
      },
      {
        title: 'Resultado',
        metric_id: 'conversions',
        position: 1,
        size: 'medium',
        chart_type: 'card',
        color_scheme: 'default',
        is_visible: true,
        config: '{}'
      },
      {
        title: 'Custo por Resultado',
        metric_id: 'cost_per_result',
        position: 2,
        size: 'medium',
        chart_type: 'card',
        color_scheme: 'default',
        is_visible: true,
        config: '{}'
      },
      {
        title: 'Retorno',
        metric_id: 'return_percentage',
        position: 3,
        size: 'medium',
        chart_type: 'card',
        color_scheme: 'default',
        is_visible: true,
        config: '{}'
      },
      {
        title: 'Visão Temporal',
        metric_id: 'spend',
        position: 4,
        size: 'large',
        chart_type: 'line',
        color_scheme: 'default',
        is_visible: true,
        config: '{"compare_metric": "conversions", "breakdown": "day"}'
      },
      {
        title: 'Dispositivos',
        metric_id: 'impressions',
        position: 5,
        size: 'medium',
        chart_type: 'donut',
        color_scheme: 'default',
        is_visible: true,
        config: '{"breakdown": "device"}'
      }
    ];
    
    // Inserir indicadores padrão
    for (const indicator of defaultIndicators) {
      await db.execute(
        sql`INSERT INTO indicators (
              dashboard_id, user_id, title, metric_id, position, size, 
              chart_type, color_scheme, is_visible, config
            ) 
            VALUES (
              ${dashboardId}, 
              ${authResult.userId}, 
              ${indicator.title}, 
              ${indicator.metric_id}, 
              ${indicator.position}, 
              ${indicator.size}, 
              ${indicator.chart_type}, 
              ${indicator.color_scheme}, 
              ${indicator.is_visible}, 
              ${indicator.config}
            )`
      );
    }
    
    // Retornar cliente criado com contagem de contas
    const clientWithAccountCount = {
      ...result.results[0],
      account_count: 0
    };
    
    return NextResponse.json({ 
      success: true, 
      data: clientWithAccountCount 
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao criar cliente' 
    }, { status: 500 });
  }
}

// Handler para PUT /api/clients/:id
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
    
    // Verificar se o cliente existe
    const clientCheck = await db.execute(
      sql`SELECT id FROM clients WHERE id = ${id}`
    );
    
    if (clientCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cliente não encontrado' 
      }, { status: 404 });
    }
    
    // Obter dados do corpo da requisição
    const body = await request.json();
    
    // Validar dados
    if (Object.keys(body).length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Nenhum dado para atualizar' 
      }, { status: 400 });
    }
    
    // Se estiver atualizando o nome, verificar se já existe outro cliente com o mesmo nome
    if (body.name) {
      const nameCheck = await db.execute(
        sql`SELECT id FROM clients WHERE name = ${body.name} AND id != ${id}`
      );
      
      if (nameCheck.results.length > 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Já existe outro cliente com este nome' 
        }, { status: 409 });
      }
    }
    
    // Construir consulta de atualização
    let updateQuery = 'UPDATE clients SET ';
    const updateValues = [];
    const params = [];
    
    if (body.name) {
      updateValues.push('name = ?');
      params.push(body.name);
    }
    
    if (body.logo_url !== undefined) {
      updateValues.push('logo_url = ?');
      params.push(body.logo_url);
    }
    
    if (body.status) {
      updateValues.push('status = ?');
      params.push(body.status);
    }
    
    updateValues.push('updated_at = CURRENT_TIMESTAMP');
    
    updateQuery += updateValues.join(', ');
    updateQuery += ' WHERE id = ?';
    params.push(id);
    
    // Executar atualização
    await db.execute(updateQuery, params);
    
    // Buscar cliente atualizado com contagem de contas
    const clientQuery = sql`
      SELECT c.id, c.name, c.logo_url, c.status, c.created_at, c.updated_at,
             COUNT(DISTINCT a.id) as account_count
      FROM clients c
      LEFT JOIN ad_accounts a ON c.id = a.client_id
      WHERE c.id = ${id}
      GROUP BY c.id
    `;
    
    const client = await db.execute(clientQuery);
    
    return NextResponse.json({ 
      success: true, 
      data: client.results[0] 
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao atualizar cliente' 
    }, { status: 500 });
  }
}

// Handler para DELETE /api/clients/:id
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
    
    // Verificar se o cliente existe
    const clientCheck = await db.execute(
      sql`SELECT id FROM clients WHERE id = ${id}`
    );
    
    if (clientCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cliente não encontrado' 
      }, { status: 404 });
    }
    
    // Verificar se há contas de anúncios associadas
    const accountsCheck = await db.execute(
      sql`SELECT id FROM ad_accounts WHERE client_id = ${id}`
    );
    
    if (accountsCheck.results.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Não é possível excluir cliente com contas de anúncios associadas' 
      }, { status: 400 });
    }
    
    // Excluir dashboards e indicadores do cliente
    const dashboardsCheck = await db.execute(
      sql`SELECT id FROM dashboards WHERE client_id = ${id}`
    );
    
    for (const dashboard of dashboardsCheck.results) {
      // Excluir indicadores do dashboard
      await db.execute(sql`DELETE FROM indicators WHERE dashboard_id = ${dashboard.id}`);
    }
    
    // Excluir dashboards
    await db.execute(sql`DELETE FROM dashboards WHERE client_id = ${id}`);
    
    // Excluir permissões de usuários
    await db.execute(sql`DELETE FROM user_permissions WHERE client_id = ${id}`);
    
    // Excluir cliente
    await db.execute(sql`DELETE FROM clients WHERE id = ${id}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cliente excluído com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao excluir cliente' 
    }, { status: 500 });
  }
}

// Handler para GET /api/clients/:id
export async function getClient(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    const id = params.id;
    
    // Verificar se o cliente existe
    const clientQuery = sql`
      SELECT c.id, c.name, c.logo_url, c.status, c.created_at, c.updated_at
      FROM clients c
      WHERE c.id = ${id}
    `;
    
    const clientResult = await db.execute(clientQuery);
    
    if (clientResult.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cliente não encontrado' 
      }, { status: 404 });
    }
    
    // Verificar se o usuário tem permissão para o cliente
    if (authResult.role !== 'admin') {
      const permissionCheck = await db.execute(
        sql`SELECT permission_type FROM user_permissions 
            WHERE user_id = ${authResult.userId} AND client_id = ${id}`
      );
      
      if (permissionCheck.results.length === 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Sem permissão para acessar este cliente' 
        }, { status: 403 });
      }
    }
    
    const client = clientResult.results[0];
    
    // Buscar contas de anúncios do cliente
    const accountsQuery = sql`
      SELECT id, platform, account_id, account_name, status, created_at, updated_at
      FROM ad_accounts
      WHERE client_id = ${id}
      ORDER BY platform, account_name
    `;
    
    const accounts = await db.execute(accountsQuery);
    
    // Buscar dashboards do cliente para o usuário atual
    const dashboardsQuery = sql`
      SELECT id, name, description, layout, is_default, created_at, updated_at
      FROM dashboards
      WHERE client_id = ${id} AND user_id = ${authResult.userId}
      ORDER BY is_default DESC, name ASC
    `;
    
    const dashboards = await db.execute(dashboardsQuery);
    
    // Buscar usuários com permissão para o cliente
    const usersQuery = sql`
      SELECT u.id, u.name, u.email, u.role, up.permission_type, up.created_at
      FROM users u
      JOIN user_permissions up ON u.id = up.user_id
      WHERE up.client_id = ${id}
      ORDER BY u.name ASC
    `;
    
    const users = await db.execute(usersQuery);
    
    return NextResponse.json({ 
      success: true, 
      data: {
        ...client,
        accounts: accounts.results,
        dashboards: dashboards.results,
        users: users.results
      }
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes do cliente:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao buscar detalhes do cliente' 
    }, { status: 500 });
  }
}

// Handler para POST /api/clients/:id/users
export async function addUser(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    // Verificar se o cliente existe
    const clientCheck = await db.execute(
      sql`SELECT id FROM clients WHERE id = ${id}`
    );
    
    if (clientCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cliente não encontrado' 
      }, { status: 404 });
    }
    
    // Obter dados do corpo da requisição
    const body = await request.json();
    
    // Validar dados
    if (!body.user_id || !body.permission_type) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID do usuário e tipo de permissão são obrigatórios' 
      }, { status: 400 });
    }
    
    // Verificar se o usuário existe
    const userCheck = await db.execute(
      sql`SELECT id FROM users WHERE id = ${body.user_id}`
    );
    
    if (userCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuário não encontrado' 
      }, { status: 404 });
    }
    
    // Verificar se o usuário já tem permissão para o cliente
    const permissionCheck = await db.execute(
      sql`SELECT id FROM user_permissions 
          WHERE user_id = ${body.user_id} AND client_id = ${id}`
    );
    
    if (permissionCheck.results.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuário já tem permissão para este cliente' 
      }, { status: 409 });
    }
    
    // Adicionar permissão
    await db.execute(
      sql`INSERT INTO user_permissions (user_id, client_id, permission_type) 
          VALUES (${body.user_id}, ${id}, ${body.permission_type})`
    );
    
    // Criar dashboard padrão para o usuário
    await db.execute(
      sql`INSERT INTO dashboards (user_id, client_id, name, description, layout, is_default) 
          VALUES (${body.user_id}, ${id}, 'Dashboard Padrão', 'Dashboard padrão do cliente', 'grid', true)`
    );
    
    // Buscar usuário com permissão
    const userQuery = sql`
      SELECT u.id, u.name, u.email, u.role, up.permission_type, up.created_at
      FROM users u
      JOIN user_permissions up ON u.id = up.user_id
      WHERE up.client_id = ${id} AND u.id = ${body.user_id}
    `;
    
    const user = await db.execute(userQuery);
    
    return NextResponse.json({ 
      success: true, 
      data: user.results[0] 
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar usuário ao cliente:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao adicionar usuário ao cliente' 
    }, { status: 500 });
  }
}

// Handler para DELETE /api/clients/:id/users/:userId
export async function removeUser(request: NextRequest, { params }: { params: { id: string, userId: string } }) {
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
    
    const { id, userId } = params;
    
    // Verificar se o cliente existe
    const clientCheck = await db.execute(
      sql`SELECT id FROM clients WHERE id = ${id}`
    );
    
    if (clientCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cliente não encontrado' 
      }, { status: 404 });
    }
    
    // Verificar se o usuário tem permissão para o cliente
    const permissionCheck = await db.execute(
      sql`SELECT id FROM user_permissions 
          WHERE user_id = ${userId} AND client_id = ${id}`
    );
    
    if (permissionCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuário não tem permissão para este cliente' 
      }, { status: 404 });
    }
    
    // Excluir dashboards e indicadores do usuário para este cliente
    const dashboardsCheck = await db.execute(
      sql`SELECT id FROM dashboards 
          WHERE user_id = ${userId} AND client_id = ${id}`
    );
    
    for (const dashboard of dashboardsCheck.results) {
      // Excluir indicadores do dashboard
      await db.execute(sql`DELETE FROM indicators WHERE dashboard_id = ${dashboard.id}`);
    }
    
    // Excluir dashboards
    await db.execute(
      sql`DELETE FROM dashboards 
          WHERE user_id = ${userId} AND client_id = ${id}`
    );
    
    // Remover permissão
    await db.execute(
      sql`DELETE FROM user_permissions 
          WHERE user_id = ${userId} AND client_id = ${id}`
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Usuário removido do cliente com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao remover usuário do cliente:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao remover usuário do cliente' 
    }, { status: 500 });
  }
}

// Handler para PUT /api/clients/:id/users/:userId
export async function updateUserPermission(request: NextRequest, { params }: { params: { id: string, userId: string } }) {
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
    
    const { id, userId } = params;
    
    // Verificar se o cliente existe
    const clientCheck = await db.execute(
      sql`SELECT id FROM clients WHERE id = ${id}`
    );
    
    if (clientCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cliente não encontrado' 
      }, { status: 404 });
    }
    
    // Verificar se o usuário tem permissão para o cliente
    const permissionCheck = await db.execute(
      sql`SELECT id FROM user_permissions 
          WHERE user_id = ${userId} AND client_id = ${id}`
    );
    
    if (permissionCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuário não tem permissão para este cliente' 
      }, { status: 404 });
    }
    
    // Obter dados do corpo da requisição
    const body = await request.json();
    
    // Validar dados
    if (!body.permission_type) {
      return NextResponse.json({ 
        success: false, 
        error: 'Tipo de permissão é obrigatório' 
      }, { status: 400 });
    }
    
    // Atualizar permissão
    await db.execute(
      sql`UPDATE user_permissions 
          SET permission_type = ${body.permission_type}, 
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ${userId} AND client_id = ${id}`
    );
    
    // Buscar usuário com permissão atualizada
    const userQuery = sql`
      SELECT u.id, u.name, u.email, u.role, up.permission_type, up.created_at, up.updated_at
      FROM users u
      JOIN user_permissions up ON u.id = up.user_id
      WHERE up.client_id = ${id} AND u.id = ${userId}
    `;
    
    const user = await db.execute(userQuery);
    
    return NextResponse.json({ 
      success: true, 
      data: user.results[0] 
    });
  } catch (error) {
    console.error('Erro ao atualizar permissão do usuário:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao atualizar permissão do usuário' 
    }, { status: 500 });
  }
}
