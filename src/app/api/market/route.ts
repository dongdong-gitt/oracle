import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface MarketData {
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  element: string;
  trend: 'up' | 'down' | 'neutral';
  high?: number;
  low?: number;
}

interface FearGreedData {
  name: string;
  symbol: 'FNG';
  value: number;
  classification: string;
  source: string;
  updatedAt: string;
}

async function fetchSinaText(code: string) {
  const response = await fetch(`https://hq.sinajs.cn/list=${code}`, {
    cache: 'no-store',
    headers: {
      Referer: 'https://finance.sina.com.cn',
      'User-Agent': 'Mozilla/5.0',
    },
  });
  if (!response.ok) {
    throw new Error(`Sina API failed ${code}: ${response.status}`);
  }
  return response.text();
}

function parseQuotedCsv(raw: string) {
  const match = raw.match(/"([^"]+)"/);
  if (!match?.[1]) return null;
  return match[1].split(',');
}

async function getSHIndex(): Promise<MarketData | null> {
  try {
    const text = await fetchSinaText('sh000001');
    const parts = parseQuotedCsv(text);
    if (!parts) return null;

    const previousClose = Number(parts[2]);
    const current = Number(parts[3]);
    const high = Number(parts[4]);
    const low = Number(parts[5]);
    if (!Number.isFinite(current) || !Number.isFinite(previousClose)) return null;

    const change = current - previousClose;
    const changePercent = previousClose ? (change / previousClose) * 100 : 0;

    return {
      name: '上证指数',
      symbol: 'SSE',
      price: current,
      change,
      changePercent: Number(changePercent.toFixed(2)),
      high: Number.isFinite(high) ? high : undefined,
      low: Number.isFinite(low) ? low : undefined,
      element: '火',
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    };
  } catch (e) {
    console.error('Failed to fetch SSE:', e);
    return null;
  }
}

async function getNASDAQ(): Promise<MarketData | null> {
  try {
    const text = await fetchSinaText('gb_ixic');
    const parts = parseQuotedCsv(text);
    if (!parts) return null;

    const current = Number(parts[1]);
    const change = Number(parts[2]);
    const changePercent = Number(parts[3]);
    const high = Number(parts[6]);
    const low = Number(parts[7]);
    if (!Number.isFinite(current)) return null;

    return {
      name: '纳斯达克',
      symbol: 'NASDAQ',
      price: current,
      change: Number.isFinite(change) ? change : 0,
      changePercent: Number.isFinite(changePercent) ? changePercent : 0,
      high: Number.isFinite(high) ? high : undefined,
      low: Number.isFinite(low) ? low : undefined,
      element: '木',
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    };
  } catch (e) {
    console.error('Failed to fetch NASDAQ:', e);
    return null;
  }
}

async function getBitcoin(): Promise<MarketData | null> {
  try {
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
      { cache: 'no-store' }
    );
    if (!response.ok) {
      throw new Error(`CoinGecko failed: ${response.status}`);
    }

    const data = await response.json();
    const btc = data?.bitcoin;
    const price = Number(btc?.usd);
    const changePercent = Number(btc?.usd_24h_change ?? 0);
    if (!Number.isFinite(price)) return null;

    return {
      name: '比特币',
      symbol: 'BTC',
      price,
      change: 0,
      changePercent: Number.isFinite(changePercent) ? Number(changePercent.toFixed(2)) : 0,
      element: '金',
      trend: changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral',
    };
  } catch (e) {
    console.error('Failed to fetch BTC:', e);
    return null;
  }
}

async function getGold(): Promise<MarketData | null> {
  try {
    const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d&range=5d', {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });
    if (!response.ok) {
      throw new Error(`Yahoo gold failed: ${response.status}`);
    }

    const json = await response.json();
    const result = json?.chart?.result?.[0];
    const meta = result?.meta;
    const quote = result?.indicators?.quote?.[0];
    const closes = Array.isArray(quote?.close) ? quote.close.filter((n: unknown) => Number.isFinite(Number(n))).map(Number) : [];
    const highs = Array.isArray(quote?.high) ? quote.high.filter((n: unknown) => Number.isFinite(Number(n))).map(Number) : [];
    const lows = Array.isArray(quote?.low) ? quote.low.filter((n: unknown) => Number.isFinite(Number(n))).map(Number) : [];

    const current = Number(meta?.regularMarketPrice ?? closes.at(-1));
    const previousClose = Number(meta?.chartPreviousClose ?? closes.at(-2));
    const high = Number(highs.at(-1));
    const low = Number(lows.at(-1));
    if (!Number.isFinite(current)) return null;

    const change = Number.isFinite(previousClose) ? current - previousClose : 0;
    const changePercent = Number.isFinite(previousClose) && previousClose !== 0 ? (change / previousClose) * 100 : 0;

    return {
      name: '黄金',
      symbol: 'GOLD',
      price: current,
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      high: Number.isFinite(high) ? high : undefined,
      low: Number.isFinite(low) ? low : undefined,
      element: '土',
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    };
  } catch (e) {
    console.error('Failed to fetch GOLD:', e);
    return null;
  }
}

async function getCryptoFearGreed(): Promise<FearGreedData | null> {
  try {
    const response = await fetch('https://coinmarketcap.com/charts/fear-and-greed-index/', {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (response.ok) {
      const html = await response.text();
      const blockMatch = html.match(/"fearGreedIndexData":\{"currentIndex":\{([^}]+)\}/);
      if (blockMatch?.[1]) {
        const block = blockMatch[1];
        const scoreMatch = block.match(/"score":(\d+)/);
        const nameMatch = block.match(/"name":"([^"]+)"/);
        const updateMatch = block.match(/"updateTime":"([^"]+)"/);
        const value = Number(scoreMatch?.[1]);
        if (Number.isFinite(value)) {
          return {
            name: 'Crypto Fear & Greed',
            symbol: 'FNG',
            value,
            classification: String(nameMatch?.[1] || ''),
            source: 'coinmarketcap.com',
            updatedAt: String(updateMatch?.[1] || new Date().toISOString()),
          };
        }
      }
    }
  } catch (e) {
    console.error('Failed to fetch Fear & Greed from CMC:', e);
  }

  try {
    const response = await fetch('https://api.alternative.me/fng/?limit=1&format=json', {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Fear & Greed API failed: ${response.status}`);
    }

    const json = await response.json();
    const item = json?.data?.[0];
    const value = Number(item?.value);
    if (!Number.isFinite(value)) return null;

    return {
      name: 'Crypto Fear & Greed',
      symbol: 'FNG',
      value,
      classification: String(item?.value_classification || ''),
      source: 'alternative.me',
      updatedAt: new Date().toISOString(),
    };
  } catch (e) {
    console.error('Failed to fetch Fear & Greed from fallback source:', e);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get('type') || '').toLowerCase();

  if (!type) {
    const [sh, nasdaq, btc, gold, fear] = await Promise.all([
      getSHIndex(),
      getNASDAQ(),
      getBitcoin(),
      getGold(),
      getCryptoFearGreed(),
    ]);
    return NextResponse.json({ success: true, data: { sh, nasdaq, btc, gold, fear } });
  }

  let data: MarketData | FearGreedData | null = null;
  if (type === 'sh') data = await getSHIndex();
  if (type === 'nasdaq') data = await getNASDAQ();
  if (type === 'btc') data = await getBitcoin();
  if (type === 'gold') data = await getGold();
  if (type === 'fear') data = await getCryptoFearGreed();

  if (data) {
    return NextResponse.json({ success: true, data });
  }

  return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 500 });
}
