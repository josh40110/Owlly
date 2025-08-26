import * as React from 'react';
import Box from '@mui/material/Box';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import ArrowRight from '@mui/icons-material/ArrowRight';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import Home from '@mui/icons-material/Home';
import Settings from '@mui/icons-material/Settings';
import People from '@mui/icons-material/People';
import PermMedia from '@mui/icons-material/PermMedia';
import Dns from '@mui/icons-material/Dns';
import Public from '@mui/icons-material/Public';
import { Link,useNavigate } from 'react-router-dom';

//選單資料來源，搭配data.map使用
const data = [
  { icon: <People />, label: '自選股',path: '/owned-stock' },
  { icon: <Dns />, label: '選股器' },
  { icon: <PermMedia />, label: '市場總覽' }
];

/*選單樣式
- styled(List) 是使用 MUI 的 styled 函數來創建一個新的 List 組件。
- List 是 MUI 的列表組件，用於顯示項目列表。
- '& .MuiListItemButton-root' &指向自己，專門用來覆寫子樹的樣式
*/
const FireNav = styled(List)({
  '& .MuiListItemButton-root': {
    paddingLeft: 24,
    paddingRight: 24,
  },
  '& .MuiListItemIcon-root': {
    minWidth: 0,
    marginRight: 16,
  },
  '& .MuiSvgIcon-root': {
    fontSize: 20,
  },
});

export default function SideBar() {
  const [open, setOpen] = React.useState(true);
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', height:'100%'}}>
      <ThemeProvider
        theme={createTheme({
          components: {
            MuiListItemButton: {
              defaultProps: {
                disableTouchRipple: true,
              },
            },
          },
          palette: {
            mode: 'dark',
            primary: { main: 'rgb(102, 157, 246)' },
            background: { paper: '#1a1a2e' },  // 匹配新的背景色
          },
        })}
      >
        <Paper elevation={0} sx={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          bgcolor: '#1a1a2e'  // 深藍灰色背景
        }}>
          <FireNav component="nav" disablePadding sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* 固定的頂部項目 */}
            <Box>
              <ListItemButton component="a" href="#customized-list">
                <ListItemIcon sx={{ fontSize: 20 }}>🔥</ListItemIcon>
                <ListItemText
                  sx={{ my: 0 }}
                  primary="Owlly"
                  primaryTypographyProps={{
                    fontSize: 20,
                    fontWeight: 'medium',
                    letterSpacing: 0,
                  }}
                />
              </ListItemButton>
              <Divider />
              <ListItem component="div" disablePadding>
                <ListItemButton sx={{ height: 56 }}>
                  <ListItemIcon>
                    <Home color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="回到主頁面"
                    primaryTypographyProps={{
                      color: 'primary',
                      fontWeight: 'medium',
                      variant: 'body2',
                    }}
                  />
                </ListItemButton>
                <Tooltip title="Project Settings" >
                  <IconButton
                    size="large"
                    sx={{
                      '& svg': {
                        color: 'rgba(255,255,255,0.8)',
                        transition: '0.2s',
                        transform: 'translateX(0) rotate(0)',
                      },
                      '&:hover, &:focus': {
                        bgcolor: 'unset',
                        '& svg:first-of-type': {
                          transform: 'translateX(-4px) rotate(-20deg)',
                        },
                        '& svg:last-of-type': {
                          right: 0,
                          opacity: 1,
                        },
                      },
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        height: '80%',
                        display: 'block',
                        left: 0,
                        width: '1px',
                        bgcolor: 'divider',
                      },
                    }}
                  >
                    <Settings />
                    <ArrowRight sx={{ position: 'absolute', right: 4, opacity: 0 }} />
                  </IconButton>
                </Tooltip>
              </ListItem>
              <Divider />
            </Box>

            {/* 可展開的選單區域 - 填滿剩餘空間 */}
            <Box
              sx={[
                {
                  flex: 1,  // 佔滿剩餘空間
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'  // 防止超出
                },
                open
                  ? {
                      bgcolor: 'rgba(71, 98, 130, 0.2)',
                    }
                  : {
                      bgcolor: null,
                    },
              ]}
            >
              <ListItemButton
                alignItems="flex-start"
                onClick={() => setOpen(!open)}
                sx={[
                  {
                    px: 3,
                    pt: 2.5,
                    flexShrink: 0,  // 防止收縮
                    flexGrow: 0,    // 防止拉伸
                    height: 'auto'  // 保持自動高度
                  },
                  open
                    ? {
                        pb: 0,
                      }
                    : {
                        pb: 2.5,
                      },
                  open
                    ? {
                        '&:hover, &:focus': {
                          '& svg': {
                            opacity: 1,
                          },
                        },
                      }
                    : {
                        '&:hover, &:focus': {
                          '& svg': {
                            opacity: 0,
                          },
                        },
                      },
                ]}
              >
                <ListItemText
                  primary="展開頁面選單"
                  primaryTypographyProps={{
                    fontSize: 15,
                    fontWeight: 'medium',
                    lineHeight: '20px',
                    mb: '2px',
                  }}
                  secondary="自選股,   選股器,   市場總覽"
                  secondaryTypographyProps={{
                    noWrap: true,
                    fontSize: 12,
                    lineHeight: '16px',
                    color: open ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0.5)',
                  }}
                  sx={{ my: 0 }}
                />
                <KeyboardArrowDown
                  sx={[
                    {
                      mr: -1,
                      opacity: 0,
                      transition: '0.2s',
                    },
                    open
                      ? {
                          transform: 'rotate(-180deg)'
                        }
                      : {
                          transform: 'rotate(0)',
                        },
                  ]}
                />
              </ListItemButton>
              
              {/* 子選單容器 - 填滿剩餘空間 */}
              {open && (
                <Box sx={{ 
                  flex: 1,  // 佔滿剩餘空間
                  overflow: 'auto'  // 內容過多時可滾動
                }}>
                  {data.map((item) => (
                    <ListItemButton
                      key={item.label}
                      sx={{ py: 0, minHeight: 32, color: 'rgba(255,255,255,.8)' }}
                      onClick={()=>navigate(item.path)  }
                    >
                      <ListItemIcon sx={{ color: 'inherit' }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{ fontSize: 14, fontWeight: 'medium' }}
                      />
                    </ListItemButton>
                  ))}
                </Box>
              )}
            </Box>
          </FireNav>
        </Paper>
      </ThemeProvider>
    </Box>
  );
}