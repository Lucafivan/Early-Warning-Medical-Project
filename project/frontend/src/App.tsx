import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import EarlyMonitoringPage from './pages/EarlyMonitoringPage';
import BudgetTargetingPage from './pages/BudgetTargetingPage';


function App() {

  return (

    <Router>
      <Routes>
        <Route path='/' element={<RegisterPage/>}/>
        <Route path='/login' element={<LoginPage/>}/>
        <Route path='/dashboard' element={<DashboardPage/>}/>
        <Route path='/early-monitoring' element={<EarlyMonitoringPage/>}/>
        <Route path='/budget-targeting' element={<BudgetTargetingPage/>}/>
      </Routes>
    </Router>
  )
}

export default App