import { Link } from 'react-router-dom'; 
import { LayoutDashboard, Table, Settings } from 'lucide-react';

function Sidebar() {
  return (
    <div className='h-screen w-64 bg-[#263d3a] text-white flex flex-col'>
      {/* Header*/}
      <div className='p-4 mb-4 border-b bg-[#263d3a]'>
        <h3 className='text-2xl font-bold text-center'>Header</h3>
      </div>

      <nav className='flex-grow px-2'>

        <ul className='space-y-2'>
          <li>
            {/* Menu 1 : Dashboard */}
            <Link to="/dashboard" className='flex items-center gap-3 p-3 rounded-lg text-gray-200 hover:bg-green-700 hover:text-white transition-colors duration-200'>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
          </li>
          <li>
            {/* Menu 2 : EarlyWarning */}
            <Link to="/earlywarning" className='flex items-center gap-3 p-3 rounded-lg text-gray-200 hover:bg-green-700 hover:text-white transition-colors duration-200'>
              <Table size={20} />
              <span>Early Warning</span>
            </Link>
          </li>
          <li>
            {/* Menu 1 : TargetBudgeting */}
            <Link to="/budgettargeting" className='flex items-center gap-3 p-3 rounded-lg text-gray-200 hover:bg-green-700 hover:text-white transition-colors duration-200'>
              <Settings size={20} />
              <span>Budget Targeting</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;