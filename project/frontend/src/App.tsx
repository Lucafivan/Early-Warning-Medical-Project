import './App.css'
import { useNavigate } from 'react-router-dom'

function App() {
  const navigate = useNavigate();

  return (
    <div className="flex gap-4 p-4">
      <button
        onClick={() => navigate('/login')}
      >
        Login
      </button>
      <button
        onClick={() => navigate('/dashboard')}
      >
        Dashboard
      </button>
      <button

        onClick={() => navigate('/register')}
      >
        Register
      </button>
    </div>
  )
}

export default App
