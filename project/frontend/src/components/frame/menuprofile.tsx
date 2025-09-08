
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Settings,
  LogOut,
  CheckCircle2,
  Circle,
  PlusCircle,
  ChevronRight,
} from "lucide-react";

// Data dummy utk acc
const accounts = [
  {
    id: "acc1",
    name: "Pasific Lines 2",
    avatar: "https://i.pravatar.cc/40?u=1",
  },
  {
    id: "acc2",
    name: "Pasific Lines 3",
    avatar: "https://i.pravatar.cc/40?u=2",
  },
];

function MenuProfile() {

  const [selectedAccountId, setSelectedAccountId] = useState("acc1");

   const navigate = useNavigate()

   const handleNavigate = () => {
    navigate("/login"); 
  };

  return (
    <div className="w-72 bg-white rounded-xl shadow-lg border overflow-hidden font-sans">
      {/* Settings Part */ }
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
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100">
          <Settings className="w-5 h-5 text-gray-600" />
          <span className="flex-1 text-left text-sm font-medium text-gray-800">
            Account Settings
          </span>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      <hr />

      {/* Accounts Part  */}
      <div className="p-2">
        <div className="px-3 pt-2 text-xs uppercase text-gray-500 font-semibold">
          Accounts
        </div>
        
        {/* Looping data akun -> ntr get semua akun yang di save atau di add */}
        {accounts.map((account) => (
          <button
            key={account.id}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100"
            onClick={() => setSelectedAccountId(account.id)}
          >
            <img
              src={account.avatar}
              alt={account.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="flex-1 text-left text-sm font-medium text-gray-800">
              {account.name}
            </span>
            
            {/* Logika untuk menampilkan ikon berdasarkan state */}
            {selectedAccountId === account.id ? (
              // check icon (selected)
              <CheckCircle2
                className="w-5 h-5 text-white"
                fill="#16a34a" 
              />
            ) : (
              // (kalo ga terselect)
              <Circle className="w-5 h-5 text-gray-300" />
            )}
          </button>
        ))}

        <div className="px-3 pt-2">
          <button onClick={handleNavigate} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-gray-300 hover:bg-gray-100">
            <PlusCircle className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Add New Accounts
            </span>
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="p-3">
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default MenuProfile;