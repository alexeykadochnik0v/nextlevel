import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import FAQ from './pages/FAQ'
import Community from './pages/Community'
import Communities from './pages/Communities'
import Profile from './pages/Profile'
import Chat from './pages/Chat'
import Post from './pages/Post'
import Admin from './pages/Admin'
import SearchPage from './pages/Search'
import Create from './pages/Create'
import CreateCommunity from './pages/CreateCommunity'
import EditCommunity from './pages/EditCommunity'
import CreateResume from './pages/CreateResume'
import CreateVacancy from './pages/CreateVacancy'
import CreatePartnership from './pages/CreatePartnership'
import CreatePost from './pages/CreatePost'
import Vacancy from './pages/Vacancy'
import Partnership from './pages/Partnership'
import Verification from './pages/Verification'
import TermsOfService from './pages/TermsOfService'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/terms" element={<TermsOfService />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="communities" element={<Communities />} />
          <Route path="create" element={<Create />} />
          <Route path="create/community" element={<CreateCommunity />} />
          <Route path="create/resume" element={<CreateResume />} />
          <Route path="create/vacancy" element={<CreateVacancy />} />
          <Route path="create/partnership" element={<CreatePartnership />} />
          <Route path="create/post" element={<CreatePost />} />
          <Route path="community/:id/edit" element={<EditCommunity />} />
          <Route path="verification" element={<Verification />} />
          <Route path="community/:id" element={<Community />} />
          <Route path="profile/:id" element={<Profile />} />
          <Route path="chat/:id" element={<Chat />} />
          <Route path="post/:id" element={<Post />} />
          <Route path="vacancy/:id" element={<Vacancy />} />
          <Route path="partnership/:id" element={<Partnership />} />
          <Route path="admin" element={<Admin />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
