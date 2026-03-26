// 免费金融数据API聚合
// 上证指数：新浪财经
// 比特币：CoinGecko
// 黄金：新浪财经
// 纳斯达克：新浪财经（延迟15分钟）

import { NextRequest, NextResponse } from 'next/server';

// 上证指数
async function getSHIndex() {
  try {
    const response = await fetch('https://hq.sinajs.cn/list=sh000001', {
      headers: { 'Referer': 'https://finance.sina.com.cn' }
    });
    const text = await response.text();
    // 解析: var hq_str_sh000001="上证指数,3245.67,3234.50,3256.78,3267.89,3234.12,0,0,123456789,45678901234";
    const match = text.match(/"([^"]+)"/);
    if (match) {
      const parts = match[1].split(',');
      const name = parts[0];
      const yesterdayClose = parseFloat(parts[2]);
      const current = parseFloat(parts[3]);
      const change = current - yesterdayClose;
      const changePercent = (change / yesterdayClose) * 100;
      
      return {
        name: '上证指数',
        symbol: 'SSE',
        price: current,
        change: change,
        changePercent: parseFloat(changePercent.toFixed(2)),
        high: parseFloat(parts[4]),
        low: parseFloat(parts[5]),
        element: '火',
        trend: change >= 0 ? 'up' : 'down',
      };
    }
  } catch (e) {
    console.error('上证指数获取失败:', e);
  }
  return null;
}

// 纳斯达克
async function getNASDAQ() {
  try {
    const response = await fetch('https://hq.sinajs.cn/list=gb_ixic', {
      headers: { 'Referer': 'https://finance.sina.com.cn' }
    });
    const text = await response.text();
    const match = text.match(/"([^"]+)"/);
    if (match) {
      const parts = match[1].split(',');
      const name = parts[0];
      const current = parseFloat(parts[1]);
      const change = parseFloat(parts[2]);
      const changePercent = parseFloat(parts[3]);
      
      return {
        name: '纳斯达克',
        symbol: 'NASDAQ',
        price: current,
        change: change,
        changePercent: changePercent,
        high: parseFloat(parts[6]),
        low: parseFloat(parts[7]),
        element: '木',
        trend: change >= 0 ? 'up' : 'down',
      };
    }
  } catch (e) {
    console.error('纳斯达克获取失败:', e);
  }
  return null;
}

// 比特币
async function getBitcoin() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true');
    const data = await response.json();
    const btc = data.bitcoin;
    
    return {
      name: '比特币',
      symbol: 'BTC',
      price: btc.usd,
      change: 0, // CoinGecko免费版不提供24h change数值
      changePercent: btc.usd_24h_change || 0,
      element: '金',
      trend: (btc.usd_24h_change || 0) >= 0 ? 'up' : 'down',
    };
  } catch (e) {
    console.error('比特币获取失败:', e);
  }
  return null;
}

// 黄金
async function getGold() {
  try {
    // 上海黄金交易所AU9999
    const response = await fetch('https://hq.sinajs.cn/list=au0', {
      headers: { 'Referer': 'https://finance.sina.com.cn' }
    });
    const text = await response.text();
    const match = text.match(/"([^"]+)"/);
    if (match) {
      const parts = match[1].split(',');
      const current = parseFloat(parts[1]);
      const change = parseFloat(parts[4]);
      const changePercent = parseFloat(parts[5]);
      
      return {
        name: '黄金',
        symbol: 'GOLD',
        price: current,
        change: change,
        changePercent: changePercent,
        element: '土',
        trend: change >= 0 ? 'up' : 'down',
      };
    }
  } catch (e) {
    console.error('黄金获取失败:', e);
  }
  return null;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  let data = null;

  switch (type) {
    case 'sh':
      data = await getSHIndex();
      break;
    case 'nasdaq':
      data = await getNASDAQ();
      break;
    case 'btc':
      data = await getBitcoin();
      break;
    case 'gold':
      data = await getGold();
      break;
    default:
      // 返回全部
      const [sh, nasdaq, btc, gold] = await Promise.all([
        getSHIndex(),
        getNASDAQ(),
        getBitcoin(),
        getGold(),
      ]);
      return NextResponse.json({
        success: true,
        data: { sh, nasdaq, btc, gold },
      });
  }

  if (data) {
    return NextResponse.json({
      success: true,
      data,
    });
  }

  return NextResponse.json(
    { success: false, error: 'Failed to fetch data' },
    { status: 500 }
  );
}
