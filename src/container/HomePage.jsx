import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { useEffect, useState,useRef } from "react";
import Sparkline, { generateMockSeries } from '../component/Sparkline';



export default function HomePage() {
  const [value, setValue] = useState(null);
  const [pct, setPct] = useState(null);
  const [chg, setChg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const hasFetched = useRef(false);//可防止一直打API

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const url = "/twse/v1/exchangeReport/MI_INDEX?response=json&type=IND&date=20250826";
    fetch(url)
      .then(r => {
        console.log(r)
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
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
      })
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);




  if (loading) return <div>載入中…</div>;
  if (err) return <div>讀取失敗：{err}</div>;



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
        }}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ color: '#cbd5e1', fontSize: 14 }}>加權指數</Typography>
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
    </Box>
  );
}