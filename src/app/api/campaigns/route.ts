// Implementação da API unificada de dados de campanhas

import { getRequestContext } from '@cloudflare/next-on-pages';
import { DrizzleD1Database, drizzle } from 'drizzle-orm/d1';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '../auth/route';

// Handler para GET /api/campaigns
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
    const platform = url.searchParams.get('platform');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const compareStartDate = url.searchParams.get('compareStartDate');
    const compareEndDate = url.searchParams.get('compareEndDate');
    
    // Validar parâmetros
    if (!clientId) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID do cliente é obrigatório' 
      }, { status: 400 });
    }
    
    // Verificar se o cliente existe e se o usuário tem permissão
    const clientCheck = await db.execute(
      sql`SELECT id, name FROM clients WHERE id = ${clientId}`
    );
    
    if (clientCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cliente não encontrado' 
      }, { status: 404 });
    }
    
    const client = clientCheck.results[0];
    
    // Se o usuário não for admin, verificar permissão para o cliente
    if (authResult.role !== 'admin') {
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
    }
    
    // Buscar contas de anúncios do cliente
    let accountsQuery = sql`
      SELECT id, platform, account_id, account_name, status
      FROM ad_accounts
      WHERE client_id = ${clientId}
    `;
    
    if (platform) {
      accountsQuery = sql`${accountsQuery} AND platform = ${platform}`;
    }
    
    const accountsResult = await db.execute(accountsQuery);
    
    if (accountsResult.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Nenhuma conta de anúncios encontrada para este cliente' 
      }, { status: 404 });
    }
    
    // Definir datas padrão se não fornecidas
    const today = new Date();
    const defaultEndDate = today.toISOString().split('T')[0];
    today.setDate(today.getDate() - 30);
    const defaultStartDate = today.toISOString().split('T')[0];
    
    const dateRange = {
      startDate: startDate || defaultStartDate,
      endDate: endDate || defaultEndDate
    };
    
    // Buscar dados de campanhas para cada conta
    const campaignsData = await Promise.all(
      accountsResult.results.map(async (account) => {
        try {
          // Construir URL para a API específica da plataforma
          const apiUrl = new URL(`https://fgdash.com/api/${account.platform}/campaigns`);
          apiUrl.searchParams.append('accountId', account.id.toString());
          apiUrl.searchParams.append('startDate', dateRange.startDate);
          apiUrl.searchParams.append('endDate', dateRange.endDate);
          
          if (compareStartDate && compareEndDate) {
            apiUrl.searchParams.append('compareStartDate', compareStartDate);
            apiUrl.searchParams.append('compareEndDate', compareEndDate);
          }
          
          // Criar request para a API específica da plataforma
          const apiRequest = new Request(apiUrl.toString(), {
            headers: {
              'Authorization': request.headers.get('Authorization') || ''
            }
          });
          
          // Chamar a API específica da plataforma
          // Nota: Em um ambiente real, isso seria uma chamada HTTP real
          // Aqui, estamos simulando a resposta
          
          let response;
          if (account.platform === 'meta') {
            // Simular resposta da API do Meta
            response = {
              success: true,
              data: {
                account: {
                  id: account.id,
                  account_id: account.account_id,
                  account_name: account.account_name,
                  status: account.status
                },
                date_range: dateRange,
                campaigns: [
                  {
                    id: 'meta_campaign1',
                    name: 'Meta Campanha de Conversão',
                    status: 'ACTIVE',
                    metrics: {
                      impressions: 150000,
                      reach: 100000,
                      frequency: 1.5,
                      clicks: 3000,
                      ctr: 2.0,
                      cpc: 2.0,
                      cpm: 40.0,
                      spend: 6000.0,
                      conversions: 120,
                      conversion_value: 12000.0,
                      cost_per_result: 50.0,
                      return_percentage: 200.0,
                      video_views_25: 60000,
                      video_views_50: 45000,
                      video_views_75: 30000,
                      video_views_95: 15000,
                      engagements: 4500,
                      hook_rate: 40.0
                    }
                  },
                  {
                    id: 'meta_campaign2',
                    name: 'Meta Campanha de Awareness',
                    status: 'ACTIVE',
                    metrics: {
                      impressions: 80000,
                      reach: 60000,
                      frequency: 1.33,
                      clicks: 1600,
                      ctr: 2.0,
                      cpc: 1.5,
                      cpm: 30.0,
                      spend: 2400.0,
                      conversions: 48,
                      conversion_value: 4800.0,
                      cost_per_result: 50.0,
                      return_percentage: 200.0,
                      video_views_25: 32000,
                      video_views_50: 24000,
                      video_views_75: 16000,
                      video_views_95: 8000,
                      engagements: 2400,
                      hook_rate: 40.0
                    }
                  }
                ],
                totals: {
                  impressions: 230000,
                  reach: 160000,
                  frequency: 1.44,
                  clicks: 4600,
                  ctr: 2.0,
                  cpc: 1.83,
                  cpm: 36.52,
                  spend: 8400.0,
                  conversions: 168,
                  conversion_value: 16800.0,
                  cost_per_result: 50.0,
                  return_percentage: 200.0,
                  video_views_25: 92000,
                  video_views_50: 69000,
                  video_views_75: 46000,
                  video_views_95: 23000,
                  engagements: 6900,
                  hook_rate: 40.0
                }
              }
            };
          } else if (account.platform === 'google') {
            // Simular resposta da API do Google
            response = {
              success: true,
              data: {
                account: {
                  id: account.id,
                  account_id: account.account_id,
                  account_name: account.account_name,
                  status: account.status
                },
                date_range: dateRange,
                campaigns: [
                  {
                    id: 'google_campaign1',
                    name: 'Google Campanha de Conversão',
                    status: 'ENABLED',
                    metrics: {
                      impressions: 125000,
                      reach: 87500,
                      frequency: 1.43,
                      clicks: 2500,
                      ctr: 2.0,
                      cpc: 2.5,
                      cpm: 50.0,
                      spend: 6250.0,
                      conversions: 125,
                      conversion_value: 12500.0,
                      cost_per_result: 50.0,
                      return_percentage: 200.0,
                      video_views_25: 50000,
                      video_views_50: 37500,
                      video_views_75: 25000,
                      video_views_95: 12500,
                      engagements: 3750,
                      hook_rate: 40.0
                    }
                  },
                  {
                    id: 'google_campaign2',
                    name: 'Google Campanha de Remarketing',
                    status: 'ENABLED',
                    metrics: {
                      impressions: 45000,
                      reach: 31500,
                      frequency: 1.43,
                      clicks: 1200,
                      ctr: 2.67,
                      cpc: 1.25,
                      cpm: 33.33,
                      spend: 1500.0,
                      conversions: 60,
                      conversion_value: 6000.0,
                      cost_per_result: 25.0,
                      return_percentage: 400.0,
                      video_views_25: 18000,
                      video_views_50: 13500,
                      video_views_75: 9000,
                      video_views_95: 4500,
                      engagements: 1800,
                      hook_rate: 40.0
                    }
                  }
                ],
                totals: {
                  impressions: 170000,
                  reach: 119000,
                  frequency: 1.43,
                  clicks: 3700,
                  ctr: 2.18,
                  cpc: 2.09,
                  cpm: 45.59,
                  spend: 7750.0,
                  conversions: 185,
                  conversion_value: 18500.0,
                  cost_per_result: 41.89,
                  return_percentage: 238.71,
                  video_views_25: 68000,
                  video_views_50: 51000,
                  video_views_75: 34000,
                  video_views_95: 17000,
                  engagements: 5550,
                  hook_rate: 40.0
                }
              }
            };
          } else {
            // Plataforma não suportada
            return {
              platform: account.platform,
              account: {
                id: account.id,
                account_id: account.account_id,
                account_name: account.account_name,
                status: account.status
              },
              error: 'Plataforma não suportada'
            };
          }
          
          return {
            platform: account.platform,
            account: response.data.account,
            campaigns: response.data.campaigns,
            totals: response.data.totals
          };
        } catch (error) {
          console.error(`Erro ao buscar dados de campanhas para a conta ${account.id}:`, error);
          return {
            platform: account.platform,
            account: {
              id: account.id,
              account_id: account.account_id,
              account_name: account.account_name,
              status: account.status
            },
            error: `Erro ao buscar dados de campanhas: ${error.message}`
          };
        }
      })
    );
    
    // Calcular métricas totais combinadas de todas as plataformas
    const totalMetrics = campaignsData.reduce((totals, platformData) => {
      if (!platformData.totals) return totals;
      
      return {
        impressions: (totals.impressions || 0) + (platformData.totals.impressions || 0),
        reach: (totals.reach || 0) + (platformData.totals.reach || 0),
        clicks: (totals.clicks || 0) + (platformData.totals.clicks || 0),
        spend: (totals.spend || 0) + (platformData.totals.spend || 0),
        conversions: (totals.conversions || 0) + (platformData.totals.conversions || 0),
        conversion_value: (totals.conversion_value || 0) + (platformData.totals.conversion_value || 0),
        video_views_25: (totals.video_views_25 || 0) + (platformData.totals.video_views_25 || 0),
        video_views_50: (totals.video_views_50 || 0) + (platformData.totals.video_views_50 || 0),
        video_views_75: (totals.video_views_75 || 0) + (platformData.totals.video_views_75 || 0),
        video_views_95: (totals.video_views_95 || 0) + (platformData.totals.video_views_95 || 0),
        engagements: (totals.engagements || 0) + (platformData.totals.engagements || 0)
      };
    }, {});
    
    // Calcular métricas derivadas para os totais combinados
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
        client: {
          id: client.id,
          name: client.name
        },
        date_range: dateRange,
        comparison_period: compareStartDate && compareEndDate ? {
          start_date: compareStartDate,
          end_date: compareEndDate
        } : null,
        platforms: campaignsData,
        totals: totalMetrics
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados de campanhas:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao buscar dados de campanhas: ' + error.message 
    }, { status: 500 });
  }
}

