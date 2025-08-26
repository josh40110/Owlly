import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
// ... 其他 imports

export default function SideBar() {
  return (
    <Box>
      {/* 您的側邊欄內容 */}
      <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
        {/* 首頁連結 */}
      </Link>
      <Link to="/about" style={{ textDecoration: 'none', color: 'inherit' }}>
        {/* 關於頁面連結 */}
      </Link>
    </Box>
  );
}