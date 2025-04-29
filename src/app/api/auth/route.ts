// Implementação da API de autenticação e usuários

import { getRequestContext } from '@cloudflare/next-on-pages';
import { DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { hash, compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';

// Definição do esquema de usuários
const usersSchema = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  name: 'TEXT NOT NULL',
  email: 'TEXT NOT NULL UNIQUE',
  password: 'TEXT NOT NULL', // hash da senha
  role: 'TEXT NOT NULL', // 'admin', 'manager', 'user'
  created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
};

// Definição do esquema de permissões de usuários
const userPermissionsSchema = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  user_id: 'INTEGER NOT NULL',
  client_id: 'INTEGER NOT NULL',
  permission_type: 'TEXT NOT NULL', // 'view', 'edit', 'admin'
  created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
  // Corrigido: Usar uma chave única para múltiplas chaves estrangeiras ou definir separadamente
  // A forma como estava antes (duas chaves 'FOREIGN KEY') não é válida em um objeto JS
  // Vamos assumir que a intenção era definir as constraints SQL, o que não se faz aqui.
  // A definição de schema aqui é mais para referência do código.
  // As constraints reais são definidas na migração SQL.
  // foreignKeyUser: '(user_id) REFERENCES users(id) ON DELETE CASCADE',
  // foreignKeyClient: '(client_id) REFERENCES clients(id) ON DELETE CASCADE'
};

// Chave secreta para JWT (em produção, deve ser uma variável de ambiente)
const JWT_SECRET = process.env.JWT_SECRET || 'freaky-guys-dashboard-secret-key';

// Tempo de expiração do token (24 horas por padrão)
const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || '24h';

// Handler para POST /api/auth/register (apenas para administradores)
export async function POST(request: NextRequest) {
  try {
    const { env } = getRequestContext();
    const db: DrizzleD1Database = drizzle(env.DB);

    // Verificar se é um administrador (exceto para o primeiro usuário)
    const authHeader = request.headers.get('Authorization');
    const userCountResult = await db.execute(sql`SELECT COUNT(*) as count FROM users`);
    // Acesso correto ao resultado da contagem
    const isFirstUser = userCountResult.results && userCountResult.results.length > 0 && (userCountResult.results[0] as { count: number }).count === 0;

    if (!isFirstUser) {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Não autorizado' 
        }, { status: 401 });
      }

      // Verificar token JWT
      const token = authHeader.split(' ')[1];
      let decoded: any;
      try {
        decoded = verify(token, JWT_SECRET);
      } catch (error) {
        return NextResponse.json({ 
          success: false, 
          error: 'Token inválido' 
        }, { status: 401 });
      }

      // Verificar se o usuário é administrador
      const adminCheck = await db.execute(
        sql`SELECT role FROM users WHERE id = ${decoded.userId}`
      );

      if (!adminCheck.results || adminCheck.results.length === 0 || (adminCheck.results[0] as { role: string }).role !== 'admin') {
        return NextResponse.json({ 
          success: false, 
          error: 'Apenas administradores podem registrar novos usuários' 
        }, { status: 403 });
      }
    }

    // Obter dados do corpo da requisição
    const body = await request.json();

    // Validar dados
    if (!body.name || !body.email || !body.password || !body.role) {
      return NextResponse.json({ 
        success: false, 
        error: 'Dados incompletos. name, email, password e role são obrigatórios' 
      }, { status: 400 });
    }

    // Validar role
    if (!['admin', 'manager', 'user'].includes(body.role)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Role inválida. Deve ser "admin", "manager" ou "user"'
      }, { status: 400 });
    }

    // Verificar se o email já está em uso
    const emailCheck = await db.execute(
      sql`SELECT id FROM users WHERE email = ${body.email}`
    );

    if (emailCheck.results && emailCheck.results.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email já está em uso' 
      }, { status: 409 });
    }

    // Hash da senha
    const hashedPassword = await hash(body.password, 10);

    // Inserir novo usuário
    const result = await db.execute(
      sql`INSERT INTO users (name, email, password, role) 
          VALUES (${body.name}, ${body.email}, ${hashedPassword}, ${body.role}) 
          RETURNING id, name, email, role, created_at, updated_at`
    );

    const newUser = result.results && result.results.length > 0 ? result.results[0] : null;

    if (!newUser) {
        throw new Error('Falha ao criar usuário');
    }

    // Se houver permissões específicas para clientes
    if (body.permissions && Array.isArray(body.permissions)) {
      for (const perm of body.permissions) {
        if (perm.client_id && perm.permission_type) {
          await db.execute(
            sql`INSERT INTO user_permissions (user_id, client_id, permission_type) 
                VALUES (${(newUser as any).id}, ${perm.client_id}, ${perm.permission_type})`
          );
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: newUser 
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao registrar usuário' 
    }, { status: 500 });
  }
}

