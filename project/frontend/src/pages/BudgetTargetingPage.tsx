import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import spilLogo from "../assets/spil_logo.png";

const BudgetTargetingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if ((location.state as { keepSidebarOpen?: boolean } | null)?.keepSidebarOpen) {
        setExpanded(true);
    }
  }, [location.state]);


  return (
    <div className="fixed inset-0 flex flex-col bg-gray-100 text-gray-900">
      {/* Top bar full width */}
      <header className="h-16 bg-gray-50 border-b border-gray-200 px-4 flex items-center justify-between">
        {/* Logo kiri */}
        <div className="flex items-center h-full">
          <img src={spilLogo} alt="SPIL Logo" className="h-10 object-contain ml-5" />
        </div>

        {/* User info kanan */}
        <div className="flex items-center gap-3">
          <img src="https://i.pravatar.cc/40" alt="avatar" className="w-9 h-9 rounded-full object-cover" />
          <div className="leading-tight">
            <div className="font-semibold">Salam Pacific Indonesia Lines</div>
            <div className="text-xs text-gray-500">spilsalampacificindonesialines@gmail.com</div>
          </div>
          <span className="text-gray-500">▾</span>
        </div>
      </header>

      {/* Area bawah topbar: sidebar + konten */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => setExpanded(false)}
          className={`transition-all duration-300 ease-in-out ${expanded ? "w-60" : "w-16"}
                      flex flex-col gap-4 bg-[#16332f] text-gray-100 p-4 overflow-hidden`}
        >
          <nav className="flex flex-col gap-2">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); navigate("/dashboard", { state: { keepSidebarOpen: true } }); }}
              className={`flex items-center ${expanded ? "justify-start" : "justify-center"} gap-3 px-3 py-2 rounded-xl hover:bg-[#3a9542] text-white`}
            >
              <span className="text-base">★</span>
              <span className={expanded ? "inline" : "hidden"}>Dashboard</span>
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); navigate("/early-monitoring", { state: { keepSidebarOpen: true } }); }}
              className={`flex items-center ${expanded ? "justify-start" : "justify-center"} gap-3 px-3 py-2 rounded-xl hover:bg-[#3a9542] text-white`}
            >
              <span className="text-base">★</span>
              <span className={expanded ? "inline" : "hidden"}>Early Monitoring</span>
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); navigate("/budget-targeting", { state: { keepSidebarOpen: true } }); }}
              className={`flex items-center ${expanded ? "justify-start" : "justify-center"} gap-3 px-3 py-2 rounded-xl bg-[#3a9542] text-white`}
            >
              <span className="text-base">★</span>
              <span className={expanded ? "inline" : "hidden"}>Budget Targeting</span>
            </a>

            {Array.from({ length: 5 }).map((_, i) => (
              <a key={i}
                 className={`flex items-center ${expanded ? "justify-start" : "justify-center"} gap-3 px-3 py-2 rounded-xl hover:bg-[#3a9542] text-white`}>
                <span className="text-base">★</span>
                <span className={expanded ? "inline" : "hidden"}>Nav Item</span>
              </a>
            ))}
          </nav>

          <button
            onClick={() => navigate("/login")}
            className={`mt-auto flex items-center ${expanded ? "justify-start" : "justify-center"}
                        gap-3 rounded-xl px-4 py-2 font-semibold bg-red-500 text-white hover:brightness-95`}
          >
            <span className="text-base">★</span>
            <span className={expanded ? "inline" : "hidden"}>Logout</span>
          </button>
        </aside>

        {/* Content */}
        <main className="flex-1 p-5 overflow-auto space-y-6">
          <div className="rounded-xl bg-gray-200 h-14" />
          <div className="grid gap-6 grid-cols-1 xl:grid-cols-[1fr_1fr_1.4fr]">
            <div className="rounded-xl bg-gray-200 h-52" />
            <div className="rounded-xl bg-gray-200 h-52" />
            <div className="rounded-xl bg-gray-200 h-80" />
          </div>
          <div className="rounded-xl bg-gray-200 h-40" />
          <div className="rounded-xl bg-gray-200 h-96" />
        </main>
      </div>
    </div>
  );
};

export default BudgetTargetingPage;
