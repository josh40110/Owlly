// React 與 hooks（提供元件與狀態/位置存取）
import * as React from 'react';
import Box from '@mui/material/Box';
// MUI 主題與常用結構元件
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
// 側邊欄所用到的圖示（僅示意，您可依需要調整）
import Home from '@mui/icons-material/Home';
import Settings from '@mui/icons-material/Settings';
import People from '@mui/icons-material/People';
import Leaderboard from '@mui/icons-material/Leaderboard';
import Assignment from '@mui/icons-material/Assignment';
import Info from '@mui/icons-material/Info';
import HelpOutline from '@mui/icons-material/HelpOutline';
// 路由：用於導頁與取得目前路徑（高亮）
import { useLocation, useNavigate } from 'react-router-dom';

// 以圖片風格重構：左側直欄、圓角高亮、分組
// 側邊欄主元件：採用分組清單與圓角高亮樣式
export default function SideBar() {
  const navigate = useNavigate();
  const location = useLocation();

  // 主要功能清單（置頂清單）
  const primaryItems = [
    { label: 'Home', icon: <Home />, path: '/' },
    { label: '自選股', icon: <People />, path: '/owned-stock' },
    { label: '選股器', icon: <Leaderboard />, path: '/stock-filter' },
    { label: '市場總覽', icon: <Assignment />, path: '/market-overview' },
  ];

  // 次要功能清單（置底清單）
  const secondaryItems = [
    { label: 'Settings', icon: <Settings />, path: '/settings' },
    { label: 'About', icon: <Info />, path: '/about' },
    { label: 'Feedback', icon: <HelpOutline />, path: '/feedback' },
  ];

  // 應用深色主題，與整體頁面背景保持一致
  const theme = createTheme({
    palette: {
      mode: 'dark',
      background: { paper: '#1a1a2e' },
    },
  });

  // 單一清單項目的渲染邏輯：
  // - 根據當前路徑高亮
  // - 點擊後以 navigate 導頁
  // - 提供 hover 與 selected 的背景樣式
  const renderItem = (item) => {
    const selected = location.pathname === item.path;
    return (
      <ListItemButton
        key={item.label}
        onClick={() => navigate(item.path)}
        sx={{
          my: 0.5,
          mx: 1,
          borderRadius: 2,
          color: 'rgba(255,255,255,0.85)',
          ...(selected
            ? { bgcolor: 'rgba(148, 163, 184, 0.35)' }
            : { '&:hover': { bgcolor: 'rgba(148, 163, 184, 0.18)' } }),
        }}
      >
        <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
          {item.icon}
        </ListItemIcon>
        <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 16 }} />
      </ListItemButton>
    );
  };

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <ThemeProvider theme={theme}>
        {/* 容器：固定寬度、滿高、與頁面深色背景一致 */}
        <Paper elevation={0} sx={{ width: '100%', height: '100%', bgcolor: '#1a1a2e' }}>
          {/* 清單主體：上方為主要功能，下方為次要功能 */}
          <List sx={{ pt: 2 }}>
            {/* 主要功能列 */}
            {primaryItems.map(renderItem)}
            {/* 分隔線（淡色） */}
            <Divider sx={{ my: 2, mx: 2, borderColor: 'rgba(255,255,255,0.08)' }} />
            {/* 次要功能列 */}
            {secondaryItems.map(renderItem)}
          </List>
        </Paper>
      </ThemeProvider>
    </Box>
  );
}