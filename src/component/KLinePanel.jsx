import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

// 離線後備：2330 2025/02（取自 TWSE 網頁資料，僅供開發時無法連線時 fallback）
const OFFLINE_2330_202502 = {
  stat: 'OK',
  date: '20250201',
  title: '114年02月 2330 台積電 各日成交資訊',
  fields: [
    '日期','成交股數','成交金額','開盤價','最高價','最低價','收盤價','漲跌價差','成交筆數'
  ],
  data: [
    ['114/02/03','113,031,525','120,769,676,393','1,065.00','1,075.00','1,060.00','1,070.00','-65.00','247,531'],
    ['114/02/04','57,904,652','63,132,252,012','1,085.00','1,100.00','1,080.00','1,095.00','+25.00','59,315'],
    ['114/02/05','43,082,532','47,931,709,801','1,110.00','1,120.00','1,105.00','1,110.00','+15.00','51,245'],
    ['114/02/06','33,768,196','37,638,807,097','1,120.00','1,120.00','1,105.00','1,115.00','+5.00','32,994'],
    ['114/02/07','31,107,545','34,745,052,940','1,110.00','1,125.00','1,105.00','1,125.00','+10.00','35,637'],
    ['114/02/10','31,037,109','34,425,517,969','1,125.00','1,125.00','1,095.00','1,105.00','-20.00','60,839'],
    ['114/02/11','21,023,057','23,294,288,731','1,110.00','1,115.00','1,100.00','1,110.00','+5.00','31,837'],
    ['114/02/12','26,190,392','28,966,591,975','1,110.00','1,115.00','1,100.00','1,100.00','-10.00','38,511'],
    ['114/02/13','35,681,521','38,806,197,999','1,090.00','1,095.00','1,080.00','1,090.00','-10.00','72,456'],
    ['114/02/14','73,417,323','78,100,130,074','1,065.00','1,070.00','1,060.00','1,060.00','-30.00','218,986'],
    ['114/02/17','37,215,861','40,057,489,554','1,065.00','1,085.00','1,065.00','1,085.00','+25.00','57,081'],
    ['114/02/18','24,018,940','26,204,727,000','1,085.00','1,100.00','1,080.00','1,100.00','+15.00','30,650'],
    ['114/02/19','28,756,849','31,328,641,002','1,090.00','1,095.00','1,085.00','1,090.00','-10.00','33,952'],
    ['114/02/20','31,108,197','33,537,160,793','1,080.00','1,085.00','1,070.00','1,080.00','-10.00','43,395'],
    ['114/02/21','31,480,715','34,322,859,039','1,085.00','1,095.00','1,080.00','1,095.00','+15.00','29,895'],
    ['114/02/24','33,837,606','36,461,265,148','1,080.00','1,085.00','1,075.00','1,075.00','-20.00','47,924'],
    ['114/02/25','53,174,277','56,084,293,935','1,055.00','1,060.00','1,050.00','1,055.00','-20.00','178,967'],
    ['114/02/26','42,921,499','45,208,281,264','1,045.00','1,060.00','1,045.00','1,060.00','+5.00','75,535'],
    ['114/02/27','61,646,900','64,595,715,596','1,065.00','1,065.00','1,040.00','1,040.00','-20.00','121,377'],
  ],
};

