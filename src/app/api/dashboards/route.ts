// Implementação da API para gerenciar dashboards

import { getRequestContext } from '@cloudflare/next-on-pages';
import { DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '../auth/route';

// Handler para GET /api/dashboards
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
    const userId = url.searchParams.get('userId') || authResult.userId;
    
    // Se o usuário não for admin e tentar acessar dashboards de outro usuário
    if (authResult.role !== 'admin' && userId !== authResult.userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sem permissão para acessar dashboards de outro usuário' 
      }, { status: 403 });
    }
    
    // Construir consulta SQL com base nos parâmetros
    let query = sql`
      SELECT d.id, d.user_id, d.client_id, d.name, d.description, d.layout, 
             d.is_default, d.created_at, d.updated_at, c.name as client_name
      FROM dashboards d
      LEFT JOIN clients c ON d.client_id = c.id
      WHERE d.user_id = ${userId}
    `;
    
    if (clientId) {
      query = sql`${query} AND d.client_id = ${clientId}`;
    }
    
    // Ordenar resultados
    query = sql`${query} ORDER BY d.is_default DESC, d.name ASC`;
    
    // Executar consulta
    const dashboards = await db.execute(query);
    
    // Para cada dashboard, buscar seus indicadores
    const dashboardsWithIndicators = await Promise.all(
      dashboards.results.map(async (dashboard) => {
        const indicatorsQuery = sql`
          SELECT id, title, metric_id, position, size, chart_type, 
                 color_scheme, is_visible, config
          FROM indicators
          WHERE dashboard_id = ${dashboard.id}
          ORDER BY position ASC
        `;
        
        const indicators = await db.execute(indicatorsQuery);
        
        return {
          ...dashboard,
          indicators: indicators.results
        };
      })
    );
    
    return NextResponse.json({ 
      success: true, 
      data: dashboardsWithIndicators 
    });
  } catch (error) {
    console.error('Erro ao buscar dashboards:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao buscar dashboards' 
    }, { status: 500 });
  }
}

// Handler para POST /api/dashboards
export async function POST(request: NextRequest) {
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
    
    // Obter dados do corpo da requisição
    const body = await request.json();
    
    // Validar dados
    if (!body.client_id || !body.name) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dados incompletos. client_id e name são obrigatórios' 
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
    
    // Verificar se o usuário tem permissão para o cliente
    if (authResult.role !== 'admin') {
      const permissionCheck = await db.execute(
        sql`SELECT permission_type FROM user_permissions 
            WHERE user_id = ${authResult.userId} AND client_id = ${body.client_id}`
      );
      
      if (permissionCheck.results.length === 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Sem permissão para criar dashboard para este cliente' 
        }, { status: 403 });
      }
    }
    
    // Valores padrão para campos opcionais
    const description = body.description || '';
    const layout = body.layout || 'grid';
    const isDefault = body.is_default !== undefined ? body.is_default : false;
    
    // Se for definido como padrão, remover o padrão anterior
    if (isDefault) {
      await db.execute(
        sql`UPDATE dashboards 
            SET is_default = false, 
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ${authResult.userId} 
            AND client_id = ${body.client_id} 
            AND is_default = true`
      );
    }
    
    // Inserir novo dashboard
    const result = await db.execute(
      sql`INSERT INTO dashboards (
            user_id, client_id, name, description, layout, is_default
          ) 
          VALUES (
            ${authResult.userId}, 
            ${body.client_id}, 
            ${body.name}, 
            ${description}, 
            ${layout}, 
            ${isDefault}
          ) 
          RETURNING *`
    );
    
    // Criar indicadores padrão para o novo dashboard
    const dashboardId = result.results[0].id;
    
    // Indicadores padrão
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
    
    // Buscar dashboard com indicadores
    const dashboardQuery = sql`
      SELECT d.id, d.user_id, d.client_id, d.name, d.description, d.layout, 
             d.is_default, d.created_at, d.updated_at, c.name as client_name
      FROM dashboards d
      LEFT JOIN clients c ON d.client_id = c.id
      WHERE d.id = ${dashboardId}
    `;
    
    const dashboard = await db.execute(dashboardQuery);
    
    const indicatorsQuery = sql`
      SELECT id, title, metric_id, position, size, chart_type, 
             color_scheme, is_visible, config
      FROM indicators
      WHERE dashboard_id = ${dashboardId}
      ORDER BY position ASC
    `;
    
    const indicators = await db.execute(indicatorsQuery);
    
    return NextResponse.json({ 
      success: true, 
      data: {
        ...dashboard.results[0],
        indicators: indicators.results
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar dashboard:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao criar dashboard' 
    }, { status: 500 });
  }
}

