import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation(); // Hook ini memberikan info URL saat ini
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if ((location.state as { keepSidebarOpen?: boolean } | null)?.keepSidebarOpen) {
      setExpanded(true);
    }
  }, [location.state]);

  // Fungsi untuk mempermudah, mengecek apakah path sedang aktif
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`transition-all duration-300 ease-in-out ${expanded ? "w-60" : "w-16"}
                  flex flex-col gap-4 bg-[#16332f] text-gray-100 p-4 overflow-hidden`}
    >
      <nav className="flex flex-col gap-2">
        {/* --- Link Dashboard --- */}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); navigate("/dashboard", { state: { keepSidebarOpen: true } }); }}
          className={`flex items-center ${expanded ? "justify-start" : "justify-center"} 
                      gap-3 px-3 py-2 rounded-xl text-white
                      ${isActive('/dashboard') ? 'bg-[#3a9542]' : 'hover:bg-[#3a9542]'}`}
        >
          <span className="text-base">★</span>
          <span className={expanded ? "inline" : "hidden"}>Dashboard</span>
        </a>

        {/* --- Link Early Monitoring --- */}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); navigate("/early-monitoring", { state: { keepSidebarOpen: true } }); }}
          className={`flex items-center ${expanded ? "justify-start" : "justify-center"} 
                      gap-3 px-3 py-2 rounded-xl text-white
                      ${isActive('/early-monitoring') ? 'bg-[#3a9542]' : 'hover:bg-[#3a9542]'}`}
        >
          <span className="text-base">★</span>
          <span className={expanded ? "inline" : "hidden"}>Early Monitoring</span>
        </a>

        {/* --- Link Budget Targeting --- */}
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); navigate("/budget-targeting", { state: { keepSidebarOpen: true } }); }}
          className={`flex items-center ${expanded ? "justify-start" : "justify-center"} 
                      gap-3 px-3 py-2 rounded-xl text-white
                      ${isActive('/budget-targeting') ? 'bg-[#3a9542]' : 'hover:bg-[#3a9542]'}`}
        >
          <span className="text-base">★</span>
          <span className={expanded ? "inline" : "hidden"}>Budget Targeting</span>
        </a>
      </nav>

      <button
        onClick={() => navigate("/login")}
        className={`mt-auto flex items-center justify-center
                    gap-3 rounded-xl px-4 py-2 font-semibold bg-red-500 text-white hover:brightness-95`}
      >
        <span className="text-base">★</span>
        <span className={expanded ? "inline" : "hidden"}>Logout</span>
      </button>
    </aside>
  );
}

export default Sidebar;