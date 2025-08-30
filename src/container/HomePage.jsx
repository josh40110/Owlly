import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useEffect, useState,useRef } from "react";
import Sparkline, { generateMockSeries } from '../component/Sparkline';
import KLinePanel from '../component/KLinePanel';



export default function HomePage() {
  const [value, setValue] = useState(null);
  const [pct, setPct] = useState(null);
  const [chg, setChg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [isMockData, setIsMockData] = useState(false); // 標記是否使用模擬資料
  const hasFetched = useRef(false);//可防止一直打API
  const [popup, setPopup] = useState(null); // { x, y, value, pct, chg, up }

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    // 使用今天的日期，格式為 YYYYMMDD
    const today = new Date();
    const dateStr = today.getFullYear().toString() + 
                   String(today.getMonth() + 1).padStart(2, '0') + 
                   String(today.getDate()).padStart(2, '0');

    // 嘗試多個 API 端點
    const tryUrls = [
      `/twse/v1/exchangeReport/MI_INDEX?response=json&type=IND&date=${dateStr}`,
      `/twse_www/exchangeReport/MI_INDEX?response=json&type=IND&date=${dateStr}`,
      `https://www.twse.com.tw/exchangeReport/MI_INDEX?response=json&type=IND&date=${dateStr}`,
    ];

    let lastError = null;
    const tryFetch = async (urlIndex = 0) => {
      if (urlIndex >= tryUrls.length) {
        // 所有 URL 都失敗，使用模擬資料
        console.log('所有 API 都失敗，使用模擬資料');
        // 生成更真實的模擬資料
        const mockValue = 21500 + Math.floor(Math.random() * 500) - 250; // 21250-21750
        const mockPct = (Math.random() * 2 - 1).toFixed(2); // -1.00 到 1.00
        const mockChg = Math.floor(mockValue * Number(mockPct) / 100);
        
        setValue(mockValue);
        setPct(Number(mockPct));
        setChg(mockChg);
        setIsMockData(true); // 標記為模擬資料
        setErr(''); // 清除錯誤狀態，讓卡片正常顯示
        setLoading(false);
        return;
      }

      try {
        const url = tryUrls[urlIndex];
        console.log(`嘗試 API: ${url}`);
        
        const r = await fetch(url, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        console.log(`API 回應狀態: ${r.status}`);
        
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}`);
        }
        
        const data = await r.json();
        console.log('API 回應資料:', data);
        
        // data 是一個陣列，找 "發行量加權股價指數"
        const row = data.find(d => d["指數"] === "發行量加權股價指數");
        if (!row) throw new Error("找不到發行量加權股價指數");
        
        // 可能是字串，先清乾淨後轉數值
        const closeStr = String(row["收盤指數"] ?? "").replace(/[, ]/g, "");
        const pctStr = String(row["漲跌百分比"] ?? "").replace(/[% ]/g, "");
        const chgStr = String(row["漲跌點數"] ?? "").replace(/[, ]/g, "");
  
        setValue(Number(closeStr));
        setPct((pctStr && !isNaN(Number(pctStr))) ? Number(pctStr) : null);
        setChg((chgStr && !isNaN(Number(chgStr))) ? Number(chgStr) : null);
        setIsMockData(false); // 標記為真實資料
        setErr(''); // 清除錯誤狀態
        setLoading(false);
      } catch (e) {
        console.error(`API ${urlIndex + 1} 失敗:`, e);
        lastError = e;
        // 嘗試下一個 URL
        tryFetch(urlIndex + 1);
      }
    };

    tryFetch();
  }, []);




  if (loading) return (
    <Box sx={{ m: 0, p: 0 }}>
      <Box sx={{
        height: '30vh',
        display:'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        pl:3
      }}>
        <Typography sx={{ color: '#94a3b8', fontSize: 16 }}>載入中…</Typography>
      </Box>
    </Box>
  );
  
  if (err) return (
    <Box sx={{ m: 0, p: 0 }}>
      <Box sx={{
        height: '30vh',
        display:'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        pl:3
      }}>
        <Typography sx={{ color: '#f87171', fontSize: 16 }}>讀取失敗：{err}</Typography>
      </Box>
    </Box>
  );



  const up = (pct ?? 0) >= 0;
  
  return (
    <Box sx={{ m: 0, p: 0 }}>
      <Box sx={{
        height: '30vh',
        display:'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        pl:3
      }}>
        <Card sx={{
          minWidth: 320,
          width: 360,
          bgcolor: '#0f172a',
          borderRadius: 3,
          boxShadow: '0 0 0 1px rgba(148,163,184,0.08), 0 8px 24px rgba(0,0,0,0.35)'
        }}
        onClick={(e)=>{
          setPopup({
            x: e.clientX + 10,
            y: e.clientY + 10,
            value,
            pct,
            chg,
            up
          });
        }}
        >
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ color: '#cbd5e1', fontSize: 14 }}>
                加權指數
                {isMockData && (
                  <Box component="span" sx={{ 
                    ml: 1, 
                    px: 0.5, 
                    py: 0.25, 
                    borderRadius: 1, 
                    fontSize: 10, 
                    bgcolor: 'rgba(251,191,36,0.2)', 
                    color: '#fbbf24',
                    fontWeight: 500
                  }}>
                    模擬
                  </Box>
                )}
              </Typography>
              <Box sx={{
                px: 1,
                py: 0.25,
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
                color: up ? '#ef4444' : '#16a34a',
                bgcolor: up ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)'
              }}>
                {up ? `+${pct ?? 0}%` : `${pct ?? 0}%`}
              </Box>
            </Box>

            <Typography sx={{ color: '#fff', fontSize: 32, fontWeight: 700, lineHeight: 1, mb: 0.5 }}>
              {value}
            </Typography>
            <Typography sx={{ color: '#94a3b8', fontSize: 13, mb: 1.5 }}>
              Last 30 days
            </Typography>

            <Sparkline
              data={generateMockSeries(30, value || 10000, 0.005)}
              width={316}
              height={64}
              stroke={up ? '#ef4444' : '#16a34a'}
              fill={up ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)'}
            />

            <Typography sx={{ color: up ? '#ef4444' : '#16a34a', fontSize: 14, mt: 1 }}>
              {up ? '▲' : '▼'} {chg ?? '-'} ({pct}%)
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 大型懸浮視窗（半屏）與遮罩 */}
      {popup && (
        <>
          <Box onClick={()=>setPopup(null)} sx={{ position:'fixed', inset:0, zIndex:1100 }} />
          <Box sx={{
            position:'fixed',
            left: Math.max(24, Math.min(popup.x, window.innerWidth - Math.floor(window.innerWidth/2) - 24)),
            top: Math.max(24, Math.min(popup.y, window.innerHeight - Math.floor(window.innerHeight/2) - 24)),
            zIndex:1200,
            width: { xs: '96vw', md: '50vw' },
            height: { xs: '60vh', md: '50vh' },
            bgcolor:'#0b1220',
            borderRadius: 3,
            boxShadow:'0 20px 60px rgba(0,0,0,0.55)',
            border:'1px solid rgba(75,85,99,0.5)',
            display:'flex',
            flexDirection:'column',
            overflow:'hidden'
          }}>
            <Box sx={{ p: 2, borderBottom:'1px solid rgba(148,163,184,0.12)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <Typography sx={{ color:'#e5e7eb', fontSize:16, fontWeight:600 }}>台股大盤指數 - 詳細資訊</Typography>
              <Typography onClick={()=>setPopup(null)} sx={{ color:'#94a3b8', cursor:'pointer' }}>✕</Typography>
            </Box>
            <Box sx={{ display:'grid', gridTemplateColumns:{ xs:'1fr', md:'2fr 1fr' }, flex:1, minHeight:0 }}>
              <Box sx={{ borderRight:{ md:'1px solid rgba(148,163,184,0.12)' }, minHeight:0 }}>
                <KLinePanel title="台股大盤（K 線圖）" />
              </Box>
              <Box sx={{ p:2, display:'flex', flexDirection:'column', gap:1.5 }}>
                <Typography sx={{ color:'#cbd5e1' }}>當前指數：<b style={{ color:'#fff' }}>{value?.toLocaleString()}</b></Typography>
                <Typography sx={{ color: up ? '#ef4444' : '#16a34a' }}>今日變化：{up ? '▲' : '▼'} {chg ?? '-'}（{pct}%）</Typography>
                <Typography sx={{ color:'#94a3b8' }}>說明：此區可放置即時成交量、均線、內外盤、期現貨價差等詳細資料。</Typography>
              </Box>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}