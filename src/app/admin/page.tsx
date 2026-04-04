'use client';

import { useEffect, useMemo, useState } from 'react';

type ModuleKey = 'dashboard' | 'users' | 'archives' | 'orders' | 'ai' | 'logs';
type DataSource = 'real' | 'demo';

type AdminState = {
  authenticated: boolean;
  username?: string;
  role?: string;
};

type DemoState = {
  users: any[];
  profiles: any[];
  reports: any[];
  orders: any[];
  aiConfig: any;
  logs: any[];
};

const moduleLabels: Record<ModuleKey, string> = {
  dashboard: '控制台首页',
  users: '用户管理',
  archives: '档案/报告管理',
  orders: '订单/支付管理',
  ai: 'AI配置',
  logs: '系统日志',
};

function makeDemo(): DemoState {
  return {
    users: [
      {
        id: 'u1',
        name: '王冬',
        phone: '13800001111',
        email: 'wangdong@example.com',
        membership: 'PREMIUM',
        membershipExpiresAt: '2027-01-10',
        isBanned: false,
        readingCount: 23,
      },
      {
        id: 'u2',
        name: '张敏',
        phone: '13800002222',
        email: 'zhangmin@example.com',
        membership: 'BASIC',
        membershipExpiresAt: '2026-11-22',
        isBanned: false,
        readingCount: 11,
      },
    ],
    profiles: [
      { id: 'p1', userId: 'u1', name: '王冬本人', birthPlace: '安徽省安庆市迎江区', user: { name: '王冬' } },
      { id: 'p2', userId: 'u2', name: '张敏本人', birthPlace: '江苏省南京市鼓楼区', user: { name: '张敏' } },
    ],
    reports: [
      { id: 'r1', userId: 'u1', title: '2026年度综合命盘报告', reportType: 'YEARLY_FORTUNE', user: { name: '王冬' } },
      { id: 'r2', userId: 'u2', title: '本月事业财运分析', reportType: 'MONTHLY_FORTUNE', user: { name: '张敏' } },
    ],
    orders: [
      { id: 'o1', orderNo: 'ORD-001', userId: 'u1', amount: 1999, currency: 'CNY', status: 'PAID', user: { name: '王冬', membershipExpiresAt: '2027-01-10' } },
      { id: 'o2', orderNo: 'ORD-002', userId: 'u2', amount: 999, currency: 'CNY', status: 'PENDING', user: { name: '张敏', membershipExpiresAt: '2026-11-22' } },
    ],
    aiConfig: { model: 'deepseek-chat', promptTemplate: '你是资深命理顾问', fallbackEnabled: true },
    logs: [
      { id: 'l1', module: 'USER_ADMIN', action: 'UPDATE_USER', level: 'INFO', message: 'manual update' },
      { id: 'l2', module: 'PAYMENT', action: 'CALLBACK_RECEIVED', level: 'INFO', message: 'callback ok' },
    ],
  };
}

function endpointOf(moduleKey: ModuleKey, keyword: string) {
  if (moduleKey === 'dashboard') return '/api/v1/admin/dashboard';
  if (moduleKey === 'users') return `/api/v1/admin/users?page=1&pageSize=30&keyword=${encodeURIComponent(keyword)}`;
  if (moduleKey === 'archives') return '/api/v1/admin/archives?page=1&pageSize=20';
  if (moduleKey === 'orders') return '/api/v1/admin/orders?page=1&pageSize=30';
  if (moduleKey === 'ai') return '/api/v1/admin/ai-config';
  return '/api/v1/admin/logs?page=1&pageSize=50';
}

