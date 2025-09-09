import { Outlet } from 'react-router-dom';
import Sidebar from '../components/frame/sidebar';
import Navbar from '../components/frame/navbar';

import AccountSettingsModal from '../components/AccountSettingsModal';
import { useUI } from '../contexts/UIcontext';

function MainLayout() {
  const { isAccountSettingsModalOpen, closeAccountSettingsModal } = useUI(); 
  

  return (
    <> {/* Gunakan Fragment agar bisa menampung modal di luar div utama */}
      <div className="flex flex-col h-screen bg-gray-100">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>

      <AccountSettingsModal
        isOpen={isAccountSettingsModalOpen}
        onClose={closeAccountSettingsModal}
      />
    </>
  );
}

export default MainLayout;