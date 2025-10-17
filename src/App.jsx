import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import FAQ from './pages/FAQ'
import Community from './pages/Community'
import Profile from './pages/Profile'
import Chat from './pages/Chat'
import Post from './pages/Post'
import Admin from './pages/Admin'
import SearchPage from './pages/Search'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/faq" element={<FAQ />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="community/:id" element={<Community />} />
          <Route path="profile/:id" element={<Profile />} />
          <Route path="chat/:id" element={<Chat />} />
          <Route path="post/:id" element={<Post />} />
          <Route path="admin" element={<Admin />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
