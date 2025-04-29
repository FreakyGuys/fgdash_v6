// Implementação da API para gerenciar indicadores dinâmicos

import { getRequestContext } from '@cloudflare/next-on-pages';
import { DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '../auth/route';

// Handler para GET /api/indicators
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
    const dashboardId = url.searchParams.get('dashboardId');
    const userId = url.searchParams.get('userId') || authResult.userId;
    
    // Se o usuário não for admin e tentar acessar indicadores de outro usuário
    if (authResult.role !== 'admin' && userId !== authResult.userId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sem permissão para acessar indicadores de outro usuário' 
      }, { status: 403 });
    }
    
    // Construir consulta SQL com base nos parâmetros
    let query = sql`
      SELECT i.id, i.dashboard_id, i.user_id, i.title, i.metric_id, i.position, i.size, i.chart_type, 
             i.color_scheme, i.is_visible, i.config, i.created_at, i.updated_at
      FROM indicators i
      WHERE i.user_id = ${userId}
    `;
    
    if (dashboardId) {
      query = sql`${query} AND i.dashboard_id = ${dashboardId}`;
    }
    
    // Ordenar resultados
    query = sql`${query} ORDER BY i.position ASC`;
    
    // Executar consulta
    const indicators = await db.execute(query);
    
    return NextResponse.json({ 
      success: true, 
      data: indicators.results 
    });
  } catch (error) {
    console.error('Erro ao buscar indicadores:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao buscar indicadores' 
    }, { status: 500 });
  }
}

// Handler para POST /api/indicators
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
    if (!body.dashboard_id || !body.title || !body.metric_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dados incompletos. dashboard_id, title e metric_id são obrigatórios' 
      }, { status: 400 });
    }
    
    // Verificar se o dashboard existe
    const dashboardCheck = await db.execute(
      sql`SELECT id FROM dashboards WHERE id = ${body.dashboard_id}`
    );
    
    if (dashboardCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dashboard não encontrado' 
      }, { status: 404 });
    }
    
    // Verificar se o usuário tem permissão para o dashboard
    const dashboardPermission = await db.execute(
      sql`SELECT user_id FROM dashboards WHERE id = ${body.dashboard_id}`
    );
    
    if (dashboardPermission.results[0].user_id !== authResult.userId && authResult.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Sem permissão para adicionar indicadores a este dashboard' 
      }, { status: 403 });
    }
    
    // Obter a próxima posição disponível
    const positionCheck = await db.execute(
      sql`SELECT MAX(position) as max_position FROM indicators WHERE dashboard_id = ${body.dashboard_id}`
    );
    
    const nextPosition = positionCheck.results[0].max_position ? positionCheck.results[0].max_position + 1 : 0;
    
    // Valores padrão para campos opcionais
    const size = body.size || 'medium';
    const chartType = body.chart_type || 'card';
    const colorScheme = body.color_scheme || 'default';
    const isVisible = body.is_visible !== undefined ? body.is_visible : true;
    const config = body.config || '{}';
    
    // Inserir novo indicador
    const result = await db.execute(
      sql`INSERT INTO indicators (
            dashboard_id, user_id, title, metric_id, position, size, chart_type, 
            color_scheme, is_visible, config
          ) 
          VALUES (
            ${body.dashboard_id}, 
            ${authResult.userId}, 
            ${body.title}, 
            ${body.metric_id}, 
            ${nextPosition}, 
            ${size}, 
            ${chartType}, 
            ${colorScheme}, 
            ${isVisible}, 
            ${config}
          ) 
          RETURNING *`
    );
    
    return NextResponse.json({ 
      success: true, 
      data: result.results[0] 
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar indicador:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao criar indicador' 
    }, { status: 500 });
  }
}

