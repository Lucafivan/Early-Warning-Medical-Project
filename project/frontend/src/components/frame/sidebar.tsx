import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { LayoutDashboard, Table, Target, Star, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const {logout} = useAuth();

  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if ((location.state as { keepSidebarOpen?: boolean } | null)?.keepSidebarOpen) {
      setExpanded(true);
    }
  }, [location.state]);

  const getLinkClass = (path: string) => {
    const baseClasses = `flex items-center ${
      expanded ? "justify-start" : "justify-center"
    } gap-3 px-3 py-2 rounded-xl text-white transition-colors`;

    const activeClass = currentPath === path ? "bg-[#3a9542]" : "hover:bg-[#3a9542]";

    return `${baseClasses} ${activeClass}`;
  };

  const handleLogout = () => {
    logout();

    toast.success("berhasil logout")
    navigate("/login")
  }

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`transition-all duration-300 ease-in-out ${
        expanded ? "w-60 p-4" : "w-16 p-2"
      } flex flex-col gap-4 bg-[#16332f] text-gray-100 overflow-hidden h-screen`}
    >
      <nav className="flex flex-col gap-2 flex-grow overflow-y-auto">
        {/* Link items tidak berubah */}
        <Link
          to="/dashboard"
          state={{ keepSidebarOpen: true }}
          className={getLinkClass("/dashboard")}
        >
          <LayoutDashboard size={20} />
          <span className={expanded ? "inline" : "hidden"}>Dashboard</span>
        </Link>

        <Link
          to="/early-monitoring"
          state={{ keepSidebarOpen: true }}
          className={getLinkClass("/early-monitoring")}
        >
          <Table size={20} />
          <span className={expanded ? "inline" : "hidden"}>
            Early Monitoring
          </span>
        </Link>

        <Link
          to="/budget-targeting"
          state={{ keepSidebarOpen: true }}
          className={getLinkClass("/budget-targeting")}
        >
          <Target size={20} />
          <span className={expanded ? "inline" : "hidden"}>
            Budget Targeting
          </span>
        </Link>

        {Array.from({ length: 5 }).map((_, i) => (
          <Link
            key={i}
            to={`/nav-item-${i}`}
            state={{ keepSidebarOpen: true }}
            className={getLinkClass(`/nav-item-${i}`)}
          >
            <Star size={20} />
            <span className={expanded ? "inline" : "hidden"}>Nav Item</span>
          </Link>
        ))}

        <button
          onClick={handleLogout}
          className={`mt-auto flex items-center justify-center gap-2 rounded-xl px-3 py-2 font-semibold bg-red-600 text-white hover:brightness-95 mb-24`}
        >
          <LogOut size={20} />
          {expanded && <span>Logout</span>}
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;