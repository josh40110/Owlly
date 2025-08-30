import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useState } from 'react'; // 新增於 useState 群組附近

// 產生 30 天假資料（簡易隨機漫步）
export function generateMockSeries(points = 30, start = 100, volatility = 0.025) {
  const series = [];
  let value = start;
  for (let i = 0; i < points; i++) {
    const change = (Math.random() * 2 - 1) * volatility; // -v ~ +v 百分比變動
    value = Math.max(0, value * (1 + change));
    series.push(Number(value.toFixed(2)));
  }
  return series;
}

export default function Sparkline({
  data = [],
  width = 316,
  height = 64,
  stroke = '#22c55e',
  fill = 'rgba(34,197,94,0.15)',
  strokeWidth = 2,
  showDot = true,
  onHover,
}) {
  const svgRef = React.useRef(null);
  const [tooltip, setTooltip] = React.useState(null);
  const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });
  const [popup, setPopup] = useState(null); // { x, y, value, pct, chg, up }

  const min = data.length ? Math.min(...data) : 0;
  const max = data.length ? Math.max(...data) : 0;
  const padX = 8;
  const padY = 6;
  const w = width - padX * 2;
  const h = height - padY * 2;

  const scaleX = (i) => (data.length <= 1 ? padX : (i / (data.length - 1)) * w + padX);
  const scaleY = (v) => {
    if (!data.length || max === min) return height / 2;
    return height - padY - ((v - min) / (max - min)) * h;
  };

  const points = data.map((v, i) => `${scaleX(i)},${scaleY(v)}`).join(' ');
  const d = points ? `M ${points.replace(/ /g, ' L ')}` : '';
  const dArea = points
    ? `${d} L ${scaleX(data.length - 1)},${height - padY} L ${scaleX(0)},${height - padY} Z`
    : '';

  const lastX = scaleX(Math.max(0, data.length - 1));
  const lastY = scaleY(data[data.length - 1] ?? 0);

  const handleMouseMove = (e) => {
    if (!data.length || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - padX;
    const idx = Math.max(0, Math.min(data.length - 1, Math.round((x / w) * (data.length - 1))));
    const value = data[idx];
    const tooltipData = { index: idx, value, x: scaleX(idx), y: scaleY(value) };
    
    setTooltip(tooltipData);
    setMousePos({ x: e.clientX, y: e.clientY });
    if (onHover) onHover(tooltipData);
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  // 生成日期標籤（從 30 天前到今天）
  const getDateLabel = (index) => {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() - (data.length - 1 - index));
    return targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ display: 'block' }}
      >
        {dArea && <path d={dArea} fill={fill} stroke="none" />}
        {d && (
          <path
            d={d}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {showDot && data.length > 0 && (
          <circle cx={lastX} cy={lastY} r="4" fill={stroke} stroke="#0f172a" strokeWidth="2" />
        )}
        {/* 懸停點 - 變大 */}
        {tooltip && (
          <circle
            cx={tooltip.x}
            cy={tooltip.y}
            r="6"
            fill={stroke}
            stroke="#0f172a"
            strokeWidth="2"
          />
        )}
      </svg>
      
      {/* 自訂 Tooltip - 定位到滑鼠右下角 */}
      {tooltip && (
        <Box
          sx={{
            position: 'fixed',
            left: mousePos.x + 10,
            top: mousePos.y + 10,
            bgcolor: '#374151',
            borderRadius: 1.5,
            px: 2,
            py: 1.5,
            boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
            border: '1px solid rgba(75,85,99,0.3)',
            zIndex: 1000,
            pointerEvents: 'none',
            minWidth: 80,
          }}
        >
          <Typography sx={{ color: '#f9fafb', fontSize: 13, fontWeight: 600, mb: 1, lineHeight: 1 }}>
            {getDateLabel(tooltip.index)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 14,
                height: 3,
                bgcolor: stroke,
                borderRadius: 0.5,
              }}
            />
            <Typography sx={{ color: '#f9fafb', fontSize: 13, fontWeight: 500 }}>
              {tooltip.value.toLocaleString()}
            </Typography>
          </Box>
        </Box>
      )}

      {/* 懸浮視窗：點擊卡片出現，點外面區域關閉 */}
      {popup && (
        <>
          {/* 背景遮罩（點擊關閉） */}
          <Box
            onClick={() => setPopup(null)}
            sx={{ position: 'fixed', inset: 0, zIndex: 1100 }}
          />
          {/* 浮層本體（跟隨點擊位置，在游標右下角） */}
          <Box
            sx={{
              position: 'fixed',
              left: Math.min(popup.x, window.innerWidth - 260),
              top: Math.min(popup.y, window.innerHeight - 140),
              zIndex: 1200,
              bgcolor: '#111827',
              borderRadius: 2,
              boxShadow: '0 12px 30px rgba(0,0,0,0.45)',
              border: '1px solid rgba(75,85,99,0.4)',
              p: 2,
              minWidth: 220
            }}
          >
            <Typography sx={{ color: '#e5e7eb', fontSize: 14, fontWeight: 600, mb: 1 }}>
              加權指數（點擊資訊）
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography sx={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>
                {popup.value?.toLocaleString()}
              </Typography>
              <Box
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  color: popup.up ? '#ef4444' : '#16a34a',
                  bgcolor: popup.up ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)'
                }}
              >
                {popup.up ? `+${popup.pct ?? 0}%` : `${popup.pct ?? 0}%`}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 14, height: 3, bgcolor: popup.up ? '#ef4444' : '#16a34a', borderRadius: 0.5 }} />
              <Typography sx={{ color: popup.up ? '#ef4444' : '#16a34a', fontSize: 14 }}>
                {popup.up ? '▲' : '▼'} {popup.chg ?? '-'}（{popup.pct}%）
              </Typography>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}


