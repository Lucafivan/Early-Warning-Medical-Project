import { Link } from 'react-router-dom'; 
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { LayoutDashboard, Table, Target, Star, LogOut } from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if ((location.state as { keepSidebarOpen?: boolean } | null)?.keepSidebarOpen) {
        setExpanded(true);
    }
  }, [location.state]);

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`transition-all duration-300 ease-in-out ${expanded ? "w-60" : "w-16"}
                 flex flex-col gap-4 bg-[#16332f] text-gray-100 p-4 overflow-hidden h-screen`}
    >
      {/* UBAH BAGIAN INI: 
        Tambahkan `flex-grow` agar elemen ini mengisi ruang yang tersedia, 
        dan `overflow-y-auto` agar bisa scroll jika kontennya panjang.
      */}
      <nav className="flex flex-col gap-2 flex-grow overflow-y-auto">
        <Link
          to="/dashboard"
          state={{ keepSidebarOpen: true }}
          className={`flex items-center ${expanded ? "justify-start" : "justify-center"} gap-3 px-3 py-2 rounded-xl bg-[#3a9542] text-white`}
        >
          <LayoutDashboard size={20} />
          <span className={expanded ? "inline" : "hidden"}>Dashboard</span>
        </Link>

        {/* ... item Link lainnya tetap sama ... */}
        <Link
          to="/early-monitoring"
          state={{ keepSidebarOpen: true }}
          className={`flex items-center ${expanded ? "justify-start" : "justify-center"} gap-3 px-3 py-2 rounded-xl hover:bg-[#3a9542] text-white`}
        >
          <Table size={20} />
          <span className={expanded ? "inline" : "hidden"}>Early Monitoring</span>
        </Link>

        <Link
          to="/budget-targeting"
          state={{ keepSidebarOpen: true }}
          className={`flex items-center ${expanded ? "justify-start" : "justify-center"} gap-3 px-3 py-2 rounded-xl hover:bg-[#3a9542] text-white`}
        >
          <Target size={20} />
          <span className={expanded ? "inline" : "hidden"}>Budget Targeting</span>
        </Link>

        {Array.from({ length: 5 }).map((_, i) => (
          <Link 
            key={i}
            to={`/nav-item-${i}`}
            state={{ keepSidebarOpen: true }}
            className={`flex items-center ${expanded ? "justify-start" : "justify-center"} gap-3 px-3 py-2 rounded-xl hover:bg-[#3a9542] text-white`}
          >
            <Star size={20} />
            <span className={expanded ? "inline" : "hidden"}>Nav Item</span>
          </Link>
        ))}

        {/* Tombol ini sekarang akan selalu terlihat di bawah */}
      <button
        onClick={() => navigate("/login")}
        className={`mt-auto flex items-center ${expanded ? "justify-start" : "justify-center"}
                   gap-2 rounded-xl px-4 py-2 font-semibold bg-red-500 text-white hover:brightness-95 mb-24`}
      >
        <LogOut size={20} />
        <span className={expanded ? "inline" : "hidden"}>Logout</span>
      </button>
      </nav>

      
    </aside>
  );
}

export default Sidebar;