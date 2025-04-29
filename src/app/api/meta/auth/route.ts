// Implementação da API de autenticação com Meta Ads

import { getRequestContext } from '@cloudflare/next-on-pages';
import { DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '../../auth/route';
import { encrypt } from '@/lib/encryption';

// Configurações do Meta Business SDK
const META_APP_ID = process.env.META_APP_ID || '';
const META_APP_SECRET = process.env.META_APP_SECRET || '';
const META_REDIRECT_URI = process.env.META_REDIRECT_URI || 'https://fgdash.com/api/meta/auth/callback';

// Handler para GET /api/meta/auth/connect
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
    
    // Gerar URL de autenticação do Meta
    const state = Buffer.from(JSON.stringify({
      userId: authResult.userId,
      timestamp: Date.now()
    })).toString('base64');
    
    const scopes = [
      'ads_management',
      'ads_read',
      'business_management',
      'public_profile',
      'email'
    ].join(',');
    
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
      `client_id=${META_APP_ID}` +
      `&redirect_uri=${encodeURIComponent(META_REDIRECT_URI)}` +
      `&state=${state}` +
      `&scope=${scopes}`;
    
    return NextResponse.json({ 
      success: true, 
      data: { authUrl } 
    });
  } catch (error) {
    console.error('Erro ao gerar URL de autenticação do Meta:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao gerar URL de autenticação do Meta' 
    }, { status: 500 });
  }
}

// Handler para GET /api/meta/auth/callback
export async function callback(request: NextRequest) {
  try {
    const { env } = getRequestContext();
    const db: DrizzleD1Database = drizzle(env.DB);
    
    // Obter parâmetros da URL
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorReason = url.searchParams.get('error_reason');
    const errorDescription = url.searchParams.get('error_description');
    
    // Verificar se houve erro na autenticação
    if (error) {
      console.error('Erro na autenticação do Meta:', error, errorReason, errorDescription);
      return NextResponse.redirect(new URL('/settings?error=meta_auth_failed', request.url));
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
    const tokenResponse = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: META_APP_ID,
        client_secret: META_APP_SECRET,
        redirect_uri: META_REDIRECT_URI,
        code
      })
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Erro ao obter token do Meta:', errorData);
      return NextResponse.redirect(new URL('/settings?error=token_exchange_failed', request.url));
    }
    
    const tokenData = await tokenResponse.json();
    
    // Obter informações do usuário do Meta
    const userResponse = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${tokenData.access_token}`);
    
    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      console.error('Erro ao obter informações do usuário do Meta:', errorData);
      return NextResponse.redirect(new URL('/settings?error=user_info_failed', request.url));
    }
    
    const userData = await userResponse.json();
    
    // Obter contas de anúncios do usuário
    const adAccountsResponse = await fetch(`https://graph.facebook.com/v18.0/me/adaccounts?fields=id,name,account_id,account_status&access_token=${tokenData.access_token}`);
    
    if (!adAccountsResponse.ok) {
      const errorData = await adAccountsResponse.json();
      console.error('Erro ao obter contas de anúncios do Meta:', errorData);
      return NextResponse.redirect(new URL('/settings?error=ad_accounts_failed', request.url));
    }
    
    const adAccountsData = await adAccountsResponse.json();
    
    // Salvar token de acesso no banco de dados
    const encryptedToken = encrypt(tokenData.access_token);
    
    // Calcular data de expiração
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
    
    // Inserir ou atualizar credencial do Meta
    await db.execute(
      sql`INSERT INTO meta_credentials (user_id, meta_user_id, meta_user_name, meta_user_email, access_token, expires_at)
          VALUES (${stateData.userId}, ${userData.id}, ${userData.name}, ${userData.email || ''}, ${encryptedToken}, ${expiresAt})
          ON CONFLICT (user_id) DO UPDATE SET
          meta_user_id = ${userData.id},
          meta_user_name = ${userData.name},
          meta_user_email = ${userData.email || ''},
          access_token = ${encryptedToken},
          expires_at = ${expiresAt},
          updated_at = CURRENT_TIMESTAMP`
    );
    
    // Salvar contas de anúncios
    for (const account of adAccountsData.data) {
      // Verificar se a conta já existe
      const accountCheck = await db.execute(
        sql`SELECT id FROM ad_accounts WHERE platform = 'meta' AND account_id = ${account.account_id}`
      );
      
      if (accountCheck.results.length === 0) {
        // Inserir nova conta
        await db.execute(
          sql`INSERT INTO ad_accounts (platform, account_id, account_name, status)
              VALUES ('meta', ${account.account_id}, ${account.name}, ${account.account_status === 1 ? 'active' : 'inactive'})`
        );
      } else {
        // Atualizar conta existente
        await db.execute(
          sql`UPDATE ad_accounts
              SET account_name = ${account.name},
                  status = ${account.account_status === 1 ? 'active' : 'inactive'},
                  updated_at = CURRENT_TIMESTAMP
              WHERE platform = 'meta' AND account_id = ${account.account_id}`
        );
      }
    }
    
    // Redirecionar para a página de configurações com sucesso
    return NextResponse.redirect(new URL('/settings?success=meta_connected', request.url));
  } catch (error) {
    console.error('Erro no callback do Meta:', error);
    return NextResponse.redirect(new URL('/settings?error=callback_failed', request.url));
  }
}