// 以 TWSE STOCK_DAY API 拉取 2330 二月資料 → 儲存 localStorage → 畫 K 線
// 儲存鍵：twse:<stockNo>:<YYYY-MM>
export default function KLinePanel({
  title = '2330 台積電（2025/02 K 線）',
  stockNo = '2330',
  yyyymm = '202502',
}) {
  const [candles, setCandles] = React.useState([]); // {date, o,h,l,c, vol}
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState('');
  const [dims, setDims] = React.useState({ w: 800, h: 320 });
  const wrapRef = React.useRef(null);

  const storageKey = `twse:${stockNo}:${yyyymm.slice(0,4)}-${yyyymm.slice(4,6)}`;

  // 將 TWSE 格式轉為蠟燭資料
  const normalize = React.useCallback((payload) => {
    if (!payload || !Array.isArray(payload.data)) return [];
    // fields: ["日期","成交股數","成交金額","開盤價","最高價","最低價","收盤價","漲跌價差","成交筆數"]
    return payload.data.map((row) => {
      const [dateStr, , , open, high, low, close] = row;
      const d = dateStr.replace(/\//g, '-'); // 114/02/03 → 114-02-03（民國年，但只作為標籤顯示）
      const num = (s) => Number(String(s).replace(/[, ]/g, ''));
      return {
        date: d,
        o: num(open),
        h: num(high),
        l: num(low),
        c: num(close),
      };
    }).filter(c => [c.o,c.h,c.l,c.c].every(v => Number.isFinite(v)));
  }, []);

  const fetchAndStore = React.useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      const dateParam = `${yyyymm}01`;
      // 依序嘗試多個來源：openapi 代理 → www 代理 → 直連 www
      const tryUrls = [
        `/twse/api/v1/exchangeReport/STOCK_DAY?response=json&date=${dateParam}&stockNo=${stockNo}`,
        `/twse_www/exchangeReport/STOCK_DAY?response=json&date=${dateParam}&stockNo=${stockNo}`,
        `https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=${dateParam}&stockNo=${stockNo}`,
      ];

      let lastError = null;
      for (const u of tryUrls) {
        try {
          const r = await fetch(u, { cache: 'no-store', headers: { 'Cache-Control': 'no-cache' } });
          if (!r.ok) {
            const txt = await r.text().catch(() => '');
            throw new Error(`HTTP ${r.status} on ${u}${txt ? ` | ${txt.slice(0,128)}...` : ''}`);
          }
          const json = await r.json();
          const rows = normalize(json);
          if (!rows.length) throw new Error(`回傳資料為空 on ${u}`);
          setCandles(rows);
          localStorage.setItem(storageKey, JSON.stringify({ ts: Date.now(), rows }));
          setLoading(false);
          return;
        } catch (e) {
          lastError = e;
        }
      }
      // 全部來源失敗：若是指定 2330 / 202502，套用離線後備資料
      if (stockNo === '2330' && yyyymm === '202502') {
        const rows = normalize(OFFLINE_2330_202502);
        if (rows.length) {
          setCandles(rows);
          localStorage.setItem(storageKey, JSON.stringify({ ts: Date.now(), rows, offline: true }));
          setLoading(false);
          return;
        }
      }
      throw lastError ?? new Error('未知錯誤');
    } catch (e) {
      console.error(e);
      // 網路層級錯誤（如 CORS/TLS）統一顯示簡訊息
      const msg = (e && typeof e.message === 'string') ? e.message : String(e);
      setErr(msg.includes('Failed to fetch') ? '網路或 CORS 失敗（已嘗試多來源）' : msg);
    } finally {
      setLoading(false);
    }
  }, [normalize, stockNo, yyyymm, storageKey]);

  // 初始化：先讀 localStorage，沒有再抓
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.rows?.length) {
          setCandles(parsed.rows);
          setLoading(false);
          return;
        }
      }
    } catch (_) {}
    fetchAndStore();
  }, [fetchAndStore, storageKey]);

  // 監聽容器大小（簡化版）
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setDims({ w: Math.max(320, rect.width - 32), h: Math.max(220, rect.height - 32) }); // 留內距
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // 顏色：紅漲綠跌（台股慣例）
  const upColor = '#ef4444';  // 漲
  const dnColor = '#16a34a';  // 跌

  // 繪圖尺度
  const padding = { top: 12, right: 24, bottom: 24, left: 48 };
  const chartW = Math.max(100, dims.w - padding.left - padding.right);
  const chartH = Math.max(100, dims.h - padding.top - padding.bottom);

  const highs = candles.map(c => c.h);
  const lows = candles.map(c => c.l);
  const yMax = highs.length ? Math.max(...highs) : 1;
  const yMin = lows.length ? Math.min(...lows) : 0;
  const yRange = yMax - yMin || 1;

  const scaleX = (i) => {
    if (candles.length <= 1) return padding.left + chartW / 2;
    return padding.left + (i / (candles.length - 1)) * chartW;
  };
  const scaleY = (v) => padding.top + (1 - (v - yMin) / yRange) * chartH;

  const cw = Math.max(3, Math.min(20, chartW / Math.max(1, candles.length) * 0.6));

  const last = candles[candles.length - 1];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(148,163,184,0.12)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <Typography sx={{ color: '#e5e7eb', fontSize: 16, fontWeight: 600 }}>
          {title}
        </Typography>
        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
          <Button size="small" variant="outlined" onClick={fetchAndStore}>重抓</Button>
        </Box>
      </Box>

      <Box ref={wrapRef} sx={{ flex: 1, position: 'relative', p: 2 }}>
        {loading && <Typography sx={{ color:'#94a3b8', p:1 }}>載入中…</Typography>}
        {err && !loading && <Typography sx={{ color:'#f87171', p:1 }}>讀取失敗：{err}</Typography>}
        {!loading && !err && candles.length === 0 && (
          <Typography sx={{ color:'#94a3b8', p:1 }}>無資料</Typography>
        )}

        {!loading && !err && candles.length > 0 && (
          <svg width={dims.w} height={dims.h} style={{ display: 'block' }}>
            {/* y 軸刻度 */}
            {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
              const v = yMin + t * (yRange);
              const y = scaleY(v);
              return (
                <g key={i}>
                  <line x1={padding.left} y1={y} x2={padding.left + chartW} y2={y} stroke="rgba(148,163,184,0.15)" />
                  <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#94a3b8">
                    {v.toFixed(0)}
                  </text>
                </g>
              );
            })}

            {/* 蠟燭 */}
            {candles.map((c, i) => {
              const x = scaleX(i);
              const yO = scaleY(c.o);
              const yC = scaleY(c.c);
              const yH = scaleY(c.h);
              const yL = scaleY(c.l);
              const up = c.c >= c.o;
              const color = up ? upColor : dnColor;
              const bodyTop = Math.min(yO, yC);
              const bodyH = Math.max(2, Math.abs(yC - yO));
              return (
                <g key={i}>
                  {/* 影線 */}
                  <line x1={x} y1={yH} x2={x} y2={yL} stroke={color} strokeWidth="1" />
                  {/* 實體 */}
                  <rect x={x - cw / 2} y={bodyTop} width={cw} height={bodyH} fill={color} />
                </g>
              );
            })}

            {/* x 軸日期（每 4 根顯示一次） */}
            {candles.map((c, i) => {
              if (i % 4 !== 0) return null;
              const x = scaleX(i);
              return (
                <text key={i} x={x} y={padding.top + chartH + 16} textAnchor="middle" fontSize="11" fill="#94a3b8">
                  {c.date.slice(3)}{/* 顯示 02-03 之類 */}
                </text>
              );
            })}
          </svg>
        )}

        {/* 資訊欄 */}
        {last && (
          <Box sx={{ position:'absolute', right: 16, top: 12, bgcolor:'rgba(0,0,0,0.45)', border:'1px solid rgba(148,163,184,0.25)', borderRadius:1, px:1, py:0.5 }}>
            <Typography sx={{ color:'#e5e7eb', fontSize:12 }}>
              最近收盤：<b style={{ color: last.c >= last.o ? '#ef4444' : '#16a34a' }}>{last.c.toLocaleString()}</b>
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}