function demoData(demo: DemoState, moduleKey: ModuleKey, keyword: string) {
  if (moduleKey === 'dashboard') {
    return {
      userTotal: demo.users.length,
      todayNewUsers: 1,
      totalOrders: demo.orders.length,
      incomeCny: demo.orders.filter((o) => o.status === 'PAID').reduce((s, o) => s + o.amount, 0),
      reportCount: demo.reports.length,
      aiCallCount: 42,
    };
  }
  if (moduleKey === 'users') {
    const k = keyword.trim().toLowerCase();
    const items = !k ? demo.users : demo.users.filter((u) => [u.name, u.phone, u.email].some((v) => String(v).toLowerCase().includes(k)));
    return { items, total: items.length };
  }
  if (moduleKey === 'archives') {
    return { profiles: demo.profiles, reports: demo.reports, profileTotal: demo.profiles.length, reportTotal: demo.reports.length };
  }
  if (moduleKey === 'orders') return { items: demo.orders, total: demo.orders.length };
  if (moduleKey === 'ai') return { config: demo.aiConfig, stats: { calls: 42, cost: 15.3 } };
  return { operationLogs: demo.logs, aiErrors: [{ provider: 'fallback', model: 'fallback-local' }], paymentCallbackLogs: [{ orderNo: 'ORD-001', status: 'PAID' }] };
}

