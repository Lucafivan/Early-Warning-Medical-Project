import { Outlet } from 'react-router-dom';
import Sidebar from '../components/frame/sidebar';
import Navbar from '../components/frame/navbar';

function MainLayout() {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
}

export default MainLayout;