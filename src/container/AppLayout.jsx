import * as React from 'react';
import Box from '@mui/material/Box';
import SideBar from '../component/sidebar'
import SearchBox from '../component/searchbox'
import Typography from '@mui/material/Typography';
import HomePage from './HomePage';
import { Outlet } from 'react-router-dom'; 
/*p padding
m margin
display:'flex' 預設水平
flexWrap: 'wrap' 擠不下換行
*/
export default function AppLayout() {
  return (
    <Box sx={{
      height: '100vh',  // 強制設定為視窗高度
      width: '100vw',   // 強制設定為視窗寬度
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'  // 防止出現滾動條
    }}>
      <Box sx={{ 
        minHeight: '5vh',
        width: '100%', 
        m: 0, 
        p: 0,
        pb: 1, 
        pt: 1.5, 
        bgcolor: '#171821', 
        display: 'flex',
        justifyContent: 'center'
      }}>
        <SearchBox />
      </Box>
      <Box sx={{
        display: 'flex', 
        flex: 1,  // 佔滿剩餘空間
        minHeight: 0,  // 允許收縮
        height: 'calc(100vh - 5vh)'  // 明確計算剩餘高度
      }}>
        <Box sx={{ 
          width: '260px',  // 從 255px 增加到 355px (+100px)
          height: '100%'   // 填滿父容器高度
        }}>
          <SideBar />
        </Box>
        <Box sx={{ 
          flex: 1,  // 佔滿剩餘空間
          pt: 2,
          bgcolor:'#192645'
        }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

