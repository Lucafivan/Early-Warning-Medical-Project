import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'

import NotfoundPage from './pages/NotfoundPage'

import MainLayout from './layouts/MainLayout'

function App() {

  return (
    <Router>
      <Routes>
        <Route path='/' element={<LoginPage />} />
        <Route path='/register' element={<RegisterPage />} />
        

         {/* page yang pake navbar */}
        <Route element={<MainLayout />}>
          <Route path='/dashboard' element={<DashboardPage />} />
        </Route>

        <Route path='*' element={<NotfoundPage/>}/>
      </Routes>
    </Router>
  )
}

export default App