// Handler para GET /api/campaigns/insights
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
    const clientId = url.searchParams.get('clientId');
    const platform = url.searchParams.get('platform');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const compareStartDate = url.searchParams.get('compareStartDate');
    const compareEndDate = url.searchParams.get('compareEndDate');
    const breakdown = url.searchParams.get('breakdown') || 'day';
    const metric = url.searchParams.get('metric') || 'spend';
    
    // Validar parâmetros
    if (!clientId) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID do cliente é obrigatório' 
      }, { status: 400 });
    }
    
    // Verificar se o cliente existe e se o usuário tem permissão
    const clientCheck = await db.execute(
      sql`SELECT id, name FROM clients WHERE id = ${clientId}`
    );
    
    if (clientCheck.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cliente não encontrado' 
      }, { status: 404 });
    }
    
    const client = clientCheck.results[0];
    
    // Se o usuário não for admin, verificar permissão para o cliente
    if (authResult.role !== 'admin') {
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
    }
    
    // Buscar contas de anúncios do cliente
    let accountsQuery = sql`
      SELECT id, platform, account_id, account_name, status
      FROM ad_accounts
      WHERE client_id = ${clientId}
    `;
    
    if (platform) {
      accountsQuery = sql`${accountsQuery} AND platform = ${platform}`;
    }
    
    const accountsResult = await db.execute(accountsQuery);
    
    if (accountsResult.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Nenhuma conta de anúncios encontrada para este cliente' 
      }, { status: 404 });
    }
    
    // Definir datas padrão se não fornecidas
    const today = new Date();
    const defaultEndDate = today.toISOString().split('T')[0];
    today.setDate(today.getDate() - 30);
    const defaultStartDate = today.toISOString().split('T')[0];
    
    const dateRange = {
      startDate: startDate || defaultStartDate,
      endDate: endDate || defaultEndDate
    };
    
    // Buscar insights para cada conta
    const insightsData = await Promise.all(
      accountsResult.results.map(async (account) => {
        try {
          // Construir URL para a API específica da plataforma
          const apiUrl = new URL(`https://fgdash.com/api/${account.platform}/campaigns/insights`);
          apiUrl.searchParams.append('accountId', account.id.toString());
          apiUrl.searchParams.append('startDate', dateRange.startDate);
          apiUrl.searchParams.append('endDate', dateRange.endDate);
          apiUrl.searchParams.append('breakdown', breakdown);
          
          if (compareStartDate && compareEndDate) {
            apiUrl.searchParams.append('compareStartDate', compareStartDate);
            apiUrl.searchParams.append('compareEndDate', compareEndDate);
          }
          
          // Criar request para a API específica da plataforma
          const apiRequest = new Request(apiUrl.toString(), {
            headers: {
              'Authorization': request.headers.get('Authorization') || ''
            }
          });
          
          // Chamar a API específica da plataforma
          // Nota: Em um ambiente real, isso seria uma chamada HTTP real
          // Aqui, estamos simulando a resposta
          
          // Simulação de dados de insights com breakdown por dia
          const generateDailyData = (startDate, endDate, platform) => {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const days = [];
            
            // Gerar datas entre start e end
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
              days.push(new Date(d).toISOString().split('T')[0]);
            }
            
            // Gerar dados para cada dia
            return days.map(day => {
              // Valores base com alguma variação aleatória
              const baseImpressions = 5000 + Math.floor(Math.random() * 2000);
              const baseClicks = 100 + Math.floor(Math.random() * 50);
              const baseConversions = 5 + Math.floor(Math.random() * 3);
              const baseCost = 200 + Math.floor(Math.random() * 100);
              const baseValue = baseCost * (1.5 + Math.random());
              
              // Adicionar variação por plataforma
              const multiplier = platform === 'meta' ? 1.2 : 1.0;
              
              return {
                date: day,
                impressions: Math.round(baseImpressions * multiplier),
                reach: Math.round(baseImpressions * 0.7 * multiplier),
                frequency: 1.43,
                clicks: Math.round(baseClicks * multiplier),
                ctr: (baseClicks / baseImpressions) * 100,
                cpc: baseCost / baseClicks,
                cpm: (baseCost / baseImpressions) * 1000,
                spend: baseCost * multiplier,
                conversions: Math.round(baseConversions * multiplier),
                conversion_value: baseValue * multiplier,
                cost_per_result: (baseCost * multiplier) / (baseConversions * multiplier),
                return_percentage: (baseValue * multiplier) / (baseCost * multiplier) * 100,
                video_views_25: Math.round(baseImpressions * 0.4 * multiplier),
                video_views_50: Math.round(baseImpressions * 0.3 * multiplier),
                video_views_75: Math.round(baseImpressions * 0.2 * multiplier),
                video_views_95: Math.round(baseImpressions * 0.1 * multiplier),
                engagements: Math.round(baseClicks * 1.5 * multiplier),
                hook_rate: 40.0
              };
            });
          };
          
          // Gerar dados para o período atual
          const currentPeriodData = generateDailyData(dateRange.startDate, dateRange.endDate, account.platform);
          
          // Gerar dados para o período de comparação, se solicitado
          let comparisonPeriodData = null;
          if (compareStartDate && compareEndDate) {
            comparisonPeriodData = generateDailyData(compareStartDate, compareEndDate, account.platform);
          }
          
          return {
            platform: account.platform,
            account: {
              id: account.id,
              account_id: account.account_id,
              account_name: account.account_name,
              status: account.status
            },
            current_period: {
              start_date: dateRange.startDate,
              end_date: dateRange.endDate,
              data: currentPeriodData
            },
            comparison_period: comparisonPeriodData ? {
              start_date: compareStartDate,
              end_date: compareEndDate,
              data: comparisonPeriodData
            } : null
          };
        } catch (error) {
          console.error(`Erro ao buscar insights para a conta ${account.id}:`, error);
          return {
            platform: account.platform,
            account: {
              id: account.id,
              account_id: account.account_id,
              account_name: account.account_name,
              status: account.status
            },
            error: `Erro ao buscar insights: ${error.message}`
          };
        }
      })
    );
    
    // Combinar dados de todas as plataformas por data
    const combinedData = {};
    
    // Processar dados do período atual
    insightsData.forEach(platformData => {
      if (!platformData.current_period || !platformData.current_period.data) return;
      
      platformData.current_period.data.forEach(dayData => {
        const date = dayData.date;
        
        if (!combinedData[date]) {
          combinedData[date] = {
            date,
            platforms: {}
          };
        }
        
        combinedData[date].platforms[platformData.platform] = dayData;
        
        // Atualizar totais para o dia
        Object.keys(dayData).forEach(key => {
          if (key !== 'date' && typeof dayData[key] === 'number') {
            if (!combinedData[date][key]) {
              combinedData[date][key] = 0;
            }
            combinedData[date][key] += dayData[key];
          }
        });
      });
    });
    
    // Converter para array e ordenar por data
    const sortedData = Object.values(combinedData).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return NextResponse.json({ 
      success: true, 
      data: {
        client: {
          id: client.id,
          name: client.name
        },
        date_range: {
          start_date: dateRange.startDate,
          end_date: dateRange.endDate
        },
        comparison_period: compareStartDate && compareEndDate ? {
          start_date: compareStartDate,
          end_date: compareEndDate
        } : null,
        breakdown: breakdown,
        metric: metric,
        platforms: insightsData,
        combined_data: sortedData
      }
    });
  } catch (error) {
    console.error('Erro ao buscar insights de campanhas:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao buscar insights de campanhas: ' + error.message 
    }, { status: 500 });
  }
}

