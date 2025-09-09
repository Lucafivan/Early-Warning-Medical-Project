import { useNavigate } from "react-router-dom";
import {
  Bell,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";

import {useAuth} from "../../contexts/AuthContext"
import toast from "react-hot-toast";

import { useUI } from "../../contexts/UIcontext";


function MenuProfile() {
  const navigate = useNavigate();
  const { openAccountSettingsModal } = useUI();

  const {logout} = useAuth();

    const handleLogout = async () => {
    try {

      logout();
      navigate("/login");
      toast.dismiss();
      toast.success('Logout success');
      
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="w-72 bg-white rounded-xl shadow-lg border overflow-hidden font-sans">
      {/* Settings Part */}
      <div className="p-2">
        <div className="px-3 pt-2 text-xs uppercase text-gray-500 font-semibold">
          Settings
        </div>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="flex-1 text-left text-sm font-medium text-gray-800">
            Notification
          </span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

         <button
          onClick={openAccountSettingsModal}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100"
        >
          <Settings className="w-5 h-5 text-gray-600" />
          <span className="flex-1 text-left text-sm font-medium text-gray-800">
            Account Settings
          </span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>
      

      {/* Bagian Accounts, daftar akun, dan tombol Add New Accounts sudah dihapus */}

      {/* Logout */}
      <div className="p-3 border-t mt-2"> {/* Menambahkan border-t untuk pemisah visual */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default MenuProfile;