// Handler para PUT /api/dashboards/:id
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    // Verificar se o dashboard existe
    const dashboardCheck = await db.execute(
      sql`SELECT id, user_id, client_id FROM dashboards WHERE id = ${id}`
    );
    
    if (dashboardCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dashboard não encontrado' 
      }, { status: 404 });
    }
    
    // Verificar se o usuário tem permissão para editar o dashboard
    if (dashboardCheck.results[0].user_id !== authResult.userId && authResult.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Sem permissão para editar este dashboard' 
      }, { status: 403 });
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
    
    // Construir consulta de atualização
    let updateQuery = 'UPDATE dashboards SET ';
    const updateValues = [];
    const params = [];
    
    if (body.name) {
      updateValues.push('name = ?');
      params.push(body.name);
    }
    
    if (body.description !== undefined) {
      updateValues.push('description = ?');
      params.push(body.description);
    }
    
    if (body.layout) {
      updateValues.push('layout = ?');
      params.push(body.layout);
    }
    
    if (body.is_default !== undefined) {
      updateValues.push('is_default = ?');
      params.push(body.is_default);
      
      // Se for definido como padrão, remover o padrão anterior
      if (body.is_default) {
        await db.execute(
          sql`UPDATE dashboards 
              SET is_default = false, 
                  updated_at = CURRENT_TIMESTAMP
              WHERE user_id = ${dashboardCheck.results[0].user_id} 
              AND client_id = ${dashboardCheck.results[0].client_id} 
              AND is_default = true
              AND id != ${id}`
        );
      }
    }
    
    updateValues.push('updated_at = CURRENT_TIMESTAMP');
    
    updateQuery += updateValues.join(', ');
    updateQuery += ' WHERE id = ?';
    params.push(id);
    
    // Executar atualização
    await db.execute(updateQuery, params);
    
    // Buscar dashboard atualizado com indicadores
    const dashboardQuery = sql`
      SELECT d.id, d.user_id, d.client_id, d.name, d.description, d.layout, 
             d.is_default, d.created_at, d.updated_at, c.name as client_name
      FROM dashboards d
      LEFT JOIN clients c ON d.client_id = c.id
      WHERE d.id = ${id}
    `;
    
    const dashboard = await db.execute(dashboardQuery);
    
    const indicatorsQuery = sql`
      SELECT id, title, metric_id, position, size, chart_type, 
             color_scheme, is_visible, config
      FROM indicators
      WHERE dashboard_id = ${id}
      ORDER BY position ASC
    `;
    
    const indicators = await db.execute(indicatorsQuery);
    
    return NextResponse.json({ 
      success: true, 
      data: {
        ...dashboard.results[0],
        indicators: indicators.results
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar dashboard:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao atualizar dashboard' 
    }, { status: 500 });
  }
}