// Handler para GET /api/campaigns/metrics
export async function metrics(request: NextRequest) {
  try {
    // Verificar autenticação
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated) {
      return NextResponse.json({ 
        success: false, 
        error: authResult.error 
      }, { status: authResult.status });
    }
    
    // Lista de todas as métricas disponíveis
    const availableMetrics = [
      {
        id: 'spend',
        name: 'Investido',
        description: 'Valor total gasto nas campanhas',
        format: 'currency',
        category: 'principal'
      },
      {
        id: 'conversions',
        name: 'Resultado',
        description: 'Número total de conversões obtidas',
        format: 'number',
        category: 'principal'
      },
      {
        id: 'cost_per_result',
        name: 'Custo por Resultado',
        description: 'Custo médio por conversão',
        format: 'currency',
        category: 'principal'
      },
      {
        id: 'return_percentage',
        name: 'Retorno',
        description: 'Percentual de retorno sobre o investimento (ROAS)',
        format: 'percentage',
        category: 'principal'
      },
      {
        id: 'impressions',
        name: 'Impressões',
        description: 'Número total de vezes que os anúncios foram exibidos',
        format: 'number',
        category: 'alcance'
      },
      {
        id: 'reach',
        name: 'Alcance',
        description: 'Número de pessoas únicas que viram os anúncios',
        format: 'number',
        category: 'alcance'
      },
      {
        id: 'frequency',
        name: 'Frequência',
        description: 'Número médio de vezes que cada pessoa viu os anúncios',
        format: 'decimal',
        category: 'alcance'
      },
      {
        id: 'clicks',
        name: 'Cliques',
        description: 'Número total de cliques nos anúncios',
        format: 'number',
        category: 'engajamento'
      },
      {
        id: 'ctr',
        name: 'CTR',
        description: 'Taxa de cliques (Cliques / Impressões)',
        format: 'percentage',
        category: 'engajamento'
      },
      {
        id: 'cpc',
        name: 'CPC',
        description: 'Custo por clique',
        format: 'currency',
        category: 'custo'
      },
      {
        id: 'cpm',
        name: 'CPM',
        description: 'Custo por mil impressões',
        format: 'currency',
        category: 'custo'
      },
      {
        id: 'video_views_25',
        name: 'Visualizações 25%',
        description: 'Número de visualizações de vídeo até 25% da duração',
        format: 'number',
        category: 'video'
      },
      {
        id: 'video_views_50',
        name: 'Visualizações 50%',
        description: 'Número de visualizações de vídeo até 50% da duração',
        format: 'number',
        category: 'video'
      },
      {
        id: 'video_views_75',
        name: 'Visualizações 75%',
        description: 'Número de visualizações de vídeo até 75% da duração',
        format: 'number',
        category: 'video'
      },
      {
        id: 'video_views_95',
        name: 'Visualizações 95%',
        description: 'Número de visualizações de vídeo até 95% da duração',
        format: 'number',
        category: 'video'
      },
      {
        id: 'engagements',
        name: 'Engajamentos',
        description: 'Número total de interações com os anúncios',
        format: 'number',
        category: 'engajamento'
      },
      {
        id: 'hook_rate',
        name: 'Hook Rate',
        description: 'Taxa de retenção inicial dos vídeos',
        format: 'percentage',
        category: 'video'
      }
    ];
    
    // Agrupar métricas por categoria
    const metricsByCategory = availableMetrics.reduce((acc, metric) => {
      if (!acc[metric.category]) {
        acc[metric.category] = [];
      }
      acc[metric.category].push(metric);
      return acc;
    }, {});
    
    return NextResponse.json({ 
      success: true, 
      data: {
        metrics: availableMetrics,
        categories: metricsByCategory
      }
    });
  } catch (error) {
    console.error('Erro ao buscar métricas disponíveis:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Erro ao buscar métricas disponíveis: ' + error.message 
    }, { status: 500 });
  }
}
