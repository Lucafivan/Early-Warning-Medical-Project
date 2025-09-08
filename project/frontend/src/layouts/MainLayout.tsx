import { Outlet } from 'react-router-dom';
import Sidebar from '../components/frame/sidebar';
import Navbar from '../components/frame/navbar';

function MainLayout() {
  return (
    // 1. Pembungkus utama sekarang adalah kolom (flex-col)
    <div className="flex flex-col h-screen bg-gray-100">
      
      {/* 2. Navbar menjadi item pertama, mengambil lebar penuh secara otomatis */}
      <Navbar />

      {/* 3. Area di bawah Navbar adalah baris (flex) yang mengisi sisa tinggi */}
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