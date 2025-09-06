import React from 'react';
import { LayoutDashboard, Table, Settings } from 'lucide-react';

function Sidebar() {
  return (

    <div className='h-screen w-64 bg-[#263d3a] text-white flex flex-col'>
        
        {/* Header dari si sidebar */}
        <div className='p-4 mb-4 border-b bg-[#263d3a]'>
            <h3 className='text-2xl font-bold text-center'>Header</h3>
        </div>

        {/* Menu */}
        <nav className='flex-grow px-2'>
            <ul className='space-y-2'>
                {/* Item Menu 1: Dashboard */}
                <li>
                    <a href="#" className='flex items-center gap-3 p-3 rounded-lg text-gray-200 hover:bg-green-700 hover:text-white transition-colors duration-200'>
                        <LayoutDashboard size={20} />
                        <span>Dashboard</span>
                    </a>
                </li>

                {/* Item Menu 2: Early Warning */}
                <li>
                    <a href="#" className='flex items-center gap-3 p-3 rounded-lg text-gray-200 hover:bg-green-700 hover:text-white transition-colors duration-200'>
                        <Table size={20} />
                        <span>Early Warning</span>
                    </a>
                </li>
                
                {/* Item Menu 3: Budget */}
                <li>
                    <a href="#" className='flex items-center gap-3 p-3 rounded-lg text-gray-200 hover:bg-green-700 hover:text-white transition-colors duration-200'>
                        <Settings size={20} />
                        <span>Budget Targeting</span>
                    </a>
                </li>
            </ul>
        </nav>

    </div>
  )
}

export default Sidebar;