// Handler para POST /api/auth/login
export async function login(request: NextRequest) {
  try {
    const { env } = getRequestContext();
    const db: DrizzleD1Database = drizzle(env.DB);

    // Obter dados do corpo da requisição
    const body = await request.json();

    // Validar dados
    if (!body.email || !body.password) {
      return NextResponse.json({ 
        success: false, 
        error: 'Email e senha são obrigatórios' 
      }, { status: 400 });
    }

    // Buscar usuário pelo email
    const userResult = await db.execute(
      sql`SELECT id, name, email, password, role FROM users WHERE email = ${body.email}`
    );

    if (!userResult.results || userResult.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Credenciais inválidas' 
      }, { status: 401 });
    }

    const user = userResult.results[0] as any;

    // Verificar senha
    const passwordMatch = await compare(body.password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({ 
        success: false, 
        error: 'Credenciais inválidas' 
      }, { status: 401 });
    }

    // Buscar permissões do usuário
    const permissionsResult = await db.execute(
      sql`SELECT client_id, permission_type FROM user_permissions WHERE user_id = ${user.id}`
    );

    // Gerar token JWT
    const token = sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRATION }
    );

    return NextResponse.json({ 
      success: true, 
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        permissions: permissionsResult.results || [],
        token
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao fazer login' 
    }, { status: 500 });
  }
}

// Handler para GET /api/auth/me (verificar usuário atual)
export async function me(request: NextRequest) {
  try {
    const { env } = getRequestContext();
    const db: DrizzleD1Database = drizzle(env.DB);

    // Verificar autenticação
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Não autorizado' 
      }, { status: 401 });
    }

    // Verificar token JWT
    const token = authHeader.split(' ')[1];
    let decoded: any;
    try {
      decoded = verify(token, JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ 
        success: false, 
        error: 'Token inválido' 
      }, { status: 401 });
    }

    // Buscar usuário pelo ID
    const userResult = await db.execute(
      sql`SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ${decoded.userId}`
    );

    if (!userResult.results || userResult.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Usuário não encontrado' 
      }, { status: 404 });
    }

    // Buscar permissões do usuário
    const permissionsResult = await db.execute(
      sql`SELECT client_id, permission_type FROM user_permissions WHERE user_id = ${decoded.userId}`
    );

    return NextResponse.json({ 
      success: true, 
      data: {
        user: userResult.results[0],
        permissions: permissionsResult.results || []
      }
    });
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao verificar usuário' 
    }, { status: 500 });
  }
}

// Middleware para verificar autenticação e permissões
export async function verifyAuth(request: NextRequest, requiredRole?: string, clientId?: number) {
  const { env } = getRequestContext();
  const db: DrizzleD1Database = drizzle(env.DB);

  // Verificar autenticação
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { 
      authenticated: false, 
      error: 'Não autorizado',
      status: 401
    };
  }

  // Verificar token JWT
  const token = authHeader.split(' ')[1];
  let decoded: any;
  try {
    decoded = verify(token, JWT_SECRET);
  } catch (error) {
    return { 
      authenticated: false, 
      error: 'Token inválido',
      status: 401
    };
  }

  // Buscar usuário pelo ID
  const userResult = await db.execute(
    sql`SELECT id, role FROM users WHERE id = ${decoded.userId}`
  );

  if (!userResult.results || userResult.results.length === 0) {
    return { 
      authenticated: false, 
      error: 'Usuário não encontrado',
      status: 404
    };
  }

  const user = userResult.results[0] as any;

  // Verificar role se necessário
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return { 
      authenticated: true, 
      authorized: false,
      error: 'Permissão insuficiente',
      status: 403
    };
  }

  // Verificar permissão para cliente específico se necessário
  if (clientId && user.role !== 'admin') {
    const permissionResult = await db.execute(
      sql`SELECT permission_type FROM user_permissions 
          WHERE user_id = ${user.id} AND client_id = ${clientId}`
    );

    if (!permissionResult.results || permissionResult.results.length === 0) {
      return { 
        authenticated: true, 
        authorized: false,
        error: 'Sem permissão para este cliente',
        status: 403
      };
    }
  }

  return { 
    authenticated: true, 
    authorized: true,
    userId: user.id,
    role: user.role
  };
}

