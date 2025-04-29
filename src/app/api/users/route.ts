// Implementação da API de gerenciamento de usuários

import { getRequestContext } from '@cloudflare/next-on-pages';
import { DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { verifyAuth } from '../auth/route';

// Handler para GET /api/users
export async function GET(request: NextRequest) {
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
    
    // Obter parâmetros de consulta
    const url = new URL(request.url);
    const role = url.searchParams.get('role');
    const search = url.searchParams.get('search');
    
    // Construir consulta SQL com base nos parâmetros
    let query = sql`SELECT id, name, email, role, created_at, updated_at FROM users`;
    const conditions = [];
    
    if (role) {
      conditions.push(sql`role = ${role}`);
    }
    
    if (search) {
      conditions.push(sql`(name LIKE ${`%${search}%`} OR email LIKE ${`%${search}%`})`);
    }
    
    if (conditions.length > 0) {
      query = sql`${query} WHERE ${sql.join(conditions, sql` AND `)}`;
    }
    
    query = sql`${query} ORDER BY name ASC`;
    
    // Executar consulta
    const users = await db.execute(query);
    
    return NextResponse.json({ 
      success: true, 
      data: users.results 
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao buscar usuários' 
    }, { status: 500 });
  }
}

// Handler para GET /api/users/:id
export async function GET_BY_ID(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { env } = getRequestContext();
    const db: DrizzleD1Database = drizzle(env.DB);
    
    // Verificar autenticação e permissões
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ 
        success: false, 
        error: authResult.error 
      }, { status: authResult.status });
    }
    
    const id = params.id;
    
    // Verificar se o usuário está tentando acessar seus próprios dados ou é um admin
    if (authResult.userId !== parseInt(id) && authResult.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Permissão insuficiente' 
      }, { status: 403 });
    }
    
    // Buscar usuário pelo ID
    const userResult = await db.execute(
      sql`SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ${id}`
    );
    
    if (userResult.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuário não encontrado' 
      }, { status: 404 });
    }
    
    // Buscar permissões do usuário
    const permissionsResult = await db.execute(
      sql`SELECT up.id, up.client_id, c.name as client_name, up.permission_type 
          FROM user_permissions up
          JOIN clients c ON up.client_id = c.id
          WHERE up.user_id = ${id}`
    );
    
    return NextResponse.json({ 
      success: true, 
      data: {
        user: userResult.results[0],
        permissions: permissionsResult.results
      }
    });
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao buscar usuário' 
    }, { status: 500 });
  }
}

// Handler para PUT /api/users/:id
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { env } = getRequestContext();
    const db: DrizzleD1Database = drizzle(env.DB);
    
    // Verificar autenticação e permissões
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ 
        success: false, 
        error: authResult.error 
      }, { status: authResult.status });
    }
    
    const id = params.id;
    
    // Verificar se o usuário está tentando atualizar seus próprios dados ou é um admin
    if (authResult.userId !== parseInt(id) && authResult.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Permissão insuficiente' 
      }, { status: 403 });
    }
    
    // Verificar se o usuário existe
    const userCheck = await db.execute(
      sql`SELECT id, role FROM users WHERE id = ${id}`
    );
    
    if (userCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuário não encontrado' 
      }, { status: 404 });
    }
    
    // Obter dados do corpo da requisição
    const body = await request.json();
    
    // Validar dados
    if (!body.name && !body.email && !body.password && !body.role) {
      return NextResponse.json({ 
        success: false, 
        error: 'Nenhum dado para atualizar' 
      }, { status: 400 });
    }
    
    // Verificar se o usuário está tentando alterar a role sem ser admin
    if (body.role && authResult.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        error: 'Apenas administradores podem alterar a função do usuário' 
      }, { status: 403 });
    }
    
    // Verificar se o email já está em uso (se estiver sendo alterado)
    if (body.email) {
      const emailCheck = await db.execute(
        sql`SELECT id FROM users WHERE email = ${body.email} AND id != ${id}`
      );
      
      if (emailCheck.results.length > 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Email já está em uso' 
        }, { status: 409 });
      }
    }
    
    // Construir consulta de atualização
    let updateQuery = 'UPDATE users SET ';
    const updateValues = [];
    const params = [];
    
    if (body.name) {
      updateValues.push('name = ?');
      params.push(body.name);
    }
    
    if (body.email) {
      updateValues.push('email = ?');
      params.push(body.email);
    }
    
    if (body.password) {
      const hashedPassword = await hash(body.password, 10);
      updateValues.push('password = ?');
      params.push(hashedPassword);
    }
    
    if (body.role) {
      updateValues.push('role = ?');
      params.push(body.role);
    }
    
    updateValues.push('updated_at = CURRENT_TIMESTAMP');
    
    updateQuery += updateValues.join(', ');
    updateQuery += ' WHERE id = ?';
    params.push(id);
    
    // Executar atualização
    await db.execute(updateQuery, params);
    
    // Buscar usuário atualizado
    const updatedUser = await db.execute(
      sql`SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ${id}`
    );
    
    return NextResponse.json({ 
      success: true, 
      data: updatedUser.results[0] 
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao atualizar usuário' 
    }, { status: 500 });
  }
}