function pretty(v: unknown) {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

export default function AdminPage() {
  const [auth, setAuth] = useState<AdminState>({ authenticated: false });
  const [moduleKey, setModuleKey] = useState<ModuleKey>('dashboard');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [dataSource, setDataSource] = useState<DataSource>('real');
  const [data, setData] = useState<any>(null);
  const [userKeyword, setUserKeyword] = useState('');
  const [userDetail, setUserDetail] = useState<any>(null);
  const [demo, setDemo] = useState<DemoState>(() => makeDemo());

  const endpoint = useMemo(() => endpointOf(moduleKey, userKeyword), [moduleKey, userKeyword]);

  async function request(path: string, init?: RequestInit) {
    const res = await fetch(path, {
      ...init,
      headers: { 'content-type': 'application/json', ...(init?.headers || {}) },
      credentials: 'include',
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err: any = new Error(body?.error || `Request failed: ${res.status}`);
      err.code = body?.code;
      throw err;
    }
    return body;
  }

  async function loadModule(target = moduleKey, keyword = userKeyword) {
    setLoading(true);
    setError('');
    setUserDetail(null);
    try {
      const res = await request(endpointOf(target, keyword), { method: 'GET' });
      setData(res?.data ?? res);
      setDataSource('real');
      setNotice('');
    } catch (e: any) {
      if (e?.code === 'DATABASE_UNAVAILABLE') {
        setData(demoData(demo, target, keyword));
        setDataSource('demo');
        setNotice('数据库未连接，当前显示演示数据。配置 DATABASE_URL 后自动显示真实数据。');
        setError('');
      } else {
        setData(null);
        setError(e?.message || '加载失败');
      }
    } finally {
      setLoading(false);
    }
  }

  async function checkSession() {
    try {
      const me = await request('/api/v1/admin/auth/me', { method: 'GET' });
      setAuth({ authenticated: true, username: me?.data?.username, role: me?.data?.role });
      return true;
    } catch {
      setAuth({ authenticated: false });
      return false;
    }
  }

  async function login() {
    setLoading(true);
    setError('');
    try {
      const res = await request('/api/v1/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      setAuth({ authenticated: true, username: res?.data?.username, role: res?.data?.role });
      await loadModule('dashboard');
    } catch (e: any) {
      setError(e?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await request('/api/v1/admin/auth/logout', { method: 'POST' }).catch(() => {});
    setAuth({ authenticated: false });
    setData(null);
  }

  async function updateUserBan(userId: string, isBanned: boolean) {
    if (dataSource === 'demo') {
      const next = { ...demo, users: demo.users.map((u) => (u.id === userId ? { ...u, isBanned } : u)) };
      setDemo(next);
      setData(demoData(next, 'users', userKeyword));
      setNotice('演示模式：已本地模拟封禁/解封。');
      return;
    }
    await request('/api/v1/admin/users', { method: 'PATCH', body: JSON.stringify({ userId, isBanned, bannedReason: isBanned ? 'manual' : '' }) });
    await loadModule('users', userKeyword);
  }

  async function viewUserDetail(userId: string) {
    if (dataSource === 'demo') {
      setUserDetail({
        user: demo.users.find((u) => u.id === userId),
        profiles: demo.profiles.filter((p) => p.userId === userId),
        reports: demo.reports.filter((r) => r.userId === userId),
        orders: demo.orders.filter((o) => o.userId === userId),
      });
      return;
    }
    const r = await request(`/api/v1/admin/users/${userId}`, { method: 'GET' });
    setUserDetail(r?.data);
  }

  async function markOrderPaid(orderId: string) {
    if (dataSource === 'demo') {
      const next = { ...demo, orders: demo.orders.map((o) => (o.id === orderId ? { ...o, status: 'PAID' } : o)) };
      setDemo(next);
      setData(demoData(next, 'orders', userKeyword));
      setNotice('演示模式：已本地模拟手动补单。');
      return;
    }
    await request('/api/v1/admin/orders', { method: 'PATCH', body: JSON.stringify({ orderId, action: 'mark_paid' }) });
    await loadModule('orders');
  }

  async function saveAiConfig() {
    const model = window.prompt('模型名', data?.config?.model || 'deepseek-chat');
    if (!model) return;
    const promptTemplate = window.prompt('Prompt模板', data?.config?.promptTemplate || '') || '';
    const fallbackEnabled = window.confirm('是否开启 fallback？');
    if (dataSource === 'demo') {
      const next = { ...demo, aiConfig: { ...demo.aiConfig, model, promptTemplate, fallbackEnabled } };
      setDemo(next);
      setData(demoData(next, 'ai', userKeyword));
      setNotice('演示模式：已本地模拟更新 AI 配置。');
      return;
    }
    await request('/api/v1/admin/ai-config', { method: 'PATCH', body: JSON.stringify({ model, promptTemplate, fallbackEnabled }) });
    await loadModule('ai');
  }

  async function deleteAnomaly(type: 'profile' | 'report', id: string) {
    if (dataSource === 'demo') {
      const next = {
        ...demo,
        profiles: type === 'profile' ? demo.profiles.filter((p) => p.id !== id) : demo.profiles,
        reports: type === 'report' ? demo.reports.filter((r) => r.id !== id) : demo.reports,
      };
      setDemo(next);
      setData(demoData(next, 'archives', userKeyword));
      setNotice('演示模式：已本地模拟删除异常数据。');
      return;
    }
    await request('/api/v1/admin/archives', { method: 'DELETE', body: JSON.stringify({ type, id }) });
    await loadModule('archives');
  }

  useEffect(() => {
    checkSession().then((ok) => ok && loadModule('dashboard'));
  }, []);

  useEffect(() => {
    if (auth.authenticated) loadModule(moduleKey);
  }, [moduleKey]);

  if (!auth.authenticated) {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(135deg,#eff6ff,#eef2ff)' }}>
        <section style={{ width: 420, maxWidth: '92vw', background: '#fff', border: '1px solid #dbeafe', borderRadius: 14, padding: 18 }}>
          <h1 style={{ margin: 0, color: '#0f172a' }}>管理员登录</h1>
          <p style={{ margin: '6px 0 12px', color: '#64748b' }}>后台独立登录，默认开发账号可直接进入。</p>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="管理员账号" style={{ width: '100%', marginBottom: 8, padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }} />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="管理员密码" style={{ width: '100%', marginBottom: 8, padding: 10, border: '1px solid #cbd5e1', borderRadius: 8 }} />
          <button onClick={login} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #1d4ed8', background: '#1d4ed8', color: '#fff' }}>
            {loading ? '登录中...' : '登录后台'}
          </button>
          {error ? <div style={{ marginTop: 8, color: '#b91c1c', fontSize: 13 }}>{error}</div> : null}
          <div style={{ marginTop: 8, color: '#64748b', fontSize: 12 }}>开发默认：admin / admin123456</div>
        </section>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '240px 1fr', background: '#f1f5f9', color: '#0f172a' }}>
      <aside style={{ background: '#0f172a', color: '#e2e8f0', padding: 14, borderRight: '1px solid #1e293b' }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Oracle Admin</div>
        <div style={{ fontSize: 12, color: '#93c5fd', marginBottom: 12 }}>{auth.username} ({auth.role})</div>
        <div style={{ display: 'grid', gap: 8 }}>
          {(Object.keys(moduleLabels) as ModuleKey[]).map((k) => (
            <button key={k} onClick={() => setModuleKey(k)} style={{ textAlign: 'left', padding: '9px 10px', borderRadius: 8, border: k === moduleKey ? '1px solid #3b82f6' : '1px solid #334155', background: k === moduleKey ? '#1d4ed8' : '#111827', color: '#fff' }}>
              {moduleLabels[k]}
            </button>
          ))}
        </div>
        <button onClick={logout} style={{ marginTop: 12, width: '100%', padding: 9, borderRadius: 8, border: '1px solid #475569', background: '#1f2937', color: '#fff' }}>
          退出登录
        </button>
      </aside>

      <section style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ margin: 0 }}>{moduleLabels[moduleKey]}</h1>
            <div style={{ fontSize: 12, color: '#64748b' }}>{endpoint}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 12, padding: '4px 8px', borderRadius: 999, border: dataSource === 'real' ? '1px solid #86efac' : '1px solid #fcd34d', background: dataSource === 'real' ? '#dcfce7' : '#fef3c7', color: dataSource === 'real' ? '#166534' : '#92400e' }}>
              {dataSource === 'real' ? '真实数据' : '演示数据'}
            </span>
            <button onClick={() => loadModule(moduleKey, userKeyword)} style={{ border: '1px solid #cbd5e1', borderRadius: 8, background: '#fff', padding: '6px 10px' }}>
              刷新
            </button>
          </div>
        </div>

        {notice ? <div style={{ marginBottom: 8, padding: 10, background: '#fffbeb', border: '1px solid #fcd34d', color: '#92400e', borderRadius: 8 }}>{notice}</div> : null}
        {error ? <div style={{ marginBottom: 8, padding: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 8 }}>{error}</div> : null}
        {loading ? <div style={{ marginBottom: 8, padding: 10, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', borderRadius: 8 }}>加载中...</div> : null}

        {!loading && !error ? (
          <>
            {moduleKey === 'dashboard' && data ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
                <MetricCard title="用户总数" value={data.userTotal} color="#0284c7" />
                <MetricCard title="今日新增" value={data.todayNewUsers} color="#16a34a" />
                <MetricCard title="订单总数" value={data.totalOrders} color="#d97706" />
                <MetricCard title="总收入(CNY)" value={data.incomeCny} color="#dc2626" />
                <MetricCard title="报告次数" value={data.reportCount} color="#6366f1" />
                <MetricCard title="AI调用次数" value={data.aiCallCount} color="#0d9488" />
              </div>
            ) : null}

            {moduleKey === 'users' && data ? (
              <section style={{ background: '#fff', border: '1px solid #dbe2f0', borderRadius: 10, padding: 10 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                  <input value={userKeyword} onChange={(e) => setUserKeyword(e.target.value)} placeholder="搜索用户（姓名/手机号/邮箱）" style={{ minWidth: 260, flex: 1, padding: 8, border: '1px solid #cbd5e1', borderRadius: 8 }} />
                  <button onClick={() => loadModule('users', userKeyword)}>搜索</button>
                </div>
                {(data.items || []).map((u: any) => (
                  <div key={u.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 8, marginBottom: 8, background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{u.name}</strong>
                      <span style={{ fontSize: 12, color: u.isBanned ? '#b91c1c' : '#166534' }}>{u.isBanned ? '已封禁' : '正常'}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#475569', margin: '4px 0 6px' }}>{u.phone || u.email} | 会员: {u.membership}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => viewUserDetail(u.id)}>查看详情</button>
                      <button onClick={() => updateUserBan(u.id, !u.isBanned)}>{u.isBanned ? '解封' : '封禁'}</button>
                    </div>
                  </div>
                ))}
                {userDetail ? <pre style={{ margin: 0, background: '#0b1020', color: '#e5e7eb', borderRadius: 8, padding: 8, whiteSpace: 'pre-wrap' }}>{pretty(userDetail)}</pre> : null}
              </section>
            ) : null}

            {moduleKey === 'archives' && data ? (
              <section style={{ display: 'grid', gap: 10 }}>
                <div style={{ background: '#fff', border: '1px solid #dbe2f0', borderRadius: 10, padding: 10 }}>
                  <h3 style={{ marginTop: 0 }}>命盘档案 ({data.profileTotal || 0})</h3>
                  {(data.profiles || []).map((p: any) => (
                    <div key={p.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 8, marginBottom: 6 }}>
                      {p.name} / {p.user?.name || p.userId} / {p.birthPlace}
                      <button style={{ marginLeft: 8 }} onClick={() => deleteAnomaly('profile', p.id)}>删除异常</button>
                    </div>
                  ))}
                </div>
                <div style={{ background: '#fff', border: '1px solid #dbe2f0', borderRadius: 10, padding: 10 }}>
                  <h3 style={{ marginTop: 0 }}>历史报告 ({data.reportTotal || 0})</h3>
                  {(data.reports || []).map((r: any) => (
                    <div key={r.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 8, marginBottom: 6 }}>
                      {r.title} / {r.user?.name || r.userId} / {r.reportType}
                      <button style={{ marginLeft: 8 }} onClick={() => deleteAnomaly('report', r.id)}>删除异常</button>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {moduleKey === 'orders' && data ? (
              <section style={{ background: '#fff', border: '1px solid #dbe2f0', borderRadius: 10, padding: 10 }}>
                {(data.items || []).map((o: any) => (
                  <div key={o.id} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 8, marginBottom: 8, background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{o.orderNo} / {o.amount} {o.currency}</strong>
                      <span style={{ color: o.status === 'PAID' ? '#166534' : '#92400e', fontSize: 12 }}>{o.status}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>用户: {o.user?.name || o.userId} | 到期: {o.user?.membershipExpiresAt || '-'}</div>
                    {o.status !== 'PAID' ? <button style={{ marginTop: 6 }} onClick={() => markOrderPaid(o.id)}>手动补单（标记已支付）</button> : null}
                  </div>
                ))}
              </section>
            ) : null}

            {moduleKey === 'ai' && data ? (
              <section style={{ background: '#fff', border: '1px solid #dbe2f0', borderRadius: 10, padding: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
                  <MetricCard title="模型" value={data.config?.model || '-'} color="#2563eb" />
                  <MetricCard title="fallback" value={String(Boolean(data.config?.fallbackEnabled))} color="#16a34a" />
                  <MetricCard title="调用次数" value={data.stats?.calls ?? 0} color="#9333ea" />
                  <MetricCard title="累计成本" value={data.stats?.cost ?? 0} color="#ea580c" />
                </div>
                <button style={{ marginTop: 8 }} onClick={saveAiConfig}>编辑 AI 配置</button>
                <pre style={{ marginTop: 8, background: '#0b1020', color: '#e5e7eb', borderRadius: 8, padding: 8, whiteSpace: 'pre-wrap' }}>{pretty(data.config)}</pre>
              </section>
            ) : null}

            {moduleKey === 'logs' && data ? (
              <section style={{ display: 'grid', gap: 10 }}>
                <pre style={{ margin: 0, background: '#0b1020', color: '#e5e7eb', borderRadius: 8, padding: 8, whiteSpace: 'pre-wrap' }}>{pretty(data.operationLogs || [])}</pre>
                <pre style={{ margin: 0, background: '#0b1020', color: '#e5e7eb', borderRadius: 8, padding: 8, whiteSpace: 'pre-wrap' }}>{pretty(data.aiErrors || [])}</pre>
                <pre style={{ margin: 0, background: '#0b1020', color: '#e5e7eb', borderRadius: 8, padding: 8, whiteSpace: 'pre-wrap' }}>{pretty(data.paymentCallbackLogs || [])}</pre>
              </section>
            ) : null}
          </>
        ) : null}
      </section>
    </main>
  );
}

function MetricCard({ title, value, color }: { title: string; value: string | number; color: string }) {
  return (
    <div style={{ background: '#fff', border: `1px solid ${color}33`, borderLeft: `4px solid ${color}`, borderRadius: 10, padding: 10 }}>
      <div style={{ fontSize: 13, color: '#64748b' }}>{title}</div>
      <div style={{ marginTop: 4, fontSize: 24, fontWeight: 800, color: '#0f172a' }}>{value}</div>
    </div>
  );
}

