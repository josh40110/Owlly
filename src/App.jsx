import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import AppLayout from './container/AppLayout'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './container/HomePage';
import OwnedStock from './container/OwnedStock';
function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/owned-stock" element={<OwnedStock />} /> {/* 添加這行 */}
      </Route>
    </Routes>
  </Router>

  )
}

export default App
