import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import spilLogo from "../assets/spil_logo.png";
import Sidebar from "../components/frame/sidebar";
import Navbar from "../components/frame/navbar";

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
      <Navbar />

      {/* Area bawah topbar: sidebar + konten */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

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