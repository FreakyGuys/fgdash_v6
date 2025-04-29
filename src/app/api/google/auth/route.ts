// Implementação da API de autenticação com Google Ads

import { getRequestContext } from '@cloudflare/next-on-pages';
import { DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '../../auth/route';
import { encrypt } from '@/lib/encryption';

// Configurações do Google OAuth
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://fgdash.com/api/google/auth/callback';

// Handler para GET /api/google/auth/connect
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação e permissões
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ 
        success: false, 
        error: authResult.error 
      }, { status: authResult.status });
    }
    
    // Gerar URL de autenticação do Google
    const state = Buffer.from(JSON.stringify({
      userId: authResult.userId,
      timestamp: Date.now()
    })).toString('base64');
    
    const scopes = [
      'https://www.googleapis.com/auth/adwords',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ].join(' ');
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(GOOGLE_REDIRECT_URI)}` +
      `&response_type=code` +
      `&state=${state}` +
      `&scope=${encodeURIComponent(scopes)}` +
      `&access_type=offline` +
      `&prompt=consent`;
    
    return NextResponse.json({ 
      success: true, 
      data: { authUrl } 
    });
  } catch (error) {
    console.error('Erro ao gerar URL de autenticação do Google:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao gerar URL de autenticação do Google' 
    }, { status: 500 });
  }
}

// Handler para GET /api/google/auth/callback
export async function callback(request: NextRequest) {
  try {
    const { env } = getRequestContext();
    const db: DrizzleD1Database = drizzle(env.DB);
    
    // Obter parâmetros da URL
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    
    // Verificar se houve erro na autenticação
    if (error) {
      console.error('Erro na autenticação do Google:', error);
      return NextResponse.redirect(new URL('/settings?error=google_auth_failed', request.url));
    }
    
    // Verificar se o código e o state estão presentes
    if (!code || !state) {
      return NextResponse.redirect(new URL('/settings?error=invalid_response', request.url));
    }
    
    // Decodificar state
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch (error) {
      console.error('Erro ao decodificar state:', error);
      return NextResponse.redirect(new URL('/settings?error=invalid_state', request.url));
    }
    
    // Verificar se o state contém userId
    if (!stateData.userId) {
      return NextResponse.redirect(new URL('/settings?error=invalid_state', request.url));
    }
    
    // Trocar o código por um token de acesso
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code'
      })
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Erro ao obter token do Google:', errorData);
      return NextResponse.redirect(new URL('/settings?error=token_exchange_failed', request.url));
    }
    
    const tokenData = await tokenResponse.json();
    
    // Obter informações do usuário do Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });
    
    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      console.error('Erro ao obter informações do usuário do Google:', errorData);
      return NextResponse.redirect(new URL('/settings?error=user_info_failed', request.url));
    }
    
    const userData = await userResponse.json();
    
    // Salvar tokens no banco de dados
    const encryptedAccessToken = encrypt(tokenData.access_token);
    const encryptedRefreshToken = encrypt(tokenData.refresh_token);
    
    // Calcular data de expiração
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
    
    // Inserir ou atualizar credencial do Google
    await db.execute(
      sql`INSERT INTO google_credentials (
            user_id, 
            google_user_id, 
            google_user_name, 
            google_user_email, 
            access_token, 
            refresh_token, 
            expires_at
          )
          VALUES (
            ${stateData.userId}, 
            ${userData.id}, 
            ${userData.name}, 
            ${userData.email}, 
            ${encryptedAccessToken}, 
            ${encryptedRefreshToken}, 
            ${expiresAt}
          )
          ON CONFLICT (user_id) DO UPDATE SET
            google_user_id = ${userData.id},
            google_user_name = ${userData.name},
            google_user_email = ${userData.email},
            access_token = ${encryptedAccessToken},
            refresh_token = COALESCE(${encryptedRefreshToken}, google_credentials.refresh_token),
            expires_at = ${expiresAt},
            updated_at = CURRENT_TIMESTAMP`
    );
    
    // Redirecionar para a página de configurações com sucesso
    return NextResponse.redirect(new URL('/settings?success=google_connected', request.url));
  } catch (error) {
    console.error('Erro no callback do Google:', error);
    return NextResponse.redirect(new URL('/settings?error=callback_failed', request.url));
  }
}

// Handler para POST /api/google/auth/refresh
export async function refresh(request: NextRequest) {
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
    
    // Obter refresh token do banco de dados
    const credentialsCheck = await db.execute(
      sql`SELECT refresh_token FROM google_credentials 
          WHERE user_id = ${authResult.userId}`
    );
    
    if (credentialsCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Credenciais do Google não encontradas. Por favor, conecte sua conta do Google.' 
      }, { status: 404 });
    }
    
    const refreshToken = decrypt(credentialsCheck.results[0].refresh_token);
    
    // Solicitar novo token de acesso
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      })
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Erro ao atualizar token do Google:', errorData);
      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao atualizar token do Google. Por favor, reconecte sua conta.' 
      }, { status: 401 });
    }
    
    const tokenData = await tokenResponse.json();
    
    // Salvar novo token de acesso
    const encryptedAccessToken = encrypt(tokenData.access_token);
    
    // Calcular nova data de expiração
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
    
    // Atualizar credencial no banco de dados
    await db.execute(
      sql`UPDATE google_credentials
          SET access_token = ${encryptedAccessToken},
              expires_at = ${expiresAt},
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ${authResult.userId}`
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Token atualizado com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao atualizar token do Google:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao atualizar token do Google' 
    }, { status: 500 });
  }
}
