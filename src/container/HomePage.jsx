import * as React from 'react';
import Box from '@mui/material/Box';
import CustomizedList from '../component/sidebar'
import SearchBox from '../component/searchbox'
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import { useEffect, useState } from "react";



export default function HomePage() {
  const [value, setValue] = useState(null);
  const [pct, setPct] = useState(null);
  const [chg, setChg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");


  useEffect(() => {
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
    <Box sx={{ 
      m: 0, 
      p: 0  // 加上 padding
    }}>
      <Box sx={{
          height: '30vh',  // 強制設定為視窗高度
          display:'flex',
          alignItems: 'flex-start', //垂直方向
          justifyContent: 'flex-start', //水平方向
          pl:3
      }}>
       <Card sx={{ minWidth: '20vh',height: '20vh',bgcolor: '#2a2f45'}}>
      <CardContent>
        <Typography gutterBottom sx={{ fontSize: 15 }}>
        TSE
        </Typography>
        <Typography sx={{ color: '#ffffff' ,fontSize:20,pb:1}}>加權指數</Typography>
        <Typography sx={{ color: '#ff0000',fontSize:20,pb:1}}>{value}</Typography>
        <Typography sx={{color: up?'#ef4444':'#22c55e',fontSize:17}}variant="body2">
        {up ? "▲" : "▼"} {chg ?? "-"} ({pct}%)
        </Typography>

      </CardContent>
    </Card>

      </Box>

    </Box>
  );
}