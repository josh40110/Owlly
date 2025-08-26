import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import * as React from 'react';
import Box
 from '@mui/material/Box';
const top100Films = [
  { label: 'The Shawshank Redemption', year: 1994 },
  { label: 'The Godfather', year: 1972 },
  { label: 'The Dark Knight', year: 2008 },
];

//Autocomplete由params產生，並需要TextField才能正常運作
export default function SearchBox() {
  return (
        <Autocomplete
        disablePortal
        options={top100Films}
        sx={{ width: 600 }}  // 從 300 增加到 600
        renderInput={(params) => 
        <TextField 
          {...params} 
          label="股票代碼/股票名稱"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#000000',  // 黑色背景
              '& fieldset': {
                borderColor: '#ffffff',  // 白色邊框
              },
              '&:hover fieldset': {
                borderColor: '#ffffff',  // hover 時保持白色邊框
              },
              '&.Mui-focused fieldset': {
                borderColor: '#ffffff',  // 聚焦時保持白色邊框
              },
            },
            '& .MuiInputLabel-root': {
              color: '#ffffff',  // 標籤文字顏色為白色
              '&.Mui-focused': {
                color: '#ffffff',  // 聚焦時標籤保持白色
              },
              '&.MuiFormLabel-filled': {
                color: '#ffffff',  // 有內容時標籤保持白色
              },
            },
            '& .MuiInputBase-input': {
              color: '#ffffff',  // 輸入文字顏色為白色
            },
          }}
        />}
/>
  );
}