// Handler para DELETE /api/users/:id
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
    
    // Verificar se o usuário existe
    const userCheck = await db.execute(
      sql`SELECT id FROM users WHERE id = ${id}`
    );
    
    if (userCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuário não encontrado' 
      }, { status: 404 });
    }
    
    // Impedir a exclusão do próprio usuário
    if (authResult.userId === parseInt(id)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Não é possível excluir o próprio usuário' 
      }, { status: 400 });
    }
    
    // Excluir usuário
    await db.execute(sql`DELETE FROM users WHERE id = ${id}`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Usuário excluído com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao excluir usuário' 
    }, { status: 500 });
  }
}

// Handler para POST /api/users/:id/permissions
export async function ADD_PERMISSION(request: NextRequest, { params }: { params: { id: string } }) {
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
    
    const userId = params.id;
    
    // Verificar se o usuário existe
    const userCheck = await db.execute(
      sql`SELECT id FROM users WHERE id = ${userId}`
    );
    
    if (userCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuário não encontrado' 
      }, { status: 404 });
    }
    
    // Obter dados do corpo da requisição
    const body = await request.json();
    
    // Validar dados
    if (!body.client_id || !body.permission_type) {
      return NextResponse.json({ 
        success: false, 
        error: 'client_id e permission_type são obrigatórios' 
      }, { status: 400 });
    }
    
    // Validar tipo de permissão
    if (!['view', 'edit', 'admin'].includes(body.permission_type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Tipo de permissão inválido. Deve ser "view", "edit" ou "admin"' 
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
    
    // Verificar se a permissão já existe
    const permissionCheck = await db.execute(
      sql`SELECT id FROM user_permissions 
          WHERE user_id = ${userId} AND client_id = ${body.client_id}`
    );
    
    if (permissionCheck.results.length > 0) {
      // Atualizar permissão existente
      await db.execute(
        sql`UPDATE user_permissions 
            SET permission_type = ${body.permission_type} 
            WHERE user_id = ${userId} AND client_id = ${body.client_id}`
      );
    } else {
      // Inserir nova permissão
      await db.execute(
        sql`INSERT INTO user_permissions (user_id, client_id, permission_type) 
            VALUES (${userId}, ${body.client_id}, ${body.permission_type})`
      );
    }
    
    // Buscar permissões atualizadas
    const permissionsResult = await db.execute(
      sql`SELECT up.id, up.client_id, c.name as client_name, up.permission_type 
          FROM user_permissions up
          JOIN clients c ON up.client_id = c.id
          WHERE up.user_id = ${userId}`
    );
    
    return NextResponse.json({ 
      success: true, 
      data: permissionsResult.results 
    });
  } catch (error) {
    console.error('Erro ao adicionar permissão:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao adicionar permissão' 
    }, { status: 500 });
  }
}

// Handler para DELETE /api/users/:userId/permissions/:permissionId
export async function DELETE_PERMISSION(
  request: NextRequest, 
  { params }: { params: { userId: string, permissionId: string } }
) {
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
    
    const { userId, permissionId } = params;
    
    // Verificar se o usuário existe
    const userCheck = await db.execute(
      sql`SELECT id FROM users WHERE id = ${userId}`
    );
    
    if (userCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuário não encontrado' 
      }, { status: 404 });
    }
    
    // Verificar se a permissão existe e pertence ao usuário
    const permissionCheck = await db.execute(
      sql`SELECT id FROM user_permissions 
          WHERE id = ${permissionId} AND user_id = ${userId}`
    );
    
    if (permissionCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Permissão não encontrada' 
      }, { status: 404 });
    }
    
    // Excluir permissão
    await db.execute(
      sql`DELETE FROM user_permissions WHERE id = ${permissionId}`
    );
    
    // Buscar permissões atualizadas
    const permissionsResult = await db.execute(
      sql`SELECT up.id, up.client_id, c.name as client_name, up.permission_type 
          FROM user_permissions up
          JOIN clients c ON up.client_id = c.id
          WHERE up.user_id = ${userId}`
    );
    
    return NextResponse.json({ 
      success: true, 
      data: permissionsResult.results 
    });
  } catch (error) {
    console.error('Erro ao excluir permissão:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao excluir permissão' 
    }, { status: 500 });
  }
}
