import { Outlet } from 'react-router-dom'; 
import Sidebar from '../components/frame/sidebar';

function MainLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-grow p-6 bg-gray-300">
        {/* Dashboard dll from route */}
        <Outlet /> 
      </main>
    </div>
  );
}

export default MainLayout;
