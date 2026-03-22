import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import RoomList from './pages/RoomList'
import RoomDetail from './pages/RoomDetail'
import NotFound from './pages/NotFound'  

function App() {
  return (
    <div className="min-h-screen bg-dark-bg">
      <Routes>
        <Route path="/" element={<RoomList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/room/:id" element={<RoomDetail />} />
        <Route path="*" element={<NotFound />} /> 
      </Routes>
    </div>
  )
}

export default App