// Handler para DELETE /api/dashboards/:id
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    // Verificar se o dashboard existe
    const dashboardCheck = await db.execute(
      sql`SELECT id, user_id, client_id, is_default FROM dashboards WHERE id = ${id}`
    );
    
    if (dashboardCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dashboard não encontrado' 
      }, { status: 404 });
    }
    
    // Verificar se o usuário tem permissão para excluir o dashboard
    if (dashboardCheck.results[0].user_id !== authResult.userId && authResult.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Sem permissão para excluir este dashboard' 
      }, { status: 403 });
    }
    
    // Verificar se é o dashboard padrão
    if (dashboardCheck.results[0].is_default) {
      // Verificar se há outros dashboards para o mesmo cliente
      const otherDashboardsCheck = await db.execute(
        sql`SELECT id FROM dashboards 
            WHERE user_id = ${dashboardCheck.results[0].user_id} 
            AND client_id = ${dashboardCheck.results[0].client_id} 
            AND id != ${id}`
      );
      
      if (otherDashboardsCheck.results.length === 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Não é possível excluir o único dashboard do cliente' 
        }, { status: 400 });
      }
      
      // Definir outro dashboard como padrão
      await db.execute(
        sql`UPDATE dashboards 
            SET is_default = true, 
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ${dashboardCheck.results[0].user_id} 
            AND client_id = ${dashboardCheck.results[0].client_id} 
            AND id != ${id}
            LIMIT 1`
      );
    }
    
    // Excluir indicadores do dashboard
    await db.execute(sql`DELETE FROM indicators WHERE dashboard_id = ${id}`);
    
    // Excluir dashboard
    await db.execute(sql`DELETE FROM dashboards WHERE id = ${id}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Dashboard excluído com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao excluir dashboard:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao excluir dashboard' 
    }, { status: 500 });
  }
}

// Handler para GET /api/dashboards/:id/clone
export async function clone(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    // Verificar se o dashboard existe
    const dashboardCheck = await db.execute(
      sql`SELECT id, user_id, client_id, name, description, layout FROM dashboards WHERE id = ${id}`
    );
    
    if (dashboardCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dashboard não encontrado' 
      }, { status: 404 });
    }
    
    // Verificar se o usuário tem permissão para clonar o dashboard
    if (dashboardCheck.results[0].user_id !== authResult.userId && authResult.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Sem permissão para clonar este dashboard' 
      }, { status: 403 });
    }
    
    const dashboard = dashboardCheck.results[0];
    
    // Criar novo dashboard como cópia
    const newDashboardResult = await db.execute(
      sql`INSERT INTO dashboards (
            user_id, client_id, name, description, layout, is_default
          ) 
          VALUES (
            ${authResult.userId}, 
            ${dashboard.client_id}, 
            ${dashboard.name + ' (Cópia)'}, 
            ${dashboard.description}, 
            ${dashboard.layout}, 
            false
          ) 
          RETURNING *`
    );
    
    const newDashboardId = newDashboardResult.results[0].id;
    
    // Buscar indicadores do dashboard original
    const indicatorsQuery = sql`
      SELECT title, metric_id, position, size, chart_type, 
             color_scheme, is_visible, config
      FROM indicators
      WHERE dashboard_id = ${id}
      ORDER BY position ASC
    `;
    
    const indicators = await db.execute(indicatorsQuery);
    
    // Copiar indicadores para o novo dashboard
    for (const indicator of indicators.results) {
      await db.execute(
        sql`INSERT INTO indicators (
              dashboard_id, user_id, title, metric_id, position, size, 
              chart_type, color_scheme, is_visible, config
            ) 
            VALUES (
              ${newDashboardId}, 
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
    
    // Buscar novo dashboard com indicadores
    const newDashboardQuery = sql`
      SELECT d.id, d.user_id, d.client_id, d.name, d.description, d.layout, 
             d.is_default, d.created_at, d.updated_at, c.name as client_name
      FROM dashboards d
      LEFT JOIN clients c ON d.client_id = c.id
      WHERE d.id = ${newDashboardId}
    `;
    
    const newDashboard = await db.execute(newDashboardQuery);
    
    const newIndicatorsQuery = sql`
      SELECT id, title, metric_id, position, size, chart_type, 
             color_scheme, is_visible, config
      FROM indicators
      WHERE dashboard_id = ${newDashboardId}
      ORDER BY position ASC
    `;
    
    const newIndicators = await db.execute(newIndicatorsQuery);
    
    return NextResponse.json({ 
      success: true, 
      data: {
        ...newDashboard.results[0],
        indicators: newIndicators.results
      }
    });
  } catch (error) {
    console.error('Erro ao clonar dashboard:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao clonar dashboard' 
    }, { status: 500 });
  }
}
