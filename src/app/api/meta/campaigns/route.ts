// Implementação da API para buscar dados de campanhas do Meta Ads

import { getRequestContext } from '@cloudflare/next-on-pages';
import { DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '../../auth/route';
import { decrypt } from '@/lib/encryption';

// Handler para GET /api/meta/campaigns
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
    const accountId = url.searchParams.get('accountId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    
    // Validar parâmetros
    if (!accountId) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID da conta é obrigatório' 
      }, { status: 400 });
    }
    
    // Verificar se a conta existe e se o usuário tem permissão
    const accountCheck = await db.execute(
      sql`SELECT a.id, a.client_id, a.account_id, a.account_name, a.status
          FROM ad_accounts a
          WHERE a.id = ${accountId} AND a.platform = 'meta'`
    );
    
    if (accountCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Conta do Meta Ads não encontrada' 
      }, { status: 404 });
    }
    
    const account = accountCheck.results[0];
    
    // Se o usuário não for admin, verificar permissão para o cliente
    if (authResult.role !== 'admin') {
      const permissionCheck = await db.execute(
        sql`SELECT permission_type FROM user_permissions 
            WHERE user_id = ${authResult.userId} AND client_id = ${account.client_id}`
      );
      
      if (permissionCheck.results.length === 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Sem permissão para esta conta' 
        }, { status: 403 });
      }
    }
    
    // Obter credenciais do Meta
    const credentialsCheck = await db.execute(
      sql`SELECT access_token, expires_at FROM meta_credentials 
          WHERE user_id = ${authResult.userId}`
    );
    
    if (credentialsCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Credenciais do Meta não encontradas. Por favor, conecte sua conta do Meta.' 
      }, { status: 404 });
    }
    
    const credentials = credentialsCheck.results[0];
    
    // Verificar se o token expirou
    if (new Date(credentials.expires_at) < new Date()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Token do Meta expirado. Por favor, reconecte sua conta do Meta.' 
      }, { status: 401 });
    }
    
    // Descriptografar token
    const accessToken = decrypt(credentials.access_token);
    
    // Definir datas padrão se não fornecidas
    const today = new Date();
    const defaultEndDate = today.toISOString().split('T')[0];
    today.setDate(today.getDate() - 30);
    const defaultStartDate = today.toISOString().split('T')[0];
    
    const dateRange = {
      since: startDate || defaultStartDate,
      until: endDate || defaultEndDate
    };
    
    // Buscar campanhas do Meta Ads
    const campaignsResponse = await fetch(
      `https://graph.facebook.com/v18.0/act_${account.account_id}/campaigns?` +
      `fields=id,name,objective,status,created_time,start_time,stop_time,daily_budget,lifetime_budget,budget_remaining` +
      `&access_token=${accessToken}`
    );
    
    if (!campaignsResponse.ok) {
      const errorData = await campaignsResponse.json();
      console.error('Erro ao buscar campanhas do Meta Ads:', errorData);
      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao buscar campanhas do Meta Ads: ' + (errorData.error?.message || 'Erro desconhecido') 
      }, { status: 500 });
    }
    
    const campaignsData = await campaignsResponse.json();
    
    // Buscar métricas para cada campanha
    const campaignsWithMetrics = await Promise.all(
      campaignsData.data.map(async (campaign) => {
        // Buscar insights da campanha
        const insightsResponse = await fetch(
          `https://graph.facebook.com/v18.0/${campaign.id}/insights?` +
          `fields=impressions,reach,frequency,clicks,ctr,cpc,cpm,spend,actions,action_values,conversions,conversion_values,cost_per_action_type,cost_per_conversion,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p95_watched_actions,video_p100_watched_actions,engagement_rate_ranking,quality_ranking,conversion_rate_ranking` +
          `&time_range={"since":"${dateRange.since}","until":"${dateRange.until}"}` +
          `&access_token=${accessToken}`
        );
        
        if (!insightsResponse.ok) {
          const errorData = await insightsResponse.json();
          console.error(`Erro ao buscar insights da campanha ${campaign.id}:`, errorData);
          return {
            ...campaign,
            insights: null,
            error: 'Erro ao buscar insights'
          };
        }
        
        const insightsData = await insightsResponse.json();
        
        // Processar métricas
        const insights = insightsData.data.length > 0 ? insightsData.data[0] : null;
        
        // Calcular métricas adicionais
        let metrics = {};
        
        if (insights) {
          // Métricas básicas
          metrics = {
            impressions: parseInt(insights.impressions || 0),
            reach: parseInt(insights.reach || 0),
            frequency: parseFloat(insights.frequency || 0),
            clicks: parseInt(insights.clicks || 0),
            ctr: parseFloat(insights.ctr || 0),
            cpc: parseFloat(insights.cpc || 0),
            cpm: parseFloat(insights.cpm || 0),
            spend: parseFloat(insights.spend || 0),
          };
          
          // Métricas de conversão
          if (insights.actions) {
            const conversions = insights.actions.find(a => a.action_type === 'onsite_conversion.messaging_conversation_started_7d');
            if (conversions) {
              metrics.conversions = parseInt(conversions.value || 0);
            }
          }
          
          // Métricas de valor
          if (insights.action_values) {
            const conversionValues = insights.action_values.find(a => a.action_type === 'onsite_conversion.messaging_conversation_started_7d');
            if (conversionValues) {
              metrics.conversion_value = parseFloat(conversionValues.value || 0);
            }
          }
          
          // Custo por resultado
          if (metrics.conversions && metrics.conversions > 0) {
            metrics.cost_per_result = metrics.spend / metrics.conversions;
          } else {
            metrics.cost_per_result = 0;
          }
          
          // Retorno (ROAS)
          if (metrics.spend && metrics.spend > 0 && metrics.conversion_value) {
            metrics.return_percentage = (metrics.conversion_value / metrics.spend) * 100;
          } else {
            metrics.return_percentage = 0;
          }
          
          // Métricas de visualização de vídeo
          if (insights.video_p25_watched_actions) {
            metrics.video_views_25 = parseInt(insights.video_p25_watched_actions[0]?.value || 0);
          }
          
          if (insights.video_p50_watched_actions) {
            metrics.video_views_50 = parseInt(insights.video_p50_watched_actions[0]?.value || 0);
          }
          
          if (insights.video_p75_watched_actions) {
            metrics.video_views_75 = parseInt(insights.video_p75_watched_actions[0]?.value || 0);
          }
          
          if (insights.video_p95_watched_actions) {
            metrics.video_views_95 = parseInt(insights.video_p95_watched_actions[0]?.value || 0);
          }
          
          // Métricas de engajamento
          if (insights.actions) {
            const engagements = insights.actions.filter(a => 
              a.action_type === 'post_engagement' || 
              a.action_type === 'page_engagement' ||
              a.action_type === 'post_reaction'
            );
            
            if (engagements.length > 0) {
              metrics.engagements = engagements.reduce((sum, item) => sum + parseInt(item.value || 0), 0);
            }
          }
          
          // Hook rate (taxa de retenção)
          if (metrics.video_views_25 && metrics.impressions) {
            metrics.hook_rate = (metrics.video_views_25 / metrics.impressions) * 100;
          } else {
            metrics.hook_rate = 0;
          }
        }
        
        return {
          id: campaign.id,
          name: campaign.name,
          objective: campaign.objective,
          status: campaign.status,
          created_time: campaign.created_time,
          start_time: campaign.start_time,
          stop_time: campaign.stop_time,
          daily_budget: campaign.daily_budget,
          lifetime_budget: campaign.lifetime_budget,
          budget_remaining: campaign.budget_remaining,
          metrics
        };
      })
    );
    
    // Calcular métricas totais
    const totalMetrics = campaignsWithMetrics.reduce((totals, campaign) => {
      if (!campaign.metrics) return totals;
      
      return {
        impressions: (totals.impressions || 0) + (campaign.metrics.impressions || 0),
        reach: (totals.reach || 0) + (campaign.metrics.reach || 0),
        clicks: (totals.clicks || 0) + (campaign.metrics.clicks || 0),
        spend: (totals.spend || 0) + (campaign.metrics.spend || 0),
        conversions: (totals.conversions || 0) + (campaign.metrics.conversions || 0),
        conversion_value: (totals.conversion_value || 0) + (campaign.metrics.conversion_value || 0),
        video_views_25: (totals.video_views_25 || 0) + (campaign.metrics.video_views_25 || 0),
        video_views_50: (totals.video_views_50 || 0) + (campaign.metrics.video_views_50 || 0),
        video_views_75: (totals.video_views_75 || 0) + (campaign.metrics.video_views_75 || 0),
        video_views_95: (totals.video_views_95 || 0) + (campaign.metrics.video_views_95 || 0),
        engagements: (totals.engagements || 0) + (campaign.metrics.engagements || 0)
      };
    }, {});
    
    // Calcular métricas derivadas para os totais
    if (totalMetrics.impressions > 0) {
      totalMetrics.frequency = totalMetrics.impressions / totalMetrics.reach;
      totalMetrics.ctr = (totalMetrics.clicks / totalMetrics.impressions) * 100;
      totalMetrics.cpm = (totalMetrics.spend / totalMetrics.impressions) * 1000;
      totalMetrics.hook_rate = (totalMetrics.video_views_25 / totalMetrics.impressions) * 100;
    }
    
    if (totalMetrics.clicks > 0) {
      totalMetrics.cpc = totalMetrics.spend / totalMetrics.clicks;
    }
    
    if (totalMetrics.conversions > 0) {
      totalMetrics.cost_per_result = totalMetrics.spend / totalMetrics.conversions;
    }
    
    if (totalMetrics.spend > 0 && totalMetrics.conversion_value) {
      totalMetrics.return_percentage = (totalMetrics.conversion_value / totalMetrics.spend) * 100;
    }
    
    return NextResponse.json({ 
      success: true, 
      data: {
        account: {
          id: account.id,
          account_id: account.account_id,
          account_name: account.account_name,
          status: account.status
        },
        date_range: dateRange,
        campaigns: campaignsWithMetrics,
        totals: totalMetrics
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados de campanhas do Meta Ads:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao buscar dados de campanhas do Meta Ads: ' + error.message 
    }, { status: 500 });
  }
}