// Handler para PUT /api/indicators/:id
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
    
    // Verificar se o indicador existe
    const indicatorCheck = await db.execute(
      sql`SELECT id, user_id FROM indicators WHERE id = ${id}`
    );
    
    if (indicatorCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Indicador não encontrado' 
      }, { status: 404 });
    }
    
    // Verificar se o usuário tem permissão para editar o indicador
    if (indicatorCheck.results[0].user_id !== authResult.userId && authResult.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Sem permissão para editar este indicador' 
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
    let updateQuery = 'UPDATE indicators SET ';
    const updateValues = [];
    const params = [];
    
    if (body.title) {
      updateValues.push('title = ?');
      params.push(body.title);
    }
    
    if (body.metric_id) {
      updateValues.push('metric_id = ?');
      params.push(body.metric_id);
    }
    
    if (body.position !== undefined) {
      updateValues.push('position = ?');
      params.push(body.position);
    }
    
    if (body.size) {
      updateValues.push('size = ?');
      params.push(body.size);
    }
    
    if (body.chart_type) {
      updateValues.push('chart_type = ?');
      params.push(body.chart_type);
    }
    
    if (body.color_scheme) {
      updateValues.push('color_scheme = ?');
      params.push(body.color_scheme);
    }
    
    if (body.is_visible !== undefined) {
      updateValues.push('is_visible = ?');
      params.push(body.is_visible);
    }
    
    if (body.config) {
      updateValues.push('config = ?');
      params.push(body.config);
    }
    
    updateValues.push('updated_at = CURRENT_TIMESTAMP');
    
    updateQuery += updateValues.join(', ');
    updateQuery += ' WHERE id = ?';
    params.push(id);
    
    // Executar atualização
    await db.execute(updateQuery, params);
    
    // Buscar indicador atualizado
    const updatedIndicator = await db.execute(
      sql`SELECT * FROM indicators WHERE id = ${id}`
    );
    
    return NextResponse.json({ 
      success: true, 
      data: updatedIndicator.results[0] 
    });
  } catch (error) {
    console.error('Erro ao atualizar indicador:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao atualizar indicador' 
    }, { status: 500 });
  }
}

// Handler para DELETE /api/indicators/:id
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
    
    // Verificar se o indicador existe
    const indicatorCheck = await db.execute(
      sql`SELECT id, user_id, dashboard_id, position FROM indicators WHERE id = ${id}`
    );
    
    if (indicatorCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Indicador não encontrado' 
      }, { status: 404 });
    }
    
    // Verificar se o usuário tem permissão para excluir o indicador
    if (indicatorCheck.results[0].user_id !== authResult.userId && authResult.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Sem permissão para excluir este indicador' 
      }, { status: 403 });
    }
    
    // Obter informações para reordenação
    const dashboardId = indicatorCheck.results[0].dashboard_id;
    const position = indicatorCheck.results[0].position;
    
    // Excluir indicador
    await db.execute(sql`DELETE FROM indicators WHERE id = ${id}`);
    
    // Reordenar indicadores restantes
    await db.execute(
      sql`UPDATE indicators 
          SET position = position - 1, 
              updated_at = CURRENT_TIMESTAMP
          WHERE dashboard_id = ${dashboardId} 
          AND position > ${position}`
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Indicador excluído com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao excluir indicador:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao excluir indicador' 
    }, { status: 500 });
  }
}

// Handler para PUT /api/indicators/reorder
export async function reorder(request: NextRequest) {
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
    if (!body.dashboard_id || !body.indicators || !Array.isArray(body.indicators)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dados incompletos. dashboard_id e indicators (array) são obrigatórios' 
      }, { status: 400 });
    }
    
    // Verificar se o dashboard existe
    const dashboardCheck = await db.execute(
      sql`SELECT id, user_id FROM dashboards WHERE id = ${body.dashboard_id}`
    );
    
    if (dashboardCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dashboard não encontrado' 
      }, { status: 404 });
    }
    
    // Verificar se o usuário tem permissão para o dashboard
    if (dashboardCheck.results[0].user_id !== authResult.userId && authResult.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Sem permissão para reordenar indicadores deste dashboard' 
      }, { status: 403 });
    }
    
    // Verificar se todos os indicadores pertencem ao dashboard
    const indicatorIds = body.indicators.map(i => i.id);
    
    const indicatorsCheck = await db.execute(
      sql`SELECT id, dashboard_id FROM indicators WHERE id IN (${indicatorIds.join(',')})`
    );
    
    if (indicatorsCheck.results.length !== indicatorIds.length) {
      return NextResponse.json({ 
        success: false, 
        error: 'Um ou mais indicadores não foram encontrados' 
      }, { status: 404 });
    }
    
    const invalidIndicators = indicatorsCheck.results.filter(i => i.dashboard_id !== body.dashboard_id);
    if (invalidIndicators.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Um ou mais indicadores não pertencem ao dashboard especificado' 
      }, { status: 400 });
    }
    
    // Atualizar posições
    for (let i = 0; i < body.indicators.length; i++) {
      const indicator = body.indicators[i];
      await db.execute(
        sql`UPDATE indicators 
            SET position = ${i}, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${indicator.id}`
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Indicadores reordenados com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao reordenar indicadores:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao reordenar indicadores' 
    }, { status: 500 });
  }
}