// Handler para GET /api/meta/campaigns/insights
export async function insights(request: NextRequest) {
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
    const accountId = url.searchParams.get('accountId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const compareStartDate = url.searchParams.get('compareStartDate');
    const compareEndDate = url.searchParams.get('compareEndDate');
    const breakdown = url.searchParams.get('breakdown') || 'day';
    
    // Validar parâmetros
    if (!accountId) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID da conta é obrigatório' 
      }, { status: 400 });
    }
    
    // Verificar se a conta existe e se o usuário tem permissão
    const accountCheck = await db.execute(
      sql`SELECT a.id, a.client_id, a.account_id, a.account_name, a.status
          FROM ad_accounts a
          WHERE a.id = ${accountId} AND a.platform = 'meta'`
    );
    
    if (accountCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Conta do Meta Ads não encontrada' 
      }, { status: 404 });
    }
    
    const account = accountCheck.results[0];
    
    // Se o usuário não for admin, verificar permissão para o cliente
    if (authResult.role !== 'admin') {
      const permissionCheck = await db.execute(
        sql`SELECT permission_type FROM user_permissions 
            WHERE user_id = ${authResult.userId} AND client_id = ${account.client_id}`
      );
      
      if (permissionCheck.results.length === 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Sem permissão para esta conta' 
        }, { status: 403 });
      }
    }
    
    // Obter credenciais do Meta
    const credentialsCheck = await db.execute(
      sql`SELECT access_token, expires_at FROM meta_credentials 
          WHERE user_id = ${authResult.userId}`
    );
    
    if (credentialsCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Credenciais do Meta não encontradas. Por favor, conecte sua conta do Meta.' 
      }, { status: 404 });
    }
    
    const credentials = credentialsCheck.results[0];
    
    // Verificar se o token expirou
    if (new Date(credentials.expires_at) < new Date()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Token do Meta expirado. Por favor, reconecte sua conta do Meta.' 
      }, { status: 401 });
    }
    
    // Descriptografar token
    const accessToken = decrypt(credentials.access_token);
    
    // Definir datas padrão se não fornecidas
    const today = new Date();
    const defaultEndDate = today.toISOString().split('T')[0];
    today.setDate(today.getDate() - 30);
    const defaultStartDate = today.toISOString().split('T')[0];
    
    const dateRange = {
      since: startDate || defaultStartDate,
      until: endDate || defaultEndDate
    };
    
    // Buscar insights com breakdown
    const insightsResponse = await fetch(
      `https://graph.facebook.com/v18.0/act_${account.account_id}/insights?` +
      `fields=impressions,reach,frequency,clicks,ctr,cpc,cpm,spend,actions,action_values,conversions,conversion_values,cost_per_action_type,cost_per_conversion` +
      `&time_range={"since":"${dateRange.since}","until":"${dateRange.until}"}` +
      `&time_increment=1` +
      `&breakdowns=${breakdown}` +
      `&access_token=${accessToken}`
    );
    
    if (!insightsResponse.ok) {
      const errorData = await insightsResponse.json();
      console.error('Erro ao buscar insights do Meta Ads:', errorData);
      return NextResponse.json({ 
        success: false, 
        error: 'Erro ao buscar insights do Meta Ads: ' + (errorData.error?.message || 'Erro desconhecido') 
      }, { status: 500 });
    }
    
    const insightsData = await insightsResponse.json();
    
    // Processar dados para o formato adequado
    const processedData = insightsData.data.map(insight => {
      // Processar métricas de conversão
      let conversions = 0;
      let conversionValue = 0;
      
      if (insight.actions) {
        const conversionAction = insight.actions.find(a => a.action_type === 'onsite_conversion.messaging_conversation_started_7d');
        if (conversionAction) {
          conversions = parseInt(conversionAction.value || 0);
        }
      }
      
      if (insight.action_values) {
        const conversionValueAction = insight.action_values.find(a => a.action_type === 'onsite_conversion.messaging_conversation_started_7d');
        if (conversionValueAction) {
          conversionValue = parseFloat(conversionValueAction.value || 0);
        }
      }
      
      // Calcular métricas derivadas
      const spend = parseFloat(insight.spend || 0);
      const costPerResult = conversions > 0 ? spend / conversions : 0;
      const returnPercentage = spend > 0 ? (conversionValue / spend) * 100 : 0;
      
      return {
        date: insight.date_start,
        [breakdown]: insight[breakdown],
        impressions: parseInt(insight.impressions || 0),
        reach: parseInt(insight.reach || 0),
        frequency: parseFloat(insight.frequency || 0),
        clicks: parseInt(insight.clicks || 0),
        ctr: parseFloat(insight.ctr || 0) * 100, // Converter para percentual
        cpc: parseFloat(insight.cpc || 0),
        cpm: parseFloat(insight.cpm || 0),
        spend: spend,
        conversions: conversions,
        conversion_value: conversionValue,
        cost_per_result: costPerResult,
        return_percentage: returnPercentage
      };
    });
    
    // Buscar dados de comparação se solicitado
    let comparisonData = null;
    
    if (compareStartDate && compareEndDate) {
      const compareInsightsResponse = await fetch(
        `https://graph.facebook.com/v18.0/act_${account.account_id}/insights?` +
        `fields=impressions,reach,frequency,clicks,ctr,cpc,cpm,spend,actions,action_values,conversions,conversion_values,cost_per_action_type,cost_per_conversion` +
        `&time_range={"since":"${compareStartDate}","until":"${compareEndDate}"}` +
        `&time_increment=1` +
        `&breakdowns=${breakdown}` +
        `&access_token=${accessToken}`
      );
      
      if (compareInsightsResponse.ok) {
        const compareInsightsData = await compareInsightsResponse.json();
        
        comparisonData = compareInsightsData.data.map(insight => {
          // Processar métricas de conversão
          let conversions = 0;
          let conversionValue = 0;
          
          if (insight.actions) {
            const conversionAction = insight.actions.find(a => a.action_type === 'onsite_conversion.messaging_conversation_started_7d');
            if (conversionAction) {
              conversions = parseInt(conversionAction.value || 0);
            }
          }
          
          if (insight.action_values) {
            const conversionValueAction = insight.action_values.find(a => a.action_type === 'onsite_conversion.messaging_conversation_started_7d');
            if (conversionValueAction) {
              conversionValue = parseFloat(conversionValueAction.value || 0);
            }
          }
          
          // Calcular métricas derivadas
          const spend = parseFloat(insight.spend || 0);
          const costPerResult = conversions > 0 ? spend / conversions : 0;
          const returnPercentage = spend > 0 ? (conversionValue / spend) * 100 : 0;
          
          return {
            date: insight.date_start,
            [breakdown]: insight[breakdown],
            impressions: parseInt(insight.impressions || 0),
            reach: parseInt(insight.reach || 0),
            frequency: parseFloat(insight.frequency || 0),
            clicks: parseInt(insight.clicks || 0),
            ctr: parseFloat(insight.ctr || 0) * 100, // Converter para percentual
            cpc: parseFloat(insight.cpc || 0),
            cpm: parseFloat(insight.cpm || 0),
            spend: spend,
            conversions: conversions,
            conversion_value: conversionValue,
            cost_per_result: costPerResult,
            return_percentage: returnPercentage
          };
        });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      data: {
        account: {
          id: account.id,
          account_id: account.account_id,
          account_name: account.account_name,
          status: account.status
        },
        current_period: {
          start_date: dateRange.since,
          end_date: dateRange.until,
          data: processedData
        },
        comparison_period: comparisonData ? {
          start_date: compareStartDate,
          end_date: compareEndDate,
          data: comparisonData
        } : null
      }
    });
  } catch (error) {
    console.error('Erro ao buscar insights do Meta Ads:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao buscar insights do Meta Ads: ' + error.message 
    }, { status: 500 });
